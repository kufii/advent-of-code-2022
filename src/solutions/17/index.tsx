import { h, Fragment } from 'preact'
import dedent from 'dedent'
import { Answer, Visualization } from '/components'
import input from './input'
import { InfiniteGrid, output2dArray, parse2dArray, range } from '../util'
import { useEffect, useState } from 'preact/hooks'
import { setIntervalImmediate } from '/shared/web-utilities/util'
import { useStore } from '/store'

type Dir = '<' | '>'

enum Cell {
  Empty = ' ',
  Rock = '█'
}

const parseInput = () => [...input] as Dir[]

const shapes = [
  '####',
  dedent`
    .#.
    ###
    .#.
  `,
  dedent`
    ..#
    ..#
    ###
  `,
  dedent`
    #
    #
    #
    #
  `,
  dedent`
    ##
    ##
  `
].map((shape) =>
  parse2dArray(shape, (cell) => (cell === '#' ? Cell.Rock : Cell.Empty))
)

const dropRocks = function* (
  jets: Dir[],
  numRocks: number,
  visualize = false,
  width = 7
) {
  const grid = new InfiniteGrid(Cell.Empty)
  range(0, width - 1).map((x) => grid.set(x, 0, Cell.Empty))

  const cellOpen = (x: number, y: number) =>
    x >= 0 && x < width && y <= 0 && grid.get(x, y) === Cell.Empty

  const canFit = (shape: Cell[][], x: number, y: number) =>
    !shape.some((line, shapeY) =>
      line.some(
        (cell, shapeX) =>
          cell === Cell.Rock && !cellOpen(x + shapeX, y + shapeY)
      )
    )

  const drawShape = (shape: Cell[][], x: number, y: number, clear = false) =>
    shape.forEach((line, shapeY) =>
      line.forEach(
        (cell, shapeX) =>
          cell === Cell.Rock &&
          grid.set(x + shapeX, y + shapeY, clear ? Cell.Empty : Cell.Rock)
      )
    )

  const cache = new Map<string, [number, number, number]>()
  let cacheFound = false
  let minY = 1

  const getHeight = () => minY * -1 + 1

  const getTopNRows = (n: number) =>
    range(minY, minY + n - 1).map((y) =>
      range(0, width - 1).map((x) => (cellOpen(x, y) ? Cell.Empty : Cell.Rock))
    )

  const getCacheKey = (i: number, j: number) =>
    [output2dArray(getTopNRows(5)), i % shapes.length, j % jets.length].join(
      ';'
    )

  const getVisualization = (rows = 20) =>
    output2dArray(
      grid.toArray(
        { x: 0, y: Math.min(minY - 3, -rows) },
        { x: width - 1, y: Math.min(0, minY - 3 + rows) }
      )
    )

  for (let i = 0, j = 0; i < numRocks; i++) {
    if (!cacheFound) {
      const cacheKey = getCacheKey(i, j)
      if (cache.has(cacheKey)) {
        cacheFound = true
        const [lastI, lastJ, lastMinY] = cache.get(cacheKey)!
        const repeating = i - lastI
        const times = Math.floor((numRocks - i) / repeating)
        const topRows = getTopNRows(repeating)
        minY -= (lastMinY - minY) * times
        drawShape(topRows, 0, minY)
        i += repeating * times
        j += (j - lastJ) * times
      } else cache.set(cacheKey, [i, j, minY])
    }

    const shape = shapes[i % shapes.length]
    let x = 2
    let y = minY - shape.length - 3
    while (true) {
      const dir = jets[j % jets.length]
      j++
      const newX = dir === '<' ? x - 1 : x + 1
      if (canFit(shape, newX, y)) x = newX
      const newY = y + 1
      if (!canFit(shape, x, newY)) break
      y = newY
      if (visualize) {
        drawShape(shape, x, y)
        yield getVisualization()
        drawShape(shape, x, y, true)
      }
    }
    drawShape(shape, x, y)
    minY = Math.min(minY, y)
    if (visualize) {
      yield getVisualization()
    }
  }
  yield getHeight()
}

const useSolution = (n: number) => {
  const showVisualization = useStore((s) => s.showVisualization)
  const [result, setResult] = useState<number>()
  const [output, setOutput] = useState<string>()

  useEffect(() => {
    setResult(undefined)
    setOutput(undefined)
    const jets = parseInput()
    const gen = dropRocks(jets, n, showVisualization)

    const tick = () => {
      const { value, done } = gen.next()
      if (value) {
        if (typeof value === 'number') setResult(value)
        else if (showVisualization) setOutput(value)
      }
      if (done) clearInterval(id)
    }
    const id = setIntervalImmediate(tick, showVisualization ? 40 : 0)
    return () => clearInterval(id)
  }, [showVisualization, n])

  return { result, output }
}

export const Part1 = () => {
  const n = 2022
  const { result, output } = useSolution(n)

  return (
    <>
      {result && (
        <p>
          The tower will be <Answer>{result}</Answer> units tall after {n} rocks
          have stopped falling.
        </p>
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
      {result && (
        <p>
          The tower will be <Answer>{result}</Answer> units tall after {n} rocks
          have stopped falling.
        </p>
      )}
      <Visualization>{output}</Visualization>
    </>
  )
}
