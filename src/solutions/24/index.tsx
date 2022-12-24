import { h, Fragment } from 'preact'
import { Answer, Array2d, Visualization } from '/components'
import input from './input'
import {
  dijkstra,
  findLastIndex,
  getAdjacent,
  InfiniteGrid,
  keyToPoint,
  keyToPoint3,
  lcm,
  memoize,
  mod,
  parse2dArray,
  Point,
  point3ToKey,
  pointToKey
} from '../util'
import { useEffect, useState } from 'preact/hooks'
import { useStore } from '/store'
import { setIntervalImmediate } from '/shared/web-utilities/util'
import { useStateCallback } from '/shared/web-utilities/hooks/useStateCallback'

const parseInput = () => parse2dArray(input, String)

const deltas: Record<string, { dx: number; dy: number }> = {
  '<': { dx: -1, dy: 0 },
  '>': { dx: 1, dy: 0 },
  '^': { dx: 0, dy: -1 },
  v: { dx: 0, dy: 1 }
}

const getStartAndEnd = (arr: string[][]) => ({
  start: { x: arr[0].indexOf('.'), y: 0 },
  end: { x: arr[arr.length - 1].indexOf('.'), y: arr.length - 1 }
})

const traverse = (
  arr: string[][],
  from: Point,
  to: Point,
  fetchSnacks: boolean
) => {
  const grid = new InfiniteGrid('#', arr)
  const cells = grid.cells

  const blizzardsX = cells.filter((c) => ['<', '>'].includes(c.value))
  const blizzardsY = cells.filter((c) => ['v', '^'].includes(c.value))
  const blizzardsXCycle = arr[0].length - 2
  const blizzardsYCycle = arr.length - 2
  const blizzardsLcm = lcm(blizzardsXCycle, blizzardsYCycle)

  const getBlizzardsX = memoize((n: number) =>
    blizzardsX.map(({ x, y, value }) => {
      const { dx } = deltas[value]
      x += dx * n
      x = mod(x - 1, blizzardsXCycle) + 1
      return { x, y, value }
    })
  )

  const getBlizzardsY = memoize((n: number) =>
    blizzardsY.map(({ x, y, value }) => {
      const { dy } = deltas[value]
      y += dy * n
      y = mod(y - 1, blizzardsYCycle) + 1
      return { x, y, value }
    })
  )

  const getBlizzards = memoize((n: number) => [
    ...getBlizzardsX(n % blizzardsXCycle),
    ...getBlizzardsY(n % blizzardsYCycle)
  ])

  const getNeighbors = (end: Point) =>
    memoize((key: string) => {
      let { x, y, z } = keyToPoint3(key)
      z++
      z %= blizzardsLcm
      const blizzards = getBlizzards(z)
      return [...getAdjacent({ x, y }), { x, y }]
        .filter(
          ({ x, y }) =>
            grid.get(x, y) !== '#' &&
            !blizzards.some((b) => b.x === x && b.y === y)
        )
        .map((p) =>
          p.x === end.x && p.y === end.y
            ? pointToKey(p)
            : point3ToKey({ x: p.x, y: p.y, z })
        )
    })

  let time = 0
  const fullPath: string[] = []
  const findPath = (from: Point, to: Point) => {
    const { path, distance } = dijkstra(
      point3ToKey({ ...from, z: time }),
      pointToKey(to),
      getNeighbors(to)
    )
    time += distance!
    fullPath.pop()
    fullPath.push(...path!)
  }
  findPath(from, to)
  if (fetchSnacks) {
    findPath(to, from)
    findPath(from, to)
  }

  const getVisualization = () => {
    const grid = new InfiniteGrid<string | JSX.Element>(
      '.',
      arr.map((line) => line.map((c) => (c === '#' ? '#' : '.')))
    )
    const frames: (string | JSX.Element)[][][] = []
    for (let i = 0; i < fullPath.length; i++) {
      const { x, y } = keyToPoint(fullPath[i])
      const newGrid = grid.clone()
      const blizzards = getBlizzards(i % blizzardsLcm)
      blizzards.forEach(({ x, y, value }) => newGrid.set(x, y, value))
      newGrid.set(x, y, <strong>E</strong>)
      frames.push(newGrid.toArray())
    }
    return frames
  }

  return { time, path: fullPath, frames: getVisualization() }
}

const useSolution = (fetchSnacks = false) => {
  const showVisualization = useStore((s) => s.showVisualization)
  const [result, setResult] = useState<number>()
  const [output, setOutput] = useState<(string | JSX.Element)[][]>()
  const rerender = useStateCallback(0)[1]

  useEffect(() => {
    setOutput(undefined)
    setResult(undefined)

    let id: NodeJS.Timeout
    rerender(
      (n) => n + 1,
      () => {
        const arr = parseInput()
        const { start, end } = getStartAndEnd(arr)
        const { time, frames } = traverse(arr, start, end, fetchSnacks)
        setResult(time)

        if (showVisualization) {
          id = setIntervalImmediate(() => {
            setOutput(frames.shift())
            if (!frames.length) clearInterval(id)
          }, 50)
        }
      }
    )

    return () => clearInterval(id)
  }, [rerender, showVisualization, fetchSnacks])

  return { result, output }
}

export const Part1 = () => {
  const { result, output } = useSolution()

  return (
    <>
      {result ? (
        <p>
          It takes <Answer>{result}</Answer> minutes to avoid the blizzards and
          reach the goal.
        </p>
      ) : (
        <p>Running...</p>
      )}
      <Visualization>{output && <Array2d array={output} />}</Visualization>
    </>
  )
}

export const Part2 = () => {
  const { result, output } = useSolution(true)

  return (
    <>
      {result ? (
        <p>
          It takes <Answer>{result}</Answer> minutes to reach the goal, go back
          to the start, then reach the goal again.
        </p>
      ) : (
        <p>Running... This takes a while...</p>
      )}
      <Visualization>{output && <Array2d array={output} />}</Visualization>
    </>
  )
}
