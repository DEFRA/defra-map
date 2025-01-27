import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { getFocusPadding } from '../../lib/viewport'

const styles = ['defaultUrl', 'darkUrl', 'aerialUrl', 'deuteranopiaUrl', 'tritanopiaUrl']

export class Draw {
  constructor (provider, options) {
    const { map } = provider
    this.provider = provider
    Object.assign(this, options)

    // Reference to original styles
    styles.forEach(s => { this[s + 'Org'] = provider[s] })

    // Reference to original zoom constraints
    this.maxZoomO = map.getMaxZoom()
    this.minZoomO = map.getMinZoom()

    // Provider needs ref to draw moudule and draw need ref to provider
    provider.draw = this

    // Add existing feature
    if (options.feature) {
      this.editGeoJSON(options.feature)
      return
    }

    // Start new
    this.start('frame')
  }

  start (mode) {
    const isFrame = mode === 'frame'
    this.toggleConstraints(true)

    // Remove any existing feature
    if (isFrame) {
      console.log('Remove any graphics')
      return
    }

    // Edit existing feature
    this.editGeoJSON(this.oFeature)
  }

  toggleConstraints (hasConstraints) {
    const { provider, maxZoom, maxZoomO, minZoomO, minZoom, oFeature } = this
    const { map } = provider

    // Toggle min and max zoom
    map.setMaxZoom(hasConstraints ? maxZoom : maxZoomO)
    map.setMinZoom(hasConstraints ? minZoom : minZoomO)

    // Toggle basemaps
    styles.forEach(s => { provider[s] = hasConstraints ? (this[s] || provider[s]) : (this[s + 'Org'] || provider[s]) })
    if (this[provider.basemap + 'Url']) {
      provider.setBasemap(provider.basemap)
    }

    // Zoom to extent if we have an existing graphic
    if (hasConstraints && oFeature) {
      console.log('Fit bounds of graphic')
      // map.fitBounds(bounds, { animate: false })
    }
  }

  isSameFeature (a, b) {
    const numRings = 5
    return a.geometry.coordinates.flat(numRings).toString() === b.geometry.coordinates.flat(numRings).toString()
  }

  edit () {
    const { paddingBox } = this.provider
    const feature = this.getFeatureFromElement(paddingBox)
    this.oFeature = feature
    this.editGeoJSON(feature)
  }

  cancel () {
    const { draw } = this
    const { map } = this.provider
    map.removeControl(draw)
  }

  finish () {
    const { paddingBox } = this.provider
    const feature = this.getFeatureFromElement(paddingBox)
    this.editGeoJSON(feature)
  }

  editGeoJSON (feature) {
    const { map } = this.provider

    MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
    MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
    MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

    const draw = new MapboxDraw({
      displayControlsDefault: false
    })

    map.addControl(draw)
    draw.add(feature)
    // draw.changeMode('direct_select', { featureId: 'shape' })
    draw.changeMode('simple_select', { featureId: 'shape' })

    this.draw = draw
  }

  finishEdit () {
    const { draw, oFeature } = this
    const { map } = this.provider
    const feature = draw.get('shape')
    const isSame = this.isSameFeature(oFeature, feature)
    if (isSame && map.hasControl(draw)) {
      map.removeControl(draw)
    }
    return isSame ? null : feature
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
    const { map, target, scale } = this.provider
    const box = el.getBoundingClientRect()
    const padding = getFocusPadding(el, target, scale)
    const nw = map.unproject([padding.left, padding.top])
    const se = map.unproject([padding.left + box.width, padding.top + box.height])
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