import AnonymizePlugin from './lib/anonymize'
import withClassification from './lib/utils/withClassification'
import map from './lib/utils/map'

export type { AnonymizeOptions, AnonymizePropertyOptions } from './lib/types'
export type { MapperConfigWithClassification } from './lib/utils/withClassification'
export { withClassification, map }
export default AnonymizePlugin
