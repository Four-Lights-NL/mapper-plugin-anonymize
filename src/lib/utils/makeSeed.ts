export function makeSeed(seed: string | number): number {
  return typeof seed === 'string'
    ? seed
        .split('')
        .map((char) => char.charCodeAt(0))
        .reduce((acc, cur, idx) => acc + (cur << idx), 0)
    : seed
}
