import { differenceInYears, formatISO } from 'date-fns'

import { map, type MapperConfig } from '@fourlights/mapper'
import { AnonymizePlugin, type AnonymizePropertyOptions } from '@fourlights/mapper-plugin-anonymize'

import { user } from './input'

export function example02(seed?: string | number) {
	const config: MapperConfig<typeof user, AnonymizePropertyOptions> = {
		firstName: { value: (data) => data.firstName, options: { classification: 'pii' } },
		lastName: { value: (data) => data.lastName, options: { classification: 'pii' } },
		name: {
			value: (data) => `${data.firstName} ${data.lastName}`,
			options: {
				classification: 'pii',
				anonymize: { method: 'fake', options: { key: 'fullName' } },
			},
		},
		birthdate: {
			value: (data) => formatISO(data.birthdate, { representation: 'date' }),
			options: { classification: 'pii', anonymize: 'redact' },
		},
		age: (data) => differenceInYears(new Date(), data.birthdate),
	}

	console.log(map(user, config, { plugins: [new AnonymizePlugin({ seed })] }))
}
