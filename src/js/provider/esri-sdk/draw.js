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
    this.provider = provider
    Object.assign(this, options)

    // Provider needs ref to draw moudule and draw need ref to provider
    provider.draw = this

    // Add existing feature
    if (feature) {
      const graphic = this.getGraphicFromFeature(feature, shape)
      this.oGraphic = graphic.clone()
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
    const { provider, oGraphic } = this
    const { graphicsLayer, paddingBox } = this.provider

    // Zoom to extent if we have an existing graphic
    if (oGraphic) {
      // Additional zoom fix to address goTo graphic not respecting true size?
      provider.view.goTo({ target: oGraphic, ...(mode === 'frame' && this.originalZoom && { zoom: this.originalZoom }) })
    }

    // Remove graphic if frame mode
    graphicsLayer.removeAll()

    // Draw existing feature
    if (mode === 'vertex') {
      const currentGraphic = oGraphic?.attributes?.id === shape ? oGraphic : null
      this.editGraphic(currentGraphic || this.getGraphicFromElement(paddingBox))
    }
  }

  destroy () {
    if (this.sketchViewModel) {
      this.sketchViewModel.cancel()
      this.sketchViewModel.layer = null
    }
  }

  reset () {
    const { graphicsLayer } = this.provider
    this.sketchViewModel?.cancel()
    graphicsLayer.removeAll()
  }

  delete () {
    const { graphicsLayer } = this.provider
    this.oGraphic = null
    graphicsLayer.removeAll()
  }

  cancel () {
    // Destroy sketchViewModel
    this.destroy()
    // Re-instate orginal graphic
    this.addGraphic(this.oGraphic)
  }

  finish (shape) {
    const { view, graphicsLayer, paddingBox } = this.provider
    const currentGraphic = graphicsLayer.graphics.items.length ? graphicsLayer.graphics.items[0] : null
    const elGraphic = this.getGraphicFromElement(paddingBox, shape)
    const graphic = this.finishEdit() || currentGraphic || elGraphic
    graphic.attributes.id = shape

    // Destroy sketchViewModel
    this.destroy()

    // Add graphic
    this.oGraphic = graphic.clone()
    this.originalZoom = view.zoom
    this.addGraphic(graphic)

    return this.getFeature(graphic)
  }

  reColour () {
    const { graphicsLayer } = this.provider
    const graphic = graphicsLayer.graphics.items[0]
    if (!graphic) {
      return
    }
    this.addGraphic(graphic)
  }

  editGraphic (graphic) {
    const { view, graphicsLayer } = this.provider

    const sketchViewModel = new SketchViewModel({
      view,
      layer: graphicsLayer,
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

    sketchViewModel.on(['update', 'delete'], this.handleUpdateDelete)

    // Fix SketchViewModel render bug
    setTimeout(() => {
      sketchViewModel.update(this.addGraphic(graphic))
    }, 100)
  }

  finishEdit () {
    const { provider, sketchViewModel } = this
    let graphic
    if (sketchViewModel) {
      sketchViewModel.complete()
      graphic = provider.graphicsLayer.graphics.items[0]
    }
    return graphic
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

  addGraphic (graphic) {
    const { map, graphicsLayer, isDark } = this.provider
    graphicsLayer.removeAll()
    let clone
    if (graphic) {
      const { sketchViewModel } = this
      clone = graphic.clone()
      clone.symbol.color = isDark ? defaults.POLYGON_QUERY_STROKE_DARK : defaults.POLYGON_QUERY_STROKE
      graphicsLayer.add(clone)
      if (sketchViewModel?.activeTool) {
        sketchViewModel.update(clone)
      }
      const zIndex = 99
      map.reorder(graphicsLayer, zIndex)
    }
    return clone
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
