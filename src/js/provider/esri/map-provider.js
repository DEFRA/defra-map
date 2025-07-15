import { handleBaseTileLayerLoaded, handleStyleChange, handleMoveStart, handleMove, handleStationary } from './events.js'
import { getDetail } from './query.js'
import { debounce } from '../../lib/debounce.js'
import { throttle } from '../../lib/throttle.js'
import { getFocusPadding } from '../../lib/viewport.js'
import { defaults } from './constants.js'
import { targetMarkerGraphic } from './marker.js'
import { defaults as storeDefaults } from '../../store/constants.js'

class MapProvider extends EventTarget {
  constructor ({ capabilities, setupEsriConfig }) {
    super()
    this.srid = 27700
    this.capabilities = capabilities
    this.setupEsriConfig = setupEsriConfig
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
    const { container, paddingBox, bounds, maxExtent, center, zoom, minZoom, maxZoom, style, locationLayers, callBack } = options
    const [esriConfig, EsriMap, MapView, Extent, Point, VectorTileLayer, FeatureLayer, GraphicsLayer, TileInfo] = modules.slice(0, 9).map(m => m.default)
    const { watch: reactiveWatch, when: reactiveWhen } = modules[9]

    // Implementation has full control over esriConfig
    if (this.setupEsriConfig) {
      await this.setupEsriConfig(esriConfig)
    }

    // Define layers
    const baseTileLayer = new VectorTileLayer({ id: 'baselayer', url: style.url, visible: true })
    const graphicsLayer = new GraphicsLayer({ id: 'graphicslayer' })
    const map = new EsriMap({ layers: [baseTileLayer, graphicsLayer] })
    const geometry = maxExtent ? this.getExtent(Extent, maxExtent) : null

    // Filter all keys so only valid arguments can be passed to MapView
    const filteredOptions = Object.fromEntries(Object.entries(options).filter(([key]) => !['height', 'size'].includes(key)))

    // Create MapView
    const view = new MapView({
      ...filteredOptions,
      spatialReference: 27700,
      container,
      map,
      zoom,
      center: this.getPoint(Point, center),
      extent: this.getExtent(Extent, bounds),
      maxExtent: maxExtent || storeDefaults.MAX_BOUNDS_27700,
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
    this.locationLayers = locationLayers
    this.paddingBox = paddingBox
    this.style = style
    this.isDark = ['dark', 'aerial'].includes(style.name)
    this.esriConfig = esriConfig
    this.modules = { Map, MapView, Extent, Point, VectorTileLayer, GraphicsLayer, FeatureLayer }
    this.framework = { map, view, esriConfig }
    this.isStationary = !!options.isStationary // Alow for mocking

    // Map ready event (first load)
    reactiveWatch(() => baseTileLayer.loaded && view.resolution > 0, () => {
      handleBaseTileLayerLoaded.call(this)
    })

    // Throttle move 100ms
    const throttleMove = throttle(() => {
      handleMove.bind(this)()
    }, defaults.THROTTLE)

    // Movestart / Move
    let isMove = false
    reactiveWhen(() => view.ready, () => {
      reactiveWatch(() => [view.zoom, view.center.x, view.center.y], ([newZoom, newX, newY], [oldZoom, oldX, oldY]) => {
        const zoomChanged = newZoom !== oldZoom
        const centerChanged = newX !== oldX || newY !== oldY
        if (!(zoomChanged || centerChanged)) {
          return
        }
        if (!isMove) {
          handleMoveStart.bind(this)()
          isMove = true
        }
        throttleMove()
      })
    })

    // Debounce update 500ms
    const debounceStationary = debounce(() => {
      handleStationary.bind(this)()
    }, defaults.DELAY)

    reactiveWatch(() => [view.stationary, view.updating], ([stationary]) => {
      if (this.isStationary && stationary) {
        debounceStationary()
      }
      // Address event firing twice on page load
      if (stationary) {
        isMove = false
        this.isStationary = true
      }
    })

    // Detect user initiated map movement
    view.on('drag', e => {
      if (e.action === 'start') {
        this.isUserInitiated = true
      }
    })
    view.on('mouse-wheel', () => { this.isUserInitiated = true })

    // Implementation callback after initialisation
    if (callBack) {
      callBack(this)
    }
  }

  getPoint (Point, coords) {
    return coords
      ? new Point({
        x: coords[0],
        y: coords[1],
        spatialReference: { wkid: 27700 }
      })
      : null
  }

  getExtent (Extent, coords) {
    return coords
      ? new Extent({
        xmin: coords[0],
        ymin: coords[1],
        xmax: coords[2],
        ymax: coords[3],
        spatialReference: { wkid: 27700 }
      })
      : null
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
    this.view.goTo({ center: newCentre, duration: defaults.DELAY }).catch(err => console.log(err))
  }

  panTo (coord) {
    this.view.goTo({ target: { x: coord[0], y: coord[1] }, duration: defaults.DELAY }).catch(err => console.log(err))
  }

  zoomIn () {
    this.view.animation?.destroy()
    this.isUserInitiated = true
    this.view.goTo({ zoom: this.view.zoom + 1, duration: defaults.DELAY }).catch(err => console.log(err))
  }

  zoomOut () {
    this.view.animation?.destroy()
    this.isUserInitiated = true
    this.view.goTo({ zoom: this.view.zoom - 1, duration: defaults.DELAY }).catch(err => console.log(err))
  }

  setStyle (style, minZoom, maxZoom) {
    const { view } = this
    view.constraints.maxZoom = maxZoom
    view.constraints.minZoom = minZoom
    const currentStyle = this.style
    this.style = style
    this.isDark = ['dark', 'aerial'].includes(style.name)
    this.baseTileLayer.loadStyle(style.url).then(() => {
      handleStyleChange.bind(this)(currentStyle, style)
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
      }), { duration: defaults.DELAY }).catch(err => console.log(err))
    })
  }

  setCentre (coord, zoom) {
    this.view.goTo({ center: coord, zoom, duration: defaults.DELAY }).catch(err => console.log(err))
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
        const fill = new Graphic(targetMarkerGraphic(coord, isDark, hasData))
        const halo = new Graphic(targetMarkerGraphic(coord, isDark, hasData))
        halo.symbol.outline.width = 2
        graphicsLayer.addMany([halo, fill])
        this.targetMarker = [halo, fill]
      }
    })
  }

  removeTargetMarker () {
    const { graphicsLayer, targetMarker } = this
    if (targetMarker) {
      graphicsLayer.remove(targetMarker[0])
      graphicsLayer.remove(targetMarker[1])
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
    const detail = await getDetail.bind(this)(point)
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
      success(coord, null)
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

export default MapProvider
