/**
 * Path aliases are kept in sync with the `paths` block in tsconfig.json.
 * Server code and React components need different environments, so they run as
 * two projects rather than requiring a per-file `@jest-environment` docblock.
 */
const moduleNameMapper = {
  '^components/(.*)$': '<rootDir>/src/components/$1',
  '^content/(.*)$': '<rootDir>/src/content/$1',
  '^style/(.*)$': '<rootDir>/src/style/$1',
  '^types/(.*)$': '<rootDir>/src/types/$1',
  '^services/(.*)$': '<rootDir>/src/services/$1',
  '^svg/(.*)$': '<rootDir>/src/svg/$1',
  '^images/(.*)$': '<rootDir>/public/images/$1',
  '^utils/(.*)$': '<rootDir>/src/utils/$1',
  '^pages/(.*)$': '<rootDir>/src/pages/$1',
  '\\.(css|less|scss|sass)$': '<rootDir>/test/styleMock.js',
  '\\.(jpg|jpeg|png|gif|webp|ico|mp4|woff2?)$': '<rootDir>/test/fileMock.js',
};

const transform = {
  '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
};

const ignore = ['/node_modules/', '/.next/', '/scripts/', '/src/content/'];

module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/generated/**',
    '!src/content/**',
    '!src/**/__tests__/**',
  ],
  projects: [
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/services/**/*.test.ts',
        '<rootDir>/src/utils/**/*.test.ts',
        '<rootDir>/src/services/**/__tests__/**/*.test.ts',
        '<rootDir>/src/utils/**/__tests__/**/*.test.ts',
        // Next.js treats every file under src/pages as a page, so the tests for
        // pages and API routes live here instead.
        '<rootDir>/test/pages/**/*.test.ts',
      ],
      testPathIgnorePatterns: ignore,
      moduleNameMapper,
      transform,
    },
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/components/**/*.test.{ts,tsx}',
        '<rootDir>/src/components/**/__tests__/**/*.test.{ts,tsx}',
      ],
      testPathIgnorePatterns: ignore,
      moduleNameMapper,
      transform,
      setupFilesAfterEnv: ['<rootDir>/test/setupClient.ts'],
    },
  ],
};
