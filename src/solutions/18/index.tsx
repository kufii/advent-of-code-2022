import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { dijkstra, keyToPoint3, max, min, Point3, point3ToKey } from '../util'

const parseInput = () => input.split('\n').map(keyToPoint3)

const dirs = [
  { dx: -1, dy: 0, dz: 0 },
  { dx: 1, dy: 0, dz: 0 },
  { dx: 0, dy: -1, dz: 0 },
  { dx: 0, dy: 1, dz: 0 },
  { dx: 0, dy: 0, dz: -1 },
  { dx: 0, dy: 0, dz: 1 }
]

const getAdjacent = ({ x, y, z }: Point3) =>
  dirs.map(({ dx, dy, dz }) => ({ x: x + dx, y: y + dy, z: z + dz }))

const isOpen = (cubes: Point3[], cube: Point3) =>
  !cubes.some(({ x, y, z }) => x === cube.x && y === cube.y && z === cube.z)

const getOpenFaces = (cubes: Point3[]) =>
  cubes.flatMap((cube) =>
    getAdjacent(cube).filter((face) => isOpen(cubes, face))
  )

const getBounds = (cubes: Point3[]) => ({
  min: {
    x: cubes.map(({ x }) => x).reduce(min) - 1,
    y: cubes.map(({ y }) => y).reduce(min) - 1,
    z: cubes.map(({ z }) => z).reduce(min) - 1
  },
  max: {
    x: cubes.map(({ x }) => x).reduce(max) + 1,
    y: cubes.map(({ y }) => y).reduce(max) + 1,
    z: cubes.map(({ z }) => z).reduce(max) + 1
  }
})

const getReachableFaces = (cubes: Point3[]) => {
  const potentialFaces = getOpenFaces(cubes)
  const { min, max } = getBounds(cubes)
  const { prev } = dijkstra(point3ToKey(min), null, (key) => {
    const point = keyToPoint3(key)
    return getAdjacent(point)
      .filter(
        ({ x, y, z }) =>
          x >= min.x &&
          x <= max.x &&
          y >= min.y &&
          y <= max.y &&
          z >= min.z &&
          z <= max.z &&
          isOpen(cubes, { x, y, z })
      )
      .map(point3ToKey)
  })
  return potentialFaces.filter((face) => prev.has(point3ToKey(face)))
}

export const Part1 = () => {
  const cubes = parseInput()
  const faces = getOpenFaces(cubes)
  return (
    <p>
      The surface area of the scanned lava droplet is{' '}
      <Answer>{faces.length}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const cubes = parseInput()
  const faces = getReachableFaces(cubes)
  return (
    <p>
      The exterior surface area of the scanned lava droplet is{' '}
      <Answer>{faces.length}</Answer>.
    </p>
  )
}
