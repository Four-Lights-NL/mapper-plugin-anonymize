import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src', '!src/**/*.test.*'],
	format: ['cjs', 'esm'],
	splitting: true,
	clean: true,
	dts: true,
	shims: true,
	minify: true,
	sourcemap: true,
	outExtension({ format }) {
		return {
			js: format === 'esm' ? '.mjs' : `.${format}`,
		}
	},
})
