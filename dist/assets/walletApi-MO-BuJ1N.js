import{k as T,o as ca,d as g,e as L,p as Ra,c as W,s as oa,j as za}from"./index-CNi2Bj6m.js";async function nn(a){const{data:e,error:l}=await T.from("items").select("*").eq("character_id",a).order("created_at",{ascending:!0});if(l)throw l;return e??[]}async function Da(a){const{data:e,error:l}=await T.from("items").insert(a).select("*").single();if(l)throw l;return e}async function xa(a,e){const{data:l,error:i}=await T.from("items").update(e).eq("id",a).select("*").single();if(i)throw i;return l}async function ln(a){const{error:e}=await T.from("items").delete().eq("id",a);if(e)throw e}function tn(a=[]){return a.reduce((e,l)=>{const i=Number(l.qty??0),t=Number(l.weight??0);return e+i*t},0)}function on(a,e){const l={...a};return Object.keys(e).forEach(i=>{l[i]=Number(l[i]??0)+Number(e[i]??0)}),l}function da(a,e="lb"){return a==null||Number.isNaN(a)?"-":`${Number(a).toFixed(2).replace(/\.00$/,"")} ${e}`}const ua=[{value:"head",label:"Testa"},{value:"eyes-left",label:"Occhio sinistro"},{value:"eyes-right",label:"Occhio destro"},{value:"ears-left",label:"Orecchio sinistro"},{value:"ears-right",label:"Orecchio destro"},{value:"neck",label:"Collo"},{value:"shoulder-left",label:"Spalla sinistra"},{value:"shoulder-right",label:"Spalla destra"},{value:"back",label:"Schiena"},{value:"chest",label:"Torso"},{value:"arm-left",label:"Braccio sinistro"},{value:"arm-right",label:"Braccio destro"},{value:"hand-left",label:"Mano sinistra"},{value:"hand-right",label:"Mano destra"},{value:"wrist-left",label:"Polso sinistro"},{value:"wrist-right",label:"Polso destro"},{value:"waist",label:"Vita"},{value:"leg-left",label:"Gamba sinistra"},{value:"leg-right",label:"Gamba destra"},{value:"foot-left",label:"Piede sinistro"},{value:"foot-right",label:"Piede destro"},{value:"ring-left",label:"Dita/Anello sinistro"},{value:"ring-right",label:"Dita/Anello destro"},{value:"main-hand",label:"Mano principale"},{value:"off-hand",label:"Mano secondaria"},{value:"eyes",label:"Occhi (generico)"},{value:"ears",label:"Orecchie (generico)"},{value:"shoulders",label:"Spalle (generico)"},{value:"arms",label:"Braccia (generico)"},{value:"hands",label:"Mani (generico)"},{value:"wrists",label:"Polsi (generico)"},{value:"legs",label:"Gambe (generico)"},{value:"feet",label:"Piedi (generico)"},{value:"ring",label:"Dita/Anelli (generico)"}],Ne=[{value:"gear",label:"Vestiario",equipable:!0},{value:"loot",label:"Loot"},{value:"consumable",label:"Consumabili"},{value:"weapon",label:"Armi",equipable:!0},{value:"armor",label:"Armature",equipable:!0},{value:"jewelry",label:"Gioielli e ornamenti",equipable:!0},{value:"tool",label:"Strumenti"},{value:"container",label:"Contenitore",equipable:!0}],sn=[{value:"",label:"Tutte"},...Ne],Ba=new Map([...Ne.map(a=>[a.value,a.label]),["magic","Magici"]]),Ha=new Map(ua.map(a=>[a.value,a.label])),Va=[{value:"",label:"Seleziona"},{value:"simple",label:"Semplice"},{value:"martial",label:"Da guerra"}],ja=[{value:"",label:"Seleziona"},{value:"melee",label:"Mischia"},{value:"ranged",label:"Distanza"}],Wa=[{value:"",label:"Seleziona"},{value:"str",label:"FOR"},{value:"dex",label:"DES"}],Ga=[{value:"",label:"Seleziona"},{value:"light",label:"Leggera"},{value:"medium",label:"Media"},{value:"heavy",label:"Pesante"}],$e=[{value:"",label:"Nessuna"},{value:"arrow",label:"Frecce"},{value:"bolt",label:"Dardi"},{value:"bullet",label:"Proiettili"}],qe=[{value:"",label:"Seleziona"},{value:"acid",label:"Acido"},{value:"bludgeoning",label:"Contundente"},{value:"piercing",label:"Perforante"},{value:"slashing",label:"Tagliente"},{value:"cold",label:"Freddo"},{value:"fire",label:"Fuoco"},{value:"force",label:"Forza"},{value:"lightning",label:"Fulmine"},{value:"thunder",label:"Tuono"},{value:"necrotic",label:"Necrotico"},{value:"poison",label:"Veleno"},{value:"psychic",label:"Psichico"},{value:"radiant",label:"Radioso"}],ia=new Map($e.map(a=>[a.value,a.label])),Ka=new Map(qe.map(a=>[a.value,a.label]));function pa(a){if(!a)return{};if(typeof a=="string")try{return JSON.parse(a)}catch{return{}}return a}function ma(a){return Ba.get(a)??(a||"Altro")}function Qa(a){return Ha.get(a)??a}function rn(a){return a.map(e=>Qa(e)).join(", ")}function sa(a){if(!a)return[];if(Array.isArray(a.equip_slots))return a.equip_slots.filter(Boolean);if(typeof a.equip_slots=="string"&&a.equip_slots.trim())try{const e=JSON.parse(a.equip_slots);if(Array.isArray(e))return e.filter(Boolean)}catch{return[a.equip_slots]}return a.equip_slot?[a.equip_slot]:[]}function Ja(a){var e,l;return((l=(e=a.data)==null?void 0:e.settings)==null?void 0:l.weight_unit)??"lb"}function Ua(a={}){return{magic:a.is_magic?"Magico":"Non magico",equipable:a.equipable?"Equipaggiabile":"Non equipaggiabile",attunement:a.attunement_active?"In sintonia":"Non in sintonia"}}function Xa(a,e){var t;const l=((t=a.data)==null?void 0:t.proficiencies)||{},i=e.get("category");if(i==="weapon"){const r=e.get("weapon_type");return r?r==="simple"?!!l.weapon_simple:!!l.weapon_martial:!1}if(i==="armor"){if(e.get("is_shield")==="on")return!!l.shield;const d=e.get("armor_type");return d?d==="light"?!!l.armor_light:d==="medium"?!!l.armor_medium:!!l.armor_heavy:!1}return!0}function Ya(a){const e="/dungeons-dragons-app/",l={pp:`${e}icons/moneta_platino.png`,gp:`${e}icons/moneta_oro.png`,sp:`${e}icons/moneta_argento.png`,cp:`${e}icons/moneta_rame.png`},i=pa(a),t=["pp","gp","sp","cp"].map(d=>({coin:d,value:Number((i==null?void 0:i[d])??0)})).filter(d=>d.value!==0);return(t.length?t:[{coin:"gp",value:0}]).map((d,m)=>`
      ${m?'<span class="transaction-coin__divider" aria-hidden="true">·</span>':""}
      <span class="transaction-coin" data-coin="${d.coin}">
        <span class="coin-avatar coin-avatar--${d.coin}" aria-hidden="true">
          <img src="${l[d.coin]}" alt="" loading="lazy" />
        </span>
        <span class="transaction-coin__value">${d.value}</span>
      </span>
    `).join("")}function Za(a){const e=pa(a),l=["pp","gp","sp","cp"].map(i=>({coin:i,value:Number((e==null?void 0:e[i])??0)})).filter(i=>i.value!==0);return l.length?l.map(i=>`${i.value} ${i.coin}`).join(" · "):"0 gp"}const Ia=8;function te(a,e,l,i,t){return`
      <label class="field wallet-edit-field">
        <span class="wallet-edit-field__label">
          <span class="coin-avatar ${t}" aria-hidden="true">
            <img src="${i}" alt="" loading="lazy" />
          </span>
          <span>${a}</span>
        </span>
        <input name="${e}" type="number" value="${l}" min="0" step="1" />
      </label>
  `}function cn(a){const e=document.createElement("div");if(e.className="transaction-list",!a.length)return e.innerHTML='<p class="muted">Nessuna transazione registrata.</p>',e;const l=document.createElement("ul");l.className="transaction-items";const i=a.length>Ia;return a.forEach(t=>{const r=document.createElement("li"),d=t.direction==="pay"?"Pagamento":"Entrata",m=Ya(t.amount),v=Za(t.amount),b=t.direction==="pay"?"transaction-item--outgoing":"transaction-item--incoming";r.className=`transaction-item ${b}`,r.innerHTML=`
      <div class="transaction-info">
        <p class="muted">${t.reason||"Nessuna nota"}</p>
      </div>
      <span class="transaction-amount" aria-label="${v}">${m}</span>
      <div class="transaction-meta">
        <span class="resource-chip transaction-direction-chip ${t.direction==="pay"?"transaction-direction-chip--outgoing":"transaction-direction-chip--incoming"}">${d}</span>
        <div class="transaction-actions">
          <button class="icon-button transaction-action-button" type="button" data-edit-transaction="${t.id}" aria-label="Modifica transazione" title="Modifica">
            <span aria-hidden="true">✏️</span>
          </button>
          <button class="icon-button icon-button--danger transaction-action-button transaction-action-button--danger" type="button" data-delete-transaction="${t.id}" aria-label="Elimina transazione" title="Elimina">
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>
      </div>
    `,l.appendChild(r)}),e.classList.toggle("transaction-list--scrollable",i),e.appendChild(l),e}function dn(a,e="lb"){const l=a.filter(r=>r.category==="container"),i=a.filter(r=>!r.container_item_id&&r.category!=="container");return`
    ${l.map(r=>{const d=a.filter(z=>z.container_item_id===r.id),m=d.reduce((z,C)=>{const G=Number(C.volume)||0,D=Number(C.qty)||1;return z+G*D},0),v=Number(r.max_volume)||null,b=v?`Volume ${m}/${v}`:m?`Volume ${m}`:"";return`
      <details class="inventory-group inventory-group--container inventory-container-accordion" open>
        <summary class="inventory-table__row inventory-table__row--container inventory-container-accordion__summary">
          <div class="inventory-table__cell inventory-table__cell--item">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <div class="item-info-body">
              <strong>${r.name}</strong>
              ${b?`<span class="muted">${b}</span>`:""}
            </div>
          </div>
          <div class="inventory-table__cell">${ma(r.category)}</div>
          <div class="inventory-table__cell">${r.qty}</div>
          <div class="inventory-table__cell">${da(r.weight??0,e)}</div>
          <div class="inventory-table__cell">${r.max_volume??"-"}</div>
          <div class="inventory-table__cell inventory-table__cell--actions">
            <button class="resource-action-button icon-button" data-edit="${r.id}" aria-label="Modifica" title="Modifica">
              <span aria-hidden="true">✏️</span>
            </button>
            <button class="resource-action-button icon-button" data-delete="${r.id}" aria-label="Elimina" title="Elimina">
              <span aria-hidden="true">🗑️</span>
            </button>
          </div>
        </summary>
        <div class="inventory-group__children">
          <p class="inventory-group__label">Contenuto del contenitore</p>
          ${ra(d,e,{nested:!0,emptyLabel:"Nessun oggetto nel contenitore."})}
        </div>
      </details>
    `}).join("")}
    <div class="inventory-group">
      <p class="inventory-group__label">Oggetti non contenuti</p>
      ${ra(i,e)}
    </div>
  `}function ra(a,e="lb",{nested:l=!1,emptyLabel:i="Nessun oggetto."}={}){return a.length?`
    <div class="inventory-table ${l?"inventory-table--nested":""}">
      <div class="inventory-table__header">
        <span>Oggetto</span>
        <span>Cat.</span>
        <span>Qtà</span>
        <span>Peso</span>
        <span>Vol.</span>
        <span>Azioni</span>
      </div>
      <div class="inventory-table__body">
        ${a.map(t=>{const r=t.volume!==null&&t.volume!==void 0?t.volume:"-",d=Ua(t);return`
          <div class="inventory-table__row">
            <div class="inventory-table__badges">
              ${t.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${d.magic}</span>`:""}
              ${t.equipable?`<span class="resource-chip resource-chip--floating resource-chip--equipable">${d.equipable}</span>`:""}
              ${t.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${d.attunement}</span>`:""}
            </div>
            <div class="inventory-table__cell inventory-table__cell--item">
              ${t.image_url?`<img class="item-avatar" src="${t.image_url}" alt="Foto di ${t.name}" data-item-image="${t.id}" />`:""}
              <div class="item-info-body">
                <button class="item-name-button" type="button" data-item-preview="${t.id}" aria-label="Apri anteprima ${t.name}">${t.name}</button>
                ${t.ammunition_type?`<span class="muted">Munizioni: ${ia.get(t.ammunition_type)||t.ammunition_type}</span>`:""}
                ${t.consumes_ammunition?`<span class="muted">Consuma: ${ia.get(t.required_ammunition_type)||t.required_ammunition_type||"munizioni"}</span>`:""}
                ${t.damage_type?`<span class="muted">Danno: ${Ka.get(t.damage_type)||t.damage_type}</span>`:""}
              </div>
            </div>
            <div class="inventory-table__cell">${ma(t.category)}</div>
            <div class="inventory-table__cell">${t.qty}</div>
            <div class="inventory-table__cell">${da(t.weight??0,e)}</div>
            <div class="inventory-table__cell">${r}</div>
            <div class="inventory-table__cell inventory-table__cell--actions">
              ${t.category==="consumable"?`<button class="resource-action-button" data-use="${t.id}">Consuma</button>`:""}
              <button class="resource-action-button icon-button" data-edit="${t.id}" aria-label="Modifica" title="Modifica">
                <span aria-hidden="true">✏️</span>
              </button>
              <button class="resource-action-button icon-button" data-delete="${t.id}" aria-label="Elimina" title="Elimina">
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
          </div>
        `}).join("")}
      </div>
    </div>
  `:`<p class="muted eyebrow">${i}</p>`}function un({amount:a=0,coin:e="gp",reason:l="",occurredOn:i,direction:t="receive",includeDirection:r=!1}={}){const d=i||new Date().toISOString().split("T")[0];return`
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
      <input name="occurred_on" type="date" value="${d}" />
    </label>
    </div>
    ${r?`
      <div class="money-grid compact-grid-fields">
        <label class="field">
          <span>Direzione</span>
          <select name="direction">
            <option value="receive" ${t==="receive"?"selected":""}>Entrata</option>
            <option value="pay" ${t==="pay"?"selected":""}>Pagamento</option>
          </select>
        </label>
        <label class="field">
          <span>Motivo</span>
          <input name="reason" placeholder="Motivo" value="${l}" />
        </label>
      </div>
    `:`
      <label class="field">
        <span>Motivo</span>
        <input name="reason" placeholder="Motivo" value="${l}" />
      </label>
    `}
   
  `}function pn({amount:a=0,source:e="gp",target:l="pp",targetAmount:i=0,available:t={}}={}){const r=[{key:"pp",label:"Platino",value:Number(t.pp??0)},{key:"gp",label:"Oro",value:Number(t.gp??0)},{key:"sp",label:"Argento",value:Number(t.sp??0)},{key:"cp",label:"Rame",value:Number(t.cp??0)}],d=r.some(b=>b.value>0),m=r.filter(b=>b.value>0).map(b=>`
          <option value="${b.key}" ${e===b.key?"selected":""}>${b.label}</option>
        `).join(""),v=r.map(b=>`
          <option value="${b.key}" ${l===b.key?"selected":""}>${b.label}</option>
        `).join("");return`
    <div class="modal-section">
      <h4 class="modal-section__title">Seleziona le monete da scambiare</h4>
      <div class="money-grid compact-grid-fields">
        <label class="field">
          <span>Tipo moneta</span>
          <select name="source" ${d?"":"disabled"}>
            ${d?m:'<option value="" selected>Nessuna moneta disponibile</option>'}
          </select>
        </label>
        <label class="field">
          <span>Quantità</span>
          <div class="field__input-row">
            <input name="amount" type="number" value="${a}" min="0" step="1" ${d?"":"disabled"} />
            <button class="chip chip--small" type="button" data-exchange-max ${d?"":"disabled"}>Max</button>
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
            ${v}
          </select>
        </label>
        <label class="field">
          <span>Controvalore</span>
          <input name="target_amount" type="number" value="${i}" min="0" step="1" readonly />
        </label>
      </div>
    </div>
  `}function mn(a={}){const e="/dungeons-dragons-app/",l={pp:`${e}icons/moneta_platino.png`,gp:`${e}icons/moneta_oro.png`,sp:`${e}icons/moneta_argento.png`,cp:`${e}icons/moneta_rame.png`},i={pp:Number(a.pp??0),gp:Number(a.gp??0),sp:Number(a.sp??0),cp:Number(a.cp??0)};return`
    <div class="wallet-edit-grid compact-grid-fields">
      <div class="compact-field-grid">
        ${te("Platino","pp",i.pp,l.pp,"coin-avatar--pp")}
        ${te("Oro","gp",i.gp,l.gp,"coin-avatar--gp")}
      </div>
      <div class="compact-field-grid">
        ${te("Argento","sp",i.sp,l.sp,"coin-avatar--sp")}
        ${te("Rame","cp",i.cp,l.cp,"coin-avatar--cp")}
      </div>
    </div>
  `}function gn(a){return`
   <div class="compact-field-grid">
      <label class="field">
        <span>Nome</span>
        <input name="name" required />
      </label>
       <label class="field">
        <span>Valore</span>
        <input name="value_cp" type="number" value="0" min="0" step="1" />
      </label>
   </div>
    <div class="compact-field-grid">  
      <label class="field">
        <span>Quantità</span>
        <input name="qty" type="number" value="1" min="0" step="1" />
      </label>
      <label class="field">
        <span>Peso</span>
        <input name="weight" type="number" value="0" min="0" step="${a}" />
      </label>
      <label class="field">
        <span>Volume</span>
        <input name="volume" type="number" value="0" min="0" step="0.1" />
      </label>
     
    </div>
  `}async function bn(a,e,l,i){var Ze,Ie,ea,aa,na,la;const t=n=>{n==null||n.querySelectorAll('input[type="number"]').forEach(o=>{var p,u,h;const c=(h=(u=(p=o.closest(".field"))==null?void 0:p.querySelector("span"))==null?void 0:u.textContent)==null?void 0:h.trim();za(o,{decrementLabel:c?`Riduci ${c}`:"Diminuisci valore",incrementLabel:c?`Aumenta ${c}`:"Aumenta valore"})})},r=document.createElement("div");r.className="drawer-form modal-form-grid";const d=(n,o=[])=>{const c=document.createElement("section");c.className="item-modal-section";const p=document.createElement("h4");return p.className="item-modal-section__title",p.textContent=n,c.appendChild(p),o.filter(Boolean).forEach(u=>c.appendChild(u)),c},m=(n,o="balanced")=>{const c=document.createElement("div");return c.className=`modal-form-row modal-form-row--${o}`,n.filter(Boolean).forEach(p=>c.appendChild(p)),c},v=({name:n,label:o,checked:c=!1,type:p="checkbox",value:u=""})=>{const h=document.createElement("label");h.className="condition-modal__item item-modal-toggle-field";const w=u?` value="${u}"`:"";h.innerHTML=`
      <span class="condition-modal__item-label"><strong>${o}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="${p}" name="${n}"${w} ${c?"checked":""} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;const _=h.querySelector("input");return h.classList.toggle("is-selected",!!(_!=null&&_.checked)),_==null||_.addEventListener("change",()=>{h.classList.toggle("is-selected",_.checked)}),{field:h,input:_}},b=g({label:"Nome",name:"name",value:(e==null?void 0:e.name)??""}),z=g({label:"Foto (URL)",name:"image_url",placeholder:"https://.../oggetto.png",value:(e==null?void 0:e.image_url)??""}),C=d("Dati principali",[m([b,z],"balanced")]),G=g({label:"Quantità",name:"qty",type:"number",value:(e==null?void 0:e.qty)??1}),D=G.querySelector("input");D&&(D.min="0",D.step="1");const Se=g({label:"Peso",name:"weight",type:"number",value:(e==null?void 0:e.weight)??0}),oe=Se.querySelector("input");if(oe){const n=Ja(a);oe.min="0",oe.step=n==="kg"?"0.1":"1"}const Ee=g({label:"Volume",name:"volume",type:"number",value:(e==null?void 0:e.volume)??0}),ie=Ee.querySelector("input");ie&&(ie.min="0",ie.step="0.1");const Le=g({label:"Valore (cp)",name:"value_cp",type:"number",value:(e==null?void 0:e.value_cp)??0}),se=Le.querySelector("input");se&&(se.min="0",se.step="1"),C.appendChild(m([G,Se,Ee,Le],"compact"));const f=L([{value:"",label:"Seleziona"},...Ne],(e==null?void 0:e.category)??"");f.name="category";const K=document.createElement("label");K.className="field",K.innerHTML="<span>Categoria</span>",K.appendChild(f);const ga=[{value:"",label:"Nessuno"}].concat(l.filter(n=>n.category==="container").map(n=>({value:n.id,label:n.name}))),Te=L(ga,(e==null?void 0:e.container_item_id)??"");Te.name="container_item_id";const Q=document.createElement("label");Q.className="field",Q.innerHTML="<span>Contenitore</span>",Q.appendChild(Te);const re=g({label:"Volume massimo contenitore",name:"max_volume",type:"number",value:(e==null?void 0:e.max_volume)??""}),ce=re.querySelector("input"),x=document.createElement("label");x.className="field",x.innerHTML="<span>Tipo munizione dell'oggetto</span>";const de=L($e,(e==null?void 0:e.ammunition_type)??"");de.name="ammunition_type",x.appendChild(de);const J=document.createElement("div");J.className="item-modal-kind",J.innerHTML='<span class="item-modal-kind__label">Tipologia rapida</span>';const ue=document.createElement("div");ue.className="condition-modal__list item-modal-kind__list";const Ce=[{value:"generic",label:"Oggetto"},{value:"weapon",label:"Arma"},{value:"armor",label:"Armatura"}].map(n=>{const o=document.createElement("label");return o.className="condition-modal__item item-modal-kind__item",o.innerHTML=`
      <span class="condition-modal__item-label"><strong>${n.label}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="radio" name="item_kind" value="${n.value}" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `,ue.appendChild(o),o.querySelector("input")});J.appendChild(ue),C.appendChild(J);const ba=m([K,Q,re,x],"balanced");C.appendChild(ba);const U=document.createElement("div");U.className="condition-modal__list item-modal-toggle-list";const{field:va}=v({name:"attunement_active",label:"Sintonia attiva",checked:(e==null?void 0:e.attunement_active)??!1}),{field:_a}=v({name:"is_magic",label:"Magico",checked:(e==null?void 0:e.is_magic)??!1});U.appendChild(va),U.appendChild(_a),C.appendChild(U);const X=document.createElement("div");X.className="condition-modal__list item-modal-toggle-list";const{field:fa,input:P}=v({name:"equipable",label:"Equipaggiabile",checked:(e==null?void 0:e.equipable)??!1}),{field:ya,input:B}=v({name:"sovrapponibile",label:"Sovrapponibile",checked:(e==null?void 0:e.sovrapponibile)??!1});X.appendChild(fa),X.appendChild(ya);const H=document.createElement("fieldset");H.className="equip-slot-field",H.innerHTML="<legend>Punti del corpo</legend>";const pe=document.createElement("div");pe.className="equip-slot-list";const ha=sa(e),wa=ua.map(n=>{const o=document.createElement("label");o.className="checkbox",o.innerHTML=`<input type="checkbox" name="equip_slots" value="${n.value}" /> <span>${n.label}</span>`;const c=o.querySelector("input");return c&&ha.includes(n.value)&&(c.checked=!0),pe.appendChild(o),c});H.appendChild(pe);const $a=d("Equipaggiamento",[X,H]),qa=d("Dettagli",[Ra({label:"Note",name:"notes",value:(e==null?void 0:e.notes)??""})]),q=document.createElement("div");q.className="drawer-form modal-form-grid";const Y=document.createElement("label");Y.className="field",Y.innerHTML="<span>Tipo arma</span>";const me=L(Va,(e==null?void 0:e.weapon_type)??"");me.name="weapon_type",Y.appendChild(me);const Z=document.createElement("label");Z.className="field",Z.innerHTML="<span>Proprietà arma</span>";const ge=L(ja,(e==null?void 0:e.weapon_range)??"");ge.name="weapon_range",Z.appendChild(ge);const I=document.createElement("label");I.className="field",I.innerHTML="<span>Caratteristica tiro per colpire</span>";const be=L(Wa,(e==null?void 0:e.attack_ability)??"");be.name="attack_ability",I.appendChild(be);const Me=g({label:"Dado danno",name:"damage_die",placeholder:"Es. 1d8",value:(e==null?void 0:e.damage_die)??""}),Fe=g({label:"Modificatore per colpire",name:"attack_modifier",type:"number",value:(e==null?void 0:e.attack_modifier)??0}),ke=g({label:"Modificatore danno",name:"damage_modifier",type:"number",value:(e==null?void 0:e.damage_modifier)??0}),ee=document.createElement("label");ee.className="field",ee.innerHTML="<span>Tipo danno</span>";const ae=L(qe,(e==null?void 0:e.damage_type)??"");ae.name="damage_type",ee.appendChild(ae);const{field:Ae,input:N}=v({name:"consumes_ammunition",label:"Consuma munizioni",checked:(e==null?void 0:e.consumes_ammunition)??!1});Ae.classList.add("item-modal-toggle-field--compact");const ne=document.createElement("label");ne.className="field",ne.innerHTML="<span>Munizione richiesta</span>";const ve=L($e,(e==null?void 0:e.required_ammunition_type)??(e==null?void 0:e.ammunition_type)??"");ve.name="required_ammunition_type",ne.appendChild(ve);const Na=n=>{const o=n==null?void 0:n.weapon_damage_modes;let c=[];if(Array.isArray(o))c=o;else if(typeof o=="string"&&o.trim())try{const u=JSON.parse(o);c=Array.isArray(u)?u:[]}catch{c=[]}const p=c.map(u=>({label:u.label||u.name||"",damage_die:u.damage_die||u.damageDie||"",damage_modifier:u.damage_modifier??u.damageModifier??0,damage_type:u.damage_type||u.damageType||(n==null?void 0:n.damage_type)||""})).filter(u=>u.label||u.damage_die);return!p.length&&(n!=null&&n.has_alternate_damage_mode)&&(n!=null&&n.alternate_damage_die)&&p.push({label:n.alternate_damage_label||"Due mani",damage_die:n.alternate_damage_die,damage_modifier:n.alternate_damage_modifier??n.damage_modifier??0,damage_type:n.alternate_damage_type||n.damage_type||""}),p},M=document.createElement("div");M.className="weapon-damage-modes-field",M.innerHTML=`
    <div class="weapon-damage-modes-field__header">
      <div>
        <strong>Impugnature aggiuntive</strong>
        <p class="muted">Aggiungi più modalità oltre al danno base dell'arma.</p>
      </div>
      <button type="button" class="resource-action-button" data-add-weapon-damage-mode>Aggiungi</button>
    </div>
    <div class="weapon-damage-modes-field__list" data-weapon-damage-modes></div>
  `;const _e=M.querySelector("[data-weapon-damage-modes]"),fe=M.querySelector("[data-add-weapon-damage-mode]"),Sa=({label:n="",damage_die:o="",damage_modifier:c=0,damage_type:p=""}={})=>{const u=document.createElement("div");u.className="weapon-damage-mode-row";const h=g({label:"Nome",name:"weapon_damage_mode_label",placeholder:"Es. Due mani",value:n}),w=g({label:"Dado",name:"weapon_damage_mode_die",placeholder:"Es. 1d10",value:o}),_=g({label:"Mod.",name:"weapon_damage_mode_modifier",type:"number",value:c??0}),O=document.createElement("label");O.className="field",O.innerHTML="<span>Tipo</span>";const j=L(qe,p||(e==null?void 0:e.damage_type)||"");j.name="weapon_damage_mode_type",O.appendChild(j);const E=document.createElement("button");return E.type="button",E.className="icon-button weapon-damage-mode-row__remove",E.setAttribute("aria-label","Rimuovi impugnatura"),E.title="Rimuovi",E.innerHTML='<span aria-hidden="true">🗑️</span>',E.addEventListener("click",()=>u.remove()),u.append(h,w,_,O,E),t(u),u},Oe=(n={})=>{_e==null||_e.appendChild(Sa(n))};Na(e).forEach(n=>Oe(n)),fe==null||fe.addEventListener("click",()=>Oe({damage_type:ae.value}));const{field:Ea,input:F}=v({name:"is_thrown",label:"Proprietà lancio",checked:(e==null?void 0:e.is_thrown)??!1}),k=document.createElement("div");k.className="compact-field-grid";const La=g({label:"Portata arma (m)",name:"melee_range",type:"text",placeholder:"Es. 1,5",value:(e==null?void 0:e.melee_range)??1.5}),Ta=g({label:"Gittata normale",name:"range_normal",type:"number",value:(e==null?void 0:e.range_normal)??""}),Ca=g({label:"Gittata svantaggio",name:"range_disadvantage",type:"number",value:(e==null?void 0:e.range_disadvantage)??""});k.appendChild(La),k.appendChild(Ta),k.appendChild(Ca);const le=document.createElement("label");le.className="field",le.innerHTML="<span>Tipo armatura</span>";const ye=L(Ga,(e==null?void 0:e.armor_type)??"");ye.name="armor_type",le.appendChild(ye);const{field:Pe,input:S}=v({name:"is_shield",label:"Scudo",checked:(e==null?void 0:e.is_shield)??!1});Pe.classList.add("item-modal-toggle-field--compact");const Re=g({label:"Classe armatura base",name:"armor_class",type:"number",value:(e==null?void 0:e.armor_class)??""}),ze=Re.querySelector("input"),De=g({label:"Bonus armatura",name:"armor_bonus",type:"number",value:(e==null?void 0:e.armor_bonus)??0}),xe=De.querySelector("input"),Be=g({label:"Bonus scudo",name:"shield_bonus",type:"number",value:(e==null?void 0:e.shield_bonus)??2}),He=Be.querySelector("input"),Ve=m([Y,Z,I],"balanced"),je=m([Me,ee,Fe,ke],"compact"),We=m([Ae,ne],"compact"),Ge=m([Ea],"compact"),Ke=m([le,Re],"balanced"),he=m([De,Be,Pe],"compact");he.classList.add("item-modal-row--armor-bonus"),q.appendChild(Ve),q.appendChild(je),q.appendChild(We),q.appendChild(M),q.appendChild(Ge),q.appendChild(k),q.appendChild(Ke),q.appendChild(he);const Qe=d("Statistiche arma / armatura",[q]);r.appendChild(C),r.appendChild($a),r.appendChild(Qe),r.appendChild(qa);const Je=n=>n==="weapon"?"weapon":n==="armor"?"armor":"generic",we=()=>{const n=Je(f.value);Ce.forEach(o=>{var p;if(!o)return;const c=o.value===n;o.checked=c,(p=o.closest(".condition-modal__item"))==null||p.classList.toggle("is-selected",c)})};Ce.forEach(n=>{n==null||n.addEventListener("change",()=>{n.checked&&(n.value==="weapon"?f.value="weapon":n.value==="armor"?f.value="armor":(f.value==="weapon"||f.value==="armor")&&(f.value="gear"),we(),A())})});const y=(n,o)=>{n&&(n.hidden=!o)},A=()=>{var O,j,E,ta;const n=(P==null?void 0:P.checked)??!1;wa.forEach($=>{$&&($.disabled=!n,n||($.checked=!1))}),B&&(B.disabled=!n,n||(B.checked=!1),(O=B.closest(".condition-modal__item"))==null||O.classList.toggle("is-selected",B.checked)),y(H,n);const o=f.value==="weapon",c=f.value==="armor",p=f.value==="container",u=Je(f.value);me.disabled=!o,ge.disabled=!o,be.disabled=!o,Me.querySelector("input").disabled=!o,ae.disabled=!o,Fe.querySelector("input").disabled=!o,ke.querySelector("input").disabled=!o,N&&(N.disabled=!o,(j=N.closest(".condition-modal__item"))==null||j.classList.toggle("is-selected",N.checked)),ve.disabled=!o||!((N==null?void 0:N.checked)??!1),M.querySelectorAll("input, select, button").forEach($=>{$.disabled=!o}),F&&(F.disabled=!o,(E=F.closest(".condition-modal__item"))==null||E.classList.toggle("is-selected",F.checked)),k.querySelectorAll("input").forEach($=>{$.disabled=!o,o?$.name==="melee_range"&&!$.value&&($.value="1.5"):$.value=""}),ye.disabled=!c,S&&(S.disabled=!c,(ta=S.closest(".condition-modal__item"))==null||ta.classList.toggle("is-selected",S.checked)),ze&&(ze.disabled=!c),xe&&(xe.disabled=!c),He&&(He.disabled=!c||!((S==null?void 0:S.checked)??!1));const w=u==="weapon",_=u==="armor";y(Ve,w),y(je,w),y(We,w),y(M,w),y(Ge,w),y(k,w),y(Ke,_),y(he,_),y(Qe,w||_),y(re,p),y(x,!o&&!p),de.disabled=o||p,ce&&(ce.disabled=!p,p||(ce.value=""))};P==null||P.addEventListener("change",A),f.addEventListener("change",()=>{we(),A()}),S==null||S.addEventListener("change",A),F==null||F.addEventListener("change",A),N==null||N.addEventListener("change",A),we(),A(),t(r);const s=await ca({title:e?"Modifica oggetto":"Nuovo oggetto",submitLabel:e?"Salva":"Crea",content:r,cardClass:["modal-card--wide","modal-card--scrollable"]});if(!s)return;const Ue=s.get("equipable")==="on",V=Ue?s.getAll("equip_slots"):[],Ma=V[0]||null,Fa=s.get("category");if(V.length&&!Xa(a,s)){W("Non hai la competenza per equipaggiare questo oggetto","error");return}const Xe=s.get("sovrapponibile")==="on";if(V.length&&!Xe&&l.filter(o=>o.id!==(e==null?void 0:e.id)).filter(o=>sa(o).some(c=>V.includes(c))).length){W("Uno o più slot selezionati sono già occupati","error");return}const ka=s.getAll("weapon_damage_mode_label"),Aa=s.getAll("weapon_damage_mode_die"),Oa=s.getAll("weapon_damage_mode_modifier"),Pa=s.getAll("weapon_damage_mode_type"),R=Aa.map((n,o)=>({id:`mode-${o+1}`,label:String(ka[o]||"").trim()||`Impugnatura ${o+1}`,damage_die:String(n||"").trim(),damage_modifier:Number(Oa[o])||0,damage_type:Pa[o]||null})).filter(n=>n.damage_die),Ye={user_id:a.user_id,character_id:a.id,name:s.get("name"),image_url:((Ze=s.get("image_url"))==null?void 0:Ze.trim())||null,qty:Number(s.get("qty")),weight:Number(s.get("weight")),volume:Number(s.get("volume"))||0,value_cp:Number(s.get("value_cp")),category:Fa,container_item_id:s.get("container_item_id")||null,max_volume:s.get("max_volume")===""?null:Number(s.get("max_volume")),equipable:Ue,equip_slot:Ma,equip_slots:V,sovrapponibile:Xe,attunement_active:s.get("attunement_active")==="on",is_magic:s.get("is_magic")==="on",notes:s.get("notes"),weapon_type:s.get("weapon_type")||null,weapon_range:s.get("weapon_range")||null,attack_ability:s.get("attack_ability")||null,ammunition_type:s.get("ammunition_type")||null,required_ammunition_type:s.get("required_ammunition_type")||null,consumes_ammunition:s.get("consumes_ammunition")==="on",damage_die:((Ie=s.get("damage_die"))==null?void 0:Ie.trim())||null,damage_type:s.get("damage_type")||null,attack_modifier:Number(s.get("attack_modifier"))||0,damage_modifier:Number(s.get("damage_modifier"))||0,weapon_damage_modes:R,has_alternate_damage_mode:R.length>0,alternate_damage_label:((ea=R[0])==null?void 0:ea.label)||null,alternate_damage_die:((aa=R[0])==null?void 0:aa.damage_die)||null,alternate_damage_modifier:Number((na=R[0])==null?void 0:na.damage_modifier)||0,alternate_damage_type:((la=R[0])==null?void 0:la.damage_type)||null,is_thrown:s.get("is_thrown")==="on",melee_range:(()=>{const n=String(s.get("melee_range")??"").trim().replace(",",".");if(!n)return null;const o=Number(n);return Number.isNaN(o)?null:o})(),range_normal:Number(s.get("range_normal"))||null,range_disadvantage:Number(s.get("range_disadvantage"))||null,armor_type:s.get("armor_type")||null,is_shield:s.get("is_shield")==="on",armor_class:Number(s.get("armor_class"))||null,armor_bonus:Number(s.get("armor_bonus"))||0,shield_bonus:Number(s.get("shield_bonus"))||0};oa(!0);try{e?(await xa(e.id,Ye),W("Oggetto aggiornato")):(await Da(Ye),W("Oggetto creato")),await(i==null?void 0:i())}catch{W("Errore salvataggio oggetto","error")}finally{oa(!1)}}function vn(a){var i,t;if(!(a!=null&&a.image_url))return;const e=document.createElement("div");e.className="equipment-preview-modal";const l=((i=a.description)==null?void 0:i.trim())||((t=a.notes)==null?void 0:t.trim())||"Nessuna descrizione disponibile per questo equipaggiamento.";e.innerHTML=`
    <div class="detail-card detail-card--text equipment-preview-card">
      <img class="equipment-preview-image" src="${a.image_url}" alt="Foto di ${a.name}" />
      <div class="equipment-preview-content">
        <p>${l}</p>
      </div>
    </div>
  `,ca({title:a.name||"Equipaggiamento",cancelLabel:null,content:e,cardClass:"modal-card--equipment-preview",showFooter:!1})}async function _n(a){const{data:e,error:l}=await T.from("wallets").select("*").eq("character_id",a).single();if(l&&l.code!=="PGRST116")throw l;return e??null}async function fn(a){const{data:e,error:l}=await T.from("wallets").upsert(a).select("*").single();if(l)throw l;return e}async function yn(a){const{data:e,error:l}=await T.from("money_transactions").insert(a).select("*").single();if(l)throw l;return e}async function hn(a){const{data:e,error:l}=await T.from("money_transactions").select("*").eq("character_id",a).order("created_at",{ascending:!1});if(l)throw l;return e??[]}async function wn(a,e){const{data:l,error:i}=await T.from("money_transactions").update(e).eq("id",a).select("*").single();if(i)throw i;return l}async function $n(a){const{error:e}=await T.from("money_transactions").delete().eq("id",a);if(e)throw e}export{ln as A,wn as B,$n as C,Ua as a,ma as b,tn as c,rn as d,ia as e,da as f,Ja as g,_n as h,on as i,yn as j,Da as k,nn as l,un as m,ua as n,xa as o,vn as p,gn as q,hn as r,cn as s,sn as t,fn as u,pn as v,mn as w,bn as x,dn as y,pa as z};
