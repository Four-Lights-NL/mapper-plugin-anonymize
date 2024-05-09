import type { AnonymizeMapperConfig, AnonymizePropertyOptions, DataTaxonomy } from '../types'
import type { MapperConfig, MapperFn, MapperProperty } from '@fourlights/mapper'

type AnonymizeMapperProperty<TData, TOptions> = AnonymizeMapperConfig<
	TData,
	TOptions
>[keyof AnonymizeMapperConfig<TData, TOptions>]
type AnonymizeMapperPropertyWithClassification<TData, TOptions> = [
	AnonymizeMapperProperty<TData, TOptions>,
	DataTaxonomy | undefined,
]

export type MapperConfigWithClassification<TData, TOptions = {}> = {
	[key: string]:
		| AnonymizeMapperProperty<TData, TOptions>
		| AnonymizeMapperPropertyWithClassification<TData, TOptions>
}
export function withClassification<TData, TOptions>(
	config:
		| MapperConfig<TData>
		| AnonymizeMapperConfig<TData, TOptions>
		| MapperConfigWithClassification<TData, TOptions>,
	properties: Record<string, DataTaxonomy | undefined> = {},
) {
	const newConfig: MapperConfig<TData, AnonymizePropertyOptions<TData, TOptions>> = {}

	for (const key of Object.keys(config)) {
		if (Array.isArray(config[key])) {
			const [prop, classification] = config[key] as AnonymizeMapperPropertyWithClassification<
				TData,
				TOptions
			>
			if (classification && !(key in properties)) {
				properties[key] = classification
			}
			config[key] = prop
		}
	}

	for (const key of Object.keys(properties)) {
		if (!config[key]) continue

		const propWithClassification = (
			typeof config[key] !== 'object' ? { value: config[key] as MapperFn<TData> } : config[key]
		) as MapperProperty<TData, AnonymizePropertyOptions<TData, TOptions>>

		propWithClassification.options = { classification: properties[key] }

		newConfig[key] = propWithClassification
	}

	return { ...config, ...newConfig } as AnonymizeMapperConfig<TData, TOptions>
}
