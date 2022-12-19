import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { max, memoize, product, range, sum } from '../util'
import structuredClone from '@ungap/structured-clone'

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

const collectGeode = (blueprint: Blueprint, t = 24) => {
  const maxOreRequirement = mats.map((m) => blueprint[m].ore).reduce(max)
  let geode = 0

  const recurse = memoize(
    (
      materials: Materials = { ore: 0, clay: 0, obsidian: 0, geode: 0 },
      robots: Materials = {
        ore: 1,
        clay: 0,
        obsidian: 0,
        geode: 0
      },
      time = t
    ) => {
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
        recurse(newMats, newRobots, time - 1)
        if (preciousMats.includes(mat)) return
      }
      if (original.ore <= maxOreRequirement)
        recurse(materials, robots, time - 1)
    }
  )
  recurse()

  return { geode, quality: geode * blueprint.id }
}

export const Part1 = () => {
  const blueprints = parseInput()
  const total = blueprints.map((b) => collectGeode(b).quality).reduce(sum)

  return (
    <p>
      The sum of the quality levels of all blueprints is{' '}
      <Answer>{total}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const blueprints = parseInput().slice(0, 3)
  const result = blueprints
    .map((b) => collectGeode(b, 32).geode)
    .reduce(product)

  return (
    <p>
      The product of the largest number of geodes you can open using the first 3
      blueprints is <Answer>{result}</Answer>.
    </p>
  )
}
