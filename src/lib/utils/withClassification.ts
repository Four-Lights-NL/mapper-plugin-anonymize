import defu from 'defu'

import type { MapperConfig, MapperFn, MapperProperty } from '@fourlights/mapper'
import { utils } from '@fourlights/mapper'

import type { AnonymizeMapperConfig, AnonymizePropertyOptions, DataTaxonomy } from '../types'
import type { FakeMethodOptions, FakeValueFn } from '../methods/fake'
import { isType } from './isType'

type AnonymizeMapperProperty<TData, TOptions> = AnonymizeMapperConfig<
	TData,
	TOptions
>[keyof AnonymizeMapperConfig<TData, TOptions>]

type AnonymizeMapperPropertyWithClassification<TData, TOptions> =
	| [AnonymizeMapperProperty<TData, TOptions>, DataTaxonomy | undefined]
	| [
			AnonymizeMapperProperty<TData, TOptions>,
			DataTaxonomy | undefined,
			FakeValueFn<TData> | MapperFn<TData> | undefined,
	  ]

export type MapperConfigWithClassification<TData, TOptions = {}> = {
	[key: string]:
		| AnonymizeMapperProperty<TData, TOptions>
		| AnonymizeMapperPropertyWithClassification<TData, TOptions>
}

export function withClassification<TData, TOptions = {}>(
	config:
		| MapperConfig<TData>
		| AnonymizeMapperConfig<TData, TOptions>
		| MapperConfigWithClassification<TData, TOptions>,
	classifications: Record<string, DataTaxonomy> = {},
) {
	const newConfig: MapperConfig<TData, AnonymizePropertyOptions<TData, TOptions>> = {}

	for (const key of Object.keys(config)) {
		if (Array.isArray(config[key])) {
			const [propertyInput, classification, valueFn] = config[
				key
			] as AnonymizeMapperPropertyWithClassification<TData, TOptions>

			// Keep track of classification unless it's already explicitly provided
			if (classification && !(key in classifications)) {
				classifications[key] = classification
			}

			const property = utils.wrapProperty(propertyInput)
			if (valueFn !== undefined) {
				if (isType<FakeValueFn<TData>>(valueFn)) {
					property.options = defu(
						{
							anonymize: {
								method: 'fake',
								options: { value: valueFn },
							},
						} as AnonymizePropertyOptions<TData, FakeMethodOptions<TData>>,
						property.options ?? {},
					)
				} else {
					console.log('Unsupported valueFn, skipping', JSON.stringify(valueFn))
				}
			}

			config[key] = property
		}
	}

	// Set classifications
	for (const key of Object.keys(classifications)) {
		if (!config[key]) continue

		const property = utils.wrapProperty(
			config[key] as MapperProperty<TData, AnonymizePropertyOptions<TData, TOptions>>,
		)

		property.options = defu(
			{
				classification: classifications[key],
			},
			property.options,
		)

		newConfig[key] = property
	}

	return { ...config, ...newConfig } as AnonymizeMapperConfig<TData, TOptions>
}
