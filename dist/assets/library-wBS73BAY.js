import{e as se,g as ie,s as W,d as re,p as oe,n as X,h as ce}from"./modals-Ck6rRns6.js";import{d as ee,j as de,g as C,c as x,b as ue}from"./index-B3mIQOv_.js";import"./constants--atOIwl7.js";import"./dice-DsFE2rIl.js";import"./utils-Tv02vTp-.js";const me=["","Abiurazione","Ammaliamento","Divinazione","Evocazione","Illusione","Invocazione","Necromanzia","Trasmutazione"],pe=["mago","warlock","stregone","chierico","druido","ranger","artefice","paladino","bardo"],ve=["2024","2014","Custom"],F=8,ae=50;async function be(m){const s=await X({...m,page:1,pageSize:ae}),r=[...s.items||[]],i=Number(s.total)||r.length;let d=2;for(;r.length<i;){const v=(await X({...m,page:d,pageSize:ae})).items||[];if(!v.length)break;r.push(...v),d+=1}return{...s,items:r,total:i}}function _e(m,s){const r=[...m];return s==="level"?r.sort((i,d)=>{const p=(Number(i.level)||0)-(Number(d.level)||0);return p!==0?p:String(i.name||"").localeCompare(String(d.name||""),"it",{sensitivity:"base"})}):r.sort((i,d)=>String(i.name||"").localeCompare(String(d.name||""),"it",{sensitivity:"base"}))}async function Ee(m){var R,B;m.innerHTML=`
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
        <div class="library-spell-list-header" aria-hidden="true">
          <span>Livello</span>
          <span>Incantesimo</span>
          <span>Scuola</span>
          <span>Azioni</span>
        </div>
        <div class="character-card-grid library-results-grid" data-library-spells></div>
      </div>
    </section>
  `;const s=m.querySelector("[data-library-filters]"),r=m.querySelector("[data-library-spells]");if(!s||!r)return;const i=document.createElement("div");i.className="modal-form-row modal-form-row--compact library-filters-row",i.appendChild(ee({label:"Nome",name:"q",placeholder:"Cerca incantesimo"}));const d=ee({label:"Livello",name:"level",type:"number"});d.classList.add("library-level-filter");const p=d.querySelector('input[name="level"]');p&&(p.min="0",p.max="9",p.step="1",p.inputMode="numeric",de(p,{decrementLabel:"Riduci livello incantesimo",incrementLabel:"Aumenta livello incantesimo"})),i.appendChild(d);const v=document.createElement("label");v.className="field",v.innerHTML="<span>Scuola</span>";const I=document.createElement("select");I.name="school",me.forEach(l=>{const e=document.createElement("option");e.value=l,e.textContent=l||"Tutte",I.appendChild(e)}),v.appendChild(I),i.appendChild(v);const w=document.createElement("label");w.className="field",w.innerHTML="<span>Classe</span>";const T=document.createElement("select");T.name="caster",[{value:"",label:"Tutte"},...pe.map(l=>({value:l,label:l}))].forEach(l=>{const e=document.createElement("option");e.value=l.value,e.textContent=l.label,T.appendChild(e)}),w.appendChild(T),i.appendChild(w);const N=document.createElement("label");N.className="field",N.innerHTML="<span>Versione regole</span>";const q=document.createElement("select");q.name="rules_version",[{value:"",label:"Tutte"},...ve.map(l=>({value:l,label:l}))].forEach(l=>{const e=document.createElement("option");e.value=l.value,e.textContent=l.label,q.appendChild(e)}),N.appendChild(q),i.appendChild(N);const g=document.createElement("button");g.className="primary library-search-button",g.type="button",g.innerHTML='<span aria-hidden="true">🔎</span><span>Cerca</span>';const z=document.createElement("div");z.className="library-filter-actions",z.appendChild(g);const M=document.createElement("div");M.className="library-list-toolbar",M.innerHTML=`
    <label class="field">
      <span>Ordina per</span>
      <select name="sort">
        <option value="name">Nome (A-Z)</option>
        <option value="level">Livello (0-9)</option>
      </select>
    </label>
  `,s.append(i,M,z);const H=m.querySelector("[data-library-results-heading]"),y=document.createElement("div");y.className="library-pagination",r.insertAdjacentElement("afterend",y);let c=1;const b=async()=>{var O,j,V,Z,G,Q,U,Y;const l=((O=s.querySelector('input[name="q"]'))==null?void 0:O.value)||"",e=((j=s.querySelector('input[name="level"]'))==null?void 0:j.value)||"",A=((V=s.querySelector('select[name="school"]'))==null?void 0:V.value)||"",f=((Z=s.querySelector('select[name="caster"]'))==null?void 0:Z.value)||"",a=((G=s.querySelector('select[name="rules_version"]'))==null?void 0:G.value)||"",o=(await be({query:l,level:e,school:A,rulesVersion:a,casterClasses:f?[f]:[]})).items||[],S=((Q=s.querySelector('select[name="sort"]'))==null?void 0:Q.value)||"name",u=_e(o,S),k=Math.max(1,Math.ceil(u.length/F));c=Math.min(c,k);const $=(c-1)*F,P=u.slice($,$+F);if(H){const t=u.length?$+1:0,n=Math.min($+P.length,u.length);H.innerHTML=`
        <div>
          <span class="library-results-heading__eyebrow">Risultati</span>
          <strong>${u.length} incantesimi</strong>
        </div>
        <span class="muted">${u.length?`${t}-${n} mostrati`:"Nessun risultato con questi filtri"}</span>
      `}r.innerHTML=P.length?P.map(t=>{const n=(t.caster_classes||[]).join(", ")||"Nessuna classe",_=[t.concentration?"Concentrazione":"",t.ritual?"Rituale":"",t.rules_version?`Regole ${t.rules_version}`:""].filter(Boolean);return`
        <article class="character-card library-spell-card" data-library-view-spell="${t.id}" role="button" tabindex="0" aria-label="Apri dettaglio incantesimo ${t.name}">
          <div class="library-spell-card__level" aria-label="Livello ${t.level??0}">
            <span>Lv</span>
            <strong>${t.level??0}</strong>
          </div>
          <div class="character-card-info library-spell-card__info">
            <h3>${t.name}</h3>
            <p class="muted library-spell-card__classes">${n}</p>
            ${_.length?`<div class="library-spell-card__traits">${_.map(J=>`<span>${J}</span>`).join("")}</div>`:""}
          </div>
          <span class="library-spell-card__school">${t.school||"Scuola n/d"}</span>
          <div class="button-row library-spell-card__actions">
            <button class="icon-button icon-button--danger" type="button" data-library-delete-spell="${t.id}" aria-label="Elimina incantesimo ${t.name}" title="Elimina">🗑️</button>
          </div>
        </article>`}).join(""):'<div class="library-empty-state"><strong>Nessun incantesimo trovato</strong><span class="muted">Prova a rimuovere un filtro o cerca un altro nome.</span></div>',y.innerHTML=u.length?`<button class="secondary" type="button" data-library-page="prev" ${c<=1?"disabled":""}>← Precedente</button>
         <span class="muted">Pagina ${c} di ${k}</span>
         <button class="secondary" type="button" data-library-page="next" ${c>=k?"disabled":""}>Successiva →</button>`:"";const D=t=>{const n=u.find(_=>_.id===t);n&&ce(null,{...n,kind:Number(n.level)===0?"cantrip":"spell",is_ritual:!!(n.ritual||n.is_ritual)})};r.querySelectorAll("[data-library-view-spell]").forEach(t=>{t.addEventListener("click",n=>{n.target.closest("button")||D(t.dataset.libraryViewSpell)}),t.addEventListener("keydown",n=>{n.key!=="Enter"&&n.key!==" "||(n.preventDefault(),D(t.dataset.libraryViewSpell))})}),r.querySelectorAll("[data-library-delete-spell]").forEach(t=>t.addEventListener("click",async()=>{var K;const n=t.dataset.libraryDeleteSpell;if(!n)return;const _=u.find(L=>L.id===n);if(!_||!await ue({title:"Conferma eliminazione incantesimo",message:`Eliminare "${_.name}" dal catalogo centralizzato e da tutte le associazioni personaggio?`,confirmLabel:"Elimina"}))return;await oe(n);const te=C().activeCharacterId,E=C().characters.find(L=>L.id===te);if(E){const L=Array.isArray((K=E.data)==null?void 0:K.spells)?E.data.spells:[],le={...E.data||{},spells:L.filter(ne=>ne.shared_spell_id!==n)};await W(E,le,"Incantesimo rimosso dal personaggio")}x("Incantesimo centralizzato eliminato","success"),await b()})),(U=y.querySelector('[data-library-page="prev"]'))==null||U.addEventListener("click",()=>{c=Math.max(1,c-1),b()}),(Y=y.querySelector('[data-library-page="next"]'))==null||Y.addEventListener("click",()=>{c=Math.min(k,c+1),b()})};g.addEventListener("click",()=>{c=1,b()}),(R=s.querySelector('select[name="sort"]'))==null||R.addEventListener("change",()=>{c=1,b()}),(B=m.querySelector("[data-library-add-spell]"))==null||B.addEventListener("click",async()=>{const{user:l}=C();await se(null,async e=>{var A,f;try{const a=await ie({created_by:l==null?void 0:l.id,name:e.name,rules_version:e.rules_version||"2024",level:Number(e.level)||0,school:e.school||null,cast_time:e.cast_time||null,duration:e.duration||null,range:e.range||null,components:e.components||null,caster_classes:Array.isArray(e.caster_classes)?e.caster_classes:[],damage_die:e.damage_die||null,damage_modifier:e.damage_modifier??null,upcast_damage_die:e.upcast_damage_die||null,upcast_damage_modifier:e.upcast_damage_modifier??null,upcast_start_level:e.upcast_start_level??null,concentration:!!e.concentration,attack_roll:!!e.attack_roll,ritual:!!e.is_ritual,description:e.description||null}),h=C().activeCharacterId,o=C().characters.find(S=>S.id===h);if((A=o==null?void 0:o.data)!=null&&A.is_spellcaster){const S={id:`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:a.id,name:a.name,level:a.level,kind:Number(a.level)===0?"cantrip":"spell",cast_time:a.cast_time||null,duration:a.duration||null,range:a.range||null,components:a.components||null,concentration:!!a.concentration,attack_roll:!!a.attack_roll,is_ritual:!!a.ritual,damage_die:a.damage_die||null,damage_modifier:a.damage_modifier??null,upcast_damage_die:a.upcast_damage_die||null,upcast_damage_modifier:a.upcast_damage_modifier??null,upcast_start_level:a.upcast_start_level??null,description:a.description||null,school:a.school||null,caster_classes:a.caster_classes||[],rules_version:a.rules_version||"2024",prep_state:"known"},u=Array.isArray((f=o.data)==null?void 0:f.spells)?o.data.spells:[];await W(o,{...o.data||{},spells:[...u,S]},"Incantesimo aggiunto alla scheda personaggio"),await re({user_id:o.user_id,character_id:o.id,shared_spell_id:a.id,prep_state:"known"})}x("Incantesimo condiviso creato","success"),b()}catch(a){const h=String((a==null?void 0:a.message)||a||"Errore durante la creazione dell'incantesimo"),o=h.includes("shared_spells_name_rules_version_key")||h.toLowerCase().includes("duplicate key value violates unique constraint");x(o?"Esiste già un incantesimo simile nel catalogo centralizzato.":h,"error")}},null,{catalogMode:!0})}),await b()}export{Ee as renderLibrary};
