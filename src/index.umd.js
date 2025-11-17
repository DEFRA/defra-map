// Import Preact and expose to window BEFORE importing our library
import * as preact from 'preact'
import * as preactHooks from 'preact/hooks'
import * as preactCompat from 'preact/compat'
import * as preactJsxRuntime from 'preact/jsx-runtime'

// Set up window globals
window.preact = preact
window.preactHooks = preactHooks
window.preactCompat = preactCompat
window.preactJsxRuntime = preactJsxRuntime

// Shim setup
if (!window.preactCompat.default) {
  try {
    window.preactCompat.default = window.preactCompat
  } catch (e) {}
}

if (!window.preactCompat.createRoot) {
  window.preactCompat.createRoot = function(container) {
    return {
      render: (vnode) => preact.render(vnode, container),
      unmount: () => preact.render(null, container)
    }
  }
}

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

window.preactJsxRuntime.jsx = createJsxFunction()
window.preactJsxRuntime.jsxs = createJsxFunction()
window.preactJsxRuntime.jsxDEV = createJsxFunction()
window.preactJsxRuntime.Fragment = preact.Fragment
window.preactJsxRuntime.default = window.preactJsxRuntime

// Now that globals are set, import the library
// IMPORTANT: This import happens AFTER globals are set
import DefraMap from './index.js'

export default DefraMap