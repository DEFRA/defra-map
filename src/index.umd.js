// This new entry point replaces the need for the 5 separate Preact and shim script tags.
//
// ASSUMPTION: You must configure Webpack for this entry point to:
// 1. NOT treat 'preact', 'preact/hooks', 'preact/compat', and 'preact/jsx-runtime' as externals,
//    so they are bundled inside this file.
// 2. Wrap the output in a UMD format that exports the `defra` object.

// Define the global object, using `self` or `window` for browser environments
const globalScope = typeof self !== 'undefined' ? self : window;

// Define the core exports object first, ensuring it exists globally before any dependent code runs
const defra = globalScope.defra || {};
globalScope.defra = defra;

// This IIFE wraps the dependency setup and core import, ensuring the globals
// are defined synchronously before the main module logic (DefraMap) is attached.
(function() {
    // --- 1. Import all necessary Preact components using require() ---
    // This forces synchronous loading/resolution within the IIFE.
    // If Webpack is bundling these, they should be available here.
    const preact = require('preact');
    const preactHooks = require('preact/hooks'); // Often implicitly available via compat, but included for robustness
    const preactCompat = require('preact/compat');
    const preactJsxRuntime = require('preact/jsx-runtime');

    // --- 2. Expose the Preact modules globally (CRITICAL TIMING FIX) ---
    // This must happen immediately so the core library's internal modules
    // (which expect a global 'preact' since they were originally externals) can find them.
    globalScope.preact = preact;
    globalScope.preactHooks = preactHooks;
    globalScope.preactCompat = preactCompat;
    globalScope.jsxRuntime = preactJsxRuntime;
    globalScope.preactJsxRuntime = preactJsxRuntime; // Add both names for compatibility

    // --- 3. Execute the custom shim logic ---
    // CRITICAL FIX: Ensure preactCompat works as a default export
    if (!globalScope.preactCompat.default) {
        globalScope.preactCompat.default = globalScope.preactCompat
    }

    // Add React 18 createRoot compatibility
    if (!globalScope.preactCompat.createRoot) {
        globalScope.preactCompat.createRoot = function(container) {
            return {
                render: function(vnode) {
                    globalScope.preact.render(vnode, container)
                },
                unmount: function() {
                    globalScope.preact.render(null, container)
                }
            }
        }
    }

    // Babel's automatic runtime needs jsx, jsxs, jsxDEV, Fragment
    function createJsxFunction(isShorthand) {
        return function(type, props, key) {
            const finalProps = props || {}
            if (key !== undefined) {
                finalProps.key = key
            }
            
            const children = finalProps.children
            delete finalProps.children
            
            const restChildren = children === undefined ? [] : Array.isArray(children) ? children : [children];

            return globalScope.preact.h(type, finalProps, ...restChildren)
        }
    }
    
    // Update the global jsxRuntime with the correct functions
    const jsxRuntimeExports = globalScope.jsxRuntime;

    jsxRuntimeExports.jsx = createJsxFunction(false);
    jsxRuntimeExports.jsxs = createJsxFunction(true);
    jsxRuntimeExports.jsxDEV = createJsxFunction(false);
    jsxRuntimeExports.Fragment = globalScope.preact.Fragment;
    jsxRuntimeExports.default = jsxRuntimeExports;

    // --- 4. Import and attach DefraMap to the shared export object ---
    // This is the local core file that doesn't need external access to 'preact'
    // but its internal components might.
    const DefraMap = require('./DefraMap/DefraMap.js').default;
    defra.DefraMap = DefraMap;

})();

// Return the `defra` object for UMD compatibility
export default defra;

// Note: In a Webpack UMD build, the bundler will automatically wrap this
// and ensure the final 'defra' object is correctly attached globally.