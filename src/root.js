'use strict'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app.jsx'

export default function Root (el, props) {
  const root = createRoot(el)
  root.render(<App {...props} />)
  return root
}
