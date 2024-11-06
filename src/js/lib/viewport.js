import LatLon from 'geodesy/latlon-spherical.js'

export const getFocusPadding = (el, scale) => {
  let padding
  if (el) {
    const parent = el.closest('.fm-o-main').getBoundingClientRect()
    const box = el.getBoundingClientRect()
    padding = {
      top: ((box.y || box.top) - (parent.y || parent.top)) / scale,
      left: ((box.x || box.left) - (parent.x || parent.left)) / scale,
      right: (parent.width - box.width - ((box.x || box.left) - (parent.x || parent.left))) / scale,
      bottom: (parent.height - box.height - ((box.y || box.top) - (parent.y || parent.top))) / scale
    }
  }
  return padding
}

export const getFocusBounds = (el, scale) => {
  let bounds
  if (el) {
    const parent = el.closest('.fm-o-main').getBoundingClientRect()
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

export const getMapPixel = (box, scale) => {
  const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = box
  const point = [(offsetLeft + (offsetWidth / 2)) / scale, (offsetTop + (offsetHeight / 2)) / scale]
  return point
}

export const getDistance = (coord1, coord2) => {
  let distance
  if (coord1[0] > 1000) {
    const x = Math.abs(coord1[0] - coord2[0])
    const y = Math.abs(coord1[1] - coord2[1])
    const dist = Math.sqrt((Math.pow(x, 2)) + (Math.pow(y, 2)))
    distance = dist
  } else {
    const p1 = new LatLon(coord1[1], coord1[0])
    const p2 = new LatLon(coord2[1], coord2[0])
    distance = p1.distanceTo(p2)
  }
  return Math.round(distance)
}

export const getUnits = (metres) => {
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

export const getDirection = (coord1, coord2) => {
  coord1 = coord1.map(n => n > 1000 ? Math.round(n) : Math.round(n * 100000) / 100000)
  coord2 = coord2.map(n => n > 1000 ? Math.round(n) : Math.round(n * 100000) / 100000)
  const ns1 = [coord1[0], coord1[1]]
  const ns2 = [coord1[0], coord2[1]]
  const nsd = getDistance(ns1, ns2)
  const ew1 = [coord1[0], coord1[1]]
  const ew2 = [coord2[0], coord1[1]]
  const ewd = getDistance(ew1, ew2)
  const east = coord1[0] < coord2[0] && 'east'
  const west = coord1[0] > coord2[0] && 'west'
  const north = coord1[1] < coord2[1] && 'north'
  const south = coord1[1] > coord2[1] && 'south'
  const ewc = east || west
  const nsc = north || south
  const ns = nsc ? `${nsc} ${getUnits(nsd)}` : ''
  const ew = ewc ? `${ewc} ${getUnits(ewd)}` : ''
  return ns + (nsc && ewc ? ', ' : '') + ew
}

export const getArea = (bbox) => {
  const ew = getDistance([bbox[0], bbox[1]], [bbox[2], bbox[1]])
  const ns = getDistance([bbox[0], bbox[1]], [bbox[0], bbox[3]])
  return `${getUnits(ew)} by ${getUnits(ns)}`
}

export const getBoundsChange = (oCentre, oZoom, centre, zoom, bbox) => {
  const isSameCentre = JSON.stringify(oCentre) === JSON.stringify(centre)
  const isSameZoom = oZoom === zoom
  const isMove = oCentre && oZoom && !(isSameCentre && isSameZoom)
  let change
  if (isMove) {
    if (!isSameCentre && !isSameZoom) {
      change = 'New area'
    } else if (!isSameCentre) {
      change = `${getDirection(oCentre, centre)}`
    } else {
      const direction = zoom > oZoom ? 'in' : 'out'
      change = `zoomed ${direction}, showing ${getArea(bbox)}`
    }
    change = `${change}: Use ALT plus I to get new details`
  }
  return change
}

export const getDescription = (place, centre, bbox, features) => {
  const { featuresTotal, isFeaturesInMap, isPixelFeaturesAtPixel, isPixelFeaturesInMap } = features
  let text = ''

  if (featuresTotal) {
    text = `${featuresTotal} feature${featuresTotal === 1 ? '' : 's'} in this view`
  } else if (isPixelFeaturesAtPixel) {
    text = 'Data at the centre coordinate'
  } else if (isPixelFeaturesInMap) {
    text = 'No data at the centre coordinate'
  } else if (isFeaturesInMap) {
    text = 'No feature data in this area'
  } else {
    // Null
  }

  let coord
  if (centre[0] > 1000) {
    coord = `easting ${Math.round(centre[0])} long ${Math.round(centre[1])}`
  } else {
    coord = `lat ${centre[1].toFixed(4)} long ${centre[0].toFixed(4)}`
  }

  return `Approximate map centre ${place || coord}. Covering ${getArea(bbox)}. ${text}`
}

export const getStatus = (isPanZoom, isGeoLoc, place, description, direction) => {
  let status = null
  if (isPanZoom || isGeoLoc) {
    if (place) {
      status = description
    } else {
      status = direction
    }
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

export const parseCentre = value => {
  return value?.split(',').slice(0, 2).map(x => parseFloat(x))
}

export const parseZoom = value => {
  return parseFloat(value?.split(',')[2])
}

export const setBasemap = (isDarkMode) => {
  const ls = window.localStorage.getItem('basemap')
  const oColourScheme = ls?.split(',')[1]
  const oBasemap = ls?.split(',')[0]
  const colourScheme = isDarkMode ? 'dark' : 'light'
  if (colourScheme !== oColourScheme && ['default', 'dark'].includes(oBasemap)) {
    window.localStorage.removeItem('basemap')
  }
  const basemap = ls?.split(',')[0]
  const reset = isDarkMode ? 'dark' : 'default'
  return basemap || reset
}

export const getSelectedIndex = (key, total, current) => {
  const increase = current === total - 1 ? 0 : current + 1
  const decrease = current > 0 ? current - 1 : total - 1
  return key === 'PageDown' ? increase : decrease
}

export const getSelectedStatus = (featuresInViewport, index) => {
  const total = featuresInViewport.length
  const feature = index < featuresInViewport.length ? featuresInViewport[index] : null
  const status = feature && (
    `${total} feature${total !== 1 ? 's' : ''} in this view. ${feature.name}. ${index + 1} of ${total} highlighted.`
  )
  return status
}

export const getShortcutKey = (e, featuresViewport) => {
  const number = e.code.slice(-1)
  const hasFeature = featuresViewport?.features.length >= number
  const id = hasFeature ? featuresViewport.features[number - 1].id : ''
  return id
}
