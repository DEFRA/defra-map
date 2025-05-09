import React from 'react'
import { useApp } from '../store/use-app.js'
import { drawModes } from '../store/constants.js'

export default function Dimensions () {
  const { provider, dispatch, shape } = useApp()

  const handlePolygonSelect = (id) => {
    const value = drawModes.find(m => m.id === id).mode
    provider.draw.editPolygon()
    dispatch({ type: 'SET_MODE', payload: { value, shape: id } })
  }

  return (
    <div className='fm-c-dimensions'>
      {shape === 'square' && (

        <button className='fm-c-btn-secondary' onClick={() => handlePolygonSelect('polygon')}>
          <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
            <path d={drawModes.find(m => m.id === 'polygon').path} />
          </svg>
          <span className='fm-c-btn__label'>Convert to polygon</span>
        </button>

      // <div className='fm-c-menu'>
      //   <div className='fm-c-menu__group'>
      //     <div className='fm-c-menu__item'>
      //       <button className='fm-c-btn-menu' onClick={() => handlePolygonSelect('polygon')}>
      //         <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
      //           <path d={drawModes.find(m => m.id === 'polygon').path} />
      //         </svg>
      //         <span className='fm-c-btn__label'>Convert to polygon</span>
      //       </button>
      //     </div>
      //   </div>
      // </div>
      )}
    </div>
  )
}
