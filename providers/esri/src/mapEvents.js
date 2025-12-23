import { watch, when, once } from '@arcgis/core/core/reactiveUtils.js'
import { debounce } from '../../../src/utils/debounce.js'
import { throttle } from '../../../src/utils/throttle.js'

const DEBOUNCE_IDLE_TIME = 500
const MOVE_THROTTLE_TIME = 10
const ZOOM_TOLERANCE = 0.01

export function attachMapEvents ({
  map,
  view,
  baseTileLayer,
  eventBus,
  getZoom,
  getCenter,
  getBounds,
  getResolution
}) {
  let destroyed = false
  const handles = []
  const debouncers = []

  const getMapState = () => {
    if (destroyed || !view || view.destroyed) {
      return null
    }

    const { maxZoom, minZoom } = view.constraints

    return {
      center: getCenter(),
      bounds: getBounds(),
      resolution: getResolution(),
      zoom: getZoom(),
      isAtMaxZoom: view.zoom + ZOOM_TOLERANCE >= maxZoom,
      isAtMinZoom: view.zoom - ZOOM_TOLERANCE <= minZoom
    }
  }

  const emit = (name) => {
    const state = getMapState()
    if (state) eventBus.emit(name, state)
  }

  // loaded
  when(
    () => baseTileLayer.loaded && view.resolution > 0,
    () => emit('map:loaded')
  )

  // ready
  once(() => view.ready).then(() => {
    if (!destroyed) {
      eventBus.emit('map:ready', { map, view })
    }
  })

  // first idle
  once(() => view.stationary).then(() => emit('map:firstidle'))

  // movestart + moveend
  const emitMoveEnd = debounce(() => emit('map:moveend'), DEBOUNCE_IDLE_TIME)
  debouncers.push(emitMoveEnd)

  handles.push(watch(
    () => [view.interacting, view.animation],
    ([interacting, animation]) => {
      if (interacting || animation) eventBus.emit('map:movestart')
      if (!interacting && !animation) emitMoveEnd()
    }
  ))

  // move
  const emitMove = throttle(() => emit('map:move'), MOVE_THROTTLE_TIME)
  debouncers.push(emitMove)

  handles.push(watch(() => view.zoom, emitMove))

  // render
  handles.push(watch(
    () => view.extent,
    () => eventBus.emit('map:render'),
    { initial: false }
  ))

  // datachange
  const emitDataChange = debounce(() => emit('map:datachange'), DEBOUNCE_IDLE_TIME)
  debouncers.push(emitDataChange)

  handles.push(watch(
    () => view.updating,
    updating => !updating && emitDataChange()
  ))

  // click
  handles.push(view.on('click', e => {
    const p = e.mapPoint
    eventBus.emit('map:click', { point: p, coords: [p.x, p.y] })
  }))

  // Cleanup
  return {
    remove () {
      destroyed = true
      debouncers.forEach(d => d.cancel())
      handles.forEach(h => h.remove())
    }
  }
}
