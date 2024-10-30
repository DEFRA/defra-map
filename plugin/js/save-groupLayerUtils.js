"use strict";(self.webpackChunkdefraMap=self.webpackChunkdefraMap||[]).push([[396,4460],{17643:function(e,t,r){r.d(t,{v:function(){return o}});var n=r(73888);function o(e){e?.writtenProperties&&e.writtenProperties.forEach((({target:e,propName:t,newOrigin:r})=>{(0,n.H)(e)&&r&&e.originOf(t)!==r&&e.updateOrigin(t,r)}))}},73888:function(e,t,r){function n(e){return e&&"getAtOrigin"in e&&"originOf"in e}r.d(t,{H:function(){return n}})},66110:function(e,t,r){r.d(t,{lk:function(){return o},vD:function(){return s},yS:function(){return a}});const n="randomUUID"in crypto;function o(){if(n)return crypto.randomUUID();const e=crypto.getRandomValues(new Uint16Array(8));e[3]=4095&e[3]|16384,e[4]=16383&e[4]|32768;const t=t=>e[t].toString(16).padStart(4,"0");return t(0)+t(1)+"-"+t(2)+"-"+t(3)+"-"+t(4)+"-"+t(5)+t(6)+t(7)}function a(){return`{${o().toUpperCase()}}`}function s(){return`{${o()}}`}},9413:function(e,t,r){r.d(t,{save:function(){return y},saveAs:function(){return w}});var n=r(5553),o=r(28993),a=r(29606),s=r(75007);const i="Group Layer",c="group-layer-save",u="group-layer-save-as",l=a.mm.GROUP_LAYER_MAP;function p(e){return{isValid:"group"===e.type,errorMessage:"Layer.type should be 'group'"}}function f(e){return{isValid:(0,a.Y)(e,l),errorMessage:`Layer.portalItem.typeKeywords should have '${l}'`}}function d(e,t){return{...(0,o.m)(e,"web-map",!0),initiator:t}}function m(e){const t=e.layerJSON;return Promise.resolve(t&&Object.keys(t).length?t:null)}async function h(e,t){t.title||=e.title,(0,a.OM)(t,a.mm.METADATA),(0,a.LG)(t,l)}async function y(e,t){return(0,n.UN)({layer:e,itemType:i,validateLayer:p,validateItem:f,createJSONContext:t=>d(t,e),createItemData:m,errorNamePrefix:c,saveResources:async(t,r)=>(e.sourceIsPortalItem||await t.removeAllResources().catch((()=>{})),(0,s.r)(e.resourceReferences,r))},t)}async function w(e,t,r){return(0,n.Uh)({layer:e,itemType:i,validateLayer:p,createJSONContext:t=>d(t,e),createItemData:m,errorNamePrefix:u,newItem:t,setItemProperties:h,saveResources:(t,r)=>(0,s.r)(e.resourceReferences,r)},r)}},5553:function(e,t,r){r.d(t,{UN:function(){return g},Uh:function(){return I}});var n=r(39819),o=r(17643),a=r(51432),s=r(43173),i=r(28993),c=r(29606),u=r(46589),l=r(4584);async function p(e){const{layer:t,errorNamePrefix:r,validateLayer:o}=e;await t.load(),function(e,t,r){const o=r(e);if(!o.isValid)throw new n.A(`${t}:invalid-parameters`,o.errorMessage,{layer:e})}(t,r,o)}function f(e,t){return`Layer (title: ${e.title}, id: ${e.id}) of type '${e.declaredClass}' ${t}`}function d(e){const{item:t,errorNamePrefix:r,layer:o,validateItem:a}=e;if((0,u.X)(t),function(e){const{item:t,itemType:r,additionalItemType:o,errorNamePrefix:a,layer:s}=e,i=[r];if(o&&i.push(o),!i.includes(t.type)){const e=i.map((e=>`'${e}'`)).join(", ");throw new n.A(`${a}:portal-item-wrong-type`,`Portal item type should be one of: "${e}"`,{item:t,layer:s})}}(e),a){const e=a(t);if(!e.isValid)throw new n.A(`${r}:invalid-parameters`,e.errorMessage,{layer:o})}}function m(e){const{layer:t,errorNamePrefix:r}=e,{portalItem:o}=t;if(!o)throw new n.A(`${r}:portal-item-not-set`,f(t,"requires the portalItem property to be set"));if(!o.loaded)throw new n.A(`${r}:portal-item-not-loaded`,f(t,"cannot be saved to a portal item that does not exist or is inaccessible"));d({...e,item:o})}function h(e){const{newItem:t,itemType:r}=e;let n=s.default.from(t);return n.id&&(n=n.clone(),n.id=null),n.type??=r,n.portal??=a.A.getDefault(),d({...e,item:n}),n}function y(e){return(0,i.m)(e,"portal-item")}async function w(e,t,r){"beforeSave"in e&&"function"==typeof e.beforeSave&&await e.beforeSave();const n=e.write({},t);return await Promise.all(t.resources?.pendingOperations??[]),(0,l.c)(t,{errorName:"layer-write:unsupported"},r),n}function v(e){(0,c.LG)(e,c.mm.JSAPI),e.typeKeywords&&(e.typeKeywords=e.typeKeywords.filter(((e,t,r)=>r.indexOf(e)===t)))}async function g(e,t){const{layer:r,createItemData:n,createJSONContext:a,setItemProperties:s,saveResources:i,supplementalUnsupportedErrors:c}=e;await p(e),m(e);const u=r.portalItem,l=a?a(u):y(u),f=await w(r,l,{...t,supplementalUnsupportedErrors:c}),d=await n({layer:r,layerJSON:f},u);return await(s?.(r,u)),v(u),await u.update({data:d}),(0,o.v)(l),await(i?.(u,l)),u}async function I(e,t){const{layer:r,createItemData:n,createJSONContext:a,setItemProperties:s,saveResources:i,supplementalUnsupportedErrors:c}=e;await p(e);const u=h(e),l=a?a(u):y(u),f=await w(r,l,{...t,supplementalUnsupportedErrors:c}),d=await n({layer:r,layerJSON:f},u);return await s(r,u),v(u),await async function(e,t,r){const n=e.portal;await n.signIn(),await(n.user?.addItem({item:e,data:t,folder:r?.folder}))}(u,d,t),r.portalItem=u,(0,o.v)(l),await(i?.(u,l)),u}},28993:function(e,t,r){r.d(t,{m:function(){return s},v:function(){return a}});var n=r(90683),o=r(51432);function a(e,t){return{...i(e,t),readResourcePaths:[]}}function s(e,t,r){const o=(0,n.An)(e.itemUrl);return{...i(e,t),messages:[],writtenProperties:[],blockedRelativeUrls:[],verifyItemRelativeUrls:o?{rootPath:o.path,writtenUrls:[]}:null,resources:r?{toAdd:[],toUpdate:[],toKeep:[],pendingOperations:[]}:null}}function i(e,t){return{origin:t,url:(0,n.An)(e.itemUrl),portal:e.portal||o.A.getDefault(),portalItem:e}}},55597:function(e,t,r){r.d(t,{addOrUpdateResources:function(){return i},bg:function(){return f},cL:function(){return p},fetchResources:function(){return s},removeAllResources:function(){return u},removeResource:function(){return c}});var n=r(93040),o=r(39819),a=r(90683);async function s(e,t={},r){await e.load(r);const n=(0,a.fj)(e.itemUrl,"resources"),{start:o=1,num:s=10,sortOrder:i="asc",sortField:c="resource"}=t,u={query:{start:o,num:s,sortOrder:i,sortField:c,token:e.apiKey},signal:r?.signal},l=await e.portal.request(n,u);return{total:l.total,nextStart:l.nextStart,resources:l.resources.map((({created:t,size:r,resource:n})=>({created:new Date(t),size:r,resource:e.resourceFromPath(n)})))}}async function i(e,t,r,n){const s=new Map;for(const{resource:e,content:n,compress:a,access:i}of t){if(!e.hasPath())throw new o.A(`portal-item-resource-${r}:invalid-path`,"Resource does not have a valid path");const[t,c]=l(e.path),u=`${t}/${a??""}/${i??""}`;s.has(u)||s.set(u,{prefix:t,compress:a,access:i,files:[]}),s.get(u).files.push({fileName:c,content:n})}await e.load(n);const i=(0,a.fj)(e.userItemUrl,"add"===r?"addResources":"updateResources");for(const{prefix:t,compress:r,access:o,files:a}of s.values()){const s=25;for(let c=0;c<a.length;c+=s){const u=a.slice(c,c+s),l=new FormData;t&&"."!==t&&l.append("resourcesPrefix",t),r&&l.append("compress","true"),o&&l.append("access",o);let p=0;for(const{fileName:e,content:t}of u)l.append("file"+ ++p,t,e);l.append("f","json"),await e.portal.request(i,{method:"post",body:l,signal:n?.signal})}}}async function c(e,t,r){if(!t.hasPath())throw new o.A("portal-item-resources-remove:invalid-path","Resource does not have a valid path");await e.load(r);const n=(0,a.fj)(e.userItemUrl,"removeResources");await e.portal.request(n,{method:"post",query:{resource:t.path},signal:r?.signal}),t.portalItem=null}async function u(e,t){await e.load(t);const r=(0,a.fj)(e.userItemUrl,"removeResources");return e.portal.request(r,{method:"post",query:{deleteAll:!0},signal:t?.signal})}function l(e){const t=e.lastIndexOf("/");return-1===t?[".",e]:[e.slice(0,t),e.slice(t+1)]}async function p(e){return"blob"===e.type?e.blob:"json"===e.type?new Blob([e.jsonString],{type:"application/json"}):(await(0,n.A)(e.url,{responseType:"blob"})).data}function f(e,t){if(!e.hasPath())return null;const[r,,n]=function(e){const[t,r]=function(e){const t=(0,a.Zo)(e);return null==t?[e,""]:[e.slice(0,e.length-t.length-1),`.${t}`]}(e),[n,o]=l(t);return[n,o,r]}(e.path);return e.portalItem.resourceFromPath((0,a.fj)(r,t+n))}},75007:function(e,t,r){r.d(t,{S:function(){return c},r:function(){return i}});var n=r(39819),o=r(60539),a=r(66110),s=r(55597);async function i(e,t,r){const n=await u(e,t,r);await l(n,t,r)}async function c(e,t,r,n,o){const a=await u(r,n,o);await e.update({data:t}),await l(a,n,o)}async function u(e,t,i){if(!t?.resources)return;const c=t.portalItem===e.portalItem?new Set(e.paths):new Set;e.paths.length=0,e.portalItem=t.portalItem;const u=new Set(t.resources.toKeep.map((e=>e.resource.path))),l=new Set,p=[];u.forEach((t=>{c.delete(t),e.paths.push(t)}));const f=[],d=[],m=[];for(const r of t.resources.toUpdate)if(c.delete(r.resource.path),u.has(r.resource.path)||l.has(r.resource.path)){const{resource:t,content:n,finish:o}=r,i=(0,s.bg)(t,(0,a.lk)());e.paths.push(i.path),f.push({resource:i,content:await(0,s.cL)(n),compress:r.compress}),o&&m.push((()=>o(i)))}else{e.paths.push(r.resource.path),d.push({resource:r.resource,content:await(0,s.cL)(r.content),compress:r.compress});const t=r.finish;t&&m.push((()=>t(r.resource))),l.add(r.resource.path)}for(const r of t.resources.toAdd)if(e.paths.push(r.resource.path),c.has(r.resource.path))c.delete(r.resource.path);else{f.push({resource:r.resource,content:await(0,s.cL)(r.content),compress:r.compress});const e=r.finish;e&&m.push((()=>e(r.resource)))}if(f.length||d.length){const{addOrUpdateResources:e}=await Promise.resolve().then(r.bind(r,55597));await e(t.portalItem,f,"add",i),await e(t.portalItem,d,"update",i)}if(m.forEach((e=>e())),0===p.length)return c;const h=await(0,o.Ol)(p);if((0,o.Te)(i),h.length>0)throw new n.A("save:resources","Failed to save one or more resources",{errors:h});return c}async function l(e,t,r){if(!e||!t.portalItem)return;const n=[];for(const o of e){const e=t.portalItem.resourceFromPath(o);n.push(e.portalItem.removeResource(e,r))}await(0,o.Lx)(n)}},46589:function(e,t,r){r.d(t,{X:function(){return s}});var n=r(25591),o=r(39819),a=r(48893);function s(e){if(n.default.apiKey&&(0,a.Q)(e.portal.url))throw new o.A("save-api-key-utils:api-key-not-supported",`Saving is not supported on ${e.portal.url} when using an api key`)}}}]);
//# sourceMappingURL=save-groupLayerUtils.js.map