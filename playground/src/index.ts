import type { MapperConfig } from '@fourlights/mapper'
import { map } from '@fourlights/mapper'
import { differenceInYears, formatISO } from 'date-fns'

import type { AnonymizePluginPropertyOptions } from '@fourlights/mapper-plugin-anonymize'
import AnonymizePlugin from '@fourlights/mapper-plugin-anonymize'

const user = { firstName: 'John', lastName: 'Doe', birthday: new Date(1990, 1, 1) }
const config: MapperConfig<typeof user> = {
  name: { value: (data) => `${data.firstName} ${data.lastName}`, options: { classification: 'pii', key: () => 'fullName' } as AnonymizePluginPropertyOptions},
  birthday: { value: (data) => formatISO(data.birthday, { representation: 'date' }), options: { classification: 'pii', anonymize: 'redact' } as AnonymizePluginPropertyOptions},
  age: (data) => differenceInYears(new Date(), data.birthday),
}

console.log(map(user, config, { plugins: [new AnonymizePlugin()] }))
