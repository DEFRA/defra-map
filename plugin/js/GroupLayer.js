"use strict";(self.webpackChunkdefraMap=self.webpackChunkdefraMap||[]).push([[9883],{84232:function(e,t,r){r.d(t,{A:function(){return u}});var i=r(53804),n=r(78879),s=(r(77472),r(39819),r(40633),r(91003),r(25638)),a=r(23502),o=r(65953);let l=class extends n.A{constructor(e){super(e),this.getCollections=null}initialize(){this.addHandles((0,s.fm)((()=>this._refresh())))}destroy(){this.getCollections=null}_refresh(){const e=null!=this.getCollections?this.getCollections():null;if(null==e)return void this.removeAll();let t=0;for(const r of e)null!=r&&(t=this._processCollection(t,r));this.splice(t,this.length)}_createNewInstance(e){return new n.A(e)}_processCollection(e,t){if(!t)return e;const r=this.itemFilterFunction??(e=>!!e);for(const i of t)if(i){if(r(i)){const t=this.indexOf(i,e);t>=0?t!==e&&this.reorder(i,e):this.add(i,e),++e}if(this.getChildrenFunction){const t=this.getChildrenFunction(i);if(Array.isArray(t))for(const r of t)e=this._processCollection(e,r);else e=this._processCollection(e,t)}}return e}};(0,i._)([(0,a.MZ)()],l.prototype,"getCollections",void 0),(0,i._)([(0,a.MZ)()],l.prototype,"getChildrenFunction",void 0),(0,i._)([(0,a.MZ)()],l.prototype,"itemFilterFunction",void 0),l=(0,i._)([(0,o.$)("esri.core.CollectionFlattener")],l);const u=l},77793:function(e,t,r){r.d(t,{P:function(){return b},L:function(){return w}});var i=r(53804),n=r(83525),s=r(90194),a=r(21609),o=r(72977);class l{constructor(){this._propertyOriginMap=new Map,this._originStores=new Array(o.AU),this._values=new Map,this.multipleOriginsSupported=!0}clone(e){const t=new l,r=this._originStores[o.Gr.DEFAULTS];r&&r.forEach(((e,r)=>{t.set(r,(0,a.o8)(e),o.Gr.DEFAULTS)}));for(let r=o.Gr.SERVICE;r<o.AU;r++){const i=this._originStores[r];i&&i.forEach(((i,n)=>{e&&e.has(n)||t.set(n,(0,a.o8)(i),r)}))}return t}get(e,t){const r=void 0===t?this._values:this._originStores[t];return r?r.get(e):void 0}keys(e){const t=null==e?this._values:this._originStores[e];return t?[...t.keys()]:[]}set(e,t,r=o.Gr.USER){let i=this._originStores[r];if(i||(i=new Map,this._originStores[r]=i),i.set(e,t),!this._values.has(e)||this._propertyOriginMap.get(e)<=r){const i=this._values.get(e);return this._values.set(e,t),this._propertyOriginMap.set(e,r),i!==t}return!1}delete(e,t=o.Gr.USER){const r=this._originStores[t];if(!r)return;const i=r.get(e);if(r.delete(e),this._values.has(e)&&this._propertyOriginMap.get(e)===t){this._values.delete(e);for(let r=t-1;r>=0;r--){const t=this._originStores[r];if(t&&t.has(e)){this._values.set(e,t.get(e)),this._propertyOriginMap.set(e,r);break}}}return i}has(e,t){const r=void 0===t?this._values:this._originStores[t];return!!r&&r.has(e)}revert(e,t){for(;t>0&&!this.has(e,t);)--t;const r=this._originStores[t],i=r?.get(e),n=this._values.get(e);return this._values.set(e,i),this._propertyOriginMap.set(e,t),n!==i}originOf(e){return this._propertyOriginMap.get(e)||o.Gr.DEFAULTS}forEach(e){this._values.forEach(e)}}var u=r(97354),d=r(63693),c=r(65953);const p=e=>{let t=class extends e{constructor(...e){super(...e);const t=(0,d.oY)(this),r=t.store,i=new l;t.store=i,(0,s.k)(t,r,i)}read(e,t){(0,u.L)(this,e,t)}getAtOrigin(e,t){const r=y(this),i=(0,o.aB)(t);if("string"==typeof e)return r.get(e,i);const n={};return e.forEach((e=>{n[e]=r.get(e,i)})),n}originOf(e){return(0,o.OL)(this.originIdOf(e))}originIdOf(e){return y(this).originOf(e)}revert(e,t){const r=y(this),i=(0,o.aB)(t),n=(0,d.oY)(this);let s;s="string"==typeof e?"*"===e?r.keys(i):[e]:e,s.forEach((e=>{n.invalidate(e),r.revert(e,i),n.commit(e)}))}};return t=(0,i._)([(0,c.$)("esri.core.ReadOnlyMultiOriginJSONSupport")],t),t};function y(e){return(0,d.oY)(e).store}let h=class extends(p(n.A)){};h=(0,i._)([(0,c.$)("esri.core.ReadOnlyMultiOriginJSONSupport")],h);var f=r(62664),g=r(99495);const m=e=>{let t=class extends e{constructor(...e){super(...e)}clear(e,t="user"){return v(this).delete(e,(0,o.aB)(t))}write(e,t){return(0,g.M)(this,e=e||{},t),e}setAtOrigin(e,t,r){(0,d.oY)(this).setAtOrigin(e,t,(0,o.aB)(r))}removeOrigin(e){const t=v(this),r=(0,o.aB)(e),i=t.keys(r);for(const e of i)t.originOf(e)===r&&t.set(e,t.get(e,r),o.Gr.USER)}updateOrigin(e,t){const r=v(this),i=(0,o.aB)(t),n=(0,f.Jt)(this,e);for(let t=i+1;t<o.AU;++t)r.delete(e,t);r.set(e,n,i)}toJSON(e){return this.write({},e)}};return t=(0,i._)([(0,c.$)("esri.core.MultiOriginJSONSupport.WriteableMultiOriginJSONSupport")],t),t.prototype.toJSON.isDefaultToJSON=!0,t};function v(e){return(0,d.oY)(e).store}const b=e=>{let t=class extends(m(p(e))){constructor(...e){super(...e)}};return t=(0,i._)([(0,c.$)("esri.core.MultiOriginJSONSupport")],t),t};let w=class extends(b(n.A)){};w=(0,i._)([(0,c.$)("esri.core.MultiOriginJSONSupport")],w)},64786:function(e,t,r){r.d(t,{K:function(){return i}});const i=["operational-layers","basemap","ground"]},75218:function(e,t,r){r.d(t,{L:function(){return o},g:function(){return a}});var i=r(77472),n=r(78879),s=r(31609);async function a(e,t){return await e.load(),o(e,t)}async function o(e,t){const r=[],a=(...e)=>{for(const t of e)null!=t&&(Array.isArray(t)?a(...t):n.A.isCollection(t)?t.forEach((e=>a(e))):s.A.isLoadable(t)&&r.push(t))};t(a);let o=null;if(await(0,i.Tj)(r,(async e=>{const t=await(0,i.Ke)(function(e){return"loadAll"in e&&"function"==typeof e.loadAll}(e)?e.loadAll():e.load());!1!==t.ok||o||(o=t)})),o)throw o.error;return e}},1778:function(e,t,r){r.r(t),r.d(t,{default:function(){return G}});var i=r(53804),n=r(84232),s=r(75218),a=r(40633),o=r(77793),l=r(60539),u=r(28181),d=r(23502),c=(r(58941),r(13798),r(63693)),p=r(47332),y=r(65953),h=r(81392),f=r(72977),g=r(20833),m=r(1615),v=r(92078),b=r(61380),w=r(18195),S=r(74712),L=r(43173),I=r(33848),_=r(25170),A=r(53687),M=r(91820),O=r(91448),E=r(4584),T=r(84624);let C=class extends((0,m.dM)((0,w.j)((0,v.q)((0,b.A)((0,A.l)((0,_.Q)((0,o.P)(g.A)))))))){constructor(e){super(e),this.allLayers=new n.A({getCollections:()=>[this.layers],getChildrenFunction:e=>"layers"in e?e.layers:null}),this.allTables=(0,I.Z)(this),this.fullExtent=void 0,this.operationalLayerType="GroupLayer",this.spatialReference=void 0,this.type="group",this._debouncedSaveOperations=(0,l.sg)((async(e,t,i)=>{const{save:n,saveAs:s}=await r.e(396).then(r.bind(r,9413));switch(e){case O.X.SAVE:return n(this,t);case O.X.SAVE_AS:return s(this,i,t)}}))}initialize(){this._enforceVisibility(this.visibilityMode,this.visible),this.addHandles([(0,u.watch)((()=>{let e=this.parent;for(;e&&"parent"in e&&e.parent;)e=e.parent;return e&&M.X in e}),(e=>{const t="prevent-adding-tables";this.removeHandles(t),e&&(this.tables.removeAll(),this.addHandles((0,u.on)((()=>this.tables),"before-add",(e=>{e.preventDefault(),a.A.getLogger(this).errorOnce("tables","tables in group layers in a webscene are not supported. Please move the tables from the group layer to the webscene if you want to persist them.")})),t))}),u.pc),(0,u.watch)((()=>this.visible),this._onVisibilityChange.bind(this),u.OH)])}destroy(){this.allLayers.destroy(),this.allTables.destroy()}get sourceIsPortalItem(){return this.portalItem&&this.originIdOf("portalItem")===f.Gr.USER}_writeLayers(e,t,r,i){const n=[];if(!e)return n;e.forEach((e=>{const t=(0,T.CJ)(e,i.webmap?i.webmap.getLayerJSONFromResourceInfo(e):null,i);t?.layerType&&n.push(t)})),t.layers=n}set portalItem(e){this._set("portalItem",e)}readPortalItem(e,t,r){const{itemId:i,layerType:n}=t;if("GroupLayer"===n&&i)return new L.default({id:i,portal:r?.portal})}writePortalItem(e,t){e?.id&&(t.itemId=e.id)}set visibilityMode(e){const t=this._get("visibilityMode")!==e;this._set("visibilityMode",e),t&&this._enforceVisibility(e,this.visible)}async beforeSave(){return(0,E.d)(this)}load(e){const t=this.loadFromPortal({supportedTypes:["Feature Service","Feature Collection","Group Layer","Scene Service"],layerModuleTypeMap:S.S},e).catch((e=>{if((0,l.QP)(e),this.sourceIsPortalItem)throw e}));return this.addResolvingPromise(t),Promise.resolve(this)}async loadAll(){return(0,s.g)(this,(e=>{e(this.layers,this.tables)}))}async save(e){return this._debouncedSaveOperations(O.X.SAVE,e)}async saveAs(e,t){return this._debouncedSaveOperations(O.X.SAVE_AS,t,e)}layerAdded(e){e.visible&&"exclusive"===this.visibilityMode?this._turnOffOtherLayers(e):"inherited"===this.visibilityMode&&(e.visible=this.visible),this.hasHandles(e.uid)?console.error(`Layer read to Grouplayer: uid=${e.uid}`):this.addHandles((0,u.watch)((()=>e.visible),(t=>this._onChildVisibilityChange(e,t)),u.OH),e.uid)}layerRemoved(e){this.removeHandles(e.uid),this._enforceVisibility(this.visibilityMode,this.visible)}_turnOffOtherLayers(e){this.layers.forEach((t=>{t!==e&&(t.visible=!1)}))}_enforceVisibility(e,t){if(!(0,c.oY)(this).initialized)return;const r=this.layers;let i=r.find((e=>e.visible));switch(e){case"exclusive":r.length&&!i&&(i=r.at(0),i.visible=!0),this._turnOffOtherLayers(i);break;case"inherited":r.forEach((e=>{e.visible=t}))}}_onVisibilityChange(e){"inherited"===this.visibilityMode&&this.layers.forEach((t=>{t.visible=e}))}_onChildVisibilityChange(e,t){switch(this.visibilityMode){case"exclusive":t?this._turnOffOtherLayers(e):this._isAnyLayerVisible()||(e.visible=!0);break;case"inherited":e.visible=this.visible}}_isAnyLayerVisible(){return this.layers.some((e=>e.visible))}};(0,i._)([(0,d.MZ)({readOnly:!0,dependsOn:[]})],C.prototype,"allLayers",void 0),(0,i._)([(0,d.MZ)({readOnly:!0})],C.prototype,"allTables",void 0),(0,i._)([(0,d.MZ)({json:{read:!0,write:!0}})],C.prototype,"blendMode",void 0),(0,i._)([(0,d.MZ)()],C.prototype,"fullExtent",void 0),(0,i._)([(0,d.MZ)({readOnly:!0})],C.prototype,"sourceIsPortalItem",null),(0,i._)([(0,d.MZ)({json:{read:!1,write:{ignoreOrigin:!0}}})],C.prototype,"layers",void 0),(0,i._)([(0,h.K)("layers")],C.prototype,"_writeLayers",null),(0,i._)([(0,d.MZ)({type:["GroupLayer"]})],C.prototype,"operationalLayerType",void 0),(0,i._)([(0,d.MZ)({json:{origins:{"web-map":{read:!1,write:{overridePolicy(e,t,r){return{enabled:"Group Layer"===e?.type&&r?.initiator!==this}}}},"web-scene":{read:!1,write:!1}}}})],C.prototype,"portalItem",null),(0,i._)([(0,p.w)("web-map","portalItem",["itemId"])],C.prototype,"readPortalItem",null),(0,i._)([(0,h.K)("web-map","portalItem",{itemId:{type:String}})],C.prototype,"writePortalItem",null),(0,i._)([(0,d.MZ)()],C.prototype,"spatialReference",void 0),(0,i._)([(0,d.MZ)({json:{read:!1},readOnly:!0,value:"group"})],C.prototype,"type",void 0),(0,i._)([(0,d.MZ)({type:["independent","inherited","exclusive"],value:"independent",json:{write:!0,origins:{"web-map":{type:["independent","exclusive"],write:(e,t,r)=>{"inherited"!==e&&(t[r]=e)}}}}})],C.prototype,"visibilityMode",null),C=(0,i._)([(0,y.$)("esri.layers.GroupLayer")],C);const G=C},92078:function(e,t,r){r.d(t,{q:function(){return w}});var i=r(53804),n=r(30580),s=r(39819),a=r(90683),o=r(23502),l=r(67888),u=(r(13798),r(58941),r(47332)),d=r(65953),c=r(81392),p=r(64786),y=r(97354),h=r(99495);const f={ArcGISAnnotationLayer:!0,ArcGISDimensionLayer:!0,ArcGISFeatureLayer:!0,ArcGISImageServiceLayer:!0,ArcGISImageServiceVectorLayer:!0,ArcGISMapServiceLayer:!0,ArcGISStreamLayer:!0,ArcGISTiledImageServiceLayer:!0,ArcGISTiledMapServiceLayer:!0,BingMapsAerial:!0,BingMapsHybrid:!0,BingMapsRoad:!0,CatalogLayer:!0,CSV:!0,GeoJSON:!0,GeoRSS:!0,GroupLayer:!0,KML:!0,KnowledgeGraphLayer:!0,MediaLayer:!0,OGCFeatureLayer:!0,OrientedImageryLayer:!0,SubtypeGroupLayer:!0,VectorTileLayer:!0,WFS:!0,WMS:!0,WebTiledLayer:!0},g={ArcGISImageServiceLayer:!0,ArcGISImageServiceVectorLayer:!0,ArcGISMapServiceLayer:!0,ArcGISTiledImageServiceLayer:!0,ArcGISTiledMapServiceLayer:!0,BingMapsAerial:!0,BingMapsHybrid:!0,BingMapsRoad:!0,OpenStreetMap:!0,VectorTileLayer:!0,WMS:!0,WebTiledLayer:!0},m={ArcGISFeatureLayer:!0,SubtypeGroupTable:!0},v={"web-scene/operational-layers":{ArcGISDimensionLayer:!0,ArcGISFeatureLayer:!0,ArcGISImageServiceLayer:!0,ArcGISMapServiceLayer:!0,ArcGISSceneServiceLayer:!0,ArcGISTiledElevationServiceLayer:!0,ArcGISTiledImageServiceLayer:!0,ArcGISTiledMapServiceLayer:!0,BuildingSceneLayer:!0,CatalogLayer:!0,CSV:!0,GeoJSON:!0,GroupLayer:!0,IntegratedMesh3DTilesLayer:!0,IntegratedMeshLayer:!0,KML:!0,LineOfSightLayer:!0,MediaLayer:!0,OGCFeatureLayer:!0,PointCloudLayer:!0,RasterDataLayer:!0,VectorTileLayer:!0,Voxel:!0,WFS:!0,WMS:!0,WebTiledLayer:!0},"web-scene/basemap":{ArcGISImageServiceLayer:!0,ArcGISMapServiceLayer:!0,ArcGISSceneServiceLayer:!0,ArcGISTiledImageServiceLayer:!0,ArcGISTiledMapServiceLayer:!0,OpenStreetMap:!0,VectorTileLayer:!0,WMS:!0,WebTiledLayer:!0},"web-scene/ground":{ArcGISTiledElevationServiceLayer:!0,RasterDataElevationLayer:!0},"web-scene/tables":{ArcGISFeatureLayer:!0},"web-map/operational-layers":f,"web-map/basemap":g,"web-map/tables":m,"link-chart/operational-layers":{...f,LinkChartLayer:!0},"link-chart/basemap":g,"link-chart/tables":m,"portal-item/operational-layers":{ArcGISFeatureLayer:!0,ArcGISImageServiceLayer:!0,ArcGISSceneServiceLayer:!0,ArcGISStreamLayer:!0,ArcGISTiledImageServiceLayer:!0,BuildingSceneLayer:!0,IntegratedMesh3DTilesLayer:!0,IntegratedMeshLayer:!0,MediaLayer:!0,OrientedImageryLayer:!0,PointCloudLayer:!0,SubtypeGroupLayer:!0}};var b=r(7010);const w=e=>{let t=class extends e{constructor(){super(...arguments),this.persistenceEnabled=!0,this.title=null}readId(e,t,r){return"Group Layer"===r?.portalItem?.type?void 0:e}writeListMode(e,t,r,i){(i&&"ground"===i.layerContainerType||e&&(0,h.R)(this,r,{},i))&&(t[r]=e)}writeOperationalLayerType(e,t,r,i){e&&"tables"!==i?.layerContainerType&&(t.layerType=e)}writeTitle(e,t){t.title=e??"Layer"}readTimeExtent(e){return e?n.A.fromArray(e):null}writeTimeExtent(e,t,r,i){e&&"tables"!==i.layerContainerType&&(e.isEmpty?i?.messages&&i.messages.push(new s.A("layer:invalid-visibilityTimeExtent","visibilityTimeExtent cannot be empty")):t[r]=e.toArray())}read(e,t){t&&(t.layer=this),(0,y.t)(this,e,(t=>super.read(e,t)),t)}write(e,t){if(!this.persistenceEnabled&&!t?.ignorePersistenceEnabled)return null;if(t?.origin){const e=`${t.origin}/${t.layerContainerType||"operational-layers"}`,r=v[e];let i=!!r?.[this.operationalLayerType];if("ArcGISTiledElevationServiceLayer"===this.operationalLayerType&&"web-scene/operational-layers"===e&&(i=!1),"ArcGISDimensionLayer"===this.operationalLayerType&&"web-map/operational-layers"===e&&(i=!1),!i)return t.messages?.push(new s.A("layer:unsupported",`Layers (${this.title}, ${this.id}) of type '${this.declaredClass}' are not supported in the context of '${e}'`,{layer:this})),null}const r=super.write(e,{...t,layer:this}),i=!!t&&!!t.messages&&!!t.messages.filter((e=>e instanceof s.A&&"web-document-write:property-required"===e.name)).length;return(0,a.w8)(r?.url)?(t?.messages?.push(new s.A("layer:invalid-url",`Layer (${this.title}, ${this.id}) of type '${this.declaredClass}' using a Blob URL cannot be written to web scenes and web maps`,{layer:this})),null):!this.url&&i?null:r}beforeSave(){}};return(0,i._)([(0,o.MZ)({type:String,json:{write:{ignoreOrigin:!0},origins:{"web-scene":{write:{isRequired:!0,ignoreOrigin:!0}},"portal-item":{write:!1}}}})],t.prototype,"id",void 0),(0,i._)([(0,u.w)("id",["id"])],t.prototype,"readId",null),(0,i._)([(0,o.MZ)(b.C1)],t.prototype,"listMode",void 0),(0,i._)([(0,c.K)("listMode")],t.prototype,"writeListMode",null),(0,i._)([(0,o.MZ)({type:String,readOnly:!0,json:{read:!1,write:{target:"layerType",ignoreOrigin:!0},origins:{"portal-item":{write:!1},"web-scene":{name:"layerType",read:!1,write:{enabled:!0,ignoreOrigin:!0,layerContainerTypes:p.K}}}}})],t.prototype,"operationalLayerType",void 0),(0,i._)([(0,c.K)("operationalLayerType")],t.prototype,"writeOperationalLayerType",null),(0,i._)([(0,o.MZ)(b.ke)],t.prototype,"opacity",void 0),(0,i._)([(0,o.MZ)({type:Boolean,readOnly:!1})],t.prototype,"persistenceEnabled",void 0),(0,i._)([(0,o.MZ)({type:String,json:{write:{ignoreOrigin:!0,writerEnsuresNonNull:!0},origins:{"web-scene":{write:{isRequired:!0,ignoreOrigin:!0,writerEnsuresNonNull:!0}},"portal-item":{write:!1}}},value:"Layer"})],t.prototype,"title",void 0),(0,i._)([(0,c.K)("title"),(0,c.K)(["web-scene"],"title")],t.prototype,"writeTitle",null),(0,i._)([(0,o.MZ)({type:n.A,json:{origins:{"web-scene":{write:{layerContainerTypes:p.K}}}}})],t.prototype,"visibilityTimeExtent",void 0),(0,i._)([(0,u.w)("visibilityTimeExtent")],t.prototype,"readTimeExtent",null),(0,i._)([(0,c.K)(["portal-item","web-map","web-scene"],"visibilityTimeExtent",{visibilityTimeExtent:{type:[[l.jz,l.Uv]]}})],t.prototype,"writeTimeExtent",null),(0,i._)([(0,o.MZ)({type:Boolean,json:{origins:{"web-scene":{name:"visibility",write:{enabled:!0,layerContainerTypes:p.K}}},name:"visibility",write:!0}})],t.prototype,"visible",void 0),t=(0,i._)([(0,d.$)("esri.layers.mixins.OperationalLayer")],t),t}},61380:function(e,t,r){r.d(t,{A:function(){return L}});var i=r(53804),n=r(25591),s=r(7156),a=r(93040),o=r(77472),l=r(39819),u=r(40633),d=r(95929),c=r(60539),p=r(90683),y=r(23502),h=(r(58941),r(13798),r(47332)),f=r(65953),g=r(81392),m=r(11432),v=r(51432),b=r(43173),w=r(85956),S=r(29606);const L=e=>{let t=class extends e{constructor(){super(...arguments),this.resourceReferences={portalItem:null,paths:[]},this.userHasEditingPrivileges=!0,this.userHasFullEditingPrivileges=!1,this.userHasUpdateItemPrivileges=!1}destroy(){this.portalItem=(0,d.pR)(this.portalItem),this.resourceReferences.portalItem=null,this.resourceReferences.paths.length=0}set portalItem(e){e!==this._get("portalItem")&&(this.removeOrigin("portal-item"),this._set("portalItem",e))}readPortalItem(e,t,r){if(t.itemId)return new b.default({id:t.itemId,portal:r?.portal})}writePortalItem(e,t){e?.id&&(t.itemId=e.id)}async loadFromPortal(e,t){if(this.portalItem?.id)try{const{load:i}=await r.e(1536).then(r.bind(r,58615));return(0,c.Te)(t),await i({instance:this,supportedTypes:e.supportedTypes,validateItem:e.validateItem,supportsData:e.supportsData,layerModuleTypeMap:e.layerModuleTypeMap},t)}catch(e){throw(0,c.zf)(e)||u.A.getLogger(this).warn(`Failed to load layer (${this.title}, ${this.id}) portal item (${this.portalItem.id})\n  ${e}`),e}}async finishLoadEditablePortalLayer(e){this._set("userHasEditingPrivileges",await this._fetchUserHasEditingPrivileges(e).catch((e=>((0,c.QP)(e),!0))))}async setUserPrivileges(e,t){if(!n.default.userPrivilegesApplied)return this.finishLoadEditablePortalLayer(t);if(this.url)try{const{features:{edit:r,fullEdit:i},content:{updateItem:n}}=await this._fetchUserPrivileges(e,t);this._set("userHasEditingPrivileges",r),this._set("userHasFullEditingPrivileges",i),this._set("userHasUpdateItemPrivileges",n)}catch(e){(0,c.QP)(e)}}async _fetchUserPrivileges(e,t){let r=this.portalItem;if(!e||!r||!r.loaded||r.sourceUrl)return this._fetchFallbackUserPrivileges(t);const i=e===r.id;if(i&&r.portal.user)return(0,S.It)(r);let n,a;if(i)n=r.portal.url;else try{n=await(0,m.wI)(this.url,t)}catch(e){(0,c.QP)(e)}if(!n||!(0,p.b8)(n,r.portal.url))return this._fetchFallbackUserPrivileges(t);try{const e=null!=t?t.signal:null;a=await(s.id?.getCredential(`${n}/sharing`,{prompt:!1,signal:e}))}catch(e){(0,c.QP)(e)}if(!a)return{features:{edit:!0,fullEdit:!1},content:{updateItem:!1}};try{if(i?await r.reload():(r=new b.default({id:e,portal:{url:n}}),await r.load(t)),r.portal.user)return(0,S.It)(r)}catch(e){(0,c.QP)(e)}return{features:{edit:!0,fullEdit:!1},content:{updateItem:!1}}}async _fetchFallbackUserPrivileges(e){let t=!0;try{t=await this._fetchUserHasEditingPrivileges(e)}catch(e){(0,c.QP)(e)}return{features:{edit:t,fullEdit:!1},content:{updateItem:!1}}}async _fetchUserHasEditingPrivileges(e){const t=this.url?s.id?.findCredential(this.url):null;if(!t)return!0;const r=I.credential===t?I.user:await this._fetchEditingUser(e);return I.credential=t,I.user=r,null==r?.privileges||r.privileges.includes("features:user:edit")}async _fetchEditingUser(e){const t=this.portalItem?.portal?.user;if(t)return t;const r=s.id?.findServerInfo(this.url??"");if(!r?.owningSystemUrl)return null;const i=`${r.owningSystemUrl}/sharing/rest`,n=v.A.getDefault();if(n&&n.loaded&&(0,p.S8)(n.restUrl)===(0,p.S8)(i))return n.user;const l=`${i}/community/self`,u=null!=e?e.signal:null,d=await(0,o.Ke)((0,a.A)(l,{authMode:"no-prompt",query:{f:"json"},signal:u}));return d.ok?w.A.fromJSON(d.value.data):null}read(e,t){t&&(t.layer=this),super.read(e,t)}write(e,t){const r=t?.portal,i=this.portalItem?.id&&(this.portalItem.portal||v.A.getDefault());return r&&i&&!(0,p.ut)(i.restUrl,r.restUrl)?(t.messages&&t.messages.push(new l.A("layer:cross-portal",`The layer '${this.title} (${this.id})' cannot be persisted because it refers to an item on a different portal than the one being saved to. To save, set layer.portalItem to null or save to the same portal as the item associated with the layer`,{layer:this})),null):super.write(e,{...t,layer:this})}};return(0,i._)([(0,y.MZ)({type:b.default})],t.prototype,"portalItem",null),(0,i._)([(0,h.w)("web-document","portalItem",["itemId"])],t.prototype,"readPortalItem",null),(0,i._)([(0,g.K)("web-document","portalItem",{itemId:{type:String}})],t.prototype,"writePortalItem",null),(0,i._)([(0,y.MZ)({clonable:!1})],t.prototype,"resourceReferences",void 0),(0,i._)([(0,y.MZ)({type:Boolean,readOnly:!0})],t.prototype,"userHasEditingPrivileges",void 0),(0,i._)([(0,y.MZ)({type:Boolean,readOnly:!0})],t.prototype,"userHasFullEditingPrivileges",void 0),(0,i._)([(0,y.MZ)({type:Boolean,readOnly:!0})],t.prototype,"userHasUpdateItemPrivileges",void 0),t=(0,i._)([(0,f.$)("esri.layers.mixins.PortalLayer")],t),t},I={credential:null,user:null}},7010:function(e,t,r){r.d(t,{C1:function(){return I},Fm:function(){return b},Ih:function(){return v},M6:function(){return d},OZ:function(){return p},PY:function(){return u},Qo:function(){return f},Yj:function(){return h},fV:function(){return y},hG:function(){return L},hn:function(){return S},id:function(){return w},kF:function(){return c},ke:function(){return m}});var i=r(64786),n=r(91484),s=r(57165),a=r(60534),o=r(6422),l=r(59798);const u={type:Boolean,value:!0,json:{origins:{service:{read:!1,write:!1},"web-map":{read:!1,write:!1}},name:"screenSizePerspective",write:{enabled:!0,layerContainerTypes:i.K}}},d={type:Boolean,value:!0,json:{name:"disablePopup",read:{reader:(e,t)=>!t.disablePopup},write:{enabled:!0,writer(e,t,r){t[r]=!e}}}},c={type:Boolean,value:!0,nonNullable:!0,json:{name:"showLabels",write:{enabled:!0,layerContainerTypes:i.K}}},p={type:String,json:{origins:{"portal-item":{write:!1}},write:{isRequired:!0,ignoreOrigin:!0,writer:a.w}}},y={type:Boolean,value:!0,nonNullable:!0,json:{origins:{service:{read:{enabled:!1}}},name:"showLegend",write:{enabled:!0,layerContainerTypes:i.K}}},h={value:null,type:o.A,json:{origins:{service:{name:"elevationInfo",write:!0}},name:"layerDefinition.elevationInfo",write:{enabled:!0,layerContainerTypes:i.K}}};function f(e){return{type:e,readOnly:!0,json:{origins:{service:{read:!0}},read:!1}}}const g={write:{enabled:!0,layerContainerTypes:i.K},read:!0},m={type:Number,json:{origins:{"web-document":g,"portal-item":{write:!0}}}},v={...m,json:{...m.json,origins:{"web-document":{...g,write:{enabled:!0,layerContainerTypes:i.K,target:{opacity:{type:Number},"layerDefinition.drawingInfo.transparency":{type:Number}}}}},read:{source:["layerDefinition.drawingInfo.transparency","drawingInfo.transparency"],reader:(e,t,r)=>r&&"service"!==r.origin||!t.drawingInfo||void 0===t.drawingInfo.transparency?t.layerDefinition?.drawingInfo&&void 0!==t.layerDefinition.drawingInfo.transparency?(0,l.D)(t.layerDefinition.drawingInfo.transparency):void 0:(0,l.D)(t.drawingInfo.transparency)}}},b={type:n.default,readOnly:!0,json:{origins:{service:{read:{source:["fullExtent","spatialReference"],reader:(e,t)=>{const r=n.default.fromJSON(e);return null!=t.spatialReference&&"object"==typeof t.spatialReference&&(r.spatialReference=s.A.fromJSON(t.spatialReference)),r}}}},read:!1}},w={type:String,json:{origins:{service:{read:!1},"portal-item":{read:!1}}}},S={type:Number,json:{origins:{service:{write:{enabled:!1}},"web-scene":{name:"layerDefinition.minScale",write:{enabled:!0,layerContainerTypes:i.K}}},name:"layerDefinition.minScale",write:!0}},L={type:Number,json:{origins:{service:{write:{enabled:!1}},"web-scene":{name:"layerDefinition.maxScale",write:{enabled:!0,layerContainerTypes:i.K}}},name:"layerDefinition.maxScale",write:!0}},I={json:{write:{ignoreOrigin:!0,layerContainerTypes:i.K},origins:{"web-map":{read:!1,write:!1}}}}},29606:function(e,t,r){r.d(t,{It:function(){return p},LG:function(){return a},OM:function(){return u},Y:function(){return o},bK:function(){return l},mm:function(){return c},sQ:function(){return d}});var i=r(46157),n=r(57165),s=r(1644);function a(e,t){if(!o(e,t)){const r=e.typeKeywords;r?r.push(t):e.typeKeywords=[t]}}function o(e,t){return!!e.typeKeywords?.includes(t)}function l(e){return o(e,c.HOSTED_SERVICE)}function u(e,t){const r=e.typeKeywords;if(r){const e=r.indexOf(t);e>-1&&r.splice(e,1)}}async function d(e){const t=e.clone().normalize();let r;if(t.length>1)for(const e of t)r?e.width>r.width&&(r=e):r=e;else r=t[0];return async function(e){const t=e.spatialReference;if(t.isWGS84)return e.clone();if(t.isWebMercator)return(0,s.ci)(e);const r=n.A.WGS84;return await(0,i.initializeProjection)(t,r),(0,i.project)(e,r)}(r)}const c={DEVELOPER_BASEMAP:"DeveloperBasemap",JSAPI:"ArcGIS API for JavaScript",METADATA:"Metadata",MULTI_LAYER:"Multilayer",SINGLE_LAYER:"Singlelayer",TABLE:"Table",HOSTED_SERVICE:"Hosted Service",LOCAL_SCENE:"ViewingMode-Local",TILED_IMAGERY:"Tiled Imagery",GROUP_LAYER_MAP:"Map"};function p(e){const{portal:t,isOrgItem:r,itemControl:i}=e,n=t.user?.privileges;let s=!n||n.includes("features:user:edit"),a=!!r&&!!n?.includes("features:user:fullEdit");const o="update"===i||"admin"===i;return o?a=s=!0:a&&(s=!0),{features:{edit:s,fullEdit:a},content:{updateItem:o}}}},25170:function(e,t,r){r.d(t,{Q:function(){return p}});var i=r(53804),n=r(78879),s=r(61500),a=r(40633),o=r(60539),l=r(23502),u=(r(58941),r(13798),r(65953)),d=r(20833);function c(e,t,r){let i,n;if(e)for(let s=0,a=e.length;s<a;s++){if(i=e.at(s),i?.[t]===r)return i;if("group"===i?.type&&(n=c(i.layers,t,r),n))return n}}const p=e=>{let t=class extends e{constructor(...e){super(...e),this.layers=new n.A;const t=e=>{e.parent=this,this.layerAdded(e),"elevation"!==e.type&&"base-elevation"!==e.type||a.A.getLogger(this).error(`Layer 'title:${e.title}, id:${e.id}' of type '${e.type}' is not supported as an operational layer and will therefore be ignored.`)},r=e=>{e.parent=null,this.layerRemoved(e)};this.addHandles([this.layers.on("before-add",(e=>{if(e.item===this)return e.preventDefault(),void a.A.getLogger(this).error("#add()","Cannot add layer to itself.");(e=>{e.parent&&"remove"in e.parent&&e.parent.remove(e)})(e.item)})),this.layers.on("after-add",(e=>t(e.item))),this.layers.on("after-remove",(e=>r(e.item)))])}destroy(){const e=this.layers.toArray();for(const t of e)t.destroy();this.layers.destroy()}set layers(e){this._set("layers",(0,s.V)(e,this._get("layers")))}add(e,t){const r=this.layers;if(t=r.getNextIndex(t),e instanceof d.A){const i=e;i.parent===this?this.reorder(i,t):r.add(i,t)}else(0,o.$X)(e)?e.then((e=>{this.destroyed||this.add(e,t)})):a.A.getLogger(this).error("#add()","The item being added is not a Layer or a Promise that resolves to a Layer.")}addMany(e,t){const r=this.layers;let i=r.getNextIndex(t);e.slice().forEach((e=>{e.parent!==this?(r.add(e,i),i+=1):this.reorder(e,i)}))}findLayerById(e){return c(this.layers,"id",e)}findLayerByUid(e){return c(this.layers,"uid",e)}remove(e){return this.layers.remove(e)}removeMany(e){return this.layers.removeMany(e)}removeAll(){return this.layers.removeAll()}reorder(e,t){return this.layers.reorder(e,t)}layerAdded(e){}layerRemoved(e){}};return(0,i._)([(0,l.MZ)()],t.prototype,"layers",null),t=(0,i._)([(0,u.$)("esri.support.LayersMixin")],t),t}},53687:function(e,t,r){r.d(t,{l:function(){return d}});var i=r(53804),n=r(78879),s=r(61500),a=r(40633),o=r(23502),l=(r(58941),r(13798),r(65953));function u(e,t,r){if(e)for(let i=0,n=e.length;i<n;i++){const n=e.at(i);if(n[t]===r)return n;if("group"===n?.type){const e=u(n.tables,t,r);if(e)return e}}}const d=e=>{let t=class extends e{constructor(...e){super(...e),this.tables=new n.A,this.addHandles([this.tables.on("after-add",(e=>{const t=e.item;t.parent&&t.parent!==this&&"tables"in t.parent&&t.parent.tables.remove(t),t.parent=this,"feature"!==t.type&&a.A.getLogger(this).error(`Layer 'title:${t.title}, id:${t.id}' of type '${t.type}' is not supported as a table and will therefore be ignored.`)})),this.tables.on("after-remove",(e=>{e.item.parent=null}))])}destroy(){const e=this.tables.toArray();for(const t of e)t.destroy();this.tables.destroy()}set tables(e){this._set("tables",(0,s.V)(e,this._get("tables")))}findTableById(e){return u(this.tables,"id",e)}findTableByUid(e){return u(this.tables,"uid",e)}};return(0,i._)([(0,o.MZ)()],t.prototype,"tables",null),t=(0,i._)([(0,l.$)("esri.support.TablesMixin")],t),t}},33848:function(e,t,r){r.d(t,{X:function(){return s},Z:function(){return n}});var i=r(84232);function n(e){return new i.A({getCollections:()=>[e.tables,e.layers],getChildrenFunction:e=>{const t=[];return"tables"in e&&t.push(e.tables),"layers"in e&&t.push(e.layers),t},itemFilterFunction:e=>{const t=e.parent;return!!t&&"tables"in t&&t.tables.includes(e)}})}function s(e){for(const t of e.values())t?.destroy();e.clear()}},91820:function(e,t,r){r.d(t,{X:function(){return i}});const i=Symbol("WebScene")},91448:function(e,t,r){var i;r.d(t,{X:function(){return i}}),function(e){e[e.SAVE=0]="SAVE",e[e.SAVE_AS=1]="SAVE_AS"}(i||(i={}))},4584:function(e,t,r){r.d(t,{c:function(){return a},d:function(){return n}});var i=r(39819);async function n(e){const t=[];for(const r of e.allLayers)if("beforeSave"in r&&"function"==typeof r.beforeSave){const e=r.beforeSave();e&&t.push(e)}await Promise.allSettled(t)}const s=new Set(["layer:unsupported","property:unsupported","symbol:unsupported","symbol-layer:unsupported","url:unsupported"]);function a(e,t,r){let n=(e.messages??[]).filter((({type:e})=>"error"===e)).map((({name:e,message:t,details:r})=>new i.A(e,t,r)));if(e.blockedRelativeUrls&&(n=n.concat(e.blockedRelativeUrls.map((e=>new i.A("url:unsupported",`Relative url '${e}' is not supported`))))),r){const{ignoreUnsupported:e,supplementalUnsupportedErrors:t=[],requiredPropertyChecksDisabled:i}=r;e&&(n=n.filter((({name:e})=>!(s.has(e)||t.includes(e))))),i&&(n=n.filter((e=>"web-document-write:property-required"!==e.name)))}if(n.length>0)throw new i.A(t.errorName,"Failed to save due to unsupported or invalid content. See 'details.errors' for more detailed information",{errors:n})}},84624:function(e,t,r){r.d(t,{CJ:function(){return p}});var i=r(39819),n=r(21609),s=r(34194),a=r(47527),o=r(11432);const l=new Set(["bing-maps","imagery","imagery-tile","map-image","open-street-map","tile","unknown","unsupported","vector-tile","web-tile","wms","wmts"]),u=new Set(["catalog","csv","feature","geo-rss","geojson","group","imagery","imagery-tile","kml","knowledge-graph","map-image","map-notes","media","ogc-feature","oriented-imagery","route","stream","subtype-group","tile","unknown","unsupported","vector-tile","web-tile","wfs","wms","wmts"]);function d(e,t){if(t.restrictedWebMapWriting){const r=function(e){return"basemap"===e.layerContainerType?l:"operational-layers"===e.layerContainerType?u:null}(t);return null==r||r.has(e.type)&&!(0,o.Ov)(e)}return!0}function c(e,t){"maxScale"in e&&(t.maxScale=(0,a.B)(e.maxScale)??void 0),"minScale"in e&&(t.minScale=(0,a.B)(e.minScale)??void 0)}function p(e,t,r){if(!e.persistenceEnabled)return null;if(!("write"in e)||!e.write)return r?.messages&&r.messages.push(new i.A("layer:unsupported",`Layers (${e.title}, ${e.id}) of type '${e.declaredClass}' cannot be persisted`,{layer:e})),null;if((0,o.Ov)(e)&&!e.isTable)t=e.resourceInfo;else if(d(e,r)){const t={};return e.write(t,r)?t:null}return null!=t&&function(e,t){if(function(e,t){if(t)if((0,o.Ov)(e)){const r=(0,s.wc)("featureCollection.layers",t),i=r?.[0]?.layerDefinition;i&&c(e,i)}else"group"!==e.type&&c(e,t)}(e,t),t&&(t.id=e.id,"blendMode"in e&&(t.blendMode=e.blendMode,"normal"===t.blendMode&&delete t.blendMode),t.opacity=(0,a.B)(e.opacity)??void 0,t.title=e.title||"Layer",t.visibility=e.visible,"legendEnabled"in e&&"wmts"!==e.type))if((0,o.Ov)(e)){const r=t.featureCollection;r&&(r.showLegend=e.legendEnabled)}else t.showLegend=e.legendEnabled}(e,t=(0,n.o8)(t)),t}}}]);
//# sourceMappingURL=GroupLayer.js.map