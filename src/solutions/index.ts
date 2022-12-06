import { FunctionComponent } from 'preact'
import * as day1 from './01'

export interface Solution {
  Part1?: FunctionComponent
  Part2?: FunctionComponent
}

const solutions: Solution[] = [day1]

export default solutions
