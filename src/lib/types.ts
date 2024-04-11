import type { MapperFn, MapperProperty, MapperPropertyOptions } from '@fourlights/mapper'
import type { FakeMethodOptions } from './methods/fake'
import type { RedactMethodOptions } from './methods/redact'

export type DataTaxonomy = 'pii' | 'sensitive'
export type AnonymizeMethods = 'fake' | 'redact' | 'none'

export type AnonymizeMethodFn<T> = (key: string, property: MapperProperty<T>) => MapperFn<T>
export type AnonymizeMethodFactory<T> = {
	generate: AnonymizeMethodFn<T>
}

export type AnonymizeMethod = AnonymizeMethods | AnonymizeMethodFn<any> | AnonymizeMethodOptions
export type AnonymizeMethodOptions =
	| { method: 'fake'; options?: FakeMethodOptions }
	| { method: 'redact'; options?: RedactMethodOptions }
	| { method: AnonymizeMethodFn<any>; options?: Record<string, any> }

export type AnonymizeOptions = {
	seed?: number | string
	piiData?: AnonymizeMethod
	sensitiveData?: AnonymizeMethod
}

export type AnonymizePropertyOptions = MapperPropertyOptions & {
	classification?: DataTaxonomy
	anonymize?: AnonymizeMethod
}
