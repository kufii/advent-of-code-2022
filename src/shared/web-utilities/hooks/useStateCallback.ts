import { useCallback, useEffect, useRef, useState } from 'preact/hooks'

type Callback<T> = (value?: T) => void
type DispatchWithCallback<T> = (value: T, callback?: Callback<T>) => void
type SetStateAction<T> = T | ((prevState: T) => T)

export const useStateCallback = <T>(
  initialState: T | (() => T)
): [T, DispatchWithCallback<SetStateAction<T>>] => {
  const [state, _setState] = useState(initialState)

  const callbackRef = useRef<Callback<T>>()
  const isFirstCallbackCall = useRef<boolean>(true)

  const setState = useCallback(
    (setStateAction: SetStateAction<T>, callback?: Callback<T>): void => {
      callbackRef.current = callback
      _setState(setStateAction)
    },
    []
  )

  useEffect(() => {
    if (isFirstCallbackCall.current) {
      isFirstCallbackCall.current = false
      return
    }
    callbackRef.current?.(state)
  }, [state])

  return [state, setState]
}
