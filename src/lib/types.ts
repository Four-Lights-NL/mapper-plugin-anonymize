import type {
  MapperConfig,
  MapperFn,
  MapperProperty,
  MapperPropertyOptions,
} from '@fourlights/mapper'
import type { FakeMethodOptions } from './methods/fake'
import type { RedactMethodOptions } from './methods/redact'
import type { LocaleDefinition } from '@faker-js/faker'

export type DataTaxonomy = 'pii' | 'sensitive' | 'public'
export type AnonymizeMethods = 'fake' | 'redact' | 'none'
export type DataClassifications = {
  [key: string]: DataTaxonomy | DataClassifications | [DataTaxonomy, DataClassifications]
}

export type AnonymizePropertyFn<TData, TOptions> = (
  key: string,
  property: MapperProperty<TData, AnonymizePropertyOptions<TData, TOptions>>,
) => MapperProperty<TData>

export type AnonymizeMethodFactory<TData, TOptions> = {
  generate: (
    key: string,
    property: MapperProperty<TData, AnonymizePropertyOptions<TData, TOptions>>,
  ) => MapperFn<TData>
}

export type AnonymizeMethod<TData, TOptions> =
  | AnonymizeMethods
  | AnonymizePropertyFn<TData, TOptions>
  | AnonymizeMethodOptions<TData>
export type AnonymizeMethodOptions<T> =
  | { method: 'fake'; options?: FakeMethodOptions<T> }
  | { method: 'redact'; options?: RedactMethodOptions<T> }
  | { method: AnonymizePropertyFn<T, Record<string, any>>; options?: Record<string, any> }

export type AnonymizeOptions<TData, TOptions> = {
  seed?: number | string
  piiData?: AnonymizeMethod<TData, TOptions>
  sensitiveData?: AnonymizeMethod<TData, TOptions>
  publicData?: AnonymizeMethod<TData, TOptions>
  traverse?: boolean
  locale?: LocaleDefinition | LocaleDefinition[]
}

export type AnonymizePropertyOptions<TData, TOptions> = MapperPropertyOptions & {
  classification?: DataTaxonomy | DataClassifications | [DataTaxonomy, DataClassifications]
  anonymize?: AnonymizeMethod<TData, TOptions>
}

export type AnonymizeMapperConfig<TData, TOptions = {}> = MapperConfig<
  TData,
  AnonymizePropertyOptions<TData, TOptions>
>
