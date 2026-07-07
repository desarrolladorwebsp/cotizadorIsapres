this.CotizadorWidget=(function(){"use strict";const _="https://cotizadorpremium.cl",A="cotizaloantes",$=["region","edad","sexo","ingreso","cargas","q","precioMin","precioMax","isapres","zonas","tipoPlan","coberturaH","coberturaA","orden","moneda","auto","email","plan","vista","nombre","rut","telefono"];function r(t,e,i){const o=t.dataset[i];if(o!=null&&o.trim())return o.trim();const n=e==null?void 0:e.dataset[i];if(n!=null&&n.trim())return n.trim()}function z(t){const e=((t==null?void 0:t.trim())||_).replace(/\/+$/,"");try{return new URL(e).origin+new URL(e).pathname.replace(/\/+$/,"")}catch{return _}}function H(t){if(!(t!=null&&t.trim()))return;const e=Number.parseInt(t,10);if(!(!Number.isFinite(e)||e<1))return e}function C(t,e){const i=r(t,e,"fullWidth")??r(t,e,"full-width");return i?i==="true"||i==="1":!0}function U(t,e,i){return i.agentKey??r(t,e,"agentKey")??r(t,e,"agent-key")??i.partner??r(t,e,"partner")??A}function I(t,e,i){const o=i.routing??r(t,e,"routing")??r(t,e,"cotizadorRouting");if(o==="premium"||o==="legacy")return o}function R(t,e){const i={};for(const n of $){const a=r(t,e,n);a&&(i[n]=a)}const o=r(t,e,"autoSearch");return(o==="true"||o==="1")&&(i.auto="1"),i}function k(t,e,i={}){const o=z(i.baseUrl??r(t,e,"baseUrl")??r(t,e,"cotizadorUrl")),n=U(t,e,i),a=i.partner??n,l=I(t,e,i),g=i.minHeight??H(r(t,e,"minHeight")),h=i.title??r(t,e,"title")??"Cotizador de planes de salud",w=i.fullWidth??C(t,e),E={...R(t,e),...i.query};return{baseUrl:o,agentKey:n,partner:a,routing:l,minHeight:g,title:h,fullWidth:w,query:E}}function D(t){const e=t.routing!=="legacy",i=e?new URL("/cotizador",`${t.baseUrl}/`):new URL(t.partner?`/${encodeURIComponent(t.partner)}`:"/",`${t.baseUrl}/`);e&&i.searchParams.set("agent",t.agentKey),i.searchParams.set("embed","1");for(const[o,n]of Object.entries(t.query))i.searchParams.set(o,n);return i.toString()}function x(){const t=document.currentScript;if(t instanceof HTMLScriptElement)return t;const e=document.querySelectorAll('script[src*="cotizador-widget"]');return e[e.length-1]??null}const T="[data-cotizador-widget]",B="cotizador-premium",O="cotizador-premium:resize",P="cotizador-premium:ready",W="cotizador-premium:exit-navigate",p="cv-widget",y="cv-widget__iframe",u="cv-widget__skeleton",d="cv-widget__exit-overlay",f="cv-widget--mobile-scroll",G=72,N=new Set([B,"cotizador-virtual"]);function K(){return window.matchMedia("(max-width: 768px)").matches}function q(){if(document.getElementById("cv-widget-styles"))return;const t=document.createElement("style");t.id="cv-widget-styles",t.textContent=`
    .${p} {
      position: relative;
      width: 100%;
      max-width: none;
      overflow: visible;
      background: transparent;
    }
    .${p}[data-full-width="true"] {
      width: 100vw;
      max-width: 100vw;
      margin-left: calc(50% - 50vw);
      margin-right: calc(50% - 50vw);
    }
    .${p}.${f} {
      max-height: ${G}vh;
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior-y: auto;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
    }
    .${y} {
      display: block;
      width: 100%;
      max-width: none;
      border: 0;
      background: transparent;
      overflow: visible;
      opacity: 0;
      transition: opacity 0.25s ease, height 0.12s ease;
    }
    .${y}[data-ready="true"] {
      opacity: 1;
    }
    .${u} {
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
    .${u}[data-hidden="true"] {
      opacity: 0;
    }
    .${u}__pulse {
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
  `,document.head.appendChild(t)}function F(t,e){if(q(),t.dataset.cvMounted==="true")return{destroy:()=>{}};t.dataset.cvMounted="true",t.classList.add(p),e.fullWidth&&(t.dataset.fullWidth="true"),e.minHeight!==void 0&&t.style.setProperty("--cv-widget-min-height",`${e.minHeight}px`);const i=document.createElement("div");i.className=u,i.setAttribute("aria-hidden","true"),i.innerHTML=`
    <div style="width:100%;max-width:420px;text-align:center">
      <div class="${u}__pulse"></div>
      <div class="${u}__pulse" style="width:70%;margin-inline:auto"></div>
      <p style="margin:16px 0 0">Cargando cotizador…</p>
    </div>
  `;const o=document.createElement("iframe");o.className=y,o.title=e.title,o.loading="lazy",o.referrerPolicy="strict-origin-when-cross-origin",o.allow="clipboard-write",o.setAttribute("scrolling","no"),o.style.overflow="visible",o.src=D(e);const n=e.minHeight??120;o.style.height=`${n}px`,t.style.height=`${n}px`,t.replaceChildren(i,o);let a=null,l=null;const g=()=>{const c=K();t.classList.toggle(f,c),t.dataset.mobileScroll=c?"true":"false",c?(t.style.removeProperty("max-height"),t.style.overflowY=""):(t.style.maxHeight="none",t.style.overflow="visible")},h=()=>{g()},w=()=>{a||(a=document.createElement("div"),a.className=d,a.setAttribute("role","status"),a.setAttribute("aria-live","polite"),a.setAttribute("aria-busy","true"),a.innerHTML=`
      <div style="max-width:420px">
        <div class="${d}__spinner"></div>
        <p class="${d}__title">Buscando el mejor plan para ti…</p>
        <p class="${d}__subtitle">Cargando el cotizador completo</p>
      </div>
    `,t.appendChild(a))},E=c=>{const s=e.minHeight??1,m=Math.max(s,Math.ceil(c));o.style.height=`${m}px`,o.style.minHeight=`${m}px`,o.style.maxHeight="none",t.style.height=`${m}px`,t.style.minHeight=`${m}px`,g()},b=()=>{o.dataset.ready="true",i.dataset.hidden="true",window.setTimeout(()=>i.remove(),220)},M=c=>{if(c.source!==o.contentWindow)return;const s=c.data;if(!(!(s!=null&&s.source)||!N.has(s.source))){if(s.type===W){w();return}if(s.type===P){b();return}s.type===O&&typeof s.height=="number"&&(E(s.height),o.dataset.ready!=="true"&&b())}};return window.addEventListener("message",M),g(),typeof window.matchMedia=="function"&&(l=window.matchMedia("(max-width: 768px)"),l.addEventListener("change",h)),o.addEventListener("load",()=>{o.dataset.ready!=="true"&&b()}),{destroy:()=>{window.removeEventListener("message",M),l==null||l.removeEventListener("change",h),t.replaceChildren(),t.classList.remove(p,f),delete t.dataset.cvMounted,delete t.dataset.fullWidth,delete t.dataset.mobileScroll,t.style.removeProperty("--cv-widget-min-height"),t.style.removeProperty("height"),t.style.removeProperty("max-height"),t.style.removeProperty("overflow")}}}function S(t,e,i){const o=k(t,e,i);return F(t,o)}function v(t=T){const e=x(),i=document.querySelectorAll(t);return Array.from(i).map(o=>S(o,e))}function V(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>v(),{once:!0}):v()}const L={init:v,mount:(t,e)=>S(t,x(),e)};return window.CotizadorWidget=L,V(),L})();
//# sourceMappingURL=cotizador-widget.js.map
