import defu from 'defu'
import dlv from 'dlv'

import type { MapperConfig, MapperPlugin, MapperProperty } from '@fourlights/mapper'
import { isPlainObject } from '@fourlights/mapper/utils'

import type {
  AnonymizeMethod,
  AnonymizeMethodFactory,
  AnonymizeMethodOptions,
  AnonymizeMethods,
  AnonymizeOptions,
  AnonymizePropertyOptions,
  DataClassifications,
  DataTaxonomy,
} from './types'
import { Fake } from './methods/fake'
import { Redact } from './methods/redact'
import { getMethodOptions } from './utils/getMethodOptions'
import { isType } from './utils/isType'

export class AnonymizePlugin implements MapperPlugin {
  private readonly _options: AnonymizeOptions<unknown, unknown> = {
    piiData: 'fake',
    sensitiveData: 'redact',
    publicData: 'none',
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
      public: this.unwrap(this._options['publicData']!),
    }
  }

  private getTaxonomy<TData, TOptions>(
    options: AnonymizePropertyOptions<TData, TOptions>,
    innerKey?: string,
  ) {
    if (typeof options.classification === 'string') return options.classification as DataTaxonomy

    const [defaultTaxonomy, dataClassifications] = Array.isArray(options.classification)
      ? options.classification
      : ['public' as DataTaxonomy, options.classification]

    if (isType<DataClassifications>(dataClassifications) && innerKey !== undefined)
      return (dlv(dataClassifications, innerKey) as DataTaxonomy) ?? defaultTaxonomy
    return defaultTaxonomy
  }

  private isFunction<TData, TOptions>(
    options: AnonymizePropertyOptions<TData, TOptions>,
    innerKey?: string,
  ) {
    return (
      typeof options.anonymize === 'function' ||
      (options.anonymize === undefined &&
        typeof this.fallbackAnonymization[this.getTaxonomy(options, innerKey)] === 'function')
    )
  }

  private isMethod<TData, TOptions>(
    options: AnonymizePropertyOptions<TData, TOptions>,
    method: AnonymizeMethods,
    innerKey?: string,
  ) {
    const matchesMethod =
      options.anonymize !== undefined && this.unwrap(options.anonymize!) === method
    const useFallbackMethod =
      options.anonymize === undefined &&
      this.fallbackAnonymization[this.getTaxonomy(options, innerKey)] === method
    return matchesMethod || useFallbackMethod
  }

  private shouldTraverse<TData, TOptions extends { traverse: boolean }>(
    property: MapperProperty<TData, AnonymizePropertyOptions<TData, TOptions>>,
  ) {
    const options = getMethodOptions(property)
    return options?.traverse ?? true
  }

  private resolveGenerator<TData, TOptions>(
    generators: Record<
      string,
      AnonymizeMethodFactory<TData, AnonymizePropertyOptions<TData, TOptions>>
    >,
    property: MapperProperty<TData, AnonymizePropertyOptions<TData, TOptions>>,
    innerKey?: string,
  ) {
    if (this.isMethod(property.options!, 'redact', innerKey)) return generators.redact
    else if (this.isMethod(property.options!, 'fake', innerKey)) return generators.fake
    else if (this.isFunction(property.options!, innerKey)) return { generate: () => () => property } // TODO
  }

  config<TData, TOptions extends Record<string, any>>(
    config: MapperConfig<TData, AnonymizePropertyOptions<TData, TOptions>>,
  ): MapperConfig<TData> {
    const anonymizedConfig: typeof config = {} // Holds the mapper configuration with anonymized properties

    const generators = {
      redact: new Redact<TData>(),
      fake: new Fake<TData>(this._options.seed, this._options.locale),
    }

    // Find all properties with a data classification
    const toAnonymize = Object.keys(config).filter((key) => {
      const property = config[key]
      if (!property || typeof property === 'function' || !property.options) return false // Only handle long-form properties
      return !!property.options.classification || !!property.options.anonymize
    })

    // Apply anonymization
    for (let i = 0; i != toAnonymize.length; ++i) {
      const key = toAnonymize[i]
      const property = config[key] as MapperProperty<
        TData,
        AnonymizePropertyOptions<TData, TOptions>
      >
      const anonymizedProperty: MapperProperty<TData> = {
        value: (data: TData, _wrappedKey?: string, rowId?: string | number) => {
          if (this.shouldTraverse(property)) {
            const value = property.value(data, key, rowId)
            if (isPlainObject(value)) return value
          }

          const generator = this.resolveGenerator(generators, property)
          return generator?.generate(key, property)(data, key, rowId)
        },
      }
      anonymizedConfig[key] = {
        ...property,
        ...(this.shouldTraverse(property)
          ? ({
              ...anonymizedProperty,
              apply: (rowValue, parentKey, rowId) => {
                const innerKey = `${rowId!}`.substring(parentKey ? parentKey.length + 1 : 0)
                const generator = this.resolveGenerator(generators, property, innerKey)
                return (
                  generator?.generate(innerKey, property)(rowValue, parentKey, rowId) ?? rowValue
                )
              },
            } as MapperProperty<TData>)
          : anonymizedProperty),
      }
    }

    return { ...config, ...anonymizedConfig }
  }
}
