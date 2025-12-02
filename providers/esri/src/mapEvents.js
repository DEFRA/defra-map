import { watch, when } from '@arcgis/core/core/reactiveUtils.js'
import { debounce } from '../../../src/utils/debounce.js'
import { throttle } from '../../../src/utils/throttle.js'

const DEBOUNCE_IDLE_TIME = 500 // Must be greater than provider animation duration (400ms)
const MOVE_THROTTLE_TIME = 10 // Small delay for performance
const ZOOM_TOLERANCE = 0.01

export function attachMapEvents ({ view, baseTileLayer, eventBus, getZoom, getCenter, getBounds, getResolution }) {
  // Helper to get common map state
  const getMapState = () => {
    const { maxZoom, minZoom } = view.constraints
    const isAtMaxZoom = view.zoom + ZOOM_TOLERANCE >= maxZoom
    const isAtMinZoom = view.zoom - ZOOM_TOLERANCE <= minZoom
    return {
      center: getCenter(),
      bounds: getBounds(),
      resolution: getResolution(),
      zoom: getZoom(),
      isAtMaxZoom,
      isAtMinZoom
    }
  }

  // Generic emitter wrapper
  const emitEvent = (name, state) => eventBus.emit(name, state)

  // Map loaded
  when(() => baseTileLayer.loaded && view.resolution > 0, () => {
    emitEvent('map:loaded')
  })

  // Map first idle
  watch(() => view.stationary, (isStationary) => {
    if (isStationary) {
      emitEvent('map:idle')
    }
  })

  // Map movestart
  watch(() => [view.interacting, view.animation], ([interacting, animation]) => {
    if (interacting || animation) {
      emitEvent('map:movestart')
    }
  })

  // Map moveend (debounced)
  const emitMoveEnd = debounce(() => emitEvent('map:moveend', getMapState()), DEBOUNCE_IDLE_TIME)
  watch(() => [view.interacting, view.animation], ([interacting, animation]) => {
    if (!interacting && !animation) {
      emitMoveEnd()
    }
  })

  // Map move (throttled)
  watch(() => view.zoom,
    throttle(() => emitEvent('map:move', getMapState()), MOVE_THROTTLE_TIME)
  )

  // Map render (unthrottled - realtime anchoring to map)
  view.on('frame', () => emitEvent('map:render'))

  // Feature changes (debounced)
  const emitDataChange = debounce(() => emitEvent('map:datachange', getMapState()), DEBOUNCE_IDLE_TIME)
  watch(() => view.updating, (isUpdating) => {
    if (!isUpdating) {
      emitDataChange()
    }
  })

  // Map style change
  view.on('layerview-create', (e) => {
    if (e.layer === baseTileLayer) {
      emitEvent('map:stylechange')
    }
  })

  /* ==================================== */
  /* Interactions
  /* ==================================== */

  // Map click
  view.on('click', (e) => {
    const point = e.mapPoint
    emitEvent("map:click", {
      point: point,
      coords: [point.x, point.y]
    })
  })
}
