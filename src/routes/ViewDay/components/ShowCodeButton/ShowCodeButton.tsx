import { h } from 'preact'
import { Button } from '/components'
import { setShowCode, useStore } from '/store'

export const ShowCodeButton = () => {
  const showCode = useStore((s) => s.showCode)
  return (
    <Button onClick={() => setShowCode(!showCode)} plain>
      {showCode ? 'Hide code' : 'Show code'}
    </Button>
  )
}
