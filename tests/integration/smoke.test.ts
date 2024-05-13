import { name as packageName } from '#package.json'

import { map, type MapperConfigWithClassification } from '@fourlights/mapper-plugin-anonymize'

describe(packageName, () => {
	it('should map data', () => {
		const user = { firstName: 'John', lastName: 'Doe', birthdate: new Date(1999, 5, 1) }
		const config = {
			fullName: [(d) => `${d.firstName} ${d.lastName}`, 'pii'],
			birthdate: [(d) => d.birthdate.toLocaleDateString('en'), 'sensitive'],
		} as MapperConfigWithClassification<typeof user>

		expect(map(user, config, { seed: 1 })).toStrictEqual({
			fullName: 'Winifred Watsica',
			birthdate: '*/*/****',
		})
	})
})
