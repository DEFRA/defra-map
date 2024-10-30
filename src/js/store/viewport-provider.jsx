import React, { createContext, useReducer, useMemo } from 'react'
import { initialState, reducer } from './viewport-reducer'

export const ViewportContext = createContext()

export const ViewportProvider = ({ options, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState(options))

  const store = useMemo(() => ({
    ...state,
    dispatch
  }))

  return (
    <ViewportContext.Provider value={store}>
      {children}
    </ViewportContext.Provider>
  )
}
