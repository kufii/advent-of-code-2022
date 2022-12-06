import { h } from 'preact'
import feather, { FeatherIconNames } from 'feather-icons'
import style from './style.css'

interface Props {
  name: FeatherIconNames
}

export const Icon = ({ name }: Props) => (
  <span
    class={style.container}
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: feather.icons[name].toSvg() }}
  />
)
