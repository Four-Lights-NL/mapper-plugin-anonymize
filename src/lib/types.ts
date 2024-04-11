import type { MapperFn, MapperProperty, MapperPropertyOptions } from '@fourlights/mapper'
import type { FakeMethodOptions } from './methods/fake'
import { RedactMethodOptions } from './methods/redact'

export type DataTaxonomy = 'pii' | 'sensitive'
export type AnonymizeMethods = 'fake' | 'redact' | 'none'

export type AnonymizeMethodFn<T> = (key: string, property: MapperProperty<T>) => MapperFn<T>
export type AnonymizeMethod<T> = {
	generate: (key: string, property: MapperProperty<T>) => MapperFn<T>
}

// TODO: Rename these types so that they make more sense
export type AnonymizeMethodDefinition =
	| AnonymizeMethods
	| AnonymizeMethodFn<any>
	| AnonymizeMethodOptions

export type AnonymizeMethodOptions =
	| { method: 'fake'; options?: FakeMethodOptions }
	| { method: 'redact'; options?: RedactMethodOptions }
	| { method: AnonymizeMethodFn<any>; options?: Record<string, any> }

export type AnonymizePluginOptions = {
	seed?: number | string
	piiData?: AnonymizeMethodDefinition
	sensitiveData?: AnonymizeMethodDefinition
}

export type AnonymizePluginPropertyOptions = MapperPropertyOptions & {
	classification?: DataTaxonomy
	anonymize?: AnonymizeMethodDefinition
}
