"use strict";(self.webpackChunkdefraMap=self.webpackChunkdefraMap||[]).push([[7323],{39397:function(n,t,r){r.d(t,{Dl:function(){return s},jV:function(){return o},lF:function(){return u}}),r(25591),r(7156);var e=r(21609),i=r(90683);function o(n,t){return t?{...t,query:{...n??{},...t.query}}:{query:n}}function s(n){return"string"==typeof n?(0,i.An)(n):(0,e.o8)(n)}function u(n,t,r){const e={};for(const i in n){if("declaredClass"===i)continue;const o=n[i];if(null!=o&&"function"!=typeof o)if(Array.isArray(o))e[i]=o.map((n=>u(n)));else if("object"==typeof o)if(o.toJSON){const n=o.toJSON(r?.[i]);e[i]=t?n:JSON.stringify(n)}else e[i]=t?o:JSON.stringify(o);else e[i]=o}return e}r(48893)},96303:function(n,t,r){r.r(t),r.d(t,{deleteForwardEdits:function(){return s}});var e=r(93040),i=r(39819),o=r(39397);async function s(n,t,r,s){if(!t)throw new i.A("post:missing-guid","guid for version is missing");const u=(0,o.Dl)(n),f=r.toJSON(),c=(0,o.jV)(u.query,{query:(0,o.lF)({...f,f:"json"}),...s,method:"post"});t.startsWith("{")&&(t=t.slice(1,-1));const a=`${u.path}/versions/${t}/deleteForwardEdits`,{data:d}=await(0,e.A)(a,c);return d}}}]);
//# sourceMappingURL=rest-versionManagement-gdbVersion-deleteForwardEdits.js.map