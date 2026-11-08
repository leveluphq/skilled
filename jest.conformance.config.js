/**
 * The conformance suite: every lesson's reference solutions and starter code,
 * in every language, run in Docker through the same code the app uses
 * (docs/README.md). Slow, and needs Docker, so it's separate from `npm test`:
 *
 *   npm run conformance
 *   npm run conformance -- --testNamePattern count-islands
 */
const base = require('./jest.config');
const server = base.projects.find((project) => project.displayName === 'server');

module.exports = {
  displayName: 'conformance',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/conformance/**/*.test.ts'],
  moduleNameMapper: server.moduleNameMapper,
  transform: server.transform,
  testTimeout: 120000,
};
