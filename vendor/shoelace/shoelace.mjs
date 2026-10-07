var Fe="";function Gt(t){Fe=t}function Ie(t=""){if(!Fe){let e=[...document.getElementsByTagName("script")],o=e.find(i=>i.hasAttribute("data-shoelace"));if(o)Gt(o.getAttribute("data-shoelace"));else{let i=e.find(s=>/shoelace(\.min)?\.js($|\?)/.test(s.src)||/shoelace-autoloader(\.min)?\.js($|\?)/.test(s.src)),r="";i&&(r=i.getAttribute("src")),Gt(r.split("/").slice(0,-1).join("/"))}}return Fe.replace(/\/$/,"")+(t?`/${t.replace(/^\//,"")}`:"")}var xo=Object.defineProperty,ar=Object.defineProperties,lr=Object.getOwnPropertyDescriptor,cr=Object.getOwnPropertyDescriptors,wo=Object.getOwnPropertySymbols,dr=Object.prototype.hasOwnProperty,hr=Object.prototype.propertyIsEnumerable,Ue=(t,e)=>(e=Symbol[t])?e:Symbol.for("Symbol."+t),We=t=>{throw TypeError(t)},_o=(t,e,o)=>e in t?xo(t,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[e]=o,K=(t,e)=>{for(var o in e||(e={}))dr.call(e,o)&&_o(t,o,e[o]);if(wo)for(var o of wo(e))hr.call(e,o)&&_o(t,o,e[o]);return t},Ft=(t,e)=>ar(t,cr(e)),c=(t,e,o,i)=>{for(var r=i>1?void 0:i?lr(e,o):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(r=(i?n(e,o,r):n(r))||r);return i&&r&&xo(e,o,r),r},Ao=(t,e,o)=>e.has(t)||We("Cannot "+o),$o=(t,e,o)=>(Ao(t,e,"read from private field"),o?o.call(t):e.get(t)),So=(t,e,o)=>e.has(t)?We("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,o),Co=(t,e,o,i)=>(Ao(t,e,"write to private field"),i?i.call(t,o):e.set(t,o),o),pr=function(t,e){this[0]=t,this[1]=e},Eo=t=>{var e=t[Ue("asyncIterator")],o=!1,i,r={};return e==null?(e=t[Ue("iterator")](),i=s=>r[s]=n=>e[s](n)):(e=e.call(t),i=s=>r[s]=n=>{if(o){if(o=!1,s==="throw")throw n;return n}return o=!0,{done:!1,value:new pr(new Promise(a=>{var l=e[s](n);l instanceof Object||We("Object expected"),a(l)}),1)}}),r[Ue("iterator")]=()=>r,i("next"),"throw"in e?i("throw"):r.throw=s=>{throw s},"return"in e&&i("return"),r};var qe=new Set,It=new Map,pt,Ve="ltr",je="en",ko=typeof MutationObserver<"u"&&typeof document<"u"&&typeof document.documentElement<"u";if(ko){let t=new MutationObserver(To);Ve=document.documentElement.dir||"ltr",je=document.documentElement.lang||navigator.language,t.observe(document.documentElement,{attributes:!0,attributeFilter:["dir","lang"]})}function St(...t){t.map(e=>{let o=e.$code.toLowerCase();It.has(o)?It.set(o,Object.assign(Object.assign({},It.get(o)),e)):It.set(o,e),pt||(pt=e)}),To()}function To(){ko&&(Ve=document.documentElement.dir||"ltr",je=document.documentElement.lang||navigator.language),[...qe.keys()].map(t=>{typeof t.requestUpdate=="function"&&t.requestUpdate()})}var ge=class{constructor(e){this.host=e,this.host.addController(this)}hostConnected(){qe.add(this.host)}hostDisconnected(){qe.delete(this.host)}dir(){return`${this.host.dir||Ve}`.toLowerCase()}lang(){let e=`${this.host.lang||je}`.toLowerCase().replace(/_/g,"-");try{return new Intl.Locale(e),e}catch{return pt?pt.$code.toLowerCase():"en"}}getTranslationData(e){var o,i;let r;try{r=new Intl.Locale(e.replace(/_/g,"-"))}catch{return{locale:void 0,language:"",region:"",primary:void 0,secondary:void 0}}let s=r.language.toLowerCase(),n=(i=(o=r.region)===null||o===void 0?void 0:o.toLowerCase())!==null&&i!==void 0?i:"",a=It.get(`${s}-${n}`),l=It.get(s);return{locale:r,language:s,region:n,primary:a,secondary:l}}exists(e,o){var i;let{primary:r,secondary:s}=this.getTranslationData((i=o.lang)!==null&&i!==void 0?i:this.lang());return o=Object.assign({includeFallback:!1},o),!!(r&&r[e]||s&&s[e]||o.includeFallback&&pt&&pt[e])}term(e,...o){let{primary:i,secondary:r}=this.getTranslationData(this.lang()),s;if(i&&i[e])s=i[e];else if(r&&r[e])s=r[e];else if(pt&&pt[e])s=pt[e];else return console.error(`No translation found for: ${String(e)}`),String(e);return typeof s=="function"?s(...o):s}date(e,o){return e=new Date(e),new Intl.DateTimeFormat(this.lang(),o).format(e)}number(e,o){return e=Number(e),isNaN(e)?"":new Intl.NumberFormat(this.lang(),o).format(e)}relativeTime(e,o,i){return new Intl.RelativeTimeFormat(this.lang(),i).format(e,o)}};var Oo={$code:"en",$name:"English",$dir:"ltr",carousel:"Carousel",clearEntry:"Clear entry",close:"Close",copied:"Copied",copy:"Copy",currentValue:"Current value",error:"Error",goToSlide:(t,e)=>`Go to slide ${t} of ${e}`,hidePassword:"Hide password",loading:"Loading",nextSlide:"Next slide",numOptionsSelected:t=>t===0?"No options selected":t===1?"1 option selected":`${t} options selected`,previousSlide:"Previous slide",progress:"Progress",remove:"Remove",resize:"Resize",scrollToEnd:"Scroll to end",scrollToStart:"Scroll to start",selectAColorFromTheScreen:"Select a color from the screen",showPassword:"Show password",slideNum:t=>`Slide ${t}`,toggleColorFormat:"Toggle color format"};St(Oo);var Po=Oo;var V=class extends ge{};St(Po);var ur={$code:"es",$name:"Espa\xF1ol",$dir:"ltr",carousel:"Carrusel",clearEntry:"Borrar entrada",close:"Cerrar",copied:"Copiado",copy:"Copiar",currentValue:"Valor actual",error:"Error",goToSlide:(t,e)=>`Ir a la diapositiva ${t} de ${e}`,hidePassword:"Ocultar contrase\xF1a",loading:"Cargando",nextSlide:"Siguiente diapositiva",numOptionsSelected:t=>t===0?"No hay opciones seleccionadas":t===1?"1 opci\xF3n seleccionada":`${t} opci\xF3n seleccionada`,previousSlide:"Diapositiva anterior",progress:"Progreso",remove:"Eliminar",resize:"Cambiar el tama\xF1o",scrollToEnd:"Desplazarse hasta el final",scrollToStart:"Desplazarse al inicio",selectAColorFromTheScreen:"Seleccione un color de la pantalla",showPassword:"Mostrar contrase\xF1a",slideNum:t=>`Diapositiva ${t}`,toggleColorFormat:"Alternar formato de color"};St(ur);var be=globalThis,ve=be.ShadowRoot&&(be.ShadyCSS===void 0||be.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ke=Symbol(),Lo=new WeakMap,Zt=class{constructor(e,o,i){if(this._$cssResult$=!0,i!==Ke)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=o}get styleSheet(){let e=this.o,o=this.t;if(ve&&e===void 0){let i=o!==void 0&&o.length===1;i&&(e=Lo.get(o)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&Lo.set(o,e))}return e}toString(){return this.cssText}},Ro=t=>new Zt(typeof t=="string"?t:t+"",void 0,Ke),C=(t,...e)=>{let o=t.length===1?t[0]:e.reduce((i,r,s)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+t[s+1],t[0]);return new Zt(o,t,Ke)},zo=(t,e)=>{if(ve)t.adoptedStyleSheets=e.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of e){let i=document.createElement("style"),r=be.litNonce;r!==void 0&&i.setAttribute("nonce",r),i.textContent=o.cssText,t.appendChild(i)}},Xe=ve?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let o="";for(let i of e.cssRules)o+=i.cssText;return Ro(o)})(t):t;var{is:fr,defineProperty:mr,getOwnPropertyDescriptor:gr,getOwnPropertyNames:br,getOwnPropertySymbols:vr,getPrototypeOf:yr}=Object,vt=globalThis,Do=vt.trustedTypes,wr=Do?Do.emptyScript:"",_r=vt.reactiveElementPolyfillSupport,Jt=(t,e)=>t,Qt={toAttribute(t,e){switch(e){case Boolean:t=t?wr:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=t!==null;break;case Number:o=t===null?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch{o=null}}return o}},ye=(t,e)=>!fr(t,e),Bo={attribute:!0,type:String,converter:Qt,reflect:!1,useDefault:!1,hasChanged:ye};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),vt.litPropertyMetadata??(vt.litPropertyMetadata=new WeakMap);var ut=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,o=Bo){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(e,o),!o.noAccessor){let i=Symbol(),r=this.getPropertyDescriptor(e,i,o);r!==void 0&&mr(this.prototype,e,r)}}static getPropertyDescriptor(e,o,i){let{get:r,set:s}=gr(this.prototype,e)??{get(){return this[o]},set(n){this[o]=n}};return{get:r,set(n){let a=r?.call(this);s?.call(this,n),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Bo}static _$Ei(){if(this.hasOwnProperty(Jt("elementProperties")))return;let e=yr(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Jt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Jt("properties"))){let o=this.properties,i=[...br(o),...vr(o)];for(let r of i)this.createProperty(r,o[r])}let e=this[Symbol.metadata];if(e!==null){let o=litPropertyMetadata.get(e);if(o!==void 0)for(let[i,r]of o)this.elementProperties.set(i,r)}this._$Eh=new Map;for(let[o,i]of this.elementProperties){let r=this._$Eu(o,i);r!==void 0&&this._$Eh.set(r,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let o=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let r of i)o.unshift(Xe(r))}else e!==void 0&&o.push(Xe(e));return o}static _$Eu(e,o){let i=o.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,o=this.constructor.elementProperties;for(let i of o.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return zo(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,o,i){this._$AK(e,i)}_$ET(e,o){let i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(r!==void 0&&i.reflect===!0){let s=(i.converter?.toAttribute!==void 0?i.converter:Qt).toAttribute(o,i.type);this._$Em=e,s==null?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(e,o){let i=this.constructor,r=i._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let s=i.getPropertyOptions(r),n=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Qt;this._$Em=r;let a=n.fromAttribute(o,s.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,o,i,r=!1,s){if(e!==void 0){let n=this.constructor;if(r===!1&&(s=this[e]),i??(i=n.getPropertyOptions(e)),!((i.hasChanged??ye)(s,o)||i.useDefault&&i.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,o,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,o,{useDefault:i,reflect:r,wrapped:s},n){i&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,n??o??this[e]),s!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(o=void 0),this._$AL.set(e,o)),r===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[r,s]of this._$Ep)this[r]=s;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[r,s]of i){let{wrapped:n}=s,a=this[r];n!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,s,a)}}let e=!1,o=this._$AL;try{e=this.shouldUpdate(o),e?(this.willUpdate(o),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(o)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(o)}willUpdate(e){}_$AE(e){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(e){}firstUpdated(e){}};ut.elementStyles=[],ut.shadowRootOptions={mode:"open"},ut[Jt("elementProperties")]=new Map,ut[Jt("finalized")]=new Map,_r?.({ReactiveElement:ut}),(vt.reactiveElementVersions??(vt.reactiveElementVersions=[])).push("2.1.2");var ee=globalThis,Mo=t=>t,we=ee.trustedTypes,No=we?we.createPolicy("lit-html",{createHTML:t=>t}):void 0,Ge="$lit$",ft=`lit$${Math.random().toFixed(9).slice(2)}$`,Ze="?"+ft,xr=`<${Ze}>`,kt=document,oe=()=>kt.createComment(""),ie=t=>t===null||typeof t!="object"&&typeof t!="function",Je=Array.isArray,qo=t=>Je(t)||typeof t?.[Symbol.iterator]=="function",Ye=`[ 	
\f\r]`,te=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ho=/-->/g,Fo=/>/g,Ct=RegExp(`>|${Ye}(?:([^\\s"'>=/]+)(${Ye}*=${Ye}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Io=/'/g,Uo=/"/g,Vo=/^(?:script|style|textarea|title)$/i,Qe=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),x=Qe(1),jo=Qe(2),Ko=Qe(3),mt=Symbol.for("lit-noChange"),R=Symbol.for("lit-nothing"),Wo=new WeakMap,Et=kt.createTreeWalker(kt,129);function Xo(t,e){if(!Je(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return No!==void 0?No.createHTML(e):e}var Yo=(t,e)=>{let o=t.length-1,i=[],r,s=e===2?"<svg>":e===3?"<math>":"",n=te;for(let a=0;a<o;a++){let l=t[a],d,h,p=-1,m=0;for(;m<l.length&&(n.lastIndex=m,h=n.exec(l),h!==null);)m=n.lastIndex,n===te?h[1]==="!--"?n=Ho:h[1]!==void 0?n=Fo:h[2]!==void 0?(Vo.test(h[2])&&(r=RegExp("</"+h[2],"g")),n=Ct):h[3]!==void 0&&(n=Ct):n===Ct?h[0]===">"?(n=r??te,p=-1):h[1]===void 0?p=-2:(p=n.lastIndex-h[2].length,d=h[1],n=h[3]===void 0?Ct:h[3]==='"'?Uo:Io):n===Uo||n===Io?n=Ct:n===Ho||n===Fo?n=te:(n=Ct,r=void 0);let f=n===Ct&&t[a+1].startsWith("/>")?" ":"";s+=n===te?l+xr:p>=0?(i.push(d),l.slice(0,p)+Ge+l.slice(p)+ft+f):l+ft+(p===-2?a:f)}return[Xo(t,s+(t[o]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},re=class t{constructor({strings:e,_$litType$:o},i){let r;this.parts=[];let s=0,n=0,a=e.length-1,l=this.parts,[d,h]=Yo(e,o);if(this.el=t.createElement(d,i),Et.currentNode=this.el.content,o===2||o===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(r=Et.nextNode())!==null&&l.length<a;){if(r.nodeType===1){if(r.hasAttributes())for(let p of r.getAttributeNames())if(p.endsWith(Ge)){let m=h[n++],f=r.getAttribute(p).split(ft),g=/([.?@])?(.*)/.exec(m);l.push({type:1,index:s,name:g[2],strings:f,ctor:g[1]==="."?xe:g[1]==="?"?Ae:g[1]==="@"?$e:Ot}),r.removeAttribute(p)}else p.startsWith(ft)&&(l.push({type:6,index:s}),r.removeAttribute(p));if(Vo.test(r.tagName)){let p=r.textContent.split(ft),m=p.length-1;if(m>0){r.textContent=we?we.emptyScript:"";for(let f=0;f<m;f++)r.append(p[f],oe()),Et.nextNode(),l.push({type:2,index:++s});r.append(p[m],oe())}}}else if(r.nodeType===8)if(r.data===Ze)l.push({type:2,index:s});else{let p=-1;for(;(p=r.data.indexOf(ft,p+1))!==-1;)l.push({type:7,index:s}),p+=ft.length-1}s++}}static createElement(e,o){let i=kt.createElement("template");return i.innerHTML=e,i}};function Tt(t,e,o=t,i){if(e===mt)return e;let r=i!==void 0?o._$Co?.[i]:o._$Cl,s=ie(e)?void 0:e._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),s===void 0?r=void 0:(r=new s(t),r._$AT(t,o,i)),i!==void 0?(o._$Co??(o._$Co=[]))[i]=r:o._$Cl=r),r!==void 0&&(e=Tt(t,r._$AS(t,e.values),r,i)),e}var _e=class{constructor(e,o){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:o},parts:i}=this._$AD,r=(e?.creationScope??kt).importNode(o,!0);Et.currentNode=r;let s=Et.nextNode(),n=0,a=0,l=i[0];for(;l!==void 0;){if(n===l.index){let d;l.type===2?d=new Ut(s,s.nextSibling,this,e):l.type===1?d=new l.ctor(s,l.name,l.strings,this,e):l.type===6&&(d=new Se(s,this,e)),this._$AV.push(d),l=i[++a]}n!==l?.index&&(s=Et.nextNode(),n++)}return Et.currentNode=kt,r}p(e){let o=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,o),o+=i.strings.length-2):i._$AI(e[o])),o++}},Ut=class t{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,o,i,r){this.type=2,this._$AH=R,this._$AN=void 0,this._$AA=e,this._$AB=o,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,o=this._$AM;return o!==void 0&&e?.nodeType===11&&(e=o.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,o=this){e=Tt(this,e,o),ie(e)?e===R||e==null||e===""?(this._$AH!==R&&this._$AR(),this._$AH=R):e!==this._$AH&&e!==mt&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):qo(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==R&&ie(this._$AH)?this._$AA.nextSibling.data=e:this.T(kt.createTextNode(e)),this._$AH=e}$(e){let{values:o,_$litType$:i}=e,r=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=re.createElement(Xo(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(o);else{let s=new _e(r,this),n=s.u(this.options);s.p(o),this.T(n),this._$AH=s}}_$AC(e){let o=Wo.get(e.strings);return o===void 0&&Wo.set(e.strings,o=new re(e)),o}k(e){Je(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,i,r=0;for(let s of e)r===o.length?o.push(i=new t(this.O(oe()),this.O(oe()),this,this.options)):i=o[r],i._$AI(s),r++;r<o.length&&(this._$AR(i&&i._$AB.nextSibling,r),o.length=r)}_$AR(e=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);e!==this._$AB;){let i=Mo(e).nextSibling;Mo(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Ot=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,o,i,r,s){this.type=1,this._$AH=R,this._$AN=void 0,this.element=e,this.name=o,this._$AM=r,this.options=s,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=R}_$AI(e,o=this,i,r){let s=this.strings,n=!1;if(s===void 0)e=Tt(this,e,o,0),n=!ie(e)||e!==this._$AH&&e!==mt,n&&(this._$AH=e);else{let a=e,l,d;for(e=s[0],l=0;l<s.length-1;l++)d=Tt(this,a[i+l],o,l),d===mt&&(d=this._$AH[l]),n||(n=!ie(d)||d!==this._$AH[l]),d===R?e=R:e!==R&&(e+=(d??"")+s[l+1]),this._$AH[l]=d}n&&!r&&this.j(e)}j(e){e===R?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},xe=class extends Ot{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===R?void 0:e}},Ae=class extends Ot{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==R)}},$e=class extends Ot{constructor(e,o,i,r,s){super(e,o,i,r,s),this.type=5}_$AI(e,o=this){if((e=Tt(this,e,o,0)??R)===mt)return;let i=this._$AH,r=e===R&&i!==R||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,s=e!==R&&(i===R||r);r&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Se=class{constructor(e,o,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=o,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Tt(this,e)}},Go={M:Ge,P:ft,A:Ze,C:1,L:Yo,R:_e,D:qo,V:Tt,I:Ut,H:Ot,N:Ae,U:$e,B:xe,F:Se},Ar=ee.litHtmlPolyfillSupport;Ar?.(re,Ut),(ee.litHtmlVersions??(ee.litHtmlVersions=[])).push("3.3.3");var Zo=(t,e,o)=>{let i=o?.renderBefore??e,r=i._$litPart$;if(r===void 0){let s=o?.renderBefore??null;i._$litPart$=r=new Ut(e.insertBefore(oe(),s),s,void 0,o??{})}return r._$AI(t),r};var se=globalThis,yt=class extends ut{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let e=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=e.firstChild),e}update(e){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Zo(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return mt}};yt._$litElement$=!0,yt.finalized=!0,se.litElementHydrateSupport?.({LitElement:yt});var $r=se.litElementPolyfillSupport;$r?.({LitElement:yt});(se.litElementVersions??(se.litElementVersions=[])).push("4.2.2");var Jo=C`
  :host {
    display: block;
  }

  .details {
    border: solid 1px var(--sl-color-neutral-200);
    border-radius: var(--sl-border-radius-medium);
    background-color: var(--sl-color-neutral-0);
    overflow-anchor: none;
  }

  .details--disabled {
    opacity: 0.5;
  }

  .details__header {
    display: flex;
    align-items: center;
    border-radius: inherit;
    padding: var(--sl-spacing-medium);
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
  }

  .details__header::-webkit-details-marker {
    display: none;
  }

  .details__header:focus {
    outline: none;
  }

  .details__header:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: calc(1px + var(--sl-focus-ring-offset));
  }

  .details--disabled .details__header {
    cursor: not-allowed;
  }

  .details--disabled .details__header:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .details__summary {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
  }

  .details__summary-icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    transition: var(--sl-transition-medium) rotate ease;
  }

  .details--open .details__summary-icon {
    rotate: 90deg;
  }

  .details--open.details--rtl .details__summary-icon {
    rotate: -90deg;
  }

  .details--open slot[name='expand-icon'],
  .details:not(.details--open) slot[name='collapse-icon'] {
    display: none;
  }

  .details__body {
    overflow: hidden;
  }

  .details__content {
    display: block;
    padding: var(--sl-spacing-medium);
  }
`;var ti=new Map,Sr=new WeakMap;function Cr(t){return t??{keyframes:[],options:{duration:0}}}function Qo(t,e){return e.toLowerCase()==="rtl"?{keyframes:t.rtlKeyframes||t.keyframes,options:t.options}:t}function k(t,e){ti.set(t,Cr(e))}function D(t,e,o){let i=Sr.get(t);if(i?.[e])return Qo(i[e],o.dir);let r=ti.get(e);return r?Qo(r,o.dir):{keyframes:[],options:{duration:0}}}function X(t,e){return new Promise(o=>{function i(r){r.target===t&&(t.removeEventListener(e,i),o())}t.addEventListener(e,i)})}function B(t,e,o){return new Promise(i=>{if(o?.duration===1/0)throw new Error("Promise-based animations must be finite.");let r=t.animate(e,Ft(K({},o),{duration:Er()?0:o.duration}));r.addEventListener("cancel",i,{once:!0}),r.addEventListener("finish",i,{once:!0})})}function to(t){return t=t.toString().toLowerCase(),t.indexOf("ms")>-1?parseFloat(t):t.indexOf("s")>-1?parseFloat(t)*1e3:parseFloat(t)}function Er(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches}function I(t){return Promise.all(t.getAnimations().map(e=>new Promise(o=>{e.cancel(),requestAnimationFrame(o)})))}function eo(t,e){return t.map(o=>Ft(K({},o),{height:o.height==="auto"?`${e}px`:o.height}))}var kr={name:"default",resolver:t=>Ie(`assets/icons/${t}.svg`)},ei=kr;var oi={caret:`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,check:`
    <svg part="checked-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor">
          <g transform="translate(3.428571, 3.428571)">
            <path d="M0,5.71428571 L3.42857143,9.14285714"></path>
            <path d="M9.14285714,0 L3.42857143,9.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,"chevron-down":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,"chevron-left":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
    </svg>
  `,"chevron-right":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,copy:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
    </svg>
  `,eye:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
    </svg>
  `,"eye-slash":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
    </svg>
  `,eyedropper:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eyedropper" viewBox="0 0 16 16">
      <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
    </svg>
  `,"grip-vertical":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical" viewBox="0 0 16 16">
      <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
    </svg>
  `,indeterminate:`
    <svg part="indeterminate-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor" stroke-width="2">
          <g transform="translate(2.285714, 6.857143)">
            <path d="M10.2857143,1.14285714 L1.14285714,1.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,"person-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
  `,"play-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
    </svg>
  `,"pause-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"></path>
    </svg>
  `,radio:`
    <svg part="checked-icon" class="radio__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g fill="currentColor">
          <circle cx="8" cy="8" r="3.42857143"></circle>
        </g>
      </g>
    </svg>
  `,"star-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
    </svg>
  `,"x-lg":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
    </svg>
  `,"x-circle-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"></path>
    </svg>
  `},Tr={name:"system",resolver:t=>t in oi?`data:image/svg+xml,${encodeURIComponent(oi[t])}`:""},ii=Tr;var Or=[ei,ii],oo=[];function ri(t){oo.push(t)}function si(t){oo=oo.filter(e=>e!==t)}function io(t){return Or.find(e=>e.name===t)}var ni=C`
  :host {
    display: inline-block;
    width: 1em;
    height: 1em;
    box-sizing: content-box !important;
  }

  svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`;function T(t,e){let o=K({waitUntilFirstUpdate:!1},e);return(i,r)=>{let{update:s}=i,n=Array.isArray(t)?t:[t];i.update=function(a){n.forEach(l=>{let d=l;if(a.has(d)){let h=a.get(d),p=this[d];h!==p&&(!o.waitUntilFirstUpdate||this.hasUpdated)&&this[r](h,p)}}),s.call(this,a)}}}var O=C`
  :host {
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  [hidden] {
    display: none !important;
  }
`;var Pr={attribute:!0,type:String,converter:Qt,reflect:!1,hasChanged:ye},Lr=(t=Pr,e,o)=>{let{kind:i,metadata:r}=o,s=globalThis.litPropertyMetadata.get(r);if(s===void 0&&globalThis.litPropertyMetadata.set(r,s=new Map),i==="setter"&&((t=Object.create(t)).wrapped=!0),s.set(o.name,t),i==="accessor"){let{name:n}=o;return{set(a){let l=e.get.call(this);e.set.call(this,a),this.requestUpdate(n,l,t,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,t,a),a}}}if(i==="setter"){let{name:n}=o;return function(a){let l=this[n];e.call(this,a),this.requestUpdate(n,l,t,!0,a)}}throw Error("Unsupported decorator location: "+i)};function u(t){return(e,o)=>typeof o=="object"?Lr(t,e,o):((i,r,s)=>{let n=r.hasOwnProperty(s);return r.constructor.createProperty(s,i),n?Object.getOwnPropertyDescriptor(r,s):void 0})(t,e,o)}function wt(t){return u({...t,state:!0,attribute:!1})}function ai(t){return(e,o)=>{let i=typeof e=="function"?e:e[o];Object.assign(i,t)}}var Pt=(t,e,o)=>(o.configurable=!0,o.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(t,e,o),o);function w(t,e){return(o,i,r)=>{let s=n=>n.renderRoot?.querySelector(t)??null;if(e){let{get:n,set:a}=typeof i=="object"?o:r??(()=>{let l=Symbol();return{get(){return this[l]},set(d){this[l]=d}}})();return Pt(o,i,{get(){let l=n.call(this);return l===void 0&&(l=s(this),(l!==null||this.hasUpdated)&&a.call(this,l)),l}})}return Pt(o,i,{get(){return s(this)}})}}var Ce,S=class extends yt{constructor(){super(),So(this,Ce,!1),this.initialReflectedProperties=new Map,Object.entries(this.constructor.dependencies).forEach(([t,e])=>{this.constructor.define(t,e)})}emit(t,e){let o=new CustomEvent(t,K({bubbles:!0,cancelable:!1,composed:!0,detail:{}},e));return this.dispatchEvent(o),o}static define(t,e=this,o={}){let i=customElements.get(t);if(!i){try{customElements.define(t,e,o)}catch{customElements.define(t,class extends e{},o)}return}let r=" (unknown version)",s=r;"version"in e&&e.version&&(r=" v"+e.version),"version"in i&&i.version&&(s=" v"+i.version),!(r&&s&&r===s)&&console.warn(`Attempted to register <${t}>${r}, but <${t}>${s} has already been registered.`)}attributeChangedCallback(t,e,o){$o(this,Ce)||(this.constructor.elementProperties.forEach((i,r)=>{i.reflect&&this[r]!=null&&this.initialReflectedProperties.set(r,this[r])}),Co(this,Ce,!0)),super.attributeChangedCallback(t,e,o)}willUpdate(t){super.willUpdate(t),this.initialReflectedProperties.forEach((e,o)=>{t.has(o)&&this[o]==null&&(this[o]=e)})}};Ce=new WeakMap;S.version="2.20.1";S.dependencies={};c([u()],S.prototype,"dir",2);c([u()],S.prototype,"lang",2);var{I:Gn}=Go;var li=(t,e)=>e===void 0?t?._$litType$!==void 0:t?._$litType$===e;var ne=Symbol(),Ee=Symbol(),ro,so=new Map,Y=class extends S{constructor(){super(...arguments),this.initialRender=!1,this.svg=null,this.label="",this.library="default"}async resolveIcon(t,e){var o;let i;if(e?.spriteSheet)return this.svg=x`<svg part="svg">
        <use part="use" href="${t}"></use>
      </svg>`,this.svg;try{if(i=await fetch(t,{mode:"cors"}),!i.ok)return i.status===410?ne:Ee}catch{return Ee}try{let r=document.createElement("div");r.innerHTML=await i.text();let s=r.firstElementChild;if(((o=s?.tagName)==null?void 0:o.toLowerCase())!=="svg")return ne;ro||(ro=new DOMParser);let a=ro.parseFromString(s.outerHTML,"text/html").body.querySelector("svg");return a?(a.part.add("svg"),document.adoptNode(a)):ne}catch{return ne}}connectedCallback(){super.connectedCallback(),ri(this)}firstUpdated(){this.initialRender=!0,this.setIcon()}disconnectedCallback(){super.disconnectedCallback(),si(this)}getIconSource(){let t=io(this.library);return this.name&&t?{url:t.resolver(this.name),fromLibrary:!0}:{url:this.src,fromLibrary:!1}}handleLabelChange(){typeof this.label=="string"&&this.label.length>0?(this.setAttribute("role","img"),this.setAttribute("aria-label",this.label),this.removeAttribute("aria-hidden")):(this.removeAttribute("role"),this.removeAttribute("aria-label"),this.setAttribute("aria-hidden","true"))}async setIcon(){var t;let{url:e,fromLibrary:o}=this.getIconSource(),i=o?io(this.library):void 0;if(!e){this.svg=null;return}let r=so.get(e);if(r||(r=this.resolveIcon(e,i),so.set(e,r)),!this.initialRender)return;let s=await r;if(s===Ee&&so.delete(e),e===this.getIconSource().url){if(li(s)){if(this.svg=s,i){await this.updateComplete;let n=this.shadowRoot.querySelector("[part='svg']");typeof i.mutator=="function"&&n&&i.mutator(n)}return}switch(s){case Ee:case ne:this.svg=null,this.emit("sl-error");break;default:this.svg=s.cloneNode(!0),(t=i?.mutator)==null||t.call(i,this.svg),this.emit("sl-load")}}}render(){return this.svg}};Y.styles=[O,ni];c([wt()],Y.prototype,"svg",2);c([u({reflect:!0})],Y.prototype,"name",2);c([u()],Y.prototype,"src",2);c([u()],Y.prototype,"label",2);c([u({reflect:!0})],Y.prototype,"library",2);c([T("label")],Y.prototype,"handleLabelChange",1);c([T(["name","src","library"])],Y.prototype,"setIcon",1);var ci={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},di=t=>(...e)=>({_$litDirective$:t,values:e}),ke=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,o,i){this._$Ct=e,this._$AM=o,this._$Ci=i}_$AS(e,o){return this.update(e,o)}update(e,o){return this.render(...o)}};var L=di(class extends ke{constructor(t){if(super(t),t.type!==ci.ATTRIBUTE||t.name!=="class"||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(i=>i!=="")));for(let i in e)e[i]&&!this.nt?.has(i)&&this.st.add(i);return this.render(e)}let o=t.element.classList;for(let i of this.st)i in e||(o.remove(i),this.st.delete(i));for(let i in e){let r=!!e[i];r===this.st.has(i)||this.nt?.has(i)||(r?(o.add(i),this.st.add(i)):(o.remove(i),this.st.delete(i)))}return mt}});var G=class extends S{constructor(){super(...arguments),this.localize=new V(this),this.open=!1,this.disabled=!1}firstUpdated(){this.body.style.height=this.open?"auto":"0",this.open&&(this.details.open=!0),this.detailsObserver=new MutationObserver(t=>{for(let e of t)e.type==="attributes"&&e.attributeName==="open"&&(this.details.open?this.show():this.hide())}),this.detailsObserver.observe(this.details,{attributes:!0})}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.detailsObserver)==null||t.disconnect()}handleSummaryClick(t){t.preventDefault(),this.disabled||(this.open?this.hide():this.show(),this.header.focus())}handleSummaryKeyDown(t){(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this.open?this.hide():this.show()),(t.key==="ArrowUp"||t.key==="ArrowLeft")&&(t.preventDefault(),this.hide()),(t.key==="ArrowDown"||t.key==="ArrowRight")&&(t.preventDefault(),this.show())}async handleOpenChange(){if(this.open){if(this.details.open=!0,this.emit("sl-show",{cancelable:!0}).defaultPrevented){this.open=!1,this.details.open=!1;return}await I(this.body);let{keyframes:e,options:o}=D(this,"details.show",{dir:this.localize.dir()});await B(this.body,eo(e,this.body.scrollHeight),o),this.body.style.height="auto",this.emit("sl-after-show")}else{if(this.emit("sl-hide",{cancelable:!0}).defaultPrevented){this.details.open=!0,this.open=!0;return}await I(this.body);let{keyframes:e,options:o}=D(this,"details.hide",{dir:this.localize.dir()});await B(this.body,eo(e,this.body.scrollHeight),o),this.body.style.height="auto",this.details.open=!1,this.emit("sl-after-hide")}}async show(){if(!(this.open||this.disabled))return this.open=!0,X(this,"sl-after-show")}async hide(){if(!(!this.open||this.disabled))return this.open=!1,X(this,"sl-after-hide")}render(){let t=this.localize.dir()==="rtl";return x`
      <details
        part="base"
        class=${L({details:!0,"details--open":this.open,"details--disabled":this.disabled,"details--rtl":t})}
      >
        <summary
          part="header"
          id="header"
          class="details__header"
          role="button"
          aria-expanded=${this.open?"true":"false"}
          aria-controls="content"
          aria-disabled=${this.disabled?"true":"false"}
          tabindex=${this.disabled?"-1":"0"}
          @click=${this.handleSummaryClick}
          @keydown=${this.handleSummaryKeyDown}
        >
          <slot name="summary" part="summary" class="details__summary">${this.summary}</slot>

          <span part="summary-icon" class="details__summary-icon">
            <slot name="expand-icon">
              <sl-icon library="system" name=${t?"chevron-left":"chevron-right"}></sl-icon>
            </slot>
            <slot name="collapse-icon">
              <sl-icon library="system" name=${t?"chevron-left":"chevron-right"}></sl-icon>
            </slot>
          </span>
        </summary>

        <div class="details__body" role="region" aria-labelledby="header">
          <slot part="content" id="content" class="details__content"></slot>
        </div>
      </details>
    `}};G.styles=[O,Jo];G.dependencies={"sl-icon":Y};c([w(".details")],G.prototype,"details",2);c([w(".details__header")],G.prototype,"header",2);c([w(".details__body")],G.prototype,"body",2);c([w(".details__expand-icon-slot")],G.prototype,"expandIconSlot",2);c([u({type:Boolean,reflect:!0})],G.prototype,"open",2);c([u()],G.prototype,"summary",2);c([u({type:Boolean,reflect:!0})],G.prototype,"disabled",2);c([T("open",{waitUntilFirstUpdate:!0})],G.prototype,"handleOpenChange",1);k("details.show",{keyframes:[{height:"0",opacity:"0"},{height:"auto",opacity:"1"}],options:{duration:250,easing:"linear"}});k("details.hide",{keyframes:[{height:"auto",opacity:"1"},{height:"0",opacity:"0"}],options:{duration:250,easing:"linear"}});G.define("sl-details");function*Te(t=document.activeElement){t!=null&&(yield t,"shadowRoot"in t&&t.shadowRoot&&t.shadowRoot.mode!=="closed"&&(yield*Eo(Te(t.shadowRoot.activeElement))))}function pi(){return[...Te()].pop()}var hi=new WeakMap;function ui(t){let e=hi.get(t);return e||(e=window.getComputedStyle(t,null),hi.set(t,e)),e}function Rr(t){if(typeof t.checkVisibility=="function")return t.checkVisibility({checkOpacity:!1,checkVisibilityCSS:!0});let e=ui(t);return e.visibility!=="hidden"&&e.display!=="none"}function zr(t){let e=ui(t),{overflowY:o,overflowX:i}=e;return o==="scroll"||i==="scroll"?!0:o!=="auto"||i!=="auto"?!1:t.scrollHeight>t.clientHeight&&o==="auto"||t.scrollWidth>t.clientWidth&&i==="auto"}function Dr(t){let e=t.tagName.toLowerCase(),o=Number(t.getAttribute("tabindex"));if(t.hasAttribute("tabindex")&&(isNaN(o)||o<=-1)||t.hasAttribute("disabled")||t.closest("[inert]"))return!1;if(e==="input"&&t.getAttribute("type")==="radio"){let s=t.getRootNode(),n=`input[type='radio'][name="${t.getAttribute("name")}"]`,a=s.querySelector(`${n}:checked`);return a?a===t:s.querySelector(n)===t}return Rr(t)?(e==="audio"||e==="video")&&t.hasAttribute("controls")||t.hasAttribute("tabindex")||t.hasAttribute("contenteditable")&&t.getAttribute("contenteditable")!=="false"||["button","input","select","textarea","a","audio","video","summary","iframe"].includes(e)?!0:zr(t):!1}function Br(t,e){var o;return((o=t.getRootNode({composed:!0}))==null?void 0:o.host)!==e}function no(t){let e=new WeakMap,o=[];function i(r){if(r instanceof Element){if(r.hasAttribute("inert")||r.closest("[inert]")||e.has(r))return;e.set(r,!0),!o.includes(r)&&Dr(r)&&o.push(r),r instanceof HTMLSlotElement&&Br(r,t)&&r.assignedElements({flatten:!0}).forEach(s=>{i(s)}),r.shadowRoot!==null&&r.shadowRoot.mode==="open"&&i(r.shadowRoot)}for(let s of r.children)i(s)}return i(t),o.sort((r,s)=>{let n=Number(r.getAttribute("tabindex"))||0;return(Number(s.getAttribute("tabindex"))||0)-n})}var ae=[],Oe=class{constructor(t){this.tabDirection="forward",this.handleFocusIn=()=>{this.isActive()&&this.checkFocus()},this.handleKeyDown=e=>{var o;if(e.key!=="Tab"||this.isExternalActivated||!this.isActive())return;let i=pi();if(this.previousFocus=i,this.previousFocus&&this.possiblyHasTabbableChildren(this.previousFocus))return;e.shiftKey?this.tabDirection="backward":this.tabDirection="forward";let r=no(this.element),s=r.findIndex(a=>a===i);this.previousFocus=this.currentFocus;let n=this.tabDirection==="forward"?1:-1;for(;;){s+n>=r.length?s=0:s+n<0?s=r.length-1:s+=n,this.previousFocus=this.currentFocus;let a=r[s];if(this.tabDirection==="backward"&&this.previousFocus&&this.possiblyHasTabbableChildren(this.previousFocus)||a&&this.possiblyHasTabbableChildren(a))return;e.preventDefault(),this.currentFocus=a,(o=this.currentFocus)==null||o.focus({preventScroll:!1});let l=[...Te()];if(l.includes(this.currentFocus)||!l.includes(this.previousFocus))break}setTimeout(()=>this.checkFocus())},this.handleKeyUp=()=>{this.tabDirection="forward"},this.element=t,this.elementsWithTabbableControls=["iframe"]}activate(){ae.push(this.element),document.addEventListener("focusin",this.handleFocusIn),document.addEventListener("keydown",this.handleKeyDown),document.addEventListener("keyup",this.handleKeyUp)}deactivate(){ae=ae.filter(t=>t!==this.element),this.currentFocus=null,document.removeEventListener("focusin",this.handleFocusIn),document.removeEventListener("keydown",this.handleKeyDown),document.removeEventListener("keyup",this.handleKeyUp)}isActive(){return ae[ae.length-1]===this.element}activateExternal(){this.isExternalActivated=!0}deactivateExternal(){this.isExternalActivated=!1}checkFocus(){if(this.isActive()&&!this.isExternalActivated){let t=no(this.element);if(!this.element.matches(":focus-within")){let e=t[0],o=t[t.length-1],i=this.tabDirection==="forward"?e:o;typeof i?.focus=="function"&&(this.currentFocus=i,i.focus({preventScroll:!1}))}}}possiblyHasTabbableChildren(t){return this.elementsWithTabbableControls.includes(t.tagName.toLowerCase())||t.hasAttribute("controls")}};function Mr(t,e){return{top:Math.round(t.getBoundingClientRect().top-e.getBoundingClientRect().top),left:Math.round(t.getBoundingClientRect().left-e.getBoundingClientRect().left)}}var ao=new Set;function Nr(){let t=document.documentElement.clientWidth;return Math.abs(window.innerWidth-t)}function Hr(){let t=Number(getComputedStyle(document.body).paddingRight.replace(/px/,""));return isNaN(t)||!t?0:t}function Lt(t){if(ao.add(t),!document.documentElement.classList.contains("sl-scroll-lock")){let e=Nr()+Hr(),o=getComputedStyle(document.documentElement).scrollbarGutter;(!o||o==="auto")&&(o="stable"),e<2&&(o=""),document.documentElement.style.setProperty("--sl-scroll-lock-gutter",o),document.documentElement.classList.add("sl-scroll-lock"),document.documentElement.style.setProperty("--sl-scroll-lock-size",`${e}px`)}}function Rt(t){ao.delete(t),ao.size===0&&(document.documentElement.classList.remove("sl-scroll-lock"),document.documentElement.style.removeProperty("--sl-scroll-lock-size"))}function lo(t,e,o="vertical",i="smooth"){let r=Mr(t,e),s=r.top+e.scrollTop,n=r.left+e.scrollLeft,a=e.scrollLeft,l=e.scrollLeft+e.offsetWidth,d=e.scrollTop,h=e.scrollTop+e.offsetHeight;(o==="horizontal"||o==="both")&&(n<a?e.scrollTo({left:n,behavior:i}):n+t.clientWidth>l&&e.scrollTo({left:n-e.offsetWidth+t.clientWidth,behavior:i})),(o==="vertical"||o==="both")&&(s<d?e.scrollTo({top:s,behavior:i}):s+t.clientHeight>h&&e.scrollTo({top:s-e.offsetHeight+t.clientHeight,behavior:i}))}var fi=C`
  :host {
    --width: 31rem;
    --header-spacing: var(--sl-spacing-large);
    --body-spacing: var(--sl-spacing-large);
    --footer-spacing: var(--sl-spacing-large);

    display: contents;
  }

  .dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: var(--sl-z-index-dialog);
  }

  .dialog__panel {
    display: flex;
    flex-direction: column;
    z-index: 2;
    width: var(--width);
    max-width: calc(100% - var(--sl-spacing-2x-large));
    max-height: calc(100% - var(--sl-spacing-2x-large));
    background-color: var(--sl-panel-background-color);
    border-radius: var(--sl-border-radius-medium);
    box-shadow: var(--sl-shadow-x-large);
  }

  .dialog__panel:focus {
    outline: none;
  }

  /* Ensure there's enough vertical padding for phones that don't update vh when chrome appears (e.g. iPhone) */
  @media screen and (max-width: 420px) {
    .dialog__panel {
      max-height: 80vh;
    }
  }

  .dialog--open .dialog__panel {
    display: flex;
    opacity: 1;
  }

  .dialog__header {
    flex: 0 0 auto;
    display: flex;
  }

  .dialog__title {
    flex: 1 1 auto;
    font: inherit;
    font-size: var(--sl-font-size-large);
    line-height: var(--sl-line-height-dense);
    padding: var(--header-spacing);
    margin: 0;
  }

  .dialog__header-actions {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: end;
    gap: var(--sl-spacing-2x-small);
    padding: 0 var(--header-spacing);
  }

  .dialog__header-actions sl-icon-button,
  .dialog__header-actions ::slotted(sl-icon-button) {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-medium);
  }

  .dialog__body {
    flex: 1 1 auto;
    display: block;
    padding: var(--body-spacing);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  .dialog__footer {
    flex: 0 0 auto;
    text-align: right;
    padding: var(--footer-spacing);
  }

  .dialog__footer ::slotted(sl-button:not(:first-of-type)) {
    margin-inline-start: var(--sl-spacing-x-small);
  }

  .dialog:not(.dialog--has-footer) .dialog__footer {
    display: none;
  }

  .dialog__overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--sl-overlay-background-color);
  }

  @media (forced-colors: active) {
    .dialog__panel {
      border: solid 1px var(--sl-color-neutral-0);
    }
  }
`;var Pe=t=>{var e;let{activeElement:o}=document;o&&t.contains(o)&&((e=document.activeElement)==null||e.blur())};var mi=C`
  :host {
    display: inline-block;
    color: var(--sl-color-neutral-600);
  }

  .icon-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-medium);
    font-size: inherit;
    color: inherit;
    padding: var(--sl-spacing-x-small);
    cursor: pointer;
    transition: var(--sl-transition-x-fast) color;
    -webkit-appearance: none;
  }

  .icon-button:hover:not(.icon-button--disabled),
  .icon-button:focus-visible:not(.icon-button--disabled) {
    color: var(--sl-color-primary-600);
  }

  .icon-button:active:not(.icon-button--disabled) {
    color: var(--sl-color-primary-700);
  }

  .icon-button:focus {
    outline: none;
  }

  .icon-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .icon-button__icon {
    pointer-events: none;
  }
`;var bi=Symbol.for(""),Fr=t=>{if(t?.r===bi)return t?._$litStatic$};var co=(t,...e)=>({_$litStatic$:e.reduce((o,i,r)=>o+(s=>{if(s._$litStatic$!==void 0)return s._$litStatic$;throw Error(`Value passed to 'literal' function must be a 'literal' result: ${s}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`)})(i)+t[r+1],t[0]),r:bi}),gi=new Map,ho=t=>(e,...o)=>{let i=o.length,r,s,n=[],a=[],l,d=0,h=!1;for(;d<i;){for(l=e[d];d<i&&(s=o[d],(r=Fr(s))!==void 0);)l+=r+e[++d],h=!0;d!==i&&a.push(s),n.push(l),d++}if(d===i&&n.push(e[i]),h){let p=n.join("$$lit$$");(e=gi.get(p))===void 0&&(n.raw=n,gi.set(p,e=n)),o=a}return t(e,...o)},vi=ho(x),ul=ho(jo),fl=ho(Ko);var H=t=>t??R;var z=class extends S{constructor(){super(...arguments),this.hasFocus=!1,this.label="",this.disabled=!1}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleClick(t){this.disabled&&(t.preventDefault(),t.stopPropagation())}click(){this.button.click()}focus(t){this.button.focus(t)}blur(){this.button.blur()}render(){let t=!!this.href,e=t?co`a`:co`button`;return vi`
      <${e}
        part="base"
        class=${L({"icon-button":!0,"icon-button--disabled":!t&&this.disabled,"icon-button--focused":this.hasFocus})}
        ?disabled=${H(t?void 0:this.disabled)}
        type=${H(t?void 0:"button")}
        href=${H(t?this.href:void 0)}
        target=${H(t?this.target:void 0)}
        download=${H(t?this.download:void 0)}
        rel=${H(t&&this.target?"noreferrer noopener":void 0)}
        role=${H(t?void 0:"button")}
        aria-disabled=${this.disabled?"true":"false"}
        aria-label="${this.label}"
        tabindex=${this.disabled?"-1":"0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @click=${this.handleClick}
      >
        <sl-icon
          class="icon-button__icon"
          name=${H(this.name)}
          library=${H(this.library)}
          src=${H(this.src)}
          aria-hidden="true"
        ></sl-icon>
      </${e}>
    `}};z.styles=[O,mi];z.dependencies={"sl-icon":Y};c([w(".icon-button")],z.prototype,"button",2);c([wt()],z.prototype,"hasFocus",2);c([u()],z.prototype,"name",2);c([u()],z.prototype,"library",2);c([u()],z.prototype,"src",2);c([u()],z.prototype,"href",2);c([u()],z.prototype,"target",2);c([u()],z.prototype,"download",2);c([u()],z.prototype,"label",2);c([u({type:Boolean,reflect:!0})],z.prototype,"disabled",2);var Le=class{constructor(t,...e){this.slotNames=[],this.handleSlotChange=o=>{let i=o.target;(this.slotNames.includes("[default]")&&!i.name||i.name&&this.slotNames.includes(i.name))&&this.host.requestUpdate()},(this.host=t).addController(this),this.slotNames=e}hasDefaultSlot(){return[...this.host.childNodes].some(t=>{if(t.nodeType===t.TEXT_NODE&&t.textContent.trim()!=="")return!0;if(t.nodeType===t.ELEMENT_NODE){let e=t;if(e.tagName.toLowerCase()==="sl-visually-hidden")return!1;if(!e.hasAttribute("slot"))return!0}return!1})}hasNamedSlot(t){return this.host.querySelector(`:scope > [slot="${t}"]`)!==null}test(t){return t==="[default]"?this.hasDefaultSlot():this.hasNamedSlot(t)}hostConnected(){this.host.shadowRoot.addEventListener("slotchange",this.handleSlotChange)}hostDisconnected(){this.host.shadowRoot.removeEventListener("slotchange",this.handleSlotChange)}};var et=class extends S{constructor(){super(...arguments),this.hasSlotController=new Le(this,"footer"),this.localize=new V(this),this.modal=new Oe(this),this.open=!1,this.label="",this.noHeader=!1,this.handleDocumentKeyDown=t=>{t.key==="Escape"&&this.modal.isActive()&&this.open&&(t.stopPropagation(),this.requestClose("keyboard"))}}firstUpdated(){this.dialog.hidden=!this.open,this.open&&(this.addOpenListeners(),this.modal.activate(),Lt(this))}disconnectedCallback(){super.disconnectedCallback(),this.modal.deactivate(),Rt(this),this.removeOpenListeners()}requestClose(t){if(this.emit("sl-request-close",{cancelable:!0,detail:{source:t}}).defaultPrevented){let o=D(this,"dialog.denyClose",{dir:this.localize.dir()});B(this.panel,o.keyframes,o.options);return}this.hide()}addOpenListeners(){var t;"CloseWatcher"in window?((t=this.closeWatcher)==null||t.destroy(),this.closeWatcher=new CloseWatcher,this.closeWatcher.onclose=()=>this.requestClose("keyboard")):document.addEventListener("keydown",this.handleDocumentKeyDown)}removeOpenListeners(){var t;(t=this.closeWatcher)==null||t.destroy(),document.removeEventListener("keydown",this.handleDocumentKeyDown)}async handleOpenChange(){if(this.open){this.emit("sl-show"),this.addOpenListeners(),this.originalTrigger=document.activeElement,this.modal.activate(),Lt(this);let t=this.querySelector("[autofocus]");t&&t.removeAttribute("autofocus"),await Promise.all([I(this.dialog),I(this.overlay)]),this.dialog.hidden=!1,requestAnimationFrame(()=>{this.emit("sl-initial-focus",{cancelable:!0}).defaultPrevented||(t?t.focus({preventScroll:!0}):this.panel.focus({preventScroll:!0})),t&&t.setAttribute("autofocus","")});let e=D(this,"dialog.show",{dir:this.localize.dir()}),o=D(this,"dialog.overlay.show",{dir:this.localize.dir()});await Promise.all([B(this.panel,e.keyframes,e.options),B(this.overlay,o.keyframes,o.options)]),this.emit("sl-after-show")}else{Pe(this),this.emit("sl-hide"),this.removeOpenListeners(),this.modal.deactivate(),await Promise.all([I(this.dialog),I(this.overlay)]);let t=D(this,"dialog.hide",{dir:this.localize.dir()}),e=D(this,"dialog.overlay.hide",{dir:this.localize.dir()});await Promise.all([B(this.overlay,e.keyframes,e.options).then(()=>{this.overlay.hidden=!0}),B(this.panel,t.keyframes,t.options).then(()=>{this.panel.hidden=!0})]),this.dialog.hidden=!0,this.overlay.hidden=!1,this.panel.hidden=!1,Rt(this);let o=this.originalTrigger;typeof o?.focus=="function"&&setTimeout(()=>o.focus()),this.emit("sl-after-hide")}}async show(){if(!this.open)return this.open=!0,X(this,"sl-after-show")}async hide(){if(this.open)return this.open=!1,X(this,"sl-after-hide")}render(){return x`
      <div
        part="base"
        class=${L({dialog:!0,"dialog--open":this.open,"dialog--has-footer":this.hasSlotController.test("footer")})}
      >
        <div part="overlay" class="dialog__overlay" @click=${()=>this.requestClose("overlay")} tabindex="-1"></div>

        <div
          part="panel"
          class="dialog__panel"
          role="dialog"
          aria-modal="true"
          aria-hidden=${this.open?"false":"true"}
          aria-label=${H(this.noHeader?this.label:void 0)}
          aria-labelledby=${H(this.noHeader?void 0:"title")}
          tabindex="-1"
        >
          ${this.noHeader?"":x`
                <header part="header" class="dialog__header">
                  <h2 part="title" class="dialog__title" id="title">
                    <slot name="label"> ${this.label.length>0?this.label:"\uFEFF"} </slot>
                  </h2>
                  <div part="header-actions" class="dialog__header-actions">
                    <slot name="header-actions"></slot>
                    <sl-icon-button
                      part="close-button"
                      exportparts="base:close-button__base"
                      class="dialog__close"
                      name="x-lg"
                      label=${this.localize.term("close")}
                      library="system"
                      @click="${()=>this.requestClose("close-button")}"
                    ></sl-icon-button>
                  </div>
                </header>
              `}
          ${""}
          <div part="body" class="dialog__body" tabindex="-1"><slot></slot></div>

          <footer part="footer" class="dialog__footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    `}};et.styles=[O,fi];et.dependencies={"sl-icon-button":z};c([w(".dialog")],et.prototype,"dialog",2);c([w(".dialog__panel")],et.prototype,"panel",2);c([w(".dialog__overlay")],et.prototype,"overlay",2);c([u({type:Boolean,reflect:!0})],et.prototype,"open",2);c([u({reflect:!0})],et.prototype,"label",2);c([u({attribute:"no-header",type:Boolean,reflect:!0})],et.prototype,"noHeader",2);c([T("open",{waitUntilFirstUpdate:!0})],et.prototype,"handleOpenChange",1);k("dialog.show",{keyframes:[{opacity:0,scale:.8},{opacity:1,scale:1}],options:{duration:250,easing:"ease"}});k("dialog.hide",{keyframes:[{opacity:1,scale:1},{opacity:0,scale:.8}],options:{duration:250,easing:"ease"}});k("dialog.denyClose",{keyframes:[{scale:1},{scale:1.02},{scale:1}],options:{duration:250}});k("dialog.overlay.show",{keyframes:[{opacity:0},{opacity:1}],options:{duration:250}});k("dialog.overlay.hide",{keyframes:[{opacity:1},{opacity:0}],options:{duration:250}});et.define("sl-dialog");var yi=C`
  :host {
    --size: 25rem;
    --header-spacing: var(--sl-spacing-large);
    --body-spacing: var(--sl-spacing-large);
    --footer-spacing: var(--sl-spacing-large);

    display: contents;
  }

  .drawer {
    top: 0;
    inset-inline-start: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .drawer--contained {
    position: absolute;
    z-index: initial;
  }

  .drawer--fixed {
    position: fixed;
    z-index: var(--sl-z-index-drawer);
  }

  .drawer__panel {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 2;
    max-width: 100%;
    max-height: 100%;
    background-color: var(--sl-panel-background-color);
    box-shadow: var(--sl-shadow-x-large);
    overflow: auto;
    pointer-events: all;
  }

  .drawer__panel:focus {
    outline: none;
  }

  .drawer--top .drawer__panel {
    top: 0;
    inset-inline-end: auto;
    bottom: auto;
    inset-inline-start: 0;
    width: 100%;
    height: var(--size);
  }

  .drawer--end .drawer__panel {
    top: 0;
    inset-inline-end: 0;
    bottom: auto;
    inset-inline-start: auto;
    width: var(--size);
    height: 100%;
  }

  .drawer--bottom .drawer__panel {
    top: auto;
    inset-inline-end: auto;
    bottom: 0;
    inset-inline-start: 0;
    width: 100%;
    height: var(--size);
  }

  .drawer--start .drawer__panel {
    top: 0;
    inset-inline-end: auto;
    bottom: auto;
    inset-inline-start: 0;
    width: var(--size);
    height: 100%;
  }

  .drawer__header {
    display: flex;
  }

  .drawer__title {
    flex: 1 1 auto;
    font: inherit;
    font-size: var(--sl-font-size-large);
    line-height: var(--sl-line-height-dense);
    padding: var(--header-spacing);
    margin: 0;
  }

  .drawer__header-actions {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: end;
    gap: var(--sl-spacing-2x-small);
    padding: 0 var(--header-spacing);
  }

  .drawer__header-actions sl-icon-button,
  .drawer__header-actions ::slotted(sl-icon-button) {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-medium);
  }

  .drawer__body {
    flex: 1 1 auto;
    display: block;
    padding: var(--body-spacing);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  .drawer__footer {
    text-align: right;
    padding: var(--footer-spacing);
  }

  .drawer__footer ::slotted(sl-button:not(:last-of-type)) {
    margin-inline-end: var(--sl-spacing-x-small);
  }

  .drawer:not(.drawer--has-footer) .drawer__footer {
    display: none;
  }

  .drawer__overlay {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--sl-overlay-background-color);
    pointer-events: all;
  }

  .drawer--contained .drawer__overlay {
    display: none;
  }

  @media (forced-colors: active) {
    .drawer__panel {
      border: solid 1px var(--sl-color-neutral-0);
    }
  }
`;function wi(t){return t.charAt(0).toUpperCase()+t.slice(1)}var j=class extends S{constructor(){super(...arguments),this.hasSlotController=new Le(this,"footer"),this.localize=new V(this),this.modal=new Oe(this),this.open=!1,this.label="",this.placement="end",this.contained=!1,this.noHeader=!1,this.handleDocumentKeyDown=t=>{this.contained||t.key==="Escape"&&this.modal.isActive()&&this.open&&(t.stopImmediatePropagation(),this.requestClose("keyboard"))}}firstUpdated(){this.drawer.hidden=!this.open,this.open&&(this.addOpenListeners(),this.contained||(this.modal.activate(),Lt(this)))}disconnectedCallback(){super.disconnectedCallback(),Rt(this),this.removeOpenListeners()}requestClose(t){if(this.emit("sl-request-close",{cancelable:!0,detail:{source:t}}).defaultPrevented){let o=D(this,"drawer.denyClose",{dir:this.localize.dir()});B(this.panel,o.keyframes,o.options);return}this.hide()}addOpenListeners(){var t;"CloseWatcher"in window?((t=this.closeWatcher)==null||t.destroy(),this.contained||(this.closeWatcher=new CloseWatcher,this.closeWatcher.onclose=()=>this.requestClose("keyboard"))):document.addEventListener("keydown",this.handleDocumentKeyDown)}removeOpenListeners(){var t;document.removeEventListener("keydown",this.handleDocumentKeyDown),(t=this.closeWatcher)==null||t.destroy()}async handleOpenChange(){if(this.open){this.emit("sl-show"),this.addOpenListeners(),this.originalTrigger=document.activeElement,this.contained||(this.modal.activate(),Lt(this));let t=this.querySelector("[autofocus]");t&&t.removeAttribute("autofocus"),await Promise.all([I(this.drawer),I(this.overlay)]),this.drawer.hidden=!1,requestAnimationFrame(()=>{this.emit("sl-initial-focus",{cancelable:!0}).defaultPrevented||(t?t.focus({preventScroll:!0}):this.panel.focus({preventScroll:!0})),t&&t.setAttribute("autofocus","")});let e=D(this,`drawer.show${wi(this.placement)}`,{dir:this.localize.dir()}),o=D(this,"drawer.overlay.show",{dir:this.localize.dir()});await Promise.all([B(this.panel,e.keyframes,e.options),B(this.overlay,o.keyframes,o.options)]),this.emit("sl-after-show")}else{Pe(this),this.emit("sl-hide"),this.removeOpenListeners(),this.contained||(this.modal.deactivate(),Rt(this)),await Promise.all([I(this.drawer),I(this.overlay)]);let t=D(this,`drawer.hide${wi(this.placement)}`,{dir:this.localize.dir()}),e=D(this,"drawer.overlay.hide",{dir:this.localize.dir()});await Promise.all([B(this.overlay,e.keyframes,e.options).then(()=>{this.overlay.hidden=!0}),B(this.panel,t.keyframes,t.options).then(()=>{this.panel.hidden=!0})]),this.drawer.hidden=!0,this.overlay.hidden=!1,this.panel.hidden=!1;let o=this.originalTrigger;typeof o?.focus=="function"&&setTimeout(()=>o.focus()),this.emit("sl-after-hide")}}handleNoModalChange(){this.open&&!this.contained&&(this.modal.activate(),Lt(this)),this.open&&this.contained&&(this.modal.deactivate(),Rt(this))}async show(){if(!this.open)return this.open=!0,X(this,"sl-after-show")}async hide(){if(this.open)return this.open=!1,X(this,"sl-after-hide")}render(){return x`
      <div
        part="base"
        class=${L({drawer:!0,"drawer--open":this.open,"drawer--top":this.placement==="top","drawer--end":this.placement==="end","drawer--bottom":this.placement==="bottom","drawer--start":this.placement==="start","drawer--contained":this.contained,"drawer--fixed":!this.contained,"drawer--rtl":this.localize.dir()==="rtl","drawer--has-footer":this.hasSlotController.test("footer")})}
      >
        <div part="overlay" class="drawer__overlay" @click=${()=>this.requestClose("overlay")} tabindex="-1"></div>

        <div
          part="panel"
          class="drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-hidden=${this.open?"false":"true"}
          aria-label=${H(this.noHeader?this.label:void 0)}
          aria-labelledby=${H(this.noHeader?void 0:"title")}
          tabindex="0"
        >
          ${this.noHeader?"":x`
                <header part="header" class="drawer__header">
                  <h2 part="title" class="drawer__title" id="title">
                    <!-- If there's no label, use an invisible character to prevent the header from collapsing -->
                    <slot name="label"> ${this.label.length>0?this.label:"\uFEFF"} </slot>
                  </h2>
                  <div part="header-actions" class="drawer__header-actions">
                    <slot name="header-actions"></slot>
                    <sl-icon-button
                      part="close-button"
                      exportparts="base:close-button__base"
                      class="drawer__close"
                      name="x-lg"
                      label=${this.localize.term("close")}
                      library="system"
                      @click=${()=>this.requestClose("close-button")}
                    ></sl-icon-button>
                  </div>
                </header>
              `}

          <slot part="body" class="drawer__body"></slot>

          <footer part="footer" class="drawer__footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    `}};j.styles=[O,yi];j.dependencies={"sl-icon-button":z};c([w(".drawer")],j.prototype,"drawer",2);c([w(".drawer__panel")],j.prototype,"panel",2);c([w(".drawer__overlay")],j.prototype,"overlay",2);c([u({type:Boolean,reflect:!0})],j.prototype,"open",2);c([u({reflect:!0})],j.prototype,"label",2);c([u({reflect:!0})],j.prototype,"placement",2);c([u({type:Boolean,reflect:!0})],j.prototype,"contained",2);c([u({attribute:"no-header",type:Boolean,reflect:!0})],j.prototype,"noHeader",2);c([T("open",{waitUntilFirstUpdate:!0})],j.prototype,"handleOpenChange",1);c([T("contained",{waitUntilFirstUpdate:!0})],j.prototype,"handleNoModalChange",1);k("drawer.showTop",{keyframes:[{opacity:0,translate:"0 -100%"},{opacity:1,translate:"0 0"}],options:{duration:250,easing:"ease"}});k("drawer.hideTop",{keyframes:[{opacity:1,translate:"0 0"},{opacity:0,translate:"0 -100%"}],options:{duration:250,easing:"ease"}});k("drawer.showEnd",{keyframes:[{opacity:0,translate:"100%"},{opacity:1,translate:"0"}],rtlKeyframes:[{opacity:0,translate:"-100%"},{opacity:1,translate:"0"}],options:{duration:250,easing:"ease"}});k("drawer.hideEnd",{keyframes:[{opacity:1,translate:"0"},{opacity:0,translate:"100%"}],rtlKeyframes:[{opacity:1,translate:"0"},{opacity:0,translate:"-100%"}],options:{duration:250,easing:"ease"}});k("drawer.showBottom",{keyframes:[{opacity:0,translate:"0 100%"},{opacity:1,translate:"0 0"}],options:{duration:250,easing:"ease"}});k("drawer.hideBottom",{keyframes:[{opacity:1,translate:"0 0"},{opacity:0,translate:"0 100%"}],options:{duration:250,easing:"ease"}});k("drawer.showStart",{keyframes:[{opacity:0,translate:"-100%"},{opacity:1,translate:"0"}],rtlKeyframes:[{opacity:0,translate:"100%"},{opacity:1,translate:"0"}],options:{duration:250,easing:"ease"}});k("drawer.hideStart",{keyframes:[{opacity:1,translate:"0"},{opacity:0,translate:"-100%"}],rtlKeyframes:[{opacity:1,translate:"0"},{opacity:0,translate:"100%"}],options:{duration:250,easing:"ease"}});k("drawer.denyClose",{keyframes:[{scale:1},{scale:1.01},{scale:1}],options:{duration:250}});k("drawer.overlay.show",{keyframes:[{opacity:0},{opacity:1}],options:{duration:250}});k("drawer.overlay.hide",{keyframes:[{opacity:1},{opacity:0}],options:{duration:250}});j.define("sl-drawer");var _i=C`
  :host {
    display: inline-block;
  }

  .tab {
    display: inline-flex;
    align-items: center;
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-small);
    font-weight: var(--sl-font-weight-semibold);
    border-radius: var(--sl-border-radius-medium);
    color: var(--sl-color-neutral-600);
    padding: var(--sl-spacing-medium) var(--sl-spacing-large);
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
    transition:
      var(--transition-speed) box-shadow,
      var(--transition-speed) color;
  }

  .tab:hover:not(.tab--disabled) {
    color: var(--sl-color-primary-600);
  }

  :host(:focus) {
    outline: transparent;
  }

  :host(:focus-visible) {
    color: var(--sl-color-primary-600);
    outline: var(--sl-focus-ring);
    outline-offset: calc(-1 * var(--sl-focus-ring-width) - var(--sl-focus-ring-offset));
  }

  .tab.tab--active:not(.tab--disabled) {
    color: var(--sl-color-primary-600);
  }

  .tab.tab--closable {
    padding-inline-end: var(--sl-spacing-small);
  }

  .tab.tab--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tab__close-button {
    font-size: var(--sl-font-size-small);
    margin-inline-start: var(--sl-spacing-small);
  }

  .tab__close-button::part(base) {
    padding: var(--sl-spacing-3x-small);
  }

  @media (forced-colors: active) {
    .tab.tab--active:not(.tab--disabled) {
      outline: solid 1px transparent;
      outline-offset: -3px;
    }
  }
`;var Ir=0,Z=class extends S{constructor(){super(...arguments),this.localize=new V(this),this.attrId=++Ir,this.componentId=`sl-tab-${this.attrId}`,this.panel="",this.active=!1,this.closable=!1,this.disabled=!1,this.tabIndex=0}connectedCallback(){super.connectedCallback(),this.setAttribute("role","tab")}handleCloseClick(t){t.stopPropagation(),this.emit("sl-close")}handleActiveChange(){this.setAttribute("aria-selected",this.active?"true":"false")}handleDisabledChange(){this.setAttribute("aria-disabled",this.disabled?"true":"false"),this.disabled&&!this.active?this.tabIndex=-1:this.tabIndex=0}render(){return this.id=this.id.length>0?this.id:this.componentId,x`
      <div
        part="base"
        class=${L({tab:!0,"tab--active":this.active,"tab--closable":this.closable,"tab--disabled":this.disabled})}
      >
        <slot></slot>
        ${this.closable?x`
              <sl-icon-button
                part="close-button"
                exportparts="base:close-button__base"
                name="x-lg"
                library="system"
                label=${this.localize.term("close")}
                class="tab__close-button"
                @click=${this.handleCloseClick}
                tabindex="-1"
              ></sl-icon-button>
            `:""}
      </div>
    `}};Z.styles=[O,_i];Z.dependencies={"sl-icon-button":z};c([w(".tab")],Z.prototype,"tab",2);c([u({reflect:!0})],Z.prototype,"panel",2);c([u({type:Boolean,reflect:!0})],Z.prototype,"active",2);c([u({type:Boolean,reflect:!0})],Z.prototype,"closable",2);c([u({type:Boolean,reflect:!0})],Z.prototype,"disabled",2);c([u({type:Number,reflect:!0})],Z.prototype,"tabIndex",2);c([T("active")],Z.prototype,"handleActiveChange",1);c([T("disabled")],Z.prototype,"handleDisabledChange",1);Z.define("sl-tab");var xi=C`
  :host {
    --indicator-color: var(--sl-color-primary-600);
    --track-color: var(--sl-color-neutral-200);
    --track-width: 2px;

    display: block;
  }

  .tab-group {
    display: flex;
    border-radius: 0;
  }

  .tab-group__tabs {
    display: flex;
    position: relative;
  }

  .tab-group__indicator {
    position: absolute;
    transition:
      var(--sl-transition-fast) translate ease,
      var(--sl-transition-fast) width ease;
  }

  .tab-group--has-scroll-controls .tab-group__nav-container {
    position: relative;
    padding: 0 var(--sl-spacing-x-large);
  }

  .tab-group--has-scroll-controls .tab-group__scroll-button--start--hidden,
  .tab-group--has-scroll-controls .tab-group__scroll-button--end--hidden {
    visibility: hidden;
  }

  .tab-group__body {
    display: block;
    overflow: auto;
  }

  .tab-group__scroll-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    bottom: 0;
    width: var(--sl-spacing-x-large);
  }

  .tab-group__scroll-button--start {
    left: 0;
  }

  .tab-group__scroll-button--end {
    right: 0;
  }

  .tab-group--rtl .tab-group__scroll-button--start {
    left: auto;
    right: 0;
  }

  .tab-group--rtl .tab-group__scroll-button--end {
    left: 0;
    right: auto;
  }

  /*
   * Top
   */

  .tab-group--top {
    flex-direction: column;
  }

  .tab-group--top .tab-group__nav-container {
    order: 1;
  }

  .tab-group--top .tab-group__nav {
    display: flex;
    overflow-x: auto;

    /* Hide scrollbar in Firefox */
    scrollbar-width: none;
  }

  /* Hide scrollbar in Chrome/Safari */
  .tab-group--top .tab-group__nav::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .tab-group--top .tab-group__tabs {
    flex: 1 1 auto;
    position: relative;
    flex-direction: row;
    border-bottom: solid var(--track-width) var(--track-color);
  }

  .tab-group--top .tab-group__indicator {
    bottom: calc(-1 * var(--track-width));
    border-bottom: solid var(--track-width) var(--indicator-color);
  }

  .tab-group--top .tab-group__body {
    order: 2;
  }

  .tab-group--top ::slotted(sl-tab-panel) {
    --padding: var(--sl-spacing-medium) 0;
  }

  /*
   * Bottom
   */

  .tab-group--bottom {
    flex-direction: column;
  }

  .tab-group--bottom .tab-group__nav-container {
    order: 2;
  }

  .tab-group--bottom .tab-group__nav {
    display: flex;
    overflow-x: auto;

    /* Hide scrollbar in Firefox */
    scrollbar-width: none;
  }

  /* Hide scrollbar in Chrome/Safari */
  .tab-group--bottom .tab-group__nav::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .tab-group--bottom .tab-group__tabs {
    flex: 1 1 auto;
    position: relative;
    flex-direction: row;
    border-top: solid var(--track-width) var(--track-color);
  }

  .tab-group--bottom .tab-group__indicator {
    top: calc(-1 * var(--track-width));
    border-top: solid var(--track-width) var(--indicator-color);
  }

  .tab-group--bottom .tab-group__body {
    order: 1;
  }

  .tab-group--bottom ::slotted(sl-tab-panel) {
    --padding: var(--sl-spacing-medium) 0;
  }

  /*
   * Start
   */

  .tab-group--start {
    flex-direction: row;
  }

  .tab-group--start .tab-group__nav-container {
    order: 1;
  }

  .tab-group--start .tab-group__tabs {
    flex: 0 0 auto;
    flex-direction: column;
    border-inline-end: solid var(--track-width) var(--track-color);
  }

  .tab-group--start .tab-group__indicator {
    right: calc(-1 * var(--track-width));
    border-right: solid var(--track-width) var(--indicator-color);
  }

  .tab-group--start.tab-group--rtl .tab-group__indicator {
    right: auto;
    left: calc(-1 * var(--track-width));
  }

  .tab-group--start .tab-group__body {
    flex: 1 1 auto;
    order: 2;
  }

  .tab-group--start ::slotted(sl-tab-panel) {
    --padding: 0 var(--sl-spacing-medium);
  }

  /*
   * End
   */

  .tab-group--end {
    flex-direction: row;
  }

  .tab-group--end .tab-group__nav-container {
    order: 2;
  }

  .tab-group--end .tab-group__tabs {
    flex: 0 0 auto;
    flex-direction: column;
    border-left: solid var(--track-width) var(--track-color);
  }

  .tab-group--end .tab-group__indicator {
    left: calc(-1 * var(--track-width));
    border-inline-start: solid var(--track-width) var(--indicator-color);
  }

  .tab-group--end.tab-group--rtl .tab-group__indicator {
    right: calc(-1 * var(--track-width));
    left: auto;
  }

  .tab-group--end .tab-group__body {
    flex: 1 1 auto;
    order: 1;
  }

  .tab-group--end ::slotted(sl-tab-panel) {
    --padding: 0 var(--sl-spacing-medium);
  }
