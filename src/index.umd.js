// This new entry point replaces the need for the 5 separate Preact and shim script tags.
//
// ASSUMPTION: You must configure Webpack for this entry point to:
// 1. NOT treat 'preact', 'preact/hooks', 'preact/compat', and 'preact/jsx-runtime' as externals,
//    so they are bundled inside this file.
// 2. Wrap the output in a UMD format that exports the `defra` object.

// --- 1. Import all necessary Preact components ---
// We assume these are bundled by Webpack into this file.
import * as preact from 'preact';
import * as preactHooks from 'preact/hooks';
import * as preactCompat from 'preact/compat';
import * as preactJsxRuntime from 'preact/jsx-runtime';

// --- 2. Expose the Preact modules globally ---
// This replicates the effect of loading the CDN scripts and ensures that
// the *plugin* UMD bundles (which still use externals) can find them on 'window'.
window.preact = preact;
window.preactHooks = preactHooks;
window.preactCompat = preactCompat;
window.jsxRuntime = preactJsxRuntime;
window.preactJsxRuntime = preactJsxRuntime; // Add both names for compatibility

// --- 3. Execute the custom shim logic (from the original preactShim.js) ---
(function() {
  // CRITICAL FIX: Ensure preactCompat works as a default export
  if (!window.preactCompat.default) {
    // Make preactCompat itself the default export
    window.preactCompat.default = window.preactCompat
  }

  // Add React 18 createRoot compatibility
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

  // Babel's automatic runtime needs jsx, jsxs, jsxDEV, Fragment
  // Map them to Preact's h function, ensuring they use the globally exposed 'preact'
  
  function createJsxFunction(isShorthand) {
    return function(type, props, key) {
      const finalProps = props || {}
      if (key !== undefined) {
        finalProps.key = key
      }
      
      // Handle children properly
      const children = finalProps.children
      delete finalProps.children
      
      // Pass children as rest arguments if multiple or single child exists
      const restChildren = children === undefined ? [] : Array.isArray(children) ? children : [children];

      return window.preact.h(type, finalProps, ...restChildren)
    }
  }
  
  // Update the global jsxRuntime with the correct functions
  const jsxRuntimeExports = window.jsxRuntime;

  jsxRuntimeExports.jsx = createJsxFunction(false);
  jsxRuntimeExports.jsxs = createJsxFunction(true);
  jsxRuntimeExports.jsxDEV = createJsxFunction(false);
  jsxRuntimeExports.Fragment = window.preact.Fragment;
  // Ensure default export is set again
  jsxRuntimeExports.default = jsxRuntimeExports;

})()

// --- 4. Import and export the DefraMap core library ---
import DefraMap from './DefraMap/DefraMap.js'

// Assuming this is your final library export structure
const defra = {
    DefraMap: DefraMap
    // Add other core exports here if needed
};

// Return the `defra` object for UMD compatibility
export default defra;

// Note: In a Webpack UMD build, the bundler will automatically wrap this
// and attach `defra` to the global `window` object.