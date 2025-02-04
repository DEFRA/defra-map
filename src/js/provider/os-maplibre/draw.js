import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { DisabledMode } from './modes'
import { draw as drawStyles } from './styles'
import { getFocusPadding } from '../../lib/viewport'
import { defaults } from './constants'

export class Draw {
  constructor (provider, options) {
    const { map } = provider
    this.provider = provider
    Object.assign(this, options)

    // Reference to styles
    this.defaultStyles = [...provider.styles]
    this.drawStyles = options.styles || []

    // Reference to zoom constraints
    const maxZoomO = map.getMaxZoom()
    const minZoomO = map.getMinZoom()
    this.maxZoomO = maxZoomO
    this.minZoomO = minZoomO
    this.maxZoom = options.maxZoom || maxZoomO
    this.minZoom = options.minZoom || minZoomO

    // Provider needs ref to draw moudule and draw needs ref to provider
    provider.draw = this

    // Add existing feature
    if (options.feature) {
      this.drawFeature(options.feature)
      this.oFeature = options.feature
      return
    }

    // Start new
    this.start('frame')
  }

  // Add or edit query
  start (mode) {
    const { draw, oFeature } = this
    const { map } = this.provider
    const isFrame = mode === 'frame'
    const hasDraw = map.hasControl(draw)
    this.toggleConstraints(true)

    // Remove existing feature
    if (isFrame && hasDraw) {
      map.removeControl(this.draw)
    }

    // Draw existing feature
    if (!isFrame && !hasDraw) {
      this.drawFeature(oFeature)
    }

    // Enable direct select mode
    if (!isFrame && hasDraw) {
      draw.changeMode('direct_select', { featureId: 'shape' })
    }
  }

  // Edit nodes
  edit () {
    const { map, paddingBox } = this.provider
    const hasDraw = map.hasControl(this.draw)

    // Draw feature
    if (!hasDraw) {
      const feature = this.getFeatureFromElement(paddingBox)
      this.drawFeature(feature)
    }

    // Set edit mode
    this.draw.changeMode('direct_select', { featureId: 'shape' })

    // Selected vertex
    map.on('draw.selectionchange', e => {
      // const point = e.points[0]
    })

    // Disable simple select
    map.on('draw.modechange', e => {
      if (e.mode === 'simple_select') {
        this.draw.changeMode('direct_select', { featureId: 'shape' })
      }
    })
  }

  // Reset to square
  reset () {
    const { map } = this.provider
    map.removeControl(this.draw)
  }

  // Cancel update
  cancel () {
    const { draw, oFeature } = this
    const { map } = this.provider
    const hasDraw = map.hasControl(draw)

    // Re-draw original feature and disable interactions
    // Requires three conditions for performance
    if (hasDraw && oFeature) {
      draw.delete(['shape'])
      draw.add(oFeature)
      draw.changeMode('disabled')
    }

    // Remove draw
    if (hasDraw && !oFeature) {
      map.removeControl(draw)
    }

    // Draw original feature
    if (!hasDraw && oFeature) {
      this.drawFeature(oFeature)
    }

    this.toggleConstraints(false)
  }

  // Confirm or update
  finish () {
    const { map, paddingBox } = this.provider
    const hasDraw = map.hasControl(this.draw)

    // Disable interactions
    if (hasDraw) {
      this.draw.changeMode('disabled')
    }

    // Draw feature
    if (!hasDraw) {
      const elFeature = this.getFeatureFromElement(paddingBox)
      this.drawFeature(elFeature)
    }

    // Sert ref to feature
    this.oFeature = this.draw.get('shape')

    this.toggleConstraints(false)
    return this.oFeature
  }

  // Delete feature
  delete () {
    const { draw } = this
    const { map } = this.provider
    this.oFeature = undefined

    // Remove draw
    map.removeControl(draw)
    this.draw = undefined
  }

  toggleConstraints (hasConstraints) {
    const { provider, drawStyles, defaultStyles, maxZoom, maxZoomO, minZoomO, minZoom, oFeature } = this
    const { map } = provider

    // Toggle min and max zoom
    map.setMaxZoom(hasConstraints ? maxZoom : maxZoomO)
    map.setMinZoom(hasConstraints ? minZoom : minZoomO)

    // Toggle basemaps
    const newStyles = provider.styles.map(s => { return drawStyles.find(n => s.name === n.name) || s })
    provider.styles = hasConstraints ? newStyles : defaultStyles
    provider.setBasemap(provider.basemap)

    // Zoom to extent if we have an existing graphic
    if (hasConstraints && oFeature) {
      const bounds = this.getBoundsFromFeature(oFeature)
      map.fitBounds(bounds, { duration: defaults.ANIMATION.duration })
    }
  }

  drawFeature (feature) {
    const { map } = this.provider

    MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
    MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
    MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

    const modes = MapboxDraw.modes
    modes.disabled = DisabledMode

    const draw = new MapboxDraw({
      modes,
      styles: drawStyles,
      displayControlsDefault: false
    })

    map.addControl(draw)
    draw.add(feature)
    draw.changeMode('disabled')

    this.draw = draw
  }

  getBoundsFromFeature (feature) {
    const coordinates = feature.geometry.coordinates[0]
    let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity
    coordinates.forEach(coord => {
      const [x, y] = coord
      minX = x < minX ? x : minX
      minY = y < minY ? y : minY
      maxX = x > maxX ? x : maxX
      maxY = y > maxY ? y : maxY
    })
    return [minX, minY, maxX, maxY]
  }

  getFeatureFromElement (el) {
    const { map, scale } = this.provider
    const box = el.getBoundingClientRect()
    const padding = getFocusPadding(el, scale)
    const nw = map.unproject([padding.left, padding.top])
    const se = map.unproject([padding.left + (box.width / scale), padding.top + (box.height / scale)])
    const b = [nw.lng, nw.lat, se.lng, se.lat]
    const coords = [[[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]], [b[0], b[1]]]]
    return {
      id: 'shape',
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: coords
      }
    }
  }
}

export default Draw
