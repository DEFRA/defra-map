(function() {
  // CRITICAL FIX: Ensure preactCompat works as a default export
  // When you do: import React from 'react'
  // Webpack expects: window.preactCompat or window.preactCompat.default
  
  if (!window.preactCompat.default) {
    // Make preactCompat itself the default export
    window.preactCompat.default = window.preactCompat
  }
  
  // Add React 18 createRoot compatibility
  if (!window.preactCompat.createRoot) {
    window.preactCompat.createRoot = function(container, options) {
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
  
  // DON'T try to merge hooks - preactCompat already has them as getters!
  // The preact/compat already forwards all hook calls to preactHooks internally
  
  // Babel's automatic runtime needs jsx, jsxs, jsxDEV, Fragment
  // Map them to Preact's h function
  
  function createJsxFunction(isStatic) {
    return function(type, props, key) {
      const finalProps = props || {}
      if (key !== undefined) {
        finalProps.key = key
      }
      
      // Handle children properly
      const children = finalProps.children
      delete finalProps.children
      
      if (children !== undefined) {
        return window.preact.h(type, finalProps, children)
      }
      return window.preact.h(type, finalProps)
    }
  }
  
  // Create the jsx runtime global that webpack expects
  const jsxRuntimeExports = {
    jsx: createJsxFunction(false),
    jsxs: createJsxFunction(true),
    jsxDEV: createJsxFunction(false),
    Fragment: window.preact.Fragment,
    // Add default export
    default: null // Will set after creating the object
  }
  
  // Point default to itself
  jsxRuntimeExports.default = jsxRuntimeExports
  
  // Create BOTH names since webpack expects preactJsxRuntime
  // but CDN creates jsxRuntime
  window.preactJsxRuntime = jsxRuntimeExports
  window.jsxRuntime = jsxRuntimeExports
})()