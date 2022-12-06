import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { sortNumDesc, sum } from '../util'

const parseInput = () =>
  input.split('\n\n').map((block) => block.split('\n').map(Number))

const process = (elves: number[][]) =>
  elves.map((elf) => elf.reduce(sum)).sort(sortNumDesc)

export const Part1 = () => {
  const [calories] = process(parseInput())
  return (
    <p>
      The elf carrying the most Calories is carrying <Answer>{calories}</Answer>{' '}
      total Calories.
    </p>
  )
}

export const Part2 = () => {
  const n = 3
  const calories = process(parseInput()).slice(0, n).reduce(sum)
  return (
    <p>
      The top {n} elves are carrying <Answer>{calories}</Answer> total Calories.
    </p>
  )
}
