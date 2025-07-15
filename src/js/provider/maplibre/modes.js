import booleanValid from '@turf/boolean-valid'
import area from '@turf/area'
import { polygon } from '@turf/helpers'
import DirectSelect from '../../../../node_modules/@mapbox/mapbox-gl-draw/src/modes/direct_select'
import DrawPolygon from '../../../../node_modules/@mapbox/mapbox-gl-draw/src/modes/draw_polygon'
import createVertex from '../../../../node_modules/@mapbox/mapbox-gl-draw/src/lib/create_vertex'

const markerSVG = `
  <svg width='38' height='38' viewBox='0 0 38 38' fill-rule='evenodd' fill='currentColor' style='display:none;position:absolute;top:50%;left:50%;margin:-19px 0 0 -19px' class='vertex-target' data-vertex-target>
    <path d='M5.035 20H1v-2h4.035C5.525 11.069 11.069 5.525 18 5.035V1h2v4.035c6.931.49 12.475 6.034 12.965 12.965H37v2h-4.035c-.49 6.931-6.034 12.475-12.965 12.965V37h-2v-4.035C11.069 32.475 5.525 26.931 5.035 20zM19 7A12.01 12.01 0 0 0 7 19a12.01 12.01 0 0 0 12 12 12.01 12.01 0 0 0 12-12A12.01 12.01 0 0 0 19 7z'/>
    <circle cx='19' cy='19' r='2'/>
  </svg>
`

const touchVertexTarget = `
  <svg width='44' height='44' viewBox='0 0 44 44' fill-rule='evenodd' fill='currentColor' style='display:none;position:absolute;top:50%;left:50%;margin:20px 0 0 -22px' class='touch-vertex-target' data-touch-vertex-target>
    <circle cx='22' cy='22' r='22' fill='currentColor'/>
    <g fill='none' stroke='#fff' stroke-width='2'>
      <path d='M31.5,19.456l2.5,2.501l-2.5,2.5'/>
      <line x1='22' y1='10' x2='22' y2='16' />
      <path d='M12.5,24.457l-2.5,-2.5l2.5,-2.501'/>
      <line x1='10' y1='22' x2='16' y2='22' />
      <path d='M24.5,31.5l-2.5,2.5l-2.5,-2.5'/>
      <line x1='28' y1='22' x2='34' y2='22' />
      <path d='M19.5,12.5l2.5,-2.5l2.5,2.5'/>
      <line x1='22' y1='28' x2='22' y2='34' />
    </g>
    <circle cx='22' cy='22' r='1.5' fill='#fff' stroke="#fff" stroke-width='2'/>
  </svg>
`

const NUDGE = 1
const STEP = 5
const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

const haversine = ([lon1, lat1], [lon2, lat2]) => {
  const toRad = deg => deg * Math.PI / 180
  const R = 6371000 // meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const isNewCoordinate = (coords, tolerance = 0.01) => {
  // First coord
  if (coords[0].length <= 1) {
    return true
  }
  // Subsequent coordsmust be different
  if (coords[0].length <= 3) {
    for (let i = 0; i < coords[0].length; i++) {
      for (let j = i + 1; j < coords[0].length; j++) {
        if (haversine(coords[0][i], coords[0][j]) < tolerance) {
          return false
        }
      }
    }
  }
  return true
}

const isValidClick = (coords) => {
  // Less than 4 and new coordinates
  if (coords[0].length <= 1 || isNewCoordinate(coords)) {
    return true
  }

  // Basic checks
  if (!Array.isArray(coords) || coords.length < 4) {
    return false
  }

  // Check if ring is closed
  const first = coords[0]
  const last = coords[coords.length - 1]
  const isClosed = first[0] === last[0] && first[1] === last[1]
  if (!isClosed) {
    return false
  }

  // Create a turf polygon
  const turfPoly = polygon([coords])

  // Check if geometry is valid (non-self-intersecting)
  const valid = booleanValid(turfPoly)
  if (!valid) {
    return false
  }

  // Check if area is positive
  const polyArea = area(turfPoly)
  if (polyArea <= 0) {
    return false
  }

  return true
}

