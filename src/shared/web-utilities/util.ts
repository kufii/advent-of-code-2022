import { Falsy } from 'mergerino'

type TimeoutRef = { current?: number }
type AFunc = (...args: any[]) => void

export const debounce =
  <T extends AFunc>(ms: number, fn: T, id: TimeoutRef = {}) =>
  (...args: Parameters<T>) => {
    window.clearTimeout(id.current)
    id.current = window.setTimeout(fn, ms, ...args)
  }

export const throttle = <T extends AFunc>(
  ms: number,
  fn: T,
  id: TimeoutRef = {}
) => {
  let lastCall = 0
  const throttled = (...args: Parameters<T>) => {
    window.clearTimeout(id.current)
    const delta = Date.now() - lastCall
    // trailing call
    if (delta < ms) {
      id.current = window.setTimeout(throttled, ms - delta, ...args)
      return
    }
    lastCall = Date.now()
    fn(...args)
  }
  return throttled
}

export const classNames = (...classNames: (string | Falsy)[]) =>
  classNames.filter(Boolean).join(' ')

export const newTab = { target: '_blank', rel: 'noopener noreferrer' }

export const setIntervalImmediate = (cb: () => any, ms = 0) => {
  cb()
  return setInterval(cb, ms)
}
