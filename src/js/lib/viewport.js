import { distance as turfDistance } from '@turf/distance'
import { point as TurfPoint } from '@turf/helpers'
import { defaults } from '../store/constants'

const getBearing = (coord1, coord2) => {
  const east = coord1[0] < coord2[0] && 'east'
  const west = coord1[0] > coord2[0] && 'west'
  const north = coord1[1] < coord2[1] && 'north'
  const south = coord1[1] > coord2[1] && 'south'
  return [east, west, north, south].filter(b => b && typeof b === 'string')
}

const getDistance = (coord1, coord2) => {
  let distance
  if (coord1[0] > 1000) {
    const x = Math.abs(coord1[0] - coord2[0])
    const y = Math.abs(coord1[1] - coord2[1])
    const dist = Math.sqrt((Math.pow(x, 2)) + (Math.pow(y, 2)))
    distance = dist
  } else {
    const p1 = new TurfPoint(coord1)
    const p2 = new TurfPoint(coord2)
    distance = turfDistance(p1, p2, { units: 'metres' })
  }
  return Math.round(distance)
}

const getUnits = (metres) => {
  const MAX_METRES = 800
  const MAX_MILES = 5000
  const RATIO = 0.621371
  let units
  if (metres < MAX_METRES) {
    units = `${metres} metres`
  } else if (metres < MAX_MILES) {
    units = (metres / 1000 * RATIO).toFixed(1) + ' miles'
  } else {
    units = Math.round((metres / 1000) * RATIO) + ' miles'
  }
  return units
}

const getDirection = (coord1, coord2) => {
  coord1 = coord1.map(n => n > 1000 ? Math.round(n) : Math.round(n * 100000) / 100000)
  coord2 = coord2.map(n => n > 1000 ? Math.round(n) : Math.round(n * 100000) / 100000)
  const ns1 = [coord1[0], coord1[1]]
  const ns2 = [coord1[0], coord2[1]]
  const ew1 = [coord1[0], coord1[1]]
  const ew2 = [coord2[0], coord1[1]]
  const nsd = getDistance(ns1, ns2)
  const ewd = getDistance(ew1, ew2)
  const bearing = getBearing(coord1, coord2)
  const ewc = bearing.filter(b => ['east', 'west'].includes(b)).join('')
  const nsc = bearing.filter(b => ['north', 'south'].includes(b)).join('')
  const ew = ewc ? `${ewc} ${getUnits(ewd)}` : ''
  const ns = nsc ? `${nsc} ${getUnits(nsd)}` : ''
  return ns + (ewc && nsc ? ', ' : '') + ew
}

const getArea = (bounds) => {
  const ew = getDistance([bounds[0], bounds[1]], [bounds[2], bounds[1]])
  const ns = getDistance([bounds[0], bounds[1]], [bounds[0], bounds[3]])
  return `${getUnits(ew)} by ${getUnits(ns)}`
}

const getBoundsChange = (oCentre, oZoom, center, zoom, bounds) => {
  const isSameCentre = JSON.stringify(oCentre) === JSON.stringify(center)
  const isSameZoom = oZoom === zoom
  const isMove = oCentre && oZoom && !(isSameCentre && isSameZoom)
  let change
  if (isMove) {
    if (!isSameCentre && !isSameZoom) {
      change = 'New area'
    } else if (!isSameCentre) {
      change = `${getDirection(oCentre, center)}`
    } else {
      const direction = zoom > oZoom ? 'in' : 'out'
      change = `zoomed ${direction}, focus area covering ${getArea(bounds)}`
    }
    change = `${change}`
  }
  return change
}

const getSelectedStatus = (featuresInViewport, id) => {
  const total = featuresInViewport.length
  const index = featuresInViewport.findIndex(f => f.id === id)
  return index >= 0 && `${total} feature${total !== 1 ? 's' : ''} in this area. ${featuresInViewport[index].name}. ${index + 1} of ${total} highlighted.`
}

const getOffsetBoundingClientRect = (el) => {
  const offsetParent = el.closest('[data-fm-main]') || document.body
  return offsetParent.getBoundingClientRect()
}

export const getFocusPadding = (el, scale) => {
  let padding
  if (el) {
    const parent = getOffsetBoundingClientRect(el)
    const box = el.getBoundingClientRect()
    const boxX = box.x || box.left
    const boxY = box.y || box.top
    const parentX = parent.x || parent.left
    const parentY = parent.y || parent.top
    padding = {
      top: (boxY - parentY) / scale,
      left: (boxX - parentX) / scale,
      right: (parent.width - box.width - (boxX - parentX)) / scale,
      bottom: (parent.height - box.height - (boxY - parentY)) / scale
    }
  }
  // Addresses repid browser resizing
  const isValid = Object.values(padding).every(i => i >= 0)
  return isValid && padding
}

