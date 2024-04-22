import { map } from '@fourlights/mapper-plugin-anonymize'

export function example03() {
	const user = {
		firstName: 'John',
		lastName: 'Doe',
		birthday: new Date(1990, 1, 1),
		creditCard: '12357689',
		theme: 'blue',
	}

	console.log(
		map(user, {
			firstName: [(d) => d.firstName, 'pii'],
			lastName: [(d) => d.lastName, 'pii'],
			creditCard: [(d) => d.creditCard, 'sensitive'],
			birthday: [(d) => d.birthday, 'pii'],
			theme: (d) => d.theme,
		}),
	)
}
