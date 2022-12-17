import { h } from 'preact'
import dedent from 'dedent'
import { Answer } from '/components'
import input from './input'
import { min, range } from '../util'
import { useEffect, useState } from 'preact/hooks'
import { setIntervalImmediate } from '/shared/web-utilities/util'

type Dir = '<' | '>'

interface Rock {
  x: number
  y: number
  shape: string[][]
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
].map((shape) => shape.split('\n').map((line) => [...line]))

const dropRocks = function* (
  jets: Dir[],
  numRocks: number,
  width = 7
): Generator<Rock | number> {
  const rocks: Rock[] = []

  const cellOpen = (x: number, y: number) =>
    !rocks.some((rock) =>
      rock.shape.some((line, rockY) =>
        line.some(
          (cell, rockX) =>
            cell === '#' && rock.y + rockY === y && rock.x + rockX === x
        )
      )
    )

  const canFit = (shape: string[][], x: number, y: number) =>
    !shape.some((line, shapeY) =>
      line.some(
        (cell, shapeX) =>
          cell === '#' &&
          (x + shapeX < 0 ||
            x + shapeX >= width ||
            y + shapeY > 0 ||
            !cellOpen(x + shapeX, y + shapeY))
      )
    )

  const getTop = () => rocks.map((r) => r.y).reduce(min, 0)

  const getCacheKey = (minY: number, i: number) =>
    [
      range(minY, minY + 16)
        .map((y) =>
          range(0, width - 1)
            .map((x) => (cellOpen(x, y) ? '.' : '#'))
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
    }
    rocks.push(rock)
    yield rock
  }
  yield Math.abs(getTop()) + 1
}

export const Part1 = () => {
  const [result, setResult] = useState<number>()
  const n = 2022

  useEffect(() => {
    setResult(undefined)
    const jets = parseInput()
    const gen = dropRocks(jets, n)
    const tick = () => {
      const { value, done } = gen.next()
      if (value && typeof value === 'number') {
        setResult(value)
      }
      if (done) clearInterval(id)
    }
    const id = setIntervalImmediate(tick, 0)
    return () => clearInterval(id)
  }, [])

  return result ? (
    <p>
      The tower will be <Answer>{result}</Answer> units tall after {n} rocks
      have stopped falling.
    </p>
  ) : (
    <p>Running...</p>
  )
}

export const Part2 = () => {
  const [result, setResult] = useState<number>()
  const n = 1000000000000

  useEffect(() => {
    setResult(undefined)
    const jets = parseInput()
    const gen = dropRocks(jets, n)
    const tick = () => {
      const { value, done } = gen.next()
      if (value && typeof value === 'number') {
        setResult(value)
      }
      if (done) clearInterval(id)
    }
    const id = setIntervalImmediate(tick, 0)
    return () => clearInterval(id)
  }, [])

  return result ? (
    <p>
      The tower will be <Answer>{result}</Answer> units tall after {n} rocks
      have stopped falling.
    </p>
  ) : (
    <p>Running...</p>
  )
}
