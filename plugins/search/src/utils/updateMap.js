// src/plugins/search/utils/updateMap.js

/**
 * Updates the map viewport and optionally adds a marker.
 *
 * @param {Object} mapProvider - The map API/provider
 * @param {Object} markers - Marker manager
 * @param {boolean} showMarker - Whether to display a marker
 * @param {Object} bounds - Map bounds to fit
 * @param {Object} point - Marker point
 */
export function updateMap({ mapProvider, markers, showMarker, bounds, point }) {
  mapProvider.fitToBounds(bounds)
  if (showMarker) {
    markers.add('search', point)
  }
}
