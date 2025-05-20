import React from 'react'
import { useApp } from '../store/use-app.js'
// import { drawTools } from '../store/constants.js'
// import Tooltip from './tooltip.jsx'

export default function Inspector () {
  const { provider, shape } = useApp()
  // const { id } = options

  // const handlePolygonSelect = (id) => {
  //   const value = drawTools.find(m => m.id === id).drawMode
  //   provider.draw.editPolygon()
  //   dispatch({ type: 'SET_MODE', payload: { value, shape: id } })
  // }

  return (
    <div className='fm-c-form'>
      {shape !== 'polygon' && (
        <div className='fm-c-form-row'>
          <div className='fm-c-form-group'>
            <label className='fm-c-form-group__label' htmlFor='coord'>
              {shape === 'circle' ? 'Centre' : 'Top left'} ({provider.srid === 27700 ? 'Easting, Northing' : 'Lat, lon'})
            </label>
            <div className='fm-c-form-group__wrapper'>
              <input className='fm-c-form-group__input' id='coord' name='coord' type='text' spellCheck='false' />
            </div>
          </div>
          <div className='fm-c-form-group fm-c-form-group--short'>
            <label className='fm-c-form-group__label' htmlFor='distance'>
              {shape === 'circle' ? 'Radius' : 'Size'} (metres)
            </label>
            <div className='fm-c-form-group__wrapper'>
              <input className='fm-c-form-group__input' id='distance' name='distance' type='text' spellCheck='false' />
            </div>
          </div>
          {/* {shape === 'square' && (
            <Tooltip id={`${id}-convert-polygon`} position='left' cssModifier='convert-polygon' text='Convert to polygon'>
              <button className='fm-c-btn-secondary' aria-expanded={false} aria-labelledby={`${id}-convert-polygon`} onClick={() => handlePolygonSelect('polygon')}>
                <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
                  <path d={drawTools.find(m => m.id === 'polygon').path} />
                </svg>
              </button>
            </Tooltip>
          )} */}
        </div>
      )}
      <div className='fm-c-form-row'>
        <div className='fm-c-form-group'>
          <span className='fm-c-form-group__label' htmlFor='top-left'>
            Area
          </span>
          <div className='fm-c-form-group__wrapper'>
            <div className='fm-c-form-group__read-only'>
              16ha
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
