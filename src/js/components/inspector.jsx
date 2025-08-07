import React from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'
// import { drawTools } from '../store/constants.js'
// import Tooltip from './tooltip.jsx'

export default function Inspector () {
  const { provider, shape } = useApp()
  const { dimensions } = useViewport()
  // const { id } = options

  // const handlePolygonSelect = (id) => {
  //   const value = drawTools.find(m => m.id === id).drawMode
  //   provider.draw.editPolygon()
  //   dispatch({ type: 'SET_MODE', payload: { value, shape: id } })
  // }

  return (
    <div className='fm-c-form'>
      <div className='fm-c-form-row'>
        <div className='fm-c-form-group'>
          <span className='fm-c-form-group__label' htmlFor='top-left'>
            Area
          </span>
          <div className='fm-c-form-group__wrapper'>
            <div className='fm-c-form-group__read-only'>
              {dimensions?.areaDisplay || '-'}
            </div>
          </div>
        </div>
        {['circle', 'square'].includes(shape) && (
        <div className='fm-c-form-group'>
          <span className='fm-c-form-group__label' htmlFor='top-left'>
            {shape === 'circle' ? 'Radius' : 'Side'}
          </span>
          <div className='fm-c-form-group__wrapper'>
            <div className='fm-c-form-group__read-only'>
              {shape === 'circle' ? dimensions?.radiusDisplay || '-' : ''}
              {shape === 'square' ? dimensions?.widthDisplay || '-' : ''}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}