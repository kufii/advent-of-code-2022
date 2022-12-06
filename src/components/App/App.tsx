import { h } from 'preact'
import { useEffect } from 'preact/hooks'
import { Route, Router } from 'preact-router'
import { createHashHistory } from 'history'

import { resetStore, useStore } from '/store'
import { Header, Nav } from '/components'
import NotFound from '/routes/NotFound'
import ViewDay from '/routes/ViewDay'
import style from './style.css'

export const App = () => {
  const navOpen = useStore((s) => s.navOpen)

  const history =
    typeof window !== 'undefined' ? createHashHistory() : undefined
  useEffect(() => {
    if (!history) return
    const unlisten = history.listen(() => resetStore())
    return () => unlisten()
  }, [history])

  return (
    <div id="preact_root" class={style.container}>
      <Header />
      <Nav />
      <main
        id="main_content"
        class={style.pageContainer}
        aria-disabled={navOpen}
      >
        <Router history={history}>
          <Route path="/:day?" component={ViewDay} />
          <NotFound default />
        </Router>
      </main>
    </div>
  )
}
