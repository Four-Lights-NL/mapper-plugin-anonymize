import { name as packageName } from '#package.json'
import { map, type MapperConfig } from '@fourlights/mapper'
import { AnonymizePlugin } from './anonymize'
import type { AnonymizeMapperConfig } from './types'

describe(packageName, () => {
	it('should not anonymize properties without classification', () => {
		const input = { a: 'hello', b: 'world!' }
		const expected = { a: 'hello', b: 'world!' }
		const config = {
			a: (d) => d.a,
			b: (d) => d.b,
		} as MapperConfig<typeof input>

		expect(map(input, config)).toEqual(expected)
	})

	it('should redact properties with a classification', () => {
		const plugin = new AnonymizePlugin({ seed: 1, piiData: 'redact' })
		const input = { email: 'exposed@example.com' }
		const expected = { email: '*****@*****.com' }
		const config = {
			email: {
				value: (d) => d.email,
				options: { classification: 'pii' },
			},
		} as AnonymizeMapperConfig<typeof input>

		expect(map(input, config, { plugins: [plugin] })).toEqual(expected)
	})

	it('should fake properties with a classification', () => {
		const plugin = new AnonymizePlugin({ seed: 1, piiData: 'fake' })
		const input = { email: 'exposed@example.com' }
		const expected = { email: 'Winifred.Watsica@gmail.com' }
		const config = {
			email: {
				value: (d) => d.email,
				options: { classification: 'pii' },
			},
		} as AnonymizeMapperConfig<typeof input>

		expect(map(input, config, { plugins: [plugin] })).toEqual(expected)
	})

	it('should allow customizing the faker', () => {
		const plugin = new AnonymizePlugin({ seed: 1 })
		const input = { firstName: 'Jane', lastName: 'Doe' }
		const expected = { name: 'Winifred Watsica' }
		const config = {
			name: {
				value: (d) => `${d.firstName} ${d.lastName}`,
				options: {
					classification: 'pii',
					anonymize: { method: 'fake', options: { key: 'fullName' } },
				},
			},
		} as AnonymizeMapperConfig<typeof input>

		expect(map(input, config, { plugins: [plugin] })).toEqual(expected)
	})
})
