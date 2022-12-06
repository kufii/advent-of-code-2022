import { h } from 'preact'
import { classNames } from '/shared/web-utilities/util'
import { setNavOpen, useStore } from '/store'
import style from './style.css'
import { range } from '/solutions/util'

export const Nav = () => {
  const [navOpen, day] = useStore([(s) => s.navOpen, (s) => s.day])
  return (
    <div
      id="nav-menu"
      onClick={() => setNavOpen(false)}
      class={classNames(style.sideNav, navOpen && style.active)}
      role="dialog"
      aria-modal
      aria-hidden={!navOpen}
    >
      <nav onClick={(e) => e.stopImmediatePropagation()}>
        <ul>
          {range(1, 25).map((d) => (
            <li key={d}>
              <a
                href={`#/${d}`}
                class={classNames(d === day && style.active)}
                tabIndex={navOpen ? undefined : -1}
              >
                Day {d}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
