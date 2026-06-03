import{g as p}from"./constants-D6OR7YMo.js";import{s as d,f as u,a as v,c as g,n as h,h as f,m,g as $}from"./index-CEg3lb8Y.js";import{o as b}from"./characterDrawer-CbfKQnJ0.js";import"./weaponMasteries-zUcl4F-E.js";import"./utils-Tv02vTp-.js";async function y(t){const e=$(),{user:a,offline:s}=e;d(!0);let r=e.characters;try{if(!s&&a)try{r=await p(a.id),u({characters:r}),await v({characters:r})}catch{g("Errore caricamento personaggi","error")}const l=h(e.activeCharacterId),o=r.find(c=>h(c.id)===l),n=!!a&&!s;t.innerHTML=`
    <section class="auth-screen character-select-view">
      <div class="card character-select-card">
      <header class="character-select-header">
        <div>
          <p class="title-car-select">Seleziona o crea un personaggio</p>        
        </div>
        ${n?'<button class="icon-button icon-button--add character-select-add" type="button" data-create-character aria-label="Nuovo personaggio" title="Nuovo personaggio">+</button>':""}
      </header>
        <div class="character-card-grid">
        ${r.length?r.map(c=>C(c,c.id===(o==null?void 0:o.id))).join(""):"<p>Non hai ancora creato un personaggio.</p>"}
        </div>
      </div>
    </section>
  `,t.querySelectorAll("[data-character-card]").forEach(c=>{c.addEventListener("click",()=>{f(c.dataset.characterCard),m("home")})});const i=t.querySelector("[data-create-character]");i&&i.addEventListener("click",()=>{b(a,()=>y(t))})}finally{d(!1)}}function C(t,e){const a=t.data||{},s=a.avatar_url?`<img src="${a.avatar_url}" alt="Ritratto di ${t.name}" />`:`<span>${L(t.name)}</span>`,r=a.level?`Livello ${a.level}`:null,l=a.class_name||a.class_archetype||a.archetype,n=[...[r,l].filter(Boolean),a.race].filter(Boolean);return`
    <button class="character-card ${e?"is-active":""}" type="button" data-character-card="${t.id}">
      <div class="character-card-avatar">
        ${s}
      </div>
      <div class="character-card-info">
        <h3>${t.name}</h3>
        ${n.length?`<div class="character-card-tags">
            ${n.map(i=>`<span class="character-tag">${i}</span>`).join("")}
          </div>`:'<p class="character-card-meta muted">Dettagli base non specificati</p>'}
      </div>
    </button>
  `}function L(t=""){const e=t.split(" ").filter(Boolean);return e.length?e.length===1?e[0].slice(0,2).toUpperCase():`${e[0][0]}${e[1][0]}`.toUpperCase():"??"}export{y as renderCharacterSelect};
