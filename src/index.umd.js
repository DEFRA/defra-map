// Import Preact modules - these will be bundled into the output
import * as preact from 'preact'
import * as preactHooks from 'preact/hooks'
import * as preactCompat from 'preact/compat'
import * as preactJsxRuntime from 'preact/jsx-runtime'

// CRITICAL FIX: The issue is that we're assigning Module objects
// We need to create plain objects with the actual exports

// 1. Set up base preact - expose all exports as properties
window.preact = {
  ...preact,
  // Ensure these critical ones are present
  h: preact.h,
  render: preact.render,
  Component: preact.Component,
  Fragment: preact.Fragment,
  createContext: preact.createContext,
  createElement: preact.createElement
}

// 2. Set up hooks - CRITICAL: spread all hooks into a plain object
window.preactHooks = {
  ...preactHooks,
  // Explicitly ensure these are there
  useState: preactHooks.useState,
  useEffect: preactHooks.useEffect,
  useContext: preactHooks.useContext,
  useReducer: preactHooks.useReducer,
  useCallback: preactHooks.useCallback,
  useMemo: preactHooks.useMemo,
  useRef: preactHooks.useRef,
  useImperativeHandle: preactHooks.useImperativeHandle,
  useLayoutEffect: preactHooks.useLayoutEffect,
  useDebugValue: preactHooks.useDebugValue
}

// 3. Set up compat - this should include everything from preactCompat AND hooks
window.preactCompat = {
  ...preactCompat,
  // CRITICAL: Also include all hooks on preactCompat for React compatibility
  ...preactHooks,
  // Ensure default export
  default: preactCompat.default || preactCompat
}

// Add React 18 createRoot compatibility
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

// 4. Set up jsx runtime
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

window.preactJsxRuntime = {
  ...preactJsxRuntime,
  jsx: createJsxFunction(),
  jsxs: createJsxFunction(),
  jsxDEV: createJsxFunction(),
  Fragment: preact.Fragment
}
window.preactJsxRuntime.default = window.preactJsxRuntime
window.jsxRuntime = window.preactJsxRuntime

// Debug: Log what's available
console.log('Preact globals set up:', {
  preact: !!window.preact,
  'preact.h': typeof window.preact.h,
  'preact.render': typeof window.preact.render,
  preactHooks: !!window.preactHooks,
  'preactHooks.useState': typeof window.preactHooks.useState,
  'preactHooks.useEffect': typeof window.preactHooks.useEffect,
  preactCompat: !!window.preactCompat,
  'preactCompat.useState': typeof window.preactCompat.useState,
  preactJsxRuntime: !!window.preactJsxRuntime
})

// Now import and export your library
import DefraMap from './index.js'

export default DefraMap