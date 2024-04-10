import type { MapperFn, MapperProperty } from '@fourlights/mapper'
import Fuse from 'fuse.js'
import type { AnonymizeMethod } from '../types'
import getMethodOptions from '../utils/getMethodOptions'

export type RedactMethodOptions = {
	key?: string
	replaceValue?: string
}

class Redact<T> implements AnonymizeMethod<T> {
	private readonly fuse: Fuse<{ name: string; method: any }>

	constructor() {
		const redactMethodsMap = [
			{
				name: 'email',
				method: (replaceValue) => () => `${replaceValue.repeat(5)}@${replaceValue.repeat(5)}.com`,
			},
		] as {
			name: string
			method: (replaceValue: string) => MapperFn<T>
		}[]

		/* Initialize fuzzy search */
		this.fuse = new Fuse(redactMethodsMap, { threshold: 0.3, keys: ['name'] })
	}

	generate(key: string, property: MapperProperty<T>) {
		const options = getMethodOptions<RedactMethodOptions>(property)
		const replaceValue = options?.replaceValue || '*'
		const result = this.fuse.search(key)
		if (result.length === 0) return (d: T) => `${property.value(d)}`.replaceAll(/./g, replaceValue)
		return result[0].item.method(replaceValue)
	}
}

export default Redact
