import { useLocationMarkers } from '../../hooks/useLocationMarkersAPI'
import { useConfig } from '../../store/configContext'

export const LocationMarkers = () => {
  const { id } = useConfig()
  const { locationMarkers, markerRef } = useLocationMarkers()

  return (
    <>
      {locationMarkers.items.map(marker => (
        <svg
          key={marker.id}
          ref={markerRef(marker.id)} // Single callback ref, just like useTargetMarker
          id={`${id}-location-marker-${marker.id}`}
          className="am-c-location-marker"
          width="38"
          height="38"
          viewBox="0 0 38 38"
          fillRule="evenodd"
          fill="currentColor"
          style={{ display: 'none'}}
        >
          <path d="M31 16.001c0 7.489-8.308 15.289-11.098 17.698-.533.4-1.271.4-1.803 0C15.309 31.29 7 23.49 7 16.001c0-6.583 5.417-12 12-12s12 5.417 12 12zm-12-5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.241 5-5-2.24-5-5-5z" />
        </svg>
      ))}
    </>
  )
}
