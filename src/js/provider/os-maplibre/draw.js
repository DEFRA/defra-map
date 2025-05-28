import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { DisabledMode, EditVertexMode, DrawVertexMode } from './modes'
import { draw as drawStyles } from './styles'
import { getFocusPadding, getDistance } from '../../lib/viewport'
import { circle as TurfCircle } from '@turf/circle'
import { defaults } from './constants'

export class Draw {
  constructor (provider, options) {
    const { container, map, style } = provider
    Object.assign(this, options)

    const { drawMode, shape, feature } = options
    this.provider = provider
    this.shape = shape

    // Provider also needs ref to draw moudule and draw needs ref to provider
    provider.draw = this

    const initialFeature = feature ? { ...feature, id: shape } : null
    this.oFeature = initialFeature

    // Create draw instance
    MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
    MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
    MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

    const modes = MapboxDraw.modes
    modes.disabled = DisabledMode
    modes.edit_vertex = EditVertexMode
    modes.draw_vertex = DrawVertexMode

    const draw = new MapboxDraw({
      modes,
      styles: drawStyles(style.name),
      displayControlsDefault: false,
      userProperties: true
    })

    map.addControl(draw)
    this.draw = draw

    // Add existing feature
    if (initialFeature && drawMode === 'default') {
      this.addFeature(initialFeature)
      return
    }

    // Disable simple_select mode
    map.on('draw.modechange', e => {
      if (e.mode === 'simple_select') {
        draw.changeMode('edit_vertex', { container: container.parentNode, featureId: this.shape })
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

    map.on('click', e => {
      // console.log(e)
    })

    // Start new
    this.add(drawMode, shape)
  }

  // Add new shape
  add (drawMode, shape) {
    const { draw } = this
    const { container } = this.provider
    this.shape = shape

    // Remove existing drawn features
    if (drawMode === 'frame') {
      draw.deleteAll()
      draw.changeMode('disabled')
    }

    // Start a new polygon
    if (drawMode === 'vertex' && !draw.get(shape)) {
      draw.changeMode('draw_vertex', { container: container.parentNode, featureId: shape })
    }
  }

  // Edit existing shape
  edit (drawMode, shape) {
    const { oFeature, draw } = this
    const { map, container } = this.provider
    this.shape = shape

    // Zoom to extent if we have an existing graphic
    if (oFeature) {
      const coords = oFeature.geometry.coordinates
      const bounds = this.getBoundsFromCoordinates(coords[0])
      map.fitBounds(bounds, { animate: false })
    }

    // Remove existing drawn features
    if (drawMode === 'frame') {
      draw.deleteAll()
      draw.changeMode('disabled')
    }

    // Edit existing feature
    if (drawMode === 'vertex' && draw.get(shape)) {
      draw.changeMode('edit_vertex', { container: container.parentNode, featureId: shape })
    }
  }

  // Convert paddingBox to sqaure polygon and edit
  editPolygon () {
    this.addFeature(null, 'polygon')
    this.edit('vertex', 'polygon')
  }

  // Cancel update
  cancel () {
    const { draw, oFeature } = this

    // Remove any drawn features
    draw.deleteAll()

    // Reinstate original
    if (oFeature) {
      draw.add(oFeature)
    }

    // Set disabled mode
    draw.changeMode('disabled')
  }

  // Confirm or update
  finish (shape) {
    const { draw } = this
    const { paddingBox } = this.provider

    // Draw feature from padding box and shape
    if (['square', 'circle'].includes(shape)) {
      const elFeature = this.getFeatureFromElement(paddingBox, shape)
      this.addFeature(elFeature)
    }

    // Set ref to feature
    this.oFeature = draw.get(shape)

    // Set disabled mode
    draw.changeMode('disabled')

    return this.oFeature
  }

  // Delete feature
  delete () {
    const { draw } = this

    // Remove feature and clear original feature
    draw.deleteAll()
    this.oFeature = null
  }

  // Add feature to map
  addFeature (feature, shape) {
    const { paddingBox } = this.provider

    // Default feature if none provided
    feature ??= this.getFeatureFromElement(paddingBox, shape)

    this.draw.add(feature)
    this.draw.changeMode('disabled')
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

  setStyle () {
    const { draw, shape } = this

    if (draw?.getMode() === 'edit_vertex') {
      // Need to switch to another mode first to call onStop
      draw.changeMode('simple_select')

      // Call edit again to reinstate the mode
      this.edit('vertex', shape)
    }
  }
}

export default Draw
