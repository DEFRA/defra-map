import React from 'react'
import { showLayer } from '../api/showLayer'
import { hideLayer } from '../api/hideLayer'

export const Layers = ({ pluginState, mapProvider }) => {
  const { dispatch: pluginDispatch } = pluginState

  const handleChange = (e) => {
    const { value, checked } = e.target
    if (checked) {
      showLayer({ mapProvider, pluginDispatch }, value)
    } else {
      hideLayer({ mapProvider, pluginDispatch }, value)
    }
  }

  return (
    <div className="dm-c-data-sets-layers">
      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-visually-hidden">
            Layers
          </legend>
          <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
            {pluginState.dataSets.filter(dataSet => dataSet.showInLayers).map(dataSet => (
              <div key={dataSet.id} className="dm-c-data-sets-layers__item">
                <div className="govuk-checkboxes__item">
                  <input className="govuk-checkboxes__input" id={dataSet.id} name="layers" type="checkbox" value={dataSet.id} checked={dataSet.visibility !== 'hidden'} onChange={handleChange} />
                  <label className="dm-c-data-sets-layers__item-label govuk-label govuk-checkboxes__label" htmlFor={dataSet.id}>
                    {dataSet.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
