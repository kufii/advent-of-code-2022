import { h, Fragment } from 'preact'
import dedent from 'dedent'
import { Answer, Visualization } from '/components'
import input from './input'
import { InfiniteGrid, min, output2dArray, range } from '../util'
import { useEffect, useState } from 'preact/hooks'
import { setIntervalImmediate } from '/shared/web-utilities/util'
import { useStore } from '/store'

type Dir = '<' | '>'

enum Cell {
  Empty = ' ',
  Rock = '█'
}

interface Rock {
  x: number
  y: number
  shape: Cell[][]
}

interface FallingRock extends Rock {
  falling: boolean
}

const parseInput = () => [...input] as Dir[]

const shapes = [
  '####',
  dedent(`
    .#.
    ###
    .#.
  `),
  dedent(`
    ..#
    ..#
    ###
  `),
  dedent(`
    #
    #
    #
    #
  `),
  dedent(`
    ##
    ##
  `)
].map((shape) =>
  shape
    .split('\n')
    .map((line) =>
      [...line].map((cell) => (cell === '#' ? Cell.Rock : Cell.Empty))
    )
)

const dropRocks = function* (
  jets: Dir[],
  numRocks: number,
  visualize = false,
  width = 7
): Generator<FallingRock | number> {
  const rocks: Rock[] = []

  const cellOpen = (x: number, y: number) =>
    x > 0 &&
    x < width &&
    y <= 0 &&
    !rocks.some((rock) =>
      rock.shape.some((line, rockY) =>
        line.some(
          (cell, rockX) =>
            cell === Cell.Rock && rock.y + rockY === y && rock.x + rockX === x
        )
      )
    )

  const canFit = (shape: Cell[][], x: number, y: number) =>
    !shape.some((line, shapeY) =>
      line.some(
        (cell, shapeX) =>
          cell === Cell.Rock && !cellOpen(x + shapeX, y + shapeY)
      )
    )

  const getTop = () => rocks.map((r) => r.y).reduce(min, 0)

  const getCacheKey = (minY: number, i: number) =>
    [
      range(minY, minY + 16)
        .map((y) =>
          range(0, width - 1)
            .map((x) => (cellOpen(x, y) ? Cell.Empty : Cell.Rock))
            .join('')
        )
        .join('\n'),
      i % shapes.length
    ].join(';')

  const cache = new Map<string, [number, number, number]>()
  let cacheFound = false
  let j = 0
  for (let i = 0; i < numRocks; i++) {
    if (!cacheFound) {
      const minY = getTop()
      const cacheKey = getCacheKey(minY, i)
      if (cache.has(cacheKey)) {
        cacheFound = true
        const [lastI, lastJ, lastMinY] = cache.get(cacheKey)!
        const repeating = i - lastI
        const times = Math.floor((numRocks - i) / repeating)
        rocks.forEach((r) => (r.y -= (lastMinY - minY) * times))
        i += repeating * times
        j += (j - lastJ) * times
      } else cache.set(cacheKey, [i, j, minY])
    }

    const shape = shapes[i % shapes.length]
    const rock = {
      x: 2,
      y: rocks.map((r) => r.y).reduce(min, 1) - shape.length - 3,
      shape
    }
    while (true) {
      const dir = jets[j % jets.length]
      j++
      const newX = dir === '<' ? rock.x - 1 : rock.x + 1
      if (canFit(shape, newX, rock.y)) rock.x = newX
      const newY = rock.y + 1
      if (!canFit(shape, rock.x, newY)) break
      rock.y = newY
      if (visualize) yield { ...rock, falling: true }
    }
    rocks.push(rock)
    yield { ...rock, falling: false }
  }
  yield Math.abs(getTop()) + 1
}

const useSolution = (n: number) => {
  const showVisualization = useStore((s) => s.showVisualization)
  const [result, setResult] = useState<number>()
  const [output, setOutput] = useState<string>()

  useEffect(() => {
    setResult(undefined)
    const jets = parseInput()
    const gen = dropRocks(jets, n, showVisualization)
    const grid = new InfiniteGrid(Cell.Empty)
    range(0, 6).map((x) => grid.set(x, 0, Cell.Empty))

    const fillShape = (shape: Cell[][], x: number, y: number, clear = false) =>
      shape.forEach((line, shapeY) =>
        line.forEach(
          (cell, shapeX) =>
            cell === Cell.Rock &&
            grid.set(x + shapeX, y + shapeY, clear ? Cell.Empty : Cell.Rock)
        )
      )

    const tick = () => {
      const { value, done } = gen.next()
      if (value) {
        if (typeof value === 'number') setResult(value)
        else {
          const { x, y, shape, falling } = value as FallingRock
          fillShape(shape, x, y)
          const { min } = grid.bounds
          setOutput(
            output2dArray(
              grid.toArray(
                { x: 0, y: min.y },
                { x: 6, y: Math.min(0, min.y + 20) }
              )
            )
          )
          if (falling) fillShape(shape, x, y, true)
        }
      }
      if (done) clearInterval(id)
    }
    const id = setIntervalImmediate(tick, showVisualization ? 30 : 0)
    return () => clearInterval(id)
  }, [showVisualization, n])

  return { result, output }
}

export const Part1 = () => {
  const n = 2022
  const { result, output } = useSolution(n)

  return (
    <>
      {result ? (
        <p>
          The tower will be <Answer>{result}</Answer> units tall after {n} rocks
          have stopped falling.
        </p>
      ) : (
        <p>Running...</p>
      )}
      <Visualization>{output}</Visualization>
    </>
  )
}

export const Part2 = () => {
  const n = 1000000000000
  const { result, output } = useSolution(n)

  return (
    <>
      {result ? (
        <p>
          The tower will be <Answer>{result}</Answer> units tall after {n} rocks
          have stopped falling.
        </p>
      ) : (
        <p>Running...</p>
      )}
      <Visualization>{output}</Visualization>
    </>
  )
}
