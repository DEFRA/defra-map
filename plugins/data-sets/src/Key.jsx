import React from "react"
import { getValueForStyle } from '../../../src/utils/getValueForStyle'

export const Key = ({ mapState, pluginConfig }) => {
  const { mapStyle } = mapState

  const itemSymbol = (layer) => (
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
  )

  return (
    <div className="dm-c-data-sets-key">
      {pluginConfig.layers.map(layer => (
        <div key={layer.id} className="dm-c-data-sets-key__item">
          {layer.showInKey && (
            <div className="dm-c-data-sets-key__item-label">
              {itemSymbol(layer)}
              {layer.label}
              {layer.symbolDescription && (
                <span className="govuk-visually-hidden">
                  ({getValueForStyle(layer.symbolDescription, mapStyle.id)})
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
