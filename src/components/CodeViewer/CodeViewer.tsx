import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import { setCode, useStore } from '/store'
import style from './style.css'
import { Button } from '../Button'
import { Icon } from '..'

interface Props {
  day: number
}

const getUrl = (day: number, purge?: boolean) =>
  `https://${
    purge ? 'purge' : 'cdn'
  }.jsdelivr.net/gh/kufii/advent-of-code-2022@latest/src/solutions/${day
    .toString()
    .padStart(2, '0')}/index.tsx`

export const CodeViewer = ({ day }: Props) => {
  const [showCode, code] = useStore([(s) => s.showCode, (s) => s.code])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!showCode || code) return
    const loadCode = async () => {
      setLoading(true)
      try {
        const response = await fetch(getUrl(day), { cache: 'no-cache' })
        const text = await response.text()
        setCode(text)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        setCode('Not found')
      } finally {
        setLoading(false)
      }
    }
    loadCode()
  }, [day, code, showCode])

  const refreshCode = async () => {
    try {
      setLoading(true)
      await fetch(getUrl(day, true), { cache: 'no-cache' })
      setCode('')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setCode('Refresh failed')
    } finally {
      setLoading(false)
    }
  }

  if (!showCode) return null

  return (
    <div class={style.container}>
      {loading ? (
        <pre class={style.code}>Loading...</pre>
      ) : (
        <pre class={style.code} data-lang="React TSX">
          {process.env.NODE_ENV === 'development' && (
            <div>
              <Button
                onClick={refreshCode}
                plain
                compact
                ariaLabel="purge jsdelivr cache and reload code"
              >
                <Icon name="refresh-cw" />
              </Button>
            </div>
          )}
          <code
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: highlight(code, languages.tsx, 'tsx')
            }}
          />
        </pre>
      )}
    </div>
  )
}
