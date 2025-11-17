// src/index.umd.js
// Bundles Preact internally and exposes the same global symbols
// your plugin builds expect (preact, preactCompat, hooks, jsx-runtime).

import * as preact from 'preact';
import * as preactCompat from 'preact/compat';
import * as preactHooks from 'preact/hooks';

// IMPORTANT: import the actual Preact JSX runtime.
// This *must not* be reimplemented manually (was the cause of __H errors).
import * as preactJsxRuntime from 'preact/jsx-runtime';

// Your actual library entry
import DefraMap from './index.js';

const g = typeof window !== 'undefined' ? window : globalThis;

// ---------------------------------------------------------------------------
// EXPOSE GLOBALS FOR PLUGINS
// These match the values you previously had via CDN + shim
// ---------------------------------------------------------------------------
g.preact = preact;
g.preactCompat = preactCompat;
g.preactHooks = preactHooks;
g.preactJsxRuntime = preactJsxRuntime;

// Compat default — align with old behaviour
if (!g.preactCompat.default)
  g.preactCompat.default = g.preactCompat;

// Ensure createRoot exists (React-18 API)
if (!g.preactCompat.createRoot) {
  g.preactCompat.createRoot = function (container) {
    return {
      render(vnode) { preact.render(vnode, container); },
      unmount() { preact.render(null, container); }
    };
  };
}

// ---------------------------------------------------------------------------
// EXPORT YOUR LIBRARY AS UMD DEFAULT
// ---------------------------------------------------------------------------
export default DefraMap;
