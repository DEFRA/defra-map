import { createContext, useContext } from 'react'

export const ConfigContext = createContext(null)

export function useConfig () {
  return useContext(ConfigContext)
}
