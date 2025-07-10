import React, { useEffect, useState } from 'react'
import { useApp } from '../store/use-app.js'

export default function EditVertex ({ setIsUpdateDisabled }) {
  const { provider, drawMode, query, interfaceType } = useApp()
  const [vertexButtonAction, setVertexButtonAction ] = useState(query ? 'delete' : 'add')
  const [vertexSelectedIndex, setVertexSelectedIndex] = useState(null)
  const [numVertecies, setNumVertecies ] = useState(null)

  const hasInclusiveDraw = provider.capabilities?.hasInclusiveDraw
  const isEditVertexVisible = hasInclusiveDraw && drawMode === 'vertex' && (interfaceType === 'touch' || vertexButtonAction === 'delete')
  const isEditVertexDisabled = vertexButtonAction === 'delete' && (vertexSelectedIndex < 0 || numVertecies < 4)

  const handleDrawEvent = e => {
    const { action } = e.detail
    if (['add', 'delete'].includes(action)) {
      const feature = e.detail.feature
      const numCoords = feature?.type === 'Polygon' ? feature?.coordinates[0].length : -1
      setVertexButtonAction(e.detail.action)
      setNumVertecies(numCoords)      
    }
    if (action === 'change') {
      setNumVertecies(e.detail.numVertecies) 
    }
    if (action === 'select') {
      setVertexSelectedIndex(e.detail.selectedIndex)
    }
  }

  useEffect(() => {
    setIsUpdateDisabled(drawMode === 'vertex' && numVertecies < 3)
  }, [numVertecies])

  useEffect(() => {
    provider.addEventListener('draw', handleDrawEvent)
  }, [])

  return (
    <>
      {hasInclusiveDraw && (
        <button className='fm-c-btn-primary' {...!isEditVertexVisible && { style: { display: 'none' } }} aria-disabled={isEditVertexDisabled} data-vertex-button={true}>
          <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
            <circle cx='10' cy='10' r='8.5' strokeWidth='2' fill='none' stroke='currentColor'/>
            <g strokeWidth='2' stroke='currentColor' {...vertexButtonAction === 'delete' && { transform: 'rotate(45 10 10)' }}>
              <line x1='10' y1='6' x2='10' y2='14' />
              <line x1='6' y1='10' x2='14' y2='10' />
            </g>
          </svg>
          <span>{`${vertexButtonAction === 'delete' ? 'Delete point' : 'Add point'}`}</span>
        </button>
      )}
    </>
  )
}