`;var Ai=C`
  :host {
    display: contents;
  }
`;var le=class extends S{constructor(){super(...arguments),this.observedElements=[],this.disabled=!1}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(t=>{this.emit("sl-resize",{detail:{entries:t}})}),this.disabled||this.startObserver()}disconnectedCallback(){super.disconnectedCallback(),this.stopObserver()}handleSlotChange(){this.disabled||this.startObserver()}startObserver(){let t=this.shadowRoot.querySelector("slot");if(t!==null){let e=t.assignedElements({flatten:!0});this.observedElements.forEach(o=>this.resizeObserver.unobserve(o)),this.observedElements=[],e.forEach(o=>{this.resizeObserver.observe(o),this.observedElements.push(o)})}}stopObserver(){this.resizeObserver.disconnect()}handleDisabledChange(){this.disabled?this.stopObserver():this.startObserver()}render(){return x` <slot @slotchange=${this.handleSlotChange}></slot> `}};le.styles=[O,Ai];c([u({type:Boolean,reflect:!0})],le.prototype,"disabled",2);c([T("disabled",{waitUntilFirstUpdate:!0})],le.prototype,"handleDisabledChange",1);var M=class extends S{constructor(){super(...arguments),this.tabs=[],this.focusableTabs=[],this.panels=[],this.localize=new V(this),this.hasScrollControls=!1,this.shouldHideScrollStartButton=!1,this.shouldHideScrollEndButton=!1,this.placement="top",this.activation="auto",this.noScrollControls=!1,this.fixedScrollControls=!1,this.scrollOffset=1}connectedCallback(){let t=Promise.all([customElements.whenDefined("sl-tab"),customElements.whenDefined("sl-tab-panel")]);super.connectedCallback(),this.resizeObserver=new ResizeObserver(()=>{this.repositionIndicator(),this.updateScrollControls()}),this.mutationObserver=new MutationObserver(e=>{let o=e.filter(({target:i})=>{if(i===this)return!0;if(i.closest("sl-tab-group")!==this)return!1;let r=i.tagName.toLowerCase();return r==="sl-tab"||r==="sl-tab-panel"});if(o.length!==0){if(o.some(i=>!["aria-labelledby","aria-controls"].includes(i.attributeName))&&setTimeout(()=>this.setAriaLabels()),o.some(i=>i.attributeName==="disabled"))this.syncTabsAndPanels();else if(o.some(i=>i.attributeName==="active")){let r=o.filter(s=>s.attributeName==="active"&&s.target.tagName.toLowerCase()==="sl-tab").map(s=>s.target).find(s=>s.active);r&&this.setActiveTab(r)}}}),this.updateComplete.then(()=>{this.syncTabsAndPanels(),this.mutationObserver.observe(this,{attributes:!0,attributeFilter:["active","disabled","name","panel"],childList:!0,subtree:!0}),this.resizeObserver.observe(this.nav),t.then(()=>{new IntersectionObserver((o,i)=>{var r;o[0].intersectionRatio>0&&(this.setAriaLabels(),this.setActiveTab((r=this.getActiveTab())!=null?r:this.tabs[0],{emitEvents:!1}),i.unobserve(o[0].target))}).observe(this.tabGroup)})})}disconnectedCallback(){var t,e;super.disconnectedCallback(),(t=this.mutationObserver)==null||t.disconnect(),this.nav&&((e=this.resizeObserver)==null||e.unobserve(this.nav))}getAllTabs(){return this.shadowRoot.querySelector('slot[name="nav"]').assignedElements()}getAllPanels(){return[...this.body.assignedElements()].filter(t=>t.tagName.toLowerCase()==="sl-tab-panel")}getActiveTab(){return this.tabs.find(t=>t.active)}handleClick(t){let o=t.target.closest("sl-tab");o?.closest("sl-tab-group")===this&&o!==null&&this.setActiveTab(o,{scrollBehavior:"smooth"})}handleKeyDown(t){let o=t.target.closest("sl-tab");if(o?.closest("sl-tab-group")===this&&(["Enter"," "].includes(t.key)&&o!==null&&(this.setActiveTab(o,{scrollBehavior:"smooth"}),t.preventDefault()),["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(t.key))){let r=this.tabs.find(a=>a.matches(":focus")),s=this.localize.dir()==="rtl",n=null;if(r?.tagName.toLowerCase()==="sl-tab"){if(t.key==="Home")n=this.focusableTabs[0];else if(t.key==="End")n=this.focusableTabs[this.focusableTabs.length-1];else if(["top","bottom"].includes(this.placement)&&t.key===(s?"ArrowRight":"ArrowLeft")||["start","end"].includes(this.placement)&&t.key==="ArrowUp"){let a=this.tabs.findIndex(l=>l===r);n=this.findNextFocusableTab(a,"backward")}else if(["top","bottom"].includes(this.placement)&&t.key===(s?"ArrowLeft":"ArrowRight")||["start","end"].includes(this.placement)&&t.key==="ArrowDown"){let a=this.tabs.findIndex(l=>l===r);n=this.findNextFocusableTab(a,"forward")}if(!n)return;n.tabIndex=0,n.focus({preventScroll:!0}),this.activation==="auto"?this.setActiveTab(n,{scrollBehavior:"smooth"}):this.tabs.forEach(a=>{a.tabIndex=a===n?0:-1}),["top","bottom"].includes(this.placement)&&lo(n,this.nav,"horizontal"),t.preventDefault()}}}handleScrollToStart(){this.nav.scroll({left:this.localize.dir()==="rtl"?this.nav.scrollLeft+this.nav.clientWidth:this.nav.scrollLeft-this.nav.clientWidth,behavior:"smooth"})}handleScrollToEnd(){this.nav.scroll({left:this.localize.dir()==="rtl"?this.nav.scrollLeft-this.nav.clientWidth:this.nav.scrollLeft+this.nav.clientWidth,behavior:"smooth"})}setActiveTab(t,e){if(e=K({emitEvents:!0,scrollBehavior:"auto"},e),t!==this.activeTab&&!t.disabled){let o=this.activeTab;this.activeTab=t,this.tabs.forEach(i=>{i.active=i===this.activeTab,i.tabIndex=i===this.activeTab?0:-1}),this.panels.forEach(i=>{var r;return i.active=i.name===((r=this.activeTab)==null?void 0:r.panel)}),this.syncIndicator(),["top","bottom"].includes(this.placement)&&lo(this.activeTab,this.nav,"horizontal",e.scrollBehavior),e.emitEvents&&(o&&this.emit("sl-tab-hide",{detail:{name:o.panel}}),this.emit("sl-tab-show",{detail:{name:this.activeTab.panel}}))}}setAriaLabels(){this.tabs.forEach(t=>{let e=this.panels.find(o=>o.name===t.panel);e&&(t.setAttribute("aria-controls",e.getAttribute("id")),e.setAttribute("aria-labelledby",t.getAttribute("id")))})}repositionIndicator(){let t=this.getActiveTab();if(!t)return;let e=t.clientWidth,o=t.clientHeight,i=this.localize.dir()==="rtl",r=this.getAllTabs(),n=r.slice(0,r.indexOf(t)).reduce((a,l)=>({left:a.left+l.clientWidth,top:a.top+l.clientHeight}),{left:0,top:0});switch(this.placement){case"top":case"bottom":this.indicator.style.width=`${e}px`,this.indicator.style.height="auto",this.indicator.style.translate=i?`${-1*n.left}px`:`${n.left}px`;break;case"start":case"end":this.indicator.style.width="auto",this.indicator.style.height=`${o}px`,this.indicator.style.translate=`0 ${n.top}px`;break}}syncTabsAndPanels(){this.tabs=this.getAllTabs(),this.focusableTabs=this.tabs.filter(t=>!t.disabled),this.panels=this.getAllPanels(),this.syncIndicator(),this.updateComplete.then(()=>this.updateScrollControls())}findNextFocusableTab(t,e){let o=null,i=e==="forward"?1:-1,r=t+i;for(;t<this.tabs.length;){if(o=this.tabs[r]||null,o===null){e==="forward"?o=this.focusableTabs[0]:o=this.focusableTabs[this.focusableTabs.length-1];break}if(!o.disabled)break;r+=i}return o}updateScrollButtons(){this.hasScrollControls&&!this.fixedScrollControls&&(this.shouldHideScrollStartButton=this.scrollFromStart()<=this.scrollOffset,this.shouldHideScrollEndButton=this.isScrolledToEnd())}isScrolledToEnd(){return this.scrollFromStart()+this.nav.clientWidth>=this.nav.scrollWidth-this.scrollOffset}scrollFromStart(){return this.localize.dir()==="rtl"?-this.nav.scrollLeft:this.nav.scrollLeft}updateScrollControls(){this.noScrollControls?this.hasScrollControls=!1:this.hasScrollControls=["top","bottom"].includes(this.placement)&&this.nav.scrollWidth>this.nav.clientWidth+1,this.updateScrollButtons()}syncIndicator(){this.getActiveTab()?(this.indicator.style.display="block",this.repositionIndicator()):this.indicator.style.display="none"}show(t){let e=this.tabs.find(o=>o.panel===t);e&&this.setActiveTab(e,{scrollBehavior:"smooth"})}render(){let t=this.localize.dir()==="rtl";return x`
      <div
        part="base"
        class=${L({"tab-group":!0,"tab-group--top":this.placement==="top","tab-group--bottom":this.placement==="bottom","tab-group--start":this.placement==="start","tab-group--end":this.placement==="end","tab-group--rtl":this.localize.dir()==="rtl","tab-group--has-scroll-controls":this.hasScrollControls})}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <div class="tab-group__nav-container" part="nav">
          ${this.hasScrollControls?x`
                <sl-icon-button
                  part="scroll-button scroll-button--start"
                  exportparts="base:scroll-button__base"
                  class=${L({"tab-group__scroll-button":!0,"tab-group__scroll-button--start":!0,"tab-group__scroll-button--start--hidden":this.shouldHideScrollStartButton})}
                  name=${t?"chevron-right":"chevron-left"}
                  library="system"
                  tabindex="-1"
                  aria-hidden="true"
                  label=${this.localize.term("scrollToStart")}
                  @click=${this.handleScrollToStart}
                ></sl-icon-button>
              `:""}

          <div class="tab-group__nav" @scrollend=${this.updateScrollButtons}>
            <div part="tabs" class="tab-group__tabs" role="tablist">
              <div part="active-tab-indicator" class="tab-group__indicator"></div>
              <sl-resize-observer @sl-resize=${this.syncIndicator}>
                <slot name="nav" @slotchange=${this.syncTabsAndPanels}></slot>
              </sl-resize-observer>
            </div>
          </div>

          ${this.hasScrollControls?x`
                <sl-icon-button
                  part="scroll-button scroll-button--end"
                  exportparts="base:scroll-button__base"
                  class=${L({"tab-group__scroll-button":!0,"tab-group__scroll-button--end":!0,"tab-group__scroll-button--end--hidden":this.shouldHideScrollEndButton})}
                  name=${t?"chevron-left":"chevron-right"}
                  library="system"
                  tabindex="-1"
                  aria-hidden="true"
                  label=${this.localize.term("scrollToEnd")}
                  @click=${this.handleScrollToEnd}
                ></sl-icon-button>
              `:""}
        </div>

        <slot part="body" class="tab-group__body" @slotchange=${this.syncTabsAndPanels}></slot>
      </div>
    `}};M.styles=[O,xi];M.dependencies={"sl-icon-button":z,"sl-resize-observer":le};c([w(".tab-group")],M.prototype,"tabGroup",2);c([w(".tab-group__body")],M.prototype,"body",2);c([w(".tab-group__nav")],M.prototype,"nav",2);c([w(".tab-group__indicator")],M.prototype,"indicator",2);c([wt()],M.prototype,"hasScrollControls",2);c([wt()],M.prototype,"shouldHideScrollStartButton",2);c([wt()],M.prototype,"shouldHideScrollEndButton",2);c([u()],M.prototype,"placement",2);c([u()],M.prototype,"activation",2);c([u({attribute:"no-scroll-controls",type:Boolean})],M.prototype,"noScrollControls",2);c([u({attribute:"fixed-scroll-controls",type:Boolean})],M.prototype,"fixedScrollControls",2);c([ai({passive:!0})],M.prototype,"updateScrollButtons",1);c([T("noScrollControls",{waitUntilFirstUpdate:!0})],M.prototype,"updateScrollControls",1);c([T("placement",{waitUntilFirstUpdate:!0})],M.prototype,"syncIndicator",1);M.define("sl-tab-group");var Ur=(t,e)=>{let o=0;return function(...i){window.clearTimeout(o),o=window.setTimeout(()=>{t.call(this,...i)},e)}},$i=(t,e,o)=>{let i=t[e];t[e]=function(...r){i.call(this,...r),o.call(this,i,...r)}};(()=>{if(typeof window>"u")return;if(!("onscrollend"in window)){let e=new Set,o=new WeakMap,i=s=>{for(let n of s.changedTouches)e.add(n.identifier)},r=s=>{for(let n of s.changedTouches)e.delete(n.identifier)};document.addEventListener("touchstart",i,!0),document.addEventListener("touchend",r,!0),document.addEventListener("touchcancel",r,!0),$i(EventTarget.prototype,"addEventListener",function(s,n){if(n!=="scrollend")return;let a=Ur(()=>{e.size?a():this.dispatchEvent(new Event("scrollend"))},100);s.call(this,"scroll",a,{passive:!0}),o.set(this,a)}),$i(EventTarget.prototype,"removeEventListener",function(s,n){if(n!=="scrollend")return;let a=o.get(this);a&&s.call(this,"scroll",a,{passive:!0})})}})();var Si=C`
  :host {
    --padding: 0;

    display: none;
  }

  :host([active]) {
    display: block;
  }

  .tab-panel {
    display: block;
    padding: var(--padding);
  }
