import{f as Ne,d as Se,u as ke,c as Ce}from"./companionsApi-CJPRN_IJ.js";import{n as pe,s as ue,c as le,b as Ae,g as Le,d as k,p as we,i as oe,o as qe}from"./index-ChvAnTk7.js";import{openDiceOverlay as ge}from"./dice-BqFeArTX.js";import{g as R}from"./utils-Tv02vTp-.js";const M=["str","dex","con","wis","int","cha"],H={str:"FOR",dex:"DES",con:"COS",wis:"SAG",int:"INT",cha:"CAR"},fe=[{value:"familiar",label:"Famiglio"},{value:"summon",label:"Evocazione"},{value:"transformation",label:"Trasformazione"}],Me={walk:{label:"Terra",icon:"🏃"},fly:{label:"Volo",icon:"🪽"},climb:{label:"Scalata",icon:"🧗"},burrow:{label:"Scavare",icon:"⛏️"}};function p(a){return String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}function F(a){const o=Number(a)||0;return o>=0?`+${o}`:`${o}`}function Te(a){var o;return((o=fe.find(r=>r.value===a))==null?void 0:o.label)||a||"Famiglio"}function Ie(a){return a==null||a===""?"-":`${Number(a)||0} m`}function xe(){return{image_url:"",proficiency_bonus:2,abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10},saving_throws:{},initiative:null,darkvision_range_m:null,hp:{current:1,max:1},speeds:{walk:9,fly:null,climb:null,burrow:null},attacks:[]}}function T(a){const o=xe(),r=a&&typeof a=="object"?a:{};return{image_url:r.image_url||"",proficiency_bonus:Number(r.proficiency_bonus)||o.proficiency_bonus,abilities:{...o.abilities,...r.abilities||{}},saving_throws:{...o.saving_throws,...r.saving_throws||{}},initiative:r.initiative??o.initiative,darkvision_range_m:r.darkvision_range_m??o.darkvision_range_m,hp:{...o.hp,...r.hp||{}},speeds:{...o.speeds,...r.speeds||{}},attacks:Array.isArray(r.attacks)?r.attacks:[]}}function ze(a,o){var N,S;const r=Number((N=a.abilities)==null?void 0:N[o])||10,_=R(r)??0,g=Number(a.proficiency_bonus)||0;return _+((S=a.saving_throws)!=null&&S[o]?g:0)}function Be(a,o=!1){var C;const r=T(a.stat_block),_=Number(r.hp.current)||0,g=Math.max(Number(r.hp.max)||_||1,1),N=(C=r.image_url)==null?void 0:C.trim(),S=N?`<img src="${p(N)}" alt="Foto di ${p(a.name)}" />`:'<span aria-hidden="true">🐾</span>';return`
    <button class="familiar-quick-card ${o?"is-active":""}" type="button" data-select-companion="${p(a.id)}" aria-pressed="${o}">
      <span class="familiar-quick-card__avatar">${S}</span>
      <span class="familiar-quick-card__body">
        <strong>${p(a.name)}</strong>
        <span>${p(Te(a.kind))} · HP ${_}/${g}</span>
      </span>
    </button>
  `}function De(a,o=!1){var b,y,P;const r=T(a.stat_block),_=(b=r.image_url)==null?void 0:b.trim(),g=_?`<img src="${p(_)}" alt="Foto di ${p(a.name)}" />`:'<span aria-hidden="true">🐾</span>',N=M.map(f=>{var A;const v=Number((A=r.abilities)==null?void 0:A[f])||10,E=R(v)??0;return`
      <button class="stat-card stat-card--${f} stat-card--button familiar-ability-card" type="button" data-roll-ability="${p(a.id)}:${f}" aria-label="Tira ${H[f]} per ${p(a.name)}">
        <span>${H[f]}</span>
        <strong>${v}</strong>
        <span class="stat-card__modifier">${F(E)}</span>
      </button>
    `}).join(""),S=Object.entries(Me).map(([f,v])=>{var E;return`
    <div class="familiar-vital-chip">
      <span>${v.icon} ${v.label}</span>
      <strong>${Ie((E=r.speeds)==null?void 0:E[f])}</strong>
    </div>
  `}).join(""),C=r.initiative===null||r.initiative===void 0||r.initiative===""?R(Number((y=r.abilities)==null?void 0:y.dex)||10)??0:Number(r.initiative)||0,G=r.darkvision_range_m===null||r.darkvision_range_m===void 0||r.darkvision_range_m===""?"-":`${Number(r.darkvision_range_m)||0} m`,V=`
    <div class="familiar-vital-chip familiar-vital-chip--highlight"><span>Bonus comp.</span><strong>${F(r.proficiency_bonus)}</strong></div>
    <div class="familiar-vital-chip familiar-vital-chip--highlight"><span>Iniziativa</span><strong>${F(C)}</strong></div>
    <div class="familiar-vital-chip familiar-vital-chip--wide"><span>Scurovisione</span><strong>${G}</strong></div>
  `,t=r.attacks.length?r.attacks.map((f,v)=>{const E=Number(f.damage_modifier)||0,A=`${f.damage||"-"}${E?` (${F(E)})`:""}`;return`
      <div class="weapon-card familiar-attack-card" data-roll-attack-card="${p(a.id)}:${v}" role="button" tabindex="0" aria-label="Tira per colpire ${p(f.name||`Attacco ${v+1}`)}">
        <div class="weapon-card__main">
          <strong>${p(f.name||`Attacco ${v+1}`)}</strong>
          <p class="muted">Colpire ${F(f.to_hit||0)} · Danni ${p(A)}</p>
        </div>
        <div class="familiar-attack-actions">
          <button class="icon-button icon-button--damage" type="button" data-roll-damage="${p(a.id)}:${v}" aria-label="Tira danni ${p(f.name||`Attacco ${v+1}`)}">🔥</button>
        </div>
      </div>
    `}).join(""):'<p class="muted">Nessun attacco configurato.</p>',n=(P=a.notes)!=null&&P.trim()?`<div class="detail-card detail-card--text familiar-notes"><p>${p(a.notes)}</p></div>`:'<p class="muted">Nessuna nota aggiunta.</p>',c=Number(r.hp.current)||0,s=Math.max(Number(r.hp.max)||c||1,1),u=Math.min(Math.max(c/s*100,0),100);return`
    <article class="card home-card home-section familiar-sheet ${o?"is-active":""}" data-familiar-panel="${p(a.id)}" ${o?"":"hidden"}>
      <header class="card-header familiar-sheet__header">
        <button
          class="familiar-sheet__toggle"
          type="button"
          data-toggle-familiar-sheet="${p(a.id)}"
          aria-expanded="true"
          aria-controls="familiar-content-${p(a.id)}"
        >
          <span class="familiar-avatar ${_?"familiar-avatar--image":""}">${g}</span>
          <span class="familiar-sheet__title">
            <strong>${p(a.name)}</strong>
            <span class="character-meta">
              <span class="meta-tag">HP ${c}/${s}</span>
              <span class="meta-tag">Bonus comp. ${F(r.proficiency_bonus)}</span>
            </span>
            <span class="familiar-sheet__hp-summary" aria-label="Punti ferita ${c} su ${s}, ${Math.round(u)} percento">
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
          ${n}
        </section>
      </div>
    </article>
  `}function de(a,o,r="TA"){ge({keepOpen:!0,title:a,mode:"d20",modifier:Number(o)||0,rollType:r,historyLabel:a})}async function he(a){var G,V;const o=Le(),r=pe(o.activeCharacterId),_=o.characters.find(t=>pe(t.id)===r);if(!_){a.innerHTML='<section class="card"><p>Nessun personaggio selezionato.</p></section>';return}ue(!0);let g=[];try{g=o.offline?[]:await Ne(_.id)}catch{le("Errore caricamento famigli","error")}finally{ue(!1)}const N=(G=g[0])==null?void 0:G.id;a.innerHTML=`
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
            ${g.map(t=>Be(t,t.id===N)).join("")}
          </div>
        `:'<p class="muted">Nessuna evocazione o famiglio creato.</p>'}
      </aside>
      <main class="familiars-detail-area">
        ${g.length?g.map(t=>De(t,t.id===N)).join(""):`
          <section class="card home-card home-section familiar-empty-state">
            <p class="eyebrow">Nessuna scheda</p>
            <h3>Crea il primo famiglio</h3>
            <p class="muted">Aggiungi foto, caratteristiche, punti ferita, velocità, tiri salvezza e attacchi per tirare rapidamente durante la sessione.</p>
          </section>
        `}
      </main>
    </div>
  `;const S=async(t=null)=>{const n=T(t==null?void 0:t.stat_block);let c=(n.attacks||[]).map(e=>({name:(e==null?void 0:e.name)||"",to_hit:Number(e==null?void 0:e.to_hit)||0,damage:(e==null?void 0:e.damage)||"",damage_modifier:Number(e==null?void 0:e.damage_modifier)||0}));const s=document.createElement("div");s.className="character-edit-form character-edit-form--guided familiar-edit-form";const u=(e,i,{icon:m="",description:l=""}={})=>{const d=document.createElement("section");d.className="character-edit-group familiar-edit-group";const B=document.createElement("header");if(B.className="character-edit-group__header",m){const $=document.createElement("span");$.className="character-edit-group__icon",$.setAttribute("aria-hidden","true"),$.textContent=m,B.appendChild($)}const D=document.createElement("div");D.className="character-edit-group__heading",D.innerHTML=`<h3>${e}</h3>${l?`<p>${l}</p>`:""}`,B.appendChild(D);const q=document.createElement("div");return q.className="character-edit-group__content",i.forEach($=>{$.classList.add("character-edit-subsection"),q.appendChild($)}),d.append(B,q),d},b=document.createElement("div");b.className="character-edit-section compact-character-section";const y=document.createElement("div");y.className="character-edit-grid character-edit-grid--identity familiar-edit-identity-grid";const P=k({label:"Nome",name:"name",value:(t==null?void 0:t.name)||""});P.querySelector("input").required=!0,y.appendChild(P);const f=document.createElement("label");f.className="field";const v=document.createElement("span");v.textContent="Tipologia";const E=document.createElement("select");E.name="kind",fe.forEach(e=>{const i=document.createElement("option");i.value=e.value,i.textContent=e.label,((t==null?void 0:t.kind)||"familiar")===e.value&&(i.selected=!0),E.appendChild(i)}),f.append(v,E),y.appendChild(f),y.appendChild(k({label:"Versione regole",name:"rules_version",value:(t==null?void 0:t.rules_version)||"2024"})),b.appendChild(y),b.appendChild(k({label:"Foto (URL)",name:"image_url",value:n.image_url||"",placeholder:"https://.../famiglio.png"}));const A=document.createElement("div");A.className="character-edit-section compact-character-section",A.appendChild(we({label:"Note",name:"notes",value:(t==null?void 0:t.notes)||"",placeholder:"Tratti, sensi, azioni speciali o promemoria utili in gioco."}));const K=document.createElement("div");K.className="character-edit-section compact-character-section",K.innerHTML="<h4>Caratteristiche</h4>";const Z=document.createElement("div");Z.className="compact-ability-grid familiar-edit-ability-grid",M.forEach(e=>{const i=k({label:H[e],name:`ab_${e}`,type:"number",value:n.abilities[e]??10}),m=i.querySelector("input");m.min="1",m.step="1",Z.appendChild(i)}),K.appendChild(Z);const ee=document.createElement("div");ee.className="character-edit-section compact-character-section familiar-edit-saves-section",ee.innerHTML=`
      <h4>Tiri salvezza</h4>
      <div class="compact-pill-grid familiar-edit-saves-grid">
        ${M.map(e=>{var i;return`
          <label class="toggle-pill">
            <input type="checkbox" name="save_${e}" ${(i=n.saving_throws)!=null&&i[e]?"checked":""} />
            <span>${H[e]}</span>
          </label>
        `}).join("")}
      </div>
    `;const U=document.createElement("div");U.className="character-edit-section compact-character-section",U.innerHTML="<h4>Punti ferita e velocità</h4>";const ae=document.createElement("div");ae.className="character-edit-grid familiar-edit-vitals-grid",[{label:"HP attuali",name:"hp_current",value:n.hp.current??1},{label:"HP massimi",name:"hp_max",value:n.hp.max??1},{label:"Bonus competenza",name:"proficiency_bonus",value:n.proficiency_bonus??2},{label:"Iniziativa",name:"initiative",value:n.initiative??R(Number(n.abilities.dex)||10)??0,allowNegative:!0},{label:"Scurovisione (m)",name:"darkvision_range_m",value:n.darkvision_range_m??""},{label:"Terra (m)",name:"speed_walk",value:n.speeds.walk??9},{label:"Volo (m)",name:"speed_fly",value:n.speeds.fly??""},{label:"Scalata (m)",name:"speed_climb",value:n.speeds.climb??""},{label:"Scavare (m)",name:"speed_burrow",value:n.speeds.burrow??""}].forEach(e=>{const i=k({label:e.label,name:e.name,type:"number",value:e.value}),m=i.querySelector("input");e.allowNegative||(m.min="0"),m.step="1",ae.appendChild(i)}),U.appendChild(ae);const Y=document.createElement("div");Y.className="character-edit-section compact-character-section familiar-edit-attacks-section",Y.innerHTML=`
      <div class="familiar-edit-section-header">
        <h4>Attacchi</h4>
        <p class="muted">Aggiungi righe strutturate invece di modificare il JSON manualmente.</p>
      </div>
    `;const J=document.createElement("input");J.type="hidden",J.name="attack_count";const L=document.createElement("div");L.className="familiar-edit-attack-list";const O=document.createElement("button");O.type="button",O.className="ghost-button ghost-button--compact familiar-edit-add-attack",O.textContent="+ Aggiungi attacco";const me=()=>{c=Array.from(L.querySelectorAll("[data-attack-row]")).map(e=>{var i,m,l,d;return{name:((i=e.querySelector('[name^="attack_name_"]'))==null?void 0:i.value)||"",to_hit:Number((m=e.querySelector('[name^="attack_to_hit_"]'))==null?void 0:m.value)||0,damage:((l=e.querySelector('[name^="attack_damage_"]'))==null?void 0:l.value)||"",damage_modifier:Number((d=e.querySelector('[name^="attack_damage_modifier_"]'))==null?void 0:d.value)||0}})},te=()=>{if(L.innerHTML="",J.value=String(c.length),!c.length){const e=document.createElement("p");e.className="muted familiar-edit-empty-attacks",e.textContent="Nessun attacco configurato.",L.appendChild(e);return}c.forEach((e,i)=>{const m=document.createElement("div");m.className="compact-special-skill-row familiar-edit-attack-row",m.dataset.attackRow=String(i);const l=document.createElement("div");l.className="compact-special-skill-grid familiar-edit-attack-grid",l.appendChild(k({label:"Nome",name:`attack_name_${i}`,value:e.name,placeholder:"Es. Morso"}));const d=k({label:"Tiro per colpire",name:`attack_to_hit_${i}`,type:"number",value:e.to_hit??0}),B=d.querySelector("input");B.step="1",l.appendChild(d),l.appendChild(k({label:"Danni",name:`attack_damage_${i}`,value:e.damage,placeholder:"Es. 1d6"}));const D=k({label:"Mod. danni",name:`attack_damage_modifier_${i}`,type:"number",value:e.damage_modifier??0});D.querySelector("input").step="1",l.appendChild(D);const q=document.createElement("div");q.className="character-toggle-group familiar-edit-attack-actions";const $=document.createElement("button");$.type="button",$.className="ghost-button ghost-button--compact",$.textContent="Rimuovi",$.addEventListener("click",()=>{me(),c.splice(i,1),te(),oe(L)}),q.appendChild($),m.append(l,q),L.appendChild(m)})};O.addEventListener("click",()=>{me(),c.push({name:"",to_hit:0,damage:"",damage_modifier:0}),te(),oe(L)}),te(),Y.append(J,L,O);const be=[{title:"Identità",icon:"🐾",description:"Nome, tipologia e note.",content:u("Identità del famiglio",[b,A],{icon:"🐾",description:"Dati principali mostrati nella scheda famiglio."})},{title:"Statistiche",icon:"📊",description:"Caratteristiche, HP e velocità.",content:u("Statistiche",[K,ee,U],{icon:"📊",description:"Valori usati per la mini-scheda e per i tiri rapidi."})},{title:"Attacchi",icon:"⚔️",description:"Azioni offensive.",content:u("Attacchi",[Y],{icon:"⚔️",description:"Configura i tiri per colpire che saranno lanciabili dalla scheda."})}],Q=document.createElement("div");Q.className="character-edit-stepper familiar-edit-stepper";const ie=document.createElement("ol");ie.className="character-edit-stepper-nav";const ne=document.createElement("div");ne.className="character-edit-stepper-content";const W=document.createElement("div");W.className="character-edit-stepper-actions character-edit-stepper-actions--footer";const I=document.createElement("button");I.type="button",I.className="secondary",I.textContent="Indietro";const x=document.createElement("button");x.type="button",x.className="primary",x.textContent="Avanti",W.append(I,x);const re=[],z=[];be.forEach((e,i)=>{const m=document.createElement("li"),l=document.createElement("button");l.type="button",l.className="character-edit-stepper-button",l.innerHTML=`
        <span class="step-index">${i+1}</span>
        <span class="character-edit-stepper-label">
          <span class="character-edit-stepper-title">${e.icon} ${e.title}</span>
          <span class="character-edit-stepper-description">${e.description}</span>
        </span>
      `,m.appendChild(l),ie.appendChild(m),re.push(l);const d=document.createElement("div");d.className="character-edit-step",d.dataset.step=String(i),d.appendChild(e.content),ne.appendChild(d),z.push(d)});let w=0;const ve=e=>Array.from(e.querySelectorAll("input, select, textarea")),_e=e=>ve(e).filter(i=>i.required).every(i=>i.checkValidity()),X=()=>{const e=z.map(l=>_e(l)),i=e.findIndex(l=>!l),m=i===-1?z.length-1:i;z.forEach((l,d)=>l.classList.toggle("is-active",d===w)),re.forEach((l,d)=>{l.classList.toggle("is-active",d===w),l.classList.toggle("is-complete",e[d]),l.disabled=d>m}),I.disabled=w===0,x.disabled=!e[w]||w>=z.length-1},se=e=>{w=Math.min(Math.max(e,0),z.length-1),X()};re.forEach((e,i)=>e.addEventListener("click",()=>se(i))),I.addEventListener("click",()=>se(w-1)),x.addEventListener("click",()=>se(w+1)),s.addEventListener("input",X),s.addEventListener("change",X),Q.append(ie,ne),s.appendChild(Q),X();const h=await qe({title:t?"Modifica famiglio":"Nuovo famiglio",submitLabel:t?"Salva":"Crea",content:s,cardClass:["modal-card--wide","modal-card--character-editor","modal-card--familiar-editor"],onOpen:({modal:e,fieldsEl:i})=>{oe(i||s);const m=e.querySelector(".modal-footer"),l=m==null?void 0:m.querySelector(".modal-actions");if(!l)return null;const d=document.createElement("div");return d.className="modal-actions__center",d.appendChild(W),l.classList.add("modal-actions--with-center"),l.insertBefore(d,l.querySelector(".modal-actions__right")),()=>{d.remove(),l.classList.remove("modal-actions--with-center"),Q.appendChild(W)}}});if(!h)return;const j=e=>e===null||e===""?null:Number(e),$e=M.reduce((e,i)=>(e[i]=Number(h.get(`ab_${i}`)||10),e),{}),ye=Number(h.get("attack_count"))||0,Ee=Array.from({length:ye},(e,i)=>({name:String(h.get(`attack_name_${i}`)||"").trim(),to_hit:Number(h.get(`attack_to_hit_${i}`)||0),damage:String(h.get(`attack_damage_${i}`)||"").trim(),damage_modifier:Number(h.get(`attack_damage_modifier_${i}`)||0)})).filter(e=>e.name||e.damage),ce={user_id:_.user_id,character_id:_.id,name:String(h.get("name")||"").trim(),kind:h.get("kind")||"familiar",rules_version:String(h.get("rules_version")||"2024").trim()||"2024",stat_block:{image_url:String(h.get("image_url")||"").trim(),proficiency_bonus:Number(h.get("proficiency_bonus")||2),initiative:j(h.get("initiative")),darkvision_range_m:j(h.get("darkvision_range_m")),abilities:$e,saving_throws:M.reduce((e,i)=>(e[i]=h.get(`save_${i}`)==="on",e),{}),hp:{current:Number(h.get("hp_current")||1),max:Number(h.get("hp_max")||1)},speeds:{walk:Number(h.get("speed_walk")||0),fly:j(h.get("speed_fly")),climb:j(h.get("speed_climb")),burrow:j(h.get("speed_burrow"))},attacks:Ee},notes:String(h.get("notes")||"").trim()||null};if(!ce.name){le("Inserisci un nome","error");return}t?await ke(t.id,ce):await Ce(ce),await he(a)};(V=a.querySelector("[data-add-companion]"))==null||V.addEventListener("click",()=>{S()}),a.querySelectorAll("[data-select-companion]").forEach(t=>t.addEventListener("click",()=>{const n=t.dataset.selectCompanion;a.querySelectorAll("[data-select-companion]").forEach(c=>{const s=c.dataset.selectCompanion===n;c.classList.toggle("is-active",s),c.setAttribute("aria-pressed",String(s))}),a.querySelectorAll("[data-familiar-panel]").forEach(c=>{const s=c.dataset.familiarPanel===n;c.hidden=!s,c.classList.toggle("is-active",s)})})),a.querySelectorAll("[data-toggle-familiar-sheet]").forEach(t=>t.addEventListener("click",()=>{const n=t.closest("[data-familiar-panel]"),c=n==null?void 0:n.querySelector("[data-familiar-content]"),s=t.getAttribute("aria-expanded")!=="false";t.setAttribute("aria-expanded",String(!s)),n==null||n.classList.toggle("is-collapsed",s),c&&(c.hidden=s)})),a.querySelectorAll("[data-edit-companion]").forEach(t=>t.addEventListener("click",()=>{const n=g.find(c=>c.id===t.dataset.editCompanion);n&&S(n)})),a.querySelectorAll("[data-delete-companion]").forEach(t=>t.addEventListener("click",async()=>{const n=g.find(s=>s.id===t.dataset.deleteCompanion);!n||!await Ae({title:"Conferma eliminazione",message:`Eliminare ${n.name}?`,confirmLabel:"Elimina"})||(await Se(n.id),await he(a))})),a.querySelectorAll("[data-roll-ability]").forEach(t=>t.addEventListener("click",()=>{const[n,c]=String(t.dataset.rollAbility||"").split(":"),s=g.find(y=>String(y.id)===n);if(!s||!M.includes(c))return;const u=Number(T(s.stat_block).abilities[c])||10,b=R(u)??0;de(`${s.name} · ${H[c]}`,b,"TA")})),a.querySelectorAll("[data-roll-save]").forEach(t=>t.addEventListener("click",()=>{const[n,c]=String(t.dataset.rollSave||"").split(":"),s=g.find(b=>String(b.id)===n);if(!s||!M.includes(c))return;const u=ze(T(s.stat_block),c);de(`${s.name} · TS ${H[c]}`,u,"TS")})),a.querySelectorAll("[data-roll-damage]").forEach(t=>t.addEventListener("click",()=>{const[n,c]=String(t.dataset.rollDamage||"").split(":"),s=g.find(y=>String(y.id)===n);if(!s)return;const u=T(s.stat_block).attacks[Number(c)||0],b=String((u==null?void 0:u.damage)||"").trim();if(!b||b==="-"){le("Danni non configurati per questo attacco","error");return}ge({keepOpen:!0,title:`${s.name} · Danni ${u.name||"Attacco"}`,mode:"generic",notation:b,modifier:Number(u.damage_modifier)||0,rollType:"DMG",historyLabel:`${s.name} · ${u.name||"Danni"}`})}));const C=t=>{const[n,c]=String(t||"").split(":"),s=g.find(b=>String(b.id)===n);if(!s)return;const u=T(s.stat_block).attacks[Number(c)||0];u&&de(`${s.name} · Tiro per colpire · ${u.name||"Attacco"}`,Number(u.to_hit)||0,"TC")};a.querySelectorAll("[data-roll-attack-card]").forEach(t=>{t.addEventListener("click",n=>{n.target.closest("button")||C(t.dataset.rollAttackCard)}),t.addEventListener("keydown",n=>{n.key!=="Enter"&&n.key!==" "||(n.preventDefault(),C(t.dataset.rollAttackCard))})}),a.querySelectorAll("[data-roll-attack]").forEach(t=>t.addEventListener("click",()=>{C(t.dataset.rollAttack)}))}export{he as renderFamiliars};
