import MapboxDraw from '@mapbox/mapbox-gl-draw'

export class Draw {
  constructor (provider, draw, basemap, focusBox) {
    const { map } = provider
    this.basemap = basemap
    this.provider = provider
    this.focusBox = focusBox
    Object.assign(this, draw)

    const styles = ['defaultUrl', 'darkUrl', 'aerialUrl', 'deuteranopiaUrl', 'tritanopiaUrl']
    styles.forEach(s => {
      this[s + 'Org'] = provider[s]
      provider[s] = this[s] || provider[s]
    })
    this.styles = styles

    this.maxZoomO = map.getMaxZoom()
    this.minZoomO = map.getMinZoom()
    map.setMaxZoom(draw.maxZoom)
    map.setMinZoom(draw.minZoom)

    if (!this[basemap + 'Url']) {
      return
    }
    provider.setBasemap(basemap)
  }

  remove () {
    const { provider, draw, styles, maxZoomO, minZoomO } = this
    const { map } = provider
    styles.forEach(s => { provider[s] = this[s + 'Org'] })
    map.setMaxZoom(maxZoomO)
    map.setMinZoom(minZoomO)
    if (map.hasControl(draw)) {
      map.removeControl(draw)
    }
    if (!this[provider.basemap + 'Url']) {
      return
    }
    provider.setBasemap(provider.basemap)
  }

  isSameFeature (a, b) {
    const numRings = 5
    return a.geometry.coordinates.flat(numRings).toString() === b.geometry.coordinates.flat(numRings).toString()
  }

  edit () {
    const { focusBox } = this
    const feature = this.getFeature(focusBox)
    this.oFeature = feature
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
    draw.changeMode('direct_select', { featureId: 'shape' })

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

  getBounds () {
    const el = this.focusBox
    const { map } = this.provider
    const box = el.getBoundingClientRect()
    const nw = map.unproject([el.offsetLeft, el.offsetTop])
    const se = map.unproject([el.offsetLeft + box.width, el.offsetTop + box.height])
    return [nw.lng, nw.lat, se.lng, se.lat]
  }

  getFeature () {
    const el = this.focusBox
    const bounds = this.getBounds(el)
    const coords = [[
      [bounds[0], bounds[1]],
      [bounds[2], bounds[1]],
      [bounds[2], bounds[3]],
      [bounds[0], bounds[3]],
      [bounds[0], bounds[1]]
    ]]
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
