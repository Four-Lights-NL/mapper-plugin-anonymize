import { en, Faker, type LocaleDefinition } from '@faker-js/faker'
import uFuzzy from '@leeoniya/ufuzzy'

import type { MapperFn, MapperProperty } from '@fourlights/mapper'
import { isPlainObject } from '@fourlights/mapper/utils'

import type { AnonymizeMethodFactory, AnonymizePropertyOptions } from '../types'
import { getMethodOptions } from '../utils/getMethodOptions'
import { makeSeed } from '../utils/makeSeed'
import { unwrapValue } from '../utils/unwrapValue'
import { getMethods } from '../utils/getMethods'

export type FakeValueFn<TData> = (
	faker: Faker,
	data: TData,
	outerKey?: string,
	innerKey?: string | number,
) => any
export type FakeMethodOptions<TData> = {
	seed?: number | string
	key?: string
	value?: FakeValueFn<TData>
	traverse?: boolean
}

export class Fake<TData>
	implements
		AnonymizeMethodFactory<TData, AnonymizePropertyOptions<TData, FakeMethodOptions<TData>>>
{
	private readonly specialFakerMethods: { name: string; method: any }[] = []
	private readonly faker: Faker
	private readonly minMatchKeyLength = 2

	constructor(seed?: number | string, locale?: LocaleDefinition | LocaleDefinition[]) {
		locale ??= [en]
		this.faker = new Faker({ locale })
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
		return Object.entries({
			...this.fakerModuleMethodsMap('person', { firstName, lastName, fullName, sex }),
			...this.fakerModuleMethodsMap('internet', { email }),
			...this.fakerModuleMethodsMap('location'),
			...this.fakerModuleMethodsMap('phone'),
			birthdate: () => this.faker.date.birthdate(),
		}).reduce(
			(acc, [name, method]) => acc.concat([{ name, method }]),
			[] as { name: string; method: MapperFn<TData> }[],
		)
	}

	private shouldTraverse(
		property: MapperProperty<TData, AnonymizePropertyOptions<TData, FakeMethodOptions<TData>>>,
	) {
		const options = getMethodOptions(property)
		return options?.traverse ?? true
	}

	anonymize(
		key: string,
		property: MapperProperty<TData, AnonymizePropertyOptions<TData, FakeMethodOptions<TData>>>,
	) {
		const anonymizedProperty: MapperProperty<TData> = {
			value: (data: TData, _wrappedKey?: string, rowId?: string | number) => {
				if (isPlainObject(data[key as keyof TData]) && this.shouldTraverse(property))
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
		property: MapperProperty<TData, AnonymizePropertyOptions<TData, FakeMethodOptions<TData>>>,
	) {
		const options = getMethodOptions(property)

		if (options?.seed) this.faker.seed(makeSeed(options.seed))
		if (options?.key) key = options.key
		if (options?.value)
			return (data: TData, outerKey?: string, innerKey?: string | number) =>
				options.value!(this.faker, data, outerKey, innerKey)

		const [idxs, info, order] = new uFuzzy().search(
			this.specialFakerMethods.map((m) => m.name),
			key,
		)

		if (idxs?.length === 0) {
			console.log(
				`No match found for key \`${key}\`. Consider adding it. Using random adjective as fallback`,
			)
		}
		return key.length < this.minMatchKeyLength || idxs?.length === 0
			? (d: TData, _outerKey?: string, innerKey?: string | number) =>
					this.faker.word.adjective({ length: unwrapValue(property, d, innerKey).length })
			: (_: TData) => this.specialFakerMethods[info!.idx[order![0]]].method()
	}
}
