import { markerSvgPaths } from '../../../config/appConfig'
import { useLocationMarkers } from '../../hooks/useLocationMarkersAPI'
import { useConfig } from '../../store/configContext'
import { useMap } from '../../store/mapContext'
import { parseColor } from '../../../utils/parseColor.js'
import { stringToKebab } from '../../../utils/stringToKebab.js'

export const LocationMarkers = () => {
  const { id, markerShape, markerColor } = useConfig()
  const { mapStyle } = useMap()
  const { locationMarkers, markerRef } = useLocationMarkers()

  if (!mapStyle) {
    return
  }

  const defaultSvgPaths = markerSvgPaths.find(m => m.shape === markerShape)

  return (
    <>
      {locationMarkers.items.map(marker => (
        <svg
          key={marker.id}
          ref={markerRef(marker.id)} // Single callback ref, just like useTargetMarker
          id={`${id}-location-marker-${marker.id}`}
          className={`dm-c-location-marker dm-c-location-marker--${marker.markerShape || stringToKebab(markerShape)}`}
          width="38"
          height="38"
          viewBox="0 0 38 38"
          style={{ display: marker.isVisible ? 'block' : 'none' }}
        >
          <path
            className="dm-c-location-marker__background"
            d={defaultSvgPaths.backgroundPath}
            fill={parseColor(marker.color || markerColor, mapStyle.id)}
            />
          <path 
            className="dm-c-location-marker__graphic"
            d={defaultSvgPaths.graphicPath}
            />
        </svg>
      ))}
    </>
  )
}
