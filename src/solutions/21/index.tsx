import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { memoize } from '../util'

type Operator = '+' | '-' | '*' | '/'

interface Value {
  left: number | string
  op?: Operator
  right?: number | string
}

type Monkeys = Record<string, Value>

const parseInput = () =>
  input
    .split('\n')
    .map(
      (line) =>
        line.match(
          /(?<name>.+): (?<left>[a-z\d]+) ?(?<op>[+-/*])? ?(?<right>[a-z\d]+)?/u
        )!.groups!
    )
    .reduce(
      (acc, { name, left, op, right }) => ({
        ...acc,
        [name]: {
          left: isNaN(Number(left)) ? left : Number(left),
          op: op as Operator,
          right: isNaN(Number(right)) ? right : Number(right)
        }
      }),
      {} as Monkeys
    )

const getRoot = (monkeys: Monkeys, yell?: number) => {
  const getValue = memoize((name: string): number | [number, number] => {
    if (yell !== undefined && name === 'humn') return yell
    let { left, op, right } = monkeys[name]
    left = (typeof left === 'number' ? left : getValue(left)) as number
    if (!op || !right) return left
    right = (typeof right === 'number' ? right : getValue(right)) as number
    if (yell !== undefined && name === 'root') {
      return [left, right]
    }
    const ops: Record<Operator, number> = {
      '+': left + right,
      '-': left - right,
      '/': left / right,
      '*': left * right
    }
    return ops[op]
  })
  return getValue('root')
}

export const Part1 = () => {
  const monkeys = parseInput()
  const result = getRoot(monkeys) as number
  return (
    <p>
      The monkey named root will yell <Answer>{result}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const monkeys = parseInput()
  let result
  let factor = 1000000000000
  const increases =
    (getRoot(monkeys, 0) as number[])[0] < (getRoot(monkeys, 1) as number[])[0]
  for (let n = factor; n < Infinity; n += factor) {
    const [left, right] = getRoot(monkeys, n) as [number, number]
    if (left === right) {
      result = n
      break
    }
    if (
      (factor > 0 && (increases ? left > right : left < right)) ||
      (factor < 0 && (increases ? left < right : left > right))
    )
      factor = (factor / 10) * -1
  }
  return (
    <p>
      You need to yell <Answer>{result}</Answer> to pass root's equality test.
    </p>
  )
}
