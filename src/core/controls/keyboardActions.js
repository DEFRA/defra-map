import { reverseGeocode } from '../../services/reverseGeocode.js'

export const createKeyboardActions = (mapProvider, announce, { containerRef, dispatch, panDelta, nudgePanDelta, zoomDelta, nudgeZoomDelta, targetMarker }) => {
  const getPan = (shift) => (shift ? nudgePanDelta : panDelta)
  const getZoom = (shift) => (shift ? nudgeZoomDelta : zoomDelta)

  return {
    showKeyboardControls: () => {
      dispatch({
        type: 'OPEN_PANEL',
        payload: {
          panelId: 'keyboardHelp',
          props: { triggeringElement: containerRef.current }
        }
      })
    },
    panUp: (e) => mapProvider.panBy([0, -getPan(e.shiftKey)]),
    panDown: (e) => mapProvider.panBy([0, getPan(e.shiftKey)]),
    panLeft: (e) => mapProvider.panBy([-getPan(e.shiftKey), 0]),
    panRight: (e) => mapProvider.panBy([getPan(e.shiftKey), 0]),
    zoomIn: (e) => mapProvider.zoomIn(getZoom(e.shiftKey)),
    zoomOut: (e) => mapProvider.zoomOut(getZoom(e.shiftKey)),
    getInfo: async (e) => {
      const coord = mapProvider.getCenter()
      const place = await reverseGeocode(mapProvider.getZoom(), coord)
      const area = mapProvider.getAreaDimensions?.()
      targetMarker?.pinToMap(coord, 'location')
      announce(`${place}.${area ? ' Covering ' + area + '.' : ''}`, 'core')
    },
    highlightNextLabel: (e) => {
      const label = mapProvider?.highlightNextLabel(e.key)
      announce(label, 'core')
    },
    highlightLabelAtCenter: () => {
      const label = mapProvider?.highlightLabelAtCenter()
      announce(label, 'core')
    },
    clearSelection: () => mapProvider?.clearHighlightedLabel()
    // cycleFeaturesForward: () => console.log('Cycle features forward'),
    // cycleFeaturesBackward: () => console.log('Cycle features backward'),
    // selectFeature: () => console.log('Select feature at cursor'),
    // getInfo: () => console.log('Get info at cursor'),
    // clearSelection: () => console.log('Clear selected feature')
  }
}
