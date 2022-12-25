import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { sum } from '../util'

const parseInput = () => input.split('\n')

const digits: Record<string, number> = {
  2: 2,
  1: 1,
  0: 0,
  '-': -1,
  '=': -2
}

const decrement: Record<string, string> = {
  2: '1',
  1: '0',
  0: '-',
  '-': '='
}

const convertToNum = (str: string) => {
  let total = 0
  let power = 1
  for (let i = str.length - 1; i >= 0; i--) {
    total += digits[str[i]] * power
    power *= 5
  }
  return total
}

const convertToStr = (num: number) => {
  const str = []
  let power = 1
  while (true) {
    str.push('2')
    if (num / (power * 2) <= 1) break
    power *= 5
  }

  for (let i = 0; i < str.length; i++) {
    while (str[i] !== '=') {
      const total = convertToNum(str.join(''))
      const remaining = total - num
      if (remaining < power) break
      str[i] = decrement[str[i]]
    }
    power /= 5
  }
  return str.join('')
}

export const Part1 = () => {
  const total = parseInput().map(convertToNum).reduce(sum)
  const snafu = convertToStr(total)
  return (
    <p>
      You should supply <Answer>{snafu}</Answer> to Bob's console.
    </p>
  )
}
