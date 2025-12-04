/**
 * Programmatically unselect a feature
 * @param {object} context - plugin context
 * @param {object} featureInfo - { featureId, layerId, idProperty }
 */
export const unselectFeature = ({ services }, { featureId, layerId, idProperty }) => {
  services.eventBus.emit('interact:unselectFeature', {
		featureId,
		layerId,
		idProperty
	})
}