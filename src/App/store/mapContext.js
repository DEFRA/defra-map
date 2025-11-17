import { useContext } from 'react'

import { MapContext } from './MapProvider.jsx'

export function useMap () {
  return useContext(MapContext)
}
