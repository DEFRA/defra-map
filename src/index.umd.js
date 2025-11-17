// --- PREACT CORE ---
import * as preact from 'preact';
import * as preactHooks from 'preact/hooks';
import * as preactCompat from 'preact/compat';
import * as preactJsxRuntime from 'preact/jsx-runtime';

// --- YOUR ACTUAL LIBRARY ---
import DefraMap from './index.js';

// --- EXPOSE TO WINDOW (same names as old CDN scripts) ---

// Ensure global object
const g = (typeof window !== 'undefined' ? window : globalThis);

// 1. Same globals as CDN UMD builds
g.preact = preact;
g.preactHooks = preactHooks;
g.preactCompat = preactCompat;
g.preactJsxRuntime = preactJsxRuntime;

// 2. Apply your shim logic exactly as before
(function() {
  // Ensure default export exists
  if (!g.preactCompat.default) g.preactCompat.default = g.preactCompat;

  // createRoot shim
  if (!g.preactCompat.createRoot) {
    g.preactCompat.createRoot = function(container) {
      return {
        render(vnode) { g.preact.render(vnode, container); },
        unmount() { g.preact.render(null, container); }
      };
    };
  }

  function createJsxFunction() {
    return function(type, props, key) {
      const p = props || {};
      if (key !== undefined) p.key = key;

      const children = p.children;
      delete p.children;

      return children !== undefined
        ? g.preact.h(type, p, children)
        : g.preact.h(type, p);
    };
  }

  const jsxExports = {
    jsx: createJsxFunction(),
    jsxs: createJsxFunction(),
    jsxDEV: createJsxFunction(),
    Fragment: g.preact.Fragment,
    default: null
  };

  jsxExports.default = jsxExports;

  g.preactJsxRuntime = jsxExports;
  g.jsxRuntime = jsxExports;
})();

// Export DefraMap as usual
export default DefraMap;
