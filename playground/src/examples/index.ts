import example01 from './01-using-with-classification'
import example02 from './02-with-per-property-customizations'

export type Example = (seed?: number | string) => void

export default [example01, example02] as Example[]
