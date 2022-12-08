import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { max, parse2dArray, product } from '../util'

const parseInput = () => parse2dArray(input, Number)

const deltas = [
  { dx: 0, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 }
]

const inBounds = (grid: any[][], x: number, y: number) =>
  x >= 0 && x < grid[0].length && y >= 0 && y < grid.length

const getVisibilityMap = (trees: number[][]) =>
  trees.map((line, y) =>
    line.map((tree, x) =>
      deltas.some(({ dx, dy }) => {
        let curX = x + dx
        let curY = y + dy
        while (inBounds(trees, curX, curY)) {
          if (trees[curY][curX] >= tree) return false
          curX += dx
          curY += dy
        }
        return true
      })
    )
  )

const getScenicScoreMap = (trees: number[][]) =>
  trees.map((line, y) =>
    line.map((tree, x) =>
      deltas
        .map(({ dx, dy }) => {
          let curX = x + dx
          let curY = y + dy
          let score = 0
          while (inBounds(trees, curX, curY)) {
            score++
            if (trees[curY][curX] >= tree) break
            curY += dy
            curX += dx
          }
          return score
        })
        .reduce(product)
    )
  )

export const Part1 = () => {
  const trees = parseInput()
  const visible = getVisibilityMap(trees)
  const totalVisible = visible.flat().filter(Boolean).length
  return (
    <p>
      <Answer>{totalVisible}</Answer> trees are visible from outside the grid.
    </p>
  )
}

export const Part2 = () => {
  const trees = parseInput()
  const scores = getScenicScoreMap(trees)
  const bestScore = scores.flat().reduce(max)
  return (
    <p>
      The highest possible scenic score is <Answer>{bestScore}</Answer>.
    </p>
  )
}
