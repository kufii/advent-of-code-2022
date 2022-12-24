import { useCallback } from 'preact/hooks'
import { useStateCallback } from './useStateCallback'

export const useRerender = () => {
  const [, setRenders] = useStateCallback(0)
  const rerender = useCallback(
    (callback: () => any) => {
      setRenders((n) => n + 1, callback)
    },
    [setRenders]
  )
  return rerender
}
