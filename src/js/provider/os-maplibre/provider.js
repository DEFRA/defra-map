import { handleLoad, handleMoveStart, handleIdle, handleStyleData, handleStyleLoad, handleError } from './events'
import { addPointerQuery, toggleSelectedFeature, getDetail } from './query'
import { locationMarkerHTML, targetMarkerHTML } from './marker'
import { getFocusPadding } from '../../lib/viewport'
import { debounce } from '../../lib/debounce'
import { defaults, css } from './constants'
import { LatLon } from 'geodesy/osgridref.js'
import src from './src.json'

// const transformRequest = (url, resourceType) => {
//   console.log(this)
//   // const token = (async () => (await this.osTokenCallback()).token)()
//   // console.log(token)
//   if (resourceType !== 'Style' && url.startsWith('https://api.os.uk')) {
//     // Conditionally refresh token
//     // const token = ''
//     const token = (async () => (await this.osTokenCallback()).token)()
//     url = new URL(url)

//     if (!url.searchParams.has('srs')) {
//       url.searchParams.append('srs', 3857)
//     }

//     return {
//       url: new Request(url).url,
//       headers: {
//         Authorization: 'Bearer ' + token
//       }
//     }
//   }
// }

class Provider extends EventTarget {
  constructor ({ osTokenCallback, esriTokenCallback, defaultUrl, darkUrl, aerialUrl, deuteranopiaUrl, tritanopiaUrl, reverseGeocodeProvider, reverseGeocodeToken, symbols }) {
    super()
    this.srs = 4326
    this.osTokenCallback = osTokenCallback
    this.esriTokenCallback = esriTokenCallback
    this.defaultUrl = defaultUrl
    this.darkUrl = darkUrl
    this.aerialUrl = aerialUrl
    this.deuteranopiaUrl = deuteranopiaUrl
    this.tritanopiaUrl = tritanopiaUrl
    this.map = null
    this.basemaps = ['default', 'dark', 'aerial', 'deuteranopia', 'tritanopia', 'high-contrast'].filter(b => this[b + 'Url'])
    this.symbols = symbols
    this.stylesImagePath = src.STYLES
    this.baseLayers = []
    this.selectedId = ''
    this.selectedCoordinate = null
    this.isLoaded = false
    this.reverseGeocodeProvider = reverseGeocodeProvider
    this.reverseGeocodeToken = reverseGeocodeToken
    this.attribution = {
      label: 'Ordnance Survey logo'
    }
    // Not sure why this is needed?
    this.getNearest = this.getNearest.bind(this)
  }

  init (options) {
    if (window.globalThis) {
      import(/* webpackChunkName: "maplibre", webpackExports: ["Map", "Marker"] */ 'maplibre-gl').then(module => {
        this.addMap({ module, ...options })
      })
    } else {
      Promise.all([
        import(/* webpackChunkName: "maplibre-legacy", webpackExports: ["Map", "Marker"] */ 'maplibre-gl-legacy'),
        import(/* webpackChunkName: "maplibre-legacy", webpackExports: ["install"] */ 'resize-observer')
      ]).then(promises => {
        promises[1].install()
        this.addMap({ module: promises[0], ...options })
      })
    }
  }

  remove () {
    this.map?.remove()
    this.map = null
  }

