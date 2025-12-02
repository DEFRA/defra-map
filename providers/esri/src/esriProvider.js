import esriConfig from '@arcgis/core/config.js'
import Map from '@arcgis/core/Map.js'
import MapView from '@arcgis/core/views/MapView.js'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer.js'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js'
import { defaults, supportedShortcuts } from './defaults.js'
import { attachAppEvents } from './appEvents.js'
import { attachMapEvents } from './mapEvents.js'
import { getExtentFromFlatCoords, getPointFromFlatCoords } from './utils/coords.js'
import { cleanDOM } from './utils/esriFixes.js'

export default class EsriProvider {
  constructor ({ mapProviderConfig = {}, eventBus }) {
    this.eventBus = eventBus
    this.capabilities = {
      supportedShortcuts,
      supportsMapSizes: false
    }
    // Spread all config properties onto the instance
    Object.assign(this, mapProviderConfig)
  }

  async initMap (config) {
    const { container, padding, mapStyle, maxExtent, ...initConfig } = config
    const { eventBus } = this

    // Implementation has full control over esriConfig
    if (this.setupConfig) {
      await this.setupConfig(esriConfig)
    }

    // Define layers
    const baseTileLayer = new VectorTileLayer({ id: 'baselayer', url: mapStyle.url, visible: true })
    const map = new Map({ layers: [baseTileLayer] })
    const geometry = maxExtent ? getExtentFromFlatCoords(maxExtent) : null

    // Create MapView
    const view = new MapView({
      // ...initConfig,
      spatialReference: 27700,
      container,
      map,
      zoom: config.zoom,
      center: getPointFromFlatCoords(config.center),
      maxExtent: maxExtent,
      constraints: {
        snapToZoom: false,
        minZoom: config.minZoom,
        maxZoom: config.maxZoom,
        maxScale: 0,
        geometry,
        rotationEnabled: false
      },
      ui: { components: [] },
      popupEnabled: false
    })

    // Tidy up DOM
    cleanDOM(view.container)

    // Set padding
    view.padding = padding
    
    // Set extent after padding (component uses bounds internally)
    if (config.bounds) {
      view.when(() => view.goTo(getExtentFromFlatCoords(config.bounds), { duration: 0 }))
    }

    // Map related events
    attachMapEvents({
      map,
      view,
      baseTileLayer,
      eventBus,
      getZoom: this.getZoom.bind(this),
      getCenter: this.getCenter.bind(this),
      getBounds: this.getBounds.bind(this),
      getResolution: this.getResolution.bind(this)
    })

    // App related events
    attachAppEvents({
      baseTileLayer,
      eventBus
    })

    // Refs to map and view
    this.map = map
    this.view = view

    this.eventBus.emit('map:ready', { map })
  }

  destroyMap () {
    // this.map.remove()
  }

  // ==========================
  // Side-effects
  // ==========================

  setView ({ center, zoom }) {
    this.view.animation?.destroy()
    this.view.goTo({ center, zoom, duration: defaults.animationDuration })
  }

  zoomIn (zoomDelta) {
    this.view.animation?.destroy()
    this.view.goTo({ zoom: this.view.zoom + zoomDelta, duration: defaults.animationDuration })
  }

  zoomOut (zoomDelta) {
    this.view.animation?.destroy()
    this.view.goTo({ zoom: this.view.zoom - zoomDelta, duration: defaults.animationDuration })
  }

  panBy (offset) {
    const { x, y } = this.view.toScreen(this.view.center)
    const newPixel = { x: x + offset[0], y: y + offset[1] }
    const newCentre = this.view.toMap(newPixel)
    this.view.goTo({ center: newCentre, duration: defaults.animationDuration })
  }

  fitToBounds (bounds) {
    this.view.goTo(getExtentFromFlatCoords(bounds), { duration: defaults.DELAY })
  }

  setPadding (padding) {
    this.view.padding = padding
  }

  // ==========================
  // Read-only getters
  // ==========================

  getCenter () {
    const center = this.view.center
    return [center.x, center.y].map(n => Math.round(n * 100) / 100)
  }

  getZoom () {
    return this.view.zoom
  }

  getBounds () {
    const { xmin, ymin, xmax, ymax } = this.view.extent
    return [xmin, ymin, xmax, ymax].map(n => Math.round(n * 100) / 100)
  }

  getFeaturesAtPoint (point) {
    // return this.map.queryRenderedFeatures(point)
  }

  // ==========================
  // Spatial helpers
  // ==========================

  getAreaDimensions () {
    // const { LngLatBounds } = this.maplibreModule
    // return getAreaDimensions(getPaddedBounds(LngLatBounds, this.map)) // Use padded bounds
  }

  getCardinalMove (from, to) {
    // return getCardinalMove(from, to)
  }

  getResolution () {
    return this.view.resolution
  }

  getPointFromCoords (coords) {
    // return this.map.project(coords)
  }
}
