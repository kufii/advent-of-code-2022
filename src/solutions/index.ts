import { FunctionComponent } from 'preact'
import * as day1 from './01'
import * as day2 from './02'
import * as day3 from './03'
import * as day4 from './04'
import * as day5 from './05'
import * as day6 from './06'
import * as day7 from './07'
import * as day8 from './08'
import * as day9 from './09'
import * as day10 from './10'
import * as day11 from './11'
import * as day12 from './12'
import * as day13 from './13'
import * as day14 from './14'
import * as day15 from './15'
import * as day16 from './16'
import * as day17 from './17'

export interface Solution {
  Part1?: FunctionComponent
  Part2?: FunctionComponent
}

const solutions: Solution[] = [
  day1,
  day2,
  day3,
  day4,
  day5,
  day6,
  day7,
  day8,
  day9,
  day10,
  day11,
  day12,
  day13,
  day14,
  day15,
  day16,
  day17
]

export default solutions
