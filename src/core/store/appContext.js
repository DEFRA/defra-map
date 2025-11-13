import { useContext } from 'react'

import { AppContext } from './AppProvider.jsx'

export function useApp () {
  return useContext(AppContext)
}
