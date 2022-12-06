import { h } from 'preact'
import { Icon } from '/components'
import { setNavOpen, useStore } from '/store'
import { classNames, newTab } from '/shared/web-utilities/util'
import style from './style.css'

export const Header = () => {
  const navOpen = useStore((s) => s.navOpen)
  return (
    <header onClick={() => setNavOpen(false)} class={style.header}>
      <button
        class={classNames(style.navBtn, style.skipContent)}
        onClick={() =>
          (
            document
              .getElementById('main_content')
              ?.querySelector(
                'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])'
              ) as HTMLElement
          )?.focus()
        }
      >
        Skip nav
      </button>
      <button
        class={style.navBtn}
        onClick={(e) => {
          setNavOpen(!navOpen)
          e.stopImmediatePropagation()
        }}
        aria-label="open navigation menu"
      >
        <Icon name="menu" />
      </button>
      <span>
        <a class={style.logo} href="#/">
          advent of code 2022
        </a>
      </span>
      <a
        class={style.navBtn}
        href="https://github.com/kufii/advent-of-code-2022"
        aria-label="open github repository"
        {...newTab}
      >
        <Icon name="github" />
      </a>
    </header>
  )
}
