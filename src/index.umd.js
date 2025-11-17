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

// Ensure preactCompat has a default export
window.preactCompat.default = window.preactCompat

// Add React 18 createRoot compatibility
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