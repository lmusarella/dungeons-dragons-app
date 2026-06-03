import{e as ee,g as ae,s as J,d as te,n as le,p as ne,h as se}from"./modals-B7op7Kez.js";import{d as K,g as C,c as A,b as ie}from"./index-Dzi-oHcd.js";import"./constants-CfIA4MDb.js";import"./dice-CuI9_8Y4.js";import"./utils-Tv02vTp-.js";const re=["","Abiurazione","Ammaliamento","Divinazione","Evocazione","Illusione","Invocazione","Necromanzia","Trasmutazione"],oe=["mago","warlock","stregone","chierico","druido","ranger","artefice","paladino","bardo"],ce=["2024","2014","Custom"],I=8;function de(u,s){const p=[...u];return s==="level"?p.sort((i,d)=>{const _=(Number(i.level)||0)-(Number(d.level)||0);return _!==0?_:String(i.name||"").localeCompare(String(d.name||""),"it",{sensitivity:"base"})}):p.sort((i,d)=>String(i.name||"").localeCompare(String(d.name||""),"it",{sensitivity:"base"}))}async function be(u){var x,H;u.innerHTML=`
    <section class="auth-screen character-select-view library-view">
      <div class="card character-select-card library-shell">
        <header class="character-select-header library-hero">
          <div class="library-hero__copy">
            <span class="library-hero__eyebrow">Compendio condiviso</span>
            <p class="title-car-select">Archivio centralizzato</p>
            <p class="muted">Trova, filtra e mantieni ordinati gli incantesimi condivisi tra i personaggi.</p>
          </div>
          <button class="primary library-add-button" type="button" data-library-add-spell aria-label="Nuovo incantesimo">
            <span aria-hidden="true">＋</span>
            <span>Nuovo incantesimo</span>
          </button>
        </header>
        <div class="library-filter-panel" data-library-filters></div>
        <div class="library-results-heading" data-library-results-heading></div>
        <div class="character-card-grid library-results-grid" data-library-spells></div>
      </div>
    </section>
  `;const s=u.querySelector("[data-library-filters]"),p=u.querySelector("[data-library-spells]");if(!s||!p)return;const i=document.createElement("div");i.className="modal-form-row modal-form-row--compact library-filters-row",i.appendChild(K({label:"Nome",name:"q",placeholder:"Cerca incantesimo"})),i.appendChild(K({label:"Livello",name:"level",type:"number"}));const d=document.createElement("label");d.className="field",d.innerHTML="<span>Scuola</span>";const _=document.createElement("select");_.name="school",re.forEach(l=>{const e=document.createElement("option");e.value=l,e.textContent=l||"Tutte",_.appendChild(e)}),d.appendChild(_),i.appendChild(d);const w=document.createElement("label");w.className="field",w.innerHTML="<span>Classe</span>";const T=document.createElement("select");T.name="caster",[{value:"",label:"Tutte"},...oe.map(l=>({value:l,label:l}))].forEach(l=>{const e=document.createElement("option");e.value=l.value,e.textContent=l.label,T.appendChild(e)}),w.appendChild(T),i.appendChild(w);const L=document.createElement("label");L.className="field",L.innerHTML="<span>Versione regole</span>";const q=document.createElement("select");q.name="rules_version",[{value:"",label:"Tutte"},...ce.map(l=>({value:l,label:l}))].forEach(l=>{const e=document.createElement("option");e.value=l.value,e.textContent=l.label,q.appendChild(e)}),L.appendChild(q),i.appendChild(L);const h=document.createElement("button");h.className="primary",h.type="button",h.innerHTML='<span aria-hidden="true">🔎</span><span>Cerca</span>',i.appendChild(h),s.appendChild(i);const M=document.createElement("div");M.className="library-list-toolbar",M.innerHTML=`
    <label class="field">
      <span>Ordina per</span>
      <select name="sort">
        <option value="name">Nome (A-Z)</option>
        <option value="level">Livello (0-9)</option>
      </select>
    </label>
  `,s.appendChild(M);const P=u.querySelector("[data-library-results-heading]"),g=document.createElement("div");g.className="library-pagination",s.appendChild(g);let o=1;const m=async()=>{var F,O,B,R,V,j,Z,G;const l=((F=s.querySelector('input[name="q"]'))==null?void 0:F.value)||"",e=((O=s.querySelector('input[name="level"]'))==null?void 0:O.value)||"",N=((B=s.querySelector('select[name="school"]'))==null?void 0:B.value)||"",y=((R=s.querySelector('select[name="caster"]'))==null?void 0:R.value)||"",a=((V=s.querySelector('select[name="rules_version"]'))==null?void 0:V.value)||"",r=(await le({query:l,level:e,school:N,rulesVersion:a,casterClasses:y?[y]:[]})).items||[],f=((j=s.querySelector('select[name="sort"]'))==null?void 0:j.value)||"name",c=de(r,f),$=Math.max(1,Math.ceil(c.length/I));o=Math.min(o,$);const k=(o-1)*I,z=c.slice(k,k+I);if(P){const t=c.length?k+1:0,n=Math.min(k+z.length,c.length);P.innerHTML=`
        <div>
          <span class="library-results-heading__eyebrow">Risultati</span>
          <strong>${c.length} incantesimi</strong>
        </div>
        <span class="muted">${c.length?`${t}-${n} mostrati`:"Nessun risultato con questi filtri"}</span>
      `}p.innerHTML=z.length?z.map(t=>{const n=(t.caster_classes||[]).join(", ")||"Nessuna classe",v=[t.concentration?"Concentrazione":"",t.ritual?"Rituale":"",t.rules_version?`Regole ${t.rules_version}`:""].filter(Boolean);return`
        <article class="character-card library-spell-card" data-library-view-spell="${t.id}" role="button" tabindex="0" aria-label="Apri dettaglio incantesimo ${t.name}">
          <div class="library-spell-card__level" aria-label="Livello ${t.level??0}">
            <span>Lv</span>
            <strong>${t.level??0}</strong>
          </div>
          <div class="character-card-info library-spell-card__info">
            <div class="library-spell-card__title-row">
              <h3>${t.name}</h3>
              <span class="library-spell-card__school">${t.school||"Scuola n/d"}</span>
            </div>
            <p class="muted">${n}</p>
            ${v.length?`<div class="library-spell-card__traits">${v.map(Q=>`<span>${Q}</span>`).join("")}</div>`:""}
          </div>
          <div class="button-row library-spell-card__actions">
            <button class="icon-button icon-button--danger" type="button" data-library-delete-spell="${t.id}" aria-label="Elimina incantesimo ${t.name}" title="Elimina">🗑️</button>
          </div>
        </article>`}).join(""):'<div class="library-empty-state"><strong>Nessun incantesimo trovato</strong><span class="muted">Prova a rimuovere un filtro o cerca un altro nome.</span></div>',g.innerHTML=c.length?`<button class="secondary" type="button" data-library-page="prev" ${o<=1?"disabled":""}>← Precedente</button>
         <span class="muted">Pagina ${o} di ${$}</span>
         <button class="secondary" type="button" data-library-page="next" ${o>=$?"disabled":""}>Successiva →</button>`:"";const D=t=>{const n=c.find(v=>v.id===t);n&&se(null,{...n,kind:Number(n.level)===0?"cantrip":"spell",is_ritual:!!(n.ritual||n.is_ritual)})};p.querySelectorAll("[data-library-view-spell]").forEach(t=>{t.addEventListener("click",n=>{n.target.closest("button")||D(t.dataset.libraryViewSpell)}),t.addEventListener("keydown",n=>{n.key!=="Enter"&&n.key!==" "||(n.preventDefault(),D(t.dataset.libraryViewSpell))})}),p.querySelectorAll("[data-library-delete-spell]").forEach(t=>t.addEventListener("click",async()=>{var U;const n=t.dataset.libraryDeleteSpell;if(!n)return;const v=c.find(E=>E.id===n);if(!v||!await ie({title:"Conferma eliminazione incantesimo",message:`Eliminare "${v.name}" dal catalogo centralizzato e da tutte le associazioni personaggio?`,confirmLabel:"Elimina"}))return;await ne(n);const W=C().activeCharacterId,S=C().characters.find(E=>E.id===W);if(S){const E=Array.isArray((U=S.data)==null?void 0:U.spells)?S.data.spells:[],X={...S.data||{},spells:E.filter(Y=>Y.shared_spell_id!==n)};await J(S,X,"Incantesimo rimosso dal personaggio")}A("Incantesimo centralizzato eliminato","success"),await m()})),(Z=g.querySelector('[data-library-page="prev"]'))==null||Z.addEventListener("click",()=>{o=Math.max(1,o-1),m()}),(G=g.querySelector('[data-library-page="next"]'))==null||G.addEventListener("click",()=>{o=Math.min($,o+1),m()})};h.addEventListener("click",()=>{o=1,m()}),(x=s.querySelector('select[name="sort"]'))==null||x.addEventListener("change",()=>{o=1,m()}),(H=u.querySelector("[data-library-add-spell]"))==null||H.addEventListener("click",async()=>{const{user:l}=C();await ee(null,async e=>{var N,y;try{const a=await ae({created_by:l==null?void 0:l.id,name:e.name,rules_version:e.rules_version||"2024",level:Number(e.level)||0,school:e.school||null,cast_time:e.cast_time||null,duration:e.duration||null,range:e.range||null,components:e.components||null,caster_classes:Array.isArray(e.caster_classes)?e.caster_classes:[],damage_die:e.damage_die||null,damage_modifier:e.damage_modifier??null,upcast_damage_die:e.upcast_damage_die||null,upcast_damage_modifier:e.upcast_damage_modifier??null,upcast_start_level:e.upcast_start_level??null,concentration:!!e.concentration,attack_roll:!!e.attack_roll,ritual:!!e.is_ritual,description:e.description||null}),b=C().activeCharacterId,r=C().characters.find(f=>f.id===b);if((N=r==null?void 0:r.data)!=null&&N.is_spellcaster){const f={id:`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:a.id,name:a.name,level:a.level,kind:Number(a.level)===0?"cantrip":"spell",cast_time:a.cast_time||null,duration:a.duration||null,range:a.range||null,components:a.components||null,concentration:!!a.concentration,attack_roll:!!a.attack_roll,is_ritual:!!a.ritual,damage_die:a.damage_die||null,damage_modifier:a.damage_modifier??null,upcast_damage_die:a.upcast_damage_die||null,upcast_damage_modifier:a.upcast_damage_modifier??null,upcast_start_level:a.upcast_start_level??null,description:a.description||null,school:a.school||null,caster_classes:a.caster_classes||[],rules_version:a.rules_version||"2024",prep_state:"known"},c=Array.isArray((y=r.data)==null?void 0:y.spells)?r.data.spells:[];await J(r,{...r.data||{},spells:[...c,f]},"Incantesimo aggiunto alla scheda personaggio"),await te({user_id:r.user_id,character_id:r.id,shared_spell_id:a.id,prep_state:"known"})}A("Incantesimo condiviso creato","success"),m()}catch(a){const b=String((a==null?void 0:a.message)||a||"Errore durante la creazione dell'incantesimo"),r=b.includes("shared_spells_name_rules_version_key")||b.toLowerCase().includes("duplicate key value violates unique constraint");A(r?"Esiste già un incantesimo simile nel catalogo centralizzato.":b,"error")}},null,{catalogMode:!0})}),await m()}export{be as renderLibrary};
