import React, { createContext, useReducer, useMemo } from 'react'
import { initialState, reducer } from './app-reducer.js'

export const AppContext = createContext()

export const AppProvider = ({ options, app, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState(options))

  const store = useMemo(() => ({
    ...app,
    ...state,
    options: {
      ...options,
      queryFeature: options.queryFeature || [],
      queryPixel: options.queryPixel || []
    },
    dispatch
  }))

  return (
    <AppContext.Provider value={store}>
      {children}
    </AppContext.Provider>
  )
}
