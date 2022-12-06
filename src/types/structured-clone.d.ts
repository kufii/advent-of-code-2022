declare module '@ungap/structured-clone' {
  const structuredClone: <T>(obj: T) => T
  export default structuredClone
  export const serialize: (obj: any) => any
  export const deserialize: <T>(obj: any) => T
}
