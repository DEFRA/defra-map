import * as areaOperator from '@arcgis/core/geometry/operators/areaOperator.js'
import * as simplifyOperator from "@arcgis/core/geometry/operators/simplifyOperator.js"

import { createGraphic, createSymbol } from './graphic.js'

export function attachEvents({ pluginState, mapProvider, eventBus }) {
  const { view, sketchViewModel, sketchLayer } = mapProvider
  
  // Re-colour graphics
  const reColour = async (mapColorScheme) => {
    if (!sketchViewModel && !sketchLayer) {
      return
    }

    const activeGraphicId = pluginState.feature?.properties?.id
    let activeGraphic = null
    const isCreating = sketchViewModel.state === 'active' && !activeGraphicId
    
    // Cancel and wait, but only if we're in update mode (not create mode)
    if (sketchViewModel.state === 'active' && activeGraphicId) {
      sketchViewModel.cancel()
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // Always update the default symbol for new polygons
    sketchViewModel.polygonSymbol = createSymbol(mapColorScheme)
    
    // Update existing graphics
    sketchLayer?.graphics.items.forEach(graphic => {
      // Create a new graphic to get the updated colors
      const newGraphic = createGraphic(
        graphic.attributes.id, 
        graphic.geometry.rings, 
        mapColorScheme
      )
      
      // Update the existing graphic's symbol
      graphic.symbol = newGraphic.symbol
      
      // Keep reference to the active graphic
      if (activeGraphicId === graphic.attributes.id) {
        activeGraphic = graphic
      }
    })
    
    // Re-enter update mode only if we were editing (not creating)
    if (activeGraphic && !isCreating) {
      try {
        await sketchViewModel.update(activeGraphic, {
          tool: 'reshape',
          toggleToolOnClick: false
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error updating sketch:', error)
        }
      }
    }
  }

  // Re-enter update graphic mode
  const updateGraphic = () => {
    const graphic = sketchLayer.graphics?.items?.[0] ?? null
    if (graphic) {
      setTimeout(() => sketchViewModel.update(graphic), 0)
    }
  }

  // Handle map style change
  const handleMapStyleChange = (e) => {
    reColour(e.mapColorScheme)
  }
  eventBus.on('map:stylechange', handleMapStyleChange)

  // Handle sketchViewModel update event
  const handleUpdate = (e) => {
    const toolInfoType = e.toolEventInfo?.type
    const graphic = e.graphics[0]
    
    // Prevent polygon move
    if (toolInfoType === 'move-start') {
      sketchViewModel.cancel()
      updateGraphic()
    }

    // Prevent self-intersect
    if (toolInfoType === 'reshape') {
      const isSimple = simplifyOperator.isSimple(graphic.geometry)
      if (!isSimple) {
        sketchViewModel.undo()
      }
    }

    // Prevent zero area polygon
    if (['reshape-stop', 'vertex-remove'].includes(toolInfoType)) {
      const area = areaOperator.execute(graphic.geometry)
      if (area <= 0) {
        sketchViewModel.undo()
      }
    }
  }
  sketchViewModel?.on('update', handleUpdate)

  // Prevent deselection when clicking outside
  view.on('click', async () => {
    if (!sketchViewModel && !sketchLayer) {
      return
    }

    const updateGraphics = sketchViewModel.updateGraphics || []

    // If not updating, ignore
    if (updateGraphics.length) {
      return
    }

    // Reinstate update
    updateGraphic()
  })

  // Return cleanup function
  return () => {
    eventBus.off('map:stylechange', handleMapStyleChange)
  }
}