import { defaults } from '../defaults.js'
import { parseColor } from '../../../../src/utils/parseColor.js'

export const buildStylesMap = (dataLayers, mapStyle) => {
  const stylesMap = {}

  if (!mapStyle) {
    return stylesMap
  }

  dataLayers.forEach(layer => {
    const base = layer.selectedFeatureStyle || defaults.selectedFeatureStyle

    stylesMap[layer.layerId] = {
      ...base,
      stroke: parseColor(base.stroke, mapStyle.id),
      fill: parseColor(base.fill, mapStyle.id),
    }
  })

  return stylesMap
}
