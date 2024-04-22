import { example01 } from './01-using-with-classification'
import { example02 } from './02-with-per-property-customizations'

export type Example = (seed?: number | string) => void
export const examples = [example01, example02] as Example[]
export { example01, example02 }
