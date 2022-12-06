import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { nTimes } from '../util'

const parseInput = () => {
  const [stackBlock, instructionsBlock] = input.split('\n\n')

  const stack = stackBlock.split('\n')
  const [positions] = stack.splice(stack.length - 1)
  const crates: string[][] = Array(9)
    .fill(null)
    .map(() => [])
  for (let n = 1; n <= crates.length; n++) {
    const index = positions.indexOf(n.toString())
    for (let i = stack.length - 1; i >= 0; i--) {
      const letter = stack[i][index]
      if (letter && letter !== ' ') crates[n - 1].push(letter)
    }
  }

  const instructions = instructionsBlock
    .split('\n')
    .map(
      (line) =>
        line.match(/move (?<n>\d+) from (?<from>\d) to (?<to>\d)/u)!.groups!
    )
    .map(({ n, from, to }) => ({
      n: Number(n),
      from: Number(from),
      to: Number(to)
    }))

  return { crates, instructions }
}

const moveCrates = (crates: string[][], from: number, to: number, n = 1) =>
  crates[to - 1].push(...crates[from - 1].splice(crates[from - 1].length - n))

const getTopCrates = (crates: string[][]) =>
  crates.map((c) => c[c.length - 1]).join('')

export const Part1 = () => {
  const { crates, instructions } = parseInput()
  instructions.forEach(({ n, from, to }) =>
    nTimes(n, () => moveCrates(crates, from, to))
  )
  return (
    <p>
      After the rearrangement procedure, the following crates are at the top of
      the each stack: <Answer>{getTopCrates(crates)}</Answer>
    </p>
  )
}

export const Part2 = () => {
  const { crates, instructions } = parseInput()
  instructions.forEach(({ n, from, to }) => moveCrates(crates, from, to, n))
  return (
    <p>
      When moving multiple crates at once, after the rearrangement procedure,
      the following crates are at the top of the each stack:{' '}
      <Answer>{getTopCrates(crates)}</Answer>
    </p>
  )
}
