const config: import('ts-jest').JestConfigWithTsJest = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: { },
	extensionsToTreatAsEsm: [ '.ts' ],
	moduleNameMapper: {
		'^(\.\.?/.*)\.js$': '$1',
	},
	testPathIgnorePatterns: [
		"/tests/e2e/",
	],
};

export default config;