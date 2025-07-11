import React, { useEffect, useState } from 'react'
import { useApp } from '../store/use-app.js'

export default function EditVertex ({ setIsUpdateDisabled }) {
  const { provider, drawMode, query, interfaceType } = useApp()
  const [vertexButtonAction, setVertexButtonAction ] = useState(query ? 'delete' : 'add')
  const [selectedVertexIndex, setSelectedVertexIndex] = useState(null)
  const [numVertecies, setNumVertecies ] = useState(null)

  const hasInclusiveDraw = provider.capabilities?.hasInclusiveDraw
  const isEditVertexVisible = hasInclusiveDraw && drawMode === 'vertex' && (interfaceType === 'touch' || vertexButtonAction === 'delete')
  const isEditVertexDisabled = vertexButtonAction === 'delete' && (selectedVertexIndex < 0 || numVertecies < 4)

  const handleDrawEvent = e => {
    const { action } = e.detail
    if (['add', 'delete'].includes(action)) {
      const { feature } = e.detail
      const numCoords = feature?.type === 'Polygon' ? feature?.coordinates[0].length : -1
      setVertexButtonAction(action)
      setNumVertecies(numCoords)      
    }
    if (action === 'change') {
      const { selectedVertexIndex, numVertecies } = e.detail
      setSelectedVertexIndex(selectedVertexIndex)
      setNumVertecies(numVertecies) 
    }
  }

  useEffect(() => {
    setIsUpdateDisabled(drawMode === 'vertex' && numVertecies < 3)
  }, [drawMode, numVertecies])

  useEffect(() => {
    provider.addEventListener('draw', handleDrawEvent)
  }, [])

  return (
    <>
      {hasInclusiveDraw && (
        <button className='fm-c-btn-primary' {...!isEditVertexVisible && { style: { display: 'none' } }} aria-disabled={isEditVertexDisabled} data-vertex-button={true}>
          <svg aria-hidden='true' focusable='false' width='20' height='20' viewBox='0 0 20 20' fillRule='evenodd' fill='currentColor'>
            {/* <circle cx='10' cy='10' r='8.5' strokeWidth='2' fill='none' stroke='currentColor'/>
            <g strokeWidth='2' stroke='currentColor' {...vertexButtonAction === 'delete' && { transform: 'rotate(45 10 10)' }}>
              <line x1='10' y1='6' x2='10' y2='14' />
              <line x1='6' y1='10' x2='14' y2='10' />
            </g> */}
            <path d='M10.989 2.004v3.498h-2V2.004h2zm.002 12.499v3.498h-2v-3.498h2zm7.008-3.464h-3.501V9.003h3.501v2.037zM5.5 10.993H1.999v-2H5.5v2z'/>
            {/* <path d='M3.229 4.719l1.485-1.485 2.829 2.829-1.485 1.485zm9.204 9.199l1.485-1.485 2.829 2.829-1.485 1.485zm2.823-10.689l1.485 1.485-2.829 2.829-1.485-1.485zm-9.199 9.204l1.485 1.485-2.829 2.829-1.485-1.485z'/> */}
            <circle cx='10' cy='10' r='2.5'/>
          </svg>
          <span>{`${vertexButtonAction === 'delete' ? 'Delete point' : 'Add point'}`}</span>
        </button>
      )}
    </>
  )
}
