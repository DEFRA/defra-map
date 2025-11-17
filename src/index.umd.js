// src/index.umd.js
// Bundles Preact + hooks + compat + jsx-runtime and exposes the same globals as your CDN + shim

import * as preact from 'preact';
import * as preactHooks from 'preact/hooks';
import * as preactCompat from 'preact/compat';
import * as preactJsxRuntime from 'preact/jsx-runtime';

import DefraMap from './index.js'; // your existing core entry

const g = (typeof window !== 'undefined') ? window : globalThis;

// Expose direct globals (ensure properties exist)
g.preact = preact;
g.preactHooks = preactHooks;
g.preactCompat = preactCompat;
g.preactJsxRuntime = preactJsxRuntime;

// The shim logic (keeps behaviour identical to your current preactShim.js)
(function() {
  // Ensure default export exists for preact/compat
  if (!g.preactCompat.default) g.preactCompat.default = g.preactCompat;

  // createRoot shim if missing
  if (!g.preactCompat.createRoot) {
    g.preactCompat.createRoot = function(container) {
      return {
        render(vnode) { g.preact.render(vnode, container); },
        unmount() { g.preact.render(null, container); }
      };
    };
  }

  // Build jsx runtime helpers that call preact.h
  function createJsxFunction() {
    return function(type, props, key) {
      const finalProps = props || {};
      if (key !== undefined) finalProps.key = key;

      // Handle children prop
      const children = finalProps.children;
      delete finalProps.children;

      if (children !== undefined) {
        return g.preact.h(type, finalProps, children);
      }
      return g.preact.h(type, finalProps);
    };
  }

  const jsxRuntimeExports = {
    jsx: createJsxFunction(),
    jsxs: createJsxFunction(),
    jsxDEV: createJsxFunction(),
    Fragment: g.preact.Fragment,
    default: null
  };

  jsxRuntimeExports.default = jsxRuntimeExports;

  // Provide both names used earlier by your shim/CDN builds
  g.preactJsxRuntime = jsxRuntimeExports;
  g.jsxRuntime = jsxRuntimeExports;
})();

// Finally export DefraMap as the default UMD export
export default DefraMap;
