# @fourlights/mapper-plugin-anonymize

This package is a plugin for the [@fourlights/mapper](https://github.com/Four-Lights-NL/mapper) package. It allows you to anonymize PII and sensitive data during mapping.

## Installation

You can install this package using npm:

```bash
npm install @fourlights/mapper-plugin-anonymize
```

## Usage

In your mapper config, you supply data classification on each property that you want to anonymize. The plugin will then anonymize the data based on the classification.
By default, the plugin will fake `PII` data and redact `sensitive` data. But everything is configurable, both on the plugin level or on a property level.

```typescript
import type { MapperConfig } from '@fourlights/mapper'
import { map } from '@fourlights/mapper'

import type { AnonymizePluginPropertyOptions } from '@fourlights/mapper-plugin-anonymize'
import AnonymizePlugin from '@fourlights/mapper-plugin-anonymize'

const user = { firstName: 'John', lastName: 'Doe', birthday: new Date(1990, 1, 1) }
const config: MapperConfig<typeof user, AnonymizePluginPropertyOptions> = {
  firstName: { value: (data) => data.firstName, options: { classification: 'pii' } },
  lastName: { value: (data) => data.lastName, options: { classification: 'pii', anonymize: 'redact' } },
}

console.log(map(user, config, { plugins: [new AnonymizePlugin( { seed: 69 })] }))   // NOTE: The seed to get deterministic results, for example purposes
```

This will output:

```json5
{
  firstName: 'Vicki',
  lastName: '*****',
}
```

## Configuration

To Do. For now, please refer to the [source code](./src/lib/index.ts) for the available options.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request on [GitHub](https://github.com/Four-Lights-NL/mapper-plugin-anonymize).

## License

This package is licensed under the MIT license.
