import { useRef } from 'preact/hooks'

export const usePropRef = <T>(value: T) => {
  const propRef = useRef<T>(value)
  propRef.current = value
  return propRef
}