`;var Wr=0,Wt=class extends S{constructor(){super(...arguments),this.attrId=++Wr,this.componentId=`sl-tab-panel-${this.attrId}`,this.name="",this.active=!1}connectedCallback(){super.connectedCallback(),this.id=this.id.length>0?this.id:this.componentId,this.setAttribute("role","tabpanel")}handleActiveChange(){this.setAttribute("aria-hidden",this.active?"false":"true")}render(){return x`
      <slot
        part="base"
        class=${L({"tab-panel":!0,"tab-panel--active":this.active})}
      ></slot>
    `}};Wt.styles=[O,Si];c([u({reflect:!0})],Wt.prototype,"name",2);c([u({type:Boolean,reflect:!0})],Wt.prototype,"active",2);c([T("active")],Wt.prototype,"handleActiveChange",1);Wt.define("sl-tab-panel");var Ci=C`
  :host {
    --max-width: 20rem;
    --hide-delay: 0ms;
    --show-delay: 150ms;

    display: contents;
  }

  .tooltip {
    --arrow-size: var(--sl-tooltip-arrow-size);
    --arrow-color: var(--sl-tooltip-background-color);
  }

  .tooltip::part(popup) {
    z-index: var(--sl-z-index-tooltip);
  }

  .tooltip[placement^='top']::part(popup) {
    transform-origin: bottom;
  }

  .tooltip[placement^='bottom']::part(popup) {
    transform-origin: top;
  }

  .tooltip[placement^='left']::part(popup) {
    transform-origin: right;
  }

  .tooltip[placement^='right']::part(popup) {
    transform-origin: left;
  }

  .tooltip__body {
    display: block;
    width: max-content;
    max-width: var(--max-width);
    border-radius: var(--sl-tooltip-border-radius);
    background-color: var(--sl-tooltip-background-color);
    font-family: var(--sl-tooltip-font-family);
    font-size: var(--sl-tooltip-font-size);
    font-weight: var(--sl-tooltip-font-weight);
    line-height: var(--sl-tooltip-line-height);
    text-align: start;
    white-space: normal;
    color: var(--sl-tooltip-color);
    padding: var(--sl-tooltip-padding);
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
  }
