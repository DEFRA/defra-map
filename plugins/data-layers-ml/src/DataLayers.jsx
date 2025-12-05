import React from "react"
import { getValueForStyle } from '../../../src/utils/getValueForStyle'

export const DataLayers = ({ mapState, pluginConfig }) => {
  const { mapStyle } = mapState

  return (
    <div className="dm-c-data-layers">
      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-visually-hidden">
            Layers
          </legend>
          <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
            {pluginConfig.layers.map(layer => (
              <div key={layer.id} className="govuk-checkboxes__item">
                <input className="govuk-checkboxes__input" id={layer.id} name="layers" type="checkbox" value={layer.id} />
                <label className="govuk-label govuk-checkboxes__label" htmlFor={layer.id}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    aria-hidden='true'
                    focusable='false'
                  >
                    <rect
                      width="24"
                      height="24"
                      fill={getValueForStyle(layer.fill, mapStyle.id)}
                      stroke={getValueForStyle(layer.stroke, mapStyle.id)}
                      strokeWidth="4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {layer.label}
                  {layer.symbolDescription && (
                    <span className="govuk-visually-hidden">
                      ({getValueForStyle(layer.symbolDescription, mapStyle.id)})
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
