this.CotizadorWidget=(function(){"use strict";const L="https://cotizadorpremium.cl",T="cotizaloantes",U=["region","edad","sexo","ingreso","cargas","q","precioMin","precioMax","isapres","zonas","tipoPlan","coberturaH","coberturaA","orden","moneda","auto","email","plan","vista","nombre","rut","telefono"];function n(t,e,i){const o=t.dataset[i];if(o!=null&&o.trim())return o.trim();const a=e==null?void 0:e.dataset[i];if(a!=null&&a.trim())return a.trim()}function B(t){const e=((t==null?void 0:t.trim())||L).replace(/\/+$/,"");try{return new URL(e).origin+new URL(e).pathname.replace(/\/+$/,"")}catch{return L}}function k(t){if(!(t!=null&&t.trim()))return;const e=Number.parseInt(t,10);if(!(!Number.isFinite(e)||e<1))return e}function O(t,e){const i=n(t,e,"fullWidth")??n(t,e,"full-width");return i?i==="true"||i==="1":!0}function G(t,e,i){return i.agentKey??n(t,e,"agentKey")??n(t,e,"agent-key")??i.partner??n(t,e,"partner")??T}function W(t,e,i){if(i.mobileScroll!==void 0)return i.mobileScroll;const o=n(t,e,"mobileScroll")??n(t,e,"mobile-scroll");return!o||o==="auto"?"auto":o==="false"||o==="0"?!1:o==="true"||o==="1"}function N(t,e,i){const o=i.routing??n(t,e,"routing")??n(t,e,"cotizadorRouting");if(o==="premium"||o==="legacy")return o}function q(t,e){const i={};for(const a of U){const s=n(t,e,a);s&&(i[a]=s)}const o=n(t,e,"autoSearch");return(o==="true"||o==="1")&&(i.auto="1"),i}function K(t,e,i={}){const o=B(i.baseUrl??n(t,e,"baseUrl")??n(t,e,"cotizadorUrl")),a=G(t,e,i),s=i.partner??a,p=N(t,e,i),y=i.minHeight??k(n(t,e,"minHeight")),v=i.title??n(t,e,"title")??"Cotizador de planes de salud",S=i.fullWidth??O(t,e),x=W(t,e,i),w={...q(t,e),...i.query};return{baseUrl:o,agentKey:a,partner:s,routing:p,minHeight:y,title:v,fullWidth:S,mobileScroll:x,query:w}}function V(t){const e=t.routing!=="legacy",i=e?new URL("/cotizador",`${t.baseUrl}/`):new URL(t.partner?`/${encodeURIComponent(t.partner)}`:"/",`${t.baseUrl}/`);e&&i.searchParams.set("agent",t.agentKey),i.searchParams.set("embed","1");for(const[o,a]of Object.entries(t.query))i.searchParams.set(o,a);return i.toString()}function A(){const t=document.currentScript;if(t instanceof HTMLScriptElement)return t;const e=document.querySelectorAll('script[src*="cotizador-widget"]');return e[e.length-1]??null}const Y="[data-cotizador-widget]",$="cotizador-premium",F="cotizador-premium:resize",X="cotizador-premium:ready",Z="cotizador-premium:exit-navigate",j="cotizador-premium:wheel",Q="cotizador-premium:request-resize",c="cv-widget",h="cv-widget__iframe",m="cv-widget__skeleton",d="cv-widget__exit-overlay",f="cv-widget--mobile-scroll",J=72,tt=12,et=96,ot=800,it=12;function g(t){return t===!1||t==="auto"}function z(t){return t==="auto"?"auto":t===!1?"false":"true"}const rt=new Set([$,"cotizador-virtual"]);function nt(){return window.matchMedia("(max-width: 768px)").matches}function at(){if(document.getElementById("cv-widget-styles"))return;const t=document.createElement("style");t.id="cv-widget-styles",t.textContent=`
    .${c} {
      position: relative;
      width: 100%;
      max-width: none;
      overflow: visible;
      background: transparent;
      touch-action: pan-y;
    }
    .${c}[data-full-width="true"] {
      width: 100vw;
      max-width: 100vw;
      margin-left: calc(50% - 50vw);
      margin-right: calc(50% - 50vw);
    }
    .${c}[data-mobile-scroll="false"],
    .${c}[data-mobile-scroll="auto"] {
      overflow: visible !important;
      max-height: none !important;
    }
    .${c}[data-mobile-scroll="false"] .${h},
    .${c}[data-mobile-scroll="auto"] .${h} {
      overflow: visible;
      display: block;
    }
    .${c}.${f} {
      max-height: ${J}vh;
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior-y: auto;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
    }
    .${h} {
      display: block;
      width: 100%;
      max-width: none;
      border: 0;
      background: transparent;
      overflow: visible;
      opacity: 0;
      transition: opacity 0.25s ease, height 0.12s ease;
    }
    .${h}[data-ready="true"] {
      opacity: 1;
    }
    .${m} {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      color: #64748b;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
    .${m}[data-hidden="true"] {
      opacity: 0;
    }
    .${m}__pulse {
      width: min(100%, 420px);
      height: 12px;
      border-radius: 999px;
      background: linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%);
      background-size: 200% 100%;
      animation: cv-widget-pulse 1.2s ease-in-out infinite;
      margin-bottom: 12px;
    }
    @keyframes cv-widget-pulse {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
    .${d} {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(6px);
      color: #0f172a;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      text-align: center;
    }
    .${d}__spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 16px;
      border-radius: 999px;
      border: 2px solid rgba(15, 23, 42, 0.12);
      border-top-color: #ff6600;
      animation: cv-widget-spin 0.8s linear infinite;
    }
    .${d}__title {
      margin: 0 0 6px;
      font-size: 15px;
      font-weight: 700;
    }
    .${d}__subtitle {
      margin: 0;
      font-size: 13px;
      color: #64748b;
    }
    @keyframes cv-widget-spin {
      to { transform: rotate(360deg); }
    }
  `,document.head.appendChild(t)}function st(t,e){if(at(),t.dataset.cvMounted==="true")return{destroy:()=>{}};t.dataset.cvMounted="true",t.classList.add(c),e.fullWidth&&(t.dataset.fullWidth="true"),e.minHeight!==void 0&&t.style.setProperty("--cv-widget-min-height",`${e.minHeight}px`),t.dataset.mobileScroll=z(e.mobileScroll);const i=document.createElement("div");i.className=m,i.setAttribute("aria-hidden","true"),i.innerHTML=`
    <div style="width:100%;max-width:420px;text-align:center">
      <div class="${m}__pulse"></div>
      <div class="${m}__pulse" style="width:70%;margin-inline:auto"></div>
      <p style="margin:16px 0 0">Cargando cotizador…</p>
    </div>
  `;const o=document.createElement("iframe");o.className=h,o.title=e.title,o.loading="lazy",o.referrerPolicy="strict-origin-when-cross-origin",o.allow="clipboard-write",o.setAttribute("scrolling",g(e.mobileScroll)?"auto":"no"),o.style.overflow="visible",o.src=V(e);const a=e.minHeight??120;o.style.height=`${a}px`,t.style.height=`${a}px`,t.replaceChildren(i,o);let s=null,p=null;const y=()=>{if(g(e.mobileScroll)){t.classList.remove(f),t.dataset.mobileScroll=z(e.mobileScroll),t.style.maxHeight="none",t.style.overflow="visible",t.style.removeProperty("overflow-y");return}const l=nt();t.classList.toggle(f,l),t.dataset.mobileScroll=l?"true":"false",l?(t.style.removeProperty("max-height"),t.style.overflowY=""):(t.style.maxHeight="none",t.style.overflow="visible")},v=()=>{y()},S=()=>{s||(s=document.createElement("div"),s.className=d,s.setAttribute("role","status"),s.setAttribute("aria-live","polite"),s.setAttribute("aria-busy","true"),s.innerHTML=`
      <div style="max-width:420px">
        <div class="${d}__spinner"></div>
        <p class="${d}__title">Buscando el mejor plan para ti…</p>
        <p class="${d}__subtitle">Cargando el cotizador completo</p>
      </div>
    `,t.appendChild(s))},x=l=>{const r=e.minHeight??1,E=g(e.mobileScroll)?et:tt,b=Math.max(r,Math.ceil(l)+E);o.style.height=`${b}px`,o.style.minHeight=`${b}px`,o.style.maxHeight="none",o.setAttribute("height",String(b)),t.style.height=`${b}px`,t.style.minHeight=`${b}px`,t.style.maxHeight="none",y()},w=()=>{const l=o.contentWindow;l&&l.postMessage({type:Q,source:$},"*")};let u=null,R=0;const C=()=>{u===null&&(u=window.setInterval(()=>{R+=1,w(),R>=it&&u!==null&&(window.clearInterval(u),u=null)},ot))},D=()=>{u!==null&&(window.clearInterval(u),u=null)},M=()=>{o.dataset.ready="true",i.dataset.hidden="true",window.setTimeout(()=>i.remove(),220)},ct=(l,r)=>{const E={top:l,left:r,behavior:"auto"};if(g(e.mobileScroll)){window.scrollBy(E);return}if(t.classList.contains(f)){t.scrollBy(E);return}window.scrollBy(E)},P=l=>{if(l.source!==o.contentWindow)return;const r=l.data;if(!(!(r!=null&&r.source)||!rt.has(r.source))){if(r.type===j){if(typeof r.deltaY!="number"||typeof r.deltaX!="number")return;ct(r.deltaY,r.deltaX);return}if(r.type===Z){S();return}if(r.type===X){M();return}r.type===F&&typeof r.height=="number"&&(x(r.height),D(),o.dataset.ready!=="true"&&M())}};return window.addEventListener("message",P),y(),C(),!g(e.mobileScroll)&&typeof window.matchMedia=="function"&&(p=window.matchMedia("(max-width: 768px)"),p.addEventListener("change",v)),o.addEventListener("load",()=>{C(),w(),o.dataset.ready!=="true"&&M()}),{destroy:()=>{D(),window.removeEventListener("message",P),p==null||p.removeEventListener("change",v),t.replaceChildren(),t.classList.remove(c,f),delete t.dataset.cvMounted,delete t.dataset.fullWidth,delete t.dataset.mobileScroll,t.style.removeProperty("--cv-widget-min-height"),t.style.removeProperty("height"),t.style.removeProperty("max-height"),t.style.removeProperty("overflow")}}}function I(t,e,i){const o=K(t,e,i);return st(t,o)}function _(t=Y){const e=A(),i=document.querySelectorAll(t);return Array.from(i).map(o=>I(o,e))}function lt(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>_(),{once:!0}):_()}const H={init:_,mount:(t,e)=>I(t,A(),e)};return window.CotizadorWidget=H,lt(),H})();
//# sourceMappingURL=cotizador-widget.js.map
