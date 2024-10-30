"use strict";(self.webpackChunkdefraMap=self.webpackChunkdefraMap||[]).push([[5589],{69417:function(n,e,a){a.r(e),a.d(e,{registerFunctions:function(){return u}});var t=a(45824),r=a(37568),o=a(69243),i=a(62032);function c(n,e){return n&&n.domain?"coded-value"===n.domain.type||"codedValue"===n.domain.type?t.A.convertObjectToArcadeDictionary({type:"codedValue",name:n.domain.name,dataType:i.At[n.field.type],codedValues:n.domain.codedValues.map((n=>({name:n.name,code:n.code})))},(0,o.N)(e)):t.A.convertObjectToArcadeDictionary({type:"range",name:n.domain.name,dataType:i.At[n.field.type],min:n.domain.minValue,max:n.domain.maxValue},(0,o.N)(e)):null}function u(n){"async"===n.mode&&(n.functions.domain=function(e,a){return n.standardFunctionAsync(e,a,(async(n,t,i)=>{if((0,o.H)(i,2,3,e,a),(0,o.r)(i[0]))return c((0,o.W)(i[0],(0,o.j)(i[1]),void 0===i[2]?void 0:i[2]),e);if((0,o.u)(i[0]))return await i[0]._ensureLoaded(),c((0,o.a2)((0,o.j)(i[1]),i[0],null,void 0===i[2]?void 0:i[2]),e);throw new r.D$(e,r.TX.InvalidParameter,a)}))},n.functions.subtypes=function(e,a){return n.standardFunctionAsync(e,a,(async(n,i,c)=>{if((0,o.H)(c,1,1,e,a),(0,o.r)(c[0])){const n=(0,o.V)(c[0]);return n?t.A.convertObjectToArcadeDictionary(n,(0,o.N)(e)):null}if((0,o.u)(c[0])){await c[0]._ensureLoaded();const n=c[0].subtypeMetaData();return n?t.A.convertObjectToArcadeDictionary(n,(0,o.N)(e)):null}throw new r.D$(e,r.TX.InvalidParameter,a)}))},n.functions.domainname=function(e,a){return n.standardFunctionAsync(e,a,(async(n,t,i)=>{if((0,o.H)(i,2,4,e,a),(0,o.r)(i[0]))return(0,o.X)(i[0],(0,o.j)(i[1]),i[2],void 0===i[3]?void 0:i[3]);if((0,o.u)(i[0])){await i[0]._ensureLoaded();const n=(0,o.a2)((0,o.j)(i[1]),i[0],null,void 0===i[3]?void 0:i[3]);return(0,o.a3)(n,i[2])}throw new r.D$(e,r.TX.InvalidParameter,a)}))},n.signatures.push({name:"domainname",min:2,max:4}),n.functions.domaincode=function(e,a){return n.standardFunctionAsync(e,a,(async(n,t,i)=>{if((0,o.H)(i,2,4,e,a),(0,o.r)(i[0]))return(0,o.Y)(i[0],(0,o.j)(i[1]),i[2],void 0===i[3]?void 0:i[3]);if((0,o.u)(i[0])){await i[0]._ensureLoaded();const n=(0,o.a2)((0,o.j)(i[1]),i[0],null,void 0===i[3]?void 0:i[3]);return(0,o.a4)(n,i[2])}throw new r.D$(e,r.TX.InvalidParameter,a)}))},n.signatures.push({name:"domaincode",min:2,max:4}),n.functions.text=function(e,a){return n.standardFunctionAsync(e,a,(async(n,t,i)=>{if((0,o.H)(i,1,2,e,a),(0,o.u)(i[0])){const t=(0,o.K)(i[1],"");if(""===t)return i[0].castToText();if("schema"===t.toLowerCase())return i[0].convertToText("schema",n.abortSignal);if("featureset"===t.toLowerCase())return i[0].convertToText("featureset",n.abortSignal);throw new r.D$(e,r.TX.InvalidParameter,a)}return(0,o.t)(i[0],i[1])}))},n.functions.gdbversion=function(e,a){return n.standardFunctionAsync(e,a,(async(n,t,i)=>{if((0,o.H)(i,1,1,e,a),(0,o.r)(i[0]))return i[0].gdbVersion();if((0,o.u)(i[0]))return(await i[0].load()).gdbVersion;throw new r.D$(e,r.TX.InvalidParameter,a)}))},n.functions.schema=function(e,a){return n.standardFunctionAsync(e,a,(async(n,i,c)=>{if((0,o.H)(c,1,1,e,a),(0,o.u)(c[0]))return await c[0].load(),t.A.convertObjectToArcadeDictionary(c[0].schema(),(0,o.N)(e));if((0,o.r)(c[0])){const n=(0,o.U)(c[0]);return n?t.A.convertObjectToArcadeDictionary(n,(0,o.N)(e)):null}throw new r.D$(e,r.TX.InvalidParameter,a)}))})}}}]);
//# sourceMappingURL=arcade-functions-featuresetstring.js.map