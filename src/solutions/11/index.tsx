import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { lcm, nTimes, product, sortNumDesc } from '../util'

type Operator = '*' | '+'

interface Monkey {
  items: number[]
  operator: '*' | '+'
  n: 'old' | number
  divisible: number
  ifTrue: number
  ifFalse: number
}

const parseInput = (): Monkey[] =>
  input.split('\n\n').map((block) => {
    const items = block
      .match(/Starting items: (?<items>.+)/u)!
      .groups!.items.split(',')
      .map(Number)
    const { operator, n } = block.match(
      /Operation: new = old (?<operator>.) (?<n>.+)/u
    )!.groups!
    const { divisible } = block.match(/Test: divisible by (?<divisible>\d+)/u)!
      .groups!
    const { ifTrue } = block.match(/If true: throw to monkey (?<ifTrue>\d+)/u)!
      .groups!
    const { ifFalse } = block.match(
      /If false: throw to monkey (?<ifFalse>\d+)/u
    )!.groups!
    return {
      items,
      operator: operator as Operator,
      n: n === 'old' ? n : Number(n),
      divisible: Number(divisible),
      ifTrue: Number(ifTrue),
      ifFalse: Number(ifFalse)
    }
  })

const keepAway = (
  monkeys: Monkey[],
  times: number,
  calmingMethod: (n: number) => number
) => {
  const business = Array(monkeys.length)
    .fill(null)
    .map(() => 0)
  nTimes(times, () => {
    for (let i = 0; i < monkeys.length; i++) {
      const monkey = monkeys[i]
      const { operator, n, divisible, ifTrue, ifFalse } = monkey
      while (monkey.items.length) {
        let item = monkey.items.shift()!
        if (operator === '*') item *= n === 'old' ? item : n
        else item += n === 'old' ? item : n
        item = calmingMethod(item)
        const throwTo = item % divisible === 0 ? ifTrue : ifFalse
        monkeys[throwTo].items.push(item)
        business[i]++
      }
    }
  })
  return business.sort(sortNumDesc).slice(0, 2).reduce(product)
}

export const Part1 = () => {
  const monkeys = parseInput()
  const business = keepAway(monkeys, 20, (n) => Math.floor(n / 3))
  return (
    <p>
      The level of monkey business after 20 rounds is{' '}
      <Answer>{business}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const monkeys = parseInput()
  const mod = monkeys.map((m) => m.divisible).reduce(lcm)
  const business = keepAway(monkeys, 10000, (n) => (n %= mod))
  return (
    <p>
      The level of monkey business after 10000 rounds is{' '}
      <Answer>{business}</Answer>.
    </p>
  )
}
