import{k as S,o as pa,d as p,e as L,p as xa,c as R,s as ra,j as Oa}from"./index-iCVUMj6Q.js";async function an(a){const{data:e,error:n}=await S.from("items").select("*").eq("character_id",a).order("created_at",{ascending:!0});if(n)throw n;return e??[]}async function za(a){const{data:e,error:n}=await S.from("items").insert(a).select("*").single();if(n)throw n;return e}async function Da(a,e){const{data:n,error:t}=await S.from("items").update(e).eq("id",a).select("*").single();if(t)throw t;return n}async function nn(a){const{error:e}=await S.from("items").delete().eq("id",a);if(e)throw e}function ln(a=[]){return a.reduce((e,n)=>{const t=Number(n.qty??0),l=Number(n.weight??0);return e+t*l},0)}function tn(a,e){const n={...a};return Object.keys(e).forEach(t=>{n[t]=Number(n[t]??0)+Number(e[t]??0)}),n}function ma(a,e="lb"){return a==null||Number.isNaN(a)?"-":`${Number(a).toFixed(2).replace(/\.00$/,"")} ${e}`}const ga=[{value:"head",label:"Testa"},{value:"eyes-left",label:"Occhio sinistro"},{value:"eyes-right",label:"Occhio destro"},{value:"ears-left",label:"Orecchio sinistro"},{value:"ears-right",label:"Orecchio destro"},{value:"neck",label:"Collo"},{value:"shoulder-left",label:"Spalla sinistra"},{value:"shoulder-right",label:"Spalla destra"},{value:"back",label:"Schiena"},{value:"chest",label:"Torso"},{value:"arm-left",label:"Braccio sinistro"},{value:"arm-right",label:"Braccio destro"},{value:"hand-left",label:"Mano sinistra"},{value:"hand-right",label:"Mano destra"},{value:"wrist-left",label:"Polso sinistro"},{value:"wrist-right",label:"Polso destro"},{value:"waist",label:"Vita"},{value:"leg-left",label:"Gamba sinistra"},{value:"leg-right",label:"Gamba destra"},{value:"foot-left",label:"Piede sinistro"},{value:"foot-right",label:"Piede destro"},{value:"ring-left",label:"Dita/Anello sinistro"},{value:"ring-right",label:"Dita/Anello destro"},{value:"main-hand",label:"Mano principale"},{value:"off-hand",label:"Mano secondaria"},{value:"eyes",label:"Occhi (generico)"},{value:"ears",label:"Orecchie (generico)"},{value:"shoulders",label:"Spalle (generico)"},{value:"arms",label:"Braccia (generico)"},{value:"hands",label:"Mani (generico)"},{value:"wrists",label:"Polsi (generico)"},{value:"legs",label:"Gambe (generico)"},{value:"feet",label:"Piedi (generico)"},{value:"ring",label:"Dita/Anelli (generico)"}],he=[{value:"gear",label:"Vestiario",equipable:!0},{value:"loot",label:"Loot"},{value:"consumable",label:"Consumabili"},{value:"weapon",label:"Armi",equipable:!0},{value:"armor",label:"Armature",equipable:!0},{value:"jewelry",label:"Gioielli e ornamenti",equipable:!0},{value:"tool",label:"Strumenti"},{value:"container",label:"Contenitore",equipable:!0}],on=[{value:"",label:"Tutte"},...he],Ra=new Map([...he.map(a=>[a.value,a.label]),["magic","Magici"]]),Ba=new Map(ga.map(a=>[a.value,a.label])),Ha=[{value:"",label:"Seleziona"},{value:"simple",label:"Semplice"},{value:"martial",label:"Da guerra"}],Va=[{value:"",label:"Seleziona"},{value:"melee",label:"Mischia"},{value:"ranged",label:"Distanza"}],Ia=[{value:"",label:"Seleziona"},{value:"str",label:"FOR"},{value:"dex",label:"DES"}],ja=[{value:"",label:"Seleziona"},{value:"light",label:"Leggera"},{value:"medium",label:"Media"},{value:"heavy",label:"Pesante"}],_e=[{value:"",label:"Nessuna"},{value:"arrow",label:"Frecce"},{value:"bolt",label:"Dardi"},{value:"bullet",label:"Proiettili"}],fe=[{value:"",label:"Seleziona"},{value:"acid",label:"Acido"},{value:"bludgeoning",label:"Contundente"},{value:"piercing",label:"Perforante"},{value:"slashing",label:"Tagliente"},{value:"cold",label:"Freddo"},{value:"fire",label:"Fuoco"},{value:"force",label:"Forza"},{value:"lightning",label:"Fulmine"},{value:"thunder",label:"Tuono"},{value:"necrotic",label:"Necrotico"},{value:"poison",label:"Veleno"},{value:"psychic",label:"Psichico"},{value:"radiant",label:"Radioso"}],ca=new Map(_e.map(a=>[a.value,a.label])),Ga=new Map(fe.map(a=>[a.value,a.label]));function ba(a){if(!a)return{};if(typeof a=="string")try{return JSON.parse(a)}catch{return{}}return a}function va(a){return Ra.get(a)??(a||"Altro")}function Wa(a){return Ba.get(a)??a}function sn(a){return a.map(e=>Wa(e)).join(", ")}function da(a){if(!a)return[];if(Array.isArray(a.equip_slots))return a.equip_slots.filter(Boolean);if(typeof a.equip_slots=="string"&&a.equip_slots.trim())try{const e=JSON.parse(a.equip_slots);if(Array.isArray(e))return e.filter(Boolean)}catch{return[a.equip_slots]}return a.equip_slot?[a.equip_slot]:[]}function Ka(a){var e,n;return((n=(e=a.data)==null?void 0:e.settings)==null?void 0:n.weight_unit)??"lb"}function Qa(a={}){return{magic:a.is_magic?"Magico":"Non magico",equipable:a.equipable?"Equipaggiabile":"Non equipaggiabile",attunement:a.attunement_active?"In sintonia":"Non in sintonia"}}function Ua(a,e){var l;const n=((l=a.data)==null?void 0:l.proficiencies)||{},t=e.get("category");if(t==="weapon"){const r=e.get("weapon_type");return r?r==="simple"?!!n.weapon_simple:!!n.weapon_martial:!1}if(t==="armor"){if(e.get("is_shield")==="on")return!!n.shield;const c=e.get("armor_type");return c?c==="light"?!!n.armor_light:c==="medium"?!!n.armor_medium:!!n.armor_heavy:!1}return!0}function Ja(a){const e="/dungeons-dragons-app/",n={pp:`${e}icons/moneta_platino.png`,gp:`${e}icons/moneta_oro.png`,sp:`${e}icons/moneta_argento.png`,cp:`${e}icons/moneta_rame.png`},t=ba(a),l=["pp","gp","sp","cp"].map(c=>({coin:c,value:Number((t==null?void 0:t[c])??0)})).filter(c=>c.value!==0);return(l.length?l:[{coin:"gp",value:0}]).map((c,u)=>`
      ${u?'<span class="transaction-coin__divider" aria-hidden="true">·</span>':""}
      <span class="transaction-coin" data-coin="${c.coin}">
        <span class="coin-avatar coin-avatar--${c.coin}" aria-hidden="true">
          <img src="${n[c.coin]}" alt="" loading="lazy" />
        </span>
        <span class="transaction-coin__value">${c.value}</span>
      </span>
    `).join("")}function Xa(a){const e=ba(a),n=["pp","gp","sp","cp"].map(t=>({coin:t,value:Number((e==null?void 0:e[t])??0)})).filter(t=>t.value!==0);return n.length?n.map(t=>`${t.value} ${t.coin}`).join(" · "):"0 gp"}const Ya=8;function Z(a,e,n,t,l){return`
      <label class="field wallet-edit-field">
        <span class="wallet-edit-field__label">
          <span class="coin-avatar ${l}" aria-hidden="true">
            <img src="${t}" alt="" loading="lazy" />
          </span>
          <span>${a}</span>
        </span>
        <input name="${e}" type="number" value="${n}" min="0" step="1" />
      </label>
  `}function rn(a){const e=document.createElement("div");if(e.className="transaction-list",!a.length)return e.innerHTML='<p class="muted">Nessuna transazione registrata.</p>',e;const n=document.createElement("ul");n.className="transaction-items";const t=a.length>Ya;return a.forEach(l=>{const r=document.createElement("li"),c=l.direction==="pay"?"Pagamento":"Entrata",u=Ja(l.amount),v=Xa(l.amount),m=l.direction==="pay"?"transaction-item--outgoing":"transaction-item--incoming";r.className=`transaction-item ${m}`,r.innerHTML=`
      <div class="transaction-info">
        <p class="muted">${l.reason||"Nessuna nota"}</p>
      </div>
      <span class="transaction-amount" aria-label="${v}">${u}</span>
      <div class="transaction-meta">
        <span class="resource-chip transaction-direction-chip ${l.direction==="pay"?"transaction-direction-chip--outgoing":"transaction-direction-chip--incoming"}">${c}</span>
        <div class="transaction-actions">
          <button class="icon-button transaction-action-button" type="button" data-edit-transaction="${l.id}" aria-label="Modifica transazione" title="Modifica">
            <span aria-hidden="true">✏️</span>
          </button>
          <button class="icon-button icon-button--danger transaction-action-button transaction-action-button--danger" type="button" data-delete-transaction="${l.id}" aria-label="Elimina transazione" title="Elimina">
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>
      </div>
    `,n.appendChild(r)}),e.classList.toggle("transaction-list--scrollable",t),e.appendChild(n),e}function cn(a,e="lb"){const n=a.filter(r=>r.category==="container"),t=a.filter(r=>!r.container_item_id&&r.category!=="container");return`
    ${n.map(r=>{const c=a.filter(A=>A.container_item_id===r.id),u=c.reduce((A,T)=>{const B=Number(T.volume)||0,P=Number(T.qty)||1;return A+B*P},0),v=Number(r.max_volume)||null,m=v?`Volume ${u}/${v}`:u?`Volume ${u}`:"";return`
      <details class="inventory-group inventory-group--container inventory-container-accordion" open>
        <summary class="inventory-table__row inventory-table__row--container inventory-container-accordion__summary">
          <div class="inventory-table__cell inventory-table__cell--item">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <div class="item-info-body">
              <strong>${r.name}</strong>
              ${m?`<span class="muted">${m}</span>`:""}
            </div>
          </div>
          <div class="inventory-table__cell">${va(r.category)}</div>
          <div class="inventory-table__cell">${r.qty}</div>
          <div class="inventory-table__cell">${ma(r.weight??0,e)}</div>
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
          ${ua(c,e,{nested:!0,emptyLabel:"Nessun oggetto nel contenitore."})}
        </div>
      </details>
    `}).join("")}
    <div class="inventory-group">
      <p class="inventory-group__label">Oggetti non contenuti</p>
      ${ua(t,e)}
    </div>
  `}function ua(a,e="lb",{nested:n=!1,emptyLabel:t="Nessun oggetto."}={}){return a.length?`
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
        ${a.map(l=>{const r=l.volume!==null&&l.volume!==void 0?l.volume:"-",c=Qa(l);return`
          <div class="inventory-table__row">
            <div class="inventory-table__badges">
              ${l.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${c.magic}</span>`:""}
              ${l.equipable?`<span class="resource-chip resource-chip--floating resource-chip--equipable">${c.equipable}</span>`:""}
              ${l.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${c.attunement}</span>`:""}
            </div>
            <div class="inventory-table__cell inventory-table__cell--item">
              ${l.image_url?`<img class="item-avatar" src="${l.image_url}" alt="Foto di ${l.name}" data-item-image="${l.id}" />`:""}
              <div class="item-info-body">
                <button class="item-name-button" type="button" data-item-preview="${l.id}" aria-label="Apri anteprima ${l.name}">${l.name}</button>
                ${l.ammunition_type?`<span class="muted">Munizioni: ${ca.get(l.ammunition_type)||l.ammunition_type}</span>`:""}
                ${l.consumes_ammunition?`<span class="muted">Consuma: ${ca.get(l.required_ammunition_type)||l.required_ammunition_type||"munizioni"}</span>`:""}
                ${l.damage_type?`<span class="muted">Danno: ${Ga.get(l.damage_type)||l.damage_type}</span>`:""}
              </div>
            </div>
            <div class="inventory-table__cell">${va(l.category)}</div>
            <div class="inventory-table__cell">${l.qty}</div>
            <div class="inventory-table__cell">${ma(l.weight??0,e)}</div>
            <div class="inventory-table__cell">${r}</div>
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
  `:`<p class="muted eyebrow">${t}</p>`}function dn({amount:a=0,coin:e="gp",reason:n="",occurredOn:t,direction:l="receive",includeDirection:r=!1}={}){const c=t||new Date().toISOString().split("T")[0];return`
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
      <input name="occurred_on" type="date" value="${c}" />
    </label>
    </div>
    ${r?`
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
   
  `}function un({amount:a=0,source:e="gp",target:n="pp",targetAmount:t=0,available:l={}}={}){const r=[{key:"pp",label:"Platino",value:Number(l.pp??0)},{key:"gp",label:"Oro",value:Number(l.gp??0)},{key:"sp",label:"Argento",value:Number(l.sp??0)},{key:"cp",label:"Rame",value:Number(l.cp??0)}],c=r.some(m=>m.value>0),u=r.filter(m=>m.value>0).map(m=>`
          <option value="${m.key}" ${e===m.key?"selected":""}>${m.label}</option>
        `).join(""),v=r.map(m=>`
          <option value="${m.key}" ${n===m.key?"selected":""}>${m.label}</option>
        `).join("");return`
    <div class="modal-section">
      <h4 class="modal-section__title">Seleziona le monete da scambiare</h4>
      <div class="money-grid compact-grid-fields">
        <label class="field">
          <span>Tipo moneta</span>
          <select name="source" ${c?"":"disabled"}>
            ${c?u:'<option value="" selected>Nessuna moneta disponibile</option>'}
          </select>
        </label>
        <label class="field">
          <span>Quantità</span>
          <div class="field__input-row">
            <input name="amount" type="number" value="${a}" min="0" step="1" ${c?"":"disabled"} />
            <button class="chip chip--small" type="button" data-exchange-max ${c?"":"disabled"}>Max</button>
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
          <input name="target_amount" type="number" value="${t}" min="0" step="1" readonly />
        </label>
      </div>
    </div>
  `}function pn(a={}){const e="/dungeons-dragons-app/",n={pp:`${e}icons/moneta_platino.png`,gp:`${e}icons/moneta_oro.png`,sp:`${e}icons/moneta_argento.png`,cp:`${e}icons/moneta_rame.png`},t={pp:Number(a.pp??0),gp:Number(a.gp??0),sp:Number(a.sp??0),cp:Number(a.cp??0)};return`
    <div class="wallet-edit-grid compact-grid-fields">
      <div class="compact-field-grid">
        ${Z("Platino","pp",t.pp,n.pp,"coin-avatar--pp")}
        ${Z("Oro","gp",t.gp,n.gp,"coin-avatar--gp")}
      </div>
      <div class="compact-field-grid">
        ${Z("Argento","sp",t.sp,n.sp,"coin-avatar--sp")}
        ${Z("Rame","cp",t.cp,n.cp,"coin-avatar--cp")}
      </div>
    </div>
  `}function mn(a){return`
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
  `}async function gn(a,e,n,t){var Xe,Ye,Ze,ea;const l=o=>{o==null||o.querySelectorAll('input[type="number"]').forEach(i=>{var g,E,y;const d=(y=(E=(g=i.closest(".field"))==null?void 0:g.querySelector("span"))==null?void 0:E.textContent)==null?void 0:y.trim();Oa(i,{decrementLabel:d?`Riduci ${d}`:"Diminuisci valore",incrementLabel:d?`Aumenta ${d}`:"Aumenta valore"})})},r=document.createElement("div");r.className="drawer-form modal-form-grid";const c=(o,i=[])=>{const d=document.createElement("section");d.className="item-modal-section";const g=document.createElement("h4");return g.className="item-modal-section__title",g.textContent=o,d.appendChild(g),i.filter(Boolean).forEach(E=>d.appendChild(E)),d},u=(o,i="balanced")=>{const d=document.createElement("div");return d.className=`modal-form-row modal-form-row--${i}`,o.filter(Boolean).forEach(g=>d.appendChild(g)),d},v=({name:o,label:i,checked:d=!1,type:g="checkbox",value:E=""})=>{const y=document.createElement("label");y.className="condition-modal__item item-modal-toggle-field";const aa=E?` value="${E}"`:"";y.innerHTML=`
      <span class="condition-modal__item-label"><strong>${i}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="${g}" name="${o}"${aa} ${d?"checked":""} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;const b=y.querySelector("input");return y.classList.toggle("is-selected",!!(b!=null&&b.checked)),b==null||b.addEventListener("change",()=>{y.classList.toggle("is-selected",b.checked)}),{field:y,input:b}},m=p({label:"Nome",name:"name",value:(e==null?void 0:e.name)??""}),A=p({label:"Foto (URL)",name:"image_url",placeholder:"https://.../oggetto.png",value:(e==null?void 0:e.image_url)??""}),T=c("Dati principali",[u([m,A],"balanced")]),B=p({label:"Quantità",name:"qty",type:"number",value:(e==null?void 0:e.qty)??1}),P=B.querySelector("input");P&&(P.min="0",P.step="1");const ye=p({label:"Peso",name:"weight",type:"number",value:(e==null?void 0:e.weight)??0}),ee=ye.querySelector("input");if(ee){const o=Ka(a);ee.min="0",ee.step=o==="kg"?"0.1":"1"}const we=p({label:"Volume",name:"volume",type:"number",value:(e==null?void 0:e.volume)??0}),ae=we.querySelector("input");ae&&(ae.min="0",ae.step="0.1");const $e=p({label:"Valore (cp)",name:"value_cp",type:"number",value:(e==null?void 0:e.value_cp)??0}),ne=$e.querySelector("input");ne&&(ne.min="0",ne.step="1"),T.appendChild(u([B,ye,we,$e],"compact"));const _=L([{value:"",label:"Seleziona"},...he],(e==null?void 0:e.category)??"");_.name="category";const H=document.createElement("label");H.className="field",H.innerHTML="<span>Categoria</span>",H.appendChild(_);const _a=[{value:"",label:"Nessuno"}].concat(n.filter(o=>o.category==="container").map(o=>({value:o.id,label:o.name}))),qe=L(_a,(e==null?void 0:e.container_item_id)??"");qe.name="container_item_id";const V=document.createElement("label");V.className="field",V.innerHTML="<span>Contenitore</span>",V.appendChild(qe);const le=p({label:"Volume massimo contenitore",name:"max_volume",type:"number",value:(e==null?void 0:e.max_volume)??""}),te=le.querySelector("input"),x=document.createElement("label");x.className="field",x.innerHTML="<span>Tipo munizione contenuta</span>";const Ne=L(_e,(e==null?void 0:e.ammunition_type)??"");Ne.name="ammunition_type",x.appendChild(Ne);const I=document.createElement("div");I.className="item-modal-kind",I.innerHTML='<span class="item-modal-kind__label">Tipologia rapida</span>';const oe=document.createElement("div");oe.className="condition-modal__list item-modal-kind__list";const Ee=[{value:"generic",label:"Oggetto"},{value:"weapon",label:"Arma"},{value:"armor",label:"Armatura"}].map(o=>{const i=document.createElement("label");return i.className="condition-modal__item item-modal-kind__item",i.innerHTML=`
      <span class="condition-modal__item-label"><strong>${o.label}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="radio" name="item_kind" value="${o.value}" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `,oe.appendChild(i),i.querySelector("input")});I.appendChild(oe),T.appendChild(I);const fa=u([H,V,le,x],"balanced");T.appendChild(fa);const j=document.createElement("div");j.className="condition-modal__list item-modal-toggle-list";const{field:ha}=v({name:"attunement_active",label:"Sintonia attiva",checked:(e==null?void 0:e.attunement_active)??!1}),{field:ya}=v({name:"is_magic",label:"Magico",checked:(e==null?void 0:e.is_magic)??!1});j.appendChild(ha),j.appendChild(ya),T.appendChild(j);const G=document.createElement("div");G.className="condition-modal__list item-modal-toggle-list";const{field:wa,input:M}=v({name:"equipable",label:"Equipaggiabile",checked:(e==null?void 0:e.equipable)??!1}),{field:$a,input:O}=v({name:"sovrapponibile",label:"Sovrapponibile",checked:(e==null?void 0:e.sovrapponibile)??!1});G.appendChild(wa),G.appendChild($a);const z=document.createElement("fieldset");z.className="equip-slot-field",z.innerHTML="<legend>Punti del corpo</legend>";const ie=document.createElement("div");ie.className="equip-slot-list";const qa=da(e),Na=ga.map(o=>{const i=document.createElement("label");i.className="checkbox",i.innerHTML=`<input type="checkbox" name="equip_slots" value="${o.value}" /> <span>${o.label}</span>`;const d=i.querySelector("input");return d&&qa.includes(o.value)&&(d.checked=!0),ie.appendChild(i),d});z.appendChild(ie);const Ea=c("Equipaggiamento",[G,z]),La=c("Dettagli",[xa({label:"Note",name:"notes",value:(e==null?void 0:e.notes)??""})]),w=document.createElement("div");w.className="drawer-form modal-form-grid";const W=document.createElement("label");W.className="field",W.innerHTML="<span>Tipo arma</span>";const se=L(Ha,(e==null?void 0:e.weapon_type)??"");se.name="weapon_type",W.appendChild(se);const K=document.createElement("label");K.className="field",K.innerHTML="<span>Proprietà arma</span>";const re=L(Va,(e==null?void 0:e.weapon_range)??"");re.name="weapon_range",K.appendChild(re);const Q=document.createElement("label");Q.className="field",Q.innerHTML="<span>Caratteristica tiro per colpire</span>";const ce=L(Ia,(e==null?void 0:e.attack_ability)??"");ce.name="attack_ability",Q.appendChild(ce);const Le=p({label:"Dado danno",name:"damage_die",placeholder:"Es. 1d8",value:(e==null?void 0:e.damage_die)??""}),Se=p({label:"Modificatore per colpire",name:"attack_modifier",type:"number",value:(e==null?void 0:e.attack_modifier)??0}),Te=p({label:"Modificatore danno",name:"damage_modifier",type:"number",value:(e==null?void 0:e.damage_modifier)??0}),U=document.createElement("label");U.className="field",U.innerHTML="<span>Tipo danno</span>";const de=L(fe,(e==null?void 0:e.damage_type)??"");de.name="damage_type",U.appendChild(de);const{field:Sa,input:q}=v({name:"consumes_ammunition",label:"Consuma munizioni",checked:(e==null?void 0:e.consumes_ammunition)??!1}),J=document.createElement("label");J.className="field",J.innerHTML="<span>Munizione richiesta</span>";const ue=L(_e,(e==null?void 0:e.required_ammunition_type)??(e==null?void 0:e.ammunition_type)??"");ue.name="required_ammunition_type",J.appendChild(ue);const{field:Ta,input:f}=v({name:"has_alternate_damage_mode",label:"Modalità impugnatura alternativa",checked:(e==null?void 0:e.has_alternate_damage_mode)??!1}),Ce=p({label:"Nome modalità alternativa",name:"alternate_damage_label",placeholder:"Es. Due mani",value:(e==null?void 0:e.alternate_damage_label)??""}),Fe=p({label:"Dado danno alternativo",name:"alternate_damage_die",placeholder:"Es. 1d10",value:(e==null?void 0:e.alternate_damage_die)??""}),ke=p({label:"Mod. danno alternativo",name:"alternate_damage_modifier",type:"number",value:(e==null?void 0:e.alternate_damage_modifier)??(e==null?void 0:e.damage_modifier)??0}),X=document.createElement("label");X.className="field",X.innerHTML="<span>Tipo danno alternativo</span>";const pe=L(fe,(e==null?void 0:e.alternate_damage_type)??(e==null?void 0:e.damage_type)??"");pe.name="alternate_damage_type",X.appendChild(pe);const{field:Ca,input:F}=v({name:"is_thrown",label:"Proprietà lancio",checked:(e==null?void 0:e.is_thrown)??!1}),k=document.createElement("div");k.className="compact-field-grid";const Fa=p({label:"Portata arma (m)",name:"melee_range",type:"text",placeholder:"Es. 1,5",value:(e==null?void 0:e.melee_range)??1.5}),ka=p({label:"Gittata normale",name:"range_normal",type:"number",value:(e==null?void 0:e.range_normal)??""}),Ma=p({label:"Gittata svantaggio",name:"range_disadvantage",type:"number",value:(e==null?void 0:e.range_disadvantage)??""});k.appendChild(Fa),k.appendChild(ka),k.appendChild(Ma);const Y=document.createElement("label");Y.className="field",Y.innerHTML="<span>Tipo armatura</span>";const me=L(ja,(e==null?void 0:e.armor_type)??"");me.name="armor_type",Y.appendChild(me);const{field:Me,input:N}=v({name:"is_shield",label:"Scudo",checked:(e==null?void 0:e.is_shield)??!1});Me.classList.add("item-modal-toggle-field--compact");const Ae=p({label:"Classe armatura base",name:"armor_class",type:"number",value:(e==null?void 0:e.armor_class)??""}),Pe=Ae.querySelector("input"),xe=p({label:"Bonus armatura",name:"armor_bonus",type:"number",value:(e==null?void 0:e.armor_bonus)??0}),Oe=xe.querySelector("input"),ze=p({label:"Bonus scudo",name:"shield_bonus",type:"number",value:(e==null?void 0:e.shield_bonus)??2}),De=ze.querySelector("input"),Re=u([W,K,Q],"balanced"),Be=u([Le,U,Se,Te],"compact"),He=u([Sa,J],"compact"),Ve=u([Ta],"compact"),Ie=u([Ce,Fe,ke,X],"compact"),je=u([Ca],"compact"),Ge=u([Y,Ae],"balanced"),ge=u([xe,ze,Me],"compact");ge.classList.add("item-modal-row--armor-bonus"),w.appendChild(Re),w.appendChild(Be),w.appendChild(He),w.appendChild(Ve),w.appendChild(Ie),w.appendChild(je),w.appendChild(k),w.appendChild(Ge),w.appendChild(ge);const We=c("Statistiche arma / armatura",[w]);r.appendChild(T),r.appendChild(Ea),r.appendChild(We),r.appendChild(La);const Ke=o=>o==="weapon"?"weapon":o==="armor"?"armor":"generic",be=()=>{const o=Ke(_.value);Ee.forEach(i=>{var g;if(!i)return;const d=i.value===o;i.checked=d,(g=i.closest(".condition-modal__item"))==null||g.classList.toggle("is-selected",d)})};Ee.forEach(o=>{o==null||o.addEventListener("change",()=>{o.checked&&(o.value==="weapon"?_.value="weapon":o.value==="armor"?_.value="armor":(_.value==="weapon"||_.value==="armor")&&(_.value="gear"),be(),C())})});const h=(o,i)=>{o&&(o.hidden=!i)},C=()=>{var na,la,ta,oa,ia;const o=(M==null?void 0:M.checked)??!1;Na.forEach($=>{$&&($.disabled=!o,o||($.checked=!1))}),O&&(O.disabled=!o,o||(O.checked=!1),(na=O.closest(".condition-modal__item"))==null||na.classList.toggle("is-selected",O.checked)),h(z,o);const i=_.value==="weapon",d=_.value==="armor",g=_.value==="container",E=Ke(_.value);se.disabled=!i,re.disabled=!i,ce.disabled=!i,Le.querySelector("input").disabled=!i,de.disabled=!i,Se.querySelector("input").disabled=!i,Te.querySelector("input").disabled=!i,q&&(q.disabled=!i,(la=q.closest(".condition-modal__item"))==null||la.classList.toggle("is-selected",q.checked)),ue.disabled=!i||!((q==null?void 0:q.checked)??!1),f&&(f.disabled=!i,(ta=f.closest(".condition-modal__item"))==null||ta.classList.toggle("is-selected",f.checked));const y=i&&((f==null?void 0:f.checked)??!1);[Ce,Fe,ke].forEach($=>{const sa=$.querySelector("input");sa&&(sa.disabled=!y)}),pe.disabled=!y,F&&(F.disabled=!i,(oa=F.closest(".condition-modal__item"))==null||oa.classList.toggle("is-selected",F.checked)),k.querySelectorAll("input").forEach($=>{$.disabled=!i,i?$.name==="melee_range"&&!$.value&&($.value="1.5"):$.value=""}),me.disabled=!d,N&&(N.disabled=!d,(ia=N.closest(".condition-modal__item"))==null||ia.classList.toggle("is-selected",N.checked)),Pe&&(Pe.disabled=!d),Oe&&(Oe.disabled=!d),De&&(De.disabled=!d||!((N==null?void 0:N.checked)??!1));const b=E==="weapon",ve=E==="armor";h(Re,b),h(Be,b),h(He,b),h(Ve,b),h(Ie,b&&((f==null?void 0:f.checked)??!1)),h(je,b),h(k,b),h(Ge,ve),h(ge,ve),h(We,b||ve),h(le,g),h(x,!i),te&&(te.disabled=!g,g||(te.value=""))};M==null||M.addEventListener("change",C),_.addEventListener("change",()=>{be(),C()}),N==null||N.addEventListener("change",C),F==null||F.addEventListener("change",C),q==null||q.addEventListener("change",C),f==null||f.addEventListener("change",C),be(),C(),l(r);const s=await pa({title:e?"Modifica oggetto":"Nuovo oggetto",submitLabel:e?"Salva":"Crea",content:r,cardClass:["modal-card--wide","modal-card--scrollable"]});if(!s)return;const Qe=s.get("equipable")==="on",D=Qe?s.getAll("equip_slots"):[],Aa=D[0]||null,Pa=s.get("category");if(D.length&&!Ua(a,s)){R("Non hai la competenza per equipaggiare questo oggetto","error");return}const Ue=s.get("sovrapponibile")==="on";if(D.length&&!Ue&&n.filter(i=>i.id!==(e==null?void 0:e.id)).filter(i=>da(i).some(d=>D.includes(d))).length){R("Uno o più slot selezionati sono già occupati","error");return}const Je={user_id:a.user_id,character_id:a.id,name:s.get("name"),image_url:((Xe=s.get("image_url"))==null?void 0:Xe.trim())||null,qty:Number(s.get("qty")),weight:Number(s.get("weight")),volume:Number(s.get("volume"))||0,value_cp:Number(s.get("value_cp")),category:Pa,container_item_id:s.get("container_item_id")||null,max_volume:s.get("max_volume")===""?null:Number(s.get("max_volume")),equipable:Qe,equip_slot:Aa,equip_slots:D,sovrapponibile:Ue,attunement_active:s.get("attunement_active")==="on",is_magic:s.get("is_magic")==="on",notes:s.get("notes"),weapon_type:s.get("weapon_type")||null,weapon_range:s.get("weapon_range")||null,attack_ability:s.get("attack_ability")||null,ammunition_type:s.get("ammunition_type")||null,required_ammunition_type:s.get("required_ammunition_type")||null,consumes_ammunition:s.get("consumes_ammunition")==="on",damage_die:((Ye=s.get("damage_die"))==null?void 0:Ye.trim())||null,damage_type:s.get("damage_type")||null,attack_modifier:Number(s.get("attack_modifier"))||0,damage_modifier:Number(s.get("damage_modifier"))||0,has_alternate_damage_mode:s.get("has_alternate_damage_mode")==="on",alternate_damage_label:((Ze=s.get("alternate_damage_label"))==null?void 0:Ze.trim())||null,alternate_damage_die:((ea=s.get("alternate_damage_die"))==null?void 0:ea.trim())||null,alternate_damage_modifier:Number(s.get("alternate_damage_modifier"))||0,alternate_damage_type:s.get("alternate_damage_type")||null,is_thrown:s.get("is_thrown")==="on",melee_range:(()=>{const o=String(s.get("melee_range")??"").trim().replace(",",".");if(!o)return null;const i=Number(o);return Number.isNaN(i)?null:i})(),range_normal:Number(s.get("range_normal"))||null,range_disadvantage:Number(s.get("range_disadvantage"))||null,armor_type:s.get("armor_type")||null,is_shield:s.get("is_shield")==="on",armor_class:Number(s.get("armor_class"))||null,armor_bonus:Number(s.get("armor_bonus"))||0,shield_bonus:Number(s.get("shield_bonus"))||0};ra(!0);try{e?(await Da(e.id,Je),R("Oggetto aggiornato")):(await za(Je),R("Oggetto creato")),await(t==null?void 0:t())}catch{R("Errore salvataggio oggetto","error")}finally{ra(!1)}}function bn(a){var t,l;if(!(a!=null&&a.image_url))return;const e=document.createElement("div");e.className="equipment-preview-modal";const n=((t=a.description)==null?void 0:t.trim())||((l=a.notes)==null?void 0:l.trim())||"Nessuna descrizione disponibile per questo equipaggiamento.";e.innerHTML=`
    <div class="detail-card detail-card--text equipment-preview-card">
      <img class="equipment-preview-image" src="${a.image_url}" alt="Foto di ${a.name}" />
      <div class="equipment-preview-content">
        <p>${n}</p>
      </div>
    </div>
  `,pa({title:a.name||"Equipaggiamento",cancelLabel:null,content:e,cardClass:"modal-card--equipment-preview",showFooter:!1})}async function vn(a){const{data:e,error:n}=await S.from("wallets").select("*").eq("character_id",a).single();if(n&&n.code!=="PGRST116")throw n;return e??null}async function _n(a){const{data:e,error:n}=await S.from("wallets").upsert(a).select("*").single();if(n)throw n;return e}async function fn(a){const{data:e,error:n}=await S.from("money_transactions").insert(a).select("*").single();if(n)throw n;return e}async function hn(a){const{data:e,error:n}=await S.from("money_transactions").select("*").eq("character_id",a).order("created_at",{ascending:!1});if(n)throw n;return e??[]}async function yn(a,e){const{data:n,error:t}=await S.from("money_transactions").update(e).eq("id",a).select("*").single();if(t)throw t;return n}async function wn(a){const{error:e}=await S.from("money_transactions").delete().eq("id",a);if(e)throw e}export{yn as A,wn as B,Qa as a,va as b,ln as c,sn as d,vn as e,ma as f,Ka as g,tn as h,fn as i,za as j,an as k,ga as l,dn as m,Da as n,bn as o,mn as p,hn as q,rn as r,on as s,un as t,_n as u,gn as v,pn as w,cn as x,ba as y,nn as z};
