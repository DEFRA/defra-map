import React from 'react'
import { renderHook } from '@testing-library/react'
import { MapContext } from './MapProvider.jsx' // import from provider
import { useMap } from './mapContext.js'

describe('useMap', () => {
  test('useMap returns value from MapContext', () => {
    const contextValue = { mapInstance: {} }

    const wrapper = ({ children }) => (
      <MapContext.Provider value={contextValue}>
        {children}
      </MapContext.Provider>
    )

    const { result } = renderHook(() => useMap(), { wrapper })
    expect(result.current).toBe(contextValue)
  })
})
