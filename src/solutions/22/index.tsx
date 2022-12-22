import { h, Fragment } from 'preact'
import { Answer, Visualization } from '/components'
import input from './input'
import {
  findLastIndex,
  min,
  output2dArray,
  parse2dArray,
  Point,
  range
} from '../util'
import { useStore } from '/store'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { setIntervalImmediate } from '/shared/web-utilities/util'
import structuredClone from '@ungap/structured-clone'
import styles from './style.css'

enum Dir {
  Up = '^',
  Down = 'v',
  Left = '<',
  Right = '>'
}

enum Turn {
  Left = 'L',
  Right = 'R'
}

interface Pos extends Point {
  dir: Dir
}

const parseInput = () => {
  const [block1, block2] = input.split('\n\n')
  return {
    grid: parse2dArray(block1, String),
    dirs: block2
  }
}

const deltas = {
  [Dir.Up]: { dx: 0, dy: -1 },
  [Dir.Down]: { dx: 0, dy: 1 },
  [Dir.Left]: { dx: -1, dy: 0 },
  [Dir.Right]: { dx: 1, dy: 0 }
}

const turning = {
  [Dir.Up]: {
    [Turn.Right]: Dir.Right,
    [Turn.Left]: Dir.Left
  },
  [Dir.Down]: {
    [Turn.Right]: Dir.Left,
    [Turn.Left]: Dir.Right
  },
  [Dir.Left]: {
    [Turn.Right]: Dir.Up,
    [Turn.Left]: Dir.Down
  },
  [Dir.Right]: {
    [Turn.Right]: Dir.Down,
    [Turn.Left]: Dir.Up
  }
}

const scores = {
  [Dir.Right]: 0,
  [Dir.Down]: 1,
  [Dir.Left]: 2,
  [Dir.Up]: 3
}

const getScore = (x: number, y: number, dir: Dir) =>
  1000 * (y + 1) + 4 * (x + 1) + scores[dir]

const navigate = function* (
  grid: string[][],
  dirs: string,
  warpFn: (grid: string[][], pos: Pos) => Pos
) {
  let y = 0
  let x = grid[0].findIndex((c) => c !== ' ' && c !== '#')
  let dir = Dir.Right
  yield { x, y, dir }
  while (dirs) {
    const num = dirs.match(/^\d+/u)?.[0]
    if (num) {
      dirs = dirs.slice(num.length)
      for (let n = 0; n < Number(num); n++) {
        const { dx, dy } = deltas[dir]
        let nextX = x + dx
        let nextY = y + dy
        let nextDir: Dir = dir
        let cell = grid[nextY]?.[nextX] ?? ' '
        if (cell === ' ') {
          const warp = warpFn(grid, { x, y, dir })
          nextX = warp.x
          nextY = warp.y
          if (warp.dir != null) nextDir = warp.dir
        }
        cell = grid[nextY]?.[nextX] ?? ' '
        if (cell === '#') break
        x = nextX
        y = nextY
        dir = nextDir
        yield { x, y, dir }
      }
    }
    const turn = dirs.match(/^[RL]/u)?.[0]
    if (turn) {
      dirs = dirs.slice(turn.length)
      dir = turning[dir][turn as Turn]
    }
  }
}

const cubeFaces: Record<
  string,
  Partial<Record<Dir, { face: string; dir: Dir; flip?: boolean }>>
> = {
  1: {
    [Dir.Up]: { face: '6', dir: Dir.Right },
    [Dir.Left]: { face: '5', dir: Dir.Right, flip: true }
  },
  2: {
    [Dir.Up]: { face: '6', dir: Dir.Up },
    [Dir.Right]: { face: '4', dir: Dir.Left, flip: true },
    [Dir.Down]: { face: '3', dir: Dir.Left }
  },
  3: {
    [Dir.Left]: { face: '5', dir: Dir.Down },
    [Dir.Right]: { face: '2', dir: Dir.Up }
  },
  4: {
    [Dir.Right]: { face: '2', dir: Dir.Left, flip: true },
    [Dir.Down]: { face: '6', dir: Dir.Left }
  },
  5: {
    [Dir.Up]: { face: '3', dir: Dir.Right },
    [Dir.Left]: { face: '1', dir: Dir.Right, flip: true }
  },
  6: {
    [Dir.Left]: { face: '1', dir: Dir.Down },
    [Dir.Right]: { face: '4', dir: Dir.Up },
    [Dir.Down]: { face: '2', dir: Dir.Down }
  }
}

const getCubeFaceSize = (arr: string[][]) =>
  arr.map((line) => line.join('').trim().length).reduce(min)

