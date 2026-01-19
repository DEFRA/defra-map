import React from "react"
import { getValueForStyle } from '../../../../src/utils/getValueForStyle'

export const Key = ({ mapState, pluginState }) => {
  const { mapStyle } = mapState

  const itemSymbol = (dataSet) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      viewBox='0 0 20 20'
      aria-hidden='true'
      focusable='false'
    >
      {dataSet.keySymbolShape === 'line' ? (
        <line
          x1={dataSet.strokeWidth / 2}
          y1="10"
          x2={20 - dataSet.strokeWidth / 2}
          y2="10"
          stroke={getValueForStyle(dataSet.stroke, mapStyle.id)}
          strokeWidth={dataSet.strokeWidth}
          strokeLinecap="round"
        />
      ) : (
        <rect
          x={dataSet.strokeWidth / 2}
          y={dataSet.strokeWidth / 2}
          width={20 - dataSet.strokeWidth}
          height={20 - dataSet.strokeWidth}
          rx={dataSet.strokeWidth}
          ry={dataSet.strokeWidth}
          fill={getValueForStyle(dataSet.fill, mapStyle.id)}
          stroke={getValueForStyle(dataSet.stroke, mapStyle.id)}
          strokeWidth={dataSet.strokeWidth}
          strokeLinejoin="round"
        />
      )}
    </svg>
  )

  return (
    <div className="dm-c-data-sets-key">
      {pluginState.dataSets.filter(dataSet => dataSet.showInKey && dataSet.visibility !== 'hidden').map(dataSet => (
        <div key={dataSet.id} className="dm-c-data-sets-key__item">
          <div className="dm-c-data-sets-key__item-label">
            {itemSymbol(dataSet)}
            {dataSet.label}
            {dataSet.symbolDescription && (
              <span className="govuk-visually-hidden">
                ({getValueForStyle(dataSet.symbolDescription, mapStyle.id)})
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