export const getFocusBounds = (el, scale) => {
  let bounds
  if (el) {
    const parent = getOffsetBoundingClientRect(el)
    const box = el.getBoundingClientRect()
    const m = 10
    bounds = [[
      ((box.x || box.left) - (parent.x || parent.left) + m) / scale,
      (((box.y || box.top) - (parent.y || parent.top)) + box.height - m) / scale
    ], [
      (box.width + ((box.x || box.left) - (parent.x || parent.left)) - m) / scale,
      ((box.y || box.top) - (parent.y || parent.top) + m) / scale
    ]]
  }
  return bounds
}

export const getMapPixel = (el, scale) => {
  const parent = getOffsetBoundingClientRect(el)
  const box = el.getBoundingClientRect()
  const left = ((box.x || box.left) - (parent.x || parent.left)) / scale
  const top = ((box.y || box.top) - (parent.y || parent.top)) / scale
  const offsetLeft = (box.width / 2) / scale
  const offsetTop = (box.height / 2) / scale
  const point = [left + offsetLeft, top + offsetTop]
  return point
}

export const getDescription = (place, center, bounds, features) => {
  const { featuresTotal, isFeaturesInMap, isPixelFeaturesAtPixel, isPixelFeaturesInMap } = features || {}
  let text = ''

  if (featuresTotal) {
    text = `${featuresTotal} feature${featuresTotal === 1 ? '' : 's'} in this area`
  } else if (isPixelFeaturesAtPixel) {
    text = 'Data visible at the center coordinate'
  } else if (isPixelFeaturesInMap) {
    text = 'No data visible at the center coordinate'
  } else if (isFeaturesInMap) {
    text = 'No feature data in this area'
  } else {
    // Null
  }

  let coord
  if (center[0] > 1000) {
    coord = `easting ${Math.round(center[0])} long ${Math.round(center[1])}`
  } else {
    coord = `lat ${center[1].toFixed(4)} long ${center[0].toFixed(4)}`
  }

  return `Focus area approximate center ${place || coord}. Covering ${getArea(bounds)}. ${text}`
}

export const getStatus = (action, isPanZoom, place, state, current) => {
  const { center, bounds, zoom, features, label, selectedId } = current
  let status = null
  if (selectedId) {
    const selected = getSelectedStatus(features?.featuresInViewport, selectedId)
    status = selected
  } else if (action === 'DATA') {
    status = 'Map change: new data. Use ALT plus I to get new details'
  } else if (isPanZoom || action === 'GEOLOC') {
    const description = getDescription(place, center, bounds, features)
    const direction = getBoundsChange(state.center, state.zoom, center, zoom, bounds)
    status = place ? description : `${direction}. Use ALT plus I to get new details`
  } else if (label) {
    status = label
  } else {
    status = ''
  }
  return status
}

export const getPlace = (isUserInitiated, action, oPlace, newPlace) => {
  let place
  if (!isUserInitiated) {
    if (action === 'RESET') {
      place = oPlace
    } else {
      place = newPlace
    }
  }
  return place
}

export const parseCentre = (value, srid) => {
  const mb = defaults[srid].MAX_BOUNDS
  let isInRange
  let coords = value?.split(',')
  // Query string formed correctly
  if (!(Array.isArray(coords) && coords?.length === 3)) {
    return null
  }
  // Coords are numbers
  coords = coords.slice(0, 2).map(x => parseFloat(x))
  coords = !coords.some(isNaN) && coords
  if (!coords) {
    return null
  }
  // Coords are within the valid range
  if (srid === '27700') {
    isInRange = !!coords.filter(c => c >= 0).length
  } else {
    isInRange = (coords[0] > mb[0] && coords[0] < mb[2]) && (coords[1] > mb[1] && coords[1] < mb[3])
  }
  return isInRange ? coords : null
}

export const parseZoom = value => {
  const coords = value?.split(',')
  if (!(Array.isArray(coords) && coords?.length === 3)) {
    return null
  }
  const zoom = parseFloat(coords[2])
  return !zoom.isNaN ? zoom : null
}

export const getShortcutKey = (e, featuresViewport) => {
  const number = e.code.slice(-1)
  const hasFeature = featuresViewport.length >= number
  const id = hasFeature ? featuresViewport[number - 1].id : ''
  return id
}

export const isFeatureSquare = (feature) => {
  const coords = feature.geometry.coordinates
  const flatCoords = Array.from(new Set(coords.flat(2)))
  return flatCoords.length === 4
}

export const spatialNavigate = (direction, start, pixels) => {
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
    } else {
      isQuadrant = p[0] > start[0] && offsetY < offsetX
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

export const getScale = (size) => {
  return { small: 1, medium: 1.5, large: 2 }[size] || 1
}

export const getPoint = (el, e, scale) => {
  const { left, top } = el.getBoundingClientRect()
  const { clientX, clientY } = e.nativeEvent
  const x = clientX - left
  const y = clientY - top
  return [x / scale, y / scale]
}

export const getBasemap = (styles = []) => {
  const validStyles = styles.filter(s => defaults.STYLES.includes(s.name))
  const localBasemap = window.localStorage.getItem('basemap')
  const style = validStyles.find(s => s.name === localBasemap)
  return style?.name || 'default'
}

export const getStyle = (styles, basemap) => {
  return styles?.find(s => s.name === basemap)
}
