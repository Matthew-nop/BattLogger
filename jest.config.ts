const config: import('ts-jest').JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { },
  extensionsToTreatAsEsm: [ '.ts' ],
  moduleNameMapper: {
    '^(\.\.?/.*)\.js$': '$1',
  },
};

export default config;