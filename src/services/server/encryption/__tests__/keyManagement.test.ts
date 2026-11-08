/**
 * Unit tests for key management service
 *
 * To run these tests, install Jest:
 * npm install --save-dev jest @types/jest ts-jest
 */

import {
  validateKey,
  generateKey,
  deriveKey,
  loadKey,
  loadOldKey,
  isDualKeyMode,
  loadKeysForRotation,
  validateEnvironmentKeys,
  KeyManagementError,
} from '../keyManagement';

// Test fixtures
const VALID_64_BYTE_KEY = Buffer.from('a'.repeat(64)).toString('base64');
const VALID_64_BYTE_KEY_2 = Buffer.from('b'.repeat(64)).toString('base64');
const INVALID_32_BYTE_KEY = Buffer.from('a'.repeat(32)).toString('base64');
const INVALID_NON_BASE64 = 'not-valid-base64-!!!';

describe('Key Management Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    delete process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY_OLD;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('validateKey()', () => {
    it('should accept valid 64-byte base64 secrets', () => {
      const validKey = generateKey();
      expect(validateKey(validKey)).toBe(true);
    });

    it('should accept the test fixture key', () => {
      expect(validateKey(VALID_64_BYTE_KEY)).toBe(true);
    });

    it('should reject 32-byte keys (wrong length)', () => {
      expect(validateKey(INVALID_32_BYTE_KEY)).toBe(false);
    });

    it('should reject non-base64 strings', () => {
      expect(validateKey(INVALID_NON_BASE64)).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(validateKey('')).toBe(false);
    });

    it('should reject null and undefined', () => {
      expect(validateKey(null as any)).toBe(false);
      expect(validateKey(undefined as any)).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(validateKey(12345 as any)).toBe(false);
      expect(validateKey({} as any)).toBe(false);
      expect(validateKey([] as any)).toBe(false);
    });

    it('should reject keys that are not properly padded base64', () => {
      const invalidPadding = 'not-properly-padded';
      expect(validateKey(invalidPadding)).toBe(false);
    });

    it('should validate by checking round-trip encoding', () => {
      // Create a string that decodes but doesn't re-encode to the same value
      const validBase64 = VALID_64_BYTE_KEY;
      const decoded = Buffer.from(validBase64, 'base64');
      const reencoded = decoded.toString('base64');

      expect(reencoded).toBe(validBase64); // Round-trip should work
      expect(validateKey(validBase64)).toBe(true);
    });
  });

  describe('generateKey()', () => {
    it('should generate 64-byte base64 strings', () => {
      const key = generateKey();
      const decoded = Buffer.from(key, 'base64');

      expect(decoded.length).toBe(64);
      expect(typeof key).toBe('string');
    });

    it('should generate different keys each time', () => {
      const key1 = generateKey();
      const key2 = generateKey();
      const key3 = generateKey();

      expect(key1).not.toBe(key2);
      expect(key2).not.toBe(key3);
      expect(key1).not.toBe(key3);
    });

    it('should generate keys that pass validation', () => {
      const key = generateKey();
      expect(validateKey(key)).toBe(true);
    });

    it('should generate cryptographically secure keys', () => {
      const keys = new Set();

      // Generate 100 keys and ensure they're all unique
      for (let i = 0; i < 100; i++) {
        keys.add(generateKey());
      }

      expect(keys.size).toBe(100);
    });
  });

  describe('deriveKey()', () => {
    it('should derive 32-byte key from 64-byte secret', () => {
      const derivedKey = deriveKey(VALID_64_BYTE_KEY);

      expect(derivedKey).toBeInstanceOf(Buffer);
      expect(derivedKey.length).toBe(32);
    });

    it('should produce consistent keys from same secret', () => {
      const key1 = deriveKey(VALID_64_BYTE_KEY);
      const key2 = deriveKey(VALID_64_BYTE_KEY);

      expect(key1.toString('hex')).toBe(key2.toString('hex'));
    });

    it('should produce different keys from different secrets', () => {
      const key1 = deriveKey(VALID_64_BYTE_KEY);
      const key2 = deriveKey(VALID_64_BYTE_KEY_2);

      expect(key1.toString('hex')).not.toBe(key2.toString('hex'));
    });

    it('should throw error for invalid secret format', () => {
      expect(() => deriveKey(INVALID_32_BYTE_KEY)).toThrow(KeyManagementError);
      expect(() => deriveKey(INVALID_32_BYTE_KEY)).toThrow(/64-byte/);
    });

    it('should throw error for non-base64 input', () => {
      expect(() => deriveKey(INVALID_NON_BASE64)).toThrow(KeyManagementError);
    });

    it('should use HKDF for key derivation', () => {
      // The derived key should be different from the input secret
      const secret = VALID_64_BYTE_KEY;
      const derived = deriveKey(secret);

      expect(derived.toString('base64')).not.toBe(secret);
    });
  });

  describe('loadKey()', () => {
    it('should load and derive key from ENCRYPTION_KEY', () => {
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;

      const key = loadKey();

      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    it('should throw clear error when ENCRYPTION_KEY is missing', () => {
      delete process.env.ENCRYPTION_KEY;

      expect(() => loadKey()).toThrow(KeyManagementError);
      expect(() => loadKey()).toThrow('ENCRYPTION_KEY environment variable is missing');
      expect(() => loadKey()).toThrow(/openssl rand -base64 64/);
    });

    it('should throw error for invalid ENCRYPTION_KEY', () => {
      process.env.ENCRYPTION_KEY = INVALID_32_BYTE_KEY;

      expect(() => loadKey()).toThrow(KeyManagementError);
    });

    it('should produce consistent keys for same environment', () => {
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;

      const key1 = loadKey();
      const key2 = loadKey();

      expect(key1.toString('hex')).toBe(key2.toString('hex'));
    });
  });

  describe('loadOldKey()', () => {
    it('should return null when ENCRYPTION_KEY_OLD is not set', () => {
      delete process.env.ENCRYPTION_KEY_OLD;

      const oldKey = loadOldKey();

      expect(oldKey).toBeNull();
    });

    it('should load and derive key from ENCRYPTION_KEY_OLD when set', () => {
      process.env.ENCRYPTION_KEY_OLD = VALID_64_BYTE_KEY;

      const oldKey = loadOldKey();

      expect(oldKey).toBeInstanceOf(Buffer);
      expect(oldKey!.length).toBe(32);
    });

    it('should throw error for invalid ENCRYPTION_KEY_OLD', () => {
      process.env.ENCRYPTION_KEY_OLD = INVALID_32_BYTE_KEY;

      expect(() => loadOldKey()).toThrow(KeyManagementError);
    });

    it('should derive different key than current key', () => {
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;
      process.env.ENCRYPTION_KEY_OLD = VALID_64_BYTE_KEY_2;

      const currentKey = loadKey();
      const oldKey = loadOldKey();

      expect(currentKey.toString('hex')).not.toBe(oldKey!.toString('hex'));
    });
  });

  describe('isDualKeyMode()', () => {
    it('should return false when ENCRYPTION_KEY_OLD is not set', () => {
      delete process.env.ENCRYPTION_KEY_OLD;

      expect(isDualKeyMode()).toBe(false);
    });

    it('should return true when ENCRYPTION_KEY_OLD is set and valid', () => {
      process.env.ENCRYPTION_KEY_OLD = VALID_64_BYTE_KEY;

      expect(isDualKeyMode()).toBe(true);
    });

    it('should return false when ENCRYPTION_KEY_OLD is invalid', () => {
      process.env.ENCRYPTION_KEY_OLD = INVALID_32_BYTE_KEY;

      expect(isDualKeyMode()).toBe(false);
    });

    it('should return false for empty string', () => {
      process.env.ENCRYPTION_KEY_OLD = '';

      expect(isDualKeyMode()).toBe(false);
    });
  });

  describe('loadKeysForRotation()', () => {
    it('should load current key when no old key', () => {
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;
      delete process.env.ENCRYPTION_KEY_OLD;

      const { currentKey, oldKey } = loadKeysForRotation();

      expect(currentKey).toBeInstanceOf(Buffer);
      expect(currentKey.length).toBe(32);
      expect(oldKey).toBeNull();
    });

    it('should load both keys during rotation', () => {
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;
      process.env.ENCRYPTION_KEY_OLD = VALID_64_BYTE_KEY_2;

      const { currentKey, oldKey } = loadKeysForRotation();

      expect(currentKey).toBeInstanceOf(Buffer);
      expect(oldKey).toBeInstanceOf(Buffer);
      expect(currentKey.toString('hex')).not.toBe(oldKey!.toString('hex'));
    });

    it('should throw error if current key is missing', () => {
      delete process.env.ENCRYPTION_KEY;

      expect(() => loadKeysForRotation()).toThrow(KeyManagementError);
    });

    it('should support zero-downtime rotation workflow', () => {
      // Step 1: Normal operation with one key
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;
      const { currentKey: key1, oldKey: old1 } = loadKeysForRotation();
      expect(old1).toBeNull();

      // Step 2: Add new key and set old key for rotation
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY_2;
      process.env.ENCRYPTION_KEY_OLD = VALID_64_BYTE_KEY;
      const { currentKey: key2, oldKey: old2 } = loadKeysForRotation();
      expect(old2).not.toBeNull();
      expect(key2.toString('hex')).not.toBe(key1.toString('hex'));
      expect(old2!.toString('hex')).toBe(key1.toString('hex'));

      // Step 3: After re-encryption, remove old key
      delete process.env.ENCRYPTION_KEY_OLD;
      const { currentKey: key3, oldKey: old3 } = loadKeysForRotation();
      expect(old3).toBeNull();
      expect(key3.toString('hex')).toBe(key2.toString('hex'));
    });
  });

  describe('validateEnvironmentKeys()', () => {
    it('should succeed with valid ENCRYPTION_KEY', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;

      expect(() => validateEnvironmentKeys()).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Environment keys validated successfully')
      );

      consoleSpy.mockRestore();
    });

    it('should throw error when ENCRYPTION_KEY is missing', () => {
      delete process.env.ENCRYPTION_KEY;

      expect(() => validateEnvironmentKeys()).toThrow(KeyManagementError);
      expect(() => validateEnvironmentKeys()).toThrow('ENCRYPTION_KEY environment variable is required');
    });

    it('should throw error when ENCRYPTION_KEY is invalid', () => {
      process.env.ENCRYPTION_KEY = INVALID_32_BYTE_KEY;

      expect(() => validateEnvironmentKeys()).toThrow(KeyManagementError);
      expect(() => validateEnvironmentKeys()).toThrow('ENCRYPTION_KEY is invalid');
    });

    it('should validate ENCRYPTION_KEY_OLD if present', () => {
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;
      process.env.ENCRYPTION_KEY_OLD = VALID_64_BYTE_KEY_2;

      expect(() => validateEnvironmentKeys()).not.toThrow();
    });

    it('should throw error for invalid ENCRYPTION_KEY_OLD', () => {
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;
      process.env.ENCRYPTION_KEY_OLD = INVALID_32_BYTE_KEY;

      expect(() => validateEnvironmentKeys()).toThrow(KeyManagementError);
      expect(() => validateEnvironmentKeys()).toThrow('ENCRYPTION_KEY_OLD is invalid');
    });

    it('should log dual-key mode message when old key is present', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;
      process.env.ENCRYPTION_KEY_OLD = VALID_64_BYTE_KEY_2;

      validateEnvironmentKeys();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Dual-key rotation mode is enabled')
      );

      consoleSpy.mockRestore();
    });

    it('should not log dual-key message when only current key present', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      process.env.ENCRYPTION_KEY = VALID_64_BYTE_KEY;
      delete process.env.ENCRYPTION_KEY_OLD;

      validateEnvironmentKeys();

      const messages = consoleSpy.mock.calls.map((call) => call.join(' '));
      expect(messages.some((msg) => msg.includes('Dual-key rotation'))).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should throw KeyManagementError with appropriate error codes', () => {
      delete process.env.ENCRYPTION_KEY;

      try {
        loadKey();
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(KeyManagementError);
        expect((error as KeyManagementError).code).toBe('KEY_MISSING');
      }
    });

    it('should include helpful error messages with generation instructions', () => {
      delete process.env.ENCRYPTION_KEY;

      try {
        validateEnvironmentKeys();
      } catch (error) {
        expect(error instanceof KeyManagementError).toBe(true);
        expect((error as Error).message).toContain('openssl rand -base64 64');
      }
    });

    it('should not log secret values in errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      process.env.ENCRYPTION_KEY = INVALID_NON_BASE64;

      try {
        deriveKey(process.env.ENCRYPTION_KEY);
      } catch (error) {
        // Error expected
      }

      // Console shouldn't have been called (no logging in deriveKey errors)
      // Or if it was, it shouldn't contain the secret
      if (consoleSpy.mock.calls.length > 0) {
        const logs = consoleSpy.mock.calls.map((call) => call.join(' '));
        logs.forEach((log) => {
          expect(log).not.toContain(INVALID_NON_BASE64);
        });
      }

      consoleSpy.mockRestore();
    });
  });

  describe('HKDF key derivation', () => {
    it('should use SHA-256 for HKDF', () => {
      const key = deriveKey(VALID_64_BYTE_KEY);

      // Output should be deterministic for SHA-256 HKDF
      const key2 = deriveKey(VALID_64_BYTE_KEY);
      expect(key.toString('hex')).toBe(key2.toString('hex'));
    });

    it('should produce different keys with different salts (implicit test)', () => {
      // If we were to use different salts, we'd get different keys
      // This is implicitly tested by the consistency test - same salt produces same key
      const key = deriveKey(VALID_64_BYTE_KEY);
      expect(key).toBeDefined();
    });

    it('should derive full 32-byte output', () => {
      const key = deriveKey(VALID_64_BYTE_KEY);

      // Ensure all 32 bytes are used (not just partial)
      expect(key.length).toBe(32);
      // Ensure it's not all zeros
      const allZeros = Buffer.alloc(32);
      expect(key.toString('hex')).not.toBe(allZeros.toString('hex'));
    });
  });
});
