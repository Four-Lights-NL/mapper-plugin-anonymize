import * as mapper from '@fourlights/mapper'
import { type MapperConfigWithClassification, withClassification } from './withClassification'
import { AnonymizePlugin } from '../anonymize'
import type { AnonymizeOptions } from '../types'

export function map<TData, TOptions extends {} = {}>(
  data: TData,
  config: MapperConfigWithClassification<TData, TOptions>,
  anonymizeOptions?: AnonymizeOptions<TData, TOptions>,
): Record<string | number, any> {
  return mapper.map(data, withClassification<TData>(config), {
    plugins: [new AnonymizePlugin(anonymizeOptions as AnonymizeOptions<unknown, unknown>)],
  })
}
