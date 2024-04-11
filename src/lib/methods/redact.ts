import type { MapperFn, MapperProperty } from '@fourlights/mapper'
import type { AnonymizeMethodFactory } from '../types'
import getMethodOptions from '../utils/getMethodOptions'
import fuzzysort from 'fuzzysort'

export type RedactMethodOptions = {
	key?: string
	replaceValue?: string
}

class Redact<T> implements AnonymizeMethodFactory<T> {
	private readonly specialRedactMethods: {
		name: string
		methodFactory: (replaceValue: string) => MapperFn<T>
	}[] = []
	private readonly minMatchKeyLength = 2

	constructor() {
		this.specialRedactMethods = [
			{
				name: 'email',
				methodFactory: (replaceValue) => () =>
					`${replaceValue.repeat(5)}@${replaceValue.repeat(5)}.com`,
			},
		]
	}

	generate(key: string, property: MapperProperty<T>) {
		const options = getMethodOptions<RedactMethodOptions>(property)
		const replaceValue = options?.replaceValue || '*'
		const result = fuzzysort.go(key, this.specialRedactMethods, { key: 'name', limit: 1 })
		if (key.length < this.minMatchKeyLength || result.length === 0)
			return (d: T) => `${property.value(d)}`.replaceAll(/./g, replaceValue)
		return result[0].obj.methodFactory(replaceValue)
	}
}

export default Redact
