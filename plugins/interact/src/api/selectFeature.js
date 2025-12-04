/**
 * Programmatically select a feature
 * @param {object} context - plugin context
 * @param {object} featureInfo - { featureId, layerId, idProperty }
 */
export const selectFeature = ({ services }, { featureId, layerId, idProperty }) => {
  services.eventBus.emit('interact:selectFeature', {
		featureId,
		layerId,
		idProperty
	})
}