`;var Ei=C`
  :host {
    --arrow-color: var(--sl-color-neutral-1000);
    --arrow-size: 6px;

    /*
     * These properties are computed to account for the arrow's dimensions after being rotated 45º. The constant
     * 0.7071 is derived from sin(45), which is the diagonal size of the arrow's container after rotating.
     */
    --arrow-size-diagonal: calc(var(--arrow-size) * 0.7071);
    --arrow-padding-offset: calc(var(--arrow-size-diagonal) - var(--arrow-size));

    display: contents;
  }

  .popup {
    position: absolute;
    isolation: isolate;
    max-width: var(--auto-size-available-width, none);
    max-height: var(--auto-size-available-height, none);
  }

  .popup--fixed {
    position: fixed;
  }

  .popup:not(.popup--active) {
    display: none;
  }

  .popup__arrow {
    position: absolute;
    width: calc(var(--arrow-size-diagonal) * 2);
    height: calc(var(--arrow-size-diagonal) * 2);
    rotate: 45deg;
    background: var(--arrow-color);
    z-index: -1;
  }

  /* Hover bridge */
  .popup-hover-bridge:not(.popup-hover-bridge--visible) {
    display: none;
  }

  .popup-hover-bridge {
    position: fixed;
    z-index: calc(var(--sl-z-index-dropdown) - 1);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    clip-path: polygon(
      var(--hover-bridge-top-left-x, 0) var(--hover-bridge-top-left-y, 0),
      var(--hover-bridge-top-right-x, 0) var(--hover-bridge-top-right-y, 0),
      var(--hover-bridge-bottom-right-x, 0) var(--hover-bridge-bottom-right-y, 0),
      var(--hover-bridge-bottom-left-x, 0) var(--hover-bridge-bottom-left-y, 0)
    );
  }
