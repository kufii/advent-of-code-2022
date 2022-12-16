import { h, Fragment } from 'preact'
import { Answer, Visualization } from '/components'
import input from './input'
import { InfiniteGrid, output2dArray, Point } from '../util'
import { useEffect, useState } from 'preact/hooks'
import { useStore } from '/store'
import { setIntervalImmediate } from '/shared/web-utilities/util'

enum Tile {
  Empty = ' ',
  Flowing = '┊',
  Wall = '█',
  Sand = '▒'
}

const parseInput = () =>
  input.split('\n').map((line) =>
    line
      .split(' -> ')
      .map((nums) => nums.split(',').map(Number))
      .map(([x, y]) => ({ x, y }))
  )

const buildCave = (paths: Point[][]) => {
  const cave = new InfiniteGrid(Tile.Empty)
  for (const path of paths) {
    let current = path.shift()!
    while (path.length) {
      const next = path.shift()!
      for (
        let x = Math.min(current.x, next.x);
        x <= Math.max(current.x, next.x);
        x++
      ) {
        for (
          let y = Math.min(current.y, next.y);
          y <= Math.max(current.y, next.y);
          y++
        ) {
          cave.set(x, y, Tile.Wall)
        }
      }
      current = next
    }
  }
  return cave
}

const dropSand = (
  cave: InfiniteGrid<Tile>,
  x: number,
  y: number,
  bottom: number,
  bottomSolid = false
) => {
  const isOpen = (x: number, y: number) =>
    !(bottomSolid && y >= bottom) &&
    [Tile.Empty, Tile.Flowing].includes(cave.get(x, y))
  while (y < bottom) {
    const oldX = x
    const oldY = y
    y++
    if (!isOpen(x, y)) {
      x = isOpen(x - 1, y) ? x - 1 : x + 1
      if (!isOpen(x, y)) {
        cave.set(oldX, oldY, Tile.Sand)
        return { x: oldX, y: oldY }
      }
    }
    cave.set(x, y, Tile.Flowing)
  }
  return { x, y }
}

export const Part1 = () => {
  const showVisualization = useStore((s) => s.showVisualization)
  const [result, setResult] = useState<number | undefined>()
  const [output, setOutput] = useState<string | undefined>()

  useEffect(() => {
    setResult(undefined)
    setOutput(undefined)
    const paths = parseInput()
    const cave = buildCave(paths)
    const abyss = cave.bounds.max.y
    let count = 0
    let id: NodeJS.Timeout

    const tick = () => {
      const { y } = dropSand(cave, 500, 0, abyss)
      if (showVisualization) setOutput(output2dArray(cave.toArray()))
      if (y >= abyss) {
        setResult(count)
        clearInterval(id)
        return false
      }
      count++
      return true
    }

    if (showVisualization) id = setIntervalImmediate(tick, 50)
    else while (tick()) {}

    return () => clearInterval(id)
  }, [showVisualization])

  return (
    <>
      {result && (
        <p>
          <Answer>{result}</Answer> units of sand come to rest before sand
          starts flowing into the abyss.
        </p>
      )}
      <Visualization>{output}</Visualization>
    </>
  )
}

export const Part2 = () => {
  const showVisualization = useStore((s) => s.showVisualization)
  const [result, setResult] = useState<number | undefined>()
  const [output, setOutput] = useState<string | undefined>()

  useEffect(() => {
    setResult(undefined)
    setOutput(undefined)
    const paths = parseInput()
    const cave = buildCave(paths)
    const floor = cave.bounds.max.y + 2
    let count = 0
    let id: NodeJS.Timeout

    const tick = () => {
      const { x, y } = dropSand(cave, 500, 0, floor, true)
      if (showVisualization) setOutput(output2dArray(cave.toArray()))
      count++
      if (x === 500 && y === 0) {
        setResult(count)
        clearInterval(id)
        return false
      }
      return true
    }

    if (showVisualization) id = setInterval(tick, 50)
    else while (tick()) {}

    return () => clearInterval(id)
  }, [showVisualization])

  return (
    <>
      {result && (
        <p>
          <Answer>{result}</Answer> units of sand come to rest.
        </p>
      )}
      <Visualization>{output}</Visualization>
    </>
  )
}
