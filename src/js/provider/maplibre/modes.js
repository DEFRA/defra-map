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

    const { container, featureId, selectedIndex, selectedType, isPanEnabled, vertexButton, interfaceType } = options
    state.container = container
    state.interfaceType = interfaceType
    state.vertexButton = vertexButton
    state.isPanEnabled = isPanEnabled
    state.featureId = featureId
    state.vertecies = this.getVerticies(featureId) // Store vertecies
    state.midpoints = this.getMidpoints(featureId) // Store midpoints
    state.selectedIndex = selectedIndex !== undefined ? selectedIndex : -1 // Tracks selected vertex/midpoint
    state.selectedType = selectedType // Tracks select type vertex or midpoint

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
    this.zoomHandler = (e) => this.onZoom(state, e)
    this.vertexButtonClickHandler = (e) => this.onVertexButtonClick(state, e)

    // Add event listeners
    window.addEventListener('keydown', this.keydownHandler, { capture: true })
    window.addEventListener('keyup', this.keyupHandler, { capture: true })
    container.addEventListener('pointerdown', this.pointerdownHandler)
    container.addEventListener('pointerup', this.pointerupHandler)
    map.on('draw.selectionchange', this.selectionChangeHandler)
    map.on('draw.update', this.updateHandler)
    map.on('zoom', this.zoomHandler)
    vertexButton.addEventListener('click', this.vertexButtonClickHandler)

    // Add midpoint
    if (selectedType === 'midpoint') {
      const coords = state.midpoints[selectedIndex - state.vertecies.length]
      this.updateMidpoint(coords)
    }

    // Update vertex display based on interface type
    this.updateVertexDisplay(state)

    // Dispatch vertex chnage event on entering mode
    this.dispatchVertexChange(state.vertecies)

    return state
  },

  onSelectionChange (state, e) {
    const { interfaceType, featureId } = state
    const vertexCoord = e.points[e.points.length - 1]?.geometry.coordinates
    const coords = e.features[0].geometry.coordinates.flat(1)
    const selectedIndex = coords.findIndex(c => vertexCoord && c[0] === vertexCoord[0] && c[1] === vertexCoord[1])
    const keyBoardIndex = state.selectedIndex < 0 ? selectedIndex : state.selectedIndex
    // state.selectedIndex is already uptodate if set by keyboard
    state.selectedIndex = interfaceType === 'keyboard' ? keyBoardIndex : selectedIndex
    state.selectedType ??= selectedIndex >= 0 ? 'vertex' : null

    // Fire selection change draw event
    this.map.fire('draw.vertexselect', { featureId, selectedIndex })

    // Update vertex display when selection changes
    this.updateVertexDisplay(state, e)
  },

  onUpdate (state, e) {
    const selectedIndex = parseInt(state.selectedCoordPaths[0]?.split('.')[1], 10)
    state.selectedIndex = !isNaN(selectedIndex) ? selectedIndex : state.selectedIndex
    state.selectedType ??= selectedIndex >= 0 ? 'vertex' : null
    state.vertecies = this.getVerticies(state.featureId)
    state.midpoints = this.getMidpoints(state.featureId)

    // Update vertex display when coordinates update
    this.updateVertexDisplay(state, e)

    // Dispatch vertex change event
    this.dispatchVertexChange(state.vertecies)
  },

  onKeydown (state, e) {
    state.interfaceType = 'keyboard'

    // Update vertex display when coordinates update
    this.updateVertexDisplay(state)

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
      draw.changeMode('edit_vertex', {
        ...state
      })
    }
  },

  onKeyup (state, e) {
    state.interfaceType = 'keyboard'

    // Arrow keys propogating to container
    if (ARROW_KEYS.includes(e.key) && state.selectedIndex >= 0) {
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

    // Update vertex display when coordinates update
    this.updateVertexDisplay(state, e)
  },

  onPointerup (state, e) {
    state.interfaceType = e.pointerType === 'touch' ? 'touch' : 'pointer'
    state.isPanEnabled = true

    // Update vertex display when coordinates update
    this.updateVertexDisplay(state, e)
  },

  onDrag (state, e) {
    DirectSelect.onDrag.call(this, state, e)

    // Update vertex display when coordinates update
    this.updateVertexDisplay(state, e)
  },

  onZoom (state, e) {
    // Update vertex display when coordinates update
    this.updateVertexDisplay(state, e)
  },

  onVertexButtonClick (state, e) {
    this.deleteVertex(state)
  },

  dispatchVertexChange (coords) {
    this.map.fire('draw.vertexchange', {
      numVertecies: coords.length
    })
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

  updateVertexDisplay (state, e) {
    if (state.interfaceType === 'touch' && state.selectedIndex >= 0 && state.selectedType === 'vertex') {
      this.showTouchVertexIndicator(state, e)
    } else {
      this.hideTouchVertexIndicator()
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
      ...state,
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
      ...state,
      selectedIndex: nextVertexIndex,
      selectedType: 'vertex',
      coordPath: `0.${nextVertexIndex}`
    })
  },

  showTouchVertexIndicator (state, e) {
    const { map } = this
    const feature = this.getFeature(state.featureId)
    const coords = feature.coordinates.flat(1)
    const vertex = coords[state.selectedIndex]

    const TARGET_DISTANCE = 40
    const TARGET_ANGLE = 45

    // Calculate offset position for the large touch graphic
    const vertexPixel = map.project(vertex)
    const angleRad = (TARGET_ANGLE * Math.PI) / 180
    const offsetX = Math.cos(angleRad) * TARGET_DISTANCE
    const offsetY = Math.sin(angleRad) * TARGET_DISTANCE

    const offsetPixel = {
      x: vertexPixel.x + offsetX,
      y: vertexPixel.y + offsetY // Subtract Y because screen coordinates are inverted
    }

    const offsetCoord = map.unproject(offsetPixel)

    // Create large touch target at offset position
    const touchIndicator = {
      type: 'Feature',
      properties: {
        meta: 'touch-vertex-indicator',
        active: 'true',
        id: 'touch-vertex-indicator',
        parent: state.featureId,
        vertexIndex: state.selectedIndex
      },
      geometry: {
        type: 'Point',
        coordinates: [offsetCoord.lng, offsetCoord.lat]
      }
    }

    // Add touch indicator to cold layer
    setTimeout(() => {
      try {
        const hotSource = map.getSource('mapbox-gl-draw-cold')
        if (hotSource) {
          const existingData = hotSource._data || { type: 'FeatureCollection', features: [] }
          const features = existingData.features.filter(f =>
            f.properties.meta !== 'touch-vertex-indicator'
          )
          features.push(touchIndicator)

          hotSource.setData({
            type: 'FeatureCollection',
            features
          })
        }
      } catch (error) {
        console.warn('Could not update touch vertex indicator:', error)
      }
    }, 0)
  },

  hideTouchVertexIndicator () {
    const { map } = this

    setTimeout(() => {
      try {
        const hotSource = map.getSource('mapbox-gl-draw-cold')
        if (hotSource) {
          const existingData = hotSource._data || { type: 'FeatureCollection', features: [] }
          const features = existingData.features.filter(f =>
            f.properties.meta !== 'touch-vertex-indicator'
          )

          hotSource.setData({
            type: 'FeatureCollection',
            features
          })
        }
      } catch (error) {
        console.warn('Could not hide touch vertex indicator:', error)
      }
    }, 0)
  },

  onStop (state) {
    const { map } = this
    const { container, vertexButton } = state
    container.removeEventListener('pointerdown', this.pointerdownHandler)
    container.removeEventListener('pointerup', this.pointerupHandler)
    map.off('draw.selectionchange', this.selectionChangeHandler)
    map.off('draw.update', this.updateHandler)
    map.off('zoom', this.zoomHandler)
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

  onTap (state, e) {

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
