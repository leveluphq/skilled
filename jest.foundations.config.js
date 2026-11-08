const server = require('./jest.config').projects.find(
  (project) => project.displayName === 'server',
);
module.exports = {
  displayName: 'published-foundations',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/foundations/*.test.ts'],
  moduleNameMapper: server.moduleNameMapper,
  transform: server.transform,
  testTimeout: 300000,
};
