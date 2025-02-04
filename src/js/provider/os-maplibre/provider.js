import { handleLoad, handleMoveStart, handleIdle, handleStyleData, handleStyleLoad, handleError } from './events'
import { toggleSelectedFeature, getDetail, getLabels, getLabel } from './query'
import { locationMarkerHTML, targetMarkerHTML } from './marker'
import { highlightLabel } from './symbols'
import { getFocusPadding, spatialNavigate, getScale, getStyle } from '../../lib/viewport'
import { filterOptions } from '../../lib/utils'
import { debounce } from '../../lib/debounce'
import { defaults, css } from './constants'
import { capabilities } from '../../lib/capabilities.js'
import { LatLon } from 'geodesy/osgridref.js'
import { defaults as storeDefaults, constructorOptions } from '../../store/constants.js'

class Provider extends EventTarget {
  constructor ({ transformSearchRequest, transformRequest, geocodeProvider, symbols }) {
    super()
    this.srs = 4326
    this.capabilities = capabilities.default
    this.transformSearchRequest = transformSearchRequest
    this.transformRequest = transformRequest
    this.symbols = symbols
    this.baseLayers = []
    this.selectedId = ''
    this.selectedCoordinate = null
    this.isLoaded = false
    this.geocodeProvider = geocodeProvider || storeDefaults.GEOCODE_PROVIDER
    // Not sure why this is needed?
    this.getNearest = this.getNearest.bind(this)
  }

  init (options) {
    if (this.capabilities.isLatest) {
      import(/* webpackChunkName: "maplibre", webpackExports: ["Map", "Marker"] */ 'maplibre-gl').then(module => {
        this.addMap(module, options)
      })
    } else {
      Promise.all([
        import(/* webpackChunkName: "maplibre-legacy", webpackExports: ["Map", "Marker"] */ 'maplibre-gl-legacy'),
        import(/* webpackChunkName: "maplibre-legacy", webpackExports: ["install"] */ 'resize-observer'),
        import(/* webpackChunkName: "maplibre-legacy" */ 'array-flat-polyfill')
      ]).then(promises => {
        if (!window.ResizeObserver) {
          promises[1].install()
        }
        this.addMap(promises[0], options)
      })
    }
  }

  remove () {
    this.map?.remove()
    this.map = null
  }

  addMap (module, options) {
    const { container, paddingBox, bounds, maxBounds, center, zoom, minZoom, maxZoom, styles, basemap, size, featureLayers, locationLayers, init } = options
    const { Map: MaplibreMap, Marker } = module.default

    const scale = getScale(size)
    const style = getStyle(styles, basemap)?.url

    // Filter all keys so only valid MapLibre MapOptions can be passed to the constructor
    const filteredOptions = filterOptions(options, constructorOptions)

    const map = new MaplibreMap({
      ...filteredOptions,
      container,
      style,
      maxBounds: maxBounds || storeDefaults.MAX_BOUNDS_4326,
      bounds,
      center,
      zoom,
      minZoom,
      maxZoom,
      fadeDuration: 0,
      attributionControl: false,
      dragRotate: false
    })

    // Set initial padding, bounds and center
    // // * Can't set global padding in constructor
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

    this.container = container
    this.map = map
    this.featureLayers = featureLayers || []
    this.locationLayers = locationLayers || []
    this.selectedLayers = []
    this.paddingBox = paddingBox
    this.styles = styles
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
    this.shortcutMarkers = []

    // Return ref to dynamically loaded modules
    this.modules = { MaplibreMap, Marker }

    // Return ref to framework methods
    this.framework = { map }

    // Implementation callback after initialisation
    if (init) {
      init(this)
    }
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
    if (this.map) {
      this.map.panBy(offset, { ...defaults.ANIMATION }, { isUserInitiated })
    }
  }

  panTo (coord) {
    this.map.flyTo({ center: coord, ...defaults.ANIMATION })
  }

  zoomIn () {
    if (this.map) {
      this.map.zoomIn(defaults.ANIMATION)
    }
  }

  zoomOut () {
    if (this.map) {
      this.map.zoomOut(defaults.ANIMATION)
    }
  }

