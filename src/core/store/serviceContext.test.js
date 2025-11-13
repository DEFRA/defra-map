import React from 'react'
import { renderHook } from '@testing-library/react'
import { ServiceContext } from './ServiceProvider.jsx'
import { useService } from './serviceContext.js'

describe('useService', () => {
  test('useService returns value from ServiceContext', () => {
    const contextValue = { serviceInstance: {} }

    const wrapper = ({ children }) => (
      <ServiceContext.Provider value={contextValue}>
        {children}
      </ServiceContext.Provider>
    )

    const { result } = renderHook(() => useService(), { wrapper })
    expect(result.current).toBe(contextValue)
  })
})
