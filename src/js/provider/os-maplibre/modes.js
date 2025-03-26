import DirectSelect from '../../../../node_modules/@mapbox/mapbox-gl-draw/src/modes/direct_select'

const spatialNavigate = (direction, start, pixels) => {
  const quadrant = pixels.filter(p => {
    const offsetX = Math.abs(p[0] - start[0])
    const offsetY = Math.abs(p[1] - start[1])
    let isQuadrant = false
    if (direction === 'up') {
      isQuadrant = p[1] <= start[1] && offsetY >= offsetX
    } else if (direction === 'down') {
      isQuadrant = p[1] > start[1] && offsetY >= offsetX
    } else if (direction === 'left') {
      isQuadrant = p[0] <= start[0] && offsetY < offsetX
    } else if (direction === 'right') {
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

  onSetup(options) {
    const state = DirectSelect.onSetup.call(this, options)
    const { container, selectedIndex, selectedType } = options
    state.selectedIndex = selectedIndex // Tracks selected vertex/midpoint
    state.selectedType = selectedType // Tracks select type vertex or midpoint
    state.vertecies = this.getVerticies(state.featureId) // Store vertecies
    state.midpoints = this.getMidpoints(state.featureId) // Store midpoints
    state.isMidpoint = false // Is a midpoint selected?
    state.container = container

    // Bind events as default events require map container to have focus
    this.keydownHandler = (e) => this.onKeyDown(state, e)
    container.addEventListener('keydown', this.keydownHandler)

    // Selection change event
    this.selectionChangeHandler = (e) => this.onSelectionChange(state, e)
    this.map.on('draw.selectionchange', this.selectionChangeHandler)

    return state
  },

  updateActiveMidpoint(coordinates) {
    const { map } = this

    // Shouldn't add to layer directly but can't get this._ctx.api.add(feature) to work
    map.getSource('mapbox-gl-draw-hot').setData({
      type: 'FeatureCollection',
      features: [{
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
      }]
    })
  },

  onSelectionChange(state, e) {
    const vertex = e.points[e.points.length - 1]
    this.map.fire('draw.vertexselected', {
      isSelected: !!vertex
    })
  },

  onKeyDown(state, e) {
    console.log('onKeyDown', !!state.selectedIndex, state.selectedIndex, state.selectedType)
    // Set selected vertex
    if (e.key === ' ' && isNaN(state.selectedIndex)) {
      this.getVertexOrMidpoint(state)
    }

    if (e.key === 'Escape') {
      state.selectedIndex = null
      state.selectedType = null
      const draw = this._ctx.api 
      draw.changeMode('edit_vertex', { container: state.container, featureId: state.featureId })
    }
  },

  getVerticies(featureId) {
    const feature = this.getFeature(featureId)
    return feature?.coordinates?.flat(1) || []
  },

  getMidpoints(featureId) {
    const feature = this.getFeature(featureId)
    if (!feature) {
      return []
    }

    const coords = feature.coordinates.flat(1)
    const midpoints = []

    for (let i = 0; i < coords.length; i++) {
      const nextIndex = (i + 1) % coords.length  // Ensure it loops back to the start
      const midX = (coords[i][0] + coords[nextIndex][0]) / 2
      const midY = (coords[i][1] + coords[nextIndex][1]) / 2
      midpoints.push([midX, midY])
    }

    return midpoints
  },

  getVertexOrMidpoint(state, direction) {
    const { map } = this
    const start = Object.values(map.project(state.selectedIndex || map.getCenter()))
    const vertexPixels = state.vertecies.map(p => Object.values(map.project(p)))
    const midpointPixels = state.midpoints.map(p => Object.values(map.project(p)))
    const pixels = [...vertexPixels, ...midpointPixels]
    const index = spatialNavigate(direction, start, pixels)
    const draw = this._ctx.api 

    if (index < state.vertecies.length) {
      draw.changeMode('edit_vertex', {
        container: state.container,
        featureId: state.featureId,
        selectedIndex: index,
        selectedType: 'vertex',
        coordPath: `0.${index}`
      })

      return [index, 'vertex']
    } else {
      const coords = state.midpoints[index - state.vertecies.length]
      this.updateActiveMidpoint(coords)

      return [index, 'midpoint']
    }
  },

  // toDisplayFeatures(state, geojson, display) {
  //   DirectSelect.toDisplayFeatures.call(this, state, geojson, display)

  //   if (this.activeMidpoint) {
  //     display(this.activeMidpoint) 
  //   }
  // },

  onStop(state, e) {
    this.map.off('draw.selectionchange', this.selectionChangeHandler)
    state.container.removeEventListener('keydown', this.keydownHandler)
  }
}
