import { map, type MapperConfig } from '@fourlights/mapper'
import { AnonymizePlugin, withClassification } from '@fourlights/mapper-plugin-anonymize'
import { name as packageName } from '@fourlights/mapper-plugin-anonymize/package.json'

describe(`${packageName}`, () => {
  const testData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    dateOfBirth: '1990-01-01',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'Anystate',
      zipCode: '12345',
      country: 'Anyland',
    },
    socialSecurityNumber: '123-45-6789',
    creditCard: {
      number: '4111 1111 1111 1111',
      expiry: '12/27',
      ccv: '123',
      issuer: 'Some CC Issuer',
    },
  }

  it('should anonymize nested objects', () => {
    const config: MapperConfig<typeof testData> = {
      fullName: (d) => `${d.firstName} ${d.lastName}`,
      email: (d) => d.email,
      address: (d) => d.address,
      creditCard: (d) => d.creditCard,
    }

    const classifiedConfig = withClassification(config, {
      fullName: 'pii',
      email: 'pii',
      address: 'pii',
      creditCard: 'sensitive',
    })

    const result = map(testData, classifiedConfig, { plugins: [new AnonymizePlugin({ seed: 1 })] })

    expect(result).toEqual({
      fullName: 'Winifred Watsica',
      address: {
        street: 'Audrey Inlet',
        city: 'South Ezekielchester',
        state: 'Maryland',
        zipCode: '58436-5248',
        country: 'Cyprus',
      },
      creditCard: {
        ccv: '***',
        expiry: '**/**',
        number: '**** **** **** ****',
        issuer: '**** ** ******',
      },
      email: 'Winifred.Watsica@gmail.com',
    })
  })

  it('should anonymize only specific fields in nested objects', () => {
    const config: MapperConfig<typeof testData> = {
      fullName: (d) => `${d.firstName} ${d.lastName}`,
      email: (d) => d.email,
      address: (d) => d.address,
      creditCard: (d) => d.creditCard,
      creditCardAlt: (d) => d.creditCard,
    }

    const classifiedConfig = withClassification(config, {
      fullName: 'pii',
      email: 'pii',
      address: 'pii',
      creditCard: {
        number: 'sensitive',
        ccv: 'sensitive',
        expiry: 'sensitive',
      },
      creditCardAlt: [
        'sensitive',
        {
          issuer: 'public',
        },
      ],
    })

    const result = map(testData, classifiedConfig, { plugins: [new AnonymizePlugin({ seed: 1 })] })

    expect(result).toEqual({
      fullName: 'Winifred Watsica',
      address: {
        street: 'Audrey Inlet',
        city: 'South Ezekielchester',
        state: 'Maryland',
        zipCode: '58436-5248',
        country: 'Cyprus',
      },
      creditCard: {
        ccv: '***',
        expiry: '**/**',
        number: '**** **** **** ****',
        issuer: 'Some CC Issuer',
      },
      creditCardAlt: {
        ccv: '***',
        expiry: '**/**',
        number: '**** **** **** ****',
        issuer: 'Some CC Issuer',
      },
      email: 'Winifred.Watsica@gmail.com',
    })
  })
})
