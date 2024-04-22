import { name as packageName } from '#package.json'
import { type MapperConfigWithClassification, withClassification } from './withClassification'
import * as mapper from '@fourlights/mapper'
import { AnonymizePlugin } from '../anonymize'
import { map } from './map'

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
