import { h, Fragment } from 'preact'
import { Answer, Visualization } from '/components'
import input from './input'
import { getAdjacent, InfiniteGrid, output2dArray, pointToKey } from '../util'
import { useStore } from '/store'
import { useEffect, useState } from 'preact/hooks'
import { setIntervalImmediate } from '/shared/web-utilities/util'

type Dir = 'U' | 'D' | 'L' | 'R'
interface Instruction {
  dir: Dir
  times: number
}

const parseInput = () =>
  input
    .split('\n')
    .map((line) => line.split(' '))
    .map(([dir, times]) => ({ dir, times: Number(times) } as Instruction))

const deltas = {
  U: { dx: 0, dy: -1 },
  D: { dx: 0, dy: 1 },
  L: { dx: -1, dy: 0 },
  R: { dx: 1, dy: 0 }
}

const moveRope = function* (path: Instruction[], size = 2) {
  const rope = Array(size)
    .fill(null)
    .map(() => ({ x: 0, y: 0 }))
  yield rope

  for (const { dir, times } of path) {
    for (let n = 0; n < times; n++) {
      const { dx, dy } = deltas[dir]
      rope[0].x += dx
      rope[0].y += dy
      for (let i = 1; i < rope.length; i++) {
        const tail = rope[i]
        const prev = rope[i - 1]
        if (
          ![...getAdjacent(tail, true), tail].some(
            ({ x, y }) => x === prev.x && y === prev.y
          )
        ) {
          if (tail.x !== prev.x) rope[i].x += prev.x < tail.x ? -1 : 1
          if (tail.y !== prev.y) rope[i].y += prev.y < tail.y ? -1 : 1
        }
      }
      yield rope
    }
  }
}

const useSolution = (size = 2) => {
  const showVisualization = useStore((s) => s.showVisualization)
  const [done, setDone] = useState(false)
  const [numVisited, setNumVisited] = useState(0)
  const [output, setOutput] = useState('')

  useEffect(() => {
    const path = parseInput()
    setNumVisited(0)
    setOutput('')
    setDone(false)
    const rope = moveRope(path, size)
    const visited = new Set<string>()
    let id: NodeJS.Timeout

    const tick = () => {
      const { value, done } = rope.next()
      if (value) {
        visited.add(pointToKey(value[value.length - 1]))
        if (showVisualization) {
          const grid = new InfiniteGrid('.')
          grid.set(-20, -10, '.')
          grid.set(20, 10, '.')
          value.forEach(
            ({ x, y }, i) =>
              grid.get(x, y) === '.' && grid.set(x, y, i.toString())
          )
          setOutput(output2dArray(grid.toArray()))
        }
      }
      if (done) {
        setNumVisited(visited.size)
        setDone(true)
        clearInterval(id)
      }
      return done
    }

    if (showVisualization) id = setIntervalImmediate(tick, 100)
    else while (!tick()) {}

    return () => clearInterval(id)
  }, [showVisualization, size])

  return { done, numVisited, output }
}

export const Part1 = () => {
  const { done, numVisited, output } = useSolution()

  return (
    <>
      {done && (
        <p>
          The tail of a rope with two knots visits <Answer>{numVisited}</Answer>{' '}
          positions.
        </p>
      )}
      <Visualization>{output}</Visualization>
    </>
  )
}

export const Part2 = () => {
  const { done, numVisited, output } = useSolution(10)

  return (
    <>
      {done && (
        <p>
          The tail of a rope with ten knots visits <Answer>{numVisited}</Answer>{' '}
          positions.
        </p>
      )}
      <Visualization>{output}</Visualization>
    </>
  )
}
