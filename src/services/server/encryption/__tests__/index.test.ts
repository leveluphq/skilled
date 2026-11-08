/**
 * Unit tests for encryption service
 *
 * To run these tests, install Jest:
 * npm install --save-dev jest @types/jest ts-jest
 *
 * Add to package.json scripts:
 * "test": "jest",
 * "test:watch": "jest --watch"
 *
 * Create jest.config.js:
 * module.exports = {
 *   preset: 'ts-jest',
 *   testEnvironment: 'node',
 * };
 */

import { encrypt, decrypt, isEncrypted, decryptIfNeeded, EncryptionError } from '../index';

// Test fixture: Generate a valid 64-byte base64 key for testing
const TEST_KEY = Buffer.from('a'.repeat(64)).toString('base64');
const TEST_KEY_2 = Buffer.from('b'.repeat(64)).toString('base64');

/**
 * Flip a bit inside the decoded ciphertext segment.
 *
 * Mutating the final base64 character is not a reliable tamper: depending on
 * length, several characters decode to the same bytes, so the payload can come
 * through unchanged and authentication correctly succeeds.
 */
const tamperCiphertext = (encrypted: string): string => {
  const parts = encrypted.split(':');
  const raw = Buffer.from(parts[3], 'base64');
  raw[0] ^= 0xff;
  parts[3] = raw.toString('base64');
  return parts.join(':');
};

