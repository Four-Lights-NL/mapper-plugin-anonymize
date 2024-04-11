import type { AnonymizeMethod, AnonymizePropertyOptions } from '../types'
import type { MapperProperty } from '@fourlights/mapper'

const getMethodOptions = <T>(property: MapperProperty<any>) => {
	const propertyOptions = property.options as AnonymizePropertyOptions
	const method = propertyOptions?.anonymize as AnonymizeMethod
	return typeof method === 'object' ? (method.options as T) : undefined
}

export default getMethodOptions
