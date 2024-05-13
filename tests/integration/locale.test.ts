import { name as packageName } from '#package.json'

import { map, type MapperConfigWithClassification } from '@fourlights/mapper-plugin-anonymize'
import { nl } from '@faker-js/faker'

describe(packageName, () => {
	it('should use locale', () => {
		const user = { firstName: 'John', lastName: 'Doe', birthdate: new Date(1999, 5, 1) }
		const config = {
			fullName: [(d) => `${d.firstName} ${d.lastName}`, 'pii'],
			birthdate: [(d) => d.birthdate.toLocaleDateString('en'), 'sensitive'],
		} as MapperConfigWithClassification<typeof user>

		expect(map(user, config, { seed: 1, locale: [nl] })).toStrictEqual({
			fullName: 'Mila Vink Jr.',
			birthdate: '*/*/****',
		})
	})
})
