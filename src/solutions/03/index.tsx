import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { groupArr, sum } from '../util'

const parseInput = () => input.split('\n')

const priorities = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']

const calculatePriority = (sacks: string[]) =>
  priorities.reduce(
    (sum, letter, i) =>
      sum + (sacks.every((sack) => sack.includes(letter)) ? i + 1 : 0),
    0
  )

export const Part1 = () => {
  const sacks = parseInput().map((line) => [
    line.slice(0, line.length / 2),
    line.slice(line.length / 2)
  ])
  const total = sacks.map(calculatePriority).reduce(sum)
  return (
    <p>
      The sum of the priorities of your item types is <Answer>{total}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const sacks = groupArr(parseInput(), 3)
  const total = sacks.map(calculatePriority).reduce(sum)
  return (
    <p>
      The sum of the priorities of your item types is <Answer>{total}</Answer>.
    </p>
  )
}
