import { name as packageName } from '#package.json'
import Fake from './fake'

describe(packageName, () => {
  describe('Fake', () => {
    let fake: Fake<any>
    beforeEach(() => {
      fake = new Fake(1)
    })

    const props = {
      email: {
        value: () => 'exposed@example.com'
      }
    }

    it('should not be deterministic', () => {
      const email1 = fake.generate('email', props.email)()
      const email2 = new Fake().generate('email', props.email)()
      const email3 = new Fake().generate('email', props.email)()

      expect(email1).not.toBe(email2)
      expect(email2).not.toBe(email3)
    })

    it('should generate a fake email', () => {
      const fake = new Fake(1) // Seed is fixated to make tests deterministic
      const email = fake.generate('email', props.email)()
      expect(email).toBe('Winifred.Watsica99@gmail.com')
    })

    it('should fuzzy match properties', () => {
      const fake = new Fake(1) // Seed is fixated to make tests deterministic
      const email = fake.generate('mail', props.email)()
      expect(email).toBe('Winifred.Watsica99@gmail.com')
    })

    it('should generate a random word for unmatched properties', () => {
      const result = fake.generate('other-property', { value: () => '12345678' })()
      expect(result).toBe("creative")
    })
  })
})
