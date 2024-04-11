import type { MapperConfig, MapperPlugin, MapperProperty } from '@fourlights/mapper'
import type {
	AnonymizeMethod,
	AnonymizeMethodFn,
	AnonymizeMethodOptions,
	AnonymizeMethods,
	AnonymizeOptions,
	AnonymizePropertyOptions,
} from './types'
import defu from 'defu'
import Fake from './methods/fake'
import Redact from './methods/redact'

class AnonymizePlugin implements MapperPlugin {
	private readonly _options: AnonymizeOptions = {
		piiData: 'fake',
		sensitiveData: 'redact',
		seed: undefined,
	}

	constructor(options?: AnonymizeOptions) {
		this._options = defu(options, this._options)
	}

	private getMethod(options: AnonymizeMethod) {
		return typeof options === 'object' ? (options as AnonymizeMethodOptions).method : options
	}

	private get fallbackAnonymization() {
		return {
			pii: this.getMethod(this._options['piiData']!),
			sensitive: this.getMethod(this._options['sensitiveData']!),
		}
	}

	private isFunction(options: AnonymizePropertyOptions) {
		return (
			typeof options.anonymize === 'function' ||
			(options.anonymize === undefined &&
				typeof this.fallbackAnonymization[options.classification!] === 'function')
		)
	}

	private isMethod(options: AnonymizePropertyOptions, method: AnonymizeMethods) {
		const matchesMethod =
			options.anonymize !== undefined && this.getMethod(options.anonymize!) === method
		const useFallbackMethod =
			options.anonymize === undefined &&
			this.fallbackAnonymization[options.classification!] === method
		return matchesMethod || useFallbackMethod
	}

	config<T>(config: MapperConfig<T>): MapperConfig<T> {
		const anonymizedConfig: typeof config = {} // Holds the mapper configuration with anonymized properties

		// Find all properties with a data classification
		const propsWithClassification = Object.keys(config).filter((key) => {
			const property = config[key]
			if (!property || typeof property === 'function') return false // Only handle long-form properties
			const options = property.options as AnonymizePropertyOptions
			return !!options.classification
		})

		// Determine which properties to redact
		const propsToRedact = propsWithClassification.filter((key) => {
			const property = config[key] as MapperProperty<T>
			const options = property.options as AnonymizePropertyOptions
			return this.isMethod(options, 'redact')
		})

		// Redact properties
		if (propsToRedact.length > 0) {
			const redact = new Redact<T>()
			for (const key of propsToRedact) {
				const property = config[key] as MapperProperty<T>
				anonymizedConfig[key] = { ...property, value: redact.generate(key, property) }
			}
		}

		// Determine which properties to fake
		const propsToFake = propsWithClassification.filter((key) => {
			const property = config[key] as MapperProperty<T>
			const options = property.options as AnonymizePropertyOptions
			return this.isMethod(options, 'fake')
		})

		// Fake properties
		if (propsToFake.length > 0) {
			const { seed } = this._options
			const fake = new Fake<T>(seed)

			for (const key of propsToFake) {
				const property = config[key] as MapperProperty<T>
				anonymizedConfig[key] = { ...property, value: fake.generate(key, property) }
			}
		}

		// Determine properties with custom anonymization functions
		const propsWithCustomAnonymization = propsWithClassification.filter((key) => {
			const property = config[key] as MapperProperty<T>
			const options = property.options as AnonymizePropertyOptions
			return this.isFunction(options)
		})

		// Apply custom anonymization functions
		if (propsWithCustomAnonymization.length > 0) {
			for (const key of propsWithCustomAnonymization) {
				const property = config[key] as MapperProperty<T>
				const options = property.options as AnonymizePropertyOptions
				const anonymizeFn =
					typeof options.anonymize === 'function'
						? options.anonymize
						: (this.fallbackAnonymization[options.classification!] as AnonymizeMethodFn<T>)
				anonymizedConfig[key] = { ...property, value: anonymizeFn(key, property) }
			}
		}

		return { ...config, ...anonymizedConfig }
	}
}

export default AnonymizePlugin
