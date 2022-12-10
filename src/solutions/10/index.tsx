import { h } from 'preact'
import { Answer, Visualization } from '/components'
import input from './input'
import { sum } from '../util'

interface Command {
  cmd: 'noop' | 'addx'
  n: number
}

enum Pixel {
  Off = ' ',
  On = '█'
}

const parseInput = () =>
  input
    .split('\n')
    .map((line) => line.match(/^(?<cmd>[^ ]+)(?<n> [^ ]+)?/u)!.groups!)
    .map(({ cmd, n }) => ({ cmd, n: Number(n ?? 0) } as Command))

const run = function* (program: Command[]) {
  let register = 1
  let cycle = 0
  for (const { cmd, n } of program) {
    cycle++
    yield { cycle, register }
    if (cmd === 'noop') continue
    cycle++
    yield { cycle, register }
    register += n
  }
}

const newLine = (size = 40) =>
  Array(size)
    .fill(null)
    .map(() => Pixel.Off)

export const Part1 = () => {
  const program = parseInput()
  const strength: number[] = []
  for (const { cycle, register } of run(program)) {
    strength.push(cycle * register)
  }
  const signals = [20, 60, 100, 140, 180, 220]
  const totalStrength = signals.map((i) => strength[i - 1]).reduce(sum)

  return (
    <p>
      The sum of the signal strengths during the{' '}
      {signals
        .map((n, i) => `${i === signals.length - 1 ? 'and ' : ''}${n}th`)
        .join(', ')}{' '}
      cycles is <Answer>{totalStrength}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const program = parseInput()
  let line = newLine()
  const drawing: string[] = []
  for (const { cycle, register } of run(program)) {
    const pos = (cycle - 1) % 40
    if (Math.abs(register - pos) <= 1) {
      line[pos] = Pixel.On
    }
    if (pos === 39) {
      drawing.push(line.join(''))
      line = newLine()
    }
  }
  return <Visualization forced>{drawing.join('\n')}</Visualization>
}
