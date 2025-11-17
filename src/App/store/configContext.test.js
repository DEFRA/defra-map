import React from 'react'
import { renderHook } from '@testing-library/react'
import { ConfigContext, useConfig } from './configContext.js'

describe('ConfigContext & useConfig', () => {
  test('ConfigContext default value is null', () => {
    expect(ConfigContext._currentValue).toBe(null)
  })

  test('useConfig returns value from ConfigContext', () => {
    const contextValue = { apiUrl: 'https://example.com' }

    const wrapper = ({ children }) => (
      <ConfigContext.Provider value={contextValue}>
        {children}
      </ConfigContext.Provider>
    )

    const { result } = renderHook(() => useConfig(), { wrapper })
    expect(result.current).toBe(contextValue)
  })
})
