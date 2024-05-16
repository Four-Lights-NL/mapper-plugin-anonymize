import type { MapperProperty } from '@fourlights/mapper'

export function unwrapValue<T, U extends {} = {}>(
  property: MapperProperty<T, U>,
  data: T,
  rowId?: string | number,
) {
  return rowId ? data : property.value(data)
}
