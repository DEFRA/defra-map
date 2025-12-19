import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel.js'
import * as areaOperator from '@arcgis/core/geometry/operators/areaOperator.js'
import * as centroidOperator from '@arcgis/core/geometry/operators/centroidOperator.js'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js'
import Graphic from '@arcgis/core/Graphic'
import { defaults } from './constants'

export class Draw {
  constructor (provider, options) {
    const { drawMode, shape, feature } = options
    Object.assign(this, options)
    this.provider = provider

    // Provider needs ref to draw moudule and draw need ref to provider
    provider.draw = this

    // Empty layer hack to disable sketchViewModel
    const emptyLayer = new GraphicsLayer({ id: 'empty', visible: false })
    this.emptyLayer = emptyLayer

    // Create sketchViewModel instance
    const sketchViewModel = new SketchViewModel({
      view: provider.view,
      layer: emptyLayer,
      defaultUpdateOptions: {
        tool: 'reshape',
        updateOnGraphicClick: false,
        multipleSelectionEnabled: false,
        toggleToolOnClick: false,
        highlightOptions: {
          enabled: false
        }
      }
    })

    // Add update event handler
    sketchViewModel.on(['update', 'delete'], this.handleUpdateDelete)
    sketchViewModel.on(['create'], this.handleCreate.bind(this))
    this.sketchViewModel = sketchViewModel

    // Add existing feature
    if (feature) {
      this.oGraphic = this.createGraphic(shape, feature.geometry.coordinates)
    }

    // Add graphic
    if (feature && drawMode === 'default') {
      this.addGraphic(this.oGraphic)
    }
  }

  findGraphic (shape) {
    if (!this.provider?.graphicsLayer?.graphics?.items?.length) {
      return
    }
    return this.provider.graphicsLayer.graphics.items.find(g => g.attributes.id === shape)
  }

  add (drawMode, shape) {
    const { provider, sketchViewModel } = this
    const { graphicsLayer, isDark } = provider
    this.shape = shape
    this.drawMode = drawMode

    // Create new polygon
    if (drawMode === 'vertex') {
      sketchViewModel.layer = graphicsLayer

      // Another timeout hack
      setTimeout(() => sketchViewModel.create(shape, {
        drawMode: 'click',
        polygonSymbol: this.createPolygonSymbol(isDark)
      }), 100)
    }
  }

  edit (drawMode, shape) {
    const { provider, oGraphic, sketchViewModel, emptyLayer } = this
    const { view, graphicsLayer } = provider
    this.shape = shape
    this.drawMode = drawMode

    // Disable sketchViewModel
    sketchViewModel.cancel()
    sketchViewModel.layer = emptyLayer

    // Zoom to extent if we have an existing graphic
    if (oGraphic) {
      // Additional zoom fix to address goTo graphic not respecting true size?
      view.goTo({ target: oGraphic, ...(drawMode === 'frame' && this.originalZoom && { zoom: this.originalZoom }) })
    }

    // Remove graphic if frame drawMode
    if (drawMode === 'frame') {
      graphicsLayer.removeAll()
    }

    const graphic = this.findGraphic(shape)

    // Edit existing graphic
    if (drawMode === 'vertex' && graphic) {
      sketchViewModel.layer = graphicsLayer

      // Another timeout hack
      setTimeout(() => {
        const graphic = this.findGraphic(shape)
        sketchViewModel.update([graphic], {
          tool: 'reshape',
          enableRotation: false,
          enableScaling: false,
          preserveAspectRatio: false,
          toggleToolOnClick: false
        })
      }, 100)
    }
  }

  cancel () {
    const { sketchViewModel, emptyLayer, oGraphic } = this
    const { graphicsLayer } = this.provider

    // Remove any drawn graphics
    graphicsLayer.removeAll()

    // Reset sketch and disable tool
    sketchViewModel.cancel?.()
    sketchViewModel.layer = emptyLayer
    this.drawMode = null

    // Reinstate original
    if (this.oGraphic) {
      const revertGraphic = this.createGraphic(oGraphic.attributes.id, oGraphic.geometry.rings)
      this.addGraphic(revertGraphic)
    }
  }

  finish (shape) {
    const { sketchViewModel, emptyLayer } = this
    const { view, paddingBox } = this.provider

    // Draw graphic from padding box and shape
    if (['square', 'circle'].includes(shape)) {
      const elGraphic = this.getGraphicFromElement(paddingBox, shape)
      this.addGraphic(elGraphic)
    }

    // Complete sketch and destroy sketchViewModel
    sketchViewModel.complete?.()
    sketchViewModel.layer = emptyLayer
    this.drawMode = null

    // Replace original graphic with new sketch
    const graphic = this.findGraphic(shape)

    this.oGraphic = graphic.clone()
    this.originalZoom = view.zoom

    return this.getFeature(graphic)
  }

