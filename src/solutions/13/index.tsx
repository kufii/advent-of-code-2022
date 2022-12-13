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
    const left = a[i]
    const right = b[i]
    const isLeftNumber = typeof left === 'number'
    const isRightNumber = typeof right === 'number'
    const result =
      isLeftNumber && isRightNumber
        ? left - right
        : compare(isLeftNumber ? [left] : left, isRightNumber ? [right] : right)
    if (result !== 0) return result
  }
  return a.length - b.length
}

export const Part1 = () => {
  const packets = parseInput()
  const result = packets
    .map(([left, right], i) => (compare(left, right) < 0 ? i + 1 : 0))
    .reduce(sum)
  return (
    <p>
      The sum of the sorted indices is <Answer>{result}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const dividers = [[[2]], [[6]]]
  const packets = [...parseInput().flat(), ...dividers].sort(compare)
  const decoderKey = dividers.map((d) => packets.indexOf(d) + 1).reduce(product)
  return (
    <p>
      The decoder key of the distress signal is <Answer>{decoderKey}</Answer>.
    </p>
  )
}
