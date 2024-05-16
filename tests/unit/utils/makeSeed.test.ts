import { name as packageName } from '@fourlights/mapper-plugin-anonymize/package.json'
import { makeSeed } from '@fourlights/mapper-plugin-anonymize/utils/makeSeed'

describe(packageName, () => {
  describe('utils', () => {
    describe('makeSeed', () => {
      it('should return a deterministic number', () => {
        expect(makeSeed(1)).toBe(1)
        expect(makeSeed(1337)).toBe(1337)
        expect(makeSeed(1337)).toBe(1337)
        expect(makeSeed(1)).toBe(1)
      })

      it('should return a number when provided with a string', () => {
        expect(makeSeed('hello world')).toBe(213106)
        expect(makeSeed('some other seed')).toBe(3258381)
        expect(makeSeed('a super special long seed')).toBe(3332240693)
      })
    })
  })
})
