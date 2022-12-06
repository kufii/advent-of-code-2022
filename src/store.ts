import staterino from 'staterino'
import merge from 'mergerino'
import * as hooks from 'preact/hooks'

type Part = 1 | 2 | null
interface State {
  day?: number
  part: Part
  showCode: boolean
  code: string
  navOpen: boolean
  showVisualization: boolean
}

const initialState: State = {
  day: undefined,
  part: null,
  showCode: false,
  code: '',
  navOpen: false,
  showVisualization: false
}

export const useStore = staterino({
  merge,
  hooks,
  state: initialState
})

export const { set, get } = useStore

export const resetStore = () => set(initialState)

export const setDay = (day: number) => set({ day })

export const setPart = (part: Part) => set({ part })

export const setShowCode = (showCode: boolean) => set({ showCode })

export const setCode = (code: string) => set({ code })

export const setNavOpen = (navOpen: boolean) => set({ navOpen })

export const setShowVisualization = (showVisualization: boolean) =>
  set({ showVisualization })
