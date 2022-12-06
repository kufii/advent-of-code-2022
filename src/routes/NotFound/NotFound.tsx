import { FunctionalComponent, h } from 'preact'
import { Button } from '/components'
import style from './style.css'

export const NotFound: FunctionalComponent = () => (
  <div class={style.container}>
    <h1>Error 404</h1>
    <p>{"That page doesn't exist."}</p>
    <div>
      <Button url="#" plain compact>
        Return to home page
      </Button>
    </div>
  </div>
)
