/**
 * Programmatically select a feature
 * @param {object} context - plugin context
 * @param {object} featureInfo - { featureId, dataLayerId, idProperty }
 * @param {boolean} [multiSelect=false] - whether to add to existing selection
 */
export const selectFeature = (
  { pluginConfig, pluginState },
  { featureId, dataLayerId, idProperty }
) => {
  console.log('Select feature to follow')
}
