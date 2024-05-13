import * as mapper from '@fourlights/mapper'
import { name as packageName } from '@fourlights/mapper-plugin-anonymize/package.json'
import {
	AnonymizePlugin,
	map,
	type MapperConfigWithClassification,
	withClassification,
} from '@fourlights/mapper-plugin-anonymize'

describe(packageName, () => {
	describe('utils', () => {
		describe('map', () => {
			it('should anonymize', () => {
				const input = { a: 'hello', b: 'world!' }
				const config: MapperConfigWithClassification<typeof input> = {
					a: [(d) => d.a, 'pii'],
					b: (d) => d.b,
				}

				const expected = { a: '*****', b: 'world!' }

				expect(map(input, config, { piiData: 'redact' })).toEqual(expected)
				expect(map(input, config, { piiData: 'redact' })).toEqual(
					mapper.map(input, withClassification(config), {
						plugins: [new AnonymizePlugin({ piiData: 'redact' })],
					}),
				)
			})
		})
	})
})
