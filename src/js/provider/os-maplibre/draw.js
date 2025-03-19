import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { DisabledMode } from './modes'
import { draw as drawStyles } from './styles'
import { getFocusPadding, getDistance } from '../../lib/viewport'

export class Draw {
  constructor (provider, options) {
    const { mode, shape, feature } = options
    const { map } = provider
    this.provider = provider

    // Provider needs ref to draw moudule and draw needs ref to provider
    provider.draw = this

    const initialFeature = feature ? { ...feature, id: 'shape' } : null
    this.oFeature = initialFeature

    // Add existing feature
    if (initialFeature && mode === 'default') {
      this.drawFeature(initialFeature)
      return
    }

    // Start new
    this.edit(mode, shape)

    // Disable simple select
    map.on('draw.modechange', e => {
      if (e.mode === 'simple_select') {
        this.draw.changeMode('direct_select', { featureId: 'shape' })
      }
    })

    Object.assign(this, options)
  }

  // Add or edit
  edit (mode, shape) {
    const { draw, oFeature } = this
    const { map, paddingBox } = this.provider

    // Zoom to extent if we have an existing graphic
    if (oFeature) {
      const bounds = this.getBoundsFromFeature(oFeature)
      map.fitBounds(bounds, { animate: false })
    }

    // Remove existing feature
    if (map.hasControl(draw)) {
      map.removeControl(this.draw)
    }

    // Draw a new feature and set direct_select
    if (mode === 'vertex') {
      const feature = oFeature || this.getFeatureFromElement(paddingBox, shape)
      this.drawFeature(feature)
      this.draw.changeMode('direct_select', { featureId: 'shape' })
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
  finish (shape) {
    console.log('finish', shape)
    const { map, paddingBox } = this.provider
    const hasDrawControl = map.hasControl(this.draw)

    // Disable interactions
    if (hasDrawControl) {
      this.draw.changeMode('disabled')
    }

    // Draw feature
    if (!hasDrawControl) {
      const elFeature = this.getFeatureFromElement(paddingBox, shape)
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

  getFeatureFromElement (el, shape) {
    const { map, scale } = this.provider
    const box = el.getBoundingClientRect()
    const padding = getFocusPadding(el, scale)
    const nw = map.unproject([padding.left, padding.top])
    const se = map.unproject([padding.left + (box.width / scale), padding.top + (box.height / scale)])
    const feature = {
      id: 'shape',
      type: 'Feature',
      properties: {},
      geometry: {}
    }

    if (shape === 'circle') {
      const c = map.getCenter()
      const coords = [c.lng, c.lat]
      const radius = getDistance([nw.lng, nw.lat], [se.lng, nw.lat]) / 2
      feature.properties.radius = radius
      feature.geometry = {
        type: 'Point',
        coordinates: coords
      }
    } else {
      const b = [nw.lng, nw.lat, se.lng, se.lat]
      const coords = [[[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]], [b[0], b[1]]]]
      feature.geometry = {
        type: 'Polygon',
        coordinates: coords
      }
    }

    return feature
  }
}

export default Draw
