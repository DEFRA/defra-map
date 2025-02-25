import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel.js'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js'
import Graphic from '@arcgis/core/Graphic'
import { defaults } from './constants'

export class Draw {
  constructor (provider, options) {
    this.provider = provider
    Object.assign(this, options)

    // Provider needs ref to draw moudule and draw need ref to provider
    provider.draw = this

    // Add existing feature
    if (options.feature) {
      this.create(options.feature)
      return
    }

    // Start new
    this.start('frame')
  }

  start (mode) {
    const { provider, oGraphic } = this
    const isFrame = mode === 'frame'

    // Zoom to extent if we have an existing graphic
    if (oGraphic) {
      // Additional zoom fix to address goTo graphic not respecting true size?
      provider.view.goTo({ target: oGraphic, ...(isFrame && this.originalZoom && { zoom: this.originalZoom }) })
    }

    // Remove graphic if frame mode
    if (isFrame) {
      const { graphicsLayer } = this.provider
      graphicsLayer.removeAll()
      return
    }

    // Edit graphic
    this.editGraphic(this.oGraphic)
  }

  edit () {
    const { graphicsLayer, paddingBox } = this.provider
    const hasExisting = graphicsLayer.graphics.length
    const elGraphic = this.getGraphicFromElement(paddingBox)
    const graphic = hasExisting ? graphicsLayer.graphics.items[0] : elGraphic
    this.editGraphic(graphic)
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

  create (feature) {
    const graphic = this.getGraphicFromFeature(feature)
    this.oGraphic = graphic.clone()
    this.addGraphic(graphic)
  }

  finish () {
    const { view, graphicsLayer, paddingBox } = this.provider
    const currentGraphic = graphicsLayer.graphics.items.length ? graphicsLayer.graphics.items[0] : null
    const elGraphic = this.getGraphicFromElement(paddingBox)
    const graphic = this.finishEdit() || currentGraphic || elGraphic
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

  getGraphicFromElement (el) {
    const bounds = this.getBounds(el)
    const coords = [[
      [bounds[0], bounds[1]],
      [bounds[2], bounds[1]],
      [bounds[2], bounds[3]],
      [bounds[0], bounds[3]],
      [bounds[0], bounds[1]]
    ]]

    const graphic = new Graphic({
      geometry: {
        type: 'polygon',
        rings: coords,
        spatialReference: 27700
      },
      symbol: {
        type: 'simple-line',
        color: defaults.POLYGON_QUERY_STROKE,
        width: '2px',
        cap: 'square'
      }
    })

    return graphic
  }

  getGraphicFromFeature = (feature) => {
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
