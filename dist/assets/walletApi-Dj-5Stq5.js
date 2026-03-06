import{l as w,o as Re,d as b,e as F,f as sa,b as B,j as Pe,a as ra}from"./index-BS7JkFzs.js";async function Ea(a){const{data:e,error:n}=await w.from("items").select("*").eq("character_id",a).order("created_at",{ascending:!0});if(n)throw n;return e??[]}async function ca(a){const{data:e,error:n}=await w.from("items").insert(a).select("*").single();if(n)throw n;return e}async function da(a,e){const{data:n,error:t}=await w.from("items").update(e).eq("id",a).select("*").single();if(t)throw t;return n}async function Ca(a){const{error:e}=await w.from("items").delete().eq("id",a);if(e)throw e}function La(a=[]){return a.reduce((e,n)=>{const t=Number(n.qty??0),l=Number(n.weight??0);return e+t*l},0)}function ka(a,e){const n={...a};return Object.keys(e).forEach(t=>{n[t]=Number(n[t]??0)+Number(e[t]??0)}),n}function ze(a,e="lb"){return a==null||Number.isNaN(a)?"-":`${Number(a).toFixed(2).replace(/\.00$/,"")} ${e}`}const De=[{value:"head",label:"Testa"},{value:"eyes-left",label:"Occhio sinistro"},{value:"eyes-right",label:"Occhio destro"},{value:"ears-left",label:"Orecchio sinistro"},{value:"ears-right",label:"Orecchio destro"},{value:"neck",label:"Collo"},{value:"shoulder-left",label:"Spalla sinistra"},{value:"shoulder-right",label:"Spalla destra"},{value:"back",label:"Schiena"},{value:"chest",label:"Torso"},{value:"arm-left",label:"Braccio sinistro"},{value:"arm-right",label:"Braccio destro"},{value:"hand-left",label:"Mano sinistra"},{value:"hand-right",label:"Mano destra"},{value:"wrist-left",label:"Polso sinistro"},{value:"wrist-right",label:"Polso destro"},{value:"waist",label:"Vita"},{value:"leg-left",label:"Gamba sinistra"},{value:"leg-right",label:"Gamba destra"},{value:"foot-left",label:"Piede sinistro"},{value:"foot-right",label:"Piede destro"},{value:"ring-left",label:"Dita/Anello sinistro"},{value:"ring-right",label:"Dita/Anello destro"},{value:"main-hand",label:"Mano principale"},{value:"off-hand",label:"Mano secondaria"},{value:"eyes",label:"Occhi (generico)"},{value:"ears",label:"Orecchie (generico)"},{value:"shoulders",label:"Spalle (generico)"},{value:"arms",label:"Braccia (generico)"},{value:"hands",label:"Mani (generico)"},{value:"wrists",label:"Polsi (generico)"},{value:"legs",label:"Gambe (generico)"},{value:"feet",label:"Piedi (generico)"},{value:"ring",label:"Dita/Anelli (generico)"}],se=[{value:"gear",label:"Vestiario",equipable:!0},{value:"loot",label:"Loot"},{value:"consumable",label:"Consumabili"},{value:"weapon",label:"Armi",equipable:!0},{value:"armor",label:"Armature",equipable:!0},{value:"jewelry",label:"Gioielli e ornamenti",equipable:!0},{value:"tool",label:"Strumenti"},{value:"container",label:"Contenitore",equipable:!0}],Ta=[{value:"",label:"Tutte"},...se],ua=new Map([...se.map(a=>[a.value,a.label]),["magic","Magici"]]),pa=new Map(De.map(a=>[a.value,a.label])),ma=[{value:"",label:"Seleziona"},{value:"simple",label:"Semplice"},{value:"martial",label:"Da guerra"}],ba=[{value:"",label:"Seleziona"},{value:"melee",label:"Mischia"},{value:"ranged",label:"Distanza"}],ga=[{value:"",label:"Seleziona"},{value:"str",label:"FOR"},{value:"dex",label:"DES"}],va=[{value:"",label:"Seleziona"},{value:"light",label:"Leggera"},{value:"medium",label:"Media"},{value:"heavy",label:"Pesante"}];function He(a){if(!a)return{};if(typeof a=="string")try{return JSON.parse(a)}catch{return{}}return a}function Ve(a){return ua.get(a)??(a||"Altro")}function fa(a){return pa.get(a)??a}function Fa(a){return a.map(e=>fa(e)).join(", ")}function Be(a){if(!a)return[];if(Array.isArray(a.equip_slots))return a.equip_slots.filter(Boolean);if(typeof a.equip_slots=="string"&&a.equip_slots.trim())try{const e=JSON.parse(a.equip_slots);if(Array.isArray(e))return e.filter(Boolean)}catch{return[a.equip_slots]}return a.equip_slot?[a.equip_slot]:[]}function _a(a){var e,n;return((n=(e=a.data)==null?void 0:e.settings)==null?void 0:n.weight_unit)??"lb"}function ha(a={}){return{magic:a.is_magic?"Magico":"Non magico",equipable:a.equipable?"Equipaggiabile":"Non equipaggiabile",attunement:a.attunement_active?"In sintonia":"Non in sintonia"}}function ya(a,e){var l;const n=((l=a.data)==null?void 0:l.proficiencies)||{},t=e.get("category");if(t==="weapon"){const s=e.get("weapon_type");return s?s==="simple"?!!n.weapon_simple:!!n.weapon_martial:!1}if(t==="armor"){if(e.get("is_shield")==="on")return!!n.shield;const r=e.get("armor_type");return r?r==="light"?!!n.armor_light:r==="medium"?!!n.armor_medium:!!n.armor_heavy:!1}return!0}function wa(a){const e="/dungeons-dragons-app/",n={pp:`${e}icons/moneta_platino.png`,gp:`${e}icons/moneta_oro.png`,sp:`${e}icons/moneta_argento.png`,cp:`${e}icons/moneta_rame.png`},t=He(a),l=["pp","gp","sp","cp"].map(r=>({coin:r,value:Number((t==null?void 0:t[r])??0)})).filter(r=>r.value!==0);return(l.length?l:[{coin:"gp",value:0}]).map((r,u)=>`
      ${u?'<span class="transaction-coin__divider" aria-hidden="true">·</span>':""}
      <span class="transaction-coin" data-coin="${r.coin}">
        <span class="coin-avatar coin-avatar--${r.coin}" aria-hidden="true">
          <img src="${n[r.coin]}" alt="" loading="lazy" />
        </span>
        <span class="transaction-coin__value">${r.value}</span>
      </span>
    `).join("")}function $a(a){const e=He(a),n=["pp","gp","sp","cp"].map(t=>({coin:t,value:Number((e==null?void 0:e[t])??0)})).filter(t=>t.value!==0);return n.length?n.map(t=>`${t.value} ${t.coin}`).join(" · "):"0 gp"}const qa=8;function Q(a,e,n,t,l){return`
      <label class="field wallet-edit-field">
        <span class="wallet-edit-field__label">
          <span class="coin-avatar ${l}" aria-hidden="true">
            <img src="${t}" alt="" loading="lazy" />
          </span>
          <span>${a}</span>
        </span>
        <input name="${e}" type="number" value="${n}" min="0" step="1" />
      </label>
  `}function Ma(a){const e=document.createElement("div");if(e.className="transaction-list",!a.length)return e.innerHTML='<p class="muted">Nessuna transazione registrata.</p>',e;const n=document.createElement("ul");n.className="transaction-items";const t=a.length>qa;return a.forEach(l=>{const s=document.createElement("li"),r=l.direction==="pay"?"Pagamento":"Entrata",u=wa(l.amount),g=$a(l.amount),p=l.direction==="pay"?"transaction-item--outgoing":"transaction-item--incoming";s.className=`transaction-item ${p}`,s.innerHTML=`
      <div class="transaction-info">
        <p class="muted">${l.reason||"Nessuna nota"}</p>
      </div>
      <span class="transaction-amount" aria-label="${g}">${u}</span>
      <div class="transaction-meta">
        <span class="resource-chip transaction-direction-chip ${l.direction==="pay"?"transaction-direction-chip--outgoing":"transaction-direction-chip--incoming"}">${r}</span>
        <div class="transaction-actions">
          <button class="icon-button transaction-action-button" type="button" data-edit-transaction="${l.id}" aria-label="Modifica transazione" title="Modifica">
            <span aria-hidden="true">✏️</span>
          </button>
          <button class="icon-button icon-button--danger transaction-action-button transaction-action-button--danger" type="button" data-delete-transaction="${l.id}" aria-label="Elimina transazione" title="Elimina">
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>
      </div>
    `,n.appendChild(s)}),e.classList.toggle("transaction-list--scrollable",t),e.appendChild(n),e}function Aa(a,e="lb"){const n=a.filter(s=>s.category==="container"),t=a.filter(s=>!s.container_item_id&&s.category!=="container");return`
    ${n.map(s=>{const r=a.filter(M=>M.container_item_id===s.id),u=r.reduce((M,N)=>{const I=Number(N.volume)||0,A=Number(N.qty)||1;return M+I*A},0),g=Number(s.max_volume)||null,p=g?`Volume ${u}/${g}`:u?`Volume ${u}`:"";return`
      <div class="inventory-group inventory-group--container">
        <div class="inventory-table__row inventory-table__row--container">
          <div class="inventory-table__cell inventory-table__cell--item">
            <div class="item-info-body">
              <strong>${s.name}</strong>
              ${p?`<span class="muted">${p}</span>`:""}
            </div>
          </div>
          <div class="inventory-table__cell">${Ve(s.category)}</div>
          <div class="inventory-table__cell">${s.qty}</div>
          <div class="inventory-table__cell">${ze(s.weight??0,e)}</div>
          <div class="inventory-table__cell">${s.max_volume??"-"}</div>
          <div class="inventory-table__cell inventory-table__cell--actions">
            <button class="resource-action-button icon-button" data-edit="${s.id}" aria-label="Modifica" title="Modifica">
              <span aria-hidden="true">✏️</span>
            </button>
            <button class="resource-action-button icon-button" data-delete="${s.id}" aria-label="Elimina" title="Elimina">
              <span aria-hidden="true">🗑️</span>
            </button>
          </div>
        </div>
        <div class="inventory-group__children">
          <p class="inventory-group__label">Contenuto del contenitore</p>
          ${Ie(r,e,{nested:!0,emptyLabel:"Nessun oggetto nel contenitore."})}
        </div>
      </div>
    `}).join("")}
    <div class="inventory-group">
      <p class="inventory-group__label">Oggetti non contenuti</p>
      ${Ie(t,e)}
    </div>
  `}function Ie(a,e="lb",{nested:n=!1,emptyLabel:t="Nessun oggetto."}={}){return a.length?`
    <div class="inventory-table ${n?"inventory-table--nested":""}">
      <div class="inventory-table__header">
        <span>Oggetto</span>
        <span>Categoria</span>
        <span>Qtà</span>
        <span>Peso</span>
        <span>Volume</span>
        <span>Azioni</span>
      </div>
      <div class="inventory-table__body">
        ${a.map(l=>{const s=l.volume!==null&&l.volume!==void 0?l.volume:"-",r=ha(l);return`
          <div class="inventory-table__row">
            <div class="inventory-table__badges">
              ${l.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${r.magic}</span>`:""}
              ${l.equipable?`<span class="resource-chip resource-chip--floating resource-chip--equipable">${r.equipable}</span>`:""}
              ${l.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${r.attunement}</span>`:""}
            </div>
            <div class="inventory-table__cell inventory-table__cell--item">
              ${l.image_url?`<img class="item-avatar" src="${l.image_url}" alt="Foto di ${l.name}" data-item-image="${l.id}" />`:""}
              <div class="item-info-body">
                <button class="item-name-button" type="button" data-item-preview="${l.id}" aria-label="Apri anteprima ${l.name}">${l.name}</button>
              </div>
            </div>
            <div class="inventory-table__cell">${Ve(l.category)}</div>
            <div class="inventory-table__cell">${l.qty}</div>
            <div class="inventory-table__cell">${ze(l.weight??0,e)}</div>
            <div class="inventory-table__cell">${s}</div>
            <div class="inventory-table__cell inventory-table__cell--actions">
              ${l.category==="consumable"?`<button class="resource-action-button" data-use="${l.id}">Consuma</button>`:""}
              <button class="resource-action-button icon-button" data-edit="${l.id}" aria-label="Modifica" title="Modifica">
                <span aria-hidden="true">✏️</span>
              </button>
              <button class="resource-action-button icon-button" data-delete="${l.id}" aria-label="Elimina" title="Elimina">
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
          </div>
        `}).join("")}
      </div>
    </div>
  `:`<p class="muted eyebrow">${t}</p>`}function xa({amount:a=0,coin:e="gp",reason:n="",occurredOn:t,direction:l="receive",includeDirection:s=!1}={}){const r=t||new Date().toISOString().split("T")[0];return`
    <div class="money-grid compact-grid-fields">
      <label class="field">
        <span>Quantità</span>
        <input name="amount" type="number" value="${a}" min="0" />
      </label>
      <label class="field">
        <span>Tipo moneta</span>
        <select name="coin">
          <option value="pp" ${e==="pp"?"selected":""}>Platino</option>
          <option value="gp" ${e==="gp"?"selected":""}>Oro</option>
          <option value="sp" ${e==="sp"?"selected":""}>Argento</option>
          <option value="cp" ${e==="cp"?"selected":""}>Rame</option>
        </select>
      </label>
       <label class="field">
      <span>Data</span>
      <input name="occurred_on" type="date" value="${r}" />
    </label>
    </div>
    ${s?`
      <div class="money-grid compact-grid-fields">
        <label class="field">
          <span>Direzione</span>
          <select name="direction">
            <option value="receive" ${l==="receive"?"selected":""}>Entrata</option>
            <option value="pay" ${l==="pay"?"selected":""}>Pagamento</option>
          </select>
        </label>
        <label class="field">
          <span>Motivo</span>
          <input name="reason" placeholder="Motivo" value="${n}" />
        </label>
      </div>
    `:`
      <label class="field">
        <span>Motivo</span>
        <input name="reason" placeholder="Motivo" value="${n}" />
      </label>
    `}
   
  `}function Oa({amount:a=0,source:e="gp",target:n="pp",targetAmount:t=0,available:l={}}={}){const s=[{key:"pp",label:"Platino",value:Number(l.pp??0)},{key:"gp",label:"Oro",value:Number(l.gp??0)},{key:"sp",label:"Argento",value:Number(l.sp??0)},{key:"cp",label:"Rame",value:Number(l.cp??0)}],r=s.some(p=>p.value>0),u=s.filter(p=>p.value>0).map(p=>`
          <option value="${p.key}" ${e===p.key?"selected":""}>${p.label}</option>
        `).join(""),g=s.map(p=>`
          <option value="${p.key}" ${n===p.key?"selected":""}>${p.label}</option>
        `).join("");return`
    <div class="modal-section">
      <h4 class="modal-section__title">Seleziona le monete da scambiare</h4>
      <div class="money-grid compact-grid-fields">
        <label class="field">
          <span>Tipo moneta</span>
          <select name="source" ${r?"":"disabled"}>
            ${r?u:'<option value="" selected>Nessuna moneta disponibile</option>'}
          </select>
        </label>
        <label class="field">
          <span>Quantità</span>
          <div class="field__input-row">
            <input name="amount" type="number" value="${a}" min="0" step="1" ${r?"":"disabled"} />
            <button class="chip chip--small" type="button" data-exchange-max ${r?"":"disabled"}>Max</button>
          </div>
          <span class="field__hint muted" data-exchange-available></span>
        </label>
      </div>
    </div>
    <div class="modal-section">
      <h4 class="modal-section__title">Scegli la moneta di destinazione</h4>
      <div class="money-grid compact-grid-fields">
        <label class="field">
          <span>Moneta di destinazione</span>
          <select name="target">
            ${g}
          </select>
        </label>
        <label class="field">
          <span>Controvalore</span>
          <input name="target_amount" type="number" value="${t}" min="0" step="1" readonly />
        </label>
      </div>
    </div>
  `}function Pa(a={}){const e="/dungeons-dragons-app/",n={pp:`${e}icons/moneta_platino.png`,gp:`${e}icons/moneta_oro.png`,sp:`${e}icons/moneta_argento.png`,cp:`${e}icons/moneta_rame.png`},t={pp:Number(a.pp??0),gp:Number(a.gp??0),sp:Number(a.sp??0),cp:Number(a.cp??0)};return`
    <div class="wallet-edit-grid compact-grid-fields">
      <div class="compact-field-grid">
        ${Q("Platino","pp",t.pp,n.pp,"coin-avatar--pp")}
        ${Q("Oro","gp",t.gp,n.gp,"coin-avatar--gp")}
      </div>
      <div class="compact-field-grid">
        ${Q("Argento","sp",t.sp,n.sp,"coin-avatar--sp")}
        ${Q("Rame","cp",t.cp,n.cp,"coin-avatar--cp")}
      </div>
    </div>
  `}function Ba(a){return`
   <div class="compact-field-grid">
      <label class="field">
        <span>Nome</span>
        <input name="name" required />
      </label>
       <label class="field">
        <span>Valore</span>
        <input name="value_cp" type="number" value="0" />
      </label>
   </div>
    <div class="compact-field-grid">  
      <label class="field">
        <span>Quantità</span>
        <input name="qty" type="number" value="1" min="0" step="any" />
      </label>
      <label class="field">
        <span>Peso</span>
        <input name="weight" type="number" value="0" min="0" step="any" />
      </label>
      <label class="field">
        <span>Volume</span>
        <input name="volume" type="number" value="0" min="0" step="any" />
      </label>
     
    </div>
  `}async function Ia(a,e,n,t){var Fe,Me;const l=o=>{o==null||o.querySelectorAll('input[type="number"]').forEach(i=>{var m,h,y;const d=(y=(h=(m=i.closest(".field"))==null?void 0:m.querySelector("span"))==null?void 0:h.textContent)==null?void 0:y.trim();ra(i,{decrementLabel:d?`Riduci ${d}`:"Diminuisci valore",incrementLabel:d?`Aumenta ${d}`:"Aumenta valore"})})},s=document.createElement("div");s.className="drawer-form modal-form-grid";const r=(o,i=[])=>{const d=document.createElement("section");d.className="item-modal-section";const m=document.createElement("h4");return m.className="item-modal-section__title",m.textContent=o,d.appendChild(m),i.filter(Boolean).forEach(h=>d.appendChild(h)),d},u=(o,i="balanced")=>{const d=document.createElement("div");return d.className=`modal-form-row modal-form-row--${i}`,o.filter(Boolean).forEach(m=>d.appendChild(m)),d},g=({name:o,label:i,checked:d=!1,type:m="checkbox",value:h=""})=>{const y=document.createElement("label");y.className="condition-modal__item item-modal-toggle-field";const L=h?` value="${h}"`:"";y.innerHTML=`
      <span class="condition-modal__item-label"><strong>${i}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="${m}" name="${o}"${L} ${d?"checked":""} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;const f=y.querySelector("input");return y.classList.toggle("is-selected",!!(f!=null&&f.checked)),f==null||f.addEventListener("change",()=>{y.classList.toggle("is-selected",f.checked)}),{field:y,input:f}},p=b({label:"Nome",name:"name",value:(e==null?void 0:e.name)??""}),M=b({label:"Foto (URL)",name:"image_url",placeholder:"https://.../oggetto.png",value:(e==null?void 0:e.image_url)??""}),N=r("Dati principali",[u([p,M],"balanced")]),I=b({label:"Quantità",name:"qty",type:"number",value:(e==null?void 0:e.qty)??1}),A=I.querySelector("input");A&&(A.min="0",A.step="any");const re=b({label:"Peso",name:"weight",type:"number",value:(e==null?void 0:e.weight)??0}),U=re.querySelector("input");if(U){const o=_a(a);U.min="0",U.step=o==="kg"?"0.1":"1"}const ce=b({label:"Volume",name:"volume",type:"number",value:(e==null?void 0:e.volume)??0}),J=ce.querySelector("input");J&&(J.min="0",J.step="any");const je=b({label:"Valore (cp)",name:"value_cp",type:"number",value:(e==null?void 0:e.value_cp)??0});N.appendChild(u([I,re,ce,je],"compact"));const v=F([{value:"",label:"Seleziona"},...se],(e==null?void 0:e.category)??"");v.name="category";const R=document.createElement("label");R.className="field",R.innerHTML="<span>Categoria</span>",R.appendChild(v);const Ge=[{value:"",label:"Nessuno"}].concat(n.filter(o=>o.category==="container").map(o=>({value:o.id,label:o.name}))),de=F(Ge,(e==null?void 0:e.container_item_id)??"");de.name="container_item_id";const z=document.createElement("label");z.className="field",z.innerHTML="<span>Contenitore</span>",z.appendChild(de);const X=b({label:"Volume massimo contenitore",name:"max_volume",type:"number",value:(e==null?void 0:e.max_volume)??""}),Y=X.querySelector("input"),D=document.createElement("div");D.className="item-modal-kind",D.innerHTML='<span class="item-modal-kind__label">Tipologia rapida</span>';const Z=document.createElement("div");Z.className="condition-modal__list item-modal-kind__list";const ue=[{value:"generic",label:"Oggetto"},{value:"weapon",label:"Arma"},{value:"armor",label:"Armatura"}].map(o=>{const i=document.createElement("label");return i.className="condition-modal__item item-modal-kind__item",i.innerHTML=`
      <span class="condition-modal__item-label"><strong>${o.label}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="radio" name="item_kind" value="${o.value}" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `,Z.appendChild(i),i.querySelector("input")});D.appendChild(Z),N.appendChild(D);const We=u([R,z,X],"balanced");N.appendChild(We);const H=document.createElement("div");H.className="condition-modal__list item-modal-toggle-list";const{field:Ke}=g({name:"attunement_active",label:"Sintonia attiva",checked:(e==null?void 0:e.attunement_active)??!1}),{field:Qe}=g({name:"is_magic",label:"Magico",checked:(e==null?void 0:e.is_magic)??!1});H.appendChild(Ke),H.appendChild(Qe),N.appendChild(H);const V=document.createElement("div");V.className="condition-modal__list item-modal-toggle-list";const{field:Ue,input:k}=g({name:"equipable",label:"Equipaggiabile",checked:(e==null?void 0:e.equipable)??!1}),{field:Je,input:x}=g({name:"sovrapponibile",label:"Sovrapponibile",checked:(e==null?void 0:e.sovrapponibile)??!1});V.appendChild(Ue),V.appendChild(Je);const O=document.createElement("fieldset");O.className="equip-slot-field",O.innerHTML="<legend>Punti del corpo</legend>";const ee=document.createElement("div");ee.className="equip-slot-list";const Xe=Be(e),Ye=De.map(o=>{const i=document.createElement("label");i.className="checkbox",i.innerHTML=`<input type="checkbox" name="equip_slots" value="${o.value}" /> <span>${o.label}</span>`;const d=i.querySelector("input");return d&&Xe.includes(o.value)&&(d.checked=!0),ee.appendChild(i),d});O.appendChild(ee);const Ze=r("Equipaggiamento",[V,O]),ea=r("Dettagli",[sa({label:"Note",name:"notes",value:(e==null?void 0:e.notes)??""})]),S=document.createElement("div");S.className="drawer-form modal-form-grid";const j=document.createElement("label");j.className="field",j.innerHTML="<span>Tipo arma</span>";const ae=F(ma,(e==null?void 0:e.weapon_type)??"");ae.name="weapon_type",j.appendChild(ae);const G=document.createElement("label");G.className="field",G.innerHTML="<span>Proprietà arma</span>";const ne=F(ba,(e==null?void 0:e.weapon_range)??"");ne.name="weapon_range",G.appendChild(ne);const W=document.createElement("label");W.className="field",W.innerHTML="<span>Caratteristica tiro per colpire</span>";const le=F(ga,(e==null?void 0:e.attack_ability)??"");le.name="attack_ability",W.appendChild(le);const pe=b({label:"Dado danno",name:"damage_die",placeholder:"Es. 1d8",value:(e==null?void 0:e.damage_die)??""}),me=b({label:"Modificatore per colpire",name:"attack_modifier",type:"number",value:(e==null?void 0:e.attack_modifier)??0}),be=b({label:"Modificatore danno",name:"damage_modifier",type:"number",value:(e==null?void 0:e.damage_modifier)??0}),{field:aa,input:E}=g({name:"is_thrown",label:"Proprietà lancio",checked:(e==null?void 0:e.is_thrown)??!1}),C=document.createElement("div");C.className="compact-field-grid";const na=b({label:"Portata arma (m)",name:"melee_range",type:"text",placeholder:"Es. 1,5",value:(e==null?void 0:e.melee_range)??1.5}),la=b({label:"Gittata normale",name:"range_normal",type:"number",value:(e==null?void 0:e.range_normal)??""}),ta=b({label:"Gittata svantaggio",name:"range_disadvantage",type:"number",value:(e==null?void 0:e.range_disadvantage)??""});C.appendChild(na),C.appendChild(la),C.appendChild(ta);const K=document.createElement("label");K.className="field",K.innerHTML="<span>Tipo armatura</span>";const te=F(va,(e==null?void 0:e.armor_type)??"");te.name="armor_type",K.appendChild(te);const{field:ge,input:_}=g({name:"is_shield",label:"Scudo",checked:(e==null?void 0:e.is_shield)??!1});ge.classList.add("item-modal-toggle-field--compact");const ve=b({label:"Classe armatura base",name:"armor_class",type:"number",value:(e==null?void 0:e.armor_class)??""}),fe=ve.querySelector("input"),_e=b({label:"Bonus armatura",name:"armor_bonus",type:"number",value:(e==null?void 0:e.armor_bonus)??0}),he=_e.querySelector("input"),ye=b({label:"Bonus scudo",name:"shield_bonus",type:"number",value:(e==null?void 0:e.shield_bonus)??2}),we=ye.querySelector("input"),$e=u([j,G,W],"balanced"),qe=u([pe,me,be],"compact"),Ne=u([aa],"compact"),Se=u([K,ve],"balanced"),oe=u([_e,ye,ge],"compact");oe.classList.add("item-modal-row--armor-bonus"),S.appendChild($e),S.appendChild(qe),S.appendChild(Ne),S.appendChild(C),S.appendChild(Se),S.appendChild(oe);const Ee=r("Statistiche arma / armatura",[S]);s.appendChild(N),s.appendChild(Ze),s.appendChild(Ee),s.appendChild(ea);const Ce=o=>o==="weapon"?"weapon":o==="armor"?"armor":"generic",ie=()=>{const o=Ce(v.value);ue.forEach(i=>{var m;if(!i)return;const d=i.value===o;i.checked=d,(m=i.closest(".condition-modal__item"))==null||m.classList.toggle("is-selected",d)})};ue.forEach(o=>{o==null||o.addEventListener("change",()=>{o.checked&&(o.value==="weapon"?v.value="weapon":o.value==="armor"?v.value="armor":(v.value==="weapon"||v.value==="armor")&&(v.value="gear"),ie(),T())})});const $=(o,i)=>{o&&(o.hidden=!i)},T=()=>{var Ae,xe,Oe;const o=(k==null?void 0:k.checked)??!1;Ye.forEach(q=>{q&&(q.disabled=!o,o||(q.checked=!1))}),x&&(x.disabled=!o,o||(x.checked=!1),(Ae=x.closest(".condition-modal__item"))==null||Ae.classList.toggle("is-selected",x.checked)),$(O,o);const i=v.value==="weapon",d=v.value==="armor",m=v.value==="container",h=Ce(v.value);ae.disabled=!i,ne.disabled=!i,le.disabled=!i,pe.querySelector("input").disabled=!i,me.querySelector("input").disabled=!i,be.querySelector("input").disabled=!i,E&&(E.disabled=!i,(xe=E.closest(".condition-modal__item"))==null||xe.classList.toggle("is-selected",E.checked)),C.querySelectorAll("input").forEach(q=>{q.disabled=!i,i?q.name==="melee_range"&&!q.value&&(q.value="1.5"):q.value=""}),te.disabled=!d,_&&(_.disabled=!d,(Oe=_.closest(".condition-modal__item"))==null||Oe.classList.toggle("is-selected",_.checked)),fe&&(fe.disabled=!d),he&&(he.disabled=!d),we&&(we.disabled=!d||!((_==null?void 0:_.checked)??!1));const L=h==="weapon",f=h==="armor";$($e,L),$(qe,L),$(Ne,L),$(C,L),$(Se,f),$(oe,f),$(Ee,L||f),$(X,m),Y&&(Y.disabled=!m,m||(Y.value=""))};k==null||k.addEventListener("change",T),v.addEventListener("change",()=>{ie(),T()}),_==null||_.addEventListener("change",T),E==null||E.addEventListener("change",T),ie(),T(),l(s);const c=await Re({title:e?"Modifica oggetto":"Nuovo oggetto",submitLabel:e?"Salva":"Crea",content:s,cardClass:["modal-card--wide","modal-card--scrollable"]});if(!c)return;const Le=c.get("equipable")==="on",P=Le?c.getAll("equip_slots"):[],oa=P[0]||null,ia=c.get("category");if(P.length&&!ya(a,c)){B("Non hai la competenza per equipaggiare questo oggetto","error");return}const ke=c.get("sovrapponibile")==="on";if(P.length&&!ke&&n.filter(i=>i.id!==(e==null?void 0:e.id)).filter(i=>Be(i).some(d=>P.includes(d))).length){B("Uno o più slot selezionati sono già occupati","error");return}const Te={user_id:a.user_id,character_id:a.id,name:c.get("name"),image_url:((Fe=c.get("image_url"))==null?void 0:Fe.trim())||null,qty:Number(c.get("qty")),weight:Number(c.get("weight")),volume:Number(c.get("volume"))||0,value_cp:Number(c.get("value_cp")),category:ia,container_item_id:c.get("container_item_id")||null,max_volume:c.get("max_volume")===""?null:Number(c.get("max_volume")),equipable:Le,equip_slot:oa,equip_slots:P,sovrapponibile:ke,attunement_active:c.get("attunement_active")==="on",is_magic:c.get("is_magic")==="on",notes:c.get("notes"),weapon_type:c.get("weapon_type")||null,weapon_range:c.get("weapon_range")||null,attack_ability:c.get("attack_ability")||null,damage_die:((Me=c.get("damage_die"))==null?void 0:Me.trim())||null,attack_modifier:Number(c.get("attack_modifier"))||0,damage_modifier:Number(c.get("damage_modifier"))||0,is_thrown:c.get("is_thrown")==="on",melee_range:(()=>{const o=String(c.get("melee_range")??"").trim().replace(",",".");if(!o)return null;const i=Number(o);return Number.isNaN(i)?null:i})(),range_normal:Number(c.get("range_normal"))||null,range_disadvantage:Number(c.get("range_disadvantage"))||null,armor_type:c.get("armor_type")||null,is_shield:c.get("is_shield")==="on",armor_class:Number(c.get("armor_class"))||null,armor_bonus:Number(c.get("armor_bonus"))||0,shield_bonus:Number(c.get("shield_bonus"))||0};Pe(!0);try{e?(await da(e.id,Te),B("Oggetto aggiornato")):(await ca(Te),B("Oggetto creato")),await(t==null?void 0:t())}catch{B("Errore salvataggio oggetto","error")}finally{Pe(!1)}}function Ra(a){var t,l;if(!(a!=null&&a.image_url))return;const e=document.createElement("div");e.className="equipment-preview-modal";const n=((t=a.description)==null?void 0:t.trim())||((l=a.notes)==null?void 0:l.trim())||"Nessuna descrizione disponibile per questo equipaggiamento.";e.innerHTML=`
    <div class="detail-card detail-card--text equipment-preview-card">
      <img class="equipment-preview-image" src="${a.image_url}" alt="Foto di ${a.name}" />
      <div class="equipment-preview-content">
        <p>${n}</p>
      </div>
    </div>
  `,Re({title:a.name||"Equipaggiamento",cancelLabel:null,content:e,cardClass:"modal-card--equipment-preview",showFooter:!1})}async function za(a){const{data:e,error:n}=await w.from("wallets").select("*").eq("character_id",a).single();if(n&&n.code!=="PGRST116")throw n;return e??null}async function Da(a){const{data:e,error:n}=await w.from("wallets").upsert(a).select("*").single();if(n)throw n;return e}async function Ha(a){const{data:e,error:n}=await w.from("money_transactions").insert(a).select("*").single();if(n)throw n;return e}async function Va(a){const{data:e,error:n}=await w.from("money_transactions").select("*").eq("character_id",a).order("created_at",{ascending:!1});if(n)throw n;return e??[]}async function ja(a,e){const{data:n,error:t}=await w.from("money_transactions").update(e).eq("id",a).select("*").single();if(t)throw t;return n}async function Ga(a){const{error:e}=await w.from("money_transactions").delete().eq("id",a);if(e)throw e}export{ja as A,Ga as B,ha as a,Ve as b,La as c,Fa as d,za as e,ze as f,_a as g,ka as h,Ha as i,ca as j,Ea as k,De as l,xa as m,da as n,Ra as o,Ba as p,Va as q,Ma as r,Ta as s,Oa as t,Da as u,Ia as v,Pa as w,Aa as x,He as y,Ca as z};
