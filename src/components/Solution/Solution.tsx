import { FunctionComponent, h } from 'preact'
import style from './style.css'

interface Solution {
  Part1?: FunctionComponent
  Part2?: FunctionComponent
}

interface Props {
  part: 1 | 2
  solution: Solution
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
