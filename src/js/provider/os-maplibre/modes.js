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
    const { container } = options
    state.selectedVertexOrMidpoint = null // Tracks selected vertex/midpoint
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

  onSelectionChange(state, e) {
    const vertex = e.points[e.points.length - 1]
    state.selectedVertexOrMidpoint = vertex
    this.map.fire('draw.vertexselected', {
      isSelected: !!vertex
    })
  },

  onKeyDown(state, e) {
    // Set selected vertex
    if (e.key === ' ') {
      state.selectedVertexOrMidpoint = this.getVertexOrMidpoint(state)
    }

    if (e.key === 'Escape') {
      state.selectedVertexOrMidpoint = null
      const draw = this._ctx.api 
      draw.changeMode('edit_vertex', { container: state.container, featureId: state.featureId })
    }

    if (!state.selectedVertexOrMidpoint) {
      return
    }
  },

  getVerticies(featureId) {
    const feature = this.getFeature(featureId)
    if (!feature) {
      return []
    }

    return feature.coordinates.flat(1)
  },

  getMidpoints(featureId) {
    const feature = this.getFeature(featureId)
    if (!feature) {
      return []
    }

    const coords = feature.coordinates.flat(1)
    const midpoints = []

    for (let i = 0; i < coords.length - 1; i++) {
      const midX = (coords[i][0] + coords[i + 1][0]) / 2
      const midY = (coords[i][1] + coords[i + 1][1]) / 2
      midpoints.push([midX, midY])
    }
    
    return midpoints
  },

  getVertexOrMidpoint(state, direction) {
    const { map } = this
    const start = Object.values(map.project(state.selectedVertexOrMidpoint || map.getCenter()))
    const pixels = [...state.vertecies, ...state.midpoints]
    console.log(start)
    console.log(pixels)
    console.log(state.vertecies)
    console.log(state.midpoints)
    // const getVertexOrMidpoint = spatialNavigate(direction, start, pixels)
  },

  onStop(state, e) {
    this.map.off('draw.selectionchange', this.selectionChangeHandler)
    state.container.removeEventListener('keydown', this.keydownHandler)
  }
}
