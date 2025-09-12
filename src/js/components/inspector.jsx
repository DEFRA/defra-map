import React from 'react'
import { useApp } from '../store/use-app.js'
import { useViewport } from '../store/use-viewport.js'

export default function Inspector () {
  const { shape } = useApp()
  const { dimensions } = useViewport()

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
