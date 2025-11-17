// Import Preact and its modules
import * as preact from 'preact'
import * as preactCompat from 'preact/compat'
import * as preactHooks from 'preact/hooks'
import * as preactJsxRuntime from 'preact/jsx-runtime'

// Set up global references BEFORE importing your library
if (typeof window !== 'undefined') {
  window.preact = preact
  window.preactHooks = preactHooks
  window.preactJsxRuntime = preactJsxRuntime
  
  // Set up preactCompat with all necessary properties
  window.preactCompat = preactCompat
  
  // Ensure preactCompat works as a default export
  if (!window.preactCompat.default) {
    window.preactCompat.default = window.preactCompat
  }
  
  // Add React 18 createRoot compatibility if not present
  if (!window.preactCompat.createRoot) {
    window.preactCompat.createRoot = function(container) {
      return {
        render: function(vnode) {
          preact.render(vnode, container)
        },
        unmount: function() {
          preact.render(null, container)
        }
      }
    }
  }
  
  // Create jsx runtime functions
  function createJsxFunction() {
    return function(type, props, key) {
      const finalProps = props || {}
      if (key !== undefined) {
        finalProps.key = key
      }
      
      const children = finalProps.children
      delete finalProps.children
      
      if (children !== undefined) {
        return preact.h(type, finalProps, children)
      }
      return preact.h(type, finalProps)
    }
  }
  
  // Enhance jsxRuntime with additional properties
  const jsxRuntimeExports = {
    ...preactJsxRuntime,
    jsx: createJsxFunction(false),
    jsxs: createJsxFunction(true),
    jsxDEV: createJsxFunction(false),
    Fragment: preact.Fragment
  }
  
  jsxRuntimeExports.default = jsxRuntimeExports
  window.preactJsxRuntime = jsxRuntimeExports
  window.jsxRuntime = jsxRuntimeExports
}

// Now import and export your actual library
import DefraMap from './index.js'

export default DefraMap