import React from 'react'

export const Layers = ({ pluginConfig }) => {

  return (
    <div className="dm-c-data-sets-layers">
      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-visually-hidden">
            Layers
          </legend>
          <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
            {pluginConfig.layers.map(layer => (
              <div key={layer.id} className="dm-c-data-stes-layers__item">
                {layer.showInLayers && (
                  <div className="govuk-checkboxes__item">
                    <input className="govuk-checkboxes__input" id={layer.id} name="layers" type="checkbox" value={layer.id} />
                    <label className="dm-c-data-sets-layers__item-label govuk-label govuk-checkboxes__label" htmlFor={layer.id}>
                      {layer.label}
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
