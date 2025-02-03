import { handleBaseTileLayerLoaded, handleBasemapChange, handleMoveStart, handleStationary } from './events'
import { getDetail } from './query'
import { debounce } from '../../lib/debounce'
import { getFocusPadding } from '../../lib/viewport.js'
import { capabilities } from '../../lib/capabilities.js'
import { defaults, mapViewExcludeOptions } from './constants'
import { targetMarkerGraphic } from './marker'
import { filterOptions } from '../../lib/utils.js'
import { defaults as storeDefaults, constructorOptions } from '../../store/constants.js'

class Provider extends EventTarget {
  constructor ({ transformSearchRequest, tokenCallback, interceptorsCallback, geocodeProvider, styles }) {
    super()
    this.srs = 27700
    this.capabilities = capabilities.esri
    this.transformSearchRequest = transformSearchRequest
    this.tokenCallback = tokenCallback
    this.interceptorsCallback = interceptorsCallback
    this.geocodeProvider = geocodeProvider || storeDefaults.GEOCODE_PROVIDER
    this.defaultUrl = styles.defaultUrl
    this.darkUrl = styles.darkUrl
    this.aerialUrl = styles.aerialUrl
    this.basemaps = ['default', 'dark', 'aerial'].filter(b => this[b + 'Url'])
    this.isUserInitiated = false
    this.isLoaded = false
  }

  init (options) {
    Promise.all([
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/config.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/Map.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/views/MapView.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/geometry/Extent.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/geometry/Point.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/layers/VectorTileLayer.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/layers/FeatureLayer.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/layers/GraphicsLayer.js'),
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/layers/support/TileInfo.js'),
      import(/* webpackChunkName: "esri-sdk", webpackExports: ["watch", "when"] */ '@arcgis/core/core/reactiveUtils.js')
    ]).then(modules => this.addMap(modules, options))
  }

  remove () {
    // console.log('Remove and tidy up')
  }

  async addMap (modules, options) {
    const { container, paddingBox, bounds, center, zoom, minZoom, maxZoom, maxBounds: maxExtent, basemap, pixelLayers } = options
    const esriConfig = modules[0].default
    const EsriMap = modules[1].default
    const MapView = modules[2].default
    const Extent = modules[3].default
    const Point = modules[4].default
    const VectorTileLayer = modules[5].default
    const FeatureLayer = modules[6].default
    const GraphicsLayer = modules[7].default
    const TileInfo = modules[8].default
    const reactiveWatch = modules[9].watch
    esriConfig.apiKey = (await this.tokenCallback()).token

    // Add intercepors
    this.interceptorsCallback().forEach(interceptor => esriConfig.request.interceptors.push(interceptor))

    // Define layers
    const baseTileLayer = new VectorTileLayer({ id: 'baselayer', url: basemap === 'aerial' ? this.defaultUrl : this[basemap + 'Url'], visible: true })
    const graphicsLayer = new GraphicsLayer({ id: 'graphicslayer' })
    const map = new EsriMap({
      layers: [baseTileLayer, graphicsLayer]
    })
    const geometry = maxExtent ? this.getExtent(Extent, maxExtent) : null

    // Filter all keys so only valid MapView options can be passed to the constructor
    const filteredOptions = filterOptions(options, [...constructorOptions, ...mapViewExcludeOptions])

    // Create MapView
    const view = new MapView({
      ...filteredOptions,
      spatialReference: 27700,
      container,
      map,
      zoom,
      center: center ? this.getPoint(Point, center) : null,
      extent: bounds ? this.getExtent(Extent, bounds) : null,
      constraints: { snapToZoom: false, minZoom, maxZoom, maxScale: 0, geometry, lods: TileInfo.create({ spatialReference: { wkid: 27700 } }).lods, rotationEnabled: false },
      ui: { components: [] },
      padding: getFocusPadding(paddingBox, 1),
      popupEnabled: false
    })

    // Tidy up canvas
    const canvasContainer = container.querySelector('.esri-view-surface')
    canvasContainer.removeAttribute('role')
    canvasContainer.tabIndex = -1

    this.map = map
    this.container = container
    this.view = view
    this.baseTileLayer = baseTileLayer
    this.graphicsLayer = graphicsLayer
    this.pixelLayers = pixelLayers
    this.paddingBox = paddingBox
    this.basemap = basemap
    this.isDark = ['dark', 'aerial'].includes(basemap)
    this.esriConfig = esriConfig
    this.modules = { Map, MapView, Extent, Point, VectorTileLayer, GraphicsLayer, FeatureLayer }

    // Map ready event (first load)
    baseTileLayer.watch('loaded', () => handleBaseTileLayerLoaded(this))

    // Movestart
    let isMoving = false
    reactiveWatch(() => [view.center, view.zoom, view.stationary], ([_center, _zoom, stationary]) => {
      if (!isMoving && !stationary) {
        handleMoveStart(this)
        isMoving = true
      }
    })

    // Constrain extent
    view.watch('extent', e => {
      if (!geometry?.contains(e)) {
        // To follow
        // view.goTo(geometry, { animate: false })
      }
    })

    // All changes. Must debounce, min 300ms
    const debounceStationary = debounce(() => {
      isMoving = false
      handleStationary(this)
    }, defaults.DELAY)

    reactiveWatch(() => [view.stationary, view.updating], ([stationary]) => {
      if (stationary) {
        debounceStationary()
      }
    })

    // Detect user initiated map movement
    view.on('drag', e => {
      if (e.action === 'start') {
        this.isUserInitiated = true
      }
    })
    view.on('mouse-wheel', () => { this.isUserInitiated = true })

    // Return ref to framework methods
    this.framework = { map, view, esriConfig }
    this.modules = modules
  }