`;var at=Math.min,ot=Math.max,de=Math.round,he=Math.floor,lt=t=>({x:t,y:t}),qr={left:"right",right:"left",bottom:"top",top:"bottom"};function po(t,e,o){return ot(t,at(e,o))}function zt(t,e){return typeof t=="function"?t(e):t}function _t(t){return t.split("-")[0]}function Dt(t){return t.split("-")[1]}function uo(t){return t==="x"?"y":"x"}function ze(t){return t==="y"?"height":"width"}function ct(t){let e=t[0];return e==="t"||e==="b"?"y":"x"}function De(t){return uo(ct(t))}function Oi(t,e,o){o===void 0&&(o=!1);let i=Dt(t),r=De(t),s=ze(r),n=r==="x"?i===(o?"end":"start")?"right":"left":i==="start"?"bottom":"top";return e.reference[s]>e.floating[s]&&(n=ce(n)),[n,ce(n)]}function Pi(t){let e=ce(t);return[Re(t),e,Re(e)]}function Re(t){return t.includes("start")?t.replace("start","end"):t.replace("end","start")}var ki=["left","right"],Ti=["right","left"],Vr=["top","bottom"],jr=["bottom","top"];function Kr(t,e,o){switch(t){case"top":case"bottom":return o?e?Ti:ki:e?ki:Ti;case"left":case"right":return e?Vr:jr;default:return[]}}function Li(t,e,o,i){let r=Dt(t),s=Kr(_t(t),o==="start",i);return r&&(s=s.map(n=>n+"-"+r),e&&(s=s.concat(s.map(Re)))),s}function ce(t){let e=_t(t);return qr[e]+t.slice(e.length)}function Xr(t){var e,o,i,r;return{top:(e=t.top)!=null?e:0,right:(o=t.right)!=null?o:0,bottom:(i=t.bottom)!=null?i:0,left:(r=t.left)!=null?r:0}}function fo(t){return typeof t!="number"?Xr(t):{top:t,right:t,bottom:t,left:t}}function Bt(t){let{x:e,y:o,width:i,height:r}=t;return{width:i,height:r,top:o,left:e,right:e+i,bottom:o+r,x:e,y:o}}function Ri(t,e,o){let{reference:i,floating:r}=t,s=ct(e),n=De(e),a=ze(n),l=_t(e),d=s==="y",h=i.x+i.width/2-r.width/2,p=i.y+i.height/2-r.height/2,m=i[a]/2-r[a]/2,f;switch(l){case"top":f={x:h,y:i.y-r.height};break;case"bottom":f={x:h,y:i.y+i.height};break;case"right":f={x:i.x+i.width,y:p};break;case"left":f={x:i.x-r.width,y:p};break;default:f={x:i.x,y:i.y}}let g=Dt(e);return g&&(f[n]+=m*(g==="end"?1:-1)*(o&&d?-1:1)),f}async function zi(t,e){var o;e===void 0&&(e={});let{x:i,y:r,platform:s,rects:n,elements:a,strategy:l}=t,{boundary:d="clippingAncestors",rootBoundary:h="viewport",elementContext:p="floating",altBoundary:m=!1,padding:f=0}=zt(e,t),g=fo(f),y=a[m?p==="floating"?"reference":"floating":p],v=Bt(await s.getClippingRect({element:(o=await(s.isElement==null?void 0:s.isElement(y)))==null||o?y:y.contextElement||await(s.getDocumentElement==null?void 0:s.getDocumentElement(a.floating)),boundary:d,rootBoundary:h,strategy:l})),_=p==="floating"?{x:i,y:r,width:n.floating.width,height:n.floating.height}:n.reference,$=await(s.getOffsetParent==null?void 0:s.getOffsetParent(a.floating)),E=await(s.isElement==null?void 0:s.isElement($))&&await(s.getScale==null?void 0:s.getScale($))||{x:1,y:1},W=Bt(s.convertOffsetParentRelativeRectToViewportRelativeRect?await s.convertOffsetParentRelativeRectToViewportRelativeRect({elements:a,rect:_,offsetParent:$,strategy:l}):_);return{top:(v.top-W.top+g.top)/E.y,bottom:(W.bottom-v.bottom+g.bottom)/E.y,left:(v.left-W.left+g.left)/E.x,right:(W.right-v.right+g.right)/E.x}}var Yr=50,Di=async(t,e,o)=>{let{placement:i="bottom",strategy:r="absolute",middleware:s=[],platform:n}=o,a=n.detectOverflow?n:{...n,detectOverflow:zi},l=await(n.isRTL==null?void 0:n.isRTL(e)),d=await n.getElementRects({reference:t,floating:e,strategy:r}),{x:h,y:p}=Ri(d,i,l),m=i,f=0,g={};for(let b=0;b<s.length;b++){let y=s[b];if(!y)continue;let{name:v,fn:_}=y,{x:$,y:E,data:W,reset:P}=await _({x:h,y:p,initialPlacement:i,placement:m,strategy:r,middlewareData:g,rects:d,platform:a,elements:{reference:t,floating:e}});h=$??h,p=E??p,g[v]={...g[v],...W},P&&f<Yr&&(f++,typeof P=="object"&&(P.placement&&(m=P.placement),P.rects&&(d=P.rects===!0?await n.getElementRects({reference:t,floating:e,strategy:r}):P.rects),{x:h,y:p}=Ri(d,m,l)),b=-1)}return{x:h,y:p,placement:m,strategy:r,middlewareData:g}},Bi=t=>({name:"arrow",options:t,async fn(e){let{x:o,y:i,placement:r,rects:s,platform:n,elements:a,middlewareData:l}=e,{element:d,padding:h=0}=zt(t,e)||{};if(d==null)return{};let p=fo(h),m={x:o,y:i},f=De(r),g=ze(f),b=await n.getDimensions(d),y=f==="y",v=y?"top":"left",_=y?"bottom":"right",$=y?"clientHeight":"clientWidth",E=s.reference[g]+s.reference[f]-m[f]-s.floating[g],W=m[f]-s.reference[f],P=await(n.getOffsetParent==null?void 0:n.getOffsetParent(d)),q=P?P[$]:0;(!q||!await(n.isElement==null?void 0:n.isElement(P)))&&(q=a.floating[$]||s.floating[g]);let J=E/2-W/2,st=q/2-b[g]/2-1,F=at(p[v],st),Xt=at(p[_],st),Yt=q-b[g]-Xt,nt=q/2-b[g]/2+J,Q=po(F,nt,Yt),At=!l.arrow&&Dt(r)!=null&&nt!==Q&&s.reference[g]/2-(nt<F?F:Xt)-b[g]/2<0,ht=At?nt<F?nt-F:nt-Yt:0;return{[f]:m[f]+ht,data:{[f]:Q,centerOffset:nt-Q-ht,...At&&{alignmentOffset:ht}},reset:At}}});var Mi=function(t){return t===void 0&&(t={}),{name:"flip",options:t,async fn(e){var o,i;let{placement:r,middlewareData:s,rects:n,initialPlacement:a,platform:l,elements:d}=e,{mainAxis:h=!0,crossAxis:p=!0,fallbackPlacements:m,fallbackStrategy:f="bestFit",fallbackAxisSideDirection:g="none",flipAlignment:b=!0,...y}=zt(t,e);if((o=s.arrow)!=null&&o.alignmentOffset)return{};let v=_t(r),_=ct(a),$=_t(a)===a,E=await(l.isRTL==null?void 0:l.isRTL(d.floating)),W=m||($||!b?[ce(a)]:Pi(a)),P=g!=="none";!m&&P&&W.push(...Li(a,b,g,E));let q=[a,...W],J=await l.detectOverflow(e,y),st=[],F=((i=s.flip)==null?void 0:i.overflows)||[];if(h&&st.push(J[v]),p){let Q=Oi(r,n,E);st.push(J[Q[0]],J[Q[1]])}if(F=[...F,{placement:r,overflows:st}],!st.every(Q=>Q<=0)){var Xt,Yt;let Q=(((Xt=s.flip)==null?void 0:Xt.index)||0)+1,At=q[Q];if(At&&(!(p==="alignment"?_!==ct(At):!1)||F.every(tt=>ct(tt.placement)===_?tt.overflows[0]>0:!0)))return{data:{index:Q,overflows:F},reset:{placement:At}};let ht=(Yt=F.filter($t=>$t.overflows[0]<=0).sort(($t,tt)=>$t.overflows[1]-tt.overflows[1])[0])==null?void 0:Yt.placement;if(!ht)switch(f){case"bestFit":{var nt;let $t=(nt=F.filter(tt=>{if(P){let bt=ct(tt.placement);return bt===_||bt==="y"}return!0}).map(tt=>[tt.placement,tt.overflows.filter(bt=>bt>0).reduce((bt,nr)=>bt+nr,0)]).sort((tt,bt)=>tt[1]-bt[1])[0])==null?void 0:nt[0];$t&&(ht=$t);break}case"initialPlacement":ht=a;break}if(r!==ht)return{reset:{placement:ht}}}return{}}}};var Gr=new Set(["left","top"]);async function Zr(t,e){let{placement:o,platform:i,elements:r}=t,s=await(i.isRTL==null?void 0:i.isRTL(r.floating)),n=_t(o),a=Dt(o),l=ct(o)==="y",d=Gr.has(n)?-1:1,h=s&&l?-1:1,p=zt(e,t),{mainAxis:m,crossAxis:f,alignmentAxis:g}=typeof p=="number"?{mainAxis:p,crossAxis:0,alignmentAxis:null}:{mainAxis:p.mainAxis||0,crossAxis:p.crossAxis||0,alignmentAxis:p.alignmentAxis};return a&&typeof g=="number"&&(f=a==="end"?g*-1:g),l?{x:f*h,y:m*d}:{x:m*d,y:f*h}}var Ni=function(t){return t===void 0&&(t=0),{name:"offset",options:t,async fn(e){var o,i;let{x:r,y:s,placement:n,middlewareData:a}=e,l=await Zr(e,t);return n===((o=a.offset)==null?void 0:o.placement)&&(i=a.arrow)!=null&&i.alignmentOffset?{}:{x:r+l.x,y:s+l.y,data:{...l,placement:n}}}}},Hi=function(t){return t===void 0&&(t={}),{name:"shift",options:t,async fn(e){let{x:o,y:i,placement:r,platform:s}=e,{mainAxis:n=!0,crossAxis:a=!1,limiter:l={fn:_=>{let{x:$,y:E}=_;return{x:$,y:E}}},...d}=zt(t,e),h={x:o,y:i},p=await s.detectOverflow(e,d),m=ct(r),f=uo(m),g=h[f],b=h[m],y=(_,$)=>po($+p[_==="y"?"top":"left"],$,$-p[_==="y"?"bottom":"right"]);n&&(g=y(f,g)),a&&(b=y(m,b));let v=l.fn({...e,[f]:g,[m]:b});return{...v,data:{x:v.x-o,y:v.y-i,enabled:{[f]:n,[m]:a}}}}}};var Fi=function(t){return t===void 0&&(t={}),{name:"size",options:t,async fn(e){let{placement:o,rects:i,platform:r,elements:s}=e,{apply:n=()=>{},...a}=zt(t,e),l=await r.detectOverflow(e,a),d=_t(o),h=Dt(o),p=ct(o)==="y",{width:m,height:f}=i.floating,g,b;d==="top"||d==="bottom"?(g=d,b=h===(await(r.isRTL==null?void 0:r.isRTL(s.floating))?"start":"end")?"left":"right"):(b=d,g=h==="end"?"top":"bottom");let y=f-l.top-l.bottom,v=m-l.left-l.right,_=at(f-l[g],y),$=at(m-l[b],v),E=e.middlewareData.shift,W=!E,P=_,q=$;E!=null&&E.enabled.x&&(q=v),E!=null&&E.enabled.y&&(P=y),W&&!h&&(p?q=m-2*ot(l.left,l.right):P=f-2*ot(l.top,l.bottom)),await n({...e,availableWidth:q,availableHeight:P});let J=await r.getDimensions(s.floating);return m!==J.width||f!==J.height?{reset:{rects:!0}}:{}}}};function Be(){return typeof window<"u"}function Nt(t){return Ui(t)?(t.nodeName||"").toLowerCase():"#document"}function U(t){var e;return(t==null||(e=t.ownerDocument)==null?void 0:e.defaultView)||window}function dt(t){var e;return(e=(Ui(t)?t.ownerDocument:t.document)||window.document)==null?void 0:e.documentElement}function Ui(t){return Be()?t instanceof Node||t instanceof U(t).Node:!1}function it(t){return Be()?t instanceof Element||t instanceof U(t).Element:!1}function gt(t){return Be()?t instanceof HTMLElement||t instanceof U(t).HTMLElement:!1}function Ii(t){return!Be()||typeof ShadowRoot>"u"?!1:t instanceof ShadowRoot||t instanceof U(t).ShadowRoot}function pe(t){let{overflow:e,overflowX:o,overflowY:i,display:r}=rt(t);return/auto|scroll|overlay|hidden|clip/.test(e+i+o)&&r!=="inline"&&r!=="contents"}function Wi(t){return/^(table|td|th)$/.test(Nt(t))}function ue(t){try{if(t.matches(":popover-open"))return!0}catch{}try{return t.matches(":modal")}catch{return!1}}var Jr=/transform|translate|scale|rotate|perspective|filter/,Qr=/paint|layout|strict|content/,Mt=t=>!!t&&t!=="none",mo;function Vt(t){let e=it(t)?rt(t):t;return Mt(e.transform)||Mt(e.translate)||Mt(e.scale)||Mt(e.rotate)||Mt(e.perspective)||!Me()&&(Mt(e.backdropFilter)||Mt(e.filter))||Jr.test(e.willChange||"")||Qr.test(e.contain||"")}function qi(t){let e=xt(t);for(;gt(e)&&!jt(e);){if(Vt(e))return e;if(ue(e))return null;e=xt(e)}return null}function Me(){return mo==null&&(mo=typeof CSS<"u"&&CSS.supports&&CSS.supports("-webkit-backdrop-filter","none")),mo}function jt(t){return/^(html|body|#document)$/.test(Nt(t))}function rt(t){return U(t).getComputedStyle(t)}function fe(t){return it(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.scrollX,scrollTop:t.scrollY}}function xt(t){if(Nt(t)==="html")return t;let e=t.assignedSlot||t.parentNode||Ii(t)&&t.host||dt(t);return Ii(e)?e.host:e}function Vi(t){let e=xt(t);return jt(e)?(t.ownerDocument||t).body:gt(e)&&pe(e)?e:Vi(e)}function qt(t,e,o){var i;e===void 0&&(e=[]),o===void 0&&(o=!0);let r=Vi(t),s=r===((i=t.ownerDocument)==null?void 0:i.body),n=U(r);if(s){let a=Ne(n);return e.concat(n,n.visualViewport||[],pe(r)?r:[],a&&o?qt(a):[])}else return e.concat(r,qt(r,[],o))}function Ne(t){return t.parent&&Object.getPrototypeOf(t.parent)?t.frameElement:null}function Xi(t){let e=rt(t),o=parseFloat(e.width)||0,i=parseFloat(e.height)||0,r=gt(t),s=r?t.offsetWidth:o,n=r?t.offsetHeight:i,a=de(o)!==s||de(i)!==n;return a&&(o=s,i=n),{width:o,height:i,$:a}}function bo(t){return it(t)?t:t.contextElement}function Kt(t){let e=bo(t);if(!gt(e))return lt(1);let o=e.getBoundingClientRect(),{width:i,height:r,$:s}=Xi(e),n=(s?de(o.width):o.width)/i,a=(s?de(o.height):o.height)/r;return(!n||!Number.isFinite(n))&&(n=1),(!a||!Number.isFinite(a))&&(a=1),{x:n,y:a}}var ts=lt(0);function Yi(t){let e=U(t);return!Me()||!e.visualViewport?ts:{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}}function es(t,e,o){return e===void 0&&(e=!1),!!o&&e&&o===U(t)}function Ht(t,e,o,i){e===void 0&&(e=!1),o===void 0&&(o=!1);let r=t.getBoundingClientRect(),s=bo(t),n=lt(1);e&&(i?it(i)&&(n=Kt(i)):n=Kt(t));let a=es(s,o,i)?Yi(s):lt(0),l=(r.left+a.x)/n.x,d=(r.top+a.y)/n.y,h=r.width/n.x,p=r.height/n.y;if(s&&i){let m=U(s),f=it(i)?U(i):i,g=m,b=Ne(g);for(;b&&f!==g;){let y=Kt(b),v=b.getBoundingClientRect(),_=rt(b),$=v.left+(b.clientLeft+parseFloat(_.paddingLeft))*y.x,E=v.top+(b.clientTop+parseFloat(_.paddingTop))*y.y;l*=y.x,d*=y.y,h*=y.x,p*=y.y,l+=$,d+=E,g=U(b),b=Ne(g)}}return Bt({width:h,height:p,x:l,y:d})}function He(t,e){let o=fe(t).scrollLeft;return e?e.left+o:Ht(dt(t)).left+o}function Gi(t,e){let o=t.getBoundingClientRect(),i=o.left+e.scrollLeft-He(t,o),r=o.top+e.scrollTop;return{x:i,y:r}}function os(t){let{elements:e,rect:o,offsetParent:i,strategy:r}=t,s=r==="fixed",n=dt(i),a=e?ue(e.floating):!1;if(i===n||a&&s)return o;let l={scrollLeft:0,scrollTop:0},d=lt(1),h=lt(0),p=gt(i);if((p||!s)&&((Nt(i)!=="body"||pe(n))&&(l=fe(i)),p)){let f=Ht(i);d=Kt(i),h.x=f.x+i.clientLeft,h.y=f.y+i.clientTop}let m=n&&!p&&!s?Gi(n,l):lt(0);return{width:o.width*d.x,height:o.height*d.y,x:o.x*d.x-l.scrollLeft*d.x+h.x+m.x,y:o.y*d.y-l.scrollTop*d.y+h.y+m.y}}function is(t){return t.getClientRects?Array.from(t.getClientRects()):[]}function rs(t){let e=fe(t),o=t.ownerDocument.body,i=ot(t.scrollWidth,t.clientWidth,o.scrollWidth,o.clientWidth),r=ot(t.scrollHeight,t.clientHeight,o.scrollHeight,o.clientHeight),s=-e.scrollLeft+He(t),n=-e.scrollTop;return rt(o).direction==="rtl"&&(s+=ot(t.clientWidth,o.clientWidth)-i),{width:i,height:r,x:s,y:n}}var ss=25;function ns(t,e,o){o===void 0&&(o="viewport");let i=o==="layoutViewport",r=U(t),s=dt(t),n=r.visualViewport,a=s.clientWidth,l=s.clientHeight,d=0,h=0;if(n){let m=!Me()||e==="fixed";i?m||(d=-n.offsetLeft,h=-n.offsetTop):(a=n.width,l=n.height,m&&(d=n.offsetLeft,h=n.offsetTop))}if(He(s)<=0){let m=s.ownerDocument,f=m.body,g=getComputedStyle(f),b=m.compatMode==="CSS1Compat"&&parseFloat(g.marginLeft)+parseFloat(g.marginRight)||0,y=Math.abs(s.clientWidth-f.clientWidth-b),v=getComputedStyle(s).scrollbarGutter==="stable both-edges"?y/2:y;v<=ss&&(a-=v)}return{width:a,height:l,x:d,y:h}}function as(t,e){let o=Ht(t,!0,e==="fixed"),i=o.top+t.clientTop,r=o.left+t.clientLeft,s=Kt(t),n=t.clientWidth*s.x,a=t.clientHeight*s.y,l=r*s.x,d=i*s.y;return{width:n,height:a,x:l,y:d}}function ji(t,e,o){let i;if(e==="viewport"||e==="layoutViewport")i=ns(t,o,e);else if(e==="document")i=rs(dt(t));else if(it(e))i=as(e,o);else{let r=Yi(t);i={x:e.x-r.x,y:e.y-r.y,width:e.width,height:e.height}}return Bt(i)}function ls(t,e){let o=e.get(t);if(o)return o;let i=qt(t,[],!1).filter(a=>it(a)&&Nt(a)!=="body"),r=null,s=rt(t).position==="fixed",n=s?xt(t):t;for(;it(n)&&!jt(n);){let a=rt(n),l=Vt(n),d=r?r.position:s?"fixed":"";!l&&(d==="fixed"||d==="absolute"&&a.position==="static")?i=i.filter(p=>p!==n):r=a,n=xt(n)}return e.set(t,i),i}function cs(t){let{element:e,boundary:o,rootBoundary:i,strategy:r}=t,n=[...o==="clippingAncestors"?ue(e)?[]:ls(e,this._c):[].concat(o),i],a=ji(e,n[0],r),l=a.top,d=a.right,h=a.bottom,p=a.left;for(let m=1;m<n.length;m++){let f=ji(e,n[m],r);l=ot(f.top,l),d=at(f.right,d),h=at(f.bottom,h),p=ot(f.left,p)}return{width:d-p,height:h-l,x:p,y:l}}function ds(t){let{width:e,height:o}=Xi(t);return{width:e,height:o}}function hs(t,e,o){let i=gt(e),r=dt(e),s=o==="fixed",n=Ht(t,!0,s,e),a={scrollLeft:0,scrollTop:0},l=lt(0);if((i||!s)&&((Nt(e)!=="body"||pe(r))&&(a=fe(e)),i)){let m=Ht(e,!0,s,e);l.x=m.x+e.clientLeft,l.y=m.y+e.clientTop}!i&&r&&(l.x=He(r));let d=r&&!i&&!s?Gi(r,a):lt(0),h=n.left+a.scrollLeft-l.x-d.x,p=n.top+a.scrollTop-l.y-d.y;return{x:h,y:p,width:n.width,height:n.height}}function go(t){return rt(t).position==="static"}function Ki(t,e){if(!gt(t)||rt(t).position==="fixed")return null;if(e)return e(t);let o=t.offsetParent;return dt(t)===o&&(o=o.ownerDocument.body),o}function Zi(t,e){let o=U(t);if(ue(t))return o;if(!gt(t)){let r=xt(t);for(;r&&!jt(r);){if(it(r)&&!go(r))return r;r=xt(r)}return o}let i=Ki(t,e);for(;i&&Wi(i)&&go(i);)i=Ki(i,e);return i&&jt(i)&&go(i)&&!Vt(i)?o:i||qi(t)||o}var ps=async function(t){let e=this.getOffsetParent||Zi,o=this.getDimensions,i=await o(t.floating);return{reference:hs(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,width:i.width,height:i.height}}};function us(t){return rt(t).direction==="rtl"}var me={convertOffsetParentRelativeRectToViewportRelativeRect:os,getDocumentElement:dt,getClippingRect:cs,getOffsetParent:Zi,getElementRects:ps,getClientRects:is,getDimensions:ds,getScale:Kt,isElement:it,isRTL:us};function Ji(t,e){return t.x===e.x&&t.y===e.y&&t.width===e.width&&t.height===e.height}function fs(t,e,o){let i=null,r,s=dt(t);function n(){var h;clearTimeout(r),(h=i)==null||h.disconnect(),i=null}function a(h,p){h===void 0&&(h=!1),p===void 0&&(p=1),n();let m=t.getBoundingClientRect(),{left:f,top:g,width:b,height:y}=m;if(h||e(),!b||!y)return;let v=he(g),_=he(s.clientWidth-(f+b)),$=he(s.clientHeight-(g+y)),E=he(f),P={rootMargin:-v+"px "+-_+"px "+-$+"px "+-E+"px",threshold:ot(0,at(1,p))||1},q=!0;function J(st){let F=st[0].intersectionRatio;if(!Ji(m,t.getBoundingClientRect()))return a();if(F!==p){if(!q)return a();F?a(!1,F):r=setTimeout(()=>{a(!1,1e-7)},1e3)}q=!1}try{i=new IntersectionObserver(J,{...P,root:s.ownerDocument})}catch{i=new IntersectionObserver(J,P)}i.observe(t)}let l=U(t),d=()=>a(o);return l.addEventListener("resize",d),a(!0),()=>{l.removeEventListener("resize",d),n()}}function Qi(t,e,o,i){i===void 0&&(i={});let{ancestorScroll:r=!0,ancestorResize:s=!0,elementResize:n=typeof ResizeObserver=="function",layoutShift:a=typeof IntersectionObserver=="function",animationFrame:l=!1}=i,d=bo(t),h=r||s?[...d?qt(d):[],...e?qt(e):[]]:[];h.forEach(v=>{r&&v.addEventListener("scroll",o),s&&v.addEventListener("resize",o)});let p=d&&a?fs(d,o,s):null,m=-1,f=null;n&&(f=new ResizeObserver(v=>{let[_]=v;_&&_.target===d&&f&&e&&(f.unobserve(e),cancelAnimationFrame(m),m=requestAnimationFrame(()=>{var $;($=f)==null||$.observe(e)})),o()}),d&&!l&&f.observe(d),e&&f.observe(e));let g,b=l?Ht(t):null;l&&y();function y(){let v=Ht(t);b&&!Ji(b,v)&&o(),b=v,g=requestAnimationFrame(y)}return o(),()=>{var v;h.forEach(_=>{r&&_.removeEventListener("scroll",o),s&&_.removeEventListener("resize",o)}),p?.(),(v=f)==null||v.disconnect(),f=null,l&&cancelAnimationFrame(g)}}var tr=Ni;var er=Hi,or=Mi,vo=Fi;var ir=Bi;var rr=(t,e,o)=>{let i=new Map,r=o??{},s={...me,...r.platform,_c:i};return Di(t,e,{...r,platform:s})};function sr(t){return ms(t)}function yo(t){return t.assignedSlot?t.assignedSlot:t.parentNode instanceof ShadowRoot?t.parentNode.host:t.parentNode}function ms(t){for(let e=t;e;e=yo(e))if(e instanceof Element&&getComputedStyle(e).display==="none")return null;for(let e=yo(t);e;e=yo(e)){if(!(e instanceof Element))continue;let o=getComputedStyle(e);if(o.display!=="contents"&&(o.position!=="static"||Vt(o)||e.tagName==="BODY"))return e}return null}function gs(t){return t!==null&&typeof t=="object"&&"getBoundingClientRect"in t&&("contextElement"in t?t.contextElement instanceof Element:!0)}var A=class extends S{constructor(){super(...arguments),this.localize=new V(this),this.active=!1,this.placement="top",this.strategy="absolute",this.distance=0,this.skidding=0,this.arrow=!1,this.arrowPlacement="anchor",this.arrowPadding=10,this.flip=!1,this.flipFallbackPlacements="",this.flipFallbackStrategy="best-fit",this.flipPadding=0,this.shift=!1,this.shiftPadding=0,this.autoSizePadding=0,this.hoverBridge=!1,this.updateHoverBridge=()=>{if(this.hoverBridge&&this.anchorEl){let t=this.anchorEl.getBoundingClientRect(),e=this.popup.getBoundingClientRect(),o=this.placement.includes("top")||this.placement.includes("bottom"),i=0,r=0,s=0,n=0,a=0,l=0,d=0,h=0;o?t.top<e.top?(i=t.left,r=t.bottom,s=t.right,n=t.bottom,a=e.left,l=e.top,d=e.right,h=e.top):(i=e.left,r=e.bottom,s=e.right,n=e.bottom,a=t.left,l=t.top,d=t.right,h=t.top):t.left<e.left?(i=t.right,r=t.top,s=e.left,n=e.top,a=t.right,l=t.bottom,d=e.left,h=e.bottom):(i=e.right,r=e.top,s=t.left,n=t.top,a=e.right,l=e.bottom,d=t.left,h=t.bottom),this.style.setProperty("--hover-bridge-top-left-x",`${i}px`),this.style.setProperty("--hover-bridge-top-left-y",`${r}px`),this.style.setProperty("--hover-bridge-top-right-x",`${s}px`),this.style.setProperty("--hover-bridge-top-right-y",`${n}px`),this.style.setProperty("--hover-bridge-bottom-left-x",`${a}px`),this.style.setProperty("--hover-bridge-bottom-left-y",`${l}px`),this.style.setProperty("--hover-bridge-bottom-right-x",`${d}px`),this.style.setProperty("--hover-bridge-bottom-right-y",`${h}px`)}}}async connectedCallback(){super.connectedCallback(),await this.updateComplete,this.start()}disconnectedCallback(){super.disconnectedCallback(),this.stop()}async updated(t){super.updated(t),t.has("active")&&(this.active?this.start():this.stop()),t.has("anchor")&&this.handleAnchorChange(),this.active&&(await this.updateComplete,this.reposition())}async handleAnchorChange(){if(await this.stop(),this.anchor&&typeof this.anchor=="string"){let t=this.getRootNode();this.anchorEl=t.getElementById(this.anchor)}else this.anchor instanceof Element||gs(this.anchor)?this.anchorEl=this.anchor:this.anchorEl=this.querySelector('[slot="anchor"]');this.anchorEl instanceof HTMLSlotElement&&(this.anchorEl=this.anchorEl.assignedElements({flatten:!0})[0]),this.anchorEl&&this.active&&this.start()}start(){!this.anchorEl||!this.active||(this.cleanup=Qi(this.anchorEl,this.popup,()=>{this.reposition()}))}async stop(){return new Promise(t=>{this.cleanup?(this.cleanup(),this.cleanup=void 0,this.removeAttribute("data-current-placement"),this.style.removeProperty("--auto-size-available-width"),this.style.removeProperty("--auto-size-available-height"),requestAnimationFrame(()=>t())):t()})}reposition(){if(!this.active||!this.anchorEl)return;let t=[tr({mainAxis:this.distance,crossAxis:this.skidding})];this.sync?t.push(vo({apply:({rects:o})=>{let i=this.sync==="width"||this.sync==="both",r=this.sync==="height"||this.sync==="both";this.popup.style.width=i?`${o.reference.width}px`:"",this.popup.style.height=r?`${o.reference.height}px`:""}})):(this.popup.style.width="",this.popup.style.height=""),this.flip&&t.push(or({boundary:this.flipBoundary,fallbackPlacements:this.flipFallbackPlacements,fallbackStrategy:this.flipFallbackStrategy==="best-fit"?"bestFit":"initialPlacement",padding:this.flipPadding})),this.shift&&t.push(er({boundary:this.shiftBoundary,padding:this.shiftPadding})),this.autoSize?t.push(vo({boundary:this.autoSizeBoundary,padding:this.autoSizePadding,apply:({availableWidth:o,availableHeight:i})=>{this.autoSize==="vertical"||this.autoSize==="both"?this.style.setProperty("--auto-size-available-height",`${i}px`):this.style.removeProperty("--auto-size-available-height"),this.autoSize==="horizontal"||this.autoSize==="both"?this.style.setProperty("--auto-size-available-width",`${o}px`):this.style.removeProperty("--auto-size-available-width")}})):(this.style.removeProperty("--auto-size-available-width"),this.style.removeProperty("--auto-size-available-height")),this.arrow&&t.push(ir({element:this.arrowEl,padding:this.arrowPadding}));let e=this.strategy==="absolute"?o=>me.getOffsetParent(o,sr):me.getOffsetParent;rr(this.anchorEl,this.popup,{placement:this.placement,middleware:t,strategy:this.strategy,platform:Ft(K({},me),{getOffsetParent:e})}).then(({x:o,y:i,middlewareData:r,placement:s})=>{let n=this.localize.dir()==="rtl",a={top:"bottom",right:"left",bottom:"top",left:"right"}[s.split("-")[0]];if(this.setAttribute("data-current-placement",s),Object.assign(this.popup.style,{left:`${o}px`,top:`${i}px`}),this.arrow){let l=r.arrow.x,d=r.arrow.y,h="",p="",m="",f="";if(this.arrowPlacement==="start"){let g=typeof l=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"";h=typeof d=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"",p=n?g:"",f=n?"":g}else if(this.arrowPlacement==="end"){let g=typeof l=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"";p=n?"":g,f=n?g:"",m=typeof d=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:""}else this.arrowPlacement==="center"?(f=typeof l=="number"?"calc(50% - var(--arrow-size-diagonal))":"",h=typeof d=="number"?"calc(50% - var(--arrow-size-diagonal))":""):(f=typeof l=="number"?`${l}px`:"",h=typeof d=="number"?`${d}px`:"");Object.assign(this.arrowEl.style,{top:h,right:p,bottom:m,left:f,[a]:"calc(var(--arrow-size-diagonal) * -1)"})}}),requestAnimationFrame(()=>this.updateHoverBridge()),this.emit("sl-reposition")}render(){return x`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>

      <span
        part="hover-bridge"
        class=${L({"popup-hover-bridge":!0,"popup-hover-bridge--visible":this.hoverBridge&&this.active})}
      ></span>

      <div
        part="popup"
        class=${L({popup:!0,"popup--active":this.active,"popup--fixed":this.strategy==="fixed","popup--has-arrow":this.arrow})}
      >
        <slot></slot>
        ${this.arrow?x`<div part="arrow" class="popup__arrow" role="presentation"></div>`:""}
      </div>
    `}};A.styles=[O,Ei];c([w(".popup")],A.prototype,"popup",2);c([w(".popup__arrow")],A.prototype,"arrowEl",2);c([u()],A.prototype,"anchor",2);c([u({type:Boolean,reflect:!0})],A.prototype,"active",2);c([u({reflect:!0})],A.prototype,"placement",2);c([u({reflect:!0})],A.prototype,"strategy",2);c([u({type:Number})],A.prototype,"distance",2);c([u({type:Number})],A.prototype,"skidding",2);c([u({type:Boolean})],A.prototype,"arrow",2);c([u({attribute:"arrow-placement"})],A.prototype,"arrowPlacement",2);c([u({attribute:"arrow-padding",type:Number})],A.prototype,"arrowPadding",2);c([u({type:Boolean})],A.prototype,"flip",2);c([u({attribute:"flip-fallback-placements",converter:{fromAttribute:t=>t.split(" ").map(e=>e.trim()).filter(e=>e!==""),toAttribute:t=>t.join(" ")}})],A.prototype,"flipFallbackPlacements",2);c([u({attribute:"flip-fallback-strategy"})],A.prototype,"flipFallbackStrategy",2);c([u({type:Object})],A.prototype,"flipBoundary",2);c([u({attribute:"flip-padding",type:Number})],A.prototype,"flipPadding",2);c([u({type:Boolean})],A.prototype,"shift",2);c([u({type:Object})],A.prototype,"shiftBoundary",2);c([u({attribute:"shift-padding",type:Number})],A.prototype,"shiftPadding",2);c([u({attribute:"auto-size"})],A.prototype,"autoSize",2);c([u()],A.prototype,"sync",2);c([u({type:Object})],A.prototype,"autoSizeBoundary",2);c([u({attribute:"auto-size-padding",type:Number})],A.prototype,"autoSizePadding",2);c([u({attribute:"hover-bridge",type:Boolean})],A.prototype,"hoverBridge",2);var N=class extends S{constructor(){super(),this.localize=new V(this),this.content="",this.placement="top",this.disabled=!1,this.distance=8,this.open=!1,this.skidding=0,this.trigger="hover focus",this.hoist=!1,this.handleBlur=()=>{this.hasTrigger("focus")&&this.hide()},this.handleClick=()=>{this.hasTrigger("click")&&(this.open?this.hide():this.show())},this.handleFocus=()=>{this.hasTrigger("focus")&&this.show()},this.handleDocumentKeyDown=t=>{t.key==="Escape"&&(t.stopPropagation(),this.hide())},this.handleMouseOver=()=>{if(this.hasTrigger("hover")){let t=to(getComputedStyle(this).getPropertyValue("--show-delay"));clearTimeout(this.hoverTimeout),this.hoverTimeout=window.setTimeout(()=>this.show(),t)}},this.handleMouseOut=()=>{if(this.hasTrigger("hover")){let t=to(getComputedStyle(this).getPropertyValue("--hide-delay"));clearTimeout(this.hoverTimeout),this.hoverTimeout=window.setTimeout(()=>this.hide(),t)}},this.addEventListener("blur",this.handleBlur,!0),this.addEventListener("focus",this.handleFocus,!0),this.addEventListener("click",this.handleClick),this.addEventListener("mouseover",this.handleMouseOver),this.addEventListener("mouseout",this.handleMouseOut)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this.closeWatcher)==null||t.destroy(),document.removeEventListener("keydown",this.handleDocumentKeyDown)}firstUpdated(){this.body.hidden=!this.open,this.open&&(this.popup.active=!0,this.popup.reposition())}hasTrigger(t){return this.trigger.split(" ").includes(t)}async handleOpenChange(){var t,e;if(this.open){if(this.disabled)return;this.emit("sl-show"),"CloseWatcher"in window?((t=this.closeWatcher)==null||t.destroy(),this.closeWatcher=new CloseWatcher,this.closeWatcher.onclose=()=>{this.hide()}):document.addEventListener("keydown",this.handleDocumentKeyDown),await I(this.body),this.body.hidden=!1,this.popup.active=!0;let{keyframes:o,options:i}=D(this,"tooltip.show",{dir:this.localize.dir()});await B(this.popup.popup,o,i),this.popup.reposition(),this.emit("sl-after-show")}else{this.emit("sl-hide"),(e=this.closeWatcher)==null||e.destroy(),document.removeEventListener("keydown",this.handleDocumentKeyDown),await I(this.body);let{keyframes:o,options:i}=D(this,"tooltip.hide",{dir:this.localize.dir()});await B(this.popup.popup,o,i),this.popup.active=!1,this.body.hidden=!0,this.emit("sl-after-hide")}}async handleOptionsChange(){this.hasUpdated&&(await this.updateComplete,this.popup.reposition())}handleDisabledChange(){this.disabled&&this.open&&this.hide()}async show(){if(!this.open)return this.open=!0,X(this,"sl-after-show")}async hide(){if(this.open)return this.open=!1,X(this,"sl-after-hide")}render(){return x`
      <sl-popup
        part="base"
        exportparts="
          popup:base__popup,
          arrow:base__arrow
        "
        class=${L({tooltip:!0,"tooltip--open":this.open})}
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        strategy=${this.hoist?"fixed":"absolute"}
        flip
        shift
        arrow
        hover-bridge
      >
        ${""}
        <slot slot="anchor" aria-describedby="tooltip"></slot>

        ${""}
        <div part="body" id="tooltip" class="tooltip__body" role="tooltip" aria-live=${this.open?"polite":"off"}>
          <slot name="content">${this.content}</slot>
        </div>
      </sl-popup>
    `}};N.styles=[O,Ci];N.dependencies={"sl-popup":A};c([w("slot:not([name])")],N.prototype,"defaultSlot",2);c([w(".tooltip__body")],N.prototype,"body",2);c([w("sl-popup")],N.prototype,"popup",2);c([u()],N.prototype,"content",2);c([u()],N.prototype,"placement",2);c([u({type:Boolean,reflect:!0})],N.prototype,"disabled",2);c([u({type:Number})],N.prototype,"distance",2);c([u({type:Boolean,reflect:!0})],N.prototype,"open",2);c([u({type:Number})],N.prototype,"skidding",2);c([u()],N.prototype,"trigger",2);c([u({type:Boolean})],N.prototype,"hoist",2);c([T("open",{waitUntilFirstUpdate:!0})],N.prototype,"handleOpenChange",1);c([T(["content","distance","hoist","placement","skidding"])],N.prototype,"handleOptionsChange",1);c([T("disabled")],N.prototype,"handleDisabledChange",1);k("tooltip.show",{keyframes:[{opacity:0,scale:.8},{opacity:1,scale:1}],options:{duration:150,easing:"ease"}});k("tooltip.hide",{keyframes:[{opacity:1,scale:1},{opacity:0,scale:.8}],options:{duration:150,easing:"ease"}});N.define("sl-tooltip");Gt(new URL(".",import.meta.url).href.replace(/\/$/,""));
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
lit-html/static.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
lit-html/directives/if-defined.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
