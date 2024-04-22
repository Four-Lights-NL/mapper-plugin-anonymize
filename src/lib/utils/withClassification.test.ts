import { name as packageName } from '#package.json'
import { type MapperConfigWithClassification, withClassification } from './withClassification'
import { map, type MapperConfig } from '@fourlights/mapper'
import type { DataTaxonomy } from '../types'
import { AnonymizePlugin } from '../anonymize'

describe(packageName, () => {
	describe('utils', () => {
		describe('withClassification', () => {
			it('should handle inline data taxonomies', () => {
				const input = { a: 'hello', b: 'world!' }
				const config: MapperConfigWithClassification<typeof input> = {
					a: [(d) => d.a, 'pii'],
					b: (d) => d.b,
				}

				const expected = { a: '*****', b: 'world!' }

				expect(
					map(input, withClassification(config), {
						plugins: [new AnonymizePlugin({ piiData: 'redact' })],
					}),
				).toEqual(expected)
			})

			it('should extend the config with property classifications', () => {
				const input = { a: 'hello', b: 'world!' }
				const config: MapperConfig<typeof input> = {
					a: (d) => d.a,
					b: (d) => d.b,
				}

				const properties = {
					a: 'pii',
				} as Record<string, DataTaxonomy>

				const expected = { a: '*****', b: 'world!' }

				expect(
					map(input, withClassification(config, properties), {
						plugins: [new AnonymizePlugin({ piiData: 'redact' })],
					}),
				).toEqual(expected)
			})
		})
	})
})
