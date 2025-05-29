import React from 'react'
import { useApp } from '../store/use-app.js'
import { tools as defaultTools } from '../store/constants.js'
import ActionMenu from './action-menu.jsx'

export default function DrawShape () {
  const { options, draw, shape, drawTools } = useApp()
  const { id } = options
  const selectedDrawMode = drawTools.find(m => m.id === shape) || drawTools[0]

  // Tools displayed in the legend instead
  if (!draw || draw?.heading) {
    return null
  }

  const handleShapeSelect = (id) => {
    console.log(id)
  }

  return (
    <ActionMenu
      id={id}
      path='M11.298 4.666l3.536 3.536-7.071 7.071-3.536-3.536 7.071-7.071zm2.475-2.475a1.5 1.5 0 0 1 2.121 0l1.415 1.415a1.5 1.5 0 0 1 0 2.121l-1.768 1.768-3.536-3.536 1.768-1.768zM3.52 12.444l3.536 3.536-5.304 1.768 1.768-5.304z'
      name='Draw tools'
      tooltipPosition='left'
      menuPosition='above-right'
      hasLabel={false}
      display='block'
      items={[...drawTools, ...defaultTools]}
      selected={selectedDrawMode}
      handleSelect={handleShapeSelect}
      />
  )
}
