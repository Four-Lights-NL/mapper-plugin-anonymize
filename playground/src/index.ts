import { examples } from './examples'

const seed = 69
examples.map((runExample, idx) => {
  console.log(`Example ${idx + 1}`)
  runExample(seed)
})
