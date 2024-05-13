import { name as packageName } from '#package.json'
import { Fake } from '../../../src/lib/methods/fake'

describe(packageName, () => {
	describe('Fake', () => {
		let fake: Fake<any>
		beforeEach(() => {
			fake = new Fake(1)
		})

		const props = {
			prefix: { value: () => 'Mr.' },
			firstName: { value: () => 'John' },
			lastName: { value: () => 'Doe' },
			email: { value: () => 'exposed@example.com' },
			birthdate: { value: () => new Date(1990, 1, 1) },
		}

		it('should not be deterministic', () => {
			const email1 = fake.generate('email', props.email)({})
			const email2 = new Fake().generate('email', props.email)({})
			const email3 = new Fake().generate('email', props.email)({})

			expect(email1).not.toBe(email2)
			expect(email2).not.toBe(email3)
		})

		it('should generate a fake birthdate', () => {
			const birthdate = fake.generate('birthdate', props.birthdate)({})
			expect(birthdate).not.toBe(new Date(1990, 1, 1))
		})

		it('should generate a fake email', () => {
			const email = fake.generate('email', props.email)({})
			expect(email).toBe('Winifred.Watsica@gmail.com')
		})

		it('should fuzzy match properties', () => {
			const email = fake.generate('mail', props.email)({})
			expect(email).toBe('Winifred.Watsica@gmail.com')
		})

		it.each([
			['First_Name', 'Winifred'],
			['Last_Name', 'Watsica'],
			['Zip_Code', '03133'],
		])('should fuzzy match %s', (key, expected) => {
			expect(fake.generate(key, { value: () => key })({})).toBe(expected)
		})

		it('should use the provided value function if it exists', () => {
			const result = fake.generate('email', {
				value: () => 'test@example.com',
				options: {
					anonymize: {
						method: 'fake',
						options: {
							value: (faker) => faker.internet.email({ firstName: 'Jane', lastName: 'Doe' }),
						},
					},
				},
			})({})
			expect(result).toBe('Jane.Doe18@gmail.com')
		})

		it('should generate a random word for unmatched properties', () => {
			const result = fake.generate('other-property', { value: () => '12345678' })({})
			expect(result).toBe('enormous')
		})
	})
})
