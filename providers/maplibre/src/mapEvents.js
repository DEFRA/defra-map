import { debounce } from '../../../src/utils/debounce.js'
import { throttle } from '../../../src/utils/throttle.js'

const DEBOUNCE_IDLE_TIME = 500 // Must be greater than provider animation duration (400ms)
const MOVE_THROTTLE_TIME = 10 // Small delay for performance

export function attachMapEvents (map, eventBus, { getCenter, getZoom, getBounds, getResolution }) {
  // Helper to get common map state
  const getMapState = () => {
    const zoom = getZoom()
    return {
      center: getCenter(),
      bounds: getBounds(),
      resolution: getResolution(),
      isAtMaxZoom: map.getMaxZoom() <= zoom,
      isAtMinZoom: map.getMinZoom() >= zoom,
      zoom
    }
  }

  // Generic emitter wrapper
  const emitEvent = (name, state) => eventBus.emit(name, state)

  // Map loaded
  map.on('load', () => {
    emitEvent('map:loaded')
  })

  // Map first idle
  map.once('idle', () => {
    emitEvent('map:firstidle', getMapState())
  })

  // Map movestart
  map.on('movestart', () => {
    emitEvent('map:movestart')
  })

  // Map moveend (debounced)
  map.on('moveend', debounce(() => {
    emitEvent('map:moveend', getMapState())
  }, DEBOUNCE_IDLE_TIME))

  // Map move (throttled)
  // map.on('move', throttle(() => emitEvent('map:move', getMapState()), MOVE_THROTTLE_TIME))
  map.on('zoom', throttle(() => {
    emitEvent('map:move', getMapState())
  }, MOVE_THROTTLE_TIME))

  // Map render (unthrottled - realtime anchoring to map)
  map.on('render', () => {
    emitEvent('map:render')
  })

  // Feature changes (debounced)
  map.on('styledata', debounce(() => {
    emitEvent('map:datachange', getMapState())
  }, DEBOUNCE_IDLE_TIME))

  // Map style change
  map.on('style.load', () => {
    emitEvent('map:stylechange')
  })

  /* ==================================== */
  /* Interactions
  /* ==================================== */

  // Map click
  map.on('click', (e) => emitEvent('map:click', { point: e.point, coords: [e.lngLat.lng, e.lngLat.lat] }))
}
