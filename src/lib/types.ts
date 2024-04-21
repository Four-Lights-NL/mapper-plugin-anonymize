import type {
	MapperConfig,
	MapperFn,
	MapperProperty,
	MapperPropertyOptions,
} from '@fourlights/mapper'
import type { FakeMethodOptions } from './methods/fake'
import type { RedactMethodOptions } from './methods/redact'

export type DataTaxonomy = 'pii' | 'sensitive'
export type AnonymizeMethods = 'fake' | 'redact' | 'none'

export type AnonymizePropertyFn<T> = (
	key: string,
	property: MapperProperty<T>,
) => MapperProperty<T, AnonymizePropertyOptions>

export type AnonymizeMethodFactory<T> = {
	anonymize: AnonymizePropertyFn<T>
	generate: (key: string, property: MapperProperty<T>) => MapperFn<T>
}

export type AnonymizeMethod = AnonymizeMethods | AnonymizePropertyFn<any> | AnonymizeMethodOptions
export type AnonymizeMethodOptions =
	| { method: 'fake'; options?: FakeMethodOptions }
	| { method: 'redact'; options?: RedactMethodOptions }
	| { method: AnonymizePropertyFn<any>; options?: Record<string, any> }

export type AnonymizeOptions = {
	seed?: number | string
	piiData?: AnonymizeMethod
	sensitiveData?: AnonymizeMethod
	traverse?: boolean
}

export type AnonymizePropertyOptions = MapperPropertyOptions & {
	classification?: DataTaxonomy
	anonymize?: AnonymizeMethod
}

export type AnonymizeMapperConfig<T> = MapperConfig<T, AnonymizePropertyOptions>
