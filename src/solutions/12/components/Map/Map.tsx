import { h } from 'preact'
import { Array2d, Visualization } from '/components'
import { pointToKey } from '/solutions/util'

interface Props {
  map: string[][]
  path: string[]
}

export const Map = ({ map, path }: Props) => (
  <Visualization>
    <Array2d
      array={map.map((line, y) =>
        line.map((cell, x) =>
          path.includes(pointToKey({ x, y })) ? (
            <strong key={pointToKey({ x, y })}>{cell}</strong>
          ) : (
            cell
          )
        )
      )}
    />
  </Visualization>
)
