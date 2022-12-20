import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { insertAt, mod, nTimes, removeAt, sum } from '../util'

const parseInput = () => input.split('\n').map(Number)

const mix = (arr: number[], decryptionKey = 1, times = 1) => {
  const mixed = arr.map((n) => ({ n: n * decryptionKey }))
  const og = mixed.slice()
  nTimes(times, () => {
    for (const item of og) {
      if (item.n === 0) continue
      const index = mixed.indexOf(item)
      removeAt(mixed, index)
      const newIndex = mod(index + item.n, mixed.length)
      if (newIndex === 0) mixed.push(item)
      else insertAt(mixed, newIndex, item)
    }
  })
  const zero = mixed.findIndex(({ n }) => n === 0)
  return [1000, 2000, 3000]
    .map((n) => mixed[(zero + n) % input.length].n)
    .reduce(sum)
}

export const Part1 = () => {
  const numbers = parseInput()
  const result = mix(numbers)

  return (
    <p>
      The sum of the three numbers that form the grove coordinates is{' '}
      <Answer>{result}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const numbers = parseInput()
  const result = mix(numbers, 811589153, 10)

  return (
    <p>
      After applying the decryption key and mixing 10 times, the sum of the
      three numbers that form the grove coordinates is <Answer>{result}</Answer>
      .
    </p>
  )
}
