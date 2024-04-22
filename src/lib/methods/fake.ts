import { en, Faker } from '@faker-js/faker'
import type { MapperFn, MapperProperty } from '@fourlights/mapper'
import type { AnonymizeMethodFactory } from '../types'
import fuzzysort from 'fuzzysort'
import { getMethodOptions } from '../utils/getMethodOptions'
import { makeSeed } from '../utils/makeSeed'
import { unwrapValue } from '../utils/unwrapValue'
import { getMethods } from '../utils/getMethods'

export type FakeMethodOptions = {
	seed?: number | string
	key?: string
	traverse?: boolean
}

export class Fake<T> implements AnonymizeMethodFactory<T> {
	private readonly specialFakerMethods: { name: string; method: any }[] = []
	private readonly faker: Faker
	private readonly minMatchKeyLength = 2

	constructor(seed?: number | string) {
		this.faker = new Faker({ locale: [en] })
		if (seed) this.faker.seed(makeSeed(seed))

		this.specialFakerMethods = this.fakerMethodsMap()
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
			birthdate: () => this.faker.date.birthdate(),
		}).reduce(
			(acc, [name, method]) => acc.concat([{ name, method }]),
			[] as { name: string; method: MapperFn<T> }[],
		)

		return fakerMethodsMap
	}

	private shouldTraverse(property: MapperProperty<T>) {
		const options = getMethodOptions<FakeMethodOptions>(property)
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
		const options = getMethodOptions<FakeMethodOptions>(property)

		if (options?.seed) this.faker.seed(makeSeed(options.seed))
		if (options?.key) key = options.key

		const result = fuzzysort.go(key, this.specialFakerMethods, {
			key: 'name',
			limit: 1,
		})

		if (result.length === 0) {
			console.log(
				`No match found for key \`${key}\`. Consider adding it. Using random adjective as fallback`,
			)
		}
		return key.length < this.minMatchKeyLength || result.length === 0
			? (d: T, _wrappedKey?: string, rowId?: string | number) =>
					this.faker.word.adjective({ length: unwrapValue(property, d, rowId).length })
			: (_: T) => result[0].obj.method()
	}
}
