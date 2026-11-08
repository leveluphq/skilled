import crypto from 'crypto';

/**
 * Key management service for encryption keys.
 *
 * Features:
 * - Key validation (64-byte base64 format)
 * - Key generation (cryptographically secure)
 * - HKDF key derivation from secrets
 * - Dual-key mode support for zero-downtime rotation
 */

const KEY_LENGTH = 32; // 256 bits for AES-256
const SECRET_LENGTH = 64; // 512 bits for enhanced security
const HKDF_SALT = 'skilled-oauth-token-encryption';
const HKDF_INFO = 'aes-256-gcm-key';

/**
 * Custom error for key management issues
 */
export class KeyManagementError extends Error {
  constructor(message: string, public code: 'KEY_MISSING' | 'INVALID_KEY' | 'DERIVATION_FAILED') {
    super(message);
    this.name = 'KeyManagementError';
  }
}

/**
 * Validates that a key is a properly formatted 64-byte base64 secret.
 *
 * @param key - The key string to validate
 * @returns true if valid, false otherwise
 */
export function validateKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  try {
    // Attempt to decode base64
    const decoded = Buffer.from(key, 'base64');

    // Check if it's exactly 64 bytes
    if (decoded.length !== SECRET_LENGTH) {
      return false;
    }

    // Verify it's valid base64 by re-encoding and comparing
    const reencoded = decoded.toString('base64');
    return reencoded === key;
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically secure 64-byte secret suitable for ENCRYPTION_KEY.
 *
 * @returns Base64-encoded 64-byte secret
 */
export function generateKey(): string {
  const randomBytes = crypto.randomBytes(SECRET_LENGTH);
  return randomBytes.toString('base64');
}

/**
 * Derives a 32-byte AES key from a 64-byte secret using HKDF-SHA256.
 *
 * @param secret - Base64-encoded 64-byte secret
 * @returns 32-byte Buffer suitable for AES-256
 * @throws KeyManagementError if derivation fails
 */
export function deriveKey(secret: string): Buffer {
  try {
    // Validate secret format
    if (!validateKey(secret)) {
      throw new KeyManagementError(
        `Invalid secret format. Expected 64-byte base64-encoded string. Generate with: openssl rand -base64 64 | tr -d "\\n"`,
        'INVALID_KEY'
      );
    }

    // Decode secret
    const secretBuffer = Buffer.from(secret, 'base64');

    // Derive 32-byte key using HKDF-SHA256
    const derivedKey = crypto.hkdfSync('sha256', secretBuffer, HKDF_SALT, HKDF_INFO, KEY_LENGTH);
    const key = Buffer.from(derivedKey);

    return key;
  } catch (error) {
    if (error instanceof KeyManagementError) {
      throw error;
    }
    throw new KeyManagementError(
      `Failed to derive key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DERIVATION_FAILED'
    );
  }
}

/**
 * Loads the primary encryption key from ENCRYPTION_KEY environment variable.
 *
 * @returns Derived 32-byte encryption key
 * @throws KeyManagementError if ENCRYPTION_KEY is missing or invalid
 */
export function loadKey(): Buffer {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new KeyManagementError(
      'ENCRYPTION_KEY environment variable is missing. Expected 64-byte base64-encoded secret. Generate with: openssl rand -base64 64 | tr -d "\\n"',
      'KEY_MISSING'
    );
  }

  return deriveKey(encryptionKey);
}

/**
 * Loads the old encryption key from ENCRYPTION_KEY_OLD environment variable.
 * Used during key rotation for backward compatibility.
 *
 * @returns Derived 32-byte encryption key, or null if ENCRYPTION_KEY_OLD is not set
 * @throws KeyManagementError if ENCRYPTION_KEY_OLD is set but invalid
 */
export function loadOldKey(): Buffer | null {
  const oldKey = process.env.ENCRYPTION_KEY_OLD;

  if (!oldKey) {
    return null;
  }

  return deriveKey(oldKey);
}

/**
 * Checks if dual-key mode is enabled (for key rotation).
 * In dual-key mode, decryption attempts with the old key if the new key fails.
 *
 * @returns true if ENCRYPTION_KEY_OLD is set and valid
 */
export function isDualKeyMode(): boolean {
  const oldKey = process.env.ENCRYPTION_KEY_OLD;
  return oldKey ? validateKey(oldKey) : false;
}

/**
 * Gets both the current and old keys if in dual-key rotation mode.
 *
 * @returns Object with current and optional old key
 * @throws KeyManagementError if keys are missing or invalid
 */
export function loadKeysForRotation(): { currentKey: Buffer; oldKey: Buffer | null } {
  const currentKey = loadKey();
  const oldKey = loadOldKey();

  return { currentKey, oldKey };
}

/**
 * Validates that ENCRYPTION_KEY is properly configured.
 * Call this during application startup to fail fast if keys are misconfigured.
 *
 * @throws KeyManagementError if validation fails
 */
export function validateEnvironmentKeys(): void {
  // Check that ENCRYPTION_KEY exists
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new KeyManagementError(
      'ENCRYPTION_KEY environment variable is required. Generate with: openssl rand -base64 64 | tr -d "\\n"',
      'KEY_MISSING'
    );
  }

  // Validate format
  if (!validateKey(encryptionKey)) {
    throw new KeyManagementError(
      'ENCRYPTION_KEY is invalid. Expected 64-byte base64-encoded string. Current value has wrong length or format.',
      'INVALID_KEY'
    );
  }

  // If ENCRYPTION_KEY_OLD is set, validate it too
  const oldKey = process.env.ENCRYPTION_KEY_OLD;
  if (oldKey && !validateKey(oldKey)) {
    throw new KeyManagementError(
      'ENCRYPTION_KEY_OLD is invalid. Expected 64-byte base64-encoded string or unset.',
      'INVALID_KEY'
    );
  }

  // Successfully validated
  console.log('[Key Management] Environment keys validated successfully');
  if (oldKey) {
    console.log('[Key Management] Dual-key rotation mode is enabled');
  }
}
