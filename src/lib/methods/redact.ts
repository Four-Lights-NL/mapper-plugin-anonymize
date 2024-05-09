import type { MapperFn, MapperProperty } from '@fourlights/mapper'
import fuzzysort from 'fuzzysort'
import type { AnonymizeMethodFactory, AnonymizePropertyOptions } from '../types'
import { getMethodOptions } from '../utils/getMethodOptions'
import { unwrapValue } from '../utils/unwrapValue'

export type RedactMethodOptions = {
	key?: string
	replaceValue?: string
	traverse?: boolean
}

export class Redact<TData>
	implements AnonymizeMethodFactory<TData, AnonymizePropertyOptions<TData, RedactMethodOptions>>
{
	private readonly redactMethods: {
		name: string
		methodFactory: (replaceValue: string) => MapperFn<TData>
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

	private shouldTraverse(
		property: MapperProperty<TData, AnonymizePropertyOptions<TData, RedactMethodOptions>>,
	) {
		const options = getMethodOptions(property)
		return options?.traverse ?? true
	}

	anonymize(
		key: string,
		property: MapperProperty<TData, AnonymizePropertyOptions<TData, RedactMethodOptions>>,
	) {
		const anonymizedProperty: MapperProperty<TData> = {
			value: (data: TData, _wrappedKey?: string, rowId?: string | number) => {
				if (typeof data[key as keyof TData] === 'object' && this.shouldTraverse(property))
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
				} as MapperProperty<TData>)
			: anonymizedProperty
	}

	generate(
		key: string,
		property: MapperProperty<TData, AnonymizePropertyOptions<TData, RedactMethodOptions>>,
	) {
		const options = getMethodOptions(property)

		const replaceValue = options?.replaceValue || '*'
		const result = fuzzysort.go(key, this.redactMethods, { key: 'name', limit: 1 })
		if (key.length < this.minMatchKeyLength || result.length === 0)
			return (d: TData, _wrappedKey?: string, rowId?: string | number) =>
				`${unwrapValue(property, d, rowId)}`.replaceAll(/\w/g, replaceValue)
		return (d: TData) => result[0].obj.methodFactory(replaceValue)(d)
	}
}
