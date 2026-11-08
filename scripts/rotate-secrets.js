#!/usr/bin/env node
/**
 * Secret Rotation Script
 *
 * Generates new cryptographically secure secrets for Skilled.dev platform.
 * Use this script before open source release or during routine security maintenance.
 *
 * Usage:
 *   node rotate-secrets.js
 *
 * The script will generate:
 * - JWT_SECRET (64-byte base64)
 * - ENCRYPTION_KEY (64-byte base64)
 * - HASURA_GRAPHQL_ADMIN_SECRET (64-byte base64)
 * - API keys and tokens (various lengths)
 *
 * IMPORTANT: Follow the rotation checklist carefully to avoid service interruption
 */

const crypto = require('crypto');

// ============================================================================
// Secret Generation Functions
// ============================================================================

/**
 * Generates a cryptographically secure 64-byte base64-encoded secret
 * Used for: JWT_SECRET, ENCRYPTION_KEY, HASURA_GRAPHQL_ADMIN_SECRET
 */
function generate64ByteSecret() {
  return crypto.randomBytes(64).toString('base64');
}

/**
 * Generates a cryptographically secure 32-byte base64-encoded secret
 * Used for: General API keys, tokens
 */
function generate32ByteSecret() {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Generates a cryptographically secure 16-byte hex-encoded secret
 * Used for: Session IDs, shorter tokens
 */
function generate16ByteHex() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generates a secure random UUID v4
 * Used for: Unique identifiers
 */
function generateUUID() {
  return crypto.randomUUID();
}

// ============================================================================
// Display Helpers
// ============================================================================

function printSeparator() {
  console.log('='.repeat(80));
}

function printHeader(text) {
  console.log('\n' + '='.repeat(80));
  console.log(text);
  console.log('='.repeat(80) + '\n');
}

function printSecret(name, value, description = '') {
  console.log(`${name}:`);
  if (description) {
    console.log(`  Description: ${description}`);
  }
  console.log(`  ${value}\n`);
}

// ============================================================================
// Rotation Checklist
// ============================================================================

function printRotationChecklist() {
  console.log(`
📋 SECRET ROTATION CHECKLIST

Before rotating secrets in production, follow these steps carefully:

┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: PREPARATION                                                    │
└─────────────────────────────────────────────────────────────────────────┘

  [ ] 1. Back up current .env files from all environments
  [ ] 2. Document which secrets you're rotating
  [ ] 3. Schedule rotation during low-traffic period
  [ ] 4. Notify team members about planned maintenance
  [ ] 5. Ensure you have rollback plan ready

┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: ENCRYPTION KEY ROTATION (if rotating ENCRYPTION_KEY)           │
└─────────────────────────────────────────────────────────────────────────┘

  [ ] 1. Add new ENCRYPTION_KEY to environment variables
  [ ] 2. Set old key as ENCRYPTION_KEY_OLD (dual-key mode)
  [ ] 3. Deploy application (reads with old key, writes with new key)
  [ ] 4. Verify application health and error logs
  [ ] 5. Run encryption migration script:
         node scripts/encrypt-oauth-tokens.js --dry-run
  [ ] 6. Review dry-run output for issues
  [ ] 7. Run actual migration:
         node scripts/encrypt-oauth-tokens.js
  [ ] 8. Verify all tokens encrypted with new key
  [ ] 9. Wait 24-48 hours, monitor for issues
  [ ] 10. Remove ENCRYPTION_KEY_OLD from environment
  [ ] 11. Deploy to remove dual-key mode

┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: JWT SECRET ROTATION (if rotating JWT_SECRET)                   │
└─────────────────────────────────────────────────────────────────────────┘

  [ ] 1. Update JWT_SECRET in environment variables
  [ ] 2. Deploy application
  [ ] 3. All existing sessions will be invalidated (users must re-login)
  [ ] 4. Monitor error logs for authentication issues
  [ ] 5. Verify new logins work correctly

  ⚠️  WARNING: All users will be logged out when JWT_SECRET changes

┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: HASURA ADMIN SECRET ROTATION                                   │
└─────────────────────────────────────────────────────────────────────────┘

  [ ] 1. Update HASURA_GRAPHQL_ADMIN_SECRET in Hasura environment
  [ ] 2. Update secret in web application environment
  [ ] 3. Update secret in scripts/.env
  [ ] 4. Update secret in admin panel
  [ ] 5. Deploy all services simultaneously (or use rolling deployment)
  [ ] 6. Verify GraphQL queries work
  [ ] 7. Test admin operations

┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: OAUTH SECRETS ROTATION                                         │
└─────────────────────────────────────────────────────────────────────────┘

  GitHub:
  [ ] 1. Generate new Client Secret in GitHub OAuth app settings
  [ ] 2. Update GITHUB_CLIENT_SECRET in environment
  [ ] 3. Deploy application
  [ ] 4. Test GitHub OAuth flow
  [ ] 5. Delete old Client Secret in GitHub after verification

  Google:
  [ ] 1. Generate new Client Secret in Google Cloud Console
  [ ] 2. Update GOOGLE_CLIENT_SECRET in environment
  [ ] 3. Deploy application
  [ ] 4. Test Google OAuth flow
  [ ] 5. Delete old Client Secret in Google Cloud after verification

  Facebook:
  [ ] 1. Generate new App Secret in Facebook Developer Console
  [ ] 2. Update FACEBOOK_APP_SECRET in environment
  [ ] 3. Deploy application
  [ ] 4. Test Facebook OAuth flow

┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: STRIPE KEYS ROTATION                                           │
└─────────────────────────────────────────────────────────────────────────┘

  [ ] 1. Generate new Restricted Secret Key in Stripe Dashboard
  [ ] 2. Update STRIPE_SECRET_KEY in environment
  [ ] 3. Recreate webhook endpoint and update STRIPE_WEBHOOK_SECRET
  [ ] 4. Deploy application
  [ ] 5. Test payment flow end-to-end
  [ ] 6. Roll back old secret key after verification

┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 7: VERIFICATION & CLEANUP                                         │
└─────────────────────────────────────────────────────────────────────────┘

  [ ] 1. Test all authentication flows (OAuth, JWT)
  [ ] 2. Test payment processing
  [ ] 3. Test API endpoints
  [ ] 4. Check error logs for any issues
  [ ] 5. Monitor application health for 24-48 hours
  [ ] 6. Delete old secrets from environment variables
  [ ] 7. Update .env.example files if format changed
  [ ] 8. Document rotation in CHANGELOG or internal docs
  [ ] 9. Update team on completion

┌─────────────────────────────────────────────────────────────────────────┐
│ ROLLBACK PLAN (if issues occur)                                         │
└─────────────────────────────────────────────────────────────────────────┘

  [ ] 1. Revert environment variables to old secrets
  [ ] 2. Deploy previous application version
  [ ] 3. Verify service restoration
  [ ] 4. Investigate and fix issues before retry

`);
}

// ============================================================================
// Main Script
// ============================================================================

function main() {
  printHeader('Skilled.dev - Secret Rotation Tool');

  console.log('This tool generates new cryptographically secure secrets for:');
  console.log('  • JWT authentication');
  console.log('  • OAuth token encryption');
  console.log('  • Hasura admin access');
  console.log('  • General API keys\n');

  console.log('⚠️  WARNING: Rotating secrets in production requires careful planning!');
  console.log('Please read the rotation checklist below before proceeding.\n');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Generate new secrets? (yes/no): ', (answer) => {
    readline.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('\nSecret generation cancelled.');
      process.exit(0);
    }

    console.log('\n');
    printHeader('GENERATED SECRETS');

    console.log('Copy these values to your .env files. Keep them secure!\n');

    // Critical 64-byte secrets
    printSecret(
      'JWT_SECRET',
      generate64ByteSecret(),
      'Used for signing JWT authentication tokens (64-byte base64)'
    );

    printSecret(
      'ENCRYPTION_KEY',
      generate64ByteSecret(),
      'Used for encrypting OAuth tokens in database (64-byte base64)'
    );

    printSecret(
      'HASURA_GRAPHQL_ADMIN_SECRET',
      generate64ByteSecret(),
      'Hasura admin secret for GraphQL API access (64-byte base64)'
    );

    // Additional secrets
    console.log('─'.repeat(80) + '\n');
    console.log('ADDITIONAL SECRETS (if needed):\n');

    printSecret(
      'GENERAL_API_KEY',
      generate32ByteSecret(),
      'Generic 32-byte API key (base64)'
    );

    printSecret(
      'SESSION_SECRET',
      generate16ByteHex(),
      'Session identifier (16-byte hex)'
    );

    printSecret(
      'UNIQUE_ID',
      generateUUID(),
      'UUID v4 for unique identifiers'
    );

    // Print rotation checklist
    printRotationChecklist();

    printSeparator();
    console.log('✅ Secrets generated successfully!\n');
    console.log('Next steps:');
    console.log('  1. Follow the rotation checklist above');
    console.log('  2. Update secrets in your hosting platform (e.g., Vercel, Heroku)');
    console.log('  3. Deploy and verify each environment');
    console.log('  4. Monitor for 24-48 hours before removing old secrets\n');
    printSeparator();
  });
}

// Run the script
main();
