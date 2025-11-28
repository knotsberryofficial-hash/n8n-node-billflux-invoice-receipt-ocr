var e=class extends Error{constructor(e){super(e),this.name=`Eta Error`}},t=class extends e{constructor(e){super(e),this.name=`EtaParser Error`}},n=class extends e{constructor(e){super(e),this.name=`EtaRuntime Error`}},r=class extends e{constructor(e){super(e),this.name=`EtaNameResolution Error`}};function i(e,n,r){let i=n.slice(0,r).split(/\n/),a=i.length,o=i[a-1].length+1;throw e+=` at line `+a+` col `+o+`:

  `+n.split(/\n/)[a-1]+`
  `+Array(o).join(` `)+`^`,new t(e)}function a(e,t,r,i){let a=t.split(`
`),o=Math.max(r-3,0),s=Math.min(a.length,r+3),c=i,l=a.slice(o,s).map((e,t)=>{let n=t+o+1;return(n===r?` >> `:`    `)+n+`| `+e}).join(`
`),u=c?c+`:`+r+`
`:`line `+r+`
`,d=new n(u+l+`

`+e.message);throw d.name=e.name,d}const o=(async()=>{}).constructor;function s(e,n){let r=this.config,i=n?.async?o:Function;try{return new i(r.varName,`options`,this.compileToString.call(this,e,n))}catch(r){throw r instanceof SyntaxError?new t(`Bad template syntax

`+r.message+`
`+Array(r.message.length+1).join(`=`)+`
`+this.compileToString.call(this,e,n)+`
`):r}}function c(e,t){let n=this.config,r=t?.async,i=this.compileBody,a=this.parse.call(this,e),o=`${n.functionHeader}
let include = (template, data) => this.render(template, data, options);
let includeAsync = (template, data) => this.renderAsync(template, data, options);

let __eta = {res: "", e: this.config.escapeFunction, f: this.config.filterFunction${n.debug?`, line: 1, templateStr: "`+e.replace(/\\|"/g,`\\$&`).replace(/\r\n|\n|\r/g,`\\n`)+`"`:``}};

function layout(path, data) {
  __eta.layout = path;
  __eta.layoutData = data;
}${n.debug?`try {`:``}${n.useWith?`with(`+n.varName+`||{}){`:``}

