import { getQueryParam, hasQueryParam } from './utils'
import { settings } from '../store/constants'

export const parseSegments = (dataSegments, seg) => {
  let segments = null
  if (dataSegments) {
    const queryParams = new URLSearchParams(window.location.search)
    if (!seg) {
      seg = queryParams.get('seg')?.split(',')
    }
    segments = []
    for (const g of dataSegments) {
      const hasParent = !!g.parentIds?.length
      const hasActiveParent = g.parentIds?.some(p => segments.includes(p))
      const q = g.items.find(s => seg?.includes(s?.id))?.id
      const c = g.items.find(l => l.isSelected)?.id || g.items[0]?.id
      if (!(hasParent && !hasActiveParent)) {
        segments.push(q || c)
      }
    }
  }
  return segments
}

export const parseLayers = (dataLayers) => {
  let layers = null
  if (dataLayers) {
    const queryParams = new URLSearchParams(window.location.search)
    const lyr = queryParams.get('lyr')?.split(',') || []
    layers = []
    for (const g of dataLayers) {
      const c = g.items.filter(l => l.id && l.isSelected).map(l => l.id)
      const q = g.items.filter(l => lyr.includes(l.id)).map(l => l.id)
      layers = layers.concat(queryParams.has('lyr') ? q : c)
    }
    layers = [...new Set(layers)]
  }
  return layers
}

export const parseGroups = (data, segments, layers, zoom, hasInputs, queryLabel) => {
  // Filter groups
  let groups = data.filter(g => {
    const hasValidParent = !g.parentIds || g.parentIds.some(i => segments.includes(i))
    const isValidMinZoom = !g.minZoom || g.minZoom <= zoom
    const isValidMaxZoom = !g.maxZoom || g.maxZoom > zoom
    return hasValidParent && isValidMinZoom && isValidMaxZoom
  })

  // Flatten groups and items and remove non-checked items for use in key
  if (!hasInputs) {
    const ramps = []
    let flatItems = []
    groups.forEach(g => {
      const checkedRadioId = g.items.find(item => layers.includes(item.id))?.id
      g.items.forEach(item => {
        const isChecked = g?.type === 'radio' ? item.id === checkedRadioId : layers.includes(item.id)
        const isVisible = isChecked || !item.id
        if (!(isVisible && (item.fill || item.icon || item.items?.length))) {
          return
        }
        if (item.display === 'ramp') {
          ramps.push(item)
        } else if (item.items) {
          flatItems = flatItems.concat(item.items)
        } else {
          flatItems.push(item)
        }
      })
    })

    // Add query polygon
    if (queryLabel) {
      flatItems.push({
        display: 'query-polygon',
        label: queryLabel
      })
    }

    groups = ramps.concat([{ items: flatItems }]).filter(g => g.items.length)
  }

  return groups
}

export const parseQuery = (info) => {
  // Move to utils
  const featureIdParam = settings.params.featureId
  const featureId = hasQueryParam(featureIdParam) ? getQueryParam(featureIdParam) : info?.featureId

  const targetMarkerParam = settings.params.targetMarker
  let targetMarkerQuery = getQueryParam(targetMarkerParam)?.split(',')
  targetMarkerQuery = (targetMarkerQuery?.length === 3) && {
    coord: [parseFloat(targetMarkerQuery[0]), parseFloat(targetMarkerQuery[1])],
    hasData: targetMarkerQuery[2] === 'true'
  }

  const targetMarker = targetMarkerQuery || (!info?.featureId && info?.markerCoord && {
    coord: info?.markerCoord,
    hasData: info?.hasData
  })

  return {
    featureId,
    targetMarker
  }
}
