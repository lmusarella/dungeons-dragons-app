import{A as p,B as u}from"./characterDrawer-D-p_9Xfi.js";import{j as d,s as v,c as g,b as f,n as h,k as m,p as b,g as $}from"./index-BS7JkFzs.js";async function y(e){const t=$(),{user:a,offline:s}=t;d(!0);let r=t.characters;try{if(!s&&a)try{r=await p(a.id),v({characters:r}),await g({characters:r})}catch{f("Errore caricamento personaggi","error")}const l=h(t.activeCharacterId),n=r.find(c=>h(c.id)===l),o=!!a&&!s;e.innerHTML=`
    <section class="auth-screen character-select-view">
      <div class="card character-select-card">
      <header class="character-select-header">
        <div>
          <p class="title-car-select">Seleziona o crea un personaggio</p>        
        </div>
        ${o?'<button class="icon-button icon-button--add character-select-add" type="button" data-create-character aria-label="Nuovo personaggio" title="Nuovo personaggio">+</button>':""}
      </header>
        <div class="character-card-grid">
        ${r.length?r.map(c=>C(c,c.id===(n==null?void 0:n.id))).join(""):"<p>Non hai ancora creato un personaggio.</p>"}
        </div>
      </div>
    </section>
  `,e.querySelectorAll("[data-character-card]").forEach(c=>{c.addEventListener("click",()=>{m(c.dataset.characterCard),b("home")})});const i=e.querySelector("[data-create-character]");i&&i.addEventListener("click",()=>{u(a,()=>y(e))})}finally{d(!1)}}function C(e,t){const a=e.data||{},s=a.avatar_url?`<img src="${a.avatar_url}" alt="Ritratto di ${e.name}" />`:`<span>${L(e.name)}</span>`,r=a.level?`Livello ${a.level}`:null,l=a.class_name||a.class_archetype||a.archetype,o=[...[r,l].filter(Boolean),a.race].filter(Boolean);return`
    <button class="character-card ${t?"is-active":""}" type="button" data-character-card="${e.id}">
      <div class="character-card-avatar">
        ${s}
      </div>
      <div class="character-card-info">
        <h3>${e.name}</h3>
        ${o.length?`<div class="character-card-tags">
            ${o.map(i=>`<span class="character-tag">${i}</span>`).join("")}
          </div>`:'<p class="character-card-meta muted">Dettagli base non specificati</p>'}
      </div>
    </button>
  `}function L(e=""){const t=e.split(" ").filter(Boolean);return t.length?t.length===1?t[0].slice(0,2).toUpperCase():`${t[0][0]}${t[1][0]}`.toUpperCase():"??"}export{y as renderCharacterSelect};