  addMap ({ module, target, paddingBox, frame, bbox, centre, zoom, minZoom, maxZoom, basemap, size, featureLayers, pixelLayers }) {
    const { Map: MaplibreMap, Marker } = module.default
    const scale = size === 'large' ? 2 : 1
    const bounds = bbox ? [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] : null
    const center = centre || [0, 0]
    basemap = basemap === 'dark' && !this.basemaps.includes('dark') ? 'dark' : basemap

    const map = new MaplibreMap({
      style: this[basemap + 'Url'],
      container: target,
      maxBounds: defaults.OPTIONS.maxBounds,
      bounds,
      center,
      zoom: zoom || null,
      minZoom,
      maxZoom,
      fadeDuration: 0,
      attributionControl: false,
      dragRotate: false
    })

    // Set initial padding, bounds and centre
    // * Can't set global padding in constructor
    // map.showPadding = true
    map.setPadding(getFocusPadding(paddingBox, scale))
    if (bounds) {
      map.fitBounds(bounds, { animate: false })
    } else {
      map.flyTo({ center, zoom, animate: false })
    }

    // Disable rotation
    map.touchZoomRotate.disableRotation()

    // Overide device pixel ratio
    if (map.setPixelRatio) {
      map.setPixelRatio(window.devicePixelRatio * scale)
    }

    // Tidy up canvas
    const canvas = map.getCanvas()
    canvas.removeAttribute('role')
    canvas.removeAttribute('tabindex')
    canvas.removeAttribute('aria-label')
    canvas.style.display = 'block'

    this.target = target
    this.map = map
    this.featureLayers = featureLayers
    this.pixelLayers = pixelLayers
    this.paddingBox = paddingBox
    this.frame = frame
    this.basemap = basemap
    this.scale = scale

    // Map ready event (first load)
    map.on('load', handleLoad.bind(map, this))

    // Map movestart
    map.on('movestart', handleMoveStart.bind(map, this))

    // Detect map layer addition
    map.on('styledata', handleStyleData.bind(map, this))

    // All render/changes/animations complete. Must debounce, min 300ms
    const debounceHandleIdle = debounce(() => { handleIdle(this) }, defaults.DELAY)
    map.on('idle', debounceHandleIdle)

    // Map basemap change
    map.on('style.load', handleStyleLoad.bind(map, this))

    // Capture errors
    map.on('error', handleError.bind(map, this))

    // Add markers
    this.targetMarker = new Marker({ element: targetMarkerHTML() }).setLngLat([0, 0]).addTo(map)
    this.locationMarker = new Marker({ element: locationMarkerHTML() }).setLngLat([0, 0]).addTo(map)

    // Add queryFeature and queryPixel behaviour
    addPointerQuery(this)
  }

  getImagePos (style) {
    return {
      default: '0 0',
      dark: '0 -120px',
      aerial: '0 -240px',
      deuteranopia: '0 -360px',
      tritanopia: '0 -480px',
      'high-contrast': '0 -600px',
      small: '0 -720px',
      large: '0 -840px'
    }[style]
  }

  getPixel (coord) {
    let pixel
    if (this.map && coord) {
      pixel = this.map.project(coord)
      pixel = [Math.round(pixel.x), Math.round(pixel.y)]
    }
    return pixel
  }

  panBy (offset, isUserInitiated = true) {
    if (!this.map) {
      return
    }
    this.map.panBy(offset, { ...defaults.ANIMATION }, { isUserInitiated })
  }

  panTo (coord) {
    this.map.flyTo({ center: coord, ...defaults.ANIMATION })
  }

  zoomIn () {
    if (!this.map) {
      return
    }
    this.map.zoomIn(defaults.ANIMATION)
  }

  zoomOut () {
    if (!this.map) {
      return
    }
    this.map.zoomOut(defaults.ANIMATION)
  }

  async setBasemap (basemap) {
    basemap = basemap === 'dark' && !this.basemaps.includes('dark') ? 'default' : basemap
    this.basemap = basemap
    this.map.setStyle(this[basemap + 'Url'], { diff: false })
  }

  setPadding (coord, isAnimate) {
    if (!this.map) {
      return
    }
    const { paddingBox, scale } = this
    const padding = getFocusPadding(paddingBox, scale)
    // Search needs to set padding first before fitBbox
    this.map.setPadding(padding)
    if (!coord) {
      return
    }
    this.map.easeTo({ center: coord, animate: isAnimate, ...defaults.ANIMATION })
  }

  setSize (size) {
    const scale = size === 'large' ? 2 : 1
    this.scale = scale
    this.setPadding()
    if (this.map.setPixelRatio) {
      this.map?.setPixelRatio(window.devicePixelRatio * scale)
    }
    setTimeout(() => {
      this.map.resize()
      this.dispatchEvent(new CustomEvent('style', {
        detail: {
          type: 'size', size, basemap: this.basemap
        }
      }))
    }, defaults.DELAY)
  }

