import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { min, nTimes, output2dArray, parse2dArray } from '../util'

const parseInput = () => {
  const [block1, block2] = input.split('\n\n')
  return {
    grid: parse2dArray(block1, String),
    dirs: block2
  }
}

const deltas = {
  U: { dx: 0, dy: -1 },
  D: { dx: 0, dy: 1 },
  L: { dx: -1, dy: 0 },
  R: { dx: 1, dy: 0 }
}

const turning = {
  U: {
    R: 'R',
    L: 'L'
  },
  D: {
    R: 'L',
    L: 'R'
  },
  L: {
    R: 'U',
    L: 'D'
  },
  R: {
    R: 'D',
    L: 'U'
  }
}
const scores = {
  R: 0,
  D: 1,
  L: 2,
  U: 3
}

export const Part1 = () => {
  let { grid, dirs } = parseInput()
  const draw = grid.slice().map((line) => line.slice())
  let y = 0
  let x = grid[0].findIndex((c) => c === '.')
  let dir = 'R'
  draw[y][x] = dir
  while (dirs) {
    const num = dirs.match(/^\d+/u)?.[0]
    if (num) {
      dirs = dirs.slice(num.length)
      const { dx, dy } = deltas[dir]
      nTimes(Number(num), () => {
        let nextX = x + dx
        let nextY = y + dy
        let cell = grid[nextY]?.[nextX] ?? ' '
        if (cell === ' ') {
          if (dx > 0) {
            nextX = grid[nextY].findIndex((c) => c !== ' ')
          } else if (dx < 0) {
            nextX = grid[nextY].length - 1
          } else if (dy > 0) {
            nextY = grid.findIndex((row) => row[nextX] !== ' ')
          } else if (dy < 0) {
            for (let y = grid.length - 1; y >= 0; y--) {
              if ((grid[y][nextX] ?? ' ') !== ' ') {
                nextY = y
                break
              }
            }
          }
        }
        cell = grid[nextY]?.[nextX] ?? ' '
        if (cell === '#') return
        x = nextX
        y = nextY
        draw[y][x] = dir
      })
    }
    const turn = dirs.match(/[RL]/u)?.[0]
    if (turn) {
      dirs = dirs.slice(turn.length)
      dir = turning[dir][turn]
    }
  }
  console.log(output2dArray(draw))
  const score = 1000 * (y + 1) + 4 * (x + 1) + scores[dir]
  return (
    <p>
      Hello World <Answer>{score}</Answer>
    </p>
  )
}

const cubeFaces = {
  1: {
    U: { face: '6', dir: 'R' },
    L: { face: '5', dir: 'R', flip: true }
  },
  2: {
    U: { face: '6', dir: 'U' },
    R: { face: '4', dir: 'L', flip: true },
    D: { face: '3', dir: 'L' }
  },
  3: {
    L: { face: '5', dir: 'D' },
    R: { face: '2', dir: 'U' }
  },
  4: {
    R: { face: '2', dir: 'L', flip: true },
    D: { face: '6', dir: 'L' }
  },
  5: {
    U: { face: '3', dir: 'R' },
    L: { face: '1', dir: 'R', flip: true }
  },
  6: {
    L: { face: '1', dir: 'D' },
    R: { face: '4', dir: 'U' },
    D: { face: '2', dir: 'D' }
  }
}

const createCube = (arr: string[][]) => {
  const faceSize = arr.map((line) => line.join('').trim().length).reduce(min)
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
  const faceX = cube
    .map((line) => line.findIndex((c) => c === face))
    .filter((i) => i >= 0)
    .reduce(min)
  for (let y = 0; y < cube.length; y++) {
    for (let x = faceX; x < faceX + faceSize; x++) {
      if (cube[y][x] === face) {
        return { x: faceX, y }
      }
    }
  }
}

export const Part2 = () => {
  let { grid: grid2, dirs } = parseInput()
  // dirs = dirs.slice(0, 50)
  const faceSize = grid2.map((line) => line.join('').trim().length).reduce(min)
  let y = 0
  let x = grid2[0].findIndex((c) => c === '.')
  const cube = createCube(grid2)
  const draw = cube.slice().map((line) => line.slice())
  let dir = 'R'
  draw[y][x] = dir
  while (dirs) {
    const num = dirs.match(/^\d+/u)?.[0]
    if (num) {
      dirs = dirs.slice(num.length)
      nTimes(Number(num), () => {
        const { dx, dy } = deltas[dir]
        let nextX = x + dx
        let nextY = y + dy
        let cell = cube[nextY]?.[nextX] ?? ' '
        let nextDir = dir
        if (cell === ' ') {
          const currentFace = cube[y][x]
          const { face, dir: newDir, flip } = cubeFaces[currentFace][dir]
          const posOldFace = getFace(cube, currentFace, faceSize)!
          const posNewFace = getFace(cube, face, faceSize)!
          let offset
          if (dir === 'U' || dir === 'D') {
            offset = x - posOldFace.x
          } else {
            offset = y - posOldFace.y
          }
          if (flip) offset = faceSize - 1 - offset
          if (newDir === 'U') {
            nextY = posNewFace.y + faceSize - 1
            nextX = posNewFace.x + offset
          } else if (newDir === 'D') {
            nextY = posNewFace.y
            nextX = posNewFace.x + offset
          } else if (newDir === 'L') {
            nextY = posNewFace.y + offset
            nextX = posNewFace.x + faceSize - 1
          } else if (newDir === 'R') {
            nextY = posNewFace.y + offset
            nextX = posNewFace.x
          }
          nextDir = newDir
          console.log(x, y, dir, currentFace, nextX, nextY, nextDir, face)
        }
        cell = cube[nextY]?.[nextX] ?? ' '
        if (cell === '#') return
        x = nextX
        y = nextY
        dir = nextDir
        draw[y][x] = dir
      })
    }
    const turn = dirs.match(/[RL]/u)?.[0]
    if (turn) {
      dirs = dirs.slice(turn.length)
      dir = turning[dir][turn]
    }
  }
  console.log(output2dArray(draw))
  const score = 1000 * (y + 1) + 4 * (x + 1) + scores[dir]
  return (
    <p>
      Hello World <Answer>{score}</Answer>
    </p>
  )
}
