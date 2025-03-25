import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { DisabledMode, EditVertexMode } from './modes'
import { draw as drawStyles } from './styles'
import { getFocusPadding, getDistance } from '../../lib/viewport'
import { circle as TurfCircle } from '@turf/circle'
import { defaults } from './constants'

export class Draw {
  constructor (provider, options) {
    const { map } = provider
    Object.assign(this, options)

    const { mode, shape, feature } = options
    const { container } = provider
    this.provider = provider
    this.shape = shape

    // Provider needs ref to draw moudule and draw needs ref to provider
    provider.draw = this

    const initialFeature = feature ? { ...feature, id: shape } : null
    this.oFeature = initialFeature

    // Add existing feature
    if (initialFeature && mode === 'default') {
      this.drawFeature(initialFeature)
      return
    }

    // Disable simple_select mode
    map.on('draw.modechange', e => {
      if (e.mode === 'simple_select') {
        this.draw.changeMode('edit_vertex', { container: container.parentNode, featureId: this.shape })
      }
    })

    // Pass vertex selected event to provider
    map.on('draw.vertexselected', e => {
      provider.dispatchEvent(new CustomEvent('vertex', {
        detail: {
          isSelected: e.isSelected
        }
      }))
    })

    // Start new
    this.edit(mode, shape)
  }

  // Add or edit
  edit (mode, shape) {
    const { draw, oFeature } = this
    const { map, container, paddingBox } = this.provider

    // Zoom to extent if we have an existing graphic
    if (oFeature) {
      const coords = oFeature.geometry.coordinates
      const bounds = this.getBoundsFromCoordinates(coords[0])
      map.fitBounds(bounds, { animate: false })
    }

    // Remove existing feature
    if (map.hasControl(draw)) {
      map.removeControl(this.draw)
    }

    // Draw a new feature and set edit_vertex
    if (mode === 'vertex') {
      const currentFeature = oFeature?.id === shape ? oFeature : null
      this.drawFeature(currentFeature || this.getFeatureFromElement(paddingBox, shape))
      this.draw.changeMode('edit_vertex', { container: container.parentNode, featureId: shape })
    }

    this.shape = shape
  }

  // Cancel update
  cancel (shape) {
    const { draw, oFeature } = this
    const { map } = this.provider
    const hasDrawControl = map.hasControl(draw)

    // Re-draw original feature and disable interactions
    if (hasDrawControl && oFeature) {
      draw.delete([shape])
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
    this.oFeature = this.draw.get(shape)

    return this.oFeature
  }

  // Delete feature
  delete () {
    const { draw } = this
    const { map } = this.provider
    this.oFeature = null

    // Remove draw
    map.removeControl(draw)
    this.draw = null
  }

  drawFeature (feature) {
    const { map } = this.provider

    MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
    MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
    MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

    const modes = MapboxDraw.modes
    modes.disabled = DisabledMode
    modes.edit_vertex = EditVertexMode

    const draw = new MapboxDraw({
      modes,
      styles: drawStyles,
      displayControlsDefault: false,
      userProperties: true
    })

    map.addControl(draw)
    draw.add(feature)
    draw.changeMode('disabled')

    this.draw = draw
  }

  getBoundsFromCoordinates (coords) {
    let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity
    coords.forEach(coord => {
      const x = coord[0]
      const y = coord[1]
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
    const feature = { id: shape, type: 'Feature', geometry: { type: 'Polygon' } }

    if (shape === 'circle') {
      // Circle
      const c = map.getCenter()
      const coords = [c.lng, c.lat]
      const radius = getDistance([nw.lng, nw.lat], [se.lng, nw.lat]) / 2
      const turfFeature = new TurfCircle(coords, radius, { units: 'meters' })
      const roundedCoords = turfFeature.geometry.coordinates[0].map(([lng, lat]) => [+(lng.toFixed(defaults.PRECISION)), +(lat.toFixed(defaults.PRECISION))])
      feature.geometry.coordinates = [roundedCoords]
    } else {
      // Polygon
      const b = [nw.lng, nw.lat, se.lng, se.lat]
      const coords = [[[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]], [b[0], b[1]]]]
      feature.geometry.coordinates = coords
    }

    return feature
  }
}

export default Draw
