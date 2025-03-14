import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { DisabledMode } from './modes'
import { draw as drawStyles } from './styles'
import { getFocusPadding } from '../../lib/viewport'
import { defaults } from './constants'

export class Draw {
  constructor (provider, options) {
    console.log(options)
    this.provider = provider
    Object.assign(this, options)

    // Provider needs ref to draw moudule and draw needs ref to provider
    provider.draw = this

    // Add existing feature
    if (options.feature) {
      this.drawFeature(options.feature)
      this.oFeature = options.feature
      return
    }

    // Start new
    this.start(options.mode)
  }

  // Add or edit query
  start (mode) {
    const { draw, oFeature } = this
    const { map } = this.provider
    const hasDrawControl = map.hasControl(draw)

    // Zoom to extent if we have an existing graphic
    if (oFeature) {
      const bounds = this.getBoundsFromFeature(oFeature)
      map.fitBounds(bounds, { duration: defaults.ANIMATION.duration })
    }

    // Remove existing feature
    if (mode === 'frame' && hasDrawControl) {
      map.removeControl(this.draw)
    }

    // Draw existing feature
    if (mode === 'vertex' && !hasDrawControl && oFeature) {
      this.drawFeature(oFeature)
    }

    // Draw from paddingBox
    if (mode === 'vertex' && !hasDrawControl && !oFeature) {
      this.edit()
    }

    // Enable direct select mode
    if (mode === 'vertex' && hasDrawControl) {
      draw.changeMode('direct_select', { featureId: 'shape' })
    }
  }

  // Edit nodes
  edit () {
    const { map, paddingBox } = this.provider
    const hasDrawControl = map.hasControl(this.draw)

    // Draw feature
    if (!hasDrawControl) {
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
    if (map.hasControl(this.draw)) {
      map.removeControl(this.draw)
    }
  }

  // Cancel update
  cancel () {
    const { draw, oFeature } = this
    const { map } = this.provider
    const hasDrawControl = map.hasControl(draw)

    // Re-draw original feature and disable interactions
    // Requires three conditions for performance
    if (hasDrawControl && oFeature) {
      draw.delete(['shape'])
      draw.add(oFeature)
      draw.changeMode('disabled')
    }

    // Remove draw
    if (hasDrawControl && !oFeature) {
      map.removeControl(draw)
    }

    // Draw original feature
    if (!hasDrawControl && oFeature) {
      this.drawFeature(oFeature)
    }
  }

  // Confirm or update
  finish () {
    const { map, paddingBox } = this.provider
    const hasDrawControl = map.hasControl(this.draw)

    // Disable interactions
    if (hasDrawControl) {
      this.draw.changeMode('disabled')
    }

    // Draw feature
    if (!hasDrawControl) {
      const elFeature = this.getFeatureFromElement(paddingBox)
      this.drawFeature(elFeature)
    }

    // Sert ref to feature
    this.oFeature = this.draw.get('shape')

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
