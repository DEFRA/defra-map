import { createGraphic, createSymbol } from './graphic.js'

export function attachEvents({ pluginState, mapProvider, eventBus }) {
  const { view } = mapProvider
  
  const reColour = async (mapColorScheme) => {
    const { sketchViewModel, sketchLayer } = mapProvider
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

  // Register the listener
  const handleMapStyleChange = (e) => {
    reColour(e.mapColorScheme)
  }
  eventBus.on('map:stylechange', handleMapStyleChange)

  // Prevent deselection when clicking outside
  view.on('click', async () => {
    const { sketchViewModel, sketchLayer } = mapProvider
    const updateGraphics = sketchViewModel.updateGraphics || []

    // If not updating, ignore
    if (updateGraphics.length) {
      return
    }

    // Reinstate update
    const graphic = sketchLayer.graphics?.items?.[0] ?? null
    if (graphic) {
      setTimeout(() => sketchViewModel.update(graphic), 0)
    }
  })

  // Prevent dragging shape
  view.on('pointer-move', async (e) => {
    const { sketchViewModel, sketchLayer } = mapProvider
    console.log(sketchViewModel.state)
    if (sketchViewModel.state !== 'active') {
      return
    }
    const graphic = sketchLayer.graphics?.items?.[0] ?? null
    const hit = await view.hitTest(e)
    console.log(graphic)
    console.log(hit.results)
    const graphicHit = hit.results.find(r => r.graphic === graphic)
    if (graphicHit && e.isDragging) {
      console.log('User is dragging polygon fill')
    }
  })

  // Return cleanup function
  return () => {
    eventBus.off('map:stylechange', handleMapStyleChange)
  }
}