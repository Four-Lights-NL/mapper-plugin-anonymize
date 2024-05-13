import { map, type Faker } from '@fourlights/mapper-plugin-anonymize'

export function example03() {
	const user = {
		firstName: 'John',
		lastName: 'Doe',
		birthdate: new Date(1990, 1, 1),
		creditCard: '12357689',
		theme: 'blue',
	}

	console.log(
		map<typeof user>(user, {
			firstName: [(d) => d.firstName, 'pii'],
			lastName: [(d) => d.lastName, 'pii'],
			creditCard: [
				(d) => d.creditCard,
				'sensitive',
				(faker: Faker) => faker.finance.creditCardNumber(),
			],
			birthdate: [(d) => d.birthdate, 'pii'],
			theme: (d) => d.theme,
		}),
	)
}
