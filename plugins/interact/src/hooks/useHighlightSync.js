import { useEffect, useMemo } from 'react'
import { buildStylesMap } from '../utils/buildStylesMap.js'

export const useHighlightSync = ({
  mapProvider,
  mapStyle,
  dataLayers,
  selectedFeatures,
  dispatch,
  eventBus
}) => {
  // Memoize stylesMap so it only recalculates when style or layers change
  const stylesMap = useMemo(() => {
    if (!mapStyle) {
      return null
    }
    return buildStylesMap(dataLayers, mapStyle)
  }, [dataLayers, mapStyle])

  // Force re-application of all selected features
  const updateHighlightedFeatures = () => {
    const bounds = mapProvider.updateHighlightedFeatures(selectedFeatures, stylesMap)

    dispatch({
      type: 'UPDATE_SELECTED_BOUNDS',
      payload: bounds
    })
  }

  useEffect(() => {
    if (!mapProvider || !selectedFeatures || !stylesMap) {
      return
    }

    // Update updateHighlightedFeatures on interaction
    updateHighlightedFeatures()

    // Update updateHighlightedFeatures on stylechange
    eventBus.on('map:datachange', updateHighlightedFeatures)

    return () => {
      eventBus.off('map:datachange', updateHighlightedFeatures)
    }
  }, [selectedFeatures, mapProvider, stylesMap])
}