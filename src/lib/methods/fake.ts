import { en, Faker } from '@faker-js/faker'
import type { MapperFn, MapperProperty } from '@fourlights/mapper'
import type { AnonymizeMethod } from '../types'
import getMethodOptions from '../utils/getMethodOptions'
import fuzzysort from 'fuzzysort'
import makeSeed from '../utils/makeSeed'

export type FakeMethodOptions = {
	seed?: number | string
	key?: string
}

const getMethods = <T>(obj: T) =>
	Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
		.filter((name) => name !== 'constructor' && typeof obj[name as keyof T] === 'function')
		.map((name) => name as keyof T)

class Fake<T> implements AnonymizeMethod<T> {
	private readonly specialFakerMethods: { name: string; method: any }[] = []
	private readonly faker: Faker

	constructor(seed?: number | string) {
		this.faker = new Faker({ locale: [en] })
		if (seed) this.faker.seed(makeSeed(seed))

		this.specialFakerMethods = this.fakerMethodsMap()
	}

	generate(key: string, property: MapperProperty<T>) {
		const options = getMethodOptions<FakeMethodOptions>(property)
		if (options?.seed) this.faker.seed(makeSeed(options.seed))
		if (options?.key) key = options.key

		const result = fuzzysort.go(key, this.specialFakerMethods, { key: 'name' })
		if (result.length === 0) {
			console.log(
				`No match found for key \`${key}\`. Consider adding it. Using random adjective as fallback`,
			)
			return (d: T) => this.faker.word.adjective({ length: property.value(d).length })
		}
		return result[0].obj.method
	}

	private fakerModuleMethodsMap<T>(
		module: keyof typeof this.faker,
		overrides: Partial<Record<keyof T, any>> = {},
	) {
		const fakerModuleMethodsMap = getMethods(this.faker[module]).reduce(
			(acc, name) => ({ ...acc, [name]: this.faker[module][name] }),
			{} as Record<keyof T, any>,
		)

		/* Apply overrides */
		Object.keys(overrides)
			.map((key) => key as keyof T)
			.forEach((key) => {
				fakerModuleMethodsMap[key] = () => overrides[key]
			})

		return fakerModuleMethodsMap
	}

	private fakerMethodsMap() {
		const sex = this.faker.person.sexType()
		const firstName = this.faker.person.firstName(sex)
		const lastName = this.faker.person.lastName()
		const fullName = this.faker.person.fullName({ firstName, lastName })
		const email = this.faker.internet.email({ firstName, lastName })

		/* Combine all methods */
		const fakerMethodsMap = Object.entries({
			...this.fakerModuleMethodsMap('person', { firstName, lastName, fullName, sex }),
			...this.fakerModuleMethodsMap('internet', { email }),
			...this.fakerModuleMethodsMap('location'),
			...this.fakerModuleMethodsMap('phone'),
		}).reduce(
			(acc, [name, method]) => acc.concat([{ name, method }]),
			[] as { name: string; method: MapperFn<T> }[],
		)

		return fakerMethodsMap
	}
}

export default Fake
