import { h, Fragment } from 'preact'
import { Answer, Visualization } from '/components'
import input from './input'
import {
  getAdjacent,
  InfiniteGrid,
  max,
  min,
  output2dArray,
  parse2dArray,
  Point,
  truthy
} from '../util'
import { useStore } from '/store'
import { useEffect, useState } from 'preact/hooks'
import { setIntervalImmediate } from '/shared/web-utilities/util'

const parseInput = () => new InfiniteGrid('.', parse2dArray(input, String))

const moveElves = function* (
  grid: InfiniteGrid<string>,
  times: number,
  yieldEvery?: number
): Generator<InfiniteGrid<string>, number | undefined> {
  const canMove = ({ x, y }: Point) => grid.get(x, y) === '.'
  const elves = new Set<Point>(grid.cells.filter((c) => c.value === '#'))

  for (let n = 0; n < times; n++) {
    const proposedMoves = [...elves.values()]
      .map((from) => {
        const adjacent = getAdjacent(from, true)
        if (adjacent.every(canMove)) return null

        const { x, y } = from
        const checks = [
          adjacent.filter((p) => p.y === y - 1).every(canMove) && {
            x,
            y: y - 1
          },
          adjacent.filter((p) => p.y === y + 1).every(canMove) && {
            x,
            y: y + 1
          },
          adjacent.filter((p) => p.x === x - 1).every(canMove) && {
            x: x - 1,
            y
          },
          adjacent.filter((p) => p.x === x + 1).every(canMove) && {
            x: x + 1,
            y
          }
        ]

        for (let i = n; i < n + checks.length; i++) {
          const to = checks[i % checks.length]
          if (to) return { from, to }
        }
      })
      .filter(truthy)
    const validMoves = proposedMoves.filter(
      (move) =>
        !proposedMoves.some(
          (move2) =>
            move !== move2 &&
            move.to.x === move2.to.x &&
            move.to.y === move2.to.y
        )
    )
    if (!validMoves.length) {
      return n + 1
    }
    validMoves.forEach(({ from, to }) => {
      grid.set(from.x, from.y, '.')
      grid.set(to.x, to.y, '#')
      elves.delete(from)
      elves.add(to)
    })
    if (!yieldEvery || n % yieldEvery === 0) yield grid
  }
}

const getEmptyGround = (grid: InfiniteGrid<string>) => {
  const cells = grid.cells.filter((c) => c.value === '#')
  const minElf = {
    x: cells.map((c) => c.x).reduce(min),
    y: cells.map((c) => c.y).reduce(min)
  }
  const maxElf = {
    x: cells.map((c) => c.x).reduce(max),
    y: cells.map((c) => c.y).reduce(max)
  }
  return grid
    .toArray(minElf, maxElf)
    .flat()
    .filter((c) => c === '.').length
}

const useSolution = (times = 10) => {
  const showVisualization = useStore((s) => s.showVisualization)
  const [lastRound, setLastRound] = useState<number>()
  const [grid, setGrid] = useState<InfiniteGrid<string>>()
  const [output, setOutput] = useState<string>()

  useEffect(() => {
    setLastRound(undefined)
    setGrid(undefined)
    setOutput(undefined)
    const grid = parseInput()
    const gen = moveElves(grid, times, showVisualization ? undefined : 50)

    const tick = () => {
      const { value, done } = gen.next()
      if (value) {
        if (typeof value === 'number') setLastRound(value)
        else if (showVisualization) setOutput(output2dArray(value.toArray()))
      }
      if (done) {
        setGrid(grid)
        clearInterval(id)
      }
    }
    const id = setIntervalImmediate(tick, showVisualization ? 100 : 0)

    return () => clearInterval(id)
  }, [showVisualization, times])

  return { lastRound, grid, output }
}

export const Part1 = () => {
  const { grid, output } = useSolution()

  return (
    <>
      {grid && (
        <p>
          After 10 rounds, the smallest rectangle that contains all elves
          contains <Answer>{getEmptyGround(grid)}</Answer> ground tiles.
        </p>
      )}
      <Visualization>{output}</Visualization>
    </>
  )
}

export const Part2 = () => {
  const { lastRound, output } = useSolution(Infinity)

  return (
    <>
      {lastRound ? (
        <p>
          The first round where no elves move is <Answer>{lastRound}</Answer>.
        </p>
      ) : (
        <p>Running...</p>
      )}
      <Visualization>{output}</Visualization>
    </>
  )
}
