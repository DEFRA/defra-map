import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { DisabledMode } from './modes/disabledMode.js'
import { EditVertexMode } from './modes/editVertexMode.js'
import { DrawVertexMode } from './modes/drawVertexMode.js'
import { createDrawStyles, updateDrawStyles } from './styles.js'

/**
 * Creates and manages a MapLibre/Mapbox Draw control instance configured for polygon editing.
 * Returns an object with a `.remove()` cleanup function that removes all listeners
 * and safely disposes of the Draw control.
 *
 * Features:
 * - Custom modes for editing and drawing vertices
 * - Dynamic runtime style updates on `map:setmapstyle` event
 * - Safe reapplication of styles if map.setStyle is called
 *
 * @param {Object} options
 * @param {HTMLElement} options.container - DOM container for vertex UI overlays
 * @param {string} options.vertexMarkerId - Element ID for vertex marker
 * @param {string} options.interfaceType - Interface type ("keyboard" | "touch" | "pointer")
 * @param {string} options.colorScheme - Color scheme name used for styles
 * @param {string} options.featureId - Feature ID to edit
 * @param {GeoJSON.FeatureCollection} [options.featureGeoJSON] - Optional existing features
 * @param {string} options.addVertexButtonId - ID of "Add Vertex" button
 * @param {string} options.deleteVertexButtonId - ID of "Delete Vertex" button
 * @param {Object} options.mapProvider - Object containing the map instance
 * @param {Object} options.eventBus - Event bus for app-level events
 * @returns {{ draw: MapboxDraw, remove: Function }} draw instance and cleanup function
 */
export const createMapboxDraw = ({
  container,
  vertexMarkerId,
  interfaceType,
  colorScheme,
  featureId,
  featureGeoJSON,
  addVertexButtonId,
  deleteVertexButtonId,
  mapProvider,
  mapSize,
  eventBus,
}) => {
  const { map } = mapProvider

  // --- Configure MapLibre GL Draw CSS classes ---
  MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
  MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
  MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

  // --- Register custom modes ---
  const modes = {
    ...MapboxDraw.modes,
    disabled: DisabledMode,
    edit_vertex: EditVertexMode,
    draw_vertex: DrawVertexMode
  }

  // --- Create MapLibre Draw instance ---
  const draw = new MapboxDraw({
    modes,
    styles: createDrawStyles(colorScheme),
    displayControlsDefault: false,
    userProperties: true,
  })

  map.addControl(draw)

  const getScale = (mapSize) => {
    return { small: 1, medium: 1.5, large: 2 }[mapSize]
  }

  const editVertexConfig = {
    container,
    deleteVertexButtonId,
    isPanEnabled: interfaceType !== 'keyboard',
    interfaceType,
    scale: getScale(mapSize)
  }

  // --- Draw event handlers ---
  const onModeChange = (e) => {
    eventBus.emit('drawpolygon:modechange', { mode: e.mode })

    // Switch SimpleSelect to EditVertexMode
    if (e.mode === 'simple_select') {
      draw.changeMode('edit_vertex', {
        ...editVertexConfig,
        featureId
      })
    }
  }

  const onCreate = (e) => eventBus.emit('drawpolygon:create', e)
  const onVertexSelection = (e) => eventBus.emit('drawpolygon:vertexselection', e)

  // --- Update colour scheme ---
  const handleSetMapStyle = (e) => {
    map.once('idle', () => {
      updateDrawStyles(map, e.mapColorScheme)
    })
  }
  eventBus.on('map:setmapstyle', handleSetMapStyle)

  // --- Update map scale ---
  const handleSetMapSize = (e) => {
    map.fire('draw.scalechange', { scale: getScale(e) })
  }
  eventBus.on('map:setmapsize', handleSetMapSize)

  // --- Bind map events ---
  map.on('draw.modechange', onModeChange)
  map.on('draw.create', onCreate)
  map.on('draw.vertexselection', onVertexSelection)

  // --- Initialize features ---
  if (featureGeoJSON) {
    draw.add(featureGeoJSON)
    draw.changeMode('edit_vertex', {
      ...editVertexConfig,
      featureId: featureGeoJSON.properties?.id || featureGeoJSON.id
    })
  } else {
    draw.changeMode('draw_vertex', {
      container,
      featureId,
      vertexMarkerId,
      addVertexButtonId,
      interfaceType
    })
  }

  // --- Return cleanup function ---
  return {
    remove() {
      // Remove event listeners
      eventBus.off('map:setmapstyle', handleSetMapStyle)
      map.off('draw.modechange', onModeChange)
      map.off('draw.create', onCreate)
      map.off('draw.vertexselection', onVertexSelection)

      // Delete all features and disable draw
      draw.deleteAll()
      draw.changeMode('disabled')

      // Remove draw control from map
      map.removeControl(draw)
    }
  }
}
