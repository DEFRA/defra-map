import { renderHook } from '@testing-library/react'
import React from 'react'
import { useApp } from './appContext.js'
import { AppContext } from './AppProvider.jsx'

describe('useApp', () => {
  test('calls useContext with AppContext', () => {
    const value = { user: 'test' }

    const wrapper = ({ children }) => (
      <AppContext.Provider value={value}>
        {children}
      </AppContext.Provider>
    )

    const { result } = renderHook(() => useApp(), { wrapper })

    expect(result.current).toBe(value)
  })
})
