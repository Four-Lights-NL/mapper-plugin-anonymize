import uFuzzy from '@leeoniya/ufuzzy'

import type { MapperFn, MapperProperty } from '@fourlights/mapper'

import type { AnonymizeMethodFactory, AnonymizePropertyOptions } from '../types'
import { getMethodOptions } from '../utils/getMethodOptions'
import { unwrapValue } from '../utils/unwrapValue'

export type RedactValueFn<TData> = (
  redact: MapperFn<TData>,
  data: TData,
  outerKey?: string,
  innerKey?: string | number,
) => any
export type RedactMethodOptions<TData> = {
  key?: string
  replaceValue?: string
  value?: RedactValueFn<TData>
  traverse?: boolean
}

export class Redact<TData>
  implements
    AnonymizeMethodFactory<TData, AnonymizePropertyOptions<TData, RedactMethodOptions<TData>>>
{
  private readonly redactMethods: {
    name: string
    methodFactory: (replaceValue: string) => MapperFn<TData>
  }[] = []
  private readonly minMatchKeyLength = 2

  constructor() {
    this.redactMethods = [
      {
        name: 'email',
        methodFactory: (replaceValue) => () =>
          `${replaceValue.repeat(5)}@${replaceValue.repeat(5)}.com`,
      },
    ]
  }

  generate(
    key: string,
    property: MapperProperty<TData, AnonymizePropertyOptions<TData, RedactMethodOptions<TData>>>,
  ) {
    const options = getMethodOptions(property)

    const replaceValue = options?.replaceValue || '*'
    const replaceFn = (d: TData, outerKey?: string, innerKey?: string | number) =>
      `${unwrapValue(property, d, innerKey)}`.replaceAll(/\w/g, replaceValue)

    if (options?.value)
      return (data: TData, outerKey?: string, innerKey?: string | number) =>
        options.value!(replaceFn, data, outerKey, innerKey)

    const [idxs, info, order] = new uFuzzy().search(
      this.redactMethods.map((m) => m.name),
      key,
    )
    if (key.length < this.minMatchKeyLength || idxs?.length === 0) return replaceFn
    return (d: TData) => this.redactMethods[info!.idx[order![0]]].methodFactory(replaceValue)(d)
  }
}
