import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel.js'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js'
import Circle from '@arcgis/core/geometry/Circle.js'
import Point from '@arcgis/core/geometry/Point.js'
import Graphic from '@arcgis/core/Graphic'
import { getDistance } from '../../lib/viewport'
import { defaults } from './constants'

export class Draw {
  constructor (provider, options) {
    const { mode, shape, feature } = options
    Object.assign(this, options)
    this.provider = provider
    this.shape = shape

    // Provider needs ref to draw moudule and draw need ref to provider
    provider.draw = this

    // Create sketchViewModel instance
    const sketchViewModel = new SketchViewModel({
      view: provider.view,
      layer: provider.graphicsLayer,
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

    this.sketchViewModel = sketchViewModel

    // Add update event handler
    sketchViewModel.on(['update', 'delete'], this.handleUpdateDelete)
    sketchViewModel.on(['create'], this.handleCreate.bind(this))

    // Add existing feature
    if (feature) {
      this.oGraphic = this.getGraphicFromFeature(feature, shape)
    }

    // Add graphic
    if (feature && mode === 'default') {
      this.addGraphic(this.oGraphic)
      return
    }

    // Start new
    this.edit(mode, shape)
  }

  edit (mode, shape) {
    const { provider, oGraphic, sketchViewModel } = this
    const { view, graphicsLayer } = provider
    this.shape = shape

    // Zoom to extent if we have an existing graphic
    if (oGraphic) {
      // Additional zoom fix to address goTo graphic not respecting true size?
      view.goTo({ target: oGraphic, ...(mode === 'frame' && this.originalZoom && { zoom: this.originalZoom }) })
    }

    // Remove graphic if frame mode
    if (mode === 'frame') {
      graphicsLayer.removeAll()
    }

    // reColour happens first so need a small timeout
    const graphic = graphicsLayer.graphics.items.find(g => g.attributes.id === shape)

    // Edit existing feature
    if (mode === 'vertex' && graphic) {
      sketchViewModel.update(graphic)
    }

    // Create new polygon
    if (mode === 'vertex' && !graphic) {
      sketchViewModel.create(shape)
    }
  }

  editPolygon () {
    this.addGraphic(null, 'polygon')
    this.edit('vertex', 'polygon')
  }

  cancel () {
    const { sketchViewModel } = this
    const { graphicsLayer } = this.provider

    // Remove any drawn graphics
    graphicsLayer.removeAll()

    // Reset sketch and disable tool
    sketchViewModel.reset?.()
    sketchViewModel?.create('none')

    // Reinstate original
    if (this.oGraphic) {
      this.addGraphic(this.oGraphic)
    }
  }

  finish (shape) {
    const { sketchViewModel } = this
    const { view, graphicsLayer, paddingBox } = this.provider

    // Draw graphic from padding box and shape
    if (['square', 'circle'].includes(shape)) {
      const elGraphic = this.getGraphicFromElement(paddingBox, shape)
      this.addGraphic(elGraphic)
    }

    // Complete sketch and disable tool
    sketchViewModel.complete?.()
    sketchViewModel.create('none')

    const graphic = graphicsLayer.graphics.items[0]

    // Add graphic
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
    const graphic = graphicsLayer.graphics.items.find(g => g.attributes.id === this.shape)
    if (!graphic) {
      return
    }
    const clone = graphic.clone()
    graphicsLayer.remove(graphic)
    this.addGraphic(clone)
  }

  addGraphic (graphic, shape) {
    const { map, graphicsLayer, paddingBox, isDark } = this.provider
    const clone = graphic ? graphic.clone() : this.getGraphicFromElement(paddingBox, shape)
    clone.symbol.color = isDark ? defaults.POLYGON_QUERY_STROKE_DARK : defaults.POLYGON_QUERY_STROKE
    graphicsLayer.add(clone)
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

  getGraphicFromElement (el, shape) {
    const { view } = this.provider

    const bounds = this.getBounds(el)
    let rings

    if (shape === 'circle') {
      // Circle
      const { x, y } = view.center
      const center = new Point({ x, y, spatialReference: { wkid: 27700 } })
      const radius = getDistance([bounds[0], bounds[1]], [bounds[2], bounds[1]]) / 2
      const circle = new Circle({ center, geodesic: false, numberOfPoints: 64, radius, radiusUnit: 'meters' })
      const roundedCoords = circle.rings[0].map(([e, n]) => [+(e.toFixed(1)), +(n.toFixed(1))])
      rings = [roundedCoords]
    } else {
      // Polygon
      rings = [[[bounds[0], bounds[1]], [bounds[2], bounds[1]], [bounds[2], bounds[3]], [bounds[0], bounds[3]], [bounds[0], bounds[1]]]]
    }

    const graphic = new Graphic({
      geometry: {
        type: 'polygon',
        spatialReference: 27700,
        rings
      },
      symbol: {
        type: 'simple-line',
        color: defaults.POLYGON_QUERY_STROKE,
        width: '2px',
        cap: 'square'
      },
      attributes: {
        id: shape
      }
    })

    return graphic
  }

  getGraphicFromFeature (feature, shape) {
    return new Graphic({
      geometry: {
        type: 'polygon',
        rings: feature.geometry.coordinates,
        spatialReference: 27700
      },
      symbol: {
        type: 'simple-line',
        color: defaults.POLYGON_QUERY_STROKE,
        width: '2px',
        cap: 'square'
      },
      attributes: {
        id: shape
      }
    })
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
    if (e.state === 'complete') {
      e.graphic.attributes = {
        id: this.shape
      }
    }
  }

  handleUpdateDelete (e) {
    const toolInfoType = e.toolEventInfo?.type
    const graphic = e.graphics[0]

    // Undo draw if polygon has a zero area
    if (['reshape-stop', 'vertex-remove'].includes(toolInfoType)) {
      const area = geometryEngine.planarArea(graphic.geometry, 'square-meters')
      if (area <= 0) {
        this.undo()
      }
    }

    // Undo draw if attemtped self-intersect
    if (toolInfoType === 'reshape' && graphic?.geometry.isSelfIntersecting) {
      this.undo()
    }

    // Canel draw if attempted polygon move
    if (toolInfoType === 'move-start') {
      this.cancel()
    }
  }
}

export default Draw
