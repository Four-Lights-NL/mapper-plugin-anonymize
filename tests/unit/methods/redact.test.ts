import { type MapperProperty } from '@fourlights/mapper'
import { name as packageName } from '@fourlights/mapper-plugin-anonymize/package.json'
import { Redact } from '@fourlights/mapper-plugin-anonymize/methods/redact'

describe(packageName, () => {
  describe('Redact', () => {
    it('should redact an email', () => {
      const redact = new Redact()
      const email = redact.generate('email', { value: () => 'exposed@example.com' })({})
      expect(email).toBe('*****@*****.com')
    })

    it('should fuzzy match an email property', () => {
      const redact = new Redact()
      const email = redact.generate('mail', { value: () => 'exposed@example.com' })({})
      expect(email).toBe('*****@*****.com')
    })

    it('should redact other properties', () => {
      const redact = new Redact()
      const email = redact.generate('other-property', { value: () => '12345678' })({})
      expect(email).toBe('********')
    })

    it('should redact an email with a custom replace value', () => {
      const redact = new Redact()
      const property = {
        value: () => 'exposed@example.com',
        options: { anonymize: { method: 'redact', options: { replaceValue: 'X' } } },
      } as MapperProperty<any>
      const email = redact.generate('email', property)({})
      expect(email).toBe('XXXXX@XXXXX.com')
    })

    it('should use the provided value function if it exists', () => {
      const result = new Redact().generate('using-redact-valuefn', {
        value: () => 'some value',
        options: {
          anonymize: {
            method: 'redact',
            options: {
              value: () => 'abcdef',
            },
          },
        },
      })({})

      expect(result).toBe('abcdef')
    })
  })
})
