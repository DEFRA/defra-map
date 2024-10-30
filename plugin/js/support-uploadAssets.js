"use strict";(self.webpackChunkdefraMap=self.webpackChunkdefraMap||[]).push([[9933],{22445:function(e,s,t){t.d(s,{$1:function(){return c},H2:function(){return f},MT:function(){return m},VP:function(){return h},WF:function(){return l},Wt:function(){return a},XQ:function(){return g},hK:function(){return d},nS:function(){return p},uh:function(){return i},xY:function(){return u}});var o=t(39819);const r="upload-assets",n=()=>new Error;class a extends o.A{constructor(){super(`${r}:unsupported`,"Layer does not support asset uploads.",n())}}class i extends o.A{constructor(){super(`${r}:no-glb-support`,"Layer does not support glb.",n())}}class u extends o.A{constructor(){super(`${r}:no-supported-source`,"No supported external source found",n())}}class c extends o.A{constructor(){super(`${r}:not-base-64`,"Expected gltf data in base64 format after conversion.",n())}}class l extends o.A{constructor(){super(`${r}:unable-to-prepare-options`,"Unable to prepare uploadAsset request options.",n())}}class p extends o.A{constructor(e,s){super(`${r}:bad-response`,`Bad response. Uploaded ${e} items and received ${s} results.`,n())}}class d extends o.A{constructor(e,s){super(`${r}-layer:upload-failed`,`Failed to upload mesh file ${e}. Error code: ${s?.code??"-1"}. Error message: ${s?.messages??"unknown"}`,n())}}class f extends o.A{constructor(e){super(`${r}-layer:unsupported-format`,`The service allowed us to upload an asset of FormatID ${e}, but it does not list it in its supported formats.`,n())}}class m extends o.A{constructor(){super(`${r}:convert3D-failed`,"convert3D failed.")}}class h extends o.A{constructor(){super("invalid-input:no-model","No supported model found")}}class g extends o.A{constructor(){super("invalid-input:multiple-models","Multiple supported models found")}}},71783:function(e,s,t){t.d(s,{uploadAssets:function(){return S}});var o=t(93040),r=t(58941),n=t(40633),a=t(60539),i=t(38504),u=t(90683),c=t(66110),l=t(23572),p=t(22445);const d={upload:{createFromFiles:.8,loadMesh:.2},uploadAssetBlobs:{prepareAssetItems:.9,uploadAssetItems:.1},uploadConvertibleSource:{uploadEditSource:.5,serviceAssetsToGlb:.5},uploadLocalMesh:{meshToAssetBlob:.5,uploadAssetBlobs:.5}};var f=t(93389),m=t(61226),h=t(25738);function g(e,s=(e=>{}),t){return new w(e,s,t)}class w{constructor(e,s=(e=>{}),t){if(this.onProgress=s,this.taskName=t,this._progressMap=new Map,this._startTime=void 0,this._timingsMap=new Map,"number"==typeof e){this._weights={};for(let s=0;s<e;s++){const t=s,o=1/e;this._weights[t]=o,this._progressMap.set(t,0)}}else this._weights=e;this.emitProgress()}emitProgress(){let e=0;for(const[s,t]of this._progressMap.entries())e+=t*this._weights[s];if(1===e&&(0,r.A)("enable-feature:esri-3dofl-upload-timings")){const e=Math.round(performance.now()-(this._startTime??0))/1e3;console.log(`${this.taskName} done in ${e} sec`);for(const[s,t]of this._timingsMap){const o=Math.round(t.end-t.start)/1e3,r=Math.round(o/e*100);console.log(this.taskName??"Task",{stepKey:s,stepTime:o,relativeTime:r})}}this.onProgress(e)}setProgress(e,s){if(this._progressMap.set(e,s),(0,r.A)("enable-feature:esri-3dofl-upload-timings")){const t=performance.now();this._startTime??=t;const o=(0,h.tE)(this._timingsMap,e,(()=>({start:t,end:0})));1===s&&(o.end=t)}this.emitProgress()}simulate(e,s){return y((s=>this.setProgress(e,s)),s)}makeOnProgress(e){return s=>this.setProgress(e,s)}}function y(e=(e=>{}),s=j){const t=performance.now();e(0);const o=setInterval((()=>{const o=performance.now()-t,r=1-Math.exp(-o/s);e(r)}),v);return(0,m.hA)((()=>{clearInterval(o),e(1)}))}function A(e,s=T){return(0,i.gr)((0,i.Kp)(e*b/s))}const T=10,P=10,b=8e-6,v=(0,i.l5)(50),j=(0,i.l5)(1e3),x=1e6,F=20*x,M=2e9,$=3;async function E({data:e,name:s,description:t},r,n){let i=null;try{const l=(0,u.fj)(r,"uploads"),p=(0,u.fj)(l,"info"),{data:d}=await(0,o.A)(p,{query:{f:"json"},responseType:"json"});(0,a.Te)(n);const m=(0,f.Wo)(r),h=d.maxUploadFileSize*x,w=m?M:h,y=m?Math.min(F,h):F;if(e.size>w)throw new Error("Data too large");const T=(0,u.fj)(l,"register"),{data:P}=await(0,o.A)(T,{query:{f:"json",itemName:(c=s,c.replaceAll("/","_").replaceAll("\\","_")),description:t},responseType:"json",method:"post"});if((0,a.Te)(n),!P.success)throw new Error("Registration failed");const{itemID:b}=P.item;i=(0,u.fj)(l,b);const v=(0,u.fj)(i,"uploadPart"),j=Math.ceil(e.size/y),E=new Array;for(let s=0;s<j;++s)E.push(e.slice(s*y,Math.min((s+1)*y,e.size)));const N=E.slice().reverse(),S=new Array,_=g(j,n?.onProgress,"uploadItem"),k=async()=>{for(;0!==N.length;){const e=E.length-N.length,s=N.pop(),t=new FormData,r=_.simulate(e,A(s.size));try{t.append("f","json"),t.append("file",s),t.append("partId",`${e}`);const{data:r}=await(0,o.A)(v,{timeout:0,body:t,responseType:"json",method:"post"});if((0,a.Te)(n),!r.success)throw new Error("Part upload failed")}finally{r.remove()}}};for(let e=0;e<$&&0!==N.length;++e)S.push(k());await Promise.all(S);const I=(0,u.fj)(i,"commit"),{data:D}=await(0,o.A)(I,{query:{f:"json",parts:E.map(((e,s)=>s)).join(",")},responseType:"json",method:"post"});if((0,a.Te)(n),!D.success)throw new Error("Commit failed");return D.item}catch(e){if(null!=i){const e=(0,u.fj)(i,"delete");await(0,o.A)(e,{query:{f:"json"},responseType:"json",method:"post"})}throw e}var c}var N=t(66228);async function S(e,s,t){const o=e.length;if(!o)return t?.onProgress?.(1),[];const r=g(o,t?.onProgress,"uploadAssets");return Promise.all(e.map(((e,o)=>async function(e,{layer:s,ongoingUploads:t},o){const r=t.get(e);if(r)return r;if(!function(e){return!!e.infoFor3D&&!!e.url}(s))throw new p.Wt;if(function(e,s){const{parsedUrl:t}=s;return null!=t&&e.metadata.externalSources.some((e=>(0,l.eN)(e,t)))}(e,s))return o?.onProgress?.(1),e;const n=async function(e,s,t){const{metadata:o}=e,{displaySource:r}=o,n=_(r?.source,s),u=!!n,l=o.externalSources.length>0,f=u?async function(e,s,t){return{source:await I(e,s,t),original:!0}}(n,s,t):l?async function(e,s,t){const o=O(s),{externalSources:r}=e.metadata,n=function(e,s){for(const t of e){const e=_(t.source,s);if(e)return e}return null}(r,s);if(!n)throw new p.xY;const a=g(d.uploadConvertibleSource,t?.onProgress,"uploadConvertibleSource"),u=await I(n,s,{onProgress:a.makeOnProgress("uploadEditSource")});e.addExternalSources([{source:u,original:!0}]);const c=n.reduce(((e,{asset:s})=>s instanceof File?e+s.size:e),0),l=a.simulate("serviceAssetsToGlb",function(e,s=P){return(0,i.gr)((0,i.Kp)(e*b/s))}(c));try{return{source:await B(u,s,o)}}finally{l.remove()}}(e,s,t):async function(e,s,t){const o=g(d.uploadLocalMesh,t?.onProgress,"uploadLocalMesh"),r=async function(e,s,t){const o=O(s),r=await e.load(t),n=await r.toBinaryGLTF({origin:r.origin,signal:t?.signal,ignoreLocalTransform:!0});return(0,a.Te)(t),{blob:new Blob([n],{type:"model/gltf-binary"}),assetName:`${(0,c.yS)()}.glb`,assetType:o}}(e,s,{...t,onProgress:o.makeOnProgress("meshToAssetBlob")});return{source:await D([r],s,{...t,onProgress:o.makeOnProgress("uploadAssetBlobs")}),extent:e.extent.clone(),original:!0}}(e,s,t),m=await f;return(0,a.Te)(t),e.addExternalSources([m]),e}(e,s,o);t.set(e,n);try{await n}finally{t.delete(e)}return e}(e,s,{...t,onProgress:r.makeOnProgress(o)}))))}function _(e,s){if(!e)return null;const{infoFor3D:{supportedFormats:t,editFormats:o}}=s,r=(0,l.WN)(e),n=new Array;let a=!1;for(let e=0;e<r.length;++e){const s=k(r[e],t);if(!s)return null;o.includes(s.assetType)&&(a=!0),n.push(s)}return a?n:null}function k(e,s){const t=(0,l.fH)(e,s);return t?{asset:e,assetType:t}:null}async function I(e,s,t){return D(e.map((e=>async function(e,s){const{asset:t,assetType:o}=e;if(t instanceof File)return{blob:t,assetName:t.name,assetType:o};const r=await t.toBlob(s);return(0,a.Te)(s),{blob:r,assetName:t.assetName,assetType:o}}(e,t))),s,t)}async function D(e,s,t){const o=g(d.uploadAssetBlobs,t?.onProgress,"uploadAssetBlobs"),r=await function(e,s,t){const o=g(e.length,t?.onProgress,"prepareAssetItems");return Promise.all(e.map((async(e,r)=>{const i=async function(e,s,t){const{blob:o,assetType:r,assetName:i}=e;let c=null;try{const e=await E({data:o,name:i},s.url,t);(0,a.Te)(t),c={assetType:r,assetUploadId:e.itemID}}catch(e){(0,a.QP)(e),n.A.getLogger("esri.layers.graphics.sources.support.uploadAssets").warnOnce(`Service ${s.url} does not support the REST Uploads API.`)}if(!c){const e=await(0,u._0)(o);if((0,a.Te)(t),!e.isBase64)throw new p.$1;c={assetType:r,assetData:e.data}}if(!c)throw new p.WF;return{item:c,assetName:i}}(await e,s,{...t,onProgress:o.makeOnProgress(r)});return(0,a.Te)(t),i})))}(e,s,{...t,onProgress:o.makeOnProgress("prepareAssetItems")});(0,a.Te)(t);const i=r.map((({item:e})=>e)),{uploadResults:c}=await U(i,s,{...t,onProgress:o.makeOnProgress("uploadAssetItems")});return(0,a.Te)(t),e.map(((e,t)=>function(e,s,t){const{success:o}=s;if(!o){const{error:t}=s;throw new p.hK(e.assetName,t)}const{assetHash:r}=s,{assetName:n,item:{assetType:a}}=e,{infoFor3D:{supportedFormats:i}}=t,u=(0,N.Fm)(a,i);if(!u)throw new p.H2(a);return new l.Qp(n,u,[new l.Bq(`${t.parsedUrl.path}/assets/${r}`,r)])}(r[t],c[t],s)))}async function U(e,s,t){const r=y(t?.onProgress);try{const r=await(0,o.A)((0,u.fj)(s.parsedUrl.path,"uploadAssets"),{timeout:0,query:{f:"json",assets:JSON.stringify(e)},method:"post",responseType:"json"});if((0,a.Te)(t),r.data.uploadResults.length!==e.length)throw new p.nS(e.length,r.data.uploadResults.length);return r.data}finally{r.remove()}}async function B(e,s,t){const o=e.map((({assetName:e,parts:s})=>({assetName:e,assetHash:s[0].partHash}))),r=s.capabilities?.operations.supportsAsyncConvert3D,n={f:"json",assets:JSON.stringify(o),transportType:"esriTransportTypeUrl",targetFormat:t,async:r},a=(0,u.fj)(s.parsedUrl.path,"convert3D");let i;try{i=(await(r?C:q)(a,{query:n,responseType:"json",timeout:0})).data}catch(e){throw new p.MT}const{supportedFormats:c}=s.infoFor3D;return i.assets.map((e=>{const s=(0,N.R_)(e.contentType,c);if(!s)throw new p.H2(s);return new l.Qp(e.assetName,e.contentType,[new l.Bq(e.assetURL,e.assetHash)])}))}function q(e,s){return(0,o.A)(e,s)}async function C(e,s){const t=(await(0,o.A)(e,s)).data.statusUrl;for(;;){const e=(await(0,o.A)(t,{query:{f:"json"},responseType:"json"})).data;switch(e.status){case"Completed":return(0,o.A)(e.resultUrl,{query:{f:"json"},responseType:"json"});case"CompletedWithErrors":throw new Error(e.status);case"Failed ImportChanges":case"InProgress":case"Pending":case"ExportAttachments":case"ExportChanges":case"ExportingData":case"ExportingSnapshot":case"ImportAttachments":case"ProvisioningReplica":case"UnRegisteringReplica":break;default:throw new Error}await(0,a.Pl)(R)}}function O(e){const{infoFor3D:s}=e,t=(0,N.R_)("model/gltf-binary",s.supportedFormats)??(0,N.E1)("glb",s.supportedFormats);if(!t)throw new p.uh;return t}const R=(0,i.l5)(1e3)}}]);
//# sourceMappingURL=support-uploadAssets.js.map