${i.call(this,a)}
if (__eta.layout) {
  __eta.res = ${r?`await includeAsync`:`include`} (__eta.layout, {...${n.varName}, body: __eta.res, ...__eta.layoutData});
}
${n.useWith?`}`:``}${n.debug?`} catch (e) { this.RuntimeErr(e, __eta.templateStr, __eta.line, options.filepath) }`:``}
return __eta.res;
`;if(n.plugins)for(let e=0;e<n.plugins.length;e++){let t=n.plugins[e];t.processFnString&&(o=t.processFnString(o,n))}return o}function l(e){let t=this.config,n=0,r=e.length,i=``;for(;n<r;n++){let r=e[n];if(typeof r==`string`)i+=`__eta.res+='`+r+`'
`;else{let e=r.t,n=r.val||``;t.debug&&(i+=`__eta.line=`+r.lineNo+`
`),e===`r`?(t.autoFilter&&(n=`__eta.f(`+n+`)`),i+=`__eta.res+=`+n+`
`):e===`i`?(t.autoFilter&&(n=`__eta.f(`+n+`)`),t.autoEscape&&(n=`__eta.e(`+n+`)`),i+=`__eta.res+=`+n+`
`):e===`e`&&(i+=n+`
`)}}return i}function u(e,t,n,r){let i,a;return Array.isArray(t.autoTrim)?(i=t.autoTrim[1],a=t.autoTrim[0]):i=a=t.autoTrim,(n||n===!1)&&(i=n),(r||r===!1)&&(a=r),!a&&!i?e:i===`slurp`&&a===`slurp`?e.trim():(i===`_`||i===`slurp`?e=e.trimStart():(i===`-`||i===`nl`)&&(e=e.replace(/^(?:\r\n|\n|\r)/,``)),a===`_`||a===`slurp`?e=e.trimEnd():(a===`-`||a===`nl`)&&(e=e.replace(/(?:\r\n|\n|\r)$/,``)),e)}const d={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`};function f(e){return d[e]}function p(e){let t=String(e);return/[&<>"']/.test(t)?t.replace(/[&<>"']/g,f):t}const m={autoEscape:!0,autoFilter:!1,autoTrim:[!1,`nl`],cache:!1,cacheFilepaths:!0,debug:!1,escapeFunction:p,filterFunction:e=>String(e),functionHeader:``,parse:{exec:``,interpolate:`=`,raw:`~`},plugins:[],rmWhitespace:!1,tags:[`<%`,`%>`],useWith:!1,varName:`it`,defaultExtension:`.eta`},h=/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})*}|(?!\${)[^\\`])*`/g,g=/'(?:\\[\s\w"'\\`]|[^\n\r'\\])*?'/g,_=/"(?:\\[\s\w"'\\`]|[^\n\r"\\])*?"/g;function v(e){return e.replace(/[.*+\-?^${}()|[\]\\]/g,`\\$&`)}function y(e,t){return e.slice(0,t).split(`
`).length}function b(e){let t=this.config,n=[],r=!1,a=0,o=t.parse;if(t.plugins)for(let n=0;n<t.plugins.length;n++){let r=t.plugins[n];r.processTemplate&&(e=r.processTemplate(e,t))}t.rmWhitespace&&(e=e.replace(/[\r\n]+/g,`
`).replace(/^\s+|\s+$/gm,``)),h.lastIndex=0,g.lastIndex=0,_.lastIndex=0;function s(e,i){e&&(e=u(e,t,r,i),e&&(e=e.replace(/\\|'/g,`\\$&`).replace(/\r\n|\n|\r/g,`\\n`),n.push(e)))}let c=[o.exec,o.interpolate,o.raw].reduce((e,t)=>e&&t?e+`|`+v(t):t?v(t):e,``),l=RegExp(v(t.tags[0])+`(-|_)?\\s*(`+c+`)?\\s*`,`g`),d=RegExp(`'|"|\`|\\/\\*|(\\s*(-|_)?`+v(t.tags[1])+`)`,`g`),f;for(;f=l.exec(e);){let c=e.slice(a,f.index);a=f[0].length+f.index;let u=f[1],p=f[2]||``;s(c,u),d.lastIndex=a;let m,v=!1;for(;m=d.exec(e);)if(m[1]){let t=e.slice(a,m.index);l.lastIndex=a=d.lastIndex,r=m[2],v={t:p===o.exec?`e`:p===o.raw?`r`:p===o.interpolate?`i`:``,val:t};break}else{let t=m[0];if(t===`/*`){let t=e.indexOf(`*/`,d.lastIndex);t===-1&&i(`unclosed comment`,e,m.index),d.lastIndex=t}else t===`'`?(g.lastIndex=m.index,g.exec(e)?d.lastIndex=g.lastIndex:i(`unclosed string`,e,m.index)):t===`"`?(_.lastIndex=m.index,_.exec(e)?d.lastIndex=_.lastIndex:i(`unclosed string`,e,m.index)):t==="`"&&(h.lastIndex=m.index,h.exec(e)?d.lastIndex=h.lastIndex:i(`unclosed string`,e,m.index))}v?(t.debug&&(v.lineNo=y(e,f.index)),n.push(v)):i(`unclosed tag`,e,f.index)}if(s(e.slice(a,e.length),!1),t.plugins)for(let e=0;e<t.plugins.length;e++){let r=t.plugins[e];r.processAST&&(n=r.processAST(n,t))}return n}function x(e,t){let n=t?.async?this.templatesAsync:this.templatesSync;if(this.resolvePath&&this.readFile&&!e.startsWith(`@`)){let e=t.filepath,r=n.get(e);if(this.config.cache&&r)return r;{let r=this.readFile(e),i=this.compile(r,t);return this.config.cache&&n.define(e,i),i}}else{let t=n.get(e);if(t)return t;throw new r(`Failed to get template '${e}'`)}}function S(e,t,n){let r,i={...n,async:!1};return typeof e==`string`?(this.resolvePath&&this.readFile&&!e.startsWith(`@`)&&(i.filepath=this.resolvePath(e,i)),r=x.call(this,e,i)):r=e,r.call(this,t,i)}function C(e,t,n){let r,i={...n,async:!0};typeof e==`string`?(this.resolvePath&&this.readFile&&!e.startsWith(`@`)&&(i.filepath=this.resolvePath(e,i)),r=x.call(this,e,i)):r=e;let a=r.call(this,t,i);return Promise.resolve(a)}function w(e,t){let n=this.compile(e,{async:!1});return S.call(this,n,t)}function T(e,t){let n=this.compile(e,{async:!0});return C.call(this,n,t)}var E=class{constructor(e){this.cache=e}define(e,t){this.cache[e]=t}get(e){return this.cache[e]}remove(e){delete this.cache[e]}reset(){this.cache={}}load(e){this.cache={...this.cache,...e}}},D=class{constructor(e){e?this.config={...m,...e}:this.config={...m}}config;RuntimeErr=a;compile=s;compileToString=c;compileBody=l;parse=b;render=S;renderAsync=C;renderString=w;renderStringAsync=T;filepathCache={};templatesSync=new E({});templatesAsync=new E({});resolvePath=null;readFile=null;configure(e){this.config={...this.config,...e}}withConfig(e){return{...this,config:{...this.config,...e}}}loadTemplate(e,t,n){if(typeof t==`string`)(n?.async?this.templatesAsync:this.templatesSync).define(e,this.compile(t,n));else{let r=this.templatesSync;(t.constructor.name===`AsyncFunction`||n?.async)&&(r=this.templatesAsync),r.define(e,t)}}},O=class extends D{};export{O as Eta};
//# sourceMappingURL=core.js.map