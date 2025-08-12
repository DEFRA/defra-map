import React from 'react'
import { useViewport } from '../store/use-viewport.js'
import { squareMetresToKm } from '../lib/viewport.js'

export default function DrawConstraint () {
  const { isDrawValid, dimensions, drawMaxArea } = useViewport()
  const message = `Current area ${dimensions?.areaDisplay || '0m²'} (Max ${squareMetresToKm(drawMaxArea)})`

  console.log(isDrawValid, dimensions?.areaDisplay <= 0)
  return (
    <div className={`${isDrawValid || dimensions?.area <= 0 ? 'fm-u-visually-hidden' : 'fm-c-panel fm-c-panel--draw-constraint'}`} role='status'>
      {dimensions?.area > 0 && (
        <>
          <svg width='20' height='20' viewBox='0 0 20 20'>
            <circle cx='10' cy='10' r='8.5' fill='none' stroke='currentColor' strokeWidth='1.5'/>
            <path d='M8.584 5.228h2.832v2.174L10.869 11H9.118l-.534-3.598V5.228zm.098 7.207h2.643v2.337H8.682v-2.337z' fill='currentColor'/>
          </svg>
          <span className='fm-u-visually-hidden'>Warning: </span>
          <span {...({ dangerouslySetInnerHTML: { __html: message } })} />
        </>
      )}
    </div>
  )
}