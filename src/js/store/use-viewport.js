import { useContext } from 'react'

import { ViewportContext } from './viewport-provider.jsx'

export const useViewport = () => useContext(ViewportContext)
