import { defaults, supportedShortcuts } from './defaults.js'
import { cleanCanvas, applyPreventDefaultFix } from './utils/maplibreFixes.js'
import { attachMapEvents } from './mapEvents.js'
import { attachAppEvents } from './appEvents.js'
import { getAreaDimensions, getCardinalMove, getResolution, getPaddedBounds } from './utils/spatial.js'
import { createMapLabelNavigator } from './utils/labels.js'
import { updateHighlightedFeatures } from './utils/highlightFeatures.js'

export default class MapLibreProvider {
  constructor ({ mapFramework, eventBus }) {
    this.maplibreModule = mapFramework
    this.eventBus = eventBus
    this.capabilities = {
      supportedShortcuts,
      supportsMapSizes: true
    }
  }

  initMap (config) {
    const { container, padding, mapStyle, center, zoom, bounds, pixelRatio, ...initConfig } = config
    const { Map } = this.maplibreModule

    const map = new Map({
      ...initConfig,
      container,
      style: mapStyle?.url,
      pixelRatio,
      center,
      zoom,
      fadeDuration: 0,
      attributionControl: false,
      dragRotate: false,
      doubleClickZoom: false
    })

    // Disable rotation
    map.touchZoomRotate.disableRotation()
    
    map.showPadding = true

    this.map = map
    this.map.setPadding(padding)

    if (bounds) {
      map.fitBounds(bounds, { duration: 0 })
    }

    applyPreventDefaultFix(map)
    cleanCanvas(map)

    attachMapEvents(map, this.eventBus, {
      getCenter: this.getCenter.bind(this),
      getZoom: this.getZoom.bind(this),
      getBounds: this.getBounds.bind(this),
      getResolution: this.getResolution.bind(this)
    })

    attachAppEvents(map, this.eventBus)

    // Add highlight layer after map load
    map.on('load', () => {
      this.labelNavigator = createMapLabelNavigator(map, mapStyle?.mapColorScheme, this.eventBus)
    })

    this.eventBus.emit('map:ready', { map })
  }

  // ==========================
  // Side-effects
  // ==========================

  setView ({ center, zoom }) {
    this.map.flyTo({
      center: center || this.getCenter(),
      zoom: zoom || this.getZoom(),
      duration: defaults.duration
    })
  }

  zoomIn (zoomDelta) {
    this.map.easeTo({
      zoom: this.getZoom() + zoomDelta,
      duration: defaults.animationDuration
    })
  }

  zoomOut (zoomDelta) {
    this.map.easeTo({
      zoom: this.getZoom() - zoomDelta,
      duration: defaults.animationDuration
    })
  }

  panBy (offset) {
    this.map.panBy(offset, { duration: defaults.animationDuration })
  }

  fitToBounds (bounds) {
    this.map.fitBounds(bounds, { duration: defaults.animationDuration })
  }

  setPadding (padding) {
    this.map.setPadding(padding)
  }

  // ==========================
  // Feature highlighting
  // ==========================

  updateHighlightedFeatures (selectedFeatures, stylesMap) {
    const { LngLatBounds } = this.maplibreModule
    return updateHighlightedFeatures({ LngLatBounds, map: this.map, selectedFeatures, stylesMap })
  }

  // ==========================
  // Map label (keyboard-friendly)
  // ==========================

  highlightNextLabel (direction) {
    return this.labelNavigator?.highlightNextLabel(direction) || null
  }

  highlightLabelAtCenter () {
    return this.labelNavigator?.highlightLabelAtCenter() || null
  }

  clearHighlightedLabel () {
    return this.labelNavigator?.clearHighlightedLabel() || null
  }

  // ==========================
  // Read-only getters
  // ==========================

  getCenter () {
    const coord = this.map.getCenter()
    return [Number(coord.lng.toFixed(7)), Number(coord.lat.toFixed(7))]
  }

  getZoom () {
    return Number(this.map.getZoom().toFixed(7))
  }

  getBounds () {
    return this.map.getBounds().toArray().flat(1)
  }

  getFeaturesAtPoint (point) {
    return this.map.queryRenderedFeatures(point)
  }

  // ==========================
  // Spatial helpers
  // ==========================

  getAreaDimensions () {
    const { LngLatBounds } = this.maplibreModule
    return getAreaDimensions(getPaddedBounds(LngLatBounds, this.map)) // Use padded bounds
  }

  getCardinalMove (from, to) {
    return getCardinalMove(from, to)
  }

  getResolution () {
    return getResolution(this.map.getCenter(), this.map.getZoom())
  }

  getPointFromCoords (coords) {
    return this.map.project(coords)
  }
}
