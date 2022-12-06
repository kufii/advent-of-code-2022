import { h, Fragment } from 'preact'

interface Props {
  array: (string | number | JSX.Element)[][]
}

export const Array2d = ({ array }: Props) => {
  const output: (string | JSX.Element)[] = []
  for (let y = 0; y < array.length; y++) {
    let str = ''
    for (let x = 0; x < array[0].length; x++) {
      const cell = array[y][x]
      if (typeof cell === 'string' || typeof cell === 'number') {
        str += cell
      } else {
        if (str) output.push(str)
        output.push(cell)
        str = ''
      }
    }
    if (str) output.push(str)
    output.push(<br />)
  }

  return <>{output}</>
}
