/*! For license information please see @esri-calcite-components-dist-components-calcite-notice.js.LICENSE.txt */
"use strict";(self.webpackChunkdefraMap=self.webpackChunkdefraMap||[]).push([[2121],{26802:function(t,e,n){n.r(e),n.d(e,{CalciteNotice:function(){return m},defineCustomElement:function(){return b}});var i=n(17858),o=n(70142),r=n(12970),s=n(85644),c=n(2846),a=n(53129);const l={brand:"lightbulb",danger:"exclamationMarkTriangle",info:"information",success:"checkCircle",warning:"exclamationMarkTriangle"};var u=n(1791),d=n(71409),f=n(82269);const h="actions-end",p=(0,i.w$)(class extends i.wt{constructor(){super(),this.__registerHost(),this.__attachShadow(),this.calciteNoticeBeforeClose=(0,i.lh)(this,"calciteNoticeBeforeClose",6),this.calciteNoticeBeforeOpen=(0,i.lh)(this,"calciteNoticeBeforeOpen",6),this.calciteNoticeClose=(0,i.lh)(this,"calciteNoticeClose",6),this.calciteNoticeOpen=(0,i.lh)(this,"calciteNoticeOpen",6),this.setTransitionEl=t=>{this.transitionEl=t},this.close=()=>{this.open=!1},this.openTransitionProp="opacity",this.open=!1,this.kind="brand",this.closable=!1,this.icon=void 0,this.iconFlipRtl=!1,this.scale="m",this.width="auto",this.messages=void 0,this.messageOverrides=void 0,this.effectiveLocale=void 0,this.defaultMessages=void 0}openHandler(){(0,u.o)(this)}onMessagesChange(){}updateRequestedIcon(){this.requestedIcon=(0,r.o)(l,this.icon,this.kind)}connectedCallback(){(0,o.c)(this),(0,c.c)(this),(0,a.c)(this)}disconnectedCallback(){(0,o.d)(this),(0,c.d)(this),(0,a.d)(this)}async componentWillLoad(){(0,s.s)(this),this.requestedIcon=(0,r.o)(l,this.icon,this.kind),await(0,a.s)(this),this.open&&(0,u.o)(this)}componentDidLoad(){(0,s.a)(this)}render(){const{el:t}=this,e=(0,i.h)("button",{key:"898b161c8f357e36a623c0a02de98be2cb2c2a73","aria-label":this.messages.close,class:"notice-close",onClick:this.close,ref:t=>this.closeButton=t},(0,i.h)("calcite-icon",{key:"258b71c704cbd390cd7fc031bc04a4ea2eef7ee6",icon:"x",scale:(0,d.g)(this.scale)})),n=(0,r.g)(t,h);return(0,i.h)("div",{key:"eb7ea8a838d8ea2182e02fba8701dc816dafbc60",class:"container",ref:this.setTransitionEl},this.requestedIcon?(0,i.h)("div",{class:"notice-icon"},(0,i.h)("calcite-icon",{flipRtl:this.iconFlipRtl,icon:this.requestedIcon,scale:(0,d.g)(this.scale)})):null,(0,i.h)("div",{key:"3ac734d3b085f1c80bfb16b14df7cb8d1b7058cb",class:"notice-content"},(0,i.h)("slot",{key:"2698e3774993b1af1bd93a2955e312705fd22543",name:"title"}),(0,i.h)("slot",{key:"b8fb3c294c893ce2edaddf46066a4df45d8832cd",name:"message"}),(0,i.h)("slot",{key:"01a792e1d41a8d935ddbb04b1eb857b8b88c8882",name:"link"})),n?(0,i.h)("div",{class:"actions-end"},(0,i.h)("slot",{name:h})):null,this.closable?e:null)}async setFocus(){await(0,s.c)(this);const t=this.el.querySelector("calcite-link");if(this.closeButton||t)return t?t.setFocus():void(this.closeButton&&this.closeButton.focus())}onBeforeClose(){this.calciteNoticeBeforeClose.emit()}onBeforeOpen(){this.calciteNoticeBeforeOpen.emit()}onClose(){this.calciteNoticeClose.emit()}onOpen(){this.calciteNoticeOpen.emit()}effectiveLocaleChange(){(0,a.u)(this,this.effectiveLocale)}static get assetsDirs(){return["assets"]}get el(){return this}static get watchers(){return{open:["openHandler"],messageOverrides:["onMessagesChange"],icon:["updateRequestedIcon"],kind:["updateRequestedIcon"],effectiveLocale:["effectiveLocaleChange"]}}static get style(){return":host([scale=s]){--calcite-notice-spacing-token-small:0.5rem;--calcite-notice-spacing-token-large:0.75rem}:host([scale=s]) .container slot[name=title]::slotted(*),:host([scale=s]) .container *::slotted([slot=title]){margin-block:0.125rem;font-size:var(--calcite-font-size--1);line-height:1.375}:host([scale=s]) .container slot[name=message]::slotted(*),:host([scale=s]) .container *::slotted([slot=message]){margin-block:0.125rem;font-size:var(--calcite-font-size--2);line-height:1.375}:host([scale=s]) ::slotted(calcite-link){margin-block:0.125rem;font-size:var(--calcite-font-size--2);line-height:1.375}:host([scale=s]) .notice-close{padding:0.5rem}:host([scale=m]){--calcite-notice-spacing-token-small:0.75rem;--calcite-notice-spacing-token-large:1rem}:host([scale=m]) .container slot[name=title]::slotted(*),:host([scale=m]) .container *::slotted([slot=title]){margin-block:0.125rem;font-size:var(--calcite-font-size-0);line-height:1.375}:host([scale=m]) .container slot[name=message]::slotted(*),:host([scale=m]) .container *::slotted([slot=message]){margin-block:0.125rem;font-size:var(--calcite-font-size--1);line-height:1.375}:host([scale=m]) ::slotted(calcite-link){margin-block:0.125rem;font-size:var(--calcite-font-size--1);line-height:1.375}:host([scale=l]){--calcite-notice-spacing-token-small:1rem;--calcite-notice-spacing-token-large:1.25rem}:host([scale=l]) .container slot[name=title]::slotted(*),:host([scale=l]) .container *::slotted([slot=title]){margin-block:0.125rem;font-size:var(--calcite-font-size-1);line-height:1.375}:host([scale=l]) .container slot[name=message]::slotted(*),:host([scale=l]) .container *::slotted([slot=message]){margin-block:0.125rem;font-size:var(--calcite-font-size-0);line-height:1.375}:host([scale=l]) ::slotted(calcite-link){margin-block:0.125rem;font-size:var(--calcite-font-size-0);line-height:1.375}:host([width=auto]){--calcite-notice-width:auto}:host([width=half]){--calcite-notice-width:50%}:host([width=full]){--calcite-notice-width:100%}:host{margin-inline:auto;display:none;max-inline-size:100%;align-items:center;inline-size:var(--calcite-notice-width)}.container{pointer-events:none;margin-block:0px;box-sizing:border-box;display:none;inline-size:100%;background-color:var(--calcite-color-foreground-1);opacity:0;transition:background-color, block-size, border-color, box-shadow, color, inset-block-end, inset-block-start, inset-inline-end, inset-inline-start inset-size, opacity, outline-color, transform var(--calcite-animation-timing) ease-in-out 0s, outline 0s, outline-offset 0s;max-block-size:0;text-align:start;border-inline-start:0px solid;box-shadow:0 0 0 0 transparent}.notice-close{outline-color:transparent}.notice-close:focus{outline:2px solid var(--calcite-ui-focus-color, var(--calcite-color-brand));outline-offset:calc(\n            -2px *\n            calc(\n              1 -\n              2 * clamp(\n                0,\n                var(--calcite-offset-invert-focus),\n                1\n              )\n            )\n          )}:host{display:flex}:host([open]) .container{pointer-events:auto;display:flex;max-block-size:100%;align-items:center;border-width:2px;opacity:1;--tw-shadow:0 4px 8px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04);--tw-shadow-colored:0 4px 8px -1px var(--tw-shadow-color), 0 2px 4px -1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)}.container slot[name=title]::slotted(*),.container *::slotted([slot=title]){margin:0px;font-weight:var(--calcite-font-weight-medium);color:var(--calcite-color-text-1)}.container slot[name=message]::slotted(*),.container *::slotted([slot=message]){margin:0px;display:inline;font-weight:var(--calcite-font-weight-normal);color:var(--calcite-color-text-2);margin-inline-end:var(--calcite-notice-spacing-token-small)}.notice-content{box-sizing:border-box;transition:background-color, block-size, border-color, box-shadow, color, inset-block-end, inset-block-start, inset-inline-end, inset-inline-start inset-size, opacity, outline-color, transform var(--calcite-animation-timing) ease-in-out 0s, outline 0s, outline-offset 0s;padding-inline:var(--calcite-notice-spacing-token-large);flex:0 0 auto;display:flex;min-inline-size:0px;flex-direction:column;overflow-wrap:break-word;flex:1 1 0;padding-block:var(--calcite-notice-spacing-token-small);padding-inline:0 var(--calcite-notice-spacing-token-small)}.notice-content:first-of-type:not(:only-child){padding-inline-start:var(--calcite-notice-spacing-token-large)}.notice-content:only-of-type{padding-block:var(--calcite-notice-spacing-token-small);padding-inline:var(--calcite-notice-spacing-token-large)}.notice-icon{display:flex;align-items:center;box-sizing:border-box;transition:background-color, block-size, border-color, box-shadow, color, inset-block-end, inset-block-start, inset-inline-end, inset-inline-start inset-size, opacity, outline-color, transform var(--calcite-animation-timing) ease-in-out 0s, outline 0s, outline-offset 0s;padding-block:var(--calcite-notice-spacing-token-small);padding-inline:var(--calcite-notice-spacing-token-large);flex:0 0 auto}.notice-close{display:flex;cursor:pointer;align-items:center;align-self:stretch;border-style:none;background-color:transparent;color:var(--calcite-color-text-3);outline:2px solid transparent;outline-offset:2px;box-sizing:border-box;transition:background-color, block-size, border-color, box-shadow, color, inset-block-end, inset-block-start, inset-inline-end, inset-inline-start inset-size, opacity, outline-color, transform var(--calcite-animation-timing) ease-in-out 0s, outline 0s, outline-offset 0s;padding-block:var(--calcite-notice-spacing-token-small);padding-inline:var(--calcite-notice-spacing-token-large);flex:0 0 auto;-webkit-appearance:none}.notice-close:hover,.notice-close:focus{background-color:var(--calcite-color-foreground-2);color:var(--calcite-color-text-1)}.notice-close:active{background-color:var(--calcite-color-foreground-3)}.actions-end{display:flex;align-self:stretch}:host([kind=brand]) .container{border-color:var(--calcite-color-brand)}:host([kind=brand]) .container .notice-icon{color:var(--calcite-color-brand)}:host([kind=info]) .container{border-color:var(--calcite-color-status-info)}:host([kind=info]) .container .notice-icon{color:var(--calcite-color-status-info)}:host([kind=danger]) .container{border-color:var(--calcite-color-status-danger)}:host([kind=danger]) .container .notice-icon{color:var(--calcite-color-status-danger)}:host([kind=success]) .container{border-color:var(--calcite-color-status-success)}:host([kind=success]) .container .notice-icon{color:var(--calcite-color-status-success)}:host([kind=warning]) .container{border-color:var(--calcite-color-status-warning)}:host([kind=warning]) .container .notice-icon{color:var(--calcite-color-status-warning)}:host([hidden]){display:none}[hidden]{display:none}"}},[1,"calcite-notice",{open:[1540],kind:[513],closable:[516],icon:[520],iconFlipRtl:[516,"icon-flip-rtl"],scale:[513],width:[513],messages:[1040],messageOverrides:[1040],effectiveLocale:[32],defaultMessages:[32],setFocus:[64]},void 0,{open:["openHandler"],messageOverrides:["onMessagesChange"],icon:["updateRequestedIcon"],kind:["updateRequestedIcon"],effectiveLocale:["effectiveLocaleChange"]}]);function g(){"undefined"!=typeof customElements&&["calcite-notice","calcite-icon"].forEach((t=>{switch(t){case"calcite-notice":customElements.get(t)||customElements.define(t,p);break;case"calcite-icon":customElements.get(t)||(0,f.d)()}}))}g();const m=p,b=g},71409:function(t,e,n){n.d(e,{a:function(){return r},c:function(){return c},g:function(){return o}});var i=n(17858);function o(t){return"l"===t?"m":"s"}async function r(t){await(function(t){return"function"==typeof t.componentOnReady}(t)?t.componentOnReady():new Promise((t=>requestAnimationFrame((()=>t())))))}const s=i.L2.isTesting?i.$x:()=>{};async function c(t){if(await r(t),i.L2.isBrowser||i.L2.isTesting)return s(t),new Promise((t=>requestAnimationFrame((()=>t()))))}},70142:function(t,e,n){n.d(e,{c:function(){return c},d:function(){return a}});var i=n(17858),o=n(51941);let r;const s={childList:!0};function c(t){r||(r=(0,o.c)("mutation",l)),r.observe(t.el,s)}function a(t){r.unobserve(t.el)}function l(t){t.forEach((({target:t})=>{(0,i.$x)(t)}))}},12970:function(t,e,n){n.d(e,{C:function(){return B},E:function(){return C},a:function(){return O},b:function(){return D},c:function(){return L},d:function(){return G},e:function(){return F},f:function(){return T},g:function(){return P},h:function(){return N},i:function(){return V},j:function(){return k},k:function(){return x},l:function(){return E},m:function(){return h},n:function(){return I},o:function(){return q},q:function(){return R},r:function(){return U},s:function(){return X},t:function(){return H},u:function(){return K},v:function(){return J},x:function(){return W}});var i=n(20369),o=(n(4507),["input:not([inert])","select:not([inert])","textarea:not([inert])","a[href]:not([inert])","button:not([inert])","[tabindex]:not(slot):not([inert])","audio[controls]:not([inert])","video[controls]:not([inert])",'[contenteditable]:not([contenteditable="false"]):not([inert])',"details>summary:first-of-type:not([inert])","details:not([inert])"]),r=o.join(","),s="undefined"==typeof Element,c=s?function(){}:Element.prototype.matches||Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector,a=!s&&Element.prototype.getRootNode?function(t){var e;return null==t||null===(e=t.getRootNode)||void 0===e?void 0:e.call(t)}:function(t){return null==t?void 0:t.ownerDocument},l=function t(e,n){var i;void 0===n&&(n=!0);var o=null==e||null===(i=e.getAttribute)||void 0===i?void 0:i.call(e,"inert");return""===o||"true"===o||n&&e&&t(e.parentNode)},u=function(t,e,n){if(l(t))return[];var i=Array.prototype.slice.apply(t.querySelectorAll(r));return e&&c.call(t,r)&&i.unshift(t),i.filter(n)},d=function t(e,n,i){for(var o=[],s=Array.from(e);s.length;){var a=s.shift();if(!l(a,!1))if("SLOT"===a.tagName){var u=a.assignedElements(),d=t(u.length?u:a.children,!0,i);i.flatten?o.push.apply(o,d):o.push({scopeParent:a,candidates:d})}else{c.call(a,r)&&i.filter(a)&&(n||!e.includes(a))&&o.push(a);var f=a.shadowRoot||"function"==typeof i.getShadowRoot&&i.getShadowRoot(a),h=!l(f,!1)&&(!i.shadowRootFilter||i.shadowRootFilter(a));if(f&&h){var p=t(!0===f?a.children:f.children,!0,i);i.flatten?o.push.apply(o,p):o.push({scopeParent:a,candidates:p})}else s.unshift.apply(s,a.children)}}return o},f=function(t){return!isNaN(parseInt(t.getAttribute("tabindex"),10))},h=function(t){if(!t)throw new Error("No node provided");return t.tabIndex<0&&(/^(AUDIO|VIDEO|DETAILS)$/.test(t.tagName)||function(t){var e,n=null==t||null===(e=t.getAttribute)||void 0===e?void 0:e.call(t,"contenteditable");return""===n||"true"===n}(t))&&!f(t)?0:t.tabIndex},p=function(t,e){return t.tabIndex===e.tabIndex?t.documentOrder-e.documentOrder:t.tabIndex-e.tabIndex},g=function(t){return"INPUT"===t.tagName},m=function(t){var e=t.getBoundingClientRect(),n=e.width,i=e.height;return 0===n&&0===i},b=function(t,e){return!(e.disabled||l(e)||function(t){return g(t)&&"hidden"===t.type}(e)||function(t,e){var n=e.displayCheck,i=e.getShadowRoot;if("hidden"===getComputedStyle(t).visibility)return!0;var o=c.call(t,"details>summary:first-of-type")?t.parentElement:t;if(c.call(o,"details:not([open]) *"))return!0;if(n&&"full"!==n&&"legacy-full"!==n){if("non-zero-area"===n)return m(t)}else{if("function"==typeof i){for(var r=t;t;){var s=t.parentElement,l=a(t);if(s&&!s.shadowRoot&&!0===i(s))return m(t);t=t.assignedSlot?t.assignedSlot:s||l===t.ownerDocument?s:l.host}t=r}if(function(t){var e,n,i,o,r=t&&a(t),s=null===(e=r)||void 0===e?void 0:e.host,c=!1;if(r&&r!==t)for(c=!!(null!==(n=s)&&void 0!==n&&null!==(i=n.ownerDocument)&&void 0!==i&&i.contains(s)||null!=t&&null!==(o=t.ownerDocument)&&void 0!==o&&o.contains(t));!c&&s;){var l,u,d;c=!(null===(u=s=null===(l=r=a(s))||void 0===l?void 0:l.host)||void 0===u||null===(d=u.ownerDocument)||void 0===d||!d.contains(s))}return c}(t))return!t.getClientRects().length;if("legacy-full"!==n)return!0}return!1}(e,t)||function(t){return"DETAILS"===t.tagName&&Array.prototype.slice.apply(t.children).some((function(t){return"SUMMARY"===t.tagName}))}(e)||function(t){if(/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(t.tagName))for(var e=t.parentElement;e;){if("FIELDSET"===e.tagName&&e.disabled){for(var n=0;n<e.children.length;n++){var i=e.children.item(n);if("LEGEND"===i.tagName)return!!c.call(e,"fieldset[disabled] *")||!i.contains(t)}return!0}e=e.parentElement}return!1}(e))},v=function(t,e){return!(function(t){return function(t){return g(t)&&"radio"===t.type}(t)&&!function(t){if(!t.name)return!0;var e,n=t.form||a(t),i=function(t){return n.querySelectorAll('input[type="radio"][name="'+t+'"]')};if("undefined"!=typeof window&&void 0!==window.CSS&&"function"==typeof window.CSS.escape)e=i(window.CSS.escape(t.name));else try{e=i(t.name)}catch(t){return console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s",t.message),!1}var o=function(t,e){for(var n=0;n<t.length;n++)if(t[n].checked&&t[n].form===e)return t[n]}(e,t.form);return!o||o===t}(t)}(e)||h(e)<0||!b(t,e))},w=function(t){var e=parseInt(t.getAttribute("tabindex"),10);return!!(isNaN(e)||e>=0)},y=function t(e){var n=[],i=[];return e.forEach((function(e,o){var r=!!e.scopeParent,s=r?e.scopeParent:e,c=function(t,e){var n=h(t);return n<0&&e&&!f(t)?0:n}(s,r),a=r?t(e.candidates):s;0===c?r?n.push.apply(n,a):n.push(s):i.push({documentOrder:o,tabIndex:c,item:e,isScope:r,content:a})})),i.sort(p).reduce((function(t,e){return e.isScope?t.push.apply(t,e.content):t.push(e.content),t}),[]).concat(n)},k=function(t,e){var n;return n=(e=e||{}).getShadowRoot?d([t],e.includeContainer,{filter:v.bind(null,e),flatten:!1,getShadowRoot:e.getShadowRoot,shadowRootFilter:w}):u(t,e.includeContainer,v.bind(null,e)),y(n)},x=function(t,e){return(e=e||{}).getShadowRoot?d([t],e.includeContainer,{filter:b.bind(null,e),flatten:!0,getShadowRoot:e.getShadowRoot}):u(t,e.includeContainer,b.bind(null,e))},E=function(t,e){if(e=e||{},!t)throw new Error("No node provided");return!1!==c.call(t,r)&&v(e,t)},S=o.concat("iframe").join(","),N=function(t,e){if(e=e||{},!t)throw new Error("No node provided");return!1!==c.call(t,S)&&b(e,t)};const I={getShadowRoot:!0};function C(t){return t?t.id=t.id||`${t.tagName.toLowerCase()}-${(0,i.g)()}`:""}function O(t){const e=L(t,"[dir]");return e?e.getAttribute("dir"):"ltr"}function z(t){return t.getRootNode()}function $(t){return t.host||null}function R(t,{selector:e,id:n}){return function t(i){if(!i)return null;i.assignedSlot&&(i=i.assignedSlot);const o=z(i),r=n?"getElementById"in o?o.getElementById(n):null:e?o.querySelector(e):null,s=$(o);return r||(s?t(s):null)}(t)}function L(t,e){return function t(n){return n?n.closest(e)||t($(z(n))):null}(t)}function A(t,e){return _(t,e)}function _(t,e){if(!t)return;const n=e(t);if(void 0!==n)return n;const{parentNode:i}=t;return _(i instanceof ShadowRoot?i.host:i,e)}function D(t,e){return!!A(e,(e=>e===t||void 0))}async function F(t){if(t)return function(t){return"function"==typeof t?.setFocus}(t)?t.setFocus():t.focus()}function B(t){if(t)return k(t,I)[0]??t}function T(t){B(t)?.focus()}const M=":not([slot])";function P(t,e,n){e&&!Array.isArray(e)&&"string"!=typeof e&&(n=e,e=null);const i=e?Array.isArray(e)?e.map((t=>`[slot="${t}"]`)).join(","):`[slot="${e}"]`:M;return n?.all?function(t,e,n){let i=e===M?j(t,M):Array.from(t.querySelectorAll(e));i=n&&!1===n.direct?i:i.filter((e=>e.parentElement===t)),i=n?.matches?i.filter((t=>t?.matches(n.matches))):i;const o=n?.selector;return o?i.map((t=>Array.from(t.querySelectorAll(o)))).reduce(((t,e)=>[...t,...e]),[]).filter((t=>!!t)):i}(t,i,n):function(t,e,n){let i=e===M?j(t,M)[0]||null:t.querySelector(e);i=n&&!1===n.direct||i?.parentElement===t?i:null,i=n?.matches?i?.matches(n.matches)?i:null:i;const o=n?.selector;return o?i?.querySelector(o):i}(t,i,n)}function j(t,e){return t?Array.from(t.children||[]).filter((t=>t?.matches(e))):[]}function q(t,e,n){return"string"==typeof e&&""!==e?e:""===e?t[n]:void 0}function H(t){return Boolean(t).toString()}function U(t){return G(t)||function(t){return!!function(t){return function(t){return t.target.assignedNodes({flatten:!0})}(t).filter((t=>t.nodeType===Node.TEXT_NODE)).map((t=>t.textContent)).join("").trim()}(t)}(t)}function G(t){return!!X(t).length}function X(t){return t.target.assignedElements({flatten:!0})}function W(t){return!(!t.isPrimary||0!==t.button)}function V(t){return 0===t.detail}const J=(t,e,n,i=!0)=>{const o=t.indexOf(e),r=0===o,s=o===t.length-1;let c;return i&&(n="previous"===n&&r?"last":"next"===n&&s?"first":n),c="previous"===n?t[o-1]||t[i?t.length-1:o]:"next"===n?t[o+1]||t[i?0:o]:"last"===n?t[t.length-1]:t[0],F(c),c};function K(t,e){if(t.parentNode!==e.parentNode)return!1;const n=Array.from(t.parentNode.children);return n.indexOf(t)<n.indexOf(e)}},20369:function(t,e,n){n.d(e,{g:function(){return i}});const i=()=>[2,1,1,1,3].map((t=>{let e="";for(let n=0;n<t;n++)e+=(65536*(1+Math.random())|0).toString(16).substring(1);return e})).join("-")},82269:function(t,e,n){n.d(e,{I:function(){return d},d:function(){return f}});var i=n(17858),o=n(12970),r=n(51941);const s={},c={},a={s:16,m:24,l:32};function l({icon:t,scale:e}){const n=a[e],i=function(t){const e=!isNaN(Number(t.charAt(0))),n=t.split("-");if(n.length>0){const e=/[a-z]/i;t=n.map(((t,n)=>t.replace(e,(function(t,e){return 0===n&&0===e?t:t.toUpperCase()})))).join("")}return e?`i${t}`:t}(t),o="F"===i.charAt(i.length-1);return`${o?i.substring(0,i.length-1):i}${n}${o?"F":""}`}function u(t){return s[t]}const d=(0,i.w$)(class extends i.wt{constructor(){super(),this.__registerHost(),this.__attachShadow(),this.icon=null,this.flipRtl=!1,this.scale="m",this.textLabel=void 0,this.pathData=void 0,this.visible=!1}connectedCallback(){this.visible||this.waitUntilVisible((()=>{this.visible=!0,this.loadIconPathData()}))}disconnectedCallback(){this.intersectionObserver?.disconnect(),this.intersectionObserver=null}render(){const{el:t,flipRtl:e,pathData:n,scale:r,textLabel:s}=this,c=(0,o.a)(t),l=a[r],u=!!s,d=[].concat(n||"");return(0,i.h)(i.xr,{key:"03df405731dff4dbb4e6e9bd1c7f809b620d7505","aria-hidden":(0,o.t)(!u),"aria-label":u?s:null,role:u?"img":null},(0,i.h)("svg",{key:"d8fbf4132b6819717415a30ae11bf3695c282d78","aria-hidden":"true",class:{"flip-rtl":"rtl"===c&&e,svg:!0},fill:"currentColor",height:"100%",viewBox:`0 0 ${l} ${l}`,width:"100%",xmlns:"http://www.w3.org/2000/svg"},d.map((t=>"string"==typeof t?(0,i.h)("path",{d:t}):(0,i.h)("path",{d:t.d,opacity:"opacity"in t?t.opacity:1})))))}async loadIconPathData(){const{icon:t,scale:e,visible:n}=this;if(!i.L2.isBrowser||!t||!n)return;const o={icon:t,scale:e},r=u(l(o))||await async function(t){const e=l(t),n=u(e);if(n)return n;c[e]||(c[e]=fetch((0,i.OX)(`./assets/icon/${e}.json`)).then((t=>t.json())).catch((()=>(console.error(`"${e}" is not a valid calcite-ui-icon name`),""))));const o=await c[e];return s[e]=o,o}(o);t===this.icon&&(this.pathData=r)}waitUntilVisible(t){this.intersectionObserver=(0,r.c)("intersection",(e=>{e.forEach((e=>{e.isIntersecting&&(this.intersectionObserver.disconnect(),this.intersectionObserver=null,t())}))}),{rootMargin:"50px"}),this.intersectionObserver?this.intersectionObserver.observe(this.el):t()}static get assetsDirs(){return["assets"]}get el(){return this}static get watchers(){return{icon:["loadIconPathData"],scale:["loadIconPathData"]}}static get style(){return":host{display:inline-flex;color:var(--calcite-ui-icon-color)}:host([scale=s]){inline-size:16px;block-size:16px;min-inline-size:16px;min-block-size:16px}:host([scale=m]){inline-size:24px;block-size:24px;min-inline-size:24px;min-block-size:24px}:host([scale=l]){inline-size:32px;block-size:32px;min-inline-size:32px;min-block-size:32px}.flip-rtl{transform:scaleX(-1)}.svg{display:block}:host([hidden]){display:none}[hidden]{display:none}"}},[1,"calcite-icon",{icon:[513],flipRtl:[516,"flip-rtl"],scale:[513],textLabel:[1,"text-label"],pathData:[32],visible:[32]},void 0,{icon:["loadIconPathData"],scale:["loadIconPathData"]}]);function f(){"undefined"!=typeof customElements&&["calcite-icon"].forEach((t=>{"calcite-icon"===t&&(customElements.get(t)||customElements.define(t,d))}))}f()},25173:function(t,e,n){function i(t){return"Enter"===t||" "===t}n.d(e,{i:function(){return i},n:function(){return o}});const o=["0","1","2","3","4","5","6","7","8","9"]},85644:function(t,e,n){n.d(e,{a:function(){return c},c:function(){return a},s:function(){return s}});var i=n(71409);const o=new WeakMap,r=new WeakMap;function s(t){r.set(t,new Promise((e=>o.set(t,e))))}function c(t){o.get(t)()}async function a(t){await(0,i.c)(t.el)}},2846:function(t,e,n){n.d(e,{B:function(){return a},a:function(){return v},c:function(){return O},d:function(){return z},g:function(){return I},i:function(){return l},n:function(){return R},p:function(){return u},s:function(){return m}});var i=n(12970),o=n(25173),r=n(51941);const s=new RegExp("\\.(0+)?$"),c=new RegExp("0+$");class a{constructor(t){if(t instanceof a)return t;const[e,n]=function(t){const e=t.split(/[eE]/);if(1===e.length)return t;const n=+t;if(Number.isSafeInteger(n))return`${n}`;const i="-"===t.charAt(0),o=+e[1],r=e[0].split("."),c=(i?r[0].substring(1):r[0])||"",a=r[1]||"",l=o>0?`${c}${((t,e)=>{const n=e>t.length?`${t}${"0".repeat(e-t.length)}`:t;return`${n.slice(0,e)}.${n.slice(e)}`})(a,o)}`:`${((t,e)=>{const n=Math.abs(e)-t.length,i=n>0?`${"0".repeat(n)}${t}`:t;return`${i.slice(0,e)}.${i.slice(e)}`})(c,o)}${a}`;return`${i?"-":""}${"."===l.charAt(0)?"0":""}${l.replace(s,"").replace(d,"")}`}(t).split(".").concat("");this.value=BigInt(e+n.padEnd(a.DECIMALS,"0").slice(0,a.DECIMALS))+BigInt(a.ROUNDED&&n[a.DECIMALS]>="5"),this.isNegative="-"===t.charAt(0)}getIntegersAndDecimals(){const t=this.value.toString().replace("-","").padStart(a.DECIMALS+1,"0");return{integers:t.slice(0,-a.DECIMALS),decimals:t.slice(-a.DECIMALS).replace(c,"")}}toString(){const{integers:t,decimals:e}=this.getIntegersAndDecimals();return`${this.isNegative?"-":""}${t}${e.length?"."+e:""}`}formatToParts(t){const{integers:e,decimals:n}=this.getIntegersAndDecimals(),i=t.numberFormatter.formatToParts(BigInt(e));return this.isNegative&&i.unshift({type:"minusSign",value:t.minusSign}),n.length&&(i.push({type:"decimal",value:t.decimal}),n.split("").forEach((t=>i.push({type:"fraction",value:t})))),i}format(t){const{integers:e,decimals:n}=this.getIntegersAndDecimals();return`${this.isNegative?t.minusSign:""}${t.numberFormatter.format(BigInt(e))}${n.length?`${t.decimal}${n.split("").map((e=>t.numberFormatter.format(Number(e)))).join("")}`:""}`}add(t){return a.fromBigInt(this.value+new a(t).value)}subtract(t){return a.fromBigInt(this.value-new a(t).value)}multiply(t){return a._divRound(this.value*new a(t).value,a.SHIFT)}divide(t){return a._divRound(this.value*a.SHIFT,new a(t).value)}}function l(t){return!(!t||isNaN(Number(t)))}function u(t){return t&&(e=t,o.n.some((t=>e.includes(t))))?b(t,(t=>{let e=!1;const n=t.split("").filter(((t,n)=>t.match(/\./g)&&!e?(e=!0,!0):!(!t.match(/-/g)||0!==n)||o.n.includes(t))).join("");return l(n)?new a(n).toString():""})):"";var e}a.DECIMALS=100,a.ROUNDED=!0,a.SHIFT=BigInt("1"+"0".repeat(a.DECIMALS)),a._divRound=(t,e)=>a.fromBigInt(t/e+(a.ROUNDED?t*BigInt(2)/e%BigInt(2):BigInt(0))),a.fromBigInt=t=>Object.assign(Object.create(a.prototype),{value:t,isNegative:t<BigInt(0)});const d=/^([-0])0+(?=\d)/,f=/(?!^\.)\.$/,h=/(?!^-)-/g,p=/^-\b0\b\.?0*$/,g=/0*$/,m=t=>b(t,(t=>{const e=t.replace(h,"").replace(f,"").replace(d,"$1");return l(e)?p.test(e)?e:function(t){const e=t.split(".")[1],n=new a(t).toString(),[i,o]=n.split(".");return e&&o!==e?`${i}.${e}`:n}(e):t}));function b(t,e){if(!t)return t;const n=t.toLowerCase().indexOf("e")+1;return n?t.replace(/[eE]*$/g,"").substring(0,n).concat(t.slice(n).replace(/[eE]/g,"")).split(/[eE]/).map(((t,n)=>e(1===n?t.replace(/\./g,""):t))).join("e").replace(/^e/,"1e"):e(t)}function v(t,e,n){const i=e.split(".")[1];if(i){const o=i.match(g)[0];if(o&&n.delocalize(t).length!==e.length&&-1===i.indexOf("e")){const e=n.decimal;return(t=t.includes(e)?t:`${t}${e}`).padEnd(t.length+o.length,n.localize("0"))}}return t}const w="en",y=["ar","bg","bs","ca","cs","da","de","el",w,"es","et","fi","fr","he","hr","hu","id","it","ja","ko","lt","lv","no","nl","pl","pt-BR","pt-PT","ro","ru","sk","sl","sr","sv","th","tr","uk","vi","zh-CN","zh-HK","zh-TW"],k=["ar","bg","bs","ca","cs","da","de","de-AT","de-CH","el",w,"en-AU","en-CA","en-GB","es","es-MX","et","fi","fr","fr-CH","he","hi","hr","hu","id","it","it-CH","ja","ko","lt","lv","mk","no","nl","pl","pt","pt-PT","ro","ru","sk","sl","sr","sv","th","tr","uk","vi","zh-CN","zh-HK","zh-TW"],x=["arab","arabext","latn"],E=t=>x.includes(t),S=(new Intl.NumberFormat).resolvedOptions().numberingSystem,N="arab"!==S&&E(S)?S:"latn";function I(t,e="cldr"){const n="cldr"===e?k:y;return t?n.includes(t)?t:"nb"===(t=t.toLowerCase())?"no":"t9n"===e&&"pt"===t?"pt-BR":(t.includes("-")&&(t=t.replace(/(\w+)-(\w+)/,((t,e,n)=>`${e}-${n.toUpperCase()}`)),n.includes(t)||(t=t.split("-")[0])),"zh"===t?"zh-CN":n.includes(t)?t:(console.warn(`Translations for the "${t}" locale are not available and will fall back to the default, English (en).`),w)):w}const C=new Set;function O(t){!function(t){t.effectiveLocale=function(t){return t.el.lang||(0,i.c)(t.el,"[lang]")?.lang||document.documentElement.lang||w}(t)}(t),0===C.size&&$?.observe(document.documentElement,{attributes:!0,attributeFilter:["lang"],subtree:!0}),C.add(t)}function z(t){C.delete(t),0===C.size&&$.disconnect()}const $=(0,r.c)("mutation",(t=>{t.forEach((t=>{const e=t.target;C.forEach((t=>{if(!(0,i.b)(e,t.el))return;const n=(0,i.c)(t.el,"[lang]");if(!n)return void(t.effectiveLocale=w);const o=n.lang;t.effectiveLocale=n.hasAttribute("lang")&&""===o?w:o}))}))})),R=new class{constructor(){this.delocalize=t=>this._numberFormatOptions?b(t,(t=>t.replace(new RegExp(`[${this._minusSign}]`,"g"),"-").replace(new RegExp(`[${this._group}]`,"g"),"").replace(new RegExp(`[${this._decimal}]`,"g"),".").replace(new RegExp(`[${this._digits.join("")}]`,"g"),this._getDigitIndex))):t,this.localize=t=>this._numberFormatOptions?b(t,(t=>l(t.trim())?new a(t.trim()).format(this).replace(new RegExp(`[${this._actualGroup}]`,"g"),this._group):t)):t}get group(){return this._group}get decimal(){return this._decimal}get minusSign(){return this._minusSign}get digits(){return this._digits}get numberFormatter(){return this._numberFormatter}get numberFormatOptions(){return this._numberFormatOptions}set numberFormatOptions(t){var e;if(t.locale=I(t?.locale),t.numberingSystem=(e=t?.numberingSystem,E(e)?e:N),!this._numberFormatOptions&&t.locale===w&&t.numberingSystem===N&&2===Object.keys(t).length||JSON.stringify(this._numberFormatOptions)===JSON.stringify(t))return;this._numberFormatOptions=t,this._numberFormatter=new Intl.NumberFormat(this._numberFormatOptions.locale,this._numberFormatOptions),this._digits=[...new Intl.NumberFormat(this._numberFormatOptions.locale,{useGrouping:!1,numberingSystem:this._numberFormatOptions.numberingSystem}).format(9876543210)].reverse();const n=new Map(this._digits.map(((t,e)=>[t,e]))),i=new Intl.NumberFormat(this._numberFormatOptions.locale,{numberingSystem:this._numberFormatOptions.numberingSystem}).formatToParts(-12345678.9);this._actualGroup=i.find((t=>"group"===t.type)).value,this._group=0===this._actualGroup.trim().length||" "==this._actualGroup?" ":this._actualGroup,this._decimal=i.find((t=>"decimal"===t.type)).value,this._minusSign=i.find((t=>"minusSign"===t.type)).value,this._getDigitIndex=t=>n.get(t)}}},51941:function(t,e,n){n.d(e,{c:function(){return o}});var i=n(17858);function o(t,e,n){if(!i.L2.isBrowser)return;const o=function(t){class e extends window.MutationObserver{constructor(t){super(t),this.observedEntry=[],this.callback=t}observe(t,e){return this.observedEntry.push({target:t,options:e}),super.observe(t,e)}unobserve(t){const e=this.observedEntry.filter((e=>e.target!==t));this.observedEntry=[],this.callback(super.takeRecords(),this),this.disconnect(),e.forEach((t=>this.observe(t.target,t.options)))}}return"intersection"===t?window.IntersectionObserver:"mutation"===t?e:window.ResizeObserver}(t);return new o(e,n)}},1791:function(t,e,n){n.d(e,{o:function(){return s}});var i=n(17858);function o(t){return"opened"in t?t.opened:t.open}function r(t,e=!1){(e?t[t.transitionProp]:o(t))?t.onBeforeOpen():t.onBeforeClose(),(e?t[t.transitionProp]:o(t))?t.onOpen():t.onClose()}function s(t,e=!1){(0,i.gv)((()=>{if(!t.transitionEl)return;const{transitionDuration:n,transitionProperty:i}=getComputedStyle(t.transitionEl),s=n.split(","),c=s[i.split(",").indexOf(t.openTransitionProp)]??s[0];if("0s"===c)return void r(t,e);const a=setTimeout((()=>{t.transitionEl.removeEventListener("transitionstart",l),t.transitionEl.removeEventListener("transitionend",u),t.transitionEl.removeEventListener("transitioncancel",u),r(t,e)}),1e3*parseFloat(c));function l(n){n.propertyName===t.openTransitionProp&&n.target===t.transitionEl&&(clearTimeout(a),t.transitionEl.removeEventListener("transitionstart",l),(e?t[t.transitionProp]:o(t))?t.onBeforeOpen():t.onBeforeClose())}function u(n){n.propertyName===t.openTransitionProp&&n.target===t.transitionEl&&((e?t[t.transitionProp]:o(t))?t.onOpen():t.onClose(),t.transitionEl.removeEventListener("transitionend",u),t.transitionEl.removeEventListener("transitioncancel",u))}t.transitionEl.addEventListener("transitionstart",l),t.transitionEl.addEventListener("transitionend",u),t.transitionEl.addEventListener("transitioncancel",u)}))}},53129:function(t,e,n){n.d(e,{c:function(){return f},d:function(){return h},s:function(){return l},u:function(){return d}});var i=n(17858),o=n(2846);const r={};function s(){throw new Error("could not fetch component message bundle")}function c(t){t.messages={...t.defaultMessages,...t.messageOverrides}}function a(){}async function l(t){t.defaultMessages=await u(t,t.effectiveLocale),c(t)}async function u(t,e){if(!i.L2.isBrowser)return{};const{el:n}=t,c=n.tagName.toLowerCase().replace("calcite-","");return async function(t,e){const n=`${e}_${t}`;return r[n]||(r[n]=fetch((0,i.OX)(`./assets/${e}/t9n/messages_${t}.json`)).then((t=>(t.ok||s(),t.json()))).catch((()=>s()))),r[n]}((0,o.g)(e,"t9n"),c)}async function d(t,e){t.defaultMessages=await u(t,e),c(t)}function f(t){t.onMessagesChange=p}function h(t){t.onMessagesChange=a}function p(){c(this)}}}]);
//# sourceMappingURL=@esri-calcite-components-dist-components-calcite-notice.js.map