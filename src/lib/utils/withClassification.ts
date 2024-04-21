import type { AnonymizeMapperConfig, AnonymizePropertyOptions, DataTaxonomy } from '../types'
import type { MapperConfig, MapperFn, MapperProperty } from '@fourlights/mapper'

type AnonymizeMapperProperty<T> = AnonymizeMapperConfig<T>[keyof AnonymizeMapperConfig<T>]
type AnonymizeMapperPropertyWithClassification<T> = [
	AnonymizeMapperProperty<T>,
	DataTaxonomy | undefined,
]
export type MapperConfigWithClassification<T> = {
	[key: string]: AnonymizeMapperProperty<T> | AnonymizeMapperPropertyWithClassification<T>
}

const withClassification = <T>(
	config: MapperConfig<T> | AnonymizeMapperConfig<T> | MapperConfigWithClassification<T>,
	properties: Record<string, DataTaxonomy | undefined> = {},
) => {
	const newConfig: MapperConfig<T, AnonymizePropertyOptions> = {}

	for (const key of Object.keys(config)) {
		if (Array.isArray(config[key])) {
			const [prop, classification] = config[key] as AnonymizeMapperPropertyWithClassification<T>
			if (classification && !(key in properties)) {
				properties[key] = classification
			}
			config[key] = prop
		}
	}

	for (const key of Object.keys(properties)) {
		if (!config[key]) continue

		const propWithClassification = (
			typeof config[key] !== 'object' ? { value: config[key] as MapperFn<T> } : config[key]
		) as MapperProperty<T, AnonymizePropertyOptions>

		propWithClassification.options = { classification: properties[key] }

		newConfig[key] = propWithClassification
	}

	return { ...config, ...newConfig } as AnonymizeMapperConfig<T>
}

export default withClassification
