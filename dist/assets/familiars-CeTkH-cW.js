import{k as Z,n as he,s as ge,c as de,b as ke,g as Ce,d as k,p as Ae,i as me,o as we}from"./index-DXBitu8v.js";import{openDiceOverlay as be}from"./dice-CIIItguY.js";import{g as R}from"./utils-Tv02vTp-.js";const ee="character_companions";async function Le(a){const{data:c,error:n}=await Z.from(ee).select("*").eq("character_id",a).order("created_at",{ascending:!0});if(n)throw n;return c??[]}async function qe(a){const{data:c,error:n}=await Z.from(ee).insert(a).select("*").single();if(n)throw n;return c}async function Me(a,c){const{data:n,error:v}=await Z.from(ee).update(c).eq("id",a).select("*").single();if(v)throw v;return n}async function Te(a){const{error:c}=await Z.from(ee).delete().eq("id",a);if(c)throw c}const M=["str","dex","con","wis","int","cha"],H={str:"FOR",dex:"DES",con:"COS",wis:"SAG",int:"INT",cha:"CAR"},ve=[{value:"familiar",label:"Famiglio"},{value:"summon",label:"Evocazione"},{value:"transformation",label:"Trasformazione"}],Ie={walk:{label:"Terra",icon:"🏃"},fly:{label:"Volo",icon:"🪽"},climb:{label:"Scalata",icon:"🧗"},burrow:{label:"Scavare",icon:"⛏️"}};function p(a){return String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}function F(a){const c=Number(a)||0;return c>=0?`+${c}`:`${c}`}function xe(a){var c;return((c=ve.find(n=>n.value===a))==null?void 0:c.label)||a||"Famiglio"}function ze(a){return a==null||a===""?"-":`${Number(a)||0} m`}function Be(){return{image_url:"",proficiency_bonus:2,abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10},saving_throws:{},initiative:null,darkvision_range_m:null,hp:{current:1,max:1},speeds:{walk:9,fly:null,climb:null,burrow:null},attacks:[]}}function T(a){const c=Be(),n=a&&typeof a=="object"?a:{};return{image_url:n.image_url||"",proficiency_bonus:Number(n.proficiency_bonus)||c.proficiency_bonus,abilities:{...c.abilities,...n.abilities||{}},saving_throws:{...c.saving_throws,...n.saving_throws||{}},initiative:n.initiative??c.initiative,darkvision_range_m:n.darkvision_range_m??c.darkvision_range_m,hp:{...c.hp,...n.hp||{}},speeds:{...c.speeds,...n.speeds||{}},attacks:Array.isArray(n.attacks)?n.attacks:[]}}function De(a,c){var N,S;const n=Number((N=a.abilities)==null?void 0:N[c])||10,v=R(n)??0,g=Number(a.proficiency_bonus)||0;return v+((S=a.saving_throws)!=null&&S[c]?g:0)}function Fe(a,c=!1){var C;const n=T(a.stat_block),v=Number(n.hp.current)||0,g=Math.max(Number(n.hp.max)||v||1,1),N=(C=n.image_url)==null?void 0:C.trim(),S=N?`<img src="${p(N)}" alt="Foto di ${p(a.name)}" />`:'<span aria-hidden="true">🐾</span>';return`
    <button class="familiar-quick-card ${c?"is-active":""}" type="button" data-select-companion="${p(a.id)}" aria-pressed="${c}">
      <span class="familiar-quick-card__avatar">${S}</span>
      <span class="familiar-quick-card__body">
        <strong>${p(a.name)}</strong>
        <span>${p(xe(a.kind))} · HP ${v}/${g}</span>
      </span>
    </button>
  `}function He(a,c=!1){var b,$,O;const n=T(a.stat_block),v=(b=n.image_url)==null?void 0:b.trim(),g=v?`<img src="${p(v)}" alt="Foto di ${p(a.name)}" />`:'<span aria-hidden="true">🐾</span>',N=M.map(f=>{var A;const _=Number((A=n.abilities)==null?void 0:A[f])||10,E=R(_)??0;return`
      <button class="stat-card stat-card--${f} stat-card--button familiar-ability-card" type="button" data-roll-ability="${p(a.id)}:${f}" aria-label="Tira ${H[f]} per ${p(a.name)}">
        <span>${H[f]}</span>
        <strong>${_}</strong>
        <span class="stat-card__modifier">${F(E)}</span>
      </button>
    `}).join(""),S=Object.entries(Ie).map(([f,_])=>{var E;return`
    <div class="familiar-vital-chip">
      <span>${_.icon} ${_.label}</span>
      <strong>${ze((E=n.speeds)==null?void 0:E[f])}</strong>
    </div>
  `}).join(""),C=n.initiative===null||n.initiative===void 0||n.initiative===""?R(Number(($=n.abilities)==null?void 0:$.dex)||10)??0:Number(n.initiative)||0,G=n.darkvision_range_m===null||n.darkvision_range_m===void 0||n.darkvision_range_m===""?"-":`${Number(n.darkvision_range_m)||0} m`,V=`
    <div class="familiar-vital-chip familiar-vital-chip--highlight"><span>Bonus comp.</span><strong>${F(n.proficiency_bonus)}</strong></div>
    <div class="familiar-vital-chip familiar-vital-chip--highlight"><span>Iniziativa</span><strong>${F(C)}</strong></div>
    <div class="familiar-vital-chip familiar-vital-chip--wide"><span>Scurovisione</span><strong>${G}</strong></div>
  `,t=n.attacks.length?n.attacks.map((f,_)=>{const E=Number(f.damage_modifier)||0,A=`${f.damage||"-"}${E?` (${F(E)})`:""}`;return`
      <div class="weapon-card familiar-attack-card" data-roll-attack-card="${p(a.id)}:${_}" role="button" tabindex="0" aria-label="Tira per colpire ${p(f.name||`Attacco ${_+1}`)}">
        <div class="weapon-card__main">
          <strong>${p(f.name||`Attacco ${_+1}`)}</strong>
          <p class="muted">Colpire ${F(f.to_hit||0)} · Danni ${p(A)}</p>
        </div>
        <div class="familiar-attack-actions">
          <button class="icon-button icon-button--damage" type="button" data-roll-damage="${p(a.id)}:${_}" aria-label="Tira danni ${p(f.name||`Attacco ${_+1}`)}">🔥</button>
        </div>
      </div>
    `}).join(""):'<p class="muted">Nessun attacco configurato.</p>',r=(O=a.notes)!=null&&O.trim()?`<div class="detail-card detail-card--text familiar-notes"><p>${p(a.notes)}</p></div>`:'<p class="muted">Nessuna nota aggiunta.</p>',l=Number(n.hp.current)||0,s=Math.max(Number(n.hp.max)||l||1,1),u=Math.min(Math.max(l/s*100,0),100);return`
    <article class="card home-card home-section familiar-sheet ${c?"is-active":""}" data-familiar-panel="${p(a.id)}" ${c?"":"hidden"}>
      <header class="card-header familiar-sheet__header">
        <button
          class="familiar-sheet__toggle"
          type="button"
          data-toggle-familiar-sheet="${p(a.id)}"
          aria-expanded="true"
          aria-controls="familiar-content-${p(a.id)}"
        >
          <span class="familiar-avatar ${v?"familiar-avatar--image":""}">${g}</span>
          <span class="familiar-sheet__title">
            <strong>${p(a.name)}</strong>
            <span class="character-meta">
              <span class="meta-tag">HP ${l}/${s}</span>
              <span class="meta-tag">Bonus comp. ${F(n.proficiency_bonus)}</span>
            </span>
            <span class="familiar-sheet__hp-summary" aria-label="Punti ferita ${l} su ${s}, ${Math.round(u)} percento">
              <span class="familiar-sheet__hp-track"><span style="width: ${u}%;"></span></span>
              <strong>${Math.round(u)}%</strong>
            </span>
          </span>
          <span class="familiar-sheet__chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="button-row familiar-sheet__actions">
          <button class="icon-button" data-edit-companion="${p(a.id)}" type="button" aria-label="Modifica ${p(a.name)}">✏️</button>
          <button class="icon-button" data-delete-companion="${p(a.id)}" type="button" aria-label="Elimina ${p(a.name)}">🗑️</button>
        </div>
      </header>
      <div class="familiar-dashboard" id="familiar-content-${p(a.id)}" data-familiar-content>
        <section class="home-section familiar-detail-panel familiar-characteristics-panel">
          <header class="familiar-panel-title">
            <p class="eyebrow">Caratteristiche</p>
          </header>
          <div class="stat-grid stat-grid--compact stat-grid--abilities familiar-characteristics-grid familiar-ability-grid">${N}</div>
        </section>
        <section class="home-section familiar-detail-panel familiar-vitals-panel">
          <header class="familiar-panel-title">
            <p class="eyebrow">Movimento & sensi</p>
          </header>
          <div class="familiar-vitals-grid">
            ${V}
            ${S}
          </div>
        </section>
        <section class="home-section home-scroll-panel familiar-detail-panel familiar-attacks-panel">
          <header class="familiar-panel-title">
            <p class="eyebrow">Attacchi</p>
          </header>
          <div class="home-scroll-body">${t}</div>
        </section>
        <section class="home-section familiar-detail-panel familiar-notes-panel">
          <header class="familiar-panel-title">
            <p class="eyebrow">Note</p>
          </header>
          ${r}
        </section>
      </div>
    </article>
  `}function pe(a,c,n="TA"){be({keepOpen:!0,title:a,mode:"d20",modifier:Number(c)||0,rollType:n,historyLabel:a})}async function fe(a){var G,V;const c=Ce(),n=he(c.activeCharacterId),v=c.characters.find(t=>he(t.id)===n);if(!v){a.innerHTML='<section class="card"><p>Nessun personaggio selezionato.</p></section>';return}ge(!0);let g=[];try{g=c.offline?[]:await Le(v.id)}catch{de("Errore caricamento famigli","error")}finally{ge(!1)}const N=(G=g[0])==null?void 0:G.id;a.innerHTML=`
    <div class="home-layout familiars-layout">
      <aside class="card home-card home-section familiars-quick-panel" aria-label="Seleziona famiglio">
        <div class="familiars-quick-panel__header">
          <div>
            <p class="eyebrow">Famigli & Evocazioni</p>
            <span class="muted">Selezione rapida</span>
          </div>
          <button class="icon-button icon-button--add" type="button" data-add-companion aria-label="Nuova scheda"><span aria-hidden="true">+</span></button>
        </div>
        ${g.length?`
          <div class="familiars-quick-list">
            ${g.map(t=>Fe(t,t.id===N)).join("")}
          </div>
        `:'<p class="muted">Nessuna evocazione o famiglio creato.</p>'}
      </aside>
      <main class="familiars-detail-area">
        ${g.length?g.map(t=>He(t,t.id===N)).join(""):`
          <section class="card home-card home-section familiar-empty-state">
            <p class="eyebrow">Nessuna scheda</p>
            <h3>Crea il primo famiglio</h3>
            <p class="muted">Aggiungi foto, caratteristiche, punti ferita, velocità, tiri salvezza e attacchi per tirare rapidamente durante la sessione.</p>
          </section>
        `}
      </main>
    </div>
  `;const S=async(t=null)=>{const r=T(t==null?void 0:t.stat_block);let l=(r.attacks||[]).map(e=>({name:(e==null?void 0:e.name)||"",to_hit:Number(e==null?void 0:e.to_hit)||0,damage:(e==null?void 0:e.damage)||"",damage_modifier:Number(e==null?void 0:e.damage_modifier)||0}));const s=document.createElement("div");s.className="character-edit-form character-edit-form--guided familiar-edit-form";const u=(e,i,{icon:m="",description:o=""}={})=>{const d=document.createElement("section");d.className="character-edit-group familiar-edit-group";const B=document.createElement("header");if(B.className="character-edit-group__header",m){const y=document.createElement("span");y.className="character-edit-group__icon",y.setAttribute("aria-hidden","true"),y.textContent=m,B.appendChild(y)}const D=document.createElement("div");D.className="character-edit-group__heading",D.innerHTML=`<h3>${e}</h3>${o?`<p>${o}</p>`:""}`,B.appendChild(D);const q=document.createElement("div");return q.className="character-edit-group__content",i.forEach(y=>{y.classList.add("character-edit-subsection"),q.appendChild(y)}),d.append(B,q),d},b=document.createElement("div");b.className="character-edit-section compact-character-section";const $=document.createElement("div");$.className="character-edit-grid character-edit-grid--identity familiar-edit-identity-grid";const O=k({label:"Nome",name:"name",value:(t==null?void 0:t.name)||""});O.querySelector("input").required=!0,$.appendChild(O);const f=document.createElement("label");f.className="field";const _=document.createElement("span");_.textContent="Tipologia";const E=document.createElement("select");E.name="kind",ve.forEach(e=>{const i=document.createElement("option");i.value=e.value,i.textContent=e.label,((t==null?void 0:t.kind)||"familiar")===e.value&&(i.selected=!0),E.appendChild(i)}),f.append(_,E),$.appendChild(f),$.appendChild(k({label:"Versione regole",name:"rules_version",value:(t==null?void 0:t.rules_version)||"2024"})),b.appendChild($),b.appendChild(k({label:"Foto (URL)",name:"image_url",value:r.image_url||"",placeholder:"https://.../famiglio.png"}));const A=document.createElement("div");A.className="character-edit-section compact-character-section",A.appendChild(Ae({label:"Note",name:"notes",value:(t==null?void 0:t.notes)||"",placeholder:"Tratti, sensi, azioni speciali o promemoria utili in gioco."}));const K=document.createElement("div");K.className="character-edit-section compact-character-section",K.innerHTML="<h4>Caratteristiche</h4>";const ae=document.createElement("div");ae.className="compact-ability-grid familiar-edit-ability-grid",M.forEach(e=>{const i=k({label:H[e],name:`ab_${e}`,type:"number",value:r.abilities[e]??10}),m=i.querySelector("input");m.min="1",m.step="1",ae.appendChild(i)}),K.appendChild(ae);const te=document.createElement("div");te.className="character-edit-section compact-character-section familiar-edit-saves-section",te.innerHTML=`
      <h4>Tiri salvezza</h4>
      <div class="compact-pill-grid familiar-edit-saves-grid">
        ${M.map(e=>{var i;return`
          <label class="toggle-pill">
            <input type="checkbox" name="save_${e}" ${(i=r.saving_throws)!=null&&i[e]?"checked":""} />
            <span>${H[e]}</span>
          </label>
        `}).join("")}
      </div>
    `;const U=document.createElement("div");U.className="character-edit-section compact-character-section",U.innerHTML="<h4>Punti ferita e velocità</h4>";const ie=document.createElement("div");ie.className="character-edit-grid familiar-edit-vitals-grid",[{label:"HP attuali",name:"hp_current",value:r.hp.current??1},{label:"HP massimi",name:"hp_max",value:r.hp.max??1},{label:"Bonus competenza",name:"proficiency_bonus",value:r.proficiency_bonus??2},{label:"Iniziativa",name:"initiative",value:r.initiative??R(Number(r.abilities.dex)||10)??0,allowNegative:!0},{label:"Scurovisione (m)",name:"darkvision_range_m",value:r.darkvision_range_m??""},{label:"Terra (m)",name:"speed_walk",value:r.speeds.walk??9},{label:"Volo (m)",name:"speed_fly",value:r.speeds.fly??""},{label:"Scalata (m)",name:"speed_climb",value:r.speeds.climb??""},{label:"Scavare (m)",name:"speed_burrow",value:r.speeds.burrow??""}].forEach(e=>{const i=k({label:e.label,name:e.name,type:"number",value:e.value}),m=i.querySelector("input");e.allowNegative||(m.min="0"),m.step="1",ie.appendChild(i)}),U.appendChild(ie);const Y=document.createElement("div");Y.className="character-edit-section compact-character-section familiar-edit-attacks-section",Y.innerHTML=`
      <div class="familiar-edit-section-header">
        <h4>Attacchi</h4>
        <p class="muted">Aggiungi righe strutturate invece di modificare il JSON manualmente.</p>
      </div>
    `;const J=document.createElement("input");J.type="hidden",J.name="attack_count";const w=document.createElement("div");w.className="familiar-edit-attack-list";const P=document.createElement("button");P.type="button",P.className="ghost-button ghost-button--compact familiar-edit-add-attack",P.textContent="+ Aggiungi attacco";const ue=()=>{l=Array.from(w.querySelectorAll("[data-attack-row]")).map(e=>{var i,m,o,d;return{name:((i=e.querySelector('[name^="attack_name_"]'))==null?void 0:i.value)||"",to_hit:Number((m=e.querySelector('[name^="attack_to_hit_"]'))==null?void 0:m.value)||0,damage:((o=e.querySelector('[name^="attack_damage_"]'))==null?void 0:o.value)||"",damage_modifier:Number((d=e.querySelector('[name^="attack_damage_modifier_"]'))==null?void 0:d.value)||0}})},ne=()=>{if(w.innerHTML="",J.value=String(l.length),!l.length){const e=document.createElement("p");e.className="muted familiar-edit-empty-attacks",e.textContent="Nessun attacco configurato.",w.appendChild(e);return}l.forEach((e,i)=>{const m=document.createElement("div");m.className="compact-special-skill-row familiar-edit-attack-row",m.dataset.attackRow=String(i);const o=document.createElement("div");o.className="compact-special-skill-grid familiar-edit-attack-grid",o.appendChild(k({label:"Nome",name:`attack_name_${i}`,value:e.name,placeholder:"Es. Morso"}));const d=k({label:"Tiro per colpire",name:`attack_to_hit_${i}`,type:"number",value:e.to_hit??0}),B=d.querySelector("input");B.step="1",o.appendChild(d),o.appendChild(k({label:"Danni",name:`attack_damage_${i}`,value:e.damage,placeholder:"Es. 1d6"}));const D=k({label:"Mod. danni",name:`attack_damage_modifier_${i}`,type:"number",value:e.damage_modifier??0});D.querySelector("input").step="1",o.appendChild(D);const q=document.createElement("div");q.className="character-toggle-group familiar-edit-attack-actions";const y=document.createElement("button");y.type="button",y.className="ghost-button ghost-button--compact",y.textContent="Rimuovi",y.addEventListener("click",()=>{ue(),l.splice(i,1),ne(),me(w)}),q.appendChild(y),m.append(o,q),w.appendChild(m)})};P.addEventListener("click",()=>{ue(),l.push({name:"",to_hit:0,damage:"",damage_modifier:0}),ne(),me(w)}),ne(),Y.append(J,w,P);const _e=[{title:"Identità",icon:"🐾",description:"Nome, tipologia e note.",content:u("Identità del famiglio",[b,A],{icon:"🐾",description:"Dati principali mostrati nella scheda famiglio."})},{title:"Statistiche",icon:"📊",description:"Caratteristiche, HP e velocità.",content:u("Statistiche",[K,te,U],{icon:"📊",description:"Valori usati per la mini-scheda e per i tiri rapidi."})},{title:"Attacchi",icon:"⚔️",description:"Azioni offensive.",content:u("Attacchi",[Y],{icon:"⚔️",description:"Configura i tiri per colpire che saranno lanciabili dalla scheda."})}],Q=document.createElement("div");Q.className="character-edit-stepper familiar-edit-stepper";const re=document.createElement("ol");re.className="character-edit-stepper-nav";const se=document.createElement("div");se.className="character-edit-stepper-content";const W=document.createElement("div");W.className="character-edit-stepper-actions character-edit-stepper-actions--footer";const I=document.createElement("button");I.type="button",I.className="secondary",I.textContent="Indietro";const x=document.createElement("button");x.type="button",x.className="primary",x.textContent="Avanti",W.append(I,x);const ce=[],z=[];_e.forEach((e,i)=>{const m=document.createElement("li"),o=document.createElement("button");o.type="button",o.className="character-edit-stepper-button",o.innerHTML=`
        <span class="step-index">${i+1}</span>
        <span class="character-edit-stepper-label">
          <span class="character-edit-stepper-title">${e.icon} ${e.title}</span>
          <span class="character-edit-stepper-description">${e.description}</span>
        </span>
      `,m.appendChild(o),re.appendChild(m),ce.push(o);const d=document.createElement("div");d.className="character-edit-step",d.dataset.step=String(i),d.appendChild(e.content),se.appendChild(d),z.push(d)});let L=0;const ye=e=>Array.from(e.querySelectorAll("input, select, textarea")),$e=e=>ye(e).filter(i=>i.required).every(i=>i.checkValidity()),X=()=>{const e=z.map(o=>$e(o)),i=e.findIndex(o=>!o),m=i===-1?z.length-1:i;z.forEach((o,d)=>o.classList.toggle("is-active",d===L)),ce.forEach((o,d)=>{o.classList.toggle("is-active",d===L),o.classList.toggle("is-complete",e[d]),o.disabled=d>m}),I.disabled=L===0,x.disabled=!e[L]||L>=z.length-1},le=e=>{L=Math.min(Math.max(e,0),z.length-1),X()};ce.forEach((e,i)=>e.addEventListener("click",()=>le(i))),I.addEventListener("click",()=>le(L-1)),x.addEventListener("click",()=>le(L+1)),s.addEventListener("input",X),s.addEventListener("change",X),Q.append(re,se),s.appendChild(Q),X();const h=await we({title:t?"Modifica famiglio":"Nuovo famiglio",submitLabel:t?"Salva":"Crea",content:s,cardClass:["modal-card--wide","modal-card--character-editor","modal-card--familiar-editor"],onOpen:({modal:e,fieldsEl:i})=>{me(i||s);const m=e.querySelector(".modal-footer"),o=m==null?void 0:m.querySelector(".modal-actions");if(!o)return null;const d=document.createElement("div");return d.className="modal-actions__center",d.appendChild(W),o.classList.add("modal-actions--with-center"),o.insertBefore(d,o.querySelector(".modal-actions__right")),()=>{d.remove(),o.classList.remove("modal-actions--with-center"),Q.appendChild(W)}}});if(!h)return;const j=e=>e===null||e===""?null:Number(e),Ee=M.reduce((e,i)=>(e[i]=Number(h.get(`ab_${i}`)||10),e),{}),Ne=Number(h.get("attack_count"))||0,Se=Array.from({length:Ne},(e,i)=>({name:String(h.get(`attack_name_${i}`)||"").trim(),to_hit:Number(h.get(`attack_to_hit_${i}`)||0),damage:String(h.get(`attack_damage_${i}`)||"").trim(),damage_modifier:Number(h.get(`attack_damage_modifier_${i}`)||0)})).filter(e=>e.name||e.damage),oe={user_id:v.user_id,character_id:v.id,name:String(h.get("name")||"").trim(),kind:h.get("kind")||"familiar",rules_version:String(h.get("rules_version")||"2024").trim()||"2024",stat_block:{image_url:String(h.get("image_url")||"").trim(),proficiency_bonus:Number(h.get("proficiency_bonus")||2),initiative:j(h.get("initiative")),darkvision_range_m:j(h.get("darkvision_range_m")),abilities:Ee,saving_throws:M.reduce((e,i)=>(e[i]=h.get(`save_${i}`)==="on",e),{}),hp:{current:Number(h.get("hp_current")||1),max:Number(h.get("hp_max")||1)},speeds:{walk:Number(h.get("speed_walk")||0),fly:j(h.get("speed_fly")),climb:j(h.get("speed_climb")),burrow:j(h.get("speed_burrow"))},attacks:Se},notes:String(h.get("notes")||"").trim()||null};if(!oe.name){de("Inserisci un nome","error");return}t?await Me(t.id,oe):await qe(oe),await fe(a)};(V=a.querySelector("[data-add-companion]"))==null||V.addEventListener("click",()=>{S()}),a.querySelectorAll("[data-select-companion]").forEach(t=>t.addEventListener("click",()=>{const r=t.dataset.selectCompanion;a.querySelectorAll("[data-select-companion]").forEach(l=>{const s=l.dataset.selectCompanion===r;l.classList.toggle("is-active",s),l.setAttribute("aria-pressed",String(s))}),a.querySelectorAll("[data-familiar-panel]").forEach(l=>{const s=l.dataset.familiarPanel===r;l.hidden=!s,l.classList.toggle("is-active",s)})})),a.querySelectorAll("[data-toggle-familiar-sheet]").forEach(t=>t.addEventListener("click",()=>{const r=t.closest("[data-familiar-panel]"),l=r==null?void 0:r.querySelector("[data-familiar-content]"),s=t.getAttribute("aria-expanded")!=="false";t.setAttribute("aria-expanded",String(!s)),r==null||r.classList.toggle("is-collapsed",s),l&&(l.hidden=s)})),a.querySelectorAll("[data-edit-companion]").forEach(t=>t.addEventListener("click",()=>{const r=g.find(l=>l.id===t.dataset.editCompanion);r&&S(r)})),a.querySelectorAll("[data-delete-companion]").forEach(t=>t.addEventListener("click",async()=>{const r=g.find(s=>s.id===t.dataset.deleteCompanion);!r||!await ke({title:"Conferma eliminazione",message:`Eliminare ${r.name}?`,confirmLabel:"Elimina"})||(await Te(r.id),await fe(a))})),a.querySelectorAll("[data-roll-ability]").forEach(t=>t.addEventListener("click",()=>{const[r,l]=String(t.dataset.rollAbility||"").split(":"),s=g.find($=>String($.id)===r);if(!s||!M.includes(l))return;const u=Number(T(s.stat_block).abilities[l])||10,b=R(u)??0;pe(`${s.name} · ${H[l]}`,b,"TA")})),a.querySelectorAll("[data-roll-save]").forEach(t=>t.addEventListener("click",()=>{const[r,l]=String(t.dataset.rollSave||"").split(":"),s=g.find(b=>String(b.id)===r);if(!s||!M.includes(l))return;const u=De(T(s.stat_block),l);pe(`${s.name} · TS ${H[l]}`,u,"TS")})),a.querySelectorAll("[data-roll-damage]").forEach(t=>t.addEventListener("click",()=>{const[r,l]=String(t.dataset.rollDamage||"").split(":"),s=g.find($=>String($.id)===r);if(!s)return;const u=T(s.stat_block).attacks[Number(l)||0],b=String((u==null?void 0:u.damage)||"").trim();if(!b||b==="-"){de("Danni non configurati per questo attacco","error");return}be({keepOpen:!0,title:`${s.name} · Danni ${u.name||"Attacco"}`,mode:"generic",notation:b,modifier:Number(u.damage_modifier)||0,rollType:"DMG",historyLabel:`${s.name} · ${u.name||"Danni"}`})}));const C=t=>{const[r,l]=String(t||"").split(":"),s=g.find(b=>String(b.id)===r);if(!s)return;const u=T(s.stat_block).attacks[Number(l)||0];u&&pe(`${s.name} · Tiro per colpire · ${u.name||"Attacco"}`,Number(u.to_hit)||0,"TC")};a.querySelectorAll("[data-roll-attack-card]").forEach(t=>{t.addEventListener("click",r=>{r.target.closest("button")||C(t.dataset.rollAttackCard)}),t.addEventListener("keydown",r=>{r.key!=="Enter"&&r.key!==" "||(r.preventDefault(),C(t.dataset.rollAttackCard))})}),a.querySelectorAll("[data-roll-attack]").forEach(t=>t.addEventListener("click",()=>{C(t.dataset.rollAttack)}))}export{fe as renderFamiliars};
