import crypto from 'crypto';
import { loadKey, loadKeysForRotation, KeyManagementError } from './keyManagement';

/**
 * Encryption service for OAuth tokens using AES-256-GCM with HKDF key derivation.
 *
 * Features:
 * - AES-256-GCM authenticated encryption
 * - HKDF key derivation from 64-byte secrets (via key management service)
 * - Unique IV for each encryption operation
 * - Tamper detection via authentication tags
 * - Versioned format for future migration support
 * - Dual-key rotation support for zero-downtime key changes
 */

const ENCRYPTION_VERSION = 'v1';
// Any `v<n>:` prefix marks a value as output of this module, whatever the version.
const VERSION_PREFIX_PATTERN = /^v\d+:/;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Custom error class for encryption-related errors
 */
export class EncryptionError extends Error {
  constructor(
    message: string,
    public code: 'KEY_MISSING' | 'INVALID_KEY' | 'ENCRYPTION_FAILED' | 'DECRYPTION_FAILED'
  ) {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Encrypts plaintext using AES-256-GCM with a unique IV.
 *
 * @param plaintext - The text to encrypt (e.g., OAuth access token)
 * @returns Encrypted string in format "v1:iv:authTag:ciphertext" (all base64)
 * @throws EncryptionError if encryption fails
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    return plaintext; // Return empty strings as-is
  }

  try {
    // Get derived key from key management service
    const key = loadKey();

    // Generate unique IV for this encryption
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Format: "v1:iv:authTag:ciphertext"
    const result = [
      ENCRYPTION_VERSION,
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted,
    ].join(':');

    return result;
  } catch (error) {
    // Log error to console without exposing plaintext
    console.error('Encryption failed:', error instanceof Error ? error.message : 'Unknown error');

    // Re-throw key management errors with appropriate EncryptionError code
    if (error instanceof KeyManagementError) {
      throw new EncryptionError(error.message, error.code as any);
    }

    throw new EncryptionError(
      'Failed to encrypt data. Check that ENCRYPTION_KEY is properly configured.',
      'ENCRYPTION_FAILED'
    );
  }
}

/**
 * Attempts to decrypt with a specific key.
 *
 * @param iv - Initialization vector
 * @param authTag - Authentication tag
 * @param encrypted - Encrypted data buffer
 * @param key - Decryption key
 * @returns Decrypted plaintext
 */
function attemptDecrypt(iv: Buffer, authTag: Buffer, encrypted: Buffer, key: Buffer): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Decrypts ciphertext that was encrypted with encrypt().
 * Supports dual-key rotation mode for zero-downtime key changes.
 *
 * @param ciphertext - Encrypted string in format "v1:iv:authTag:ciphertext"
 * @returns Decrypted plaintext
 * @throws EncryptionError if decryption fails (wrong key, tampered data, invalid format)
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) {
    return ciphertext;
  }

  if (!isEncrypted(ciphertext)) {
    // A value that carries a version prefix we do not recognise is ciphertext we
    // cannot read, not plaintext. Returning it unchanged would hand raw ciphertext
    // to a caller expecting a decrypted value, so fail closed instead. Values with
    // no version prefix at all are genuinely legacy plaintext and pass through.
    if (VERSION_PREFIX_PATTERN.test(ciphertext)) {
      throw new EncryptionError(
        `Unsupported encryption version. Expected ${ENCRYPTION_VERSION}`,
        'DECRYPTION_FAILED',
      );
    }

    return ciphertext; // Return non-encrypted strings as-is (backward compatibility)
  }

  try {
    // Parse encrypted format
    const parts = ciphertext.split(':');
    if (parts.length !== 4) {
      throw new EncryptionError(
        'Invalid encrypted format. Expected "v1:iv:authTag:ciphertext"',
        'DECRYPTION_FAILED'
      );
    }

    const [version, ivBase64, authTagBase64, encryptedData] = parts;

    // Verify version
    if (version !== ENCRYPTION_VERSION) {
      throw new EncryptionError(
        `Unsupported encryption version: ${version}. Expected ${ENCRYPTION_VERSION}`,
        'DECRYPTION_FAILED'
      );
    }

    // Decode components
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const encrypted = Buffer.from(encryptedData, 'base64');

    // Validate lengths
    if (iv.length !== IV_LENGTH) {
      throw new EncryptionError('Invalid IV length', 'DECRYPTION_FAILED');
    }
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new EncryptionError('Invalid auth tag length', 'DECRYPTION_FAILED');
    }

    // Get keys (supports dual-key rotation mode)
    const { currentKey, oldKey } = loadKeysForRotation();

    // Try decrypting with current key first
    try {
      return attemptDecrypt(iv, authTag, encrypted, currentKey);
    } catch (currentKeyError) {
      // If dual-key mode is active and current key failed, try old key
      if (oldKey) {
        try {
          const result = attemptDecrypt(iv, authTag, encrypted, oldKey);
          console.log('[Encryption] Successfully decrypted with old key during rotation');
          return result;
        } catch (oldKeyError) {
          // Both keys failed
          throw new EncryptionError(
            'Failed to decrypt with both current and old keys during rotation',
            'DECRYPTION_FAILED'
          );
        }
      }
      // Not in dual-key mode or old key also failed
      throw currentKeyError;
    }
  } catch (error) {
    // Log error without exposing ciphertext or keys
    console.error('Decryption failed:', error instanceof Error ? error.message : 'Unknown error');

    if (error instanceof EncryptionError) {
      throw error;
    }

    if (error instanceof KeyManagementError) {
      throw new EncryptionError(error.message, error.code as any);
    }

    throw new EncryptionError(
      'Failed to decrypt data. The data may be tampered with or encrypted with a different key.',
      'DECRYPTION_FAILED'
    );
  }
}

/**
 * Checks if a string is encrypted with our encryption format.
 *
 * @param value - String to check
 * @returns true if the string starts with "v1:", false otherwise
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  return value.startsWith(`${ENCRYPTION_VERSION}:`);
}

/**
 * Attempts to decrypt a value only if it's encrypted, otherwise returns as-is.
 * Useful for backward compatibility during migration.
 *
 * @param value - Potentially encrypted string
 * @returns Decrypted plaintext or original value if not encrypted
 */
export function decryptIfNeeded(value: string | null | undefined): string {
  if (!value) {
    return value as string;
  }

  if (isEncrypted(value)) {
    return decrypt(value);
  }

  return value;
}
