import { h, Fragment } from 'preact'
import { Answer } from '/components'
import { Map } from './components'
import input from './input'
import {
  dijkstra,
  getAdjacent,
  keyToPoint,
  minBy,
  parse2dArray,
  Point,
  pointToKey,
  truthy
} from '../util'

const elevation = 'abcdefghijklmnopqrstuvwxyz'

const parseInput = () => parse2dArray(input, String)

const getStartAndEnd = (map: string[][]) => {
  const flattened = map.flatMap((line, y) =>
    line.map((cell, x) => ({ y, x, cell }))
  )
  const start = flattened.find(({ cell }) => cell === 'S')!
  const end = flattened.find(({ cell }) => cell === 'E')!
  map[start.y][start.x] = 'a'
  map[end.y][end.x] = 'z'
  return { start, end }
}

const getPath = (map: string[][], start: Point, end: Point) =>
  dijkstra(pointToKey(start), pointToKey(end), (key) => {
    const point = keyToPoint(key)
    const current = map[point.y][point.x]
    return getAdjacent(point)
      .filter(
        ({ x, y }) =>
          x >= 0 &&
          y >= 0 &&
          x < map[0].length &&
          y < map.length &&
          elevation.indexOf(map[y][x]) - elevation.indexOf(current) <= 1
      )
      .map(pointToKey)
  }).path!

export const Part1 = () => {
  const map = parseInput()
  const { start, end } = getStartAndEnd(map)
  const path = getPath(map, start, end)

  return (
    <>
      <p>
        The fewest steps required to get from your current location to the
        location with the best signal is <Answer>{path.length - 1}</Answer>.
      </p>
      <Map map={parseInput()} path={path} />
    </>
  )
}

export const Part2 = () => {
  const map = parseInput()
  const { end } = getStartAndEnd(map)
  const path = map
    .flatMap((line, y) =>
      line
        .map((cell, x) => cell === 'a' && getPath(map, { x, y }, end))
        .filter(truthy)
    )
    .reduce(minBy((p) => p.length))
  return (
    <>
      <p>
        The fewest steps required to get from any location at elevation a to the
        location with the best signal is <Answer>{path.length - 1}</Answer>.
      </p>
      <Map map={parseInput()} path={path} />
    </>
  )
}
