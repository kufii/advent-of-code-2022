import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { max, memoize, product, range, sum } from '../util'
import structuredClone from '@ungap/structured-clone'
import { useEffect, useState } from 'preact/hooks'
import { setIntervalImmediate } from '/shared/web-utilities/util'

interface Materials {
  ore: number
  clay: number
  obsidian: number
  geode: number
}

const mats = ['geode', 'obsidian', 'clay', 'ore'] as const
const preciousMats = ['geode', 'obsidian']

interface Blueprint {
  id: number
  ore: Materials
  clay: Materials
  obsidian: Materials
  geode: Materials
}

const parseInput = (): Blueprint[] =>
  input
    .split('\n')
    .map(
      (line) =>
        line.match(
          /Blueprint (?<id>\d+): Each ore robot costs (?<ore>\d+) ore. Each clay robot costs (?<clay>\d+) ore. Each obsidian robot costs (?<obsidianOre>\d+) ore and (?<obsidianClay>\d+) clay. Each geode robot costs (?<geodeOre>\d+) ore and (?<geodeObsidian>\d+) obsidian./u
        )!.groups!
    )
    .map(
      ({
        id,
        ore,
        clay,
        obsidianOre,
        obsidianClay,
        geodeOre,
        geodeObsidian
      }) => ({
        id: Number(id),
        ore: { ore: Number(ore), clay: 0, obsidian: 0, geode: 0 },
        clay: { ore: Number(clay), clay: 0, obsidian: 0, geode: 0 },
        obsidian: {
          ore: Number(obsidianOre),
          clay: Number(obsidianClay),
          obsidian: 0,
          geode: 0
        },
        geode: {
          ore: Number(geodeOre),
          clay: 0,
          obsidian: Number(geodeObsidian),
          geode: 0
        }
      })
    )

const collectGeode = function* (
  blueprint: Blueprint,
  t = 24,
  yieldEvery = 10000
) {
  const maxOreRequirement = mats.map((m) => blueprint[m].ore).reduce(max)
  let geode = 0

  const recurse = memoize(function* (
    materials: Materials = { ore: 0, clay: 0, obsidian: 0, geode: 0 },
    robots: Materials = {
      ore: 1,
      clay: 0,
      obsidian: 0,
      geode: 0
    },
    time = t
  ): Generator<undefined> {
    yield
    geode = Math.max(geode, materials.geode)
    if (
      time <= 0 ||
      range(1, time)
        .reverse()
        .map((t, i) => (robots.geode + i) * t)
        .reduce(sum) +
        materials.geode <=
        geode
    )
      return

    const original = structuredClone(materials)
    mats.forEach((mat) => (materials[mat] += robots[mat]))

    for (const mat of mats) {
      const costs = blueprint[mat]
      if (
        mats.some((m) => original[m] < costs[m]) ||
        (mat !== 'geode' &&
          robots[mat] >= mats.map((m) => blueprint[m][mat]).reduce(max))
      )
        continue
      const newMats = structuredClone(materials)
      const newRobots = structuredClone(robots)
      mats.forEach((m) => (newMats[m] -= costs[m]))
      newRobots[mat]++
      yield* recurse(newMats, newRobots, time - 1)
      if (preciousMats.includes(mat)) return
    }
    if (original.ore <= maxOreRequirement)
      yield* recurse(materials, robots, time - 1)
  })

  let n = 0
  for (const _ of recurse()) {
    if (n % yieldEvery === 0) yield _
    n++
  }
  recurse()

  yield { geode, quality: geode * blueprint.id }
}

export const Part1 = () => {
  const [result, setResult] = useState<number>()

  useEffect(() => {
    setResult(undefined)
    const blueprints = parseInput()
    let total = 0
    let i = 0
    const nextBlueprint = () => {
      i++
      return collectGeode(blueprints[i - 1])
    }
    let gen = nextBlueprint()

    const tick = () => {
      const { value, done } = gen.next()
      if (value?.quality) total += value.quality
      if (done) {
        if (i < blueprints.length) gen = nextBlueprint()
        else {
          setResult(total)
          clearInterval(id)
        }
      }
    }
    const id = setIntervalImmediate(tick, 0)

    return () => clearInterval(id)
  }, [])

  return result ? (
    <p>
      The sum of the quality levels of all blueprints is{' '}
      <Answer>{result}</Answer>.
    </p>
  ) : (
    <p>Running...</p>
  )
}

export const Part2 = () => {
  const [result, setResult] = useState<number>()

  useEffect(() => {
    setResult(undefined)
    const blueprints = parseInput().slice(0, 3)
    const results: number[] = []
    let i = 0
    const nextBlueprint = () => {
      i++
      return collectGeode(blueprints[i - 1], 32)
    }
    let gen = nextBlueprint()

    const tick = () => {
      const { value, done } = gen.next()
      if (value?.geode) results.push(value.geode)

      if (done) {
        if (i < blueprints.length) gen = nextBlueprint()
        else {
          setResult(results.reduce(product))
          clearInterval(id)
        }
      }
    }
    const id = setIntervalImmediate(tick, 0)

    return () => clearInterval(id)
  }, [])

  return result ? (
    <p>
      The product of the largest number of geodes you can open using the first 3
      blueprints is <Answer>{result}</Answer>.
    </p>
  ) : (
    <p>Running...</p>
  )
}