const createCube = (arr: string[][], faceSize: number) => {
  arr = structuredClone(arr)
  const startX = arr[0].findIndex((c) => c !== ' ')
  for (let y = 0; y < faceSize; y++) {
    for (let x = startX; x < arr[y].length; x++) {
      if (arr[y][x] !== '.') continue
      arr[y][x] = x - startX >= faceSize ? '2' : '1'
    }
  }
  for (let y = faceSize; y < faceSize * 2; y++) {
    for (let x = startX; x < arr[y].length; x++) {
      if (arr[y][x] !== '.') continue
      arr[y][x] = '3'
    }
  }
  for (let y = faceSize * 2; y < faceSize * 3; y++) {
    for (let x = 0; x < arr[y].length; x++) {
      if (arr[y][x] !== '.') continue
      arr[y][x] = x >= faceSize ? '4' : '5'
    }
  }
  for (let y = faceSize * 3; y < arr.length; y++) {
    for (let x = 0; x < arr[y].length; x++) {
      if (arr[y][x] !== '.') continue
      arr[y][x] = '6'
    }
  }
  return arr
}

const getFace = (cube: string[][], face: string, faceSize: number) => {
  const x = cube
    .map((line) => line.findIndex((c) => c === face))
    .filter((i) => i >= 0)
    .reduce(min)
  const y = range(x, x + faceSize - 1)
    .map((x) => cube.findIndex((line) => line[x] === face))
    .reduce(min)
  return { x, y }
}

const useSolution = (
  grid: string[][],
  dirs: string,
  warpFn: (grid: string[][], pos: Pos) => Pos
) => {
  const showVisualization = useStore((s) => s.showVisualization)
  const [score, setScore] = useState<number>()
  const [output, setOutput] = useState<string>()

  useEffect(() => {
    setScore(undefined)
    setOutput(undefined)
    const output = parseInput().grid
    const gen = navigate(grid, dirs, warpFn)
    let lastPos: Pos
    let id: NodeJS.Timeout

    const tick = () => {
      const { value, done } = gen.next()
      if (value) {
        lastPos = value
        if (showVisualization) {
          output[value.y][value.x] = value.dir
          setOutput(output2dArray(output))
        }
      }
      if (done) {
        setScore(getScore(lastPos!.x, lastPos!.y, lastPos!.dir))
        clearInterval(id)
        return false
      }
      return true
    }

    if (showVisualization) id = setIntervalImmediate(tick, 50)
    else while (tick()) {}

    return () => clearInterval(id)
  }, [showVisualization, grid, dirs, warpFn])

  return { score, output }
}

export const Part1 = () => {
  const { grid, dirs } = useRef(parseInput()).current
  const warpFn = useCallback((grid: string[][], { x, y, dir }: Pos) => {
    if (dir === Dir.Right) {
      x = grid[y].findIndex((c) => c !== ' ')
    } else if (dir === Dir.Left) {
      x = findLastIndex(grid[y], (c) => c !== ' ')
    } else if (dir === Dir.Down) {
      y = grid.findIndex((row) => (row[x] ?? ' ') !== ' ')
    } else if (dir === Dir.Up) {
      y = findLastIndex(grid, (row) => (row[x] ?? ' ') !== ' ')
    }
    return { x, y, dir }
  }, [])
  const { score, output } = useSolution(grid, dirs, warpFn)

  return (
    <>
      {score && (
        <p>
          The final password is <Answer>{score}</Answer>.
        </p>
      )}
      <Visualization class={styles.Visualization}>{output}</Visualization>
    </>
  )
}

export const Part2 = () => {
  const { grid, dirs } = useRef(parseInput()).current
  const faceSize = useRef(getCubeFaceSize(grid)).current
  const cube = useRef(createCube(grid, faceSize)).current
  const warpFn = useCallback(
    (cube: string[][], { x, y, dir: oldDir }: Pos) => {
      const oldFace = cube[y][x]
      const { face, dir, flip } = cubeFaces[oldFace][oldDir]!
      const posOldFace = getFace(cube, oldFace, faceSize)!
      const posNewFace = getFace(cube, face, faceSize)!
      let offset
      if (oldDir === Dir.Up || oldDir === Dir.Down) {
        offset = x - posOldFace.x
      } else {
        offset = y - posOldFace.y
      }
      if (flip) offset = faceSize - 1 - offset
      const result = {
        dir,
        ...{
          [Dir.Up]: {
            x: posNewFace.x + offset,
            y: posNewFace.y + faceSize - 1
          },
          [Dir.Down]: { x: posNewFace.x + offset, y: posNewFace.y },
          [Dir.Left]: {
            x: posNewFace.x + faceSize - 1,
            y: posNewFace.y + offset
          },
          [Dir.Right]: { x: posNewFace.x, y: posNewFace.y + offset }
        }[dir]
      }
      return result
    },
    [faceSize]
  )
  const { score, output } = useSolution(cube, dirs, warpFn)
  return (
    <>
      {score && (
        <p>
          The final password when navigating on the cube is{' '}
          <Answer>{score}</Answer>.
        </p>
      )}
      <Visualization class={styles.Visualization}>{output}</Visualization>
    </>
  )
}
