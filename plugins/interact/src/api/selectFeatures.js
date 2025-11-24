/**
 * Programmatically select a feature
 * @param {object} context - plugin context
 * @param {object} featureInfo - { featureId, layerId, idProperty }
 * @param {boolean} [multiSelect=false] - whether to add to existing selection
 */
export const selectFeatures = ({ services }, { featureId, layerId, idProperty, addToExisting }) => {
  services.eventBus.emit('interact:selectFeatures', {
		featureId,
		layerId,
		idProperty,
    addToExisting
	})
}
