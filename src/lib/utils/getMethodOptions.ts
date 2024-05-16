import type { AnonymizeMethod, AnonymizePropertyOptions } from '../types'
import type { MapperProperty } from '@fourlights/mapper'

export function getMethodOptions<TData, TOptions>(
  property: MapperProperty<TData, AnonymizePropertyOptions<TData, TOptions>>,
) {
  const propertyOptions = property.options as AnonymizePropertyOptions<TData, TOptions>
  const method = propertyOptions?.anonymize as AnonymizeMethod<TData, TOptions>
  return typeof method === 'object' ? (method.options as TOptions) : undefined
}
