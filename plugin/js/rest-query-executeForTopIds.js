"use strict";(self.webpackChunkdefraMap=self.webpackChunkdefraMap||[]).push([[6928],{57922:function(t,e,r){r.r(e),r.d(e,{executeForTopIds:function(){return s}});var i=r(39397),o=r(77980),n=r(5180);async function s(t,e,r){const s=(0,i.Dl)(t);return(await(0,o.KW)(s,n.A.from(e),{...r})).data.objectIds}},77980:function(t,e,r){r.d(e,{$K:function(){return h},KW:function(){return c},Yb:function(){return y},xs:function(){return m}});var i=r(93040),o=r(90683),n=r(74697),s=r(65298),l=r(57652),u=r(12873),p=r(45406);const a="Layer does not support extent calculation.";function d(t,e){const r=t.geometry,i=t.toJSON(),o=i;if(null!=r&&(o.geometry=JSON.stringify(r),o.geometryType=(0,n.$B)(r),o.inSR=(0,l.YX)(r.spatialReference)),i.topFilter?.groupByFields&&(o.topFilter.groupByFields=i.topFilter.groupByFields.join(",")),i.topFilter?.orderByFields&&(o.topFilter.orderByFields=i.topFilter.orderByFields.join(",")),i.topFilter&&(o.topFilter=JSON.stringify(o.topFilter)),i.objectIds&&(o.objectIds=i.objectIds.join(",")),i.orderByFields&&(o.orderByFields=i.orderByFields.join(",")),i.outFields&&!(e?.returnCountOnly||e?.returnExtentOnly||e?.returnIdsOnly)?i.outFields.includes("*")?o.outFields="*":o.outFields=i.outFields.join(","):delete o.outFields,i.outSR?o.outSR=(0,l.YX)(i.outSR):r&&i.returnGeometry&&(o.outSR=o.inSR),i.returnGeometry&&delete i.returnGeometry,i.timeExtent){const t=i.timeExtent,{start:e,end:r}=t;null==e&&null==r||(o.time=e===r?e:`${e??"null"},${r??"null"}`),delete i.timeExtent}return o}async function y(t,e,r,i){const o=await f(t,e,"json",i);return(0,p.q)(e,r,o.data),o}async function c(t,e,r){return null!=e.timeExtent&&e.timeExtent.isEmpty?{data:{objectIds:[]}}:f(t,e,"json",r,{returnIdsOnly:!0})}async function h(t,e,r){return null!=e.timeExtent&&e.timeExtent.isEmpty?{data:{count:0,extent:null}}:f(t,e,"json",r,{returnExtentOnly:!0,returnCountOnly:!0}).then((t=>{const e=t.data;if(e.hasOwnProperty("extent"))return t;if(e.features)throw new Error(a);if(e.hasOwnProperty("count"))throw new Error(a);return t}))}function m(t,e,r){return null!=e.timeExtent&&e.timeExtent.isEmpty?Promise.resolve({data:{count:0}}):f(t,e,"json",r,{returnIdsOnly:!0,returnCountOnly:!0})}function f(t,e,r,n={},l={}){const p="string"==typeof t?(0,o.An)(t):t,a=e.geometry?[e.geometry]:[];return n.responseType="json",(0,s.el)(a,null,n).then((t=>{const s=t?.[0];null!=s&&((e=e.clone()).geometry=s);const a=(0,u.z)({...p.query,f:r,...l,...d(e,l)});return(0,i.A)((0,o.fj)(p.path,"queryTopFeatures"),{...n,query:{...a,...n.query}})}))}},5180:function(t,e,r){r.d(e,{A:function(){return R}});var i,o=r(53804),n=r(50917),s=r(30580),l=r(73037),u=r(30905),p=r(21609),a=r(23502),d=r(67888),y=r(65953),c=r(81392),h=r(74697);r(58941),r(40633),r(13798);let m=i=class extends u.oY{constructor(t){super(t),this.groupByFields=void 0,this.topCount=void 0,this.orderByFields=void 0}clone(){return new i({groupByFields:this.groupByFields,topCount:this.topCount,orderByFields:this.orderByFields})}};(0,o._)([(0,a.MZ)({type:[String],json:{write:!0}})],m.prototype,"groupByFields",void 0),(0,o._)([(0,a.MZ)({type:Number,json:{write:!0}})],m.prototype,"topCount",void 0),(0,o._)([(0,a.MZ)({type:[String],json:{write:!0}})],m.prototype,"orderByFields",void 0),m=i=(0,o._)([(0,y.$)("esri.rest.support.TopFilter")],m);const f=m;var w,F=r(57165);const v=new l.J({esriSpatialRelIntersects:"intersects",esriSpatialRelContains:"contains",esriSpatialRelCrosses:"crosses",esriSpatialRelDisjoint:"disjoint",esriSpatialRelEnvelopeIntersects:"envelope-intersects",esriSpatialRelIndexIntersects:"index-intersects",esriSpatialRelOverlaps:"overlaps",esriSpatialRelTouches:"touches",esriSpatialRelWithin:"within",esriSpatialRelRelation:"relation"}),j=new l.J({esriSRUnit_Meter:"meters",esriSRUnit_Kilometer:"kilometers",esriSRUnit_Foot:"feet",esriSRUnit_StatuteMile:"miles",esriSRUnit_NauticalMile:"nautical-miles",esriSRUnit_USNauticalMile:"us-nautical-miles"});let S=w=class extends u.oY{constructor(t){super(t),this.cacheHint=void 0,this.distance=void 0,this.geometry=null,this.geometryPrecision=void 0,this.maxAllowableOffset=void 0,this.num=void 0,this.objectIds=null,this.orderByFields=null,this.outFields=null,this.outSpatialReference=null,this.resultType=null,this.returnGeometry=!1,this.returnM=void 0,this.returnZ=void 0,this.start=void 0,this.spatialRelationship="intersects",this.timeExtent=null,this.topFilter=void 0,this.units=null,this.where="1=1"}writeStart(t,e){e.resultOffset=this.start,e.resultRecordCount=this.num||10}clone(){return new w((0,p.o8)({cacheHint:this.cacheHint,distance:this.distance,geometry:this.geometry,geometryPrecision:this.geometryPrecision,maxAllowableOffset:this.maxAllowableOffset,num:this.num,objectIds:this.objectIds,orderByFields:this.orderByFields,outFields:this.outFields,outSpatialReference:this.outSpatialReference,resultType:this.resultType,returnGeometry:this.returnGeometry,returnZ:this.returnZ,returnM:this.returnM,start:this.start,spatialRelationship:this.spatialRelationship,timeExtent:this.timeExtent,topFilter:this.topFilter,units:this.units,where:this.where}))}};(0,o._)([(0,a.MZ)({type:Boolean,json:{write:!0}})],S.prototype,"cacheHint",void 0),(0,o._)([(0,a.MZ)({type:Number,json:{write:{overridePolicy:t=>({enabled:t>0})}}})],S.prototype,"distance",void 0),(0,o._)([(0,a.MZ)({types:n.yR,json:{read:h.rS,write:!0}})],S.prototype,"geometry",void 0),(0,o._)([(0,a.MZ)({type:Number,json:{write:!0}})],S.prototype,"geometryPrecision",void 0),(0,o._)([(0,a.MZ)({type:Number,json:{write:!0}})],S.prototype,"maxAllowableOffset",void 0),(0,o._)([(0,a.MZ)({type:Number,json:{read:{source:"resultRecordCount"}}})],S.prototype,"num",void 0),(0,o._)([(0,a.MZ)({json:{write:!0}})],S.prototype,"objectIds",void 0),(0,o._)([(0,a.MZ)({type:[String],json:{write:!0}})],S.prototype,"orderByFields",void 0),(0,o._)([(0,a.MZ)({type:[String],json:{write:!0}})],S.prototype,"outFields",void 0),(0,o._)([(0,a.MZ)({type:F.A,json:{read:{source:"outSR"},write:{target:"outSR"}}})],S.prototype,"outSpatialReference",void 0),(0,o._)([(0,a.MZ)({type:String,json:{write:!0}})],S.prototype,"resultType",void 0),(0,o._)([(0,a.MZ)({json:{write:!0}})],S.prototype,"returnGeometry",void 0),(0,o._)([(0,a.MZ)({type:Boolean,json:{write:{overridePolicy:t=>({enabled:t})}}})],S.prototype,"returnM",void 0),(0,o._)([(0,a.MZ)({type:Boolean,json:{write:{overridePolicy:t=>({enabled:t})}}})],S.prototype,"returnZ",void 0),(0,o._)([(0,a.MZ)({type:Number,json:{read:{source:"resultOffset"}}})],S.prototype,"start",void 0),(0,o._)([(0,c.K)("start"),(0,c.K)("num")],S.prototype,"writeStart",null),(0,o._)([(0,a.MZ)({type:String,json:{read:{source:"spatialRel",reader:v.read},write:{target:"spatialRel",writer:v.write}}})],S.prototype,"spatialRelationship",void 0),(0,o._)([(0,a.MZ)({type:s.A,json:{write:!0}})],S.prototype,"timeExtent",void 0),(0,o._)([(0,a.MZ)({type:f,json:{write:!0}})],S.prototype,"topFilter",void 0),(0,o._)([(0,a.MZ)({type:String,json:{read:j.read,write:{writer:j.write,overridePolicy(t){return{enabled:null!=t&&null!=this.distance&&this.distance>0}}}}})],S.prototype,"units",void 0),(0,o._)([(0,a.MZ)({type:String,json:{write:!0}})],S.prototype,"where",void 0),S=w=(0,o._)([(0,y.$)("esri.rest.support.TopFeaturesQuery")],S),S.from=(0,d.dp)(S);const R=S}}]);
//# sourceMappingURL=rest-query-executeForTopIds.js.map