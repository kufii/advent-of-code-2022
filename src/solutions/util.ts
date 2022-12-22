import { serialize } from '@ungap/structured-clone'

export type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T

export const truthy = <T>(value: T): value is Truthy<T> => Boolean(value)

export const nonNullable = <T>(value: T): value is NonNullable<T> =>
  value != null

export const range = (start: number, end: number) => {
  const arr = []
  for (let n = start; n <= end; n++) {
    arr.push(n)
  }
  return arr
}

export const isInRange = (n: number, start: number, end: number) =>
  n >= Math.min(start, end) && n <= Math.max(start, end)

export const make2dArray = <T>(ySize: number, xSize: number, fill?: T): T[][] =>
  Array(ySize)
    .fill(null)
    .map(() => Array(xSize).fill(fill))

export const output2dArray = (arr: (string | number)[][]) =>
  arr.map((line) => line.join('')).join('\n')

export const max = (a: number, b: number) => (b > a ? b : a)

export const min = (a: number, b: number) => (b < a ? b : a)

export const maxBy =
  <T>(cb: (item: T) => number) =>
  (a: T, b: T) =>
    cb(b) > cb(a) ? b : a

export const minBy =
  <T>(cb: (item: T) => number) =>
  (a: T, b: T) =>
    cb(b) < cb(a) ? b : a

export const sum = (a: number, b: number) => a + b

export const product = (a: number, b: number) => a * b

export const alphaSort = (a: string, b: string) => a.localeCompare(b)

export const sortStr = (str: string) => [...str].sort(alphaSort).join('')

export const sortNum = (a: number, b: number) => a - b

export const sortNumDesc = (a: number, b: number) => b - a

export const sortBy =
  <T>(
    ...cbs: (
      | ((item: T) => string | number)
      | { desc: boolean; cb: (item: T) => string | number }
    )[]
  ) =>
  (a: T, b: T) => {
    for (const cb of cbs) {
      const [fn, desc] = cb instanceof Function ? [cb, false] : [cb.cb, cb.desc]
      const aa = fn(a)
      const bb = fn(b)
      const isNumber = typeof aa === 'number' && typeof bb === 'number'
      const diff = desc
        ? isNumber
          ? bb - aa
          : bb.toString().localeCompare(aa.toString())
        : isNumber
        ? aa - bb
        : aa.toString().localeCompare(bb.toString())
      if (diff !== 0) return diff
    }
    return 0
  }

export const desc = <T>(cb: (item: T) => string | number) => ({
  desc: true,
  cb
})

export interface Point {
  x: number
  y: number
}

export const pointToKey = ({ x, y }: Point) => `${x},${y}`

export const keyToPoint = (key: string) => {
  const [x, y] = key.split(',').map(Number)
  return { x, y }
}

export interface Point3 {
  x: number
  y: number
  z: number
}

export const point3ToKey = ({ x, y, z }: Point3) => `${x},${y},${z}`

export const keyToPoint3 = (key: string) => {
  const [x, y, z] = key.split(',').map(Number)
  return { x, y, z }
}

export const getAdjacent = ({ x, y }: Point, diagonal = false) =>
  [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    ...(diagonal
      ? [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1]
        ]
      : [])
  ].map(([dx, dy]) => ({ x: x + dx, y: y + dy }))

export const parse2dArray = <T>(str: string, cbMap: (c: string) => T) =>
  str.split('\n').map((line) => [...line].map(cbMap))

export const iterate2dArray = function* <T>(map: T[][]) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      yield { x, y, value: map[y][x] }
    }
  }
}
export class InfiniteGrid<T> {
  fill: T
  grid: Map<string, T>

  constructor(fill: T, array?: T[][]) {
    this.fill = fill
    this.grid = new Map()
    if (array) {
      for (const { x, y, value } of iterate2dArray(array)) {
        if (value !== fill) this.set(x, y, value)
      }
    }
  }

  get cells() {
    return [...this.grid.entries()].map(([pos, value]) => ({
      ...keyToPoint(pos),
      value
    }))
  }

  get bounds() {
    const cells = this.cells
    return {
      min: {
        x: cells.map(({ x }) => x).reduce(min),
        y: cells.map(({ y }) => y).reduce(min)
      },
      max: {
        x: cells.map(({ x }) => x).reduce(max),
        y: cells.map(({ y }) => y).reduce(max)
      }
    }
  }

  toArray(min?: Point, max?: Point) {
    const bounds = min && max ? null : this.bounds
    if (!min) min = bounds!.min
    if (!max) max = bounds!.max
    const array = make2dArray(max.y - min.y + 1, max.x - min.x + 1, this.fill)
    for (let y = min.y; y <= max.y; y++) {
      for (let x = min.x; x <= max.x; x++) {
        array[y - min.y][x - min.x] = this.get(x, y)
      }
    }
    return array
  }

  set(x: number, y: number, value: T) {
    this.grid.set(pointToKey({ x, y }), value)
  }

  get(x: number, y: number) {
    return this.grid.has(pointToKey({ x, y }))
      ? this.grid.get(pointToKey({ x, y }))!
      : this.fill
  }

  clone() {
    const newGrid = new InfiniteGrid(this.fill)
    newGrid.grid = new Map(this.grid)
    return newGrid
  }
}

