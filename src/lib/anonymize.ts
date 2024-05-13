import type { MapperConfig, MapperPlugin, MapperProperty } from '@fourlights/mapper'
import type {
	AnonymizeMethod,
	AnonymizeMethodOptions,
	AnonymizeMethods,
	AnonymizeOptions,
	AnonymizePropertyFn,
	AnonymizePropertyOptions,
} from './types'
import defu from 'defu'
import { Fake, FakeMethodOptions } from './methods/fake'
import { Redact, RedactMethodOptions } from './methods/redact'

export class AnonymizePlugin implements MapperPlugin {
	private readonly _options: AnonymizeOptions<unknown, unknown> = {
		piiData: 'fake',
		sensitiveData: 'redact',
		seed: undefined,
		traverse: true,
	}

	constructor(options?: AnonymizeOptions<unknown, unknown>) {
		this._options = defu(options, this._options)
	}

	private unwrap<TData, TOptions>(options: AnonymizeMethod<TData, TOptions>) {
		return typeof options === 'object' ? (options as AnonymizeMethodOptions<TData>).method : options
	}

	private get fallbackAnonymization() {
		return {
			pii: this.unwrap(this._options['piiData']!),
			sensitive: this.unwrap(this._options['sensitiveData']!),
		}
	}

	private isFunction<TData, TOptions>(options: AnonymizePropertyOptions<TData, TOptions>) {
		return (
			typeof options.anonymize === 'function' ||
			(options.anonymize === undefined &&
				typeof this.fallbackAnonymization[options.classification!] === 'function')
		)
	}

	private isMethod<TData, TOptions>(
		options: AnonymizePropertyOptions<TData, TOptions>,
		method: AnonymizeMethods,
	) {
		const matchesMethod =
			options.anonymize !== undefined && this.unwrap(options.anonymize!) === method
		const useFallbackMethod =
			options.anonymize === undefined &&
			this.fallbackAnonymization[options.classification!] === method
		return matchesMethod || useFallbackMethod
	}

	config<TData, TOptions extends Record<string, any>>(
		config: MapperConfig<TData, AnonymizePropertyOptions<TData, TOptions>>,
	): MapperConfig<TData> {
		const anonymizedConfig: typeof config = {} // Holds the mapper configuration with anonymized properties

		// Find all properties with a data classification
		const toAnonymize = Object.keys(config)
			.filter((key) => {
				const property = config[key]
				if (!property || typeof property === 'function' || !property.options) return false // Only handle long-form properties
				return !!property.options.classification || !!property.options.anonymize
			})
			.reduce(
				(acc, key) => {
					const property = config[key] as MapperProperty<
						TData,
						AnonymizePropertyOptions<TData, TOptions>
					>
					if (this.isMethod(property.options!, 'redact')) acc.redact[key] = property
					else if (this.isMethod(property.options!, 'fake')) acc.fake[key] = property
					else if (this.isFunction(property.options!)) acc.custom[key] = property
					return acc
				},
				{ redact: {}, fake: {}, custom: {} } as Record<
					'redact' | 'fake' | 'custom',
					Record<string, MapperProperty<TData, AnonymizePropertyOptions<TData, TOptions>>>
				>,
			)

		// Anonymize using redact
		if (toAnonymize.redact) {
			const redact = new Redact<TData>()
			for (const [key, property] of Object.entries(toAnonymize.redact)) {
				anonymizedConfig[key] = {
					...property,
					...redact.anonymize(
						key,
						property as MapperProperty<TData, AnonymizePropertyOptions<TData, RedactMethodOptions>>,
					),
				}
			}
		}

		// Anonymize using fake
		if (toAnonymize.fake) {
			const { seed, locale, traverse } = this._options
			const fake = new Fake<TData>(seed, locale)

			for (const [key, property] of Object.entries(toAnonymize.fake)) {
				anonymizedConfig[key] = {
					...property,
					...fake.anonymize(
						key,
						property as MapperProperty<
							TData,
							AnonymizePropertyOptions<TData, FakeMethodOptions<TData>>
						>,
					),
				}
			}
		}

		// Anonymize using custom function
		if (toAnonymize.custom) {
			for (const [key, property] of Object.entries(toAnonymize.custom)) {
				const anonymize =
					typeof property.options!.anonymize === 'function'
						? property.options!.anonymize
						: (this.fallbackAnonymization[property.options!.classification!] as AnonymizePropertyFn<
								TData,
								Record<string, any>
							>)
				anonymizedConfig[key] = {
					...property,
					...anonymize(
						key,
						property as MapperProperty<Record<string, any>> & MapperProperty<TData>,
					),
				}
			}
		}

		return { ...config, ...anonymizedConfig }
	}
}
