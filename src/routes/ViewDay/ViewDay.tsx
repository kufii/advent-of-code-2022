import { h, Fragment } from 'preact'
import { useEffect } from 'preact/hooks'
import { Button, CodeViewer, Icon, Solution } from '/components'
import days, { Solution as SolutionType } from '/solutions'
import { setDay, setPart, useStore } from '/store'
import NotFound from '../NotFound'
import { ShowCodeButton } from './components'
import style from './style.css'
import { classNames } from '/shared/web-utilities/util'

interface Props {
  day?: string
}

const parseDay = (dayString?: string) => {
  if (!(dayString || '').match(/^\d*$/u)) return null
  const day = Number(dayString || '1')
  if (day < 1 || day > 25) return null
  return day
}

export const ViewDay = ({ day: dayString }: Props) => {
  const day = parseDay(dayString)
  const part = useStore((s) => s.part)

  useEffect(() => {
    if (day) setDay(day)
  }, [day])

  if (!day) return <NotFound />
  const solution = days[day - 1] as SolutionType | undefined

  return (
    <div class={style.container}>
      <h1>
        Day {day}{' '}
        <Button
          url={`https://adventofcode.com/2022/day/${day}`}
          external
          plain
          compact
          ariaLabel="open advent of code problem"
        >
          <Icon name="external-link" />
        </Button>
      </h1>
      {!solution?.Part1 && !solution?.Part2 ? (
        <p>Day {day} is not yet implemented</p>
      ) : (
        <>
          <div class={style.buttons}>
            {solution?.Part1 && (
              <Button onClick={() => setPart(1)}>Part 1</Button>
            )}
            {solution?.Part2 && (
              <Button onClick={() => setPart(2)}>Part 2</Button>
            )}
            <ShowCodeButton />
          </div>
          <CodeViewer day={day} />
          {solution && part ? (
            <div class={style.solution}>
              <Solution solution={solution} part={part} />
            </div>
          ) : null}
        </>
      )}
      <div class={classNames(style.buttons, style.navButtons)}>
        <Button
          url={`#/${day - 1}`}
          plain
          disabled={day <= 1}
          ariaLabel="Previous day"
        >
          <Icon name="chevron-left" />
        </Button>
        <Button
          url={`#/${day + 1}`}
          plain
          disabled={day >= 25}
          ariaLabel="Next day"
        >
          <Icon name="chevron-right" />
        </Button>
      </div>
    </div>
  )
}
