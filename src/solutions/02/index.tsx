import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { invert, sum } from '../util'

enum Option {
  Rock = 1,
  Paper = 2,
  Scissors = 3
}

const parseInput = () =>
  input
    .split('\n')
    .map((line) => line.split(' '))
    .map(([opponent, command]) => ({
      opponent: { A: Option.Rock, B: Option.Paper, C: Option.Scissors }[
        opponent
      ] as Option,
      command
    }))

const wins: Record<Option, Option> = {
  [Option.Rock]: Option.Paper,
  [Option.Paper]: Option.Scissors,
  [Option.Scissors]: Option.Rock
}

const lose = invert(wins)

const calculateScore = (opponent: Option, you: Option) =>
  Number(you) + (wins[opponent] === you ? 6 : opponent === you ? 3 : 0)

const runCommand1 = (command: string) =>
  ({ X: Option.Rock, Y: Option.Paper, Z: Option.Scissors }[command] as Option)

const runCommand2 = (opponent: Option, command: string) =>
  ({
    X: lose[opponent],
    Y: opponent,
    Z: wins[opponent]
  }[command] as Option)

export const Part1 = () => {
  const score = parseInput()
    .map(({ opponent, command }) =>
      calculateScore(opponent, runCommand1(command))
    )
    .reduce(sum)
  return (
    <p>
      Your total score will be <Answer>{score}</Answer> according to your
      strategy guide.
    </p>
  )
}

export const Part2 = () => {
  const score = parseInput()
    .map(({ opponent, command }) =>
      calculateScore(opponent, runCommand2(opponent, command))
    )
    .reduce(sum)
  return (
    <p>
      Your total score will be <Answer>{score}</Answer> according to your new
      strategy guide.
    </p>
  )
}