  setBasemap (basemap) {
    const style = getStyle(this.styles, basemap)
    this.basemap = basemap
    this.map.setStyle(style.url, { diff: false })
  }

  setPadding (coord, isAnimate) {
    if (this.map) {
      const { map, paddingBox, scale } = this
      const padding = getFocusPadding(paddingBox, scale)
      // Search needs to set padding first before fitBounds
      this.map.setPadding(padding || map.getPadding())
      // Ease map to new when coord is obscured
      coord && this.map.easeTo({ center: coord, animate: isAnimate, ...defaults.ANIMATION })
    }
  }

  setSize (size) {
    const scale = getScale(size)
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

  fitBounds (bounds, isAnimate = true) {
    bounds = [[bounds[0], bounds[1]], [bounds[2], bounds[3]]]
    this.map.fitBounds(bounds, { animate: isAnimate, linear: true, duration: defaults.ANIMATION.duration })
  }

  setCentre (coord, _zoom) {
    if (this.map) {
      this.map.flyTo({ center: coord, ...defaults.ANIMATION })
    }
  }

  setTargetMarker (coord, hasData, isVisible) {
    const { targetMarker } = this
    if (targetMarker) {
      targetMarker.setLngLat(coord || [0, 0])
      const el = targetMarker.getElement() // addClassName not supported in v1.15
      el.classList.toggle('fm-c-marker--has-data', hasData)
      el.classList.toggle(css.MARKER_VISIBLE, isVisible && coord)
    }
  }

  selectFeature (id) {
    this.selectedId = id
    toggleSelectedFeature(this.map, this.selectedLayers, id)
  }

  selectCoordinate (coord) {
    this.selectedCoordinate = coord
  }

  async queryFeature (id) {
    if (id) {
      const detail = await getDetail(this, null, false)
      detail.features.items = [detail.features.items.find(f => f.id === id)]
      this.dispatchEvent(new CustomEvent('mapquery', { detail }))
    }
  }

  async queryPoint (point) {
    const { getNearest } = this
    const detail = await getDetail(this, point)
    const place = await getNearest(detail.coord)
    this.hideLabel()
    this.dispatchEvent(new CustomEvent('mapquery', {
      detail: {
        resultType: detail.features.resultType,
        ...detail,
        place
      }
    }))
  }

  async getNearest (coord) {
    if (this.geocodeProvider === 'os-open-names') {
      try {
        const bng = (new LatLon(coord[1], coord[0])).toOsGrid()
        coord = [bng.easting, bng.northing]
      } catch (err) {
        console.log(err)
        return null
      }
    }

    let response

    const isEsri = this.geocodeProvider === 'esri-world-geocoder'

    if (this.capabilities.isLatest) {
      const { getNearest } = isEsri
        ? await import(/* webpackChunkName: "maplibre" */ '../esri-world-geocoder/nearest.js')
        : await import(/* webpackChunkName: "maplibre" */ '../os-open-names/nearest.js')
      response = await getNearest(coord, this.transformSearchRequest)
    } else {
      const { getNearest } = isEsri
        ? await import(/* webpackChunkName: "maplibre-legacy" */ '../esri-world-geocoder/nearest.js')
        : await import(/* webpackChunkName: "maplibre-legacy" */ '../os-open-names/nearest.js')
      response = await getNearest(coord, this.transformSearchRequest)
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

  showNextLabel (pixel, direction) {
    const labels = getLabels(this)
    const { lng, lat } = this.map.getCenter()
    const center = this.map.project([lng, lat])
    const pixels = labels.map(c => c.pixel)
    const index = spatialNavigate(direction, pixel || [center.x, center.y], pixels)
    const feature = labels[index]?.feature
    highlightLabel(this.map, this.scale, this.basemap, feature)
    return labels[index]?.pixel
  }

  showLabel (point) {
    const feature = getLabel(this, point)
    highlightLabel(this.map, this.scale, this.basemap, feature)
    return point
  }

  hideLabel () {
    if (this.map) {
      highlightLabel(this.map)
    }
  }
}

export default Provider
