import * as mapper from '@fourlights/mapper'
import { type MapperConfigWithClassification, withClassification } from './withClassification'
import { AnonymizePlugin } from '../anonymize'
import type { AnonymizeOptions } from '../types'

export function map<T>(
	data: T,
	config: MapperConfigWithClassification<T>,
	anonymizeOptions?: AnonymizeOptions,
): Record<string | number, any> {
	return mapper.map(data, withClassification(config), {
		plugins: [new AnonymizePlugin(anonymizeOptions)],
	})
}
