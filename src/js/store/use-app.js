import { useContext } from 'react'

import { AppContext } from './app-provider.jsx'

export const useApp = () => useContext(AppContext)
