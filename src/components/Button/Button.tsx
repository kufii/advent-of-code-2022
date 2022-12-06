import { ComponentChildren, h } from 'preact'
import { classNames, newTab } from '/shared/web-utilities/util'
import style from './style.css'

interface BaseProps {
  primary?: boolean
  plain?: boolean
  compact?: boolean
  disabled?: boolean
  ariaLabel?: string
  onClick?(): void
  url?: string
  external?: boolean
  class?: string
  children: ComponentChildren
}

interface LinkProps extends BaseProps {
  url: string
}
interface ButtonProps extends BaseProps {
  onClick(): void
}

type Props = LinkProps | ButtonProps

export const Button = ({
  primary,
  plain,
  compact,
  disabled,
  ariaLabel,
  class: className,
  onClick,
  url,
  external,
  children
}: Props) => {
  const props = {
    class: classNames(
      style.button,
      primary && style.primary,
      plain && style.plain,
      compact && style.compact,
      className
    ),
    disabled,
    onClick: disabled ? undefined : onClick,
    href: disabled ? undefined : url,
    'aria-label': ariaLabel,
    ...(external && newTab)
  }
  return props.href ? (
    <a {...props}>{children}</a>
  ) : (
    <button {...props}>{children}</button>
  )
}
