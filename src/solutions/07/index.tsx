import { h } from 'preact'
import { Answer } from '/components'
import input from './input'
import { sortNum, sum, Tree } from '../util'

interface File {
  name: string
  size: number
}

interface Directory {
  name: string
  files: File[]
}

const buildFileSystem = () => {
  const fs = new Tree(Symbol(), { name: '/', files: [] } as Directory)
  let cwd = fs.root

  for (const cmd of input.split('\n')) {
    const match = cmd.match(/\$ cd (?<folder>.+)/u)
    if (match) {
      const { folder } = match.groups!
      if (folder === '/') cwd = fs.root
      else if (folder === '..') cwd.parent && (cwd = cwd.parent)
      else {
        let dir = cwd.children.find((d) => d.value.name === folder)
        if (!dir) {
          const key = Symbol()
          fs.insert(cwd.key, key, { name: folder, files: [] })
          dir = fs.find(key)
        }
        if (dir) cwd = dir
      }
    } else if (cmd.match(/^\d+/u)) {
      const [size, name] = cmd.split(' ')
      if (!cwd.value.files.find((f) => f.name === name))
        cwd.value.files.push({ name, size: Number(size) })
    }
  }

  return fs
}

const listDirSizes = (fs: Tree<symbol, Directory>) => {
  const dirs = new Map<symbol, number>()
  const getSize = (node = fs.root) => {
    const size: number =
      node.value.files.map((f) => f.size).reduce(sum, 0) +
      node.children.map(getSize).reduce(sum, 0)
    dirs.set(node.key, size)
    return size
  }
  getSize()
  return dirs
}

export const Part1 = () => {
  const fs = buildFileSystem()
  const sizes = [...listDirSizes(fs).values()]
  const totals = sizes.filter((n) => n <= 100000).reduce(sum)

  return (
    <p>
      The total size of all directories less than 100000 is{' '}
      <Answer>{totals}</Answer>.
    </p>
  )
}

export const Part2 = () => {
  const totalSpace = 70000000
  const updateSpace = 30000000
  const fs = buildFileSystem()
  const sizes = [...listDirSizes(fs).values()]

  const totalSize = [...fs.postOrderTraversal()]
    .map((d) => d.value.files.map((f) => f.size).reduce(sum, 0))
    .reduce(sum, 0)

  const freeSpace = totalSpace - totalSize
  const neededSpace = updateSpace - freeSpace
  const dir = sizes.sort(sortNum).find((n) => n >= neededSpace)

  return (
    <p>
      The smallest directory that can be removed to have {updateSpace} unused
      space is <Answer>{dir}</Answer>.
    </p>
  )
}
