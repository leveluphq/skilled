// Makes .env.local for local development (docs/README.md, step 2): copies
// .env.example if there's no .env.local yet, and gives JWT_SECRET and
// ENCRYPTION_KEY new random values where they're missing or still the
// example's placeholders. A value of your own is never replaced: an existing
// ENCRYPTION_KEY is what decrypts the OAuth tokens already saved with it.
//
//   npm run setup:env
//   npm run setup:env -- --hasura-port 8090   # and point GRAPHQL_URL at a Hasura moved off 8080
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SECRETS = ['JWT_SECRET', 'ENCRYPTION_KEY'];

// What the app accepts (utils/server/jwt.ts, encryption/keyManagement.ts):
// 64 bytes in base64 that round-trips
const isValidSecret = (value) => {
  const decoded = Buffer.from(value, 'base64');

  return decoded.length === 64 && decoded.toString('base64') === value;
};

const readValue = (text, name) => {
  const match = text.match(new RegExp(`^${name}=(.*)$`, 'm'));

  return match ? match[1].trim().replace(/^(['"])(.*)\1$/, '$2') : undefined;
};

const setupEnv = ({ root = ROOT, log = console.log, hasuraPort } = {}) => {
  const example = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
  const target = path.join(root, '.env.local');
  let text;

  if (fs.existsSync(target)) {
    text = fs.readFileSync(target, 'utf8');
  } else {
    text = example;
    log('Made .env.local from .env.example');
  }

  for (const name of SECRETS) {
    const value = readValue(text, name);
    const entry = `${name}=${crypto.randomBytes(64).toString('base64')}`;

    if (value === undefined) {
      text = `${text.replace(/\n*$/, '\n')}${entry}\n`;
    } else if (value === '' || value === readValue(example, name)) {
      text = text.replace(new RegExp(`^${name}=.*$`, 'm'), () => entry);
    } else {
      log(
        isValidSecret(value)
          ? `${name}: kept`
          : `${name}: kept, but it isn't 64 bytes of base64, so logging in won't work. Delete its line and run this again for a new one.`,
      );
      continue;
    }

    log(`${name}: set to a new random value`);
  }

  // Asked for by name, so it replaces the value there
  if (hasuraPort) {
    const entry = `GRAPHQL_URL=http://localhost:${hasuraPort}/v1/graphql`;

    text =
      readValue(text, 'GRAPHQL_URL') === undefined
        ? `${text.replace(/\n*$/, '\n')}${entry}\n`
        : text.replace(/^GRAPHQL_URL=.*$/m, () => entry);
    log(`GRAPHQL_URL: http://localhost:${hasuraPort}/v1/graphql`);
  }

  fs.writeFileSync(target, text);
};

const parseArgs = (args) => {
  const options = {};

  for (let i = 0; i < args.length; i += 1) {
    const [flag, inline] = args[i].split('=');
    const value = inline === undefined ? args[i + 1] : inline;

    if (flag === '--hasura-port' && /^\d+$/.test(value || '') && +value > 0 && +value < 65536) {
      options.hasuraPort = Number(value);
      i += inline === undefined ? 1 : 0;
    } else {
      throw new Error(`Usage: npm run setup:env [-- --hasura-port <port>]`);
    }
  }

  return options;
};

module.exports = { setupEnv, isValidSecret, parseArgs };

if (require.main === module) {
  try {
    setupEnv(parseArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
