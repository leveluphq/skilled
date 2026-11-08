const server = require('./jest.config').projects.find(
  (project) => project.displayName === 'server',
);
module.exports = {
  displayName: 'published-walkthroughs',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/walkthroughs/*.test.ts'],
  moduleNameMapper: server.moduleNameMapper,
  transform: server.transform,
  testTimeout: 120000,
};
