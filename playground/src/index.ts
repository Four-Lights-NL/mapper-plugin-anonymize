import type { MapperConfig } from '@fourlights/mapper'
import { map } from '@fourlights/mapper'
import { differenceInYears, formatISO } from 'date-fns'

import type { AnonymizePluginPropertyOptions } from '@fourlights/mapper-plugin-anonymize'
import AnonymizePlugin from '@fourlights/mapper-plugin-anonymize'

const user = { firstName: 'John', lastName: 'Doe', birthday: new Date(1990, 1, 1) }
const config: MapperConfig<typeof user, AnonymizePluginPropertyOptions> = {
	firstName: { value: (data) => data.firstName, options: { classification: 'pii' } },
	lastName: { value: (data) => data.lastName, options: { classification: 'pii' } },
	name: {
		value: (data) => `${data.firstName} ${data.lastName}`,
		options: { classification: 'pii', anonymize: { method: 'fake', options: { key: 'fullName' } } },
	},
	birthday: {
		value: (data) => formatISO(data.birthday, { representation: 'date' }),
		options: { classification: 'pii', anonymize: 'redact' },
	},
	age: (data) => differenceInYears(new Date(), data.birthday),
}

console.log(map(user, config, { plugins: [new AnonymizePlugin({ seed: 69 })] }))
