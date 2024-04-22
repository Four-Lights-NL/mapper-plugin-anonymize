import { example01 } from './01-using-with-classification'
import { example02 } from './02-with-per-property-customizations'
import { example03 } from './03-with-plugin-map-function'

export type Example = (seed?: number | string) => void
export const examples = [example01, example02, example03] as Example[]
