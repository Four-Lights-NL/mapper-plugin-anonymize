import type { MapperFn, MapperProperty } from '@fourlights/mapper'
import fuzzysort from 'fuzzysort'
import type { AnonymizeMethodFactory } from '../types'
import { getMethodOptions } from '../utils/getMethodOptions'
import { unwrapValue } from '../utils/unwrapValue'

export type RedactMethodOptions = {
	key?: string
	replaceValue?: string
	traverse?: boolean
}

export class Redact<T> implements AnonymizeMethodFactory<T> {
	private readonly redactMethods: {
		name: string
		methodFactory: (replaceValue: string) => MapperFn<T>
	}[] = []
	private readonly minMatchKeyLength = 2

	constructor() {
		this.redactMethods = [
			{
				name: 'email',
				methodFactory: (replaceValue) => () =>
					`${replaceValue.repeat(5)}@${replaceValue.repeat(5)}.com`,
			},
		]
	}

	private shouldTraverse(property: MapperProperty<T>) {
		const options = getMethodOptions<RedactMethodOptions>(property)
		return options?.traverse ?? true
	}

	anonymize(key: string, property: MapperProperty<T>) {
		const anonymizedProperty: MapperProperty<T> = {
			value: (data: T, _wrappedKey?: string, rowId?: string | number) => {
				if (typeof data[key as keyof T] === 'object' && this.shouldTraverse(property))
					return property.value(data, key, rowId)
				return this.generate(key, property)(data, key, rowId)
			},
		}

		return this.shouldTraverse(property)
			? ({
					...anonymizedProperty,
					apply: (row, parentKey, rowId) => {
						const innerKey = `${rowId!}`.substring(parentKey ? parentKey.length + 1 : 0)
						return this.generate(innerKey, property)(row, parentKey, rowId)
					},
				} as MapperProperty<T>)
			: anonymizedProperty
	}

	generate(key: string, property: MapperProperty<T>) {
		const options = getMethodOptions<RedactMethodOptions>(property)

		const replaceValue = options?.replaceValue || '*'
		const result = fuzzysort.go(key, this.redactMethods, { key: 'name', limit: 1 })
		if (key.length < this.minMatchKeyLength || result.length === 0)
			return (d: T, _wrappedKey?: string, rowId?: string | number) =>
				`${unwrapValue(property, d, rowId)}`.replaceAll(/\w/g, replaceValue)
		return (d: T) => result[0].obj.methodFactory(replaceValue)(d)
	}
}
