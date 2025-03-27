import DirectSelect from '../../../../node_modules/@mapbox/mapbox-gl-draw/src/modes/direct_select'

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

  onSetup(options) {
    const state = DirectSelect.onSetup.call(this, options)
    const { container, featureId, selectedIndex, selectedType } = options
    state.featureId = featureId
    state.selectedIndex = selectedIndex // Tracks selected vertex/midpoint
    state.selectedType = selectedType // Tracks select type vertex or midpoint
    state.vertecies = this.getVerticies(featureId) // Store vertecies
    state.midpoints = this.getMidpoints(featureId) // Store midpoints
    state.container = container

    console.log('onSetup', state)
    // Bind events as default events require map container to have focus
    this.keydownHandler = (e) => this.onKeyDown(state, e)
    container.addEventListener('keydown', this.keydownHandler)

    // Selection change event
    this.selectionChangeHandler = (e) => this.onSelectionChange(state, e)
    this.map.on('draw.selectionchange', this.selectionChangeHandler)

    // Add midpoint
    if (selectedType === 'midpoint') {
      const coords = state.midpoints[selectedIndex - state.vertecies.length]
      this.updateActiveMidpoint(coords)
    }

    return state
  },

  onSelectionChange(state, e) {
    const vertex = e.points[e.points.length - 1]
    this.map.fire('draw.vertexselected', {
      isSelected: !!vertex
    })
  },

  onKeyDown(state, e) {
    // Set selected index and type
    if (e.key === ' ' && isNaN(state.selectedIndex)) {
      this.updateVertexOrMidpoint(state)
    }

    // Move vertex
    if (!e.altKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && !isNaN(state.selectedIndex)) {
      console.log('Move point')
    }

    // Navigate points
    if (e.altKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && !isNaN(state.selectedIndex)) {
      this.updateVertexOrMidpoint(state, e.key)
    }

    // Clear selecred index and type
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
    const vertexPixels = state.vertecies.map(p => Object.values(map.project(p)))
    const midpointPixels = state.midpoints.map(p => Object.values(map.project(p)))
    const pixels = [...vertexPixels, ...midpointPixels]
    const startPixel = !isNaN(state.selectedIndex) ? pixels[state.selectedIndex] : null
    const start = startPixel || Object.values(map.project(map.getCenter()))

    const index = spatialNavigate(start, pixels, direction)

    const type = index < state.vertecies.length ? 'vertex' : 'midpoint'

    return [index, type]
  },

  updateActiveMidpoint(coordinates) {
    const { map } = this

    // Shouldn't add to layer directly but can't get this._ctx.api.add(feature) to work
    setTimeout(() => { map.getSource('mapbox-gl-draw-hot').setData({
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
    })}, 100)

    // this._ctx.api.add({
    //   type: 'Feature',
    //   properties: {
    //     meta: 'midpoint',
    //     active: 'true',
    //     id: 'active-midpoint'
    //   },
    //   geometry: {
    //     type: 'Point',
    //     coordinates
    //   }
    // })
  },

  // updateActiveVertex(state) {
  //   const { container, featureId, selectedIndex, selectedType} = state
  //   this._ctx.api.changeMode('edit_vertex', {
  //     container,
  //     featureId,
  //     selectedIndex,
  //     selectedType,
  //     coordPath: `0.${selectedIndex}`
  //   })
  // },

  updateVertexOrMidpoint(state, direction) {
    const { container, featureId } = state
    const [ index, type ] = this.getVertexOrMidpoint(state, direction)
    // state.selectedIndex = index
    // state.selectedType = type

    console.log('updateVertexOrMidpoint', index, type)
 
    this._ctx.api.changeMode('edit_vertex', {
      container,
      featureId,
      selectedIndex: index,
      selectedType: type,
      ...(type === 'vertex' ? { coordPath: `0.${index}` } : {})
      // coordPath: `0.${index}`
    })

    // Cause new onSetup which wipes the vertex

    // if (type === 'midpoint') {
    //   const coords = state.midpoints[index - state.vertecies.length]
    //   this.updateActiveMidpoint(coords)
    // }

    // if (type === 'vertex') {
    //   this.updateActiveVertex(state)
    // } else {
    //   const coords = state.midpoints[index - state.vertecies.length]
    //   this.updateActiveMidpoint(coords)
    // }
  },

  onStop(state, e) {
    this.map.off('draw.selectionchange', this.selectionChangeHandler)
    state.container.removeEventListener('keydown', this.keydownHandler)
  }
}
