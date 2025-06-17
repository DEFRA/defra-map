import { handleLoad, handleMoveStart, handleMove, handleIdle, handleStyleData, handleStyleLoad, handleError } from './events.js'
import { toggleSelectedFeature, getDetail, getLabels, getLabel } from './query.js'
import { locationMarkerHTML, targetMarkerHTML } from './marker.js'
import { highlightLabel } from './symbols.js'
import { getFocusPadding, spatialNavigate, getScale } from '../../lib/viewport.js'
import { debounce } from '../../lib/debounce.js'
import { throttle } from '../../lib/throttle.js'
import { defaults, css } from './constants.js'
import { defaults as storeDefaults } from '../../store/constants.js'

class MapLibreProvider extends EventTarget {
  constructor ({ capabilities, transformRequest, symbols }) {
    super()
    this.srid = 4326
    this.capabilities = capabilities
    this.transformRequest = transformRequest
    this.symbols = symbols
    this.baseLayers = []
    this.selectedId = ''
    this.selectedCoordinate = null
    this.isLoaded = false
  }

  init (options) {
    if (this.capabilities.isLatest) {
      import(/* webpackChunkName: "maplibre", webpackExports: ["Map", "Marker", "LngLatBounds"] */ 'maplibre-gl').then(module => {
        this.addMap(module, options)
      })
    } else {
      Promise.all([
        import(/* webpackChunkName: "maplibre-legacy", webpackExports: ["Map", "Marker", "LngLatBounds"] */ 'maplibre-gl-legacy'),
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
    const { Map: MaplibreMap, Marker, LngLatBounds } = module.default
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

    // Set initial padding, bounds and center (*No option to set in constructor)
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
    this.modules = { MaplibreMap, Marker, LngLatBounds }
    this.framework = { map }

    // Map ready event (first load)
    map.on('load', handleLoad.bind(this))

    // Map movestart
    map.on('movestart', handleMoveStart.bind(this))

    // Detect max/min zoom on move
    const throttleHandleMove = throttle(() => { handleMove.bind(this)() }, defaults.THROTTLE)
    map.on('move', throttleHandleMove)

    // Detect map layer addition
    map.on('styledata', handleStyleData.bind(this))

    // All render/changes/animations complete. Must debounce, min 500ms
    const debounceHandleIdle = debounce(() => { handleIdle.bind(this)() }, defaults.DELAY)
    map.on('idle', debounceHandleIdle)

    // Map style change
    map.on('style.load', handleStyleLoad.bind(this))

    // Capture errors
    map.on('error', handleError.bind(this))

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
    toggleSelectedFeature.bind(this)(id)
  }

  selectCoordinate (coord) {
    this.selectedCoordinate = coord
  }

  async queryFeature (id) {
    if (id) {
      const detail = await getDetail.bind(this)(null, false)
      detail.features.items = [detail.features.items.find(f => f.id === id)]
      this.dispatchEvent(new CustomEvent('mapquery', { detail }))
    }
  }

  async queryPoint (point) {
    const detail = await getDetail.bind(this)(point, this.selectedLayers)
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
    const labels = getLabels.bind(this)()
    const { lng, lat } = this.map.getCenter()
    const center = this.map.project([lng, lat])
    const pixels = labels.map(c => c.pixel)
    const index = spatialNavigate(direction, pixel || [center.x, center.y], pixels)
    const feature = labels[index]?.feature
    highlightLabel.bind(this)(feature)
    return labels[index]?.pixel
  }

  showLabel (point) {
    const feature = getLabel.bind(this)(point)
    highlightLabel.bind(this)(feature)
    return point
  }

  hideLabel () {
    if (this.map) {
      highlightLabel.bind(this)()
    }
  }
}

export default MapLibreProvider
