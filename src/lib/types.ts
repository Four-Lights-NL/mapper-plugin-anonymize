import type { MapperFn, MapperProperty, MapperPropertyOptions } from '@fourlights/mapper'

export type DataTaxonomy = 'pii' | 'sensitive'
export type AnonymizeMethods = 'fake' | 'redact' | 'none'

export type AnonymizeMethod<T> = {
  generate: (key: string, property: MapperProperty<T>) => MapperFn<T>
}

export type AnonymizePluginOptions = {
	seed?: number
	piiData?: AnonymizeMethods
	sensitiveData?: AnonymizeMethods
}

export type AnonymizePluginPropertyOptions = MapperPropertyOptions & {
	classification?: DataTaxonomy
	anonymize?: AnonymizeMethods
}
