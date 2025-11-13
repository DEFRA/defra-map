import { useEffect, useMemo } from 'react'
import { buildStylesMap } from '../utils/buildStylesMap.js'

const areBoundsEqual = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return a === b
  }
}

export const useHighlightSync = ({
  mapProvider,
  mapStyle,
  dataLayers,
  selectedFeatures,
  selectionBounds,
  dispatch,
}) => {
  // Memoize stylesMap so it only recalculates when style or layers change
  const stylesMap = useMemo(() => {
    if (!mapStyle) {
      return null
    }
    return buildStylesMap(dataLayers, mapStyle)
  }, [dataLayers, mapStyle])

  useEffect(() => {
    if (!mapProvider || !selectedFeatures || !stylesMap) {
      return
    }

    // Force re-application of all selected features
    const bounds = mapProvider.updateHighlightedFeatures(selectedFeatures, stylesMap)

    if (!areBoundsEqual(bounds, selectionBounds)) {
      dispatch({
        type: 'UPDATE_SELECTED_BOUNDS',
        payload: { bounds }
      })
    }
  }, [selectedFeatures, mapProvider, stylesMap])
}