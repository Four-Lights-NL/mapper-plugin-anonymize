import type { MapperFn, MapperProperty } from '@fourlights/mapper'
import Fuse from 'fuse.js'
import type { AnonymizeMethod } from '../types'

class Redact<T> implements AnonymizeMethod<T> {
	private readonly fuse: Fuse<{ name: string; method: any }>

	constructor() {
		const redactMethodsMap = [{ name: 'email', method: () => '*****@*****.com' }] as {
			name: string
			method: MapperFn<T>
		}[]

		/* Initialize fuzzy search */
		this.fuse = new Fuse(redactMethodsMap, { threshold: 0.3, keys: ['name'] })
	}

	generate(key: string, property: MapperProperty<T>) {
		const result = this.fuse.search(key)
		if (result.length === 0) return (d: T) => `${property.value(d)}`.replaceAll(/./g, '*')
		return result[0].item.method
	}
}

export default Redact
