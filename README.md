# @fourlights/mapper-plugin-anonymize

This package is a plugin for the [@fourlights/mapper](https://github.com/Four-Lights-NL/mapper) package. It allows you to anonymize PII and sensitive data during mapping.
This can be helpful during testing or when implementing Role-Based Access Control (RBAC).

Essentially it helps to convert something like this:

```json5
{
  firstName: 'Jane',
  lastName: 'Doe',
  birthdate: '1990-05-31T22:00:00.000Z',
  theme: 'blue',
  creditCard: {
    number: '6271701225979642',
    issuer: 'Cabal',
    expiryDate: '03/2026',
    countryCode: 'AR',
  },
}
```

to this:

```json5
{
  firstName: 'Patty', // replaced by fake name
  lastName: 'Blanda', // replaced by fake name
  birthdate: '1988-03-11T17:04:00.000Z', // replaced by fake date
  theme: 'blue', // kept intact
  creditCard: {
    // redacted
    number: '****************',
    issuer: '*****',
    expiryDate: '**/****',
    countryCode: '**',
  },
}
```

In code, the above example is:

```typescript
import { map } from '@fourlights/mapper-plugin-anonymize'

const input = {
  firstName: 'Jane',
  lastName: 'Doe',
  birthdate: new Date(1990, 5, 1),
  theme: 'blue',
  creditCard: {
    number: '6271701225979642',
    issuer: 'Cabal',
    expiryDate: '03/2026',
    countryCode: 'AR',
  },
}

console.log(
  map(user, {
    firstName: [(d) => d.firstName, 'pii'],
    lastName: [(d) => d.lastName, 'pii'],
    creditCard: [(d) => d.creditCard, 'sensitive'],
    birthdate: [(d) => d.birthdate, 'pii'],
    theme: (d) => d.theme,
  }),
)
```

## Installation

```bash
npm install @fourlights/mapper
npm install @fourlights/mapper-plugin-anonymize
```

## Usage

### Quick example

```typescript
import { map } from '@fourlights/mapper-plugin-anonymize'

const user = {
  firstName: 'John',
  lastName: 'Doe',
  birthdate: new Date(1990, 1, 1),
  creditCard: '12357689',
  theme: 'blue',
}
console.log(
  map(user, {
    firstName: [(d) => d.firstName, 'pii'],
    lastName: [(d) => d.lastName, 'pii'],
    creditCard: [(d) => d.creditCard, 'sensitive'],
    birthdate: [(d) => d.birthdate, 'pii'],
    theme: (d) => d.theme,
  }),
)
```

outputs

```json5
{
  firstName: 'Patty',
  lastName: 'Blanda',
  creditCard: '********',
  birthDate: 'Date(1999, 5, 11)',
  theme: 'blue',
}
```

In your mapper config, you supply data classification on each property that you want to anonymize. The plugin will then anonymize the data based on the classification.
By default, the plugin will fake `PII` data and redact `sensitive` data. But everything is configurable, both on the plugin level or on a property level.

```typescript
import { map, type MapperConfig } from '@fourlights/mapper'
import {
  AnonymizePlugin,
  type AnonymizePluginPropertyOptions,
} from '@fourlights/mapper-plugin-anonymize'

const user = { firstName: 'John', lastName: 'Doe', birthdate: new Date(1990, 1, 1) }
const config: MapperConfig<typeof user, AnonymizePluginPropertyOptions> = {
  firstName: { value: (data) => data.firstName, options: { classification: 'pii' } },
  lastName: {
    value: (data) => data.lastName,
    options: { classification: 'pii', anonymize: 'redact' },
  },
}

console.log(map(user, config, { plugins: [new AnonymizePlugin({ seed: 69 })] })) // NOTE: The seed to get deterministic results, for example purposes
```

This will output:

```json5
{
  firstName: 'Vicki',
  lastName: '*****',
}
```

## Configuration

The plugin can be configured with the following options:

- `seed` `(number)`: The seed to use for the random generator. This is useful for deterministic results. Default: `undefined`.
- `piiData` `('fake' | 'redact' | 'none' | (key: string, property: MapperProperty<T>) => MapperFn<T>`): The method to use for anonymizing PII data. Default: `'fake'`. `fake` and `redact` are built-in methods. You can also supply your own method factory.
- `sensitiveData` `('fake' | 'redact' | 'none' | (key: string, property: MapperProperty<T>) => MapperFn<T>`): The method to use for anonymizing sensitive data. Default: `'redact'`. `fake` and `redact` are built-in methods. You can also supply your own method factory.

These options can also be set (or overridden) on a property level by supplying the `options.anonymize` property.
Note that `piiData` and `sensitiveData` also accept an object to override the built-in method configuration (see next example), which can also be provided on a property level.

```typescript
const config = {
  firstName: {
    value: (data) => data.firstName,
    options: {
      classification: 'pii',
      // Use a built-in method
      anonymize: 'fake', // 'redact' | 'none'
    },
  },
  lastName: {
    value: (data) => data.lastName,
    options: {
      classification: 'pii',
      /* You can use an object to override the built-in method configuration */
      anonymize: {
        method: 'redact',
        options: { redactValue: 'X' }, // e.g. 'XXXXXX' instead of '******'
      },
    },
  },
}
```

#### Helper methods for augmenting your mapper config

You can use the `withClassification` method to easily add (sparse) classifications to your (short and long-form) properties.

```typescript
import { map } from '@fourlights/mapper'
import {
  AnonymizePlugin,
  withClassification,
  type MapperConfigWithClassification,
} from '@fourlights/mapper-plugin-anonymize'

const user = {} // see example above
const config = {
  name: [(d) => d.name, 'pii'], // inline data classification
  birthdate: (d) => d.birthdate,
  theme: (d) => d.theme,
} as MapperConfigWithClassification<typeof user>

map(user, withClassification(config), { plugins: [new AnonymizePlugin()] })

// or, when providing additional properties
map(user, withClassification(config, { birthdate: 'sensitive' }), {
  plugins: [new AnonymizePlugin()],
})
```

#### Super simple anonymized mapping

When using the exported map function directly from this plugin instead of the one from `@fourlights/mapper`, you can omit some boilerplate:

```typescript
import { map } from '@fourlights/mapper-plugin-anonymize'

map(user, { name: [(d) => d.name, 'pii'], birthdate: (d) => d.birthdate })
```

which is equivalent to

```typescript
import { map } from '@fourlights/mapper'
import { AnonymizePlugin, withClassification } from '@fourlights/mapper-plugin-anonymize'

map(user, withClassification({ name: [(d) => d.name, 'pii'], birthdate: (d) => d.birthdate }), {
  plugins: [new AnonymizePlugin()],
})
```

## Contributing

Contributions are welcome. Please open an issue or submit a pull request on [GitHub](https://github.com/Four-Lights-NL/mapper-plugin-anonymize).

## License

This package is licensed under the MIT license.
