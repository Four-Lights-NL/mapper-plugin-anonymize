import { name as packageName } from '#package.json'
import { map, MapperConfig } from '@fourlights/mapper'
import AnonymizePlugin from './anonymize'
import { AnonymizePluginPropertyOptions } from './types'
import { FakeMethodOptions } from './methods/fake'

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
		const config: MapperConfig<typeof input, AnonymizePluginPropertyOptions> = {
			email: {
				value: (d) => d.email,
				options: { classification: 'pii' },
			},
		} as MapperConfig<typeof input>

		expect(map(input, config, { plugins: [plugin] })).toEqual(expected)
	})

	it('should fake properties with a classification', () => {
		const plugin = new AnonymizePlugin({ seed: 1, piiData: 'fake' })
		const input = { email: 'exposed@example.com' }
		const expected = { email: 'Winifred.Watsica@gmail.com' }
		const config: MapperConfig<typeof input, AnonymizePluginPropertyOptions> = {
			email: {
				value: (d) => d.email,
				options: { classification: 'pii' },
			},
		} as MapperConfig<typeof input>

		expect(map(input, config, { plugins: [plugin] })).toEqual(expected)
	})

	it('should allow customizing the faker', () => {
		const plugin = new AnonymizePlugin({ seed: 1 })
		const input = { firstName: 'Jane', lastName: 'Doe' }
		const expected = { name: 'Winifred Watsica' }
		const config: MapperConfig<typeof input, AnonymizePluginPropertyOptions> = {
			name: {
				value: (d) => `${d.firstName} ${d.lastName}`,
				options: {
					classification: 'pii',
					anonymize: { method: 'fake', options: { key: 'fullName' } as FakeMethodOptions },
				},
			},
		} as MapperConfig<typeof input>

		expect(map(input, config, { plugins: [plugin] })).toEqual(expected)
	})

	// it('should allow custom anonymization methods', () => {
	//   const plugin = new AnonymizePlugin({
	//     piiData: (key, property) => {
	//       if (property.options?.anonymize === 'fake') {
	//         return (d) => `fake-${d[key]}`
	//       }
	//       return (d) => `redacted-${d[key]}`
	//     },
	//   })
	// })

	// it('should allow specifying anonymization methods per property', () => {
	//   const plugin = new AnonymizePlugin({
	//     piiData: {
	//       method: 'fake',
	//       options: { key: 'email' },
	//     },
	//   })
	// })

	// it('should allow specifying anonymization methods per property with a custom method', () => {
	//   const plugin = new AnonymizePlugin({
	//     piiData: {
	//       method: (key, property) => {
	//         if (property.options?.anonymize === 'fake') {
	//           return (d) => `fake-${d[key]}`
	//         }
	//         return (d) => `redacted-${d[key]}`
	//       },
	//     },
	//   })
	// })

	// it('should allow specifying anonymization methods per property with a custom method and options', () => {
	// const plugin = new AnonymizePlugin({
	//     piiData: {
	//       method: (key, property) => {
	//         if (property.options?.anonymize === 'fake') {
	//           return (d) => `fake-${d[key]}`
	//         }
	//         return (d) => `redacted-${d[key]}`
	//       },
	//       options: { key: 'email' },
	//     },
	//   })
	// })

	// it('should allow specifying anonymization methods per property with a custom method and options', () => {
	//   const plugin = new AnonymizePlugin({
	//     piiData: {
	//       method: (key, property) => {
	//         if (property.options?.anonymize === 'fake') {
	//           return (d) => `fake-${d[key]}`
	//         }
	//         return (d) => `redacted-${d[key]}`
	//       },
	//       options: { key: 'email' },
	//     },
	//   })
	// })
})
