import { h } from 'preact'
import { Answer } from '/components'
import input from './input'

const parseInput = () =>
  input
    .split('\n')
    .map((line) => line.split(',').map((part) => part.split('-').map(Number)))

export const Part1 = () => {
  const contains = parseInput().filter(
    ([[s1, e1], [s2, e2]]) => (s1 >= s2 && e1 <= e2) || (s2 >= s1 && e2 <= e1)
  ).length
  return (
    <p>
      <Answer>{contains}</Answer> ranges fully contain the other.
    </p>
  )
}

export const Part2 = () => {
  const overlaps = parseInput().filter(
    ([[s1, e1], [s2, e2]]) =>
      (s1 >= s2 && s1 <= e2) ||
      (s2 >= s1 && s2 <= e1) ||
      (e1 >= s2 && e1 <= e2) ||
      (e2 >= s1 && e2 <= e1)
  ).length
  return (
    <p>
      <Answer>{overlaps}</Answer> ranges overlap.
    </p>
  )
}
