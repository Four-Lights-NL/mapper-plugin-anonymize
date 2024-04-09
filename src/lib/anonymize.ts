import { MapperConfig, MapperPlugin, MapperProperty } from '@fourlights/mapper'
import type { AnonymizePluginOptions, AnonymizePluginPropertyOptions } from './types'
import defu from 'defu'
import Fake from './methods/fake'
import Redact from './methods/redact'

class AnonymizePlugin implements MapperPlugin {
	private readonly _options: AnonymizePluginOptions = {
		piiData: 'fake',
		sensitiveData: 'redact',
		seed: undefined,
	}

	constructor(options?: AnonymizePluginOptions) {
		this._options = defu(options, this._options)
	}

	config<T>(config: MapperConfig<T>): MapperConfig<T> {
		const propsWithClassification = Object.keys(config).filter((key) => {
			const property = config[key]
			if (!property || typeof property === 'function') return false
			const options = property.options as AnonymizePluginPropertyOptions
			return !!options.classification
		})

		const propsToRedact = propsWithClassification.filter((key) => {
			const property = config[key] as MapperProperty<T>
			const options = property.options as AnonymizePluginPropertyOptions
			return (
				options.anonymize === 'redact' ||
				(options.anonymize === undefined && this._options[`${options.classification!}Data`] === 'redact')
			)
		})

		const propsToFake = propsWithClassification.filter((key) => {
			const property = config[key] as MapperProperty<T>
			const options = property.options as AnonymizePluginPropertyOptions
			return (
				options.anonymize === 'fake' ||
				(options.anonymize === undefined && this._options[`${options.classification!}Data`] === 'fake')
			)
		})

		const anonymizedConfig: typeof config = {}

		if (propsToRedact.length > 0) {
			const redact = new Redact<T>()
			for (const key of propsToRedact) {
				const property = config[key] as MapperProperty<T>
				anonymizedConfig[key] = { ...property, value: redact.generate(key, property) }
			}
		}

		if (propsToFake.length > 0) {
			const { seed } = this._options
			const fake = new Fake<T>(seed)

			for (const key of propsToFake) {
				const property = config[key] as MapperProperty<T>
				anonymizedConfig[key] = { ...property, value: fake.generate(key, property) }
			}
		}

		return { ...config, ...anonymizedConfig }
	}
}

export default AnonymizePlugin
