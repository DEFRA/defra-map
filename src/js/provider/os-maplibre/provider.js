import { handleLoad, handleMoveStart, handleMove, handleIdle, handleStyleData, handleStyleLoad, handleError } from './events'
import { toggleSelectedFeature, getDetail, getLabels, getLabel } from './query'
import { locationMarkerHTML, targetMarkerHTML } from './marker'
import { highlightLabel } from './symbols'
import { getFocusPadding, spatialNavigate, getScale } from '../../lib/viewport'
import { debounce } from '../../lib/debounce'
import { defaults, css } from './constants'
import { capabilities } from '../../lib/capabilities.js'
import { defaults as storeDefaults } from '../../store/constants.js'

class Provider extends EventTarget {
  constructor ({ transformRequest, symbols }) {
    super()
    this.srid = 4326
    this.capabilities = {
      ...capabilities.default,
      hasDraw: true,
      hasSize: !!window.globalThis
    }
    this.transformRequest = transformRequest
    this.symbols = symbols
    this.baseLayers = []
    this.selectedId = ''
    this.selectedCoordinate = null
    this.isLoaded = false
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
    const { container, paddingBox, bounds, maxBounds, center, zoom, minZoom, maxZoom, style, size, featureLayers, locationLayers, callBack } = options
    const { Map: MaplibreMap, Marker } = module.default

    const scale = getScale(size)

    const map = new MaplibreMap({
      ...options,
      container,
      style: style?.url,
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
    this.style = style
    this.scale = scale

    // Add markers
    this.targetMarker = new Marker({ element: targetMarkerHTML() }).setLngLat([0, 0]).addTo(map)
    this.locationMarker = new Marker({ element: locationMarkerHTML() }).setLngLat([0, 0]).addTo(map)
    this.shortcutMarkers = []

    // Return ref to dynamically loaded modules and framework functions
    this.modules = { MaplibreMap, Marker }
    this.framework = { map }

    // Map ready event (first load)
    map.on('load', handleLoad.bind(map, this))

    // Map movestart
    map.on('movestart', handleMoveStart.bind(map, this))

    // Detect max/min zoom on move
    map.on('move', handleMove.bind(map, this))

    // Detect map layer addition
    map.on('styledata', handleStyleData.bind(map, this))

    // All render/changes/animations complete. Must debounce, min 500ms
    const debounceHandleIdle = debounce(() => { handleIdle(this) }, defaults.DELAY)
    map.on('idle', debounceHandleIdle)

    // Map style change
    map.on('style.load', handleStyleLoad.bind(map, this))

    // Capture errors
    map.on('error', handleError.bind(map, this))

    // Implementation callback after initialisation
    if (callBack) {
      callBack(this)
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

  setStyle (style) {
    this.style = style
    this.map.setStyle(style.url, { diff: false })

    // Udate draw style
    this.draw?.setStyle?.()
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
          type: 'size'
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

  initDraw (options) {
    import(/* webpackChunkName: "maplibre-draw" */ './draw.js').then(module => {
      const Draw = module.default
      this.draw = new Draw(this, options)
    })
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
    const detail = await getDetail(this, point)
    this.hideLabel()
    this.dispatchEvent(new CustomEvent('mapquery', {
      detail: {
        resultType: detail.features.resultType,
        ...detail
      }
    }))
  }

  getGeoLocation (success, error) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      let coord = [position.coords.longitude, position.coords.latitude]
      coord = coord.map(n => parseFloat(n.toFixed(defaults.PRECISION)))
      // const place = this.getNearest ? await this.getNearest(coord) : null
      success(coord, null)
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
    highlightLabel(this.map, this.scale, this.style.name, feature)
    return labels[index]?.pixel
  }

  showLabel (point) {
    const feature = getLabel(this, point)
    highlightLabel(this.map, this.scale, this.style.name, feature)
    return point
  }

  hideLabel () {
    if (this.map) {
      highlightLabel(this.map)
    }
  }
}

export default Provider
