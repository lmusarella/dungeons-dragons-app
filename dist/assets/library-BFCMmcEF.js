import{e as me,g as ve,s as ie,d as be,p as he,n as re,h as _e}from"./modals-Bbb7o5dA.js";import{d as oe,j as ge,g as C,c as B,b as ye}from"./index-DtIC5mHn.js";import"./constants-Benpi3Zj.js";import"./dice-BSeoB5yK.js";import"./utils-Tv02vTp-.js";const fe=["","Abiurazione","Ammaliamento","Divinazione","Evocazione","Illusione","Invocazione","Necromanzia","Trasmutazione"],Se=["mago","warlock","stregone","chierico","druido","ranger","artefice","paladino","bardo"],Ee=["2024","2014","Custom"],V=8,ce=50;async function Ce(u){const s=await re({...u,page:1,pageSize:ce}),r=[...s.items||[]],i=Number(s.total)||r.length;let d=2;for(;r.length<i;){const v=(await re({...u,page:d,pageSize:ce})).items||[];if(!v.length)break;r.push(...v),d+=1}return{...s,items:r,total:i}}function Le(u,s){const r=[...u];return s==="level"?r.sort((i,d)=>{const p=(Number(i.level)||0)-(Number(d.level)||0);return p!==0?p:String(i.name||"").localeCompare(String(d.name||""),"it",{sensitivity:"base"})}):r.sort((i,d)=>String(i.name||"").localeCompare(String(d.name||""),"it",{sensitivity:"base"}))}async function ke(u){var Z,G;u.innerHTML=`
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
          <span>Regole</span>
          <span>Concentrazione</span>
          <span>Rituale</span>
          <span>Azioni</span>
        </div>
        <div class="character-card-grid library-results-grid" data-library-spells></div>
      </div>
    </section>
  `;const s=u.querySelector("[data-library-filters]"),r=u.querySelector("[data-library-spells]");if(!s||!r)return;const i=document.createElement("div");i.className="modal-form-row modal-form-row--compact library-filters-row",i.appendChild(oe({label:"Nome",name:"q",placeholder:"Cerca incantesimo"}));const d=oe({label:"Livello",name:"level",type:"number"});d.classList.add("library-level-filter");const p=d.querySelector('input[name="level"]');p&&(p.min="0",p.max="9",p.step="1",p.inputMode="numeric",ge(p,{decrementLabel:"Riduci livello incantesimo",incrementLabel:"Aumenta livello incantesimo"})),i.appendChild(d);const v=document.createElement("label");v.className="field",v.innerHTML="<span>Scuola</span>";const M=document.createElement("select");M.name="school",fe.forEach(t=>{const e=document.createElement("option");e.value=t,e.textContent=t||"Tutte",M.appendChild(e)}),v.appendChild(M),i.appendChild(v);const L=document.createElement("label");L.className="field",L.innerHTML="<span>Classe</span>";const z=document.createElement("select");z.name="caster",[{value:"",label:"Tutte"},...Se.map(t=>({value:t,label:t}))].forEach(t=>{const e=document.createElement("option");e.value=t.value,e.textContent=t.label,z.appendChild(e)}),L.appendChild(z),i.appendChild(L);const w=document.createElement("label");w.className="field",w.innerHTML="<span>Versione regole</span>";const I=document.createElement("select");I.name="rules_version",[{value:"",label:"Tutte"},...Ee.map(t=>({value:t,label:t}))].forEach(t=>{const e=document.createElement("option");e.value=t.value,e.textContent=t.label,I.appendChild(e)}),w.appendChild(I),i.appendChild(w);const N=document.createElement("label");N.className="field",N.innerHTML="<span>Concentrazione</span>";const F=document.createElement("select");F.name="concentration",[{value:"",label:"Tutte"},{value:"true",label:"Sì"},{value:"false",label:"No"}].forEach(t=>{const e=document.createElement("option");e.value=t.value,e.textContent=t.label,F.appendChild(e)}),N.appendChild(F),i.appendChild(N);const T=document.createElement("label");T.className="field",T.innerHTML="<span>Rituale</span>";const x=document.createElement("select");x.name="ritual",[{value:"",label:"Tutti"},{value:"true",label:"Sì"},{value:"false",label:"No"}].forEach(t=>{const e=document.createElement("option");e.value=t.value,e.textContent=t.label,x.appendChild(e)}),T.appendChild(x),i.appendChild(T);const g=document.createElement("button");g.className="primary library-search-button",g.type="button",g.innerHTML='<span aria-hidden="true">🔎</span><span>Cerca</span>';const P=document.createElement("div");P.className="library-filter-actions",P.appendChild(g);const H=document.createElement("div");H.className="library-list-toolbar",H.innerHTML=`
    <label class="field">
      <span>Ordina per</span>
      <select name="sort">
        <option value="name">Nome (A-Z)</option>
        <option value="level">Livello (0-9)</option>
      </select>
    </label>
  `,s.append(i,H,P);const j=u.querySelector("[data-library-results-heading]"),y=document.createElement("div");y.className="library-pagination",r.insertAdjacentElement("afterend",y);let c=1;const b=async()=>{var U,Y,J,K,W,X,ee,ae,te,le;const t=((U=s.querySelector('input[name="q"]'))==null?void 0:U.value)||"",e=((Y=s.querySelector('input[name="level"]'))==null?void 0:Y.value)||"",A=((J=s.querySelector('select[name="school"]'))==null?void 0:J.value)||"",f=((K=s.querySelector('select[name="caster"]'))==null?void 0:K.value)||"",a=((W=s.querySelector('select[name="rules_version"]'))==null?void 0:W.value)||"",h=((X=s.querySelector('select[name="concentration"]'))==null?void 0:X.value)||"",o=((ee=s.querySelector('select[name="ritual"]'))==null?void 0:ee.value)||"",R=(await Ce({query:t,level:e,school:A,rulesVersion:a,casterClasses:f?[f]:[],concentration:h,ritual:o})).items||[],de=((ae=s.querySelector('select[name="sort"]'))==null?void 0:ae.value)||"name",m=Le(R,de),k=Math.max(1,Math.ceil(m.length/V));c=Math.min(c,k);const q=(c-1)*V,D=m.slice(q,q+V);if(j){const l=m.length?q+1:0,n=Math.min(q+D.length,m.length);j.innerHTML=`
        <div>
          <span class="library-results-heading__eyebrow">Risultati</span>
          <strong>${m.length} incantesimi</strong>
        </div>
        <span class="muted">${m.length?`${l}-${n} mostrati`:"Nessun risultato con questi filtri"}</span>
      `}r.innerHTML=D.length?D.map(l=>{const n=(l.caster_classes||[]).join(", ")||"Nessuna classe",_=l.rules_version||"—",ne=l.concentration?"Sì":"No",O=l.ritual?"Sì":"No";return`
        <article class="character-card library-spell-card" data-library-view-spell="${l.id}" role="button" tabindex="0" aria-label="Apri dettaglio incantesimo ${l.name}">
          <div class="library-spell-card__level" aria-label="Livello ${l.level??0}">
            <span>Lv</span>
            <strong>${l.level??0}</strong>
          </div>
          <div class="character-card-info library-spell-card__info">
            <h3>${l.name}</h3>
            <p class="muted library-spell-card__classes">${n}</p>
          </div>
          <span class="library-spell-card__school">${l.school||"Scuola n/d"}</span>
          <span class="library-spell-card__rules">${_}</span>
          <span class="library-spell-card__flag ${l.concentration?"is-active":""}">${ne}</span>
          <span class="library-spell-card__flag ${l.ritual?"is-active":""}">${O}</span>
          <div class="button-row library-spell-card__actions">
            <button class="icon-button icon-button--danger" type="button" data-library-delete-spell="${l.id}" aria-label="Elimina incantesimo ${l.name}" title="Elimina">🗑️</button>
          </div>
        </article>`}).join(""):'<div class="library-empty-state"><strong>Nessun incantesimo trovato</strong><span class="muted">Prova a rimuovere un filtro o cerca un altro nome.</span></div>',y.innerHTML=m.length?`<button class="secondary" type="button" data-library-page="prev" ${c<=1?"disabled":""}>← Precedente</button>
         <span class="muted">Pagina ${c} di ${k}</span>
         <button class="secondary" type="button" data-library-page="next" ${c>=k?"disabled":""}>Successiva →</button>`:"";const Q=l=>{const n=m.find(_=>_.id===l);n&&_e(null,{...n,kind:Number(n.level)===0?"cantrip":"spell",is_ritual:!!(n.ritual||n.is_ritual)})};r.querySelectorAll("[data-library-view-spell]").forEach(l=>{l.addEventListener("click",n=>{n.target.closest("button")||Q(l.dataset.libraryViewSpell)}),l.addEventListener("keydown",n=>{n.key!=="Enter"&&n.key!==" "||(n.preventDefault(),Q(l.dataset.libraryViewSpell))})}),r.querySelectorAll("[data-library-delete-spell]").forEach(l=>l.addEventListener("click",async()=>{var se;const n=l.dataset.libraryDeleteSpell;if(!n)return;const _=m.find(E=>E.id===n);if(!_||!await ye({title:"Conferma eliminazione incantesimo",message:`Eliminare "${_.name}" dal catalogo centralizzato e da tutte le associazioni personaggio?`,confirmLabel:"Elimina"}))return;await he(n);const O=C().activeCharacterId,S=C().characters.find(E=>E.id===O);if(S){const E=Array.isArray((se=S.data)==null?void 0:se.spells)?S.data.spells:[],ue={...S.data||{},spells:E.filter(pe=>pe.shared_spell_id!==n)};await ie(S,ue,"Incantesimo rimosso dal personaggio")}B("Incantesimo centralizzato eliminato","success"),await b()})),(te=y.querySelector('[data-library-page="prev"]'))==null||te.addEventListener("click",()=>{c=Math.max(1,c-1),b()}),(le=y.querySelector('[data-library-page="next"]'))==null||le.addEventListener("click",()=>{c=Math.min(k,c+1),b()})};g.addEventListener("click",()=>{c=1,b()}),(Z=s.querySelector('select[name="sort"]'))==null||Z.addEventListener("change",()=>{c=1,b()}),(G=u.querySelector("[data-library-add-spell]"))==null||G.addEventListener("click",async()=>{const{user:t}=C();await me(null,async e=>{var A,f;try{const a=await ve({created_by:t==null?void 0:t.id,name:e.name,rules_version:e.rules_version||"2024",level:Number(e.level)||0,school:e.school||null,cast_time:e.cast_time||null,duration:e.duration||null,range:e.range||null,components:e.components||null,caster_classes:Array.isArray(e.caster_classes)?e.caster_classes:[],damage_die:e.damage_die||null,damage_modifier:e.damage_modifier??null,upcast_damage_die:e.upcast_damage_die||null,upcast_damage_modifier:e.upcast_damage_modifier??null,upcast_start_level:e.upcast_start_level??null,concentration:!!e.concentration,attack_roll:!!e.attack_roll,ritual:!!e.is_ritual,description:e.description||null}),h=C().activeCharacterId,o=C().characters.find($=>$.id===h);if((A=o==null?void 0:o.data)!=null&&A.is_spellcaster){const $={id:`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:a.id,name:a.name,level:a.level,kind:Number(a.level)===0?"cantrip":"spell",cast_time:a.cast_time||null,duration:a.duration||null,range:a.range||null,components:a.components||null,concentration:!!a.concentration,attack_roll:!!a.attack_roll,is_ritual:!!a.ritual,damage_die:a.damage_die||null,damage_modifier:a.damage_modifier??null,upcast_damage_die:a.upcast_damage_die||null,upcast_damage_modifier:a.upcast_damage_modifier??null,upcast_start_level:a.upcast_start_level??null,description:a.description||null,school:a.school||null,caster_classes:a.caster_classes||[],rules_version:a.rules_version||"2024",prep_state:"known"},R=Array.isArray((f=o.data)==null?void 0:f.spells)?o.data.spells:[];await ie(o,{...o.data||{},spells:[...R,$]},"Incantesimo aggiunto alla scheda personaggio"),await be({user_id:o.user_id,character_id:o.id,shared_spell_id:a.id,prep_state:"known"})}B("Incantesimo condiviso creato","success"),b()}catch(a){const h=String((a==null?void 0:a.message)||a||"Errore durante la creazione dell'incantesimo"),o=h.includes("shared_spells_name_rules_version_key")||h.toLowerCase().includes("duplicate key value violates unique constraint");B(o?"Esiste già un incantesimo simile nel catalogo centralizzato.":h,"error")}},null,{catalogMode:!0})}),await b()}export{ke as renderLibrary};
