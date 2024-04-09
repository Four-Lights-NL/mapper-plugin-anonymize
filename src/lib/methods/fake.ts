import Fuse from 'fuse.js'
import { en, Faker } from '@faker-js/faker'
import type { MapperFn, MapperProperty } from '@fourlights/mapper'
import type { AnonymizeMethod } from '../types'

const getMethods = <T>(obj: T) =>
	Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
		.filter((name) => name !== 'constructor' && typeof obj[name as keyof T] === 'function')
		.map((name) => name as keyof T)

class Fake<T> implements AnonymizeMethod<T> {
	private readonly fuse: Fuse<{ name: string; method: any }>
  private readonly faker: Faker

	constructor(seed?: number) {
    this.faker = new Faker({ locale: [en] })
		if (seed) this.faker.seed(seed)

		this.fuse = new Fuse(this.fakerMethodsMap(), { threshold: 0.3, keys: ['name'] })
	}

	generate(key: string, property: MapperProperty<T>) {
		const result = this.fuse.search(key)
		if (result.length === 0) {
			console.log(`No match found for key \`${key}\`. Consider adding it. Using random adjective as fallback`)
			return (d: T) => this.faker.word.adjective({ length: property.value(d).length })
		}
		return result[0].item.method
	}

  private fakerModuleMethodsMap<T>(module: keyof typeof this.faker, overrides: Partial<Record<keyof T, any>> = {}) {
    const fakerModuleMethodsMap = getMethods(this.faker[module]).reduce(
      (acc, name) => ({ ...acc, [name]: this.faker[module][name] }),
      {} as Record<keyof T, any>,
    )

    /* Apply overrides */
    Object
      .keys(overrides)
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
    const email = this.faker.internet.email({ firstName, lastName })

    /* Combine all methods */
    const fakerMethodsMap = Object.entries({
      ...this.fakerModuleMethodsMap('person', { firstName, lastName, sex }),
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
