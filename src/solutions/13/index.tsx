import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { product, sum } from '../util'

const parseInput = () =>
  input
    .split('\n\n')
    .map((pairs) => pairs.split('\n').map((line) => JSON.parse(line)))

const compare = (a: any[], b: any[]): number => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    let left = a[i]
    let right = b[i]
    const isLeftNumber = typeof left === 'number'
    const isRightNumber = typeof right === 'number'
    if (isLeftNumber && isRightNumber) {
      if (left === right) continue
      return left < right ? -1 : 1
    }
    left = isLeftNumber ? [left] : left
    right = isRightNumber ? [right] : right
    const result = compare(left, right)
    if (result !== 0) return result
  }
  if (a.length === b.length) return 0
  return a.length < b.length ? -1 : 1
}

export const Part1 = () => {
  const packets = parseInput()
  const result = packets
    .map(([left, right], i) => ({
      i: i + 1,
      sort: compare(left, right)
    }))
    .filter(({ sort }) => sort === -1)
    .map(({ i }) => i)
    .reduce(sum)
  return (
    <p>
      The sum of the sorted indices is <Answer>{result}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const packets = [...parseInput().flat(), [[2]], [[6]]].sort(compare)
  const decoderKey = ['[[2]]', '[[6]]']
    .map((json) => packets.findIndex((p) => JSON.stringify(p) === json) + 1)
    .reduce(product)
  return (
    <p>
      The decoder key of the distress signal is <Answer>{decoderKey}</Answer>.
    </p>
  )
}
