import type { MapperProperty } from '@fourlights/mapper'

const unwrapValue = <T, U = {}>(
	property: MapperProperty<T, U>,
	data: T,
	rowId?: string | number,
) => {
	return rowId ? data : property.value(data)
}

export default unwrapValue
