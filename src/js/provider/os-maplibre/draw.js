import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { DisabledMode } from './modes'
import { draw as drawStyles } from './styles'
import { getFocusPadding } from '../../lib/viewport'
import { defaults as storeDefaults } from '../../store/constants'

export class Draw {
  constructor (provider, options) {
    const { map } = provider
    this.provider = provider
    Object.assign(this, options)

    // Reference to original styles
    storeDefaults.STYLES.forEach(s => { this[`${s}UrlOrg`] = provider[`${s}Url`] })

    // Reference to original zoom constraints
    this.maxZoomO = map.getMaxZoom()
    this.minZoomO = map.getMinZoom()

    // Provider needs ref to draw moudule and draw need ref to provider
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

    // Disable interactions
    if (oFeature && hasDraw) {
      draw.changeMode('disabled')
    }

    // Re-draw original feature
    if (oFeature && !hasDraw) {
      this.drawFeature(oFeature)
    }

    // Remove draw feature
    if (!oFeature && hasDraw) {
      map.removeControl(draw)
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
    const { provider, maxZoom, maxZoomO, minZoomO, minZoom, oFeature } = this
    const { map } = provider

    // Toggle min and max zoom
    map.setMaxZoom(hasConstraints ? maxZoom : maxZoomO)
    map.setMinZoom(hasConstraints ? minZoom : minZoomO)

    // Toggle basemaps
    storeDefaults.STYLES.forEach(s => { provider[`${s}Url`] = hasConstraints ? (this[`${s}Url`] || provider[`${s}Url`]) : this[`${s}UrlOrg`] })
    if (this[provider.basemap + 'Url']) {
      provider.setBasemap(provider.basemap)
    }

    // Zoom to extent if we have an existing graphic
    if (hasConstraints && oFeature) {
      const bounds = this.getBoundsFromFeature(oFeature)
      map.fitBounds(bounds, { animate: false })
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
      displayControlsDefault: false,
    })

    map.addControl(draw)
    draw.add(feature)
    draw.changeMode('disabled')

    this.draw = draw
  }

  getBoundsFromFeature(feature) {
    const coordinates = feature.geometry.coordinates[0]
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
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