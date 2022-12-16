import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { dijkstra, sum } from '../util'
import { useEffect, useState } from 'preact/hooks'
import { setIntervalImmediate } from '/shared/web-utilities/util'

interface Valve {
  flow: number
  valves: string[]
}

type Valves = Record<string, Valve>

const parseInput = () =>
  input
    .split('\n')
    .map(
      (line) =>
        line.match(
          /^Valve (?<name>.+) has flow rate=(?<flow>\d+); tunnels? leads? to valves? (?<tunnel>.+)$/u
        )!.groups!
    )
    .reduce(
      (acc, { name, flow, tunnel }) => ({
        ...acc,
        [name]: {
          flow: Number(flow),
          valves: tunnel.split(', ')
        }
      }),
      {} as Valves
    )

const getMaxPressure = function* (
  valves: Valves,
  timeYou: number,
  timeElephant = 0,
  yieldEvery?: number
) {
  const closed = Object.keys(valves).filter((key) => valves[key].flow > 0)
  const paths = [...closed, 'AA']
    .map((start) => ({
      start,
      paths: closed.map((end) => ({
        end,
        distance: dijkstra(start, end, (key) => valves[key].valves).distance!
      }))
    }))
    .reduce(
      (acc, from) => ({
        ...acc,
        [from.start]: from.paths.reduce(
          (acc, to) => ({
            ...acc,
            [to.end]: to.distance
          }),
          {} as Record<string, number>
        )
      }),
      {} as Record<string, Record<string, number>>
    )

  const moveTo = (from: string, to: string, time: number, pressure: number) => {
    const distance = paths[from][to]
    time = Math.max(time - distance - 1, 0)
    const flow = time > 0 ? valves[to].flow * time : 0
    return [time, pressure + flow]
  }

  let max = 0
  const openValves = function* (
    time = 26,
    time2 = 26,
    current = 'AA',
    current2 = 'AA',
    pressure = 0,
    pressure2 = 0,
    visited = new Set<string>()
  ): Generator<undefined> {
    visited = new Set(visited)
    visited.add(current)
    visited.add(current2)
    const remaining = closed.filter((key) => !visited.has(key))
    if ((time <= 1 && time2 <= 1) || !remaining.length) {
      const total = pressure + pressure2
      if (total > max) max = total
      return
    }
    const bestPossible =
      pressure +
      pressure2 +
      remaining
        .map((key) => valves[key].flow * (Math.max(time, time2) - 1))
        .reduce(sum)
    if (bestPossible <= max) return

    const iterate = function* (remaining: string[]) {
      for (const next of remaining) {
        const [newTime, newPressure] = moveTo(current, next, time, pressure)
        const remaining2 = remaining.filter((key) => key !== next)
        if (time2 <= 1 || !remaining2.length) {
          yield* openValves(
            newTime,
            time2,
            next,
            current2,
            newPressure,
            pressure2,
            visited
          )
        } else {
          yield* iterate2(remaining2, next, newTime, newPressure)
        }
      }
    }

    const iterate2 = function* (
      remaining: string[],
      next: string,
      newTime: number,
      newPressure: number
    ) {
      for (const next2 of remaining) {
        const [newTime2, newPressure2] = moveTo(
          current2,
          next2,
          time2,
          pressure2
        )
        yield* openValves(
          newTime,
          newTime2,
          next,
          next2,
          newPressure,
          newPressure2,
          visited
        )
      }
    }

    if (time > 1) {
      yield* iterate(remaining)
    } else {
      yield* iterate2(remaining, current, time, pressure)
    }
    yield
  }
  let n = 0
  for (const _ of openValves(timeYou, timeElephant)) {
    n++
    if (yieldEvery && n % yieldEvery === 0) yield _
  }
  yield max
}

export const Part1 = () => {
  const valves = parseInput()
  const [pressure] = [...getMaxPressure(valves, 30)]
  return (
    <p>
      The most pressure you can release is <Answer>{pressure}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const [result, setResult] = useState<number>()
  useEffect(() => {
    const valves = parseInput()
    const gen = getMaxPressure(valves, 26, 26, 10000)
    const id = setIntervalImmediate(() => {
      const { value, done } = gen.next()
      if (value) setResult(value)
      if (done) clearInterval(id)
    }, 0)
    return () => clearInterval(id)
  }, [])

  return result ? (
    <p>
      The most pressure you can release while working with the elephant is{' '}
      <Answer>{result}</Answer>.
    </p>
  ) : (
    <p>Running... This takes a very long time...</p>
  )
}
