import { ComponentChild, h, Fragment } from 'preact'
import { classNames } from '/shared/web-utilities/util'
import style from './style.css'
import { Button, Icon } from '..'
import { setShowVisualization, useStore } from '/store'

interface Props {
  class?: string
  forced?: boolean
  children: ComponentChild
}

export const Visualization = ({
  class: className,
  forced,
  children
}: Props) => {
  const showVisualization = useStore((s) => s.showVisualization)
  return (
    <>
      {!forced && (
        <div>
          <Button
            onClick={() => setShowVisualization(!showVisualization)}
            plain
            compact
          >
            <Icon name={showVisualization ? 'eye-off' : 'eye'} />
            {showVisualization ? 'Hide' : 'Show'} visualization
          </Button>
        </div>
      )}
      {(showVisualization || forced) && (
        <pre class={classNames(style.container, className)}>{children}</pre>
      )}
    </>
  )
}
