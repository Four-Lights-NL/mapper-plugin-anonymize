import type { AnonymizePropertyOptions, DataTaxonomy } from '../types'
import type { MapperConfig, MapperFn, MapperProperty } from '@fourlights/mapper'

const withClassification = <T>(
	config: MapperConfig<T, AnonymizePropertyOptions>,
	properties: Record<string, DataTaxonomy | undefined>,
) => {
	const newConfig: MapperConfig<T, AnonymizePropertyOptions> = {}

	for (const key of Object.keys(properties)) {
		if (!config[key]) continue

		const propWithClassification = (
			typeof config[key] !== 'object' ? { value: config[key] as MapperFn<T> } : config[key]
		) as MapperProperty<T, AnonymizePropertyOptions>

		propWithClassification.options = { classification: properties[key] }

		newConfig[key] = propWithClassification
	}

	return { ...config, ...newConfig }
}

export default withClassification