export class TreeNode<TKey, TValue> {
  key: TKey
  value: TValue
  parent?: TreeNode<TKey, TValue>
  children: TreeNode<TKey, TValue>[]

  constructor(key: TKey, value: TValue, parent?: TreeNode<TKey, TValue>) {
    this.key = key
    this.value = value
    this.parent = parent
    this.children = []
  }

  get isLeaf() {
    return this.children.length === 0
  }

  get hasChildren() {
    return !this.isLeaf
  }
}

export class Tree<TKey, TValue> {
  root: TreeNode<TKey, TValue>

  constructor(key: TKey, value: TValue) {
    this.root = new TreeNode(key, value)
  }

  *preOrderTraversal(node = this.root): Generator<TreeNode<TKey, TValue>> {
    yield node
    if (node.children.length) {
      for (const child of node.children) {
        yield* this.preOrderTraversal(child)
      }
    }
  }

  *postOrderTraversal(node = this.root): Generator<TreeNode<TKey, TValue>> {
    if (node.children.length) {
      for (const child of node.children) {
        yield* this.postOrderTraversal(child)
      }
    }
    yield node
  }

  insert(parentNodeKey: TKey, key: TKey, value: TValue) {
    for (const node of this.preOrderTraversal()) {
      if (node.key === parentNodeKey) {
        node.children.push(new TreeNode(key, value, node))
        return true
      }
    }
    return false
  }

  remove(key: TKey) {
    for (const node of this.preOrderTraversal()) {
      const filtered = node.children.filter((c) => c.key !== key)
      if (filtered.length !== node.children.length) {
        node.children = filtered
        return true
      }
    }
    return false
  }

  find(key: TKey) {
    for (const node of this.preOrderTraversal()) {
      if (node.key === key) return node
    }
    return undefined
  }
}

export const nTimes = (n: number, cb: (n: number) => unknown) => {
  for (let i = 0; i < n; i++) cb(i)
}

export const toPath = (
  prev: Map<string, string>,
  source: string,
  dest: string
) => {
  const path = []
  let current
  do {
    current = current ? prev.get(current)! : dest
    path.unshift(current)
  } while (current !== source)
  return path
}

export const dijkstra = (
  source: string,
  dest: string | null,
  cbNeighbors: (key: string) => string[],
  cbDist?: (to: string, from: string) => number
) => {
  const nodes = new Set([source])
  const dist = new Map<string, number>([[source, 0]])
  const prev = new Map<string, string>()
  const getDist = (key: string) => dist.get(key) ?? Infinity

  while (nodes.size) {
    const closest = [...nodes].reduce(minBy((n) => getDist(n)))
    if (dest && closest === dest) {
      return {
        distance: dist.get(dest),
        path: toPath(prev, source, dest),
        prev
      }
    }
    nodes.delete(closest)
    const neighbors = cbNeighbors(closest)
    neighbors.forEach((neighbor) => {
      const alt = getDist(closest) + (cbDist ? cbDist(neighbor, closest) : 1)
      if (alt < getDist(neighbor)) {
        dist.set(neighbor, alt)
        prev.set(neighbor, closest)
        nodes.add(neighbor)
      }
    })
  }
  return { prev }
}

export const nestedLoop = function* (
  n: number,
  start: number | number[],
  end: number | number[]
): IterableIterator<number[]> {
  const get = (value: number | number[], index: number) =>
    Array.isArray(value) ? value[index] : value
  const arr = Array(n)
    .fill(null)
    .map((_, i) => get(start, i))
  let i = 0
  while (true) {
    yield arr.slice()
    arr[0]++
    while (arr[i] === get(end, i) + 1) {
      arr[i] = get(start, i)
      i++
      if (i === n) return
      arr[i]++
      if (arr[i] !== get(end, i) + 1) i = 0
    }
  }
}

export const memoize = <TParams extends any[], TReturns>(
  fn: (...args: TParams) => TReturns
): ((...args: TParams) => TReturns) => {
  const cache = new Map<string, TReturns>()
  return (...args: TParams) => {
    const key = JSON.stringify(serialize(args))
    if (cache.has(key)) return cache.get(key)!
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

export const invert = <
  TKey extends string | number | symbol,
  TValue extends string | number | symbol
>(
  obj: Record<TKey, TValue>
): Record<TValue, TKey> =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]))

export const groupArr = <T>(arr: T[], n: number) =>
  arr.reduce(
    (acc, elem, i) => (
      i % n ? acc[acc.length - 1].push(elem) : acc.push([elem]), acc
    ),
    [] as T[][]
  )

export const gcd = (a: number, b: number): number => (a ? gcd(b % a, a) : b)

export const lcm = (a: number, b: number) => (a * b) / gcd(a, b)

export const mod = (n: number, m: number) => ((n % m) + m) % m

export const removeAt = (arr: any[], i: number) => arr.splice(i, 1)

export const insertAt = <T>(arr: T[], i: number, item: T) =>
  arr.splice(i, 0, item)

export const findLastIndex = <T>(
  arr: T[],
  cb: (value: T, i: number) => boolean
) =>
  arr.length -
  1 -
  arr
    .slice()
    .reverse()
    .findIndex((value, i) => cb(value, arr.length - 1 - i))
