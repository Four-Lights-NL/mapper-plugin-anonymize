import type { AnonymizePluginPropertyOptions, DataTaxonomy } from '../types'
import type { MapperConfig, MapperFn, MapperProperty } from '@fourlights/mapper'

const withClassification = <T>(
	config: MapperConfig<T, AnonymizePluginPropertyOptions>,
	properties: Record<string, DataTaxonomy | undefined>,
) => {
	const newConfig: MapperConfig<T, AnonymizePluginPropertyOptions> = {}

	for (const key of Object.keys(properties)) {
		if (!config[key]) continue

		const propWithClassification = (
			typeof config[key] !== 'object' ? { value: config[key] as MapperFn<T> } : config[key]
		) as MapperProperty<T, AnonymizePluginPropertyOptions>

		propWithClassification.options = { classification: properties[key] }

		newConfig[key] = propWithClassification
	}

	return { ...config, ...newConfig }
}

export default withClassification
