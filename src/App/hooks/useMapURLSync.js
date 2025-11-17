import { useEffect } from 'react'
import { setMapStateInURL } from '../../utils/mapStateSync.js'
import { useConfig } from '../store/configContext.js'
import eventBus from '../../services/eventBus.js'

export function useMapURLSync () {
  const { id } = useConfig()

  useEffect(() => {
    if (!id) {
      return
    }

    const handleStateUpdate = ({ current }) => {
      setMapStateInURL(id, {
        center: current.center,
        zoom: current.zoom
      })
    }

    eventBus.on('map:stateupdated', handleStateUpdate)
    return () => eventBus.off('map:stateupdated', handleStateUpdate)
  }, [id])
}
