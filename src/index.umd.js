// Import Preact modules - these will be bundled into the output
import * as preact from 'preact'
import * as preactCompat from 'preact/compat'
import * as preactHooks from 'preact/hooks'
import * as preactJsxRuntime from 'preact/jsx-runtime'

// Immediately set up window globals for plugins to use
window.preact = preact
window.preactHooks = preactHooks
window.preactCompat = preactCompat
window.preactJsxRuntime = preactJsxRuntime

// Check if default exists and is a getter, if not add it
if (!window.preactCompat.default) {
  try {
    window.preactCompat.default = window.preactCompat
  } catch (e) {
    // If it fails (readonly), it means default already exists as a getter
    // which is fine - it should point to preactCompat anyway
  }
}

// Add React 18 createRoot compatibility if it doesn't exist
if (!window.preactCompat.createRoot) {
  window.preactCompat.createRoot = function(container) {
    return {
      render: function(vnode) {
        window.preact.render(vnode, container)
      },
      unmount: function() {
        window.preact.render(null, container)
      }
    }
  }
}

// Set up jsx runtime shim
function createJsxFunction() {
  return function(type, props, key) {
    const finalProps = props || {}
    if (key !== undefined) {
      finalProps.key = key
    }
    
    const children = finalProps.children
    delete finalProps.children
    
    if (children !== undefined) {
      return window.preact.h(type, finalProps, children)
    }
    return window.preact.h(type, finalProps)
  }
}

const jsxRuntimeShim = {
  jsx: createJsxFunction(),
  jsxs: createJsxFunction(),
  jsxDEV: createJsxFunction(),
  Fragment: window.preact.Fragment
}
jsxRuntimeShim.default = jsxRuntimeShim

window.preactJsxRuntime = jsxRuntimeShim
window.jsxRuntime = jsxRuntimeShim

// Now import and export your library
import DefraMap from './index.js'

export default DefraMap