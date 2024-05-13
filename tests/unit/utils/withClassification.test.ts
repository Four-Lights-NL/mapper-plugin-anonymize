import { map, type MapperConfig } from '@fourlights/mapper'
import type { Faker } from '@faker-js/faker'

import { name as packageName } from '@fourlights/mapper-plugin-anonymize/package.json'
import {
	AnonymizePlugin,
	type MapperConfigWithClassification,
	withClassification,
} from '@fourlights/mapper-plugin-anonymize'
import type { DataTaxonomy } from '@fourlights/mapper-plugin-anonymize/types'

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

			it('should handle custom value functions', () => {
				const input = { a: 'hello', b: 'world!' }
				const config: MapperConfigWithClassification<typeof input> = {
					a: [(d) => d.a, 'pii', (faker: Faker) => faker.person.prefix()],
					b: (d) => d.b,
				}

				const expected = { a: 'Miss', b: 'world!' }
				expect(
					map(input, withClassification(config), {
						plugins: [new AnonymizePlugin({ seed: 1 })],
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
