import { getQueryParam, hasQueryParam } from './utils'
import { settings } from '../store/constants'

export const parseSegments = (dataSegments, seg) => {
  if (!dataSegments) return

  const queryParams = new URLSearchParams(window.location.search)
  seg = seg || queryParams.get('seg')?.split(',')

  const segments = []

  for (let i = 0; i < dataSegments.length; i++) {
    const g = dataSegments[i]
    const hasParent = !!g.parentIds?.length
    const hasActiveParent = g.parentIds?.some(p => segments.includes(p))
    const q = g.items.find(s => seg?.includes(s?.id))?.id
    const c = g.items.find(l => l.isSelected)?.id || g.items[0]?.id
    if (!(hasParent && !hasActiveParent)) {
      segments.push(q || c)
    }
  }

  return segments
}

export const parseLayers = (dataLayers, dataSegments, seg) => {
  if (!dataLayers) return

  const queryParams = new URLSearchParams(window.location.search)
  seg = seg || parseSegments(dataSegments)
  const lyr = queryParams.get('lyr')?.split(',') || []

  let layers = []

  for (let i = 0; i < dataLayers.length; i++) {
    const g = dataLayers[i]
    const c = g.items.filter(l => l.id && l.isSelected).map(l => l.id)
    const q = g.items.filter(l => lyr.includes(l.id)).map(l => l.id)
    layers = layers.concat(queryParams.has('lyr') ? q : c)
  }

  return [...new Set(layers)]
}

export const parseGroups = (data, segments, layers, zoom, hasInputs, queryLabel) => {
  // Filter groups
  let groups = data.filter(g =>
  // Only groups that are within zoom
    (g.minZoom ? g.minZoom <= zoom : g && g.maxZoom ? g.maxZoom > zoom : g) &&
        // Only groups that have an active parent
        (g.parentIds ? g.parentIds.some(i => segments.includes(i)) : g)
  )

  // Flatten groups and items and remove non-checked items for use in key
  if (!hasInputs) {
    const ramps = []
    let flatItems = []
    groups.forEach(g => {
      const checkedRadioId = g.items.find(item => layers.includes(item.id))?.id
      g.items.forEach(item => {
        const isChecked = g?.type === 'radio' ? item.id === checkedRadioId : layers.includes(item.id)
        const isVisible = isChecked || !item.id
        if (!(isVisible && (item.fill || item.icon || item.items?.length))) return
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
  targetMarkerQuery = targetMarkerQuery?.length === 3
    ? {
        coord: [parseFloat(targetMarkerQuery[0]), parseFloat(targetMarkerQuery[1])],
        hasData: targetMarkerQuery[2] === 'true'
      }
    : null

  const targetMarker = targetMarkerQuery || (!info?.featureId && info?.markerCoord
    ? {
        coord: info?.markerCoord,
        hasData: info?.hasData
      }
    : null)

  return {
    featureId,
    targetMarker
  }
}