  getPoint (Point, coords) {
    return new Point({
      x: coords[0],
      y: coords[1],
      spatialReference: { wkid: 27700 }
    })
  }

  getExtent (Extent, coords) {
    return new Extent({
      xmin: coords[0],
      ymin: coords[1],
      xmax: coords[2],
      ymax: coords[3],
      spatialReference: { wkid: 27700 }
    })
  }

  getPixel (coord) {
    const pixel = this.view.toScreen({ x: coord[0], y: coord[1] })
    return [Math.round(pixel.x), Math.round(pixel.y)]
  }

  panBy (offset, isUserInitiated = true) {
    const { x, y } = this.view.toScreen(this.view.center)
    const newPixel = { x: x + offset[0], y: y + offset[1] }
    const newCentre = this.view.toMap(newPixel)
    this.isUserInitiated = isUserInitiated
    this.view.goTo({ center: newCentre }).catch(err => console.log(err))
  }

  panTo (coord) {
    this.view.goTo({ target: { x: coord[0], y: coord[1] } }).catch(err => console.log(err))
  }

  zoomIn () {
    this.view.animation?.destroy()
    this.isUserInitiated = true
    this.view.goTo({ zoom: this.view.zoom + 1 }).catch(err => console.log(err))
  }

  zoomOut () {
    this.view.animation?.destroy()
    this.isUserInitiated = true
    this.view.goTo({ zoom: this.view.zoom - 1 }).catch(err => console.log(err))
  }

  setBasemap (basemap) {
    this.basemap = basemap
    this.isDark = ['dark', 'aerial'].includes(basemap)
    this.baseTileLayer.loadStyle(this[basemap + 'Url']).then(() => {
      handleBasemapChange(this)
    })
  }

  setPadding (coord, isAnimate) {
    if (this.view) {
      const { paddingBox } = this
      const padding = getFocusPadding(paddingBox, 1)
      this.view.padding = padding
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/geometry/Point.js').then(module => {
        if (coord) {
          this.isUserInitiated = false
          const Point = module.default
          this.view.goTo({
            target: new Point({
              x: coord[0],
              y: coord[1],
              spatialReference: 27700
            })
          }, {
            animation: isAnimate
          }).catch(err => console.log(err))
        }
      })
    }
  }

  setSize () {
    console.log('setSize')
  }

  fitBounds (bounds) {
    import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/geometry/Extent.js').then(module => {
      const Extent = module.default
      this.view.goTo(new Extent({
        xmin: bounds[0],
        ymin: bounds[1],
        xmax: bounds[2],
        ymax: bounds[3]
      })).catch(err => console.log(err))
    })
  }

  setCentre (coord, zoom) {
    this.view.goTo({ center: coord, zoom }).catch(err => console.log(err))
  }

  initDraw (options) {
    this.removeTargetMarker()
    import(/* webpackChunkName: "esri-sdk-draw" */ './draw.js').then(module => {
      const Draw = module.default
      this.draw = new Draw(this, options)
    })
  }

  setTargetMarker (coord, hasData, isVisible) {
    this.removeTargetMarker()
    import(/* webpackChunkName: 'esri-sdk' */ '@arcgis/core/Graphic.js').then(module => {
      const Graphic = module.default
      const { map, graphicsLayer, isDark } = this
      if (map && coord && isVisible) {
        // *** Bug with graphics layer order
        const zIndex = 99
        map.reorder(graphicsLayer, zIndex)
        const graphic = new Graphic(targetMarkerGraphic(coord, isDark, hasData))
        graphicsLayer.add(graphic)
        this.targetMarker = graphic
      }
    })
  }

  removeTargetMarker () {
    const { graphicsLayer, targetMarker } = this
    if (targetMarker) {
      graphicsLayer.remove(targetMarker)
      this.targetMarker = null
    }
  }

  selectFeature (_id) {
    // console.log('select', id)
  }

  async queryFeature (_id) {
    // console.log('queryFeature', id)
  }

  async queryPoint (point) {
    const detail = await getDetail(this, point)
    const place = await this.getNearest(detail.coord)
    this.dispatchEvent(new CustomEvent('mapquery', {
      detail: {
        resultType: detail.features.resultType,
        ...detail,
        place
      }
    }))
  }

  async getNearest (coord) {
    const isOs = this.reverseGeocode !== 'esri-world-geocoder'

    const { getNearest } = isOs
      ? await import(/* webpackChunkName: "esri-sdk" */ '../os-open-names/nearest.js')
      : await import(/* webpackChunkName: "esri-sdk" */ '../esri-world-geocoder/nearest.js')

    const response = await getNearest(coord, this.transformSearchRequest)

    return response
  }

  getGeoLocation (success, error) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      let coord = [position.coords.longitude, position.coords.latitude]
      coord = coord.map(n => parseFloat(n.toFixed(defaults.PRECISION)))
      const place = this.getNearest ? await this.getNearest(coord, 4326) : null
      success(coord, place)
    }, (err) => {
      console.log(err)
      error(err)
    }, {
      enableHighAccuracy: false
    })
  }

  showLocation (_coord) {
    // import(/* webpackChunkName: "maplibre-legacy", webpackExports: ["Marker"] */ 'maplibre-gl-legacy').then(module => {
    //     this.locationMarker = addLocationMarker(module.default.Marker, coord, this.map)
    // })
  }
}

export default Provider
