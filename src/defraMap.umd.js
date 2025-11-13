// src/defraMapUMD.js

// --- Import Preact & shim first ---
import * as preact from 'preact'
import * as preactHooks from 'preact/hooks'
import * as preactCompat from 'preact/compat'

// --- Add createRoot shim if needed ---
if (!preactCompat.createRoot) {
  preactCompat.createRoot = function(container) {
    return {
      render(vnode) {
        preact.render(vnode, container)
      },
      unmount() {
        preact.render(null, container)
      }
    }
  }
}

// --- JSX runtime for Babel automatic runtime ---
function createJsxFunction() {
  return function(type, props, key) {
    const finalProps = props || {}
    if (key !== undefined) finalProps.key = key
    const children = finalProps.children
    delete finalProps.children
    return children !== undefined
      ? preact.h(type, finalProps, children)
      : preact.h(type, finalProps)
  }
}

const jsxRuntime = {
  jsx: createJsxFunction(false),
  jsxs: createJsxFunction(true),
  jsxDEV: createJsxFunction(false),
  Fragment: preact.Fragment
}

// --- Expose Preact globally for plugins ---
if (typeof window !== 'undefined') {
  window.defra = window.defra || {}
  window.defra.Preact = preactCompat
  window.defra.PreactHooks = preactHooks
  window.defra.jsxRuntime = jsxRuntime
}

// --- Import your original core ---
import DefraMap from './defraMap.js'

// --- Expose core on defra namespace ---
if (typeof window !== 'undefined') {
  window.defra.DefraMap = DefraMap
}

// --- Export for internal import if needed ---
export default DefraMap
export { preactCompat as Preact, preactHooks as PreactHooks, jsxRuntime }
