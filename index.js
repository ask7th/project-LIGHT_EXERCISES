import{a as J}from"./assets/vendor-DzSg3hP9.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();const b=document.querySelector(".header"),u=document.querySelector(".header-menu-toggle"),M=window.matchMedia("(max-width: 767px)");if(b&&u){const e=b.querySelector(".header-navigation-list"),t=[...b.querySelectorAll(".header-navigation-link")],a=window.matchMedia("(prefers-reduced-motion: reduce)");let r;const n=window.location.pathname.endsWith("/")?`${window.location.pathname}index.html`:window.location.pathname;t.forEach(s=>{new URL(s.href).pathname===n&&s.setAttribute("aria-current","page")});const i=()=>{const s=e==null?void 0:e.querySelector('[aria-current="page"]');if(!s)return;const C=e.getBoundingClientRect(),l=s.getBoundingClientRect();e.style.setProperty("--active-link-offset",`${l.left-C.left}px`),e.style.setProperty("--active-link-width",`${l.width}px`)};i(),requestAnimationFrame(()=>e==null?void 0:e.classList.add("is-navigation-ready")),window.addEventListener("resize",i);const o=s=>{b.classList.toggle("is-menu-open",s),u.setAttribute("aria-expanded",String(s)),u.setAttribute("aria-label",s?"Close menu":"Open menu"),document.body.style.overflow=s?"hidden":""};u.addEventListener("click",()=>{o(u.getAttribute("aria-expanded")!=="true")}),t.forEach(s=>{s.addEventListener("click",()=>o(!1)),s.addEventListener("click",C=>{if(M.matches||a.matches)return;const l=e==null?void 0:e.querySelector('[aria-current="page"]');l!==s&&(C.preventDefault(),window.clearTimeout(r),l==null||l.removeAttribute("aria-current"),s.setAttribute("aria-current","page"),i(),r=window.setTimeout(()=>{window.location.assign(s.href)},250))})}),document.addEventListener("keydown",s=>{s.key==="Escape"&&u.getAttribute("aria-expanded")==="true"&&(o(!1),u.focus())}),M.addEventListener("change",s=>{s.matches||o(!1)})}const Z="/project-LIGHT_EXERCISES/assets/sprite-CoNrl85I.svg",G={FAVORITES:"yourenergy:favorites",QUOTE:"yourenergy:quote",QUOTE_DATE:"yourenergy:quote-date"},f={FILTER_CHANGED:"yourenergy:filter-changed",CATEGORY_SELECTED:"yourenergy:category-selected",SEARCH_SUBMITTED:"yourenergy:search-submitted",EXERCISE_OPEN:"yourenergy:exercise-open",FAVORITES_CHANGED:"yourenergy:favorites-changed"},_={CATEGORIES_DESKTOP:12,CATEGORIES_MOBILE:9,EXERCISES_DESKTOP:10,EXERCISES_MOBILE:8},U=document.querySelectorAll(".filter-btn");function j(e){U.forEach(t=>{t.classList.remove("active"),t.setAttribute("aria-pressed","false")}),e.classList.add("active"),e.setAttribute("aria-pressed","true")}U.forEach(e=>{e.addEventListener("click",()=>{j(e),document.dispatchEvent(new CustomEvent(f.FILTER_CHANGED,{detail:{filter:e.dataset.filter}}))})});const R=document.querySelector('.filter-btn[data-filter="Muscles"]');R&&(j(R),setTimeout(()=>{document.dispatchEvent(new CustomEvent(f.FILTER_CHANGED,{detail:{filter:"Muscles"}}))},0));const ee="https://your-energy.b.goit.study/api",I=J.create({baseURL:ee,timeout:1e4});async function te({filter:e,page:t=1,limit:a=12}){const{data:r}=await I.get("/filters",{params:{filter:e,page:t,limit:a}});return r}async function ne(e={}){const{page:t=1,limit:a=10,...r}=e,{data:n}=await I.get("/exercises",{params:{...r,page:t,limit:a}});return n}async function ae(){const{data:e}=await I.get("/quote");return e}let w=0;function Q(){let e=document.querySelector(".js-loader");return e||(e=document.createElement("div"),e.className="js-loader loader",e.innerHTML='<div class="loader__spinner"></div>',e.style.display="none",document.body.appendChild(e)),e}function W(){w++,Q().style.display="flex"}function K(){w=Math.max(0,w-1),w===0&&(Q().style.display="none")}const A=document.getElementById("categories-container"),S=document.querySelector(".categories-wrapper"),O=document.querySelector(".exercises-wrapper"),B=document.getElementById("search-form"),y=document.getElementById("pagination-container");let X="Muscles",d=1;document.addEventListener(f.FILTER_CHANGED,async e=>{X=e.detail.filter,d=1,O&&O.classList.add("visually-hidden"),S&&S.classList.remove("visually-hidden"),B&&B.classList.add("visually-hidden");const t=document.getElementById("category-slash"),a=document.getElementById("selected-category-name");t&&t.classList.add("visually-hidden"),a&&(a.textContent=""),await T()});async function T(){try{W();const t=window.innerWidth<768?9:12,a=await te({filter:X,page:d,limit:t});if(!a||a.results.length===0){A.innerHTML='<p class="no-results">No categories found.</p>',y.innerHTML="";return}ie(a.results),se(a.totalPages)}catch(e){console.error(e)}finally{K()}}function ie(e){A.innerHTML=e.map(({filter:t,name:a,imgURL:r})=>`
            <li class="category-item">
                <button class="category-card-btn" data-filter="${t}" data-name="${a}">
                    <img src="${r}" alt="${a}" class="category-img" loading="lazy" />
                    <div class="category-content">
                        <h3 class="category-name">${a}</h3>
                        <p class="category-label">${t}</p>
                    </div>
                </button>
            </li>
        `).join(""),A.querySelectorAll(".category-card-btn").forEach(t=>{t.addEventListener("click",()=>{document.dispatchEvent(new CustomEvent(f.CATEGORY_SELECTED,{detail:{filter:t.dataset.filter,category:t.dataset.name}}))})})}function re(e,t){if(t<=4)return Array.from({length:t},(i,o)=>o+1);let a=Math.max(1,e-1),r=Math.min(t,a+2);a=Math.max(1,r-2);const n=[];a>1&&n.push("...");for(let i=a;i<=r;i++)n.push(i);return r<t&&n.push("..."),n}function se(e){if(!e||e<=1){y.innerHTML="";return}const t=d===1,a=d===e,r=re(d,e);y.innerHTML=`
        <button class="pagination-nav-btn" type="button" data-action="first" ${t?"disabled":""} aria-label="First page">«</button>
        <button class="pagination-nav-btn" type="button" data-action="prev" ${t?"disabled":""} aria-label="Previous page">‹</button>
        ${r.map(n=>n==="..."?'<span class="pagination-ellipsis">...</span>':`<button class="pagination-btn ${n===d?"active":""}" type="button" data-page="${n}">${n}</button>`).join("")}
        <button class="pagination-nav-btn" type="button" data-action="next" ${a?"disabled":""} aria-label="Next page">›</button>
        <button class="pagination-nav-btn" type="button" data-action="last" ${a?"disabled":""} aria-label="Last page">»</button>
    `,y.querySelectorAll(".pagination-btn").forEach(n=>{n.addEventListener("click",async()=>{d=Number(n.dataset.page),await T()})}),y.querySelectorAll(".pagination-nav-btn:not([disabled])").forEach(n=>{n.addEventListener("click",async()=>{const i=n.dataset.action;i==="first"?d=1:i==="prev"?d=Math.max(1,d-1):i==="next"?d=Math.min(e,d+1):i==="last"&&(d=e),await T()})})}let N;window.addEventListener("resize",()=>{clearTimeout(N),N=setTimeout(()=>{S&&!S.classList.contains("visually-hidden")&&(d=1,T())},300)});const oe="/project-LIGHT_EXERCISES/".replace(/\/$/,"");function E(e){return`${oe}/images/sprite.svg#${e}`}const q=document.getElementById("exercises-container"),H=document.querySelector(".exercises-wrapper"),F=document.querySelector(".categories-wrapper"),v=document.getElementById("search-form"),g=document.getElementById("search-input"),p=document.getElementById("search-clear-btn"),ce=document.getElementById("selected-category-name"),de=document.getElementById("category-slash"),h=document.getElementById("pagination-container");let z="",$="",x="",c=1;const le=()=>window.innerWidth>=768?_.EXERCISES_DESKTOP:_.EXERCISES_MOBILE;document.addEventListener(f.CATEGORY_SELECTED,async e=>{const{filter:t,category:a}=e.detail;z=t,$=a,c=1,x="",ce.textContent=a,de.classList.remove("visually-hidden"),F&&F.classList.add("visually-hidden"),H&&H.classList.remove("visually-hidden"),v&&(v.classList.remove("visually-hidden"),v.reset(),p&&(p.hidden=!0)),await m()});async function m(){try{W();const e=z.toLowerCase().replace(/\s+/g,""),a={[e==="bodyparts"?"bodypart":e]:$,keyword:x,page:c,limit:le()},r=await ne(a);if(!r||r.results.length===0){q.innerHTML='<p class="no-results">Sorry, no exercises found.</p>',h.innerHTML="";return}ue(r.results),me(r.totalPages)}catch(e){console.error(e)}finally{K()}}function ue(e){q.innerHTML=e.map(({_id:t,name:a,burnedCalories:r,bodyPart:n,target:i,rating:o})=>`
            <li class="exercise-card">
                <div class="ex-card-header">
                    <div class="ex-badge">WORKOUT</div>
                    <div class="ex-rating">
                        ${o.toFixed(1)}
                        <svg width="14" height="14" aria-hidden="true"><use href="${E("icon-star")}"></use></svg>
                    </div>
                    <button class="ex-start-btn" data-id="${t}">
                        Start →
                    </button>
                </div>
                <h3 class="ex-title">
                    <span class="ex-icon-wrap">
                        <svg class="ex-icon" width="14" height="16" aria-hidden="true"><use href="${E("icon-run")}"></use></svg>
                    </span>
                    ${a}
                </h3>
                <div class="ex-info">
                    <p>Burned calories: <span>${r} / 3 min</span></p>
                    <p>Body part: <span>${n}</span></p>
                    <p>Target: <span>${i}</span></p>
                </div>
            </li>
        `).join(""),q.querySelectorAll(".ex-start-btn").forEach(t=>{t.addEventListener("click",()=>{document.dispatchEvent(new CustomEvent(f.EXERCISE_OPEN,{detail:{id:t.dataset.id}}))})})}function pe(e,t){if(t<=4)return Array.from({length:t},(i,o)=>o+1);let a=Math.max(1,e-1),r=Math.min(t,a+2);a=Math.max(1,r-2);const n=[];a>1&&n.push("...");for(let i=a;i<=r;i++)n.push(i);return r<t&&n.push("..."),n}function me(e){if(!e||e<=1){h.innerHTML="";return}const t=c===1,a=c===e,r=pe(c,e);h.innerHTML=`
        <button class="pagination-nav-btn" type="button" data-action="first" ${t?"disabled":""} aria-label="First page">«</button>
        <button class="pagination-nav-btn" type="button" data-action="prev" ${t?"disabled":""} aria-label="Previous page">‹</button>
        ${r.map(n=>n==="..."?'<span class="pagination-ellipsis">...</span>':`<button class="pagination-btn ${n===c?"active":""}" type="button" data-page="${n}">${n}</button>`).join("")}
        <button class="pagination-nav-btn" type="button" data-action="next" ${a?"disabled":""} aria-label="Next page">›</button>
        <button class="pagination-nav-btn" type="button" data-action="last" ${a?"disabled":""} aria-label="Last page">»</button>
    `,h.querySelectorAll(".pagination-btn").forEach(n=>{n.addEventListener("click",async()=>{c=Number(n.dataset.page),await m()})}),h.querySelectorAll(".pagination-nav-btn:not([disabled])").forEach(n=>{n.addEventListener("click",async()=>{const i=n.dataset.action;i==="first"?c=1:i==="prev"?c=Math.max(1,c-1):i==="next"?c=Math.min(e,c+1):i==="last"&&(c=e),await m()})})}let k;window.addEventListener("resize",()=>{clearTimeout(k),k=setTimeout(()=>{$&&(c=1,m())},300)});g&&p&&(g.addEventListener("input",()=>{p.hidden=!g.value.trim()}),p.addEventListener("click",async()=>{g.value="",p.hidden=!0,x="",c=1,await m(),g.focus()}));v&&v.addEventListener("submit",async e=>{e.preventDefault(),x=e.target.elements.query.value.trim().toLowerCase(),c=1,await m()});const P="/project-LIGHT_EXERCISES/assets/women-sportswear-taking-break-from-workout-1_mob-By5TfgcC.png";function V(){return new Date().toISOString().slice(0,10)}function fe(){const e=localStorage.getItem(G.QUOTE);if(!e)return null;const t=JSON.parse(e);return t.date===V()?t:null}function ge(e){localStorage.setItem(G.QUOTE,JSON.stringify({...e,date:V()}))}function ye(){const e=document.querySelector(".quote-wrapper");!e||e.innerHTML.trim()||(e.innerHTML=`
    <div class="quote-card">
      <div class="quote-card-top">
        <div class="quote-card-icon-wrap">
          <svg width="18" height="18" aria-hidden="true"><use href="${E("icon-run")}"></use></svg>
        </div>
        <p class="quote-card-title">Quote of the day</p>
        <svg class="quote-mark" width="24" height="24" aria-hidden="true"><use href="${E("icon-quote")}"></use></svg>
      </div>
      <blockquote class="quote-text"></blockquote>
      <p class="quote-author"></p>
    </div>
    <div class="quote-photo-wrap">
      <img
        src="${P}"
        srcset="${P} 2x"
        alt="Women working out"
        class="quote-photo"
        width="290"
        height="242"
      />
    </div>
    <div class="daily-norm-card">
      <div class="daily-norm-header">
        <div class="daily-norm-icon-wrap">
          <svg width="20" height="20" aria-hidden="true"><use href="${E("icon-dumbbell")}"></use></svg>
        </div>
        <div>
          <p class="daily-norm-time">110 min</p>
          <p class="daily-norm-subtitle">Daily norm of sports</p>
        </div>
      </div>
      <p class="daily-norm-text">The World Health Organization recommends at least 150 minutes of moderate-intensity aerobic physical activity throughout the week for adults aged 18-64. However, what happens if we adjust that number to 110 minutes every day? While it might seem like a high number to hit, dedicating 110 minutes daily to sporting activities may offer unparalleled benefits to physical health, mental well-being, and overall quality of life.</p>
    </div>
  `)}function he({quote:e,author:t}){document.querySelectorAll(".quote-text").forEach(a=>{a.textContent=e}),document.querySelectorAll(".quote-author").forEach(a=>{a.textContent=t})}function Y(){const e=document.querySelector(".daily-norm-text");if(!e){setTimeout(Y,100);return}e.dataset.originalText||(e.dataset.originalText=e.textContent.trim());const t=e.dataset.originalText;function a(){const r=window.innerWidth,n=r<768?169:r<1280?179:t.length;e.textContent=t.length>n?t.substring(0,n).trim()+"...":t}a(),window.addEventListener("resize",a)}async function Ee(){try{let e=fe();e||(e=await ae(),ge(e)),ye(),he(e),Y()}catch(e){console.error("initQuoteSection error:",e)}}Ee();const ve="https://your-energy.b.goit.study/api/subscription",D="Unable to subscribe. Please try again.",be="Subscription successfully created";function Le(){const e=document.querySelector(".footer-form");if(!e)return;const t=e.elements.email,a=e.querySelector(".footer-message"),r=e.querySelector(".footer-button");t.addEventListener("input",()=>{L(a,"")}),e.addEventListener("submit",async n=>{if(n.preventDefault(),t.value=t.value.trim(),!e.checkValidity()){e.reportValidity();return}r.disabled=!0;try{const i=await fetch(ve,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:t.value})}),o=await i.json().catch(()=>({}));if(!i.ok){L(a,o.message||D,!0);return}L(a,o.message||be),e.reset()}catch{L(a,D,!0)}finally{r.disabled=!1}})}function L(e,t,a=!1){e.textContent=t,e.classList.toggle("is-error",!!t&&a)}window.__SPRITE_URL__=Z;Le();
//# sourceMappingURL=index.js.map