  delete () {
    const { graphicsLayer } = this.provider
    this.oGraphic = null
    graphicsLayer.removeAll()
  }

  reColour () {
    const { graphicsLayer } = this.provider
    const graphic = this.findGraphic(this.shape)
    if (!graphic) {
      return
    }
    const newGraphic = this.createGraphic(graphic.attributes.id, graphic.geometry.rings)
    graphicsLayer.remove(graphic)
    this.addGraphic(newGraphic)
  }

  addGraphic (graphic) {
    const { map, graphicsLayer } = this.provider
    graphicsLayer.add(graphic)
    const zIndex = 99
    map.reorder(graphicsLayer, zIndex)
  }

  getBounds (el) {
    const { view } = this.provider
    const eRect = el.getBoundingClientRect()
    const vRect = el.closest('.fm-o-viewport').getBoundingClientRect()
    const left = eRect.left - vRect.left
    const top = eRect.top - vRect.top
    const nw = view.toMap({ x: left, y: top })
    const se = view.toMap({ x: left + eRect.width, y: top + eRect.height })
    return [nw.x, nw.y, se.x, se.y]
  }

  getDimensions () {
    const { shape, drawMode } = this
    const { paddingBox } = this.provider
    const currentGraphic = this.findGraphic(shape)
    const graphic = currentGraphic || (drawMode === 'frame' && this.getGraphicFromElement(paddingBox, shape))
    const geometry = graphic.geometry
    const dimensions = {}
    if (geometry?.type === 'polygon') {
      const center = centroidOperator.execute(geometry)
      const area = areaOperator.execute(geometry)
      const width = geometry.extent.width
      const radius = width / 2
      dimensions.center = [center.x, center.y]
      dimensions.area = area
      dimensions.width = width
      dimensions.radius = radius
      dimensions.geometry = geometry
    }
    return dimensions
  }

  getGraphicFromElement (el, shape) {
    const bounds = this.getBounds(el)
    const rings = [[[bounds[0], bounds[1]], [bounds[2], bounds[1]], [bounds[2], bounds[3]], [bounds[0], bounds[3]], [bounds[0], bounds[1]]]]
    return this.createGraphic(shape, rings)
  }

  createGraphic (id, coordinates) {
    const { isDark } = this.provider
    return new Graphic({
      geometry: {
        type: 'polygon',
        rings: coordinates,
        spatialReference: 27700
      },
      symbol: this.createPolygonSymbol(isDark),
      attributes: {
        id
      }
    })
  }

  createPolygonSymbol (isDark) {
    const stroke = isDark ? defaults.POLYGON_QUERY_STROKE_DARK : defaults.POLYGON_QUERY_STROKE
    return {
      type: 'simple-fill',
      color: undefined,
      outline: {
        color: stroke,
        width: '2px',
        cap: 'square'
      }
    }
  }

  getFeature (graphic) {
    return {
      type: 'feature',
      geometry: {
        type: 'polygon',
        coordinates: graphic.geometry.rings
      }
    }
  }

  handleCreate (e) {
    const graphic = e.graphic
    if (e.state === 'complete') {
      const area = areaOperator.execute(graphic.geometry)

      // Prevent zero area or self intersecting geometries
      if (area <= 0 || graphic?.geometry.isSelfIntersecting || graphic?.geometry.rings.length > 1) {
        this.sketchViewModel.layer.remove(graphic)
        this.sketchViewModel.create('polygon')
        return
      }

      graphic.attributes = {
        id: this.shape
      }
      graphic.symbol = this.createPolygonSymbol(this.provider.isDark)

      // Dispatch dimensions update
    }
  }

  handleUpdateDelete (e) {
    const toolInfoType = e.toolEventInfo?.type
    const graphic = e.graphics[0]

    // Area events
    if (['reshape-stop', 'vertex-remove'].includes(toolInfoType)) {
      const area = areaOperator.execute(graphic.geometry)

      // Undo if polygon has a zero area
      if (area <= 0) {
        this.undo()
        return
      }

      // Dispatch dimensions update
    }

    // Undo draw if attempted self-intersect
    if (toolInfoType === 'reshape' && graphic?.geometry.isSelfIntersecting) {
      this.undo()
    }

    // Cancel draw if attempted polygon move
    if (toolInfoType === 'move-start') {
      this.cancel()
    }
  }
}

export default Draw
