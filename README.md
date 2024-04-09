# @fourlights/mapper-plugin-anonymize

This package is a plugin for the [@fourlights/mapper](https://github.com/Four-Lights-NL/mapper) package. It allows you to anonymize PII and sensitive data during mapping.

## Installation

You can install this package using npm:

```bash
npm install @fourlights/mapper-plugin-anonymize
```

## Usage

```typescript
import mapper from '@fourlights/mapper'
import AnonymizePlugin from '@fourlights/mapper-plugin-anonymize'

const user = { firstName: 'John', lastName: 'Doe', birthday: new Date(1990, 1, 1) }
const config: MapperConfig<typeof user> = {
	name: { value: (data) => `${data.firstName} ${data.lastName}`, classification: 'pii' },
	birthday: { value: (data) => data.birthday, classification: 'pii', anonymize: 'redact' },
	age: (data) => differenceInYears(new Date(), data.birthday),
}

console.log(mapper.map(user, config, { plugins: [new AnonymizePlugin()] }))
```

This will output (well, a random name obviously):

```json5
{
	name: 'Some other name',
	birthday: '********',
	age: 33,
}
```

## Configuration

TODO

## Contributing

Contributions are welcome. Please open an issue or submit a pull request on [GitHub](https://github.com/Four-Lights-NL/mapper-plugin-anonymize).

## License

This package is licensed under the MIT license.
