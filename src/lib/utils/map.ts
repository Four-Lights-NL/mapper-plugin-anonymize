import * as mapper from '@fourlights/mapper'
import withClassification from './withClassification'
import type { MapperConfigWithClassification } from './withClassification'
import AnonymizePlugin from '../anonymize'
import type { AnonymizeOptions } from '../types'

function map<T>(
	data: T,
	config: MapperConfigWithClassification<T>,
	anonymizeOptions?: AnonymizeOptions,
): Record<string | number, any> {
	return mapper.map(data, withClassification(config), {
		plugins: [new AnonymizePlugin(anonymizeOptions)],
	})
}

export default map
