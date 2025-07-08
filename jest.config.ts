const config: import('ts-jest').JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^(\.\.?/.*)\.js$': '$1',
  },
};

export default config;