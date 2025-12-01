// src/index.umd.js
// Import using React entrypoints so externals resolve to Preact globals

import React from 'react'
import { jsx, jsxs, Fragment } from 'react/jsx-runtime'

// Import at least ONE hook to force react-hooks → preact/hooks
import { useState } from 'react'

import DefraMap from './index.js'

const g = typeof window !== 'undefined' ? window : globalThis

// Create `defra` namespace if missing
g.defra = g.defra || {}

// Expose globals exactly like CDN version
g.preactCompat = React // maps to preact/compat

// KEY FIX: Expose jsx, jsxs, Fragment as named exports on the global
g.preactJsxRuntime = { jsx, jsxs, Fragment }

g.preactHooks = { useState }  // the act of importing keeps the module alive

// Attach the main map
g.defra.DefraMap = DefraMap

// Ensure compat.default exists
if (!g.preactCompat.default) {
  g.preactCompat.default = g.preactCompat
}

// Add createRoot shim
if (!g.preactCompat.createRoot) {
  g.preactCompat.createRoot = function (container) {
    return {
      render(vnode) {
        g.preactCompat.render(vnode, container)
      },
      unmount() {
        g.preactCompat.render(null, container)
      }
    }
  }
}

export default DefraMap