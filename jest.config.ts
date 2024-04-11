import type { Config } from 'jest'

const jestGlobals = {} as Record<string, any>

// Speedup tests, with disable type checking
if (process.env.TEST_FAST) {
	const RED_COLOR = '\x1b[31m'
	console.warn(RED_COLOR, 'TESTS DO NOT CHECK A TYPES!\n\n')

	jestGlobals['ts-jest'] = {
		isolatedModules: true,
	}
}

const config: Config = {
	testEnvironment: 'node',
	preset: 'ts-jest/presets/js-with-ts-esm',
	moduleNameMapper: {
		'^#package\\.json$': '<rootDir>/package.json',
	},
	transform: {
		'^.+\\.tsx?$': ['ts-jest', { useESM: true }],
	},
	testPathIgnorePatterns: ['<rootDir>/tests'],
	...(Object.keys(jestGlobals).length === 0 ? {} : { globals: jestGlobals }),
}

export default config
