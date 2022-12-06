import { h } from 'preact'
import { Button, Icon } from '/components'
import style from './style.css'

interface Props {
  children: string | number
}

export const Answer = ({ children }: Props) => (
  <span class={style.container}>
    <strong>{children}</strong>
    <Button
      onClick={() => navigator.clipboard?.writeText(children.toString())}
      plain
      compact
      ariaLabel="copy answer to clipboard"
    >
      <Icon name="clipboard" />
    </Button>
  </span>
)