describe('Encryption Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Set up test environment with a valid encryption key
    process.env = {
      ...originalEnv,
      ENCRYPTION_KEY: TEST_KEY,
    };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('encrypt()', () => {
    it('should encrypt plaintext successfully', () => {
      const plaintext = 'my-secret-oauth-token';
      const encrypted = encrypt(plaintext);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.startsWith('v1:')).toBe(true);
    });

    it('should produce different ciphertext each time due to unique IV', () => {
      const plaintext = 'same-token-twice';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      expect(encrypted1.startsWith('v1:')).toBe(true);
      expect(encrypted2.startsWith('v1:')).toBe(true);
    });

    it('should handle empty strings', () => {
      const result = encrypt('');
      expect(result).toBe('');
    });

    it('should handle special characters', () => {
      const plaintext = 'token!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle very long tokens', () => {
      const plaintext = 'x'.repeat(10000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
      expect(decrypted.length).toBe(10000);
    });

    it('should handle Unicode characters', () => {
      const plaintext = 'token-🔐-密钥-🗝️';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error if ENCRYPTION_KEY is missing', () => {
      delete process.env.ENCRYPTION_KEY;

      expect(() => encrypt('test')).toThrow(EncryptionError);
      expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY environment variable is missing');
    });

    it('should produce correctly formatted output', () => {
      const encrypted = encrypt('test-token');
      const parts = encrypted.split(':');

      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe('v1');
      // IV should be base64
      expect(() => Buffer.from(parts[1], 'base64')).not.toThrow();
      // Auth tag should be base64
      expect(() => Buffer.from(parts[2], 'base64')).not.toThrow();
      // Ciphertext should be base64
      expect(() => Buffer.from(parts[3], 'base64')).not.toThrow();
    });

    it('should complete encryption in under 10ms', () => {
      const plaintext = 'performance-test-token';
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        encrypt(plaintext);
      }

      const duration = Date.now() - start;
      const avgTime = duration / 100;

      expect(avgTime).toBeLessThan(10);
    });
  });

  describe('decrypt()', () => {
    it('should decrypt encrypted data successfully', () => {
      const plaintext = 'my-secret-token';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should perform encrypt/decrypt round-trip correctly', () => {
      const plaintext = 'round-trip-test';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should return plaintext strings as-is (backward compatibility)', () => {
      const plaintext = 'not-encrypted-token';
      const result = decrypt(plaintext);

      expect(result).toBe(plaintext);
    });

    it('should handle empty strings', () => {
      const result = decrypt('');
      expect(result).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(decrypt(null as any)).toBe(null);
      expect(decrypt(undefined as any)).toBe(undefined);
    });

    it('should throw error for tampered ciphertext', () => {
      const encrypted = encrypt('test-token');
      // Tamper with the ciphertext by changing last character
      const tampered = tamperCiphertext(encrypted);

      expect(() => decrypt(tampered)).toThrow(EncryptionError);
      expect(() => decrypt(tampered)).toThrow(/decrypt/i);
    });

    it('should throw error for tampered auth tag', () => {
      const encrypted = encrypt('test-token');
      const parts = encrypted.split(':');
      // Tamper with auth tag
      parts[2] = Buffer.from('tampered-tag-xxxx').toString('base64');
      const tampered = parts.join(':');

      expect(() => decrypt(tampered)).toThrow(EncryptionError);
    });

    it('should throw error for tampered IV', () => {
      const encrypted = encrypt('test-token');
      const parts = encrypted.split(':');
      // Tamper with IV
      parts[1] = Buffer.from('tampered-iv-xxxx').toString('base64');
      const tampered = parts.join(':');

      expect(() => decrypt(tampered)).toThrow(EncryptionError);
    });

    it('should throw error for wrong encryption key', () => {
      const plaintext = 'test-token';
      const encrypted = encrypt(plaintext);

      // Change encryption key
      process.env.ENCRYPTION_KEY = TEST_KEY_2;

      expect(() => decrypt(encrypted)).toThrow(EncryptionError);
      expect(() => decrypt(encrypted)).toThrow(/decrypt/i);
    });

    it('should throw error for invalid format', () => {
      // A value with no version prefix is treated as legacy plaintext and passed
      // through unchanged — that is the documented backward-compatibility contract.
      expect(decrypt('invalid-format')).toBe('invalid-format');

      // Anything carrying a version prefix must fail closed rather than be
      // returned as if it were plaintext.
      expect(() => decrypt('v1:only:two')).toThrow(EncryptionError);
      expect(() => decrypt('v2:wrong:version:here')).toThrow(EncryptionError);
    });

    it('should throw error for invalid version', () => {
      const encrypted = encrypt('test');
      const invalidVersion = encrypted.replace('v1:', 'v2:');

      expect(() => decrypt(invalidVersion)).toThrow(EncryptionError);
      expect(() => decrypt(invalidVersion)).toThrow(/version/i);
    });

    it('should complete decryption in under 10ms', () => {
      const plaintext = 'performance-test-token';
      const encrypted = encrypt(plaintext);

      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        decrypt(encrypted);
      }
      const duration = Date.now() - start;
      const avgTime = duration / 100;

      expect(avgTime).toBeLessThan(10);
    });
  });

  describe('isEncrypted()', () => {
    it('should return true for encrypted strings', () => {
      const encrypted = encrypt('test-token');
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plaintext strings', () => {
      expect(isEncrypted('plaintext-token')).toBe(false);
      expect(isEncrypted('v2:wrong-version')).toBe(false);
      expect(isEncrypted('random-string')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isEncrypted('')).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isEncrypted(null)).toBe(false);
      expect(isEncrypted(undefined)).toBe(false);
    });

    it('should correctly identify version prefix', () => {
      expect(isEncrypted('v1:abc:def:ghi')).toBe(true);
      expect(isEncrypted('v2:abc:def:ghi')).toBe(false);
      expect(isEncrypted('V1:abc:def:ghi')).toBe(false);
    });
  });

  describe('decryptIfNeeded()', () => {
    it('should decrypt encrypted values', () => {
      const plaintext = 'test-token';
      const encrypted = encrypt(plaintext);
      const result = decryptIfNeeded(encrypted);

      expect(result).toBe(plaintext);
    });

    it('should return plaintext values as-is', () => {
      const plaintext = 'plaintext-token';
      const result = decryptIfNeeded(plaintext);

      expect(result).toBe(plaintext);
    });

    it('should handle null and undefined', () => {
      expect(decryptIfNeeded(null)).toBe(null);
      expect(decryptIfNeeded(undefined)).toBe(undefined);
    });

    it('should handle empty strings', () => {
      expect(decryptIfNeeded('')).toBe('');
    });
  });

  describe('Dual-key rotation support', () => {
    it('should decrypt with current key', () => {
      const plaintext = 'rotation-test';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt with old key when current key fails', () => {
      const plaintext = 'rotation-test';

      // Encrypt with first key
      process.env.ENCRYPTION_KEY = TEST_KEY;
      const encrypted = encrypt(plaintext);

      // Rotate keys: set new key and old key
      process.env.ENCRYPTION_KEY = TEST_KEY_2;
      process.env.ENCRYPTION_KEY_OLD = TEST_KEY;

      // Should decrypt using old key
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt with new key during rotation', () => {
      process.env.ENCRYPTION_KEY = TEST_KEY;
      const plaintext = 'new-token';

      // Encrypt with current key
      const encrypted = encrypt(plaintext);

      // Should decrypt with same key
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should fail if neither current nor old key works', () => {
      const plaintext = 'test';

      // Encrypt with one key
      process.env.ENCRYPTION_KEY = TEST_KEY;
      const encrypted = encrypt(plaintext);

      // Set completely different keys
      process.env.ENCRYPTION_KEY = TEST_KEY_2;
      process.env.ENCRYPTION_KEY_OLD = Buffer.from('c'.repeat(64)).toString('base64');

      // Should fail to decrypt
      expect(() => decrypt(encrypted)).toThrow(EncryptionError);
    });
  });

  describe('Error handling', () => {
    it('should not log plaintext tokens in errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      delete process.env.ENCRYPTION_KEY;

      try {
        encrypt('secret-token-12345');
      } catch (error) {
        // Error thrown as expected
      }

      // Check console.error was called but didn't include plaintext
      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessages = consoleSpy.mock.calls.map((call) => call.join(' '));
      loggedMessages.forEach((msg) => {
        expect(msg).not.toContain('secret-token-12345');
      });

      consoleSpy.mockRestore();
    });

    it('should not log ciphertext in decryption errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const encrypted = encrypt('test');
      const tampered = tamperCiphertext(encrypted);

      try {
        decrypt(tampered);
      } catch (error) {
        // Error thrown as expected
      }

      // If anything was logged, it must not contain the ciphertext itself.
      const logged = consoleSpy.mock.calls.flat().join(' ');
      expect(logged).not.toContain(tampered);
      expect(logged).not.toContain(process.env.ENCRYPTION_KEY);

      consoleSpy.mockRestore();
    });

    it('should throw EncryptionError with appropriate error codes', () => {
      delete process.env.ENCRYPTION_KEY;

      try {
        encrypt('test');
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(EncryptionError);
        expect((error as EncryptionError).code).toBe('KEY_MISSING');
      }
    });
  });

  describe('Format validation', () => {
    it('should validate IV length', () => {
      const encrypted = encrypt('test');
      const parts = encrypted.split(':');
      // Make IV too short
      parts[1] = Buffer.from('short').toString('base64');
      const invalid = parts.join(':');

      expect(() => decrypt(invalid)).toThrow(EncryptionError);
      expect(() => decrypt(invalid)).toThrow(/IV/i);
    });

    it('should validate auth tag length', () => {
      const encrypted = encrypt('test');
      const parts = encrypted.split(':');
      // Make auth tag too short
      parts[2] = Buffer.from('short').toString('base64');
      const invalid = parts.join(':');

      expect(() => decrypt(invalid)).toThrow(EncryptionError);
      expect(() => decrypt(invalid)).toThrow(/auth tag/i);
    });
  });
});
