'use strict'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app.jsx'

export default function root (el, props) {
  const appRoot = createRoot(el)
  appRoot.render(<App {...props} />)
  return appRoot
}
