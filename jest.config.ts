import type { Config } from 'jest'

const config: Config = {
	testEnvironment: 'node',
	moduleNameMapper: {
		'^#package\\.json$': '<rootDir>/package.json',
		'^@fourlights/mapper-plugin-anonymize$': '<rootDir>/dist',
	},
	transform: {
		'^.+\\.tsx?$': ['esbuild-jest-transform', { target: 'ESNext' }],
	},
}

export default config
