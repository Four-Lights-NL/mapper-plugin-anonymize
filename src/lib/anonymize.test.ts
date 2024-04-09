import { name as packageName } from '#package.json'
import { map, MapperConfig } from '@fourlights/mapper'
import AnonymizePlugin from './anonymize'
import { AnonymizePluginPropertyOptions } from './types'

describe(packageName, () => {
  it('should not anonymize properties without classification', () => {
    const input = { a: 'hello', b: 'world!' }
    const expected = { a: 'hello', b: 'world!' }
    const config = {
      a: (d) => d.a,
      b: (d) => d.b
    } as MapperConfig<typeof input>

    expect(map(input, config)).toEqual(expected)
  })

  it('should redact properties with a classification', () => {
    const plugin = new AnonymizePlugin({ seed: 1, piiData: 'redact' })
    const input = { email: 'exposed@example.com' }
    const expected = { email: '*****@*****.com' }
    const config = {
      email: {
        value: (d) => d.email,
        options: { classification: 'pii' } as AnonymizePluginPropertyOptions
      }
    } as MapperConfig<typeof input>

    expect(map(input, config, { plugins: [plugin] })).toEqual(expected)
  })

  it('should fake properties with a classification', () => {
    const plugin = new AnonymizePlugin({ seed: 1, piiData: 'fake' })
    const input = { email: 'exposed@example.com' }
    const expected = { email: 'Winifred.Watsica99@gmail.com' }
    const config = {
      email: {
        value: (d) => d.email,
        options: { classification: 'pii' } as AnonymizePluginPropertyOptions
      }
    } as MapperConfig<typeof input>

    expect(map(input, config, { plugins: [plugin] })).toEqual(expected)
  })
})