const spatialNavigate = (start, pixels, direction) => {
  const quadrant = pixels.filter((p, i) => {
    const offsetX = Math.abs(p[0] - start[0])
    const offsetY = Math.abs(p[1] - start[1])
    let isQuadrant = false
    if (direction === 'ArrowUp') {
      isQuadrant = p[1] <= start[1] && offsetY >= offsetX
    } else if (direction === 'ArrowDown') {
      isQuadrant = p[1] > start[1] && offsetY >= offsetX
    } else if (direction === 'ArrowLeft') {
      isQuadrant = p[0] <= start[0] && offsetY < offsetX
    } else if (direction === 'ArrowRight') {
      isQuadrant = p[0] > start[0] && offsetY < offsetX
    } else {
      isQuadrant = true
    }
    return isQuadrant && (JSON.stringify(p) !== JSON.stringify(start))
  })

  if (!quadrant.length) {
    quadrant.push(start)
  }

  const pythagorean = (a, b) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
  const distances = quadrant.map(p => pythagorean(Math.abs(start[0] - p[0]), Math.abs(start[1] - p[1])))
  const closest = quadrant[distances.indexOf(Math.min(...distances))]
  return pixels.findIndex(i => JSON.stringify(i) === JSON.stringify(closest))
}

export const DisabledMode = {
  onSetup () {
    return {} // Return empty state
  },

  onClick () {
    // Prevent feature selection
    return false
  },

  onKeyUp () {
    return false
  },

  onDrag () {
    return false
  },

  toDisplayFeatures (state, geojson, display) {
    geojson.properties.active = 'false'
    display(geojson)
  }
}

export const EditVertexMode = {
  ...DirectSelect,

  onSetup (options) {
    const { map } = this
    const state = DirectSelect.onSetup.call(this, options)

    const { container, featureId, selectedVertexIndex, selectedVertexType, isPanEnabled, vertexButton, interfaceType } = options
    state.container = container
    state.interfaceType = interfaceType
    state.vertexButton = vertexButton
    state.isPanEnabled = isPanEnabled
    state.featureId = featureId
    state.vertecies = this.getVerticies(featureId) // Store vertecies
    state.midpoints = this.getMidpoints(featureId) // Store midpoints
    state.selectedVertexIndex = selectedVertexIndex !== undefined ? selectedVertexIndex : -1 // Tracks selected vertex/midpoint
    state.selectedVertexType = selectedVertexType // Tracks select type vertex or midpoint

    // Force modechange event to fire
    map.fire('draw.modechange', {
      mode: 'edit_vertex',
      feature: this.getFeature(featureId)
    })

    // Define event handlers
    this.keydownHandler = (e) => this.onKeydown(state, e)
    this.keyupHandler = (e) => this.onKeyup(state, e)
    this.pointerdownHandler = (e) => this.onPointerdown(state, e)
    this.pointerupHandler = (e) => this.onPointerup(state, e)
    this.selectionChangeHandler = (e) => this.onSelectionChange(state, e)
    this.updateHandler = (e) => this.onUpdate(state, e)
    // this.zoomHandler = (e) => this.onZoom(state, e)
    this.moveHandler = (e) => this.onMove(state, e)
    this.vertexButtonClickHandler = (e) => this.onVertexButtonClick(state, e)
    this.touchStartHandler = (e) => this.onTouchstart(state, e)
    this.touchMoveHandler = (e) => this.onTouchmove(state, e)

    // Add event listeners
    window.addEventListener('keydown', this.keydownHandler, { capture: true })
    window.addEventListener('keyup', this.keyupHandler, { capture: true })
    container.addEventListener('pointerdown', this.pointerdownHandler)
    container.addEventListener('pointerup', this.pointerupHandler)
    container.addEventListener('touchstart', this.touchStartHandler, { passive: false })
    container.addEventListener('touchmove', this.touchMoveHandler, { passive: false })
    map.on('draw.selectionchange', this.selectionChangeHandler)
    map.on('draw.update', this.updateHandler)
    map.on('move', this.moveHandler)
    // map.on('zoom', this.zoomHandler)
    vertexButton.addEventListener('click', this.vertexButtonClickHandler)

    // Add midpoint
    if (selectedVertexType === 'midpoint') {
      const coords = state.midpoints[selectedVertexIndex - state.vertecies.length]
      this.updateMidpoint(coords)
    }

    // Add touch vertex target
    this.addTouchVertexTarget(state)

    // Dispatch vertex chnage event on entering mode
    this.map.fire('draw.vertexchange', {
      featureId: state.featureId,
      selectedVertexIndex: state.selectedVertexIndex,
      numVertecies: state.vertecies.length
    })

    return state
  },

  onSelectionChange (state, e) {
    const { map } = this
    const { interfaceType, featureId, vertecies } = state
    const vertexCoord = e.points[e.points.length - 1]?.geometry.coordinates
    const coords = e.features[0].geometry.coordinates.flat(1)
    const selectedVertexIndex = coords.findIndex(c => vertexCoord && c[0] === vertexCoord[0] && c[1] === vertexCoord[1])
    const keyBoardIndex = state.selectedVertexIndex < 0 ? selectedVertexIndex : state.selectedVertexIndex
    // state.selectedVertexIndex is already uptodate if set by keyboard
    state.selectedVertexIndex = interfaceType === 'keyboard' ? keyBoardIndex : selectedVertexIndex
    state.selectedVertexType ??= selectedVertexIndex >= 0 ? 'vertex' : null

    // Fire selection change draw event
    this.map.fire('draw.vertexchange', {
      featureId,
      selectedVertexIndex,
      numVertecies: vertecies.length
    })

    // Update vertex display when selection changes
    const coord = e.points?.[0]?.geometry.coordinates
    const point = coord ? map.project(coord) : null
    this.updateTouchVertexTarget(state, point)
  },

  onUpdate (state, e) {
    const { map } = this

    const previousLength = state.vertecies.length
    const previousVertecies = new Set(state.vertecies.map(coord => JSON.stringify(coord)))
    state.vertecies = this.getVerticies(state.featureId)
    state.midpoints = this.getMidpoints(state.featureId)

    if (previousLength === state.vertecies.length) {
      return
    }

    // Update vertex display when coordinates update
    const coord = state.vertecies.filter(coord => !previousVertecies.has(JSON.stringify(coord)))?.[0]

    const selectedVertexIndex = state.vertecies.findIndex(coord => !previousVertecies.has(JSON.stringify(coord)))
    state.selectedVertexIndex = selectedVertexIndex //! isNaN(selectedVertexIndex) ? selectedVertexIndex : state.selectedVertexIndex
    state.selectedVertexType ??= selectedVertexIndex >= 0 ? 'vertex' : null

    // Udate touch vertex target
    const point = coord ? map.project(coord) : null
    this.updateTouchVertexTarget(state, point)

    // Dispatch vertex change event
    this.map.fire('draw.vertexchange', {
      featureId: state.featureId,
      selectedVertexIndex: state.selectedVertexIndex,
      numVertecies: state.vertecies.length
    })
  },

  onKeydown (state, e) {
    state.interfaceType = 'keyboard'
    this.hideTouchVertexIndicator(state)

    // Set selected index and type
    if (e.key === ' ' && state.selectedVertexIndex < 0) {
      state.isPanEnabled = false
      this.updateVertex(state)
    }

    // Move vertex
    if (!e.altKey && ARROW_KEYS.includes(e.key) && state.selectedVertexIndex >= 0) {
      e.preventDefault()
      e.stopPropagation()

      if (state.selectedVertexType === 'midpoint') {
        this.insertVertex(state, e)
      }

      if (state.selectedVertexType === 'vertex') {
        const coord = this.getNewCoord(state, e)
        this.moveVertex(state, coord)
      }
    }

    // Navigate points
    if (e.altKey && ARROW_KEYS.includes(e.key) && state.selectedVertexIndex >= 0) {
      this.updateVertex(state, e.key)
    }

    // Clear selected index and type
    if (e.key === 'Escape') {
      state.isPanEnabled = true
      state.selectedVertexIndex = -1
      state.selectedVertexType = null

      const draw = this._ctx.api
      draw.changeMode('edit_vertex', {
        ...state
      })
    }
  },

  onKeyup (state, e) {
    state.interfaceType = 'keyboard'

    // Arrow keys propogating to container
    if (ARROW_KEYS.includes(e.key) && state.selectedVertexIndex >= 0) {
      e.stopPropagation()
    }

    // Delete a vertex
    if (e.key === 'Delete') {
      this.deleteVertex(state)
    }
  },

  onPointerdown (state, e) {
    state.interfaceType = e.pointerType === 'touch' ? 'touch' : 'pointer'
    state.isPanEnabled = true
  },

  onPointerup (state, e) {
    state.interfaceType = e.pointerType === 'touch' ? 'touch' : 'pointer'
    state.isPanEnabled = true
  },

  // Dispatched when target is a DOM element
  onTouchstart (state, e) {
    if (state.selectedVertexIndex < 0) {
      return
    }
    const { map } = this
    const { vertecies, selectedVertexIndex, touchVertexTarget } = state
    const touchPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    state.deltaTarget = { x: touchPoint.x - parseFloat(window.getComputedStyle(touchVertexTarget).left), y: touchPoint.y - parseFloat(window.getComputedStyle(touchVertexTarget).top) }
    const vertexPoint = map.project(vertecies[selectedVertexIndex >= 0 ? selectedVertexIndex : 0])
    state.deltaVertex = { x: touchPoint.x - vertexPoint.x, y: touchPoint.y - vertexPoint.y }
  },

  // Dispatched when target is a DOM element
  onTouchmove (state, e) {
    const { map } = this
    const { deltaVertex, deltaTarget } = state
    const targetEl = e.target.parentNode

    if (!(targetEl instanceof window.SVGElement || targetEl.ownerSVGElement)) {
      return
    }

    const touchPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const newVertexPoint = { x: touchPoint.x - deltaVertex.x, y: touchPoint.y - deltaVertex.y }
    const coord = map.unproject(newVertexPoint)
    this.moveVertex(state, coord)
    const newTargetPoint = { x: touchPoint.x - deltaTarget.x, y: touchPoint.y - deltaTarget.y }
    this.updateTouchVertexTarget(state, newTargetPoint)
  },

  // Dispatched when target is mapbox-gl-draw or the canvas
  onDrag (state, e) {
    DirectSelect.onDrag.call(this, state, e)

    const { map } = this
    const { deltaVertex, deltaTarget } = state

    if (!deltaVertex) {
      return
    }

    const touchPoint = { x: e.point.x, y: e.point.y }
    const newVertexPoint = { x: touchPoint.x - deltaVertex.x, y: touchPoint.y - deltaVertex.y }
    const coord = map.unproject(newVertexPoint)
    this.moveVertex(state, coord)
    // Update vertex display when coordinates update
    const newTargetPoint = { x: touchPoint.x - deltaTarget.x, y: touchPoint.y - deltaTarget.y }
    this.updateTouchVertexTarget(state, newTargetPoint)
  },

  onMove (state, e) {
    const { map } = this
    const { vertecies, selectedVertexIndex } = state

    // Update vertex display when coordinates update
    const vertex = vertecies[selectedVertexIndex]
    if (vertex) {
      this.updateTouchVertexTarget(state, map.project(vertex))
    }
  },

  onVertexButtonClick (state, e) {
    this.deleteVertex(state)
  },

  getVerticies (featureId) {
    const feature = this.getFeature(featureId)
    return feature?.coordinates?.flat(1) || []
  },

  getMidpoints (featureId) {
    const feature = this.getFeature(featureId)
    if (!feature) {
      return []
    }

    const coords = feature.coordinates.flat(1)
    const midpoints = []

    for (let i = 0; i < coords.length; i++) {
      const nextIndex = (i + 1) % coords.length // Ensure it loops back to the start
      const midX = (coords[i][0] + coords[nextIndex][0]) / 2
      const midY = (coords[i][1] + coords[nextIndex][1]) / 2
      midpoints.push([midX, midY])
    }

    return midpoints
  },

  getVertexOrMidpoint (state, direction) {
    const { map } = this
    const vertexPixels = state.vertecies.map(p => Object.values(map.project(p)))
    const midpointPixels = state.midpoints.map(p => Object.values(map.project(p)))
    const pixels = [...vertexPixels, ...midpointPixels]
    const startPixel = pixels[state.selectedVertexIndex]
    const start = startPixel || Object.values(map.project(map.getCenter()))

    const index = spatialNavigate(start, pixels, direction)

    const type = index < state.vertecies.length ? 'vertex' : 'midpoint'

    return [index, type]
  },

  addTouchVertexTarget (state) {
    const { container } = state
    let el = container.querySelector('[data-touch-vertex-target]')
    if (!el) {
      container.insertAdjacentHTML('beforeend', touchVertexTarget)
      el = container.querySelector('[data-touch-vertex-target]')
    }
    state.touchVertexTarget = el
  },

  updateTouchVertexTarget (state, point) {
    if (state.interfaceType === 'touch' && state.selectedVertexIndex >= 0 && state.selectedVertexType === 'vertex') {
      this.showTouchVertexIndicator(state, point)
    } else {
      this.hideTouchVertexIndicator(state)
    }
  },

  updateMidpoint (coordinates) {
    const { map } = this

    // Shouldn't add to layer directly but can't get this._ctx.api.add(feature) to work
    setTimeout(() => {
      map.getSource('mapbox-gl-draw-hot').setData({
        type: 'Feature',
        properties: {
          meta: 'midpoint',
          active: 'true',
          id: 'active-midpoint'
        },
        geometry: {
          type: 'Point',
          coordinates
        }
      })
    }, 0)
  },

  updateVertex (state, direction) {
    const [index, type] = this.getVertexOrMidpoint(state, direction)

    this._ctx.api.changeMode('edit_vertex', {
      ...state,
      selectedVertexIndex: index,
      selectedVertexType: type,
      ...(type === 'vertex' ? { coordPath: `0.${index}` } : {})
    })
  },

  getOffset (coord, e) {
    const { map } = this
    const pixel = map.project(coord)
    const offset = e.shiftKey ? NUDGE : STEP
    if (e.key === 'ArrowUp') {
      pixel.y -= offset
    } else if (e.key === 'ArrowDown') {
      pixel.y += offset
    } else if (e.key === 'ArrowLeft') {
      pixel.x -= offset
    } else {
      pixel.x += offset
    }
    return map.unproject(pixel)
  },

  insertVertex (state, e) {
    const feature = this.getFeature(state.featureId)
    const midpointIndex = state.selectedVertexIndex - state.vertecies.length

    // Get the midpoint coordinates
    let midpointCoord = state.midpoints[midpointIndex]

    // Add the offset
    const newMidpointCoord = this.getOffset(midpointCoord, e)
    midpointCoord = [newMidpointCoord.lng, newMidpointCoord.lat]

    // Calculate the index where the new vertex should be inserted
    // For a polygon/line, this is typically after the vertex that comes before the midpoint
    const vertexIndex = midpointIndex

    // Get the feature's GeoJSON
    const geojson = feature.toGeoJSON()

    // For a polygon, insert into the first ring (assuming simple polygons)
    if (geojson.geometry.type === 'Polygon') {
      const coordinates = geojson.geometry.coordinates[0]
      coordinates.splice(vertexIndex + 1, 0, midpointCoord)

      // Update the feature with the new coordinates
      this._ctx.api.add(geojson)
    }

    // For a line, insert directly into the coordinates array
    if (geojson.geometry.type === 'LineString') {
      geojson.geometry.coordinates.splice(vertexIndex + 1, 0, midpointCoord)

      // Update the feature
      this._ctx.api.add(geojson)
    }

    // Update the vertices and midpoints arrays
    state.vertecies = this.getVerticies(state.featureId)
    state.midpoints = this.getMidpoints(state.featureId)

    // Select the newly added vertex
    const newVertexIndex = vertexIndex + 1

    // Change mode to select the new vertex
    this._ctx.api.changeMode('edit_vertex', {
      ...state,
      selectedVertexIndex: newVertexIndex,
      selectedVertexType: 'vertex',
      coordPath: `0.${newVertexIndex}`
    })
  },

  getNewCoord (state, e) {
    const feature = this.getFeature(state.featureId)
    const coords = feature.coordinates.flat(1)

    // Get current coordinate and its pixel position
    const currentCoord = coords[state.selectedVertexIndex]

    // Calculate new coord based on direction
    return this.getOffset(currentCoord, e)
  },

  moveVertex (state, coord) {
    const feature = this.getFeature(state.featureId)

    // Directly update the coordinates in the feature's internal structure
    // This depends on your feature type (point, line, polygon)
    const geojson = feature.toGeoJSON()

    // For polygon: find the right ring and position (Assuming first ring (outer boundary) for simplicity)
    if (geojson.geometry.type === 'Polygon') {
      geojson.geometry.coordinates[0][state.selectedVertexIndex] = [coord.lng, coord.lat]
    }

    // For LineString: directly update the position
    // if (geojson.geometry.type === 'LineString') {
    //   geojson.geometry.coordinates[state.selectedVertexIndex] = [newCoord.lng, newCoord.lat]
    // }

    // Update the feature with the modified GeoJSON
    this._ctx.api.add(geojson)

    // Update the vertices and midpoints arrays
    state.vertecies = this.getVerticies(state.featureId)
    state.midpoints = this.getMidpoints(state.featureId)
  },

  deleteVertex (state) {
    const draw = this._ctx.api
    const feature = this.getFeature(state.featureId)
    const featureType = feature.type
    const numCoords = state.vertecies.length

    // Return if too few coords
    if ((featureType === 'Polygon' && numCoords <= 3) || (featureType === 'LineString' && numCoords <= 2)) {
      return
    }

    // Get next vertexIndex after deletion
    const nextVertexIndex = state.selectedVertexIndex >= (state.vertecies.length - 1) ? 0 : state.selectedVertexIndex

    // Delete vertex
    draw.trash()

    // Reenter the mode to refresh the state
    draw.changeMode('edit_vertex', {
      ...state,
      selectedVertexIndex: nextVertexIndex,
      selectedVertexType: 'vertex',
      coordPath: `0.${nextVertexIndex}`
    })
  },

  showTouchVertexIndicator (state, point) {
    const { touchVertexTarget } = state
    touchVertexTarget.style.display = 'block'
    touchVertexTarget.style.top = `${point.y}px`
    touchVertexTarget.style.left = `${point.x}px`
  },

  hideTouchVertexIndicator (state) {
    const { touchVertexTarget } = state
    touchVertexTarget.style.display = 'none'
  },

  onStop (state) {
    const { map } = this
    const { container, vertexButton } = state
    container.removeEventListener('pointerdown', this.pointerdownHandler)
    container.removeEventListener('pointerup', this.pointerupHandler)
    container.removeEventListener('touchstart', this.touchStartHandler)
    container.removeEventListener('touchmove', this.touchMoveHandler)
    map.off('draw.selectionchange', this.selectionChangeHandler)
    map.off('draw.update', this.updateHandler)
    map.off('move', this.moveHandler)
    // map.off('zoom', this.zoomHandler)
    map.dragPan.enable()
    vertexButton.removeEventListener('click', this.vertexButtonClickHandler)
    window.removeEventListener('keydown', this.keydownHandler, { capture: true })
    window.removeEventListener('keyup', this.keyupHandler, { capture: true })
    this.hideTouchVertexIndicator(state)
  }
}

