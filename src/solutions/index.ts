import { FunctionComponent } from 'preact'
import * as day1 from './01'
import * as day2 from './02'
import * as day3 from './03'
import * as day4 from './04'
import * as day5 from './05'

export interface Solution {
  Part1?: FunctionComponent
  Part2?: FunctionComponent
}

const solutions: Solution[] = [day1, day2, day3, day4, day5]

export default solutions
