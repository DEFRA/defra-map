import { handleBaseTileLayerLoaded, handleBasemapChange, handleMoveStart, handleStationary } from './events'
import { getDetail } from './query'
import { debounce } from '../../lib/debounce'
import { getFocusPadding } from '../../lib/viewport.js'
import { defaults } from './constants'
import { targetMarkerGraphic } from './marker'
import src from './src.json'
import config from './config.json'

class Provider extends EventTarget {
  constructor ({ osTokenCallback, esriTokenCallback, defaultUrl, darkUrl, aerialUrl, reverseGeocode }) {
    super()
    this.srs = 27700
    this.osTokenCallback = osTokenCallback
    this.esriTokenCallback = esriTokenCallback
    this.defaultUrl = defaultUrl
    this.darkUrl = darkUrl
    this.aerialUrl = aerialUrl
    this.basemaps = ['default', 'dark', 'aerial'].filter(b => this[b + 'Url'])
    this.stylesImagePath = src.STYLES
    this.reverseGeocode = reverseGeocode
    this.isUserInitiated = false
    this.attribution = {
      label: 'Ordnance Survey logo'
    }
  }

  init (options) {
    if (window.globalThis) {
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
      ]).then(modules => this.addMap({ modules, ...options }))
    }
  }

  remove () {
    // console.log('Remove and tidy up')
  }

  async addInterceptors (params) {
    const token = (await this.osTokenCallback()).token
    params.requestOptions.headers = {
      Authorization: 'Bearer ' + token
    }
  }

  async addMap ({ modules, target, paddingBox, frame, bbox, centre, zoom, minZoom, maxZoom, basemap, pixelLayers }) {
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
    esriConfig.apiKey = (await this.esriTokenCallback()).token
    esriConfig.request.interceptors.push({ urls: config.OS_SERVICE_URL, before: async params => this.addInterceptors(params) })
    basemap = basemap === 'dark' && !this.basemaps.includes('dark') ? 'dark' : basemap
    const baseTileLayer = new VectorTileLayer({ url: basemap === 'aerial' ? this.defaultUrl : this[basemap + 'Url'], visible: true })
    const graphicsLayer = new GraphicsLayer()
    const map = new EsriMap({ layers: [baseTileLayer, graphicsLayer] })
    const extent = bbox ? new Extent({ xmin: bbox[0], ymin: bbox[1], xmax: bbox[2], ymax: bbox[3] }) : null
    const view = new MapView({
      spatialReference: 27700,
      container: target,
      map,
      zoom: zoom || null,
      center: centre ? new Point({ x: centre[0], y: centre[1], spatialReference: 27700 }) : null,
      extent,
      constraints: { snapToZoom: false, minZoom, maxZoom, maxScale: 0, lods: TileInfo.create({ spatialReference: { wkid: 27700 } }).lods, rotationEnabled: false },
      ui: { components: [] },
      padding: getFocusPadding(paddingBox, 1)
    })

    // Tidy up canvas
    const canvasContainer = target.querySelector('.esri-view-surface')
    canvasContainer.removeAttribute('role')
    canvasContainer.tabIndex = -1

    this.map = map
    this.view = view
    this.baseTileLayer = baseTileLayer
    this.graphicsLayer = graphicsLayer
    this.pixelLayers = pixelLayers
    this.paddingBox = paddingBox
    this.frame = frame
    this.basemap = basemap
    this.isDark = ['dark', 'aerial'].includes(basemap)
    this.modules = { Map, MapView, Extent, Point, VectorTileLayer, GraphicsLayer, FeatureLayer }

    // Map ready event (first load)
    baseTileLayer.watch('loaded', () => handleBaseTileLayerLoaded(this))

    // Movestart
    reactiveWatch(() => [view.stationary], ([stationary]) => {
      if (!stationary) {
        handleMoveStart(this)
      }
    })

    // All changes. Must debounce, min 300ms
    const debounceStationary = debounce(() => {
      handleStationary(this)
    }, defaults.DELAY)

    reactiveWatch(() => [view.stationary, view.updating], ([stationary, updating]) => {
      if (updating || !stationary) {
        return
      }
      debounceStationary()
    })

    // Detect user initiated map movement
    view.on('drag', e => {
      if (e.action === 'start') {
        this.isUserInitiated = true
      }
    })
    view.on('mouse-wheel', () => { this.isUserInitiated = true })
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
    basemap = basemap === 'dark' && !this.basemaps.includes('dark') ? 'default' : basemap
    this.basemap = basemap
    this.isDark = ['dark', 'aerial'].includes(basemap)
    this.baseTileLayer.loadStyle(this[basemap + 'Url']).then(() => {
      handleBasemapChange(this)
    })
  }

  setPadding (coord, isAnimate) {
    if (!this.view) {
      return
    }
    const { paddingBox } = this
    const padding = getFocusPadding(paddingBox, 1)
    this.view.padding = padding
    if (!coord) {
      return
    }

    import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/geometry/Point.js').then(module => {
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
    })
  }

  setSize () {
    console.log('setSize')
  }

  fitBbox (bbox) {
    import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/geometry/Extent.js').then(module => {
      const Extent = module.default
      this.view.goTo(new Extent({
        xmin: bbox[0],
        ymin: bbox[1],
        xmax: bbox[2],
        ymax: bbox[3]
      })).catch(err => console.log(err))
    })
  }

  setCentre (coord, zoom) {
    this.view.goTo({ center: coord, zoom }).catch(err => console.log(err))
  }

  initDraw (options, report) {
    this.removeTargetMarker()
    import(/* webpackChunkName: "esri-sdk-draw" */ './draw.js').then(module => {
      const Draw = module.default
      this.draw = new Draw(this, options, report)
    })
  }

  setTargetMarker (coord, hasData, isVisible) {
    this.removeTargetMarker()
    import(/* webpackChunkName: 'esri-sdk' */ '@arcgis/core/Graphic.js').then(module => {
      const Graphic = module.default
      const { map, graphicsLayer, isDark } = this
      if (!(map && coord && isVisible)) {
        return
      }
      // *** Bug with graphics layer order
      const zIndex = 99
      map.reorder(graphicsLayer, zIndex)
      const graphic = new Graphic(targetMarkerGraphic(coord, isDark, hasData))
      graphicsLayer.add(graphic)
      this.targetMarker = graphic
    })
  }

  removeTargetMarker () {
    const { graphicsLayer, targetMarker } = this
    if (!targetMarker) {
      return
    }
    graphicsLayer.remove(targetMarker)
    this.targetMarker = null
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
    const tokenCallback = isOs ? this.osTokenCallback : this.esriTokenCallback

    const { getNearest } = isOs
      ? await import(/* webpackChunkName: "esri-sdk" */ '../os-open-names/nearest.js')
      : await import(/* webpackChunkName: "esri-sdk" */ '../esri-world-geocoder/nearest.js')

    const response = await getNearest(coord, tokenCallback)

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

  showLocation (coord) {
    console.log('showLocation', coord)
    // import(/* webpackChunkName: "maplibre-legacy", webpackExports: ["Marker"] */ 'maplibre-gl-legacy').then(module => {
    //     this.locationMarker = addLocationMarker(module.default.Marker, coord, this.map)
    // })
  }
}

export default Provider
