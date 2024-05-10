import * as mapper from '@fourlights/mapper'
import { type MapperConfigWithClassification, withClassification } from './withClassification'
import { AnonymizePlugin } from '../anonymize'
import type { AnonymizeOptions } from '../types'

export function map<TData, TOptions>(
	data: TData,
	config: MapperConfigWithClassification<TData>,
	anonymizeOptions?: AnonymizeOptions<TData, TOptions>,
): Record<string | number, any> {
	return mapper.map(data, withClassification(config), {
		plugins: [new AnonymizePlugin(anonymizeOptions as AnonymizeOptions<unknown, unknown>)],
	})
}
