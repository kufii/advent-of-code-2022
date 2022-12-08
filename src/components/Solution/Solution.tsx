import { h } from 'preact'
import { Solution as SolutionType } from '/solutions'
import style from './style.css'

interface Props {
  part: 1 | 2
  solution: SolutionType
}

export const Solution = ({ part, solution }: Props) => {
  const SolutionPart = part === 1 ? solution.Part1 : solution.Part2
  return SolutionPart ? (
    <div class={style.container}>
      <h2>Part {part}</h2>
      <SolutionPart />
    </div>
  ) : null
}
