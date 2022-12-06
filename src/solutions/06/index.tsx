import { h } from 'preact'
import { Answer } from '/components'
import input from './input'

const findPacket = (size: number) => {
  for (let i = 0; i < input.length; i++) {
    const str = input.slice(i, i + size)
    if (new Set(str.split('')).size === size) return i + size
  }
}

export const Part1 = () => (
  <p>
    The first start-of-packet marker is detected after{' '}
    <Answer>{findPacket(4)}</Answer> characters.
  </p>
)

export const Part2 = () => (
  <p>
    The first start-of-message marker is detected after{' '}
    <Answer>{findPacket(14)}</Answer> characters.
  </p>
)
