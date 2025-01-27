import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { DisabledMode } from './draw-modes'
import { getFocusPadding } from '../../lib/viewport'
import { defaults as storeDefaults } from '../../store/constants'

const styles = [
  {
    id: 'stroke-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#ff0000',
      'line-width': 2,
      'line-opacity': 1
    }
  },
  {
    id: 'stroke-inactive',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'false']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#ff0000',
      'line-width': 2,
      'line-opacity': 0.8
    }
  },
  {
    id: 'midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#0000ff'
    }
  },
  {
    id: 'vertex',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
    paint: {
      'circle-radius': 7,
      'circle-color': '#ff0000'
    }
  }
]

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
      return
    }

    // Start new
    this.start('frame')
  }

  // Add or edit
  start (mode) {
    const { draw, oFeature } = this
    const { map } = this.provider
    const isFrame = mode === 'frame'
    this.toggleConstraints(true)

    // Remove existing feature
    if (isFrame && map.hasControl(draw)) {
      map.removeControl(this.draw)
    }

    // Draw existing feature
    if (!isFrame && oFeature) {
      this.drawFeature(oFeature)
    }
  }

  // Cancel
  cancel () {
    const { draw, oFeature } = this
    const { map } = this.provider
    // Disable interactions
    if (map.hasControl(draw)) {
      draw.changeMode('disabled')
    }
    // Re-draw original feature
    if (oFeature) {
      this.drawFeature(oFeature)
    }
    this.toggleConstraints(false)
  }

  // Confirm or update
  finish () {
    const { map, paddingBox } = this.provider
    if (!map.hasControl(this.draw)) {
      const feature = this.getFeatureFromElement(paddingBox)
      this.drawFeature(feature)
    }
    this.toggleConstraints(false)
    return this.draw.get('shape')
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
      console.log('Fit bounds of graphic')
      map.fitBounds(bounds, { animate: false })
    }
  }
  
  drawFeature (feature) {
    const { map } = this.provider
    this.oFeature = feature

    MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
    MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
    MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

    const modes = MapboxDraw.modes
    modes.disabled = DisabledMode

    const draw = new MapboxDraw({
      modes,
      styles,
      displayControlsDefault: false,
    })

    map.addControl(draw)
    draw.add(feature)
    draw.changeMode('disabled')
    // draw.changeMode('direct_select', { featureId: 'shape' })

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

  isSameFeature (a, b) {
    const numRings = 5
    return a.geometry.coordinates.flat(numRings).toString() === b.geometry.coordinates.flat(numRings).toString()
  }

  // getDrawFeature () {
  //   const { draw, oFeature } = this
  //   const { map } = this.provider
  //   const feature = draw.get('shape')
  //   const isSame = this.isSameFeature(oFeature, feature)
  //   if (isSame && map.hasControl(draw)) {
  //     draw.changeMode('disabled')
  //   }
  //   return isSame ? null : feature
  // }

  // edit () {
  //   const { paddingBox } = this.provider
  //   const feature = this.getFeatureFromElement(paddingBox)
  //   this.oFeature = feature
  //   this.drawFeature(feature)
  // }
}

export default Draw