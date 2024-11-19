import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel.js'
import Graphic from '@arcgis/core/Graphic'
import { defaults } from './constants'

const styles = ['defaultUrl', 'darkUrl', 'aerialUrl', 'deuteranopiaUrl', 'tritanopiaUrl']

export class Draw {
  constructor (provider, options) {
    const { view } = provider
    this.provider = provider
    Object.assign(this, options)

    // Reference to original styles
    styles.forEach(s => { this[s + 'Org'] = provider[s] })

    // Reference to original view constraints
    this.maxZoomO = view.constraints.maxZoom
    this.minZoomO = view.constraints.minZoom

    // Provider needs ref to draw moudule and draw need ref to provider
    provider.draw = this

    this.start('frame')
  }

  start (mode) {
    const isFrame = mode === 'frame'
    this.toggleConstraints(true, isFrame)

    // Remove graphic if frame mode
    if (isFrame) {
      const { graphicsLayer } = this.provider
      graphicsLayer.removeAll()
      return
    }

    // Edit graphic
    this.editGraphic(this.oGraphic)
  }

  toggleConstraints (hasConstraints, isFrame) {
    const { provider, maxZoom, minZoom, maxZoomO, minZoomO, oGraphic } = this
    const { view } = provider

    // Toggle min and max zoom
    view.constraints.maxZoom = hasConstraints ? maxZoom : maxZoomO
    view.constraints.minZoom = hasConstraints ? minZoom : minZoomO

    // Toggle basemaps
    styles.forEach(s => { provider[s] = hasConstraints ? (this[s] || provider[s]) : (this[s + 'Org'] || provider[s]) })
    if (this[provider.basemap + 'Url']) {
      provider.setBasemap(provider.basemap)
    }

    // Zoom to extent if we have an existing graphic
    if (hasConstraints && oGraphic) {
      // Additional zoom fix to address goTo graphic not respecting true size?
      view.goTo({ target: oGraphic, ...(isFrame && { zoom: this.oZoom }) })
    }
  }

  edit () {
    const { graphicsLayer, frame } = this.provider
    const hasExisting = graphicsLayer.graphics.length
    const elGraphic = this.getGraphicFromElement(frame)
    const graphic = hasExisting ? graphicsLayer.graphics.items[0] : elGraphic
    this.editGraphic(graphic)
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
    this.sketchViewModel?.cancel()
    // Re-instate orginal graphic
    this.addGraphic(this.oGraphic)
    this.toggleConstraints(false)
  }

  finish () {
    const { view, graphicsLayer, frame } = this.provider
    const currentGraphic = graphicsLayer.graphics.items.length ? graphicsLayer.graphics.items[0] : null
    const elGraphic = this.getGraphicFromElement(frame)
    const graphic = this.finishEdit() || currentGraphic || elGraphic
    this.sketchViewModel?.cancel()
    this.oGraphic = graphic.clone()
    this.oZoom = view.zoom
    this.addGraphic(graphic)
    this.toggleConstraints(false)
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

    sketchViewModel.on(['update', 'undo', 'redo'], this.handleUpdate)
    sketchViewModel.on('create-complete', this.handleCreateComplete)
    sketchViewModel.update(this.addGraphic(graphic))
  }

  finishEdit () {
    const { provider, sketchViewModel } = this
    let graphic
    if (sketchViewModel) {
      sketchViewModel.complete()
      sketchViewModel.layer = null
      graphic = provider.graphicsLayer.graphics.items[0]
    }
    return graphic
  }

  getBounds (el) {
    const { view } = this.provider
    const bRect = el.getBoundingClientRect()
    const vRect = el.closest('.fm-o-viewport').getBoundingClientRect()
    const left = bRect.left - vRect.left
    const top = bRect.top - vRect.top
    const nw = view.toMap({ x: left, y: top })
    const se = view.toMap({ x: left + bRect.width, y: top + bRect.height })
    return [nw.x, nw.y, se.x, se.y]
  }

  getGraphicFromElement (el) {
    const bounds = this.getBounds(el) // .map(c => Math.round(c))
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

  handleCreateComplete () {
    // console.log('handleCreateComplete')
  }

  handleUpdate (e) {
    if (e.toolEventInfo?.type.includes('move-start')) {
      this.cancel()
    }
  }
}

export default Draw