  fitBbox (bbox, isAnimate = true) {
    const bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]]
    this.map.fitBounds(bounds, { animate: isAnimate, linear: true, duration: defaults.ANIMATION.duration })
  }

  setCentre (coord, _zoom) {
    if (!this.map) {
      return
    }
    this.map.flyTo({ center: coord, ...defaults.ANIMATION })
  }

  initDraw (draw, basemap, el) {
    import(/* webpackChunkName: "maplibre-draw" */ './draw.js').then(module => {
      const Draw = module.default
      this.draw = new Draw(this, draw, basemap, el)
    })
  }

  // editElement (el) {
  //   import(/* webpackChunkName: "maplibre-draw" */ './draw.js').then(module => {
  //     const Draw = module.default
  //     this.draw = new Draw(this)
  //     this.draw.editElement(el)
  //   })
  // }

  setTargetMarker (coord, hasData, isVisible) {
    const { targetMarker } = this
    if (!targetMarker) {
      return
    }
    targetMarker.setLngLat(coord || [0, 0])
    const el = targetMarker.getElement() // addClassName not supported in v1.15
    el.classList.toggle('fm-c-marker--has-data', hasData)
    el.classList.toggle(css.MARKER_VISIBLE, isVisible && coord)
  }

  selectFeature (id) {
    this.selectedId = id
    toggleSelectedFeature(this.map, id)
  }

  selectCoordinate (coord) {
    this.selectedCoordinate = coord
  }

  async queryFeature (id) {
    if (!id) {
      return
    }
    const detail = await getDetail(this, null, false)
    detail.features.items = [detail.features.items.find(f => f.id === id)]
    this.dispatchEvent(new CustomEvent('mapquery', {
      detail
    }))
  }

  async queryPoint (point) {
    const { getNearest } = this
    const detail = await getDetail(this, point)
    const place = await getNearest(detail.coord)
    this.dispatchEvent(new CustomEvent('mapquery', {
      detail: {
        resultType: detail.features.resultType,
        ...detail,
        place
      }
    }))
  }

  async getNearest (coord) {
    if (this.reverseGeocodeProvider === 'os-open-names') {
      try {
        const bng = (new LatLon(coord[1], coord[0])).toOsGrid()
        coord = [bng.easting, bng.northing]
      } catch (err) {
        console.log(err)
        return null
      }
    }

    let response

    const isEsri = this.reverseGeocodeProvider === 'esri-world-geocoder'
    const tokenCallback = isEsri ? this.esriTokenCallback : this.osTokenCallback

    if (window.globalThis) {
      const { getNearest } = isEsri
        ? await import(/* webpackChunkName: "maplibre" */ '../esri-world-geocoder/nearest.js')
        : await import(/* webpackChunkName: "maplibre" */ '../os-open-names/nearest.js')
      response = await getNearest(coord, tokenCallback)
    } else {
      const { getNearest } = isEsri
        ? await import(/* webpackChunkName: "maplibre-legacy" */ '../esri-world-geocoder/nearest.js')
        : await import(/* webpackChunkName: "maplibre-legacy" */ '../os-open-names/nearest.js')
      response = await getNearest(coord, tokenCallback)
    }

    return response
  }

  getGeoLocation (success, error) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      let coord = [position.coords.longitude, position.coords.latitude]
      coord = coord.map(n => parseFloat(n.toFixed(defaults.PRECISION)))
      const place = this.getNearest ? await this.getNearest(coord) : null
      success(coord, place)
    }, (err) => {
      console.log(err)
      error(err)
    }, {
      enableHighAccuracy: false
    })
  }

  showLocation (coord) {
    const { locationMarker } = this
    locationMarker.setLngLat(coord).addClassName(css.MARKER_VISIBLE)
  }
}

export default Provider
