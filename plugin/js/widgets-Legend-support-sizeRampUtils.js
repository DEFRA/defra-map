"use strict";(self.webpackChunkdefraMap=self.webpackChunkdefraMap||[]).push([[3879],{53272:function(e,n,t){t.d(n,{getRampStops:function(){return D}});var l,o,i=t(52874),r=t(10748),s=t(37496),a=(t(39819),t(21609));function u(e){return"CIMVectorMarker"===e?.type?e.markerGraphics?.[0]:void 0}function c(e){return"CIMPolygonSymbol"===e?.symbol?.type?e.symbol.symbolLayers?.[0]:void 0}function f(e,n){"CIMVectorMarker"===e?.type&&null!=n&&(e.size=n)}function y(e,n){const t=u(e);t&&null!=n&&(t.geometry=function(e){switch(e){case"circle":return{rings:[[[8.5,.2],[7.06,.33],[5.66,.7],[4.35,1.31],[3.16,2.14],[2.14,3.16],[1.31,4.35],[.7,5.66],[.33,7.06],[.2,8.5],[.33,9.94],[.7,11.34],[1.31,12.65],[2.14,13.84],[3.16,14.86],[4.35,15.69],[5.66,16.3],[7.06,16.67],[8.5,16.8],[9.94,16.67],[11.34,16.3],[12.65,15.69],[13.84,14.86],[14.86,13.84],[15.69,12.65],[16.3,11.34],[16.67,9.94],[16.8,8.5],[16.67,7.06],[16.3,5.66],[15.69,4.35],[14.86,3.16],[13.84,2.14],[12.65,1.31],[11.34,.7],[9.94,.33],[8.5,.2]]]};case"square":return{rings:[[[.5,.5],[.5,16.5],[16.5,16.5],[16.5,.5],[.5,.5]]]};case"diamond":return{rings:[[[8.5,.5],[.2,8.5],[8.5,16.5],[16.5,8.5],[8.5,.5]]]};case"hexagon-pointy":return{rings:[[[15.86,12.75],[15.86,4.25],[8.5,0],[1.14,4.25],[1.14,12.75],[8.5,17],[15.86,12.75]]]};case"hexagon-flat":return{rings:[[[12.75,15.86],[17,8.5],[12.75,1.14],[4.25,1.14],[0,8.5],[4.25,15.86],[12.75,15.86]]]}}}(n))}function m(e,n){const t=c(u(e));t&&null!=n&&(t.color=n.toArray())}function p(e,n,t){const l=c(u(e));l&&null!=n&&t&&(l.colorLocked=n)}function d(e,n){const{outerRingSize:t,innerDotSize:o,type:i,color:r,colorLocked:s,primitiveOverrides:u}=n,c="CIMPolygonSymbol"===e.data.symbol?.type?e.data.symbol.symbolLayers:null;if(2===c?.length)for(const e of c){const n=e.primitiveName===l.OuterRing;f(e,n?t:o),y(e,i),m(e,r),p(e,s,n)}return null!=t&&null!=o&&(e.data.primitiveOverrides=null),void 0!==u&&(e.data.primitiveOverrides=(0,a.o8)(u)),e}t(59423),t(33389),t(38164),(o=l||(l={})).OuterRing="reference-size-outer-ring",o.InnerDot="reference-size-inner-dot";var b=t(77927),h=t(89814),g=t(72504),v=(t(20457),t(93839)),w=t(90363),z=t(22198);const S=30,k=12,I=24,L=[255,255,255],x=[200,200,200],M=[128,128,128],C=20,V=5;async function D(e,n,l,o,i,r,a){const u=n.legendOptions,c=u?.customValues,f=a||await R(e,l),y=n.stops,m=!!f,p=!!c,d=null!=n.minSize&&null!=n.maxSize,b=y&&y.length>1,v=!!n.target;if(!m||!p&&!(d||b&&!v))return;const w=(0,h.$d)(f);let z=!1,S=null,k=null;S=w&&!b?(0,s.LI)([n.minDataValue,n.maxDataValue]):c??await async function(e,n,l,o){const i=(await Promise.resolve().then(t.bind(t,70481))).getSizeRangeAtScale(e,l,o),r=i&&E(i);if(!i||!r)return;let a=r.map((n=>function(e,n,t){const l=t.minSize,o=t.maxSize,i=n.minDataValue,r=n.maxDataValue;let s;return s=e<=l?i:e>=o?r:(e-l)/(o-l)*(r-i)+i,s}(n,e,i)));a=(0,s.LI)(a);for(let t=1;t<a.length-1;t++){const i=await T(e,n,a[t],a[t-1],l,o);i&&(a[t]=i[0],r[t]=i[1])}return a}(n,f,o,i?.type);const L=e?.authoringInfo,x="univariate-color-size"===L?.type,M=x&&"above-and-below"===L?.univariateTheme,C=!!(0,g._l)(e);if(!S&&b&&(S=y.map((e=>e.value)),z=y.some((e=>!!e.label)),"flow"===e.type&&(S=(0,s.LI)(S)),z&&(k=y.map((e=>e.label)))),w&&null!=S&&S?.length>2&&!M&&(S=[S[0],S[S.length-1]]),!S)return null;x&&5!==S?.length&&(S=E({minSize:S[0],maxSize:S[S.length-1]}));const V=w?A(e,S):null,D=(0,h.k_)(f),q=z?null:function(e,n){const t=e.length-1;return e.map(((e,l)=>(0,g.Dd)(e,l,t,n)))}(S,r);return(await Promise.all(S.map((async(t,r)=>{const s=w?V[r]:await $(n,f,t,o,i?.type);return{value:t,symbol:!C||"class-breaks"!==e.type&&"unique-value"!==e.type?_(M&&"class-breaks"===e.type?P(e,r):f,s):O(e,s,n.maxSize,l)??f,label:z?k[r]:q[r],size:C?I:s,outlineSize:D}})))).reverse()}function A(e,n){const t=e?.authoringInfo,l="univariate-color-size"===t?.type;let o=[k,S];if(l){const e=n[0],t=n[n.length-1],l=k,i=S;o=n.map((n=>l+(n-e)/(t-e)*(i-l)))}return l&&"below"===t?.univariateTheme&&o.reverse(),o}function O(e,n,t,l){const o="class-breaks"===e.type,r=o?e.classBreakInfos?.[0]?.symbol?.clone():e.uniqueValueInfos?.[0]?.symbol?.clone();return r&&"type"in r&&"cim"===r.type?(d(r,{color:l??(o?null:new i.A(x)),innerDotSize:n*(I/t)||1,outerRingSize:I}),r):null}function P(e,n){const t=e.classBreakInfos,l=t.length,o=l<2||!(n>=2)?t[0].symbol.clone():t[l-1].symbol.clone();return e.visualVariables.some((e=>"color"===e.type))&&(o.type.includes("3d")?q(o):B(o)),o}async function R(e,n){if("flow"===e.type)return(0,g.Zo)(e,n);if("pie-chart"===e.type)return new w.A({color:null,outline:e.outline?.width?e.outline:new z.A});let t=null,l=null;if("simple"===e.type)t=e.symbol;else if("class-breaks"===e.type){const n=e.classBreakInfos;t=n&&n[0]&&n[0].symbol,l=n.length>1}else if("unique-value"===e.type){const n=e.uniqueValueInfos;t=n?.[0]?.symbol,l=null!=n&&n.length>1}return!t||function(e){return!!e&&((0,r.wk)(e)?!!e.symbolLayers&&e.symbolLayers.some((e=>e&&"fill"===e.type)):e.type.includes("fill"))}(t)?null:(t=t.clone(),(n||l)&&(t.type.includes("3d")?q(t):B(t)),t)}function q(e){"line-3d"===e.type?e.symbolLayers.forEach((e=>{e.material={color:M}})):e.symbolLayers.forEach((e=>{"icon"!==e.type||e.resource?.href?e.material={color:x}:(e.material={color:L},e.outline={color:M,size:1.5})}))}function B(e){const n=(0,v.g4)();if("cim"===e.type)(0,b.Fe)(e,new i.A(x));else if(e.type.includes("line"))e.color=M;else if(e.color=n?M:L,"simple-marker"===e.type)if(e.outline){const n=e.outline?.color?.toHex();"#ffffff"===n&&(e.outline.color=M)}else e.outline={color:M,width:1.5}}function E(e){const n=e.minSize,t=e.maxSize,l=V,o=(t-n)/(l-1),i=[];for(let e=0;e<l;e++)i.push(n+o*e);return i}async function T(e,n,t,l,o,i){const r=await $(e,n,t,o,i),a=await $(e,n,l,o,i),u=(0,s.lc)(t),c=u.fractional,f=C;let y=u.integer,m=null,p=null;t>0&&t<1&&(m=10**c,y=(0,s.lc)(t*=m).integer);for(let l=y-1;l>=0;l--){const u=10**l;let c=Math.floor(t/u)*u,y=Math.ceil(t/u)*u;null!=m&&(c/=m,y/=m);let d=(c+y)/2;[,d]=(0,s.LI)([c,d,y],{indexes:[1]});const b=await $(e,n,c,o,i),h=await $(e,n,y,o,i),g=await $(e,n,d,o,i),v=(0,s.u5)(r,b,a,null),w=(0,s.u5)(r,h,a,null),z=(0,s.u5)(r,g,a,null);let S=v.previous<=f,k=w.previous<=f;if(S&&k&&(v.previous<=w.previous?(S=!0,k=!1):(k=!0,S=!1)),S?p=[c,b]:k?p=[y,h]:z.previous<=f&&(p=[d,g]),p)break}return p}async function $(e,n,l,o,i){const{getSize:r}=await Promise.resolve().then(t.bind(t,70481));return r(e,l,{scale:o,view:i,shape:"simple-marker"===n.type?n.style:null})}function _(e,n){const t=e.clone();if((0,r.wk)(t))(0,h.$d)(t)||t.symbolLayers.forEach((e=>{"fill"!==e.type&&(e.size=n)}));else if(function(e){return"esri.symbols.SimpleMarkerSymbol"===e.declaredClass}(t))t.size=n;else if(function(e){return"esri.symbols.PictureMarkerSymbol"===e.declaredClass}(t)){const e=t.width,l=t.height;t.height=n,t.width=n*(e/l)}else!function(e){return"esri.symbols.SimpleLineSymbol"===e.declaredClass}(t)?function(e){return"esri.symbols.TextSymbol"===e.declaredClass}(t)&&t.font&&(t.font.size=n):t.width=n;return t}}}]);
//# sourceMappingURL=widgets-Legend-support-sizeRampUtils.js.map