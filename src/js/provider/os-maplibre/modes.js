import DirectSelect from '../../../../node_modules/@mapbox/mapbox-gl-draw/src/modes/direct_select'
import DrawPolygon from '../../../../node_modules/@mapbox/mapbox-gl-draw/src/modes/draw_polygon'
import createVertex from '../../../../node_modules/@mapbox/mapbox-gl-draw/src/lib/create_vertex'

const markerSVG = `
  <svg width='38' height='38' viewBox='0 0 38 38' fill-rule='evenodd' fill='currentColor' style='display:none;position:absolute;top:50%;left:50%;margin:-19px 0 0 -19px' data-fm-vertex-target>
    <path d='M5.035 20H1v-2h4.035C5.525 11.069 11.069 5.525 18 5.035V1h2v4.035c6.931.49 12.475 6.034 12.965 12.965H37v2h-4.035c-.49 6.931-6.034 12.475-12.965 12.965V37h-2v-4.035C11.069 32.475 5.525 26.931 5.035 20zM19 7A12.01 12.01 0 0 0 7 19a12.01 12.01 0 0 0 12 12 12.01 12.01 0 0 0 12-12A12.01 12.01 0 0 0 19 7zm0 10a2 2 0 1 1 0 4 2 2 0 1 1 0-4z'/>
  </svg>
`

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

const NUDGE = 1

const STEP = 5

const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

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
    const state = DirectSelect.onSetup.call(this, options)
    const { container, featureId, selectedIndex, selectedType, isPanEnabled } = options
    state.container = container
    state.isPanEnabled = isPanEnabled
    state.featureId = featureId
    state.vertecies = this.getVerticies(featureId) // Store vertecies
    state.midpoints = this.getMidpoints(featureId) // Store midpoints
    state.selectedIndex = selectedIndex !== undefined ? selectedIndex : -1 // Tracks selected vertex/midpoint
    state.selectedType = selectedType // Tracks select type vertex or midpoint

    // Bind events as default events require map container to have focus
    this.keydownHandler = (e) => this.onKeyDown(state, e)
    this.keyupHandler = (e) => this.onKeyUp(state, e)
    container.addEventListener('keydown', this.keydownHandler)
    container.addEventListener('keyup', this.keyupHandler)

    // Selection change event
    this.selectionChangeHandler = (e) => this.onSelectionChange(state, e)
    this.map.on('draw.selectionchange', this.selectionChangeHandler)

    // Feature or vertex update event
    const updateHandler = (e) => this.onUpdate(state, e)
    this.map.on('draw.update', updateHandler)

    // Add midpoint
    if (selectedType === 'midpoint') {
      const coords = state.midpoints[selectedIndex - state.vertecies.length]
      this.updateMidpoint(coords)
    }

    return state
  },

  onSelectionChange (state, e) {
    const vertexCoord = e.points[e.points.length - 1]?.geometry.coordinates
    const coords = e.features[0].geometry.coordinates.flat(1)
    const selectedIndex = coords.findIndex(c => vertexCoord && c[0] === vertexCoord[0] && c[1] === vertexCoord[1])
    state.selectedIndex = state.selectedIndex < 0 ? selectedIndex : state.selectedIndex
    state.selectedType ??= selectedIndex >= 0 ? 'vertex' : null
  },

  onUpdate (state, e) {
    const selectedIndex = parseInt(state.selectedCoordPaths[0]?.split('.')[1], 10)
    state.selectedIndex = !isNaN(selectedIndex) ? selectedIndex : state.selectedIndex
  },

  onKeyDown (state, e) {
    // Set selected index and type
    if (e.key === ' ' && state.selectedIndex < 0) {
      state.isPanEnabled = false
      this.updateVertex(state)
    }

    // Move vertex
    if (!e.altKey && ARROW_KEYS.includes(e.key) && state.selectedIndex >= 0) {
      e.preventDefault()
      e.stopPropagation()

      if (state.selectedType === 'midpoint') {
        this.insertVertex(state, e)
      }

      if (state.selectedType === 'vertex') {
        this.moveVertex(state, e)
      }
    }

    // Navigate points
    if (e.altKey && ARROW_KEYS.includes(e.key) && state.selectedIndex >= 0) {
      this.updateVertex(state, e.key)
    }

    // Clear selected index and type
    if (e.key === 'Escape') {
      state.isPanEnabled = true
      state.selectedIndex = -1
      state.selectedType = null

      const draw = this._ctx.api
      draw.changeMode('edit_vertex', { container: state.container, isPanEnabled: true, featureId: state.featureId })
    }
  },

  onKeyUp (state, e) {
    // Arrow keys propogating to container
    if (ARROW_KEYS.includes(e.key) && state.selectedIndex >= 0) {
      e.stopPropagation()
    }

    // Delete a vertex
    if (e.key === 'Delete') {
      this.deleteVertex(state)
    }
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
    const startPixel = pixels[state.selectedIndex]
    const start = startPixel || Object.values(map.project(map.getCenter()))

    const index = spatialNavigate(start, pixels, direction)

    const type = index < state.vertecies.length ? 'vertex' : 'midpoint'

    return [index, type]
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
    const { container, isPanEnabled, featureId } = state
    const [index, type] = this.getVertexOrMidpoint(state, direction)

    this._ctx.api.changeMode('edit_vertex', {
      container,
      isPanEnabled,
      featureId,
      selectedIndex: index,
      selectedType: type,
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
    const midpointIndex = state.selectedIndex - state.vertecies.length

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
      container: state.container,
      isPanEnabled: state.isPanEnabled,
      featureId: state.featureId,
      selectedIndex: newVertexIndex,
      selectedType: 'vertex',
      coordPath: `0.${newVertexIndex}`
    })
  },

  moveVertex (state, e) {
    const feature = this.getFeature(state.featureId)
    const coords = feature.coordinates.flat(1)

    // Get current coordinate and its pixel position
    const currentCoord = coords[state.selectedIndex]

    // Calculate new coord based on direction
    const newCoord = this.getOffset(currentCoord, e)

    // Directly update the coordinates in the feature's internal structure
    // This depends on your feature type (point, line, polygon)
    const geojson = feature.toGeoJSON()

    // For polygon: find the right ring and position (Assuming first ring (outer boundary) for simplicity)
    if (geojson.geometry.type === 'Polygon') {
      geojson.geometry.coordinates[0][state.selectedIndex] = [newCoord.lng, newCoord.lat]
    }

    // For LineString: directly update the position
    if (geojson.geometry.type === 'LineString') {
      geojson.geometry.coordinates[state.selectedIndex] = [newCoord.lng, newCoord.lat]
    }

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

    draw.trash()

    // Get next vertexIndex after deletion
    const nextVertexIndex = state.selectedIndex >= (state.vertecies.length - 1) ? 0 : state.selectedIndex

    // Reenter the mode to refresh the state
    draw.changeMode('edit_vertex', {
      container: state.container,
      isPanEnabled: state.isPanEnabled,
      featureId: state.featureId,
      selectedIndex: nextVertexIndex,
      selectedType: 'vertex',
      coordPath: `0.${nextVertexIndex}`
    })
  },

  onStop (state) {
    this.map.off('draw.selectionchange', this.selectionChangeHandler)
    state.container.removeEventListener('keydown', this.keydownHandler)
    state.container.removeEventListener('keyup', this.keyupHandler)
  }
}

export const DrawVertexMode = {
  ...DrawPolygon,

  onSetup (options) {
    const { map } = this
    const state = DrawPolygon.onSetup.call(this, options)
    const { interfaceType, container, featureId } = options
    state.interfaceType = interfaceType
    state.container = container
    state.featureId = featureId

    // Add vertex target
    if (!container.querySelector('[data-fm-vertex-target]')) {
      container.insertAdjacentHTML('beforeend', markerSVG)
    }

    // Set initial visiblity
    const vertexMarker = container.lastElementChild
    vertexMarker.style.display = interfaceType === 'keyboard' ? 'block' : 'none'
    state.vertexMarker = vertexMarker

    // Bind events as default events require map container to have focus
    this.keydownHandler = (e) => this.onKeyDown(state, e)
    this.keyupHandler = (e) => this.onKeyUp(state, e)
    this.pointerdownHandler = (e) => this.onPointerDown(state, e)
    this.focusHandler = (e) => this.onFocus(state, e)
    this.blurHandler = (e) => this.onBlur(state, e)
    this.createHandler = (e) => this.onCreate(state, e)
    this.moveHandler = (e) => this.onMove(state, e)
    this.pointermoveHandler = (e) => this.onPointerMove(state, e)
    container.addEventListener('keydown', this.keydownHandler)
    container.addEventListener('keyup', this.keyupHandler)
    container.addEventListener('pointerdown', this.pointerdownHandler)
    container.addEventListener('focus', this.focusHandler)
    container.addEventListener('blur', this.blurHandler)
    container.addEventListener('pointermove', this.pointermoveHandler)
    map.on('draw.create', this.createHandler)
    map.on('move', this.moveHandler)

    return state
  },

  onCreate (state, e) {
    console.log('onCreate')
    const draw = this._ctx.api
    const feature = e.features[0]
    draw.delete(feature.id)
    feature.id = state.featureId
    draw.add(feature)
  },

  onKeyDown (state, e) {
    // Update line when switching interfaceType
    if (state.interfaceType === 'keyboard') {
      this.onMove(state, e)
    }

    // Set interfaceType
    state.interfaceType = 'keyboard'
    state.vertexMarker.style.display = 'block'
  },

  onKeyUp (state, e) {
    // Update line when switching interfaceType
    if (state.interfaceType === 'keyboard') {
      this.onMove(state, e)
    }

    // Set interfaceType
    state.interfaceType = 'keyboard'
    state.vertexMarker.style.display = 'block'

    // Enter keypress
    if (e.key === 'Enter') {
      this.doClick(state)
    }
  },

  onPointerDown (state, e) {
    state.interfaceType = 'pointer'
    state.vertexMarker.style.display = 'none'
  },

  onFocus (state, e) {
    const { vertexMarker, interfaceType } = state
    vertexMarker.style.display = interfaceType === 'keyboard' ? 'block' : 'none'
  },

  onBlur (state, e) {
    state.vertexMarker.style.display = 'none'
  },

  doClick (state) {
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

  onMove (state, e) {
    // Clear vertex marker
    if (state.interfaceType === 'keyboard') {
      state.vertexMarker.style.display = 'block'
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

  onPointerMove (state, e) {
    state.vertexMarker.style.display = 'none'
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

    const { container } = state
    container.removeEventListener('keydown', this.keydownHandler)
    container.removeEventListener('keyup', this.keyupHandler)
    container.removeEventListener('pointerdown', this.pointerdownHandler)
    container.removeEventListener('focus', this.focusHandler)
    container.removeEventListener('blur', this.blurHandler)
    container.removeEventListener('pointermove', this.pointermoveHandler)
    this.map.off('draw.create', this.createHandler)
    this.map.off('move', this.moveHandler)

    // Remove vertex target
    container.querySelector('[data-fm-vertex-target]')?.remove()
  }
}
