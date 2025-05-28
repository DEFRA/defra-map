import React from 'react'
import { useApp } from '../store/use-app.js'
import { tools as defaultTools } from '../store/constants.js'
import ActionMenu from './action-menu.jsx'

export default function DrawShape () {
  const { options, shape, drawTools } = useApp()
  const { id } = options
  const selectedDrawMode = drawTools.find(m => m.id === shape) || drawTools[0]

  const handleShapeSelect = (id) => {
    console.log(id)
  }

  return (
    <ActionMenu id={id} name='Draw tools' display='block' items={[...drawTools, ...defaultTools]} selected={selectedDrawMode} handleSelect={handleShapeSelect} />
  )
}
