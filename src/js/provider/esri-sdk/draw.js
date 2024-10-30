import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel.js'
import Graphic from '@arcgis/core/Graphic'
import { defaults } from './constants'

const styles = ['defaultUrl', 'darkUrl', 'aerialUrl', 'deuteranopiaUrl', 'tritanopiaUrl']

export class Draw {
  constructor (provider, options, query) {
    const { view } = provider
    this.provider = provider
    this.query = query
    this.isFrame = true
    Object.assign(this, options)

    // Reference to original styles
    styles.forEach(s => { this[s + 'Org'] = provider[s] })

    // Reference to original view constraints
    this.maxZoomO = view.constraints.maxZoom
    this.minZoomO = view.constraints.minZoom

    // Provider needs ref to draw moudule and draw need ref to provider
    provider.draw = this

    this.start()
  }

  start () {
    console.log('start', this.isFrame)
    // Emit event to update component state

    this.toggleConstraints(this.isFrame)
  }

  toggleConstraints (isReCenter) {
    const { provider, maxZoom, minZoom, maxZoomO, minZoomO, oCenter, oZoom } = this
    const { view } = provider

    // Re-instate view constraints and basemap
    view.constraints.maxZoom = isReCenter ? maxZoom : maxZoomO
    view.constraints.minZoom = isReCenter ? minZoom : minZoomO
    styles.forEach(s => { provider[s] = isReCenter ? (this[s] || provider[s]) : (this[s + 'Org'] || provider[s]) })

    // Reset centre an zoom on entering query mode
    if (isReCenter && oCenter && oZoom) {
      import(/* webpackChunkName: "esri-sdk" */ '@arcgis/core/geometry/Point.js').then(module => {
        const Point = module.default
        view.goTo({
          target: new Point({
            x: oCenter.x,
            y: oCenter.y,
            spatialReference: 27700
          }),
          zoom: oZoom
        })
      })
    }

    if (!this[provider.basemap + 'Url']) return
    provider.setBasemap(provider.basemap)
  }

  isSameGraphic (a, b) {
    return a.geometry.rings.flat(5).toString() === b.geometry.rings.flat(5).toString()
  }

  edit () {
    const { graphicsLayer, frame } = this.provider
    const hasExisting = graphicsLayer.graphics.length
    const bGraphic = this.getGraphicFromElement(frame)
    const graphic = hasExisting ? graphicsLayer.graphics.items[0] : bGraphic
    this.editGraphic(graphic)
  }

  reset () {
    const { graphicsLayer } = this.provider
    this.sketchViewModel?.cancel()
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
    const fGraphic = this.getGraphicFromElement(frame)
    const graphic = this.finishEdit() || currentGraphic || fGraphic

    // Is same as frame
    this.fGraphic = this.fGraphic || fGraphic
    this.isFrame = this.isSameGraphic(graphic, this.fGraphic)
    console.log('finish', !!this.fGraphic)

    // Store centre and zoom first time a shape created
    this.oCenter = this.oCenter || view.center
    this.oZoom = this.oZoom || view.zoom

    this.sketchViewModel?.cancel()
    this.oGraphic = graphic.clone()
    this.addGraphic(graphic)
    this.toggleConstraints(false)
    const feature = this.getFeature(graphic)
    return feature
  }

  query () {

  }

  reColour () {
    const { graphicsLayer } = this.provider
    const graphic = graphicsLayer.graphics.items[0]
    if (!graphic) return
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
    if (!sketchViewModel) return

    sketchViewModel.complete()
    sketchViewModel.layer = null
    const graphic = provider.graphicsLayer.graphics.items[0]

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
    const bounds = this.getBounds(el).map(c => Math.round(c))
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

    if (!graphic) return
    const { sketchViewModel } = this
    const clone = graphic.clone()
    clone.symbol.color = isDark ? defaults.POLYGON_QUERY_STROKE_DARK : defaults.POLYGON_QUERY_STROKE
    graphicsLayer.add(clone)
    if (sketchViewModel?.activeTool) {
      sketchViewModel.update(clone)
    }
    map.reorder(graphicsLayer, 99)
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

  handleCreateComplete (e) {
    console.log('handleCreateComplete')
  }

  handleUpdate (e) {
    if (e.toolEventInfo?.type.includes('move-start')) {
      this.cancel()
    }
  }
}

export default Draw
