import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { Point, min, max } from '../util'

interface Signal {
  sensor: Point
  beacon: Point
}

const parseInput = () =>
  input
    .split('\n')
    .map(
      (line) =>
        line.match(
          /Sensor at x=(?<sensorX>[-\d]+), y=(?<sensorY>[-\d]+): closest beacon is at x=(?<beaconX>[-\d]+), y=(?<beaconY>[-\d]+)/u
        )!.groups!
    )
    .map(({ sensorX, sensorY, beaconX, beaconY }) => ({
      sensor: { x: Number(sensorX), y: Number(sensorY) },
      beacon: { x: Number(beaconX), y: Number(beaconY) }
    }))

const getDistance = (a: Point, b: Point) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y)

const getNumNoBeacons = (signals: Signal[], y: number) => {
  const minX = signals
    .map(({ sensor, beacon }) => sensor.x - getDistance(sensor, beacon))
    .reduce(min)
  const maxX = signals
    .map(({ sensor, beacon }) => sensor.x + getDistance(sensor, beacon))
    .reduce(max)
  let count = 0
  for (let x = minX; x <= maxX; x++) {
    if (
      signals.some(
        ({ sensor, beacon }) =>
          getDistance(sensor, { x, y }) <= getDistance(sensor, beacon) &&
          !(x === beacon.x && y === beacon.y)
      )
    )
      count++
  }
  return count
}

const getFrequency = (signals: Signal[], max: number) => {
  let x = 0
  let y = 0
  for (y = 0; y <= max; y++) {
    for (x = 0; x <= max; x++) {
      let hit = false
      for (const { sensor, beacon } of signals) {
        const distance =
          Math.abs(sensor.x - beacon.x) + Math.abs(sensor.y - beacon.y)
        const distance2 = Math.abs(sensor.x - x) + Math.abs(sensor.y - y)
        if (distance2 <= distance) {
          const yDistance = Math.abs(sensor.y - y)
          x = Math.max(x, sensor.x + (distance - yDistance))
          hit = true
          break
        }
      }
      if (!hit) return 4000000 * x + y
    }
  }
}

export const Part1 = () => {
  const signals = parseInput()
  const count = getNumNoBeacons(signals, 2000000)
  return (
    <p>
      In the row where y=2000000, there are <Answer>{count}</Answer> positions
      that cannot contain a beacon.
    </p>
  )
}

export const Part2 = () => {
  const signals = parseInput()
  const frequency = getFrequency(signals, 4000000)
  return (
    <p>
      The tuning frequency is <Answer>{frequency}</Answer>.
    </p>
  )
}
