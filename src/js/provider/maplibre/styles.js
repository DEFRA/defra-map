export const draw = (styleName) => {
  const fgColor = styleName === 'dark' ? '#ffffff' : '#0b0c0c'
  const bgColor = styleName === 'dark' ? '#373737' : '#ffffff'
  const hColor = styleName === 'dark' ? '#ffffff' : '#0b0c0c'

  return [
    fillActive(fgColor),
    strokeActive(fgColor),
    strokeInactive(fgColor),
    drawPreviewLine(fgColor),
    midpoint(fgColor),
    vertex(fgColor),
    vertexHalo(bgColor, hColor),
    vertexActive(fgColor),
    midpointHalo(bgColor, hColor),
    midpointActive(fgColor),
    circle(fgColor)
  ]
}

const fillActive = (fgColor) => ({
  id: 'fill-active',
  type: 'fill',
  filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
  paint: {
    'fill-color': fgColor,
    'fill-opacity': 0.1
  }
})

const strokeActive = (fgColor) => ({
  id: 'stroke-active',
  type: 'line',
  filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  },
  paint: {
    'line-color': fgColor,
    'line-width': 2,
    'line-opacity': 1
  }
})

const strokeInactive = (fgColor) => ({
  id: 'stroke-inactive',
  type: 'line',
  filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'false']],
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  },
  paint: {
    'line-color': fgColor,
    'line-width': 2,
    'line-opacity': 0.8
  }
})

const drawPreviewLine = (fgColor) => ({
  id: 'stroke-preview-line',
  type: 'line',
  filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  },
  paint: {
    'line-color': fgColor,
    'line-width': 2,
    'line-dasharray': [0.2, 2],
    'line-opacity': 1
  }
})

const midpoint = (fgColor) => ({
  id: 'midpoint',
  type: 'circle',
  filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
  paint: {
    'circle-radius': 5,
    'circle-color': fgColor
  }
})

const vertex = (fgColor) => ({
  id: 'vertex',
  type: 'circle',
  filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
  paint: {
    'circle-radius': 7,
    'circle-color': fgColor
  }
})

const vertexHalo = (bgColor, hColor) => ({
  id: 'vertex-halo',
  type: 'circle',
  filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['==', 'active', 'true']],
  paint: {
    'circle-radius': 9,
    'circle-stroke-width': 3,
    'circle-color': bgColor,
    'circle-stroke-color': hColor
  }
})

const vertexActive = (fgColor) => ({
  id: 'vertex-active',
  type: 'circle',
  filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['==', 'active', 'true']],
  paint: {
    'circle-radius': 7,
    'circle-color': fgColor
  }
})

const midpointHalo = (bgColor, hColor) => ({
  id: 'midpoint-halo',
  type: 'circle',
  filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint'], ['==', 'active', 'true']],
  paint: {
    'circle-radius': 7,
    'circle-stroke-width': 3,
    'circle-color': bgColor,
    'circle-stroke-color': hColor
  }
})

const midpointActive = (fgColor) => ({
  id: 'midpoint-active',
  type: 'circle',
  filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint'], ['==', 'active', 'true']],
  paint: {
    'circle-radius': 5,
    'circle-color': fgColor
  }
})

const circle = (fgColor) => ({
  id: 'circle',
  type: 'line',
  filter: ['==', 'id', 'circle'],
  paint: {
    'line-color': fgColor,
    'line-width': 2,
    'line-opacity': 0.8
  }
})
