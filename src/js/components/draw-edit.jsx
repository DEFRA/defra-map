import React from 'react'
import { useApp } from '../store/use-app'
import Tooltip from './tooltip.jsx'
import Dropdown from './dropdown.jsx'

export default function DrawEdit () {
  const { provider, options, mode, dispatch } = useApp()
  const { id } = options
  const isQueryMode = ['frame', 'draw'].includes(mode)
  // const hasDrawCapability = provider.capabilities?.hasDraw
  const changeShapeDisplay = 'block'

  const items = [{
    name: 'Circle',
    path: 'M9.999 2c4.415 0 8.001 3.585 8.001 8.001s-3.585 7.999-8.001 7.999S2 14.416 2 10 5.583 2 9.999 2zm0 2C6.688 3.999 4 6.689 4 10s2.688 5.999 5.999 5.999S16 13.311 16 10s-2.69-6.001-6.001-6.001z'
  }, {
    name: 'Square',
    path: 'M18.002 18H2.001V2h16.001v16zM16.001 4H4.002v12h11.999V4z'
  }, {
    name: 'Custom',
    path: 'M2.98 6h-.919V2H5.98v1h8.041V2h3.919v4h-.96v7.996h.96v4h-3.919V17H5.98v1H2.061v-4h.919V6zm3-1v1h-1v8h1v1h8.041v-1.004h.959V6h-.959V5H5.98z'
  }]

  const shape = items[mode === 'draw' ? 2 : 1]

  if (!isQueryMode) {
    return null
  }

  const handleShapeSelect = (index) => {
    const shapeName = items[index].name.toLowerCase()
    const value = shapeName === 'custom' ? 'draw' : 'frame'
    if (value === 'draw') {
      provider.draw.edit()
    } else {
      provider.draw.reset()
    }
    dispatch({ type: 'SET_MODE', payload: { value, shape: shapeName } })
  }

  const handleDeleteVertexClick = () => {
    console.log('handleDeleteVertexClick')
  }

  return (
    <div className='fm-o-viewport-controls'>
      <Dropdown id={id} name='Change shape' display={changeShapeDisplay} items={items} selected={shape} handleSelect={handleShapeSelect} />
      <Tooltip id={`${id}-delete-vertex-label`} position='below' cssModifier='delete-vertex' text='Delete point' display='none'>
        <button onClick={handleDeleteVertexClick} className='fm-c-btn fm-c-btn--edit' aria-labelledby={`${id}-delete-vertex-label`} aria-disabled='true'>
          <svg aria-hidden='true' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd'>
            <path d='M15.985 6v7.048M12.993 16h-6.98M4.02 13.996V6m1.994-2h7.977' stroke='currentColor' strokeWidth='2' />
            <path d='M2 2h3.988v4H2zm0 12h3.988v4H2zM14.016 2h3.988v4h-3.988z' fill='currentColor' />
            <g fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M12.521 12.548l6.98 7' />
              <path d='M12.521 19.548l6.98-7' />
            </g>
          </svg>
        </button>
      </Tooltip>
    </div>
  )
}