export const DrawVertexMode = {
  ...DrawPolygon,

  onSetup (options) {
    const { map } = this

    // Force modechnage event to fire
    map.fire('draw.modechange', {
      mode: 'draw_vertex'
    })

    const state = DrawPolygon.onSetup.call(this, options)
    const { interfaceType, container, featureId, vertexButton } = options
    state.vertexButton = vertexButton
    state.interfaceType = interfaceType
    state.container = container
    state.featureId = featureId

    // Add vertex target
    if (!container.querySelector('[data-vertex-target]')) {
      container.insertAdjacentHTML('beforeend', markerSVG)
    }

    // Set initial visiblity
    const vertexMarker = container.lastElementChild
    vertexMarker.style.display = ['touch', 'keyboard'].includes(interfaceType) ? 'block' : 'none'
    state.vertexMarker = vertexMarker

    // Bind events as default events require map container to have focus
    this.keydownHandler = (e) => this.onKeydown(state, e)
    this.keyupHandler = (e) => this.onKeyup(state, e)
    this.focusHandler = (e) => this.onFocus(state, e)
    this.blurHandler = (e) => this.onBlur(state, e)
    this.createHandler = (e) => this.onCreate(state, e)
    this.moveHandler = (e) => this.onMove(state, e)
    this.pointerdownHandler = (e) => this.onPointerdown(state, e)
    this.pointermoveHandler = (e) => this.onPointermove(state, e)
    this.pointerupHandler = (e) => this.onPointerup(state, e)
    this.vertexButtonClickHandler = (e) => this.onVertexButtonClick(state, e)

    // Add event listeners
    vertexButton.addEventListener('click', this.vertexButtonClickHandler)
    window.addEventListener('keydown', this.keydownHandler)
    window.addEventListener('keyup', this.keyupHandler)
    container.addEventListener('focus', this.focusHandler)
    container.addEventListener('blur', this.blurHandler)
    container.addEventListener('pointermove', this.pointermoveHandler)
    container.addEventListener('pointerup', this.pointerupHandler)
    map.on('pointerdown', this.pointerdownHandler)
    map.on('draw.create', this.createHandler)
    map.on('move', this.moveHandler)

    return state
  },

  doClick (state) {
    const coords = state.polygon.coordinates
    this.dispatchVertexChange(coords[0])

    // Not a valid vertex
    if (!isValidClick(coords)) {
      return
    }

    const { map } = this
    const center = map.getCenter()
    const point = map.project(center)

    const simulatedClickEvent = {
      lngLat: center,
      point,
      originalEvent: new window.MouseEvent('click', {
        clientX: point.x,
        clientY: point.y,
        bubbles: true,
        cancelable: true
      })
    }
    DrawPolygon.onClick.call(this, state, simulatedClickEvent)
    this._ctx.store.render()
  },

  dispatchVertexChange (coords) {
    this.map.fire('draw.vertexchange', {
      numVertecies: coords.length
    })
  },

  onTap () {

  },

  onCreate (state, e) {
    const draw = this._ctx.api
    const feature = e.features[0]
    draw.delete(feature.id)
    feature.id = state.featureId
    draw.add(feature)
  },

  onVertexButtonClick (state, e) {
    this.doClick(state)
  },

  onTouchStart (state, e) {
    // Update line when switching interfaceType
    if (state.interfaceType === 'touch') {
      this.onMove(state, e)
    }
    state.interfaceType = 'touch'

    // Show vertex marker
    state.vertexMarker.style.display = 'block'
  },

  onTouchEnd (state, e) {
    // Update line when switching interfaceType
    if (state.interfaceType === 'touch') {
      this.onMove(state, e)
    }
    state.interfaceType = 'touch'

    // Show vertex marker
    state.vertexMarker.style.display = 'block'
  },

  onKeydown (state, e) {
    // Escape keypress
    if (e.key === 'Escape') {
      e.preventDefault()
      return
    }

    // Enter keypress set active flag
    if (e.key === 'Enter') {
      state.isActive = true
    }

    // Update line when switching interfaceType
    if (state.interfaceType === 'keyboard') {
      this.onMove(state, e)
    }
    state.interfaceType = 'keyboard'

    // Show vertex marker
    state.vertexMarker.style.display = 'block'
  },

  onKeyup (state, e) {
    // Escape keypress or invalid vertex
    if (e.key === 'Escape') {
      return
    }

    // Update line when switching interfaceType
    if (state.interfaceType === 'keyboard') {
      this.onMove(state, e)
    }

    // Do click on Enter keypress
    if (e.key === 'Enter' && state.isActive) {
      this.doClick(state)
    }
    state.interfaceType = 'keyboard'

    // Show vertex marker
    state.vertexMarker.style.display = 'block'
  },

  onFocus (state, e) {
    const { vertexMarker, interfaceType } = state
    vertexMarker.style.display = ['touch', 'keyboard'].includes(interfaceType) ? 'block' : 'none'
  },

  onBlur (state, e) {
    if (e.target !== state.container) {
      state.vertexMarker.style.display = 'none'
    }
  },

  onMove (state, e) {
    // Clear vertex marker
    if (['touch', 'keyboard'].includes(state.interfaceType)) {
      const { map } = this
      const center = map.getCenter()
      const point = map.project(center)
      const simulatedMouseMoveEvent = {
        lngLat: center,
        point,
        originalEvent: new window.MouseEvent('mousemove', {
          clientX: point.x,
          clientY: point.y,
          bubbles: true,
          cancelable: true
        })
      }
      // Show vertex marker
      DrawPolygon.onMouseMove.call(this, state, simulatedMouseMoveEvent)
      this._ctx.store.render()
    }
  },

  onPointerdown (state, e) {
    if (e.pointerType !== 'touch') {
      state.interfaceType = 'pointer'
      state.vertexMarker.style.display = 'none'
    }
  },

  onPointermove (state, e) {
    if (e.pointerType !== 'touch') {
      state.vertexMarker.style.display = 'none'
    }
  },

  onPointerup (state, e) {
    this.dispatchVertexChange(state.polygon.coordinates[0])
  },

  toDisplayFeatures (state, geojson, display) {
    DrawPolygon.toDisplayFeatures.call(this, state, geojson, display)

    if (geojson.geometry.type === 'Polygon') {
      const ring = geojson.geometry.coordinates[0]
      // Add extra verticies between first and last
      for (let i = 1; i < ring.length - 2; i++) {
        const coordPath = `0.${i}`
        display(createVertex(geojson.id, ring[i], coordPath))
      }
    }
  },

  onStop (state) {
    DrawPolygon.onStop.call(this, state)
    const { map } = this
    const { container, vertexButton } = state
    window.removeEventListener('keydown', this.keydownHandler)
    window.removeEventListener('keyup', this.keyupHandler)
    container.removeEventListener('focus', this.focusHandler)
    container.removeEventListener('blur', this.blurHandler)
    container.removeEventListener('pointermove', this.pointermoveHandler)
    container.removeEventListener('pointerup', this.pointerupHandler)
    map.off('pointerdown', this.pointerdownHandler)
    map.off('draw.create', this.createHandler)
    map.off('move', this.moveHandler)
    vertexButton.removeEventListener('click', this.vertexButtonClickHandler)

    // Remove vertex target
    container.querySelector('[data-vertex-target]')?.remove()
  }
}
