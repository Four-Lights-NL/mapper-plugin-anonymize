import type { AnonymizeMethodDefinition, AnonymizePluginPropertyOptions } from '../types'
import type { MapperProperty } from '@fourlights/mapper'

const getMethodOptions = <U>(property: MapperProperty<any>) => {
	const propertyOptions = property.options as AnonymizePluginPropertyOptions
	const method = propertyOptions?.anonymize as AnonymizeMethodDefinition
	return typeof method === 'object' ? (method.options as U) : undefined
}

export default getMethodOptions
