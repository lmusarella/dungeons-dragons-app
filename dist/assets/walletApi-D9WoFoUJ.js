import{k as M,o as ba,d as b,e as E,p as Ga,c as G,s as da,j as Qa}from"./index-DtIC5mHn.js";import{b as Ka,a as Ua}from"./weaponMasteries-zUcl4F-E.js";async function vn(a){const{data:e,error:t}=await M.from("items").select("*").eq("character_id",a).order("created_at",{ascending:!0});if(t)throw t;return e??[]}async function Ja(a){const{data:e,error:t}=await M.from("items").insert(a).select("*").single();if(t)throw t;return e}async function Xa(a,e){const{data:t,error:i}=await M.from("items").update(e).eq("id",a).select("*").single();if(i)throw i;return t}async function _n(a){const{error:e}=await M.from("items").delete().eq("id",a);if(e)throw e}function fn(a=[]){return a.reduce((e,t)=>{const i=Number(t.qty??0),l=Number(t.weight??0);return e+i*l},0)}function yn(a,e){const t={...a};return Object.keys(e).forEach(i=>{t[i]=Number(t[i]??0)+Number(e[i]??0)}),t}function va(a,e="lb"){return a==null||Number.isNaN(a)?"-":`${Number(a).toFixed(2).replace(/\.00$/,"")} ${e}`}const _a=[{value:"head",label:"Testa"},{value:"eyes-left",label:"Occhio sinistro"},{value:"eyes-right",label:"Occhio destro"},{value:"ears-left",label:"Orecchio sinistro"},{value:"ears-right",label:"Orecchio destro"},{value:"neck",label:"Collo"},{value:"shoulder-left",label:"Spalla sinistra"},{value:"shoulder-right",label:"Spalla destra"},{value:"back",label:"Schiena"},{value:"chest",label:"Torso"},{value:"arm-left",label:"Braccio sinistro"},{value:"arm-right",label:"Braccio destro"},{value:"hand-left",label:"Mano sinistra"},{value:"hand-right",label:"Mano destra"},{value:"wrist-left",label:"Polso sinistro"},{value:"wrist-right",label:"Polso destro"},{value:"waist",label:"Vita"},{value:"leg-left",label:"Gamba sinistra"},{value:"leg-right",label:"Gamba destra"},{value:"foot-left",label:"Piede sinistro"},{value:"foot-right",label:"Piede destro"},{value:"ring-left",label:"Dita/Anello sinistro"},{value:"ring-right",label:"Dita/Anello destro"},{value:"main-hand",label:"Mano principale"},{value:"off-hand",label:"Mano secondaria"},{value:"eyes",label:"Occhi (generico)"},{value:"ears",label:"Orecchie (generico)"},{value:"shoulders",label:"Spalle (generico)"},{value:"arms",label:"Braccia (generico)"},{value:"hands",label:"Mani (generico)"},{value:"wrists",label:"Polsi (generico)"},{value:"legs",label:"Gambe (generico)"},{value:"feet",label:"Piedi (generico)"},{value:"ring",label:"Dita/Anelli (generico)"}],Se=[{value:"gear",label:"Vestiario",equipable:!0},{value:"loot",label:"Loot"},{value:"consumable",label:"Consumabili"},{value:"weapon",label:"Armi",equipable:!0},{value:"armor",label:"Armature",equipable:!0},{value:"jewelry",label:"Gioielli e ornamenti",equipable:!0},{value:"tool",label:"Strumenti"},{value:"container",label:"Contenitore",equipable:!0}],hn=[{value:"",label:"Tutte"},...Se],Ya=new Map([...Se.map(a=>[a.value,a.label]),["magic","Magici"]]),Za=new Map(_a.map(a=>[a.value,a.label])),Ia=[{value:"",label:"Seleziona"},{value:"simple",label:"Semplice"},{value:"martial",label:"Da guerra"}],en=[{value:"",label:"Seleziona"},{value:"melee",label:"Mischia"},{value:"ranged",label:"Distanza"}],an=[{value:"",label:"Seleziona"},{value:"str",label:"FOR"},{value:"dex",label:"DES"}],nn=[{value:"",label:"Seleziona"},{value:"light",label:"Leggera"},{value:"medium",label:"Media"},{value:"heavy",label:"Pesante"}],Ce=[{value:"",label:"Nessuna"},{value:"arrow",label:"Frecce"},{value:"bolt",label:"Dardi"},{value:"bullet",label:"Proiettili"}],Ee=[{value:"",label:"Seleziona"},{value:"acid",label:"Acido"},{value:"bludgeoning",label:"Contundente"},{value:"piercing",label:"Perforante"},{value:"slashing",label:"Tagliente"},{value:"cold",label:"Freddo"},{value:"fire",label:"Fuoco"},{value:"force",label:"Forza"},{value:"lightning",label:"Fulmine"},{value:"thunder",label:"Tuono"},{value:"necrotic",label:"Necrotico"},{value:"poison",label:"Veleno"},{value:"psychic",label:"Psichico"},{value:"radiant",label:"Radioso"}],pa=new Map(Ce.map(a=>[a.value,a.label])),tn=new Map(Ee.map(a=>[a.value,a.label]));function fa(a){if(!a)return{};if(typeof a=="string")try{return JSON.parse(a)}catch{return{}}return a}function ya(a){return Ya.get(a)??(a||"Altro")}function ln(a){return Za.get(a)??a}function wn(a){return a.map(e=>ln(e)).join(", ")}function ua(a){if(!a)return[];if(Array.isArray(a.equip_slots))return a.equip_slots.filter(Boolean);if(typeof a.equip_slots=="string"&&a.equip_slots.trim())try{const e=JSON.parse(a.equip_slots);if(Array.isArray(e))return e.filter(Boolean)}catch{return[a.equip_slots]}return a.equip_slot?[a.equip_slot]:[]}function on(a){var e,t;return((t=(e=a.data)==null?void 0:e.settings)==null?void 0:t.weight_unit)??"lb"}function sn(a={}){return{magic:a.is_magic?"Magico":"Non magico",equipable:a.equipable?"Equipaggiabile":"Non equipaggiabile",attunement:a.attunement_active?"In sintonia":"Non in sintonia"}}function rn(a,e){var l;const t=((l=a.data)==null?void 0:l.proficiencies)||{},i=e.get("category");if(i==="weapon"){const s=e.get("weapon_type");return s?s==="simple"?!!t.weapon_simple:!!t.weapon_martial:!1}if(i==="armor"){if(e.get("is_shield")==="on")return!!t.shield;const c=e.get("armor_type");return c?c==="light"?!!t.armor_light:c==="medium"?!!t.armor_medium:!!t.armor_heavy:!1}return!0}function cn(a){const e="/dungeons-dragons-app/",t={pp:`${e}icons/moneta_platino.png`,gp:`${e}icons/moneta_oro.png`,sp:`${e}icons/moneta_argento.png`,cp:`${e}icons/moneta_rame.png`},i=fa(a),l=["pp","gp","sp","cp"].map(c=>({coin:c,value:Number((i==null?void 0:i[c])??0)})).filter(c=>c.value!==0);return(l.length?l:[{coin:"gp",value:0}]).map((c,m)=>`
      ${m?'<span class="transaction-coin__divider" aria-hidden="true">·</span>':""}
      <span class="transaction-coin" data-coin="${c.coin}">
        <span class="coin-avatar coin-avatar--${c.coin}" aria-hidden="true">
          <img src="${t[c.coin]}" alt="" loading="lazy" />
        </span>
        <span class="transaction-coin__value">${c.value}</span>
      </span>
    `).join("")}function dn(a){const e=fa(a),t=["pp","gp","sp","cp"].map(i=>({coin:i,value:Number((e==null?void 0:e[i])??0)})).filter(i=>i.value!==0);return t.length?t.map(i=>`${i.value} ${i.coin}`).join(" · "):"0 gp"}const pn=8;function ie(a,e,t,i,l){return`
      <label class="field wallet-edit-field">
        <span class="wallet-edit-field__label">
          <span class="coin-avatar ${l}" aria-hidden="true">
            <img src="${i}" alt="" loading="lazy" />
          </span>
          <span>${a}</span>
        </span>
        <input name="${e}" type="number" value="${t}" min="0" step="1" />
      </label>
  `}function un(a){const e=document.createElement("li"),t=a.direction==="pay"?"Pagamento":"Entrata",i=cn(a.amount),l=dn(a.amount),s=a.direction==="pay"?"transaction-item--outgoing":"transaction-item--incoming";return e.className=`transaction-item ${s}`,e.innerHTML=`
      <div class="transaction-info">
        <p class="muted">${a.reason||"Nessuna nota"}</p>
      </div>
      <span class="transaction-amount" aria-label="${l}">${i}</span>
      <div class="transaction-meta">
        <span class="resource-chip transaction-direction-chip ${a.direction==="pay"?"transaction-direction-chip--outgoing":"transaction-direction-chip--incoming"}">${t}</span>
        <div class="transaction-actions">
          <button class="icon-button transaction-action-button" type="button" data-edit-transaction="${a.id}" aria-label="Modifica transazione" title="Modifica">
            <span aria-hidden="true">✏️</span>
          </button>
          <button class="icon-button icon-button--danger transaction-action-button transaction-action-button--danger" type="button" data-delete-transaction="${a.id}" aria-label="Elimina transazione" title="Elimina">
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>
      </div>
    `,e}function ma({title:a,transactions:e,open:t=!1}){const i=document.createElement("details");i.className="transaction-accordion",i.open=t;const l=e.length,s=document.createElement("summary");s.className="transaction-accordion__summary",s.innerHTML=`
    <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
    <span class="transaction-accordion__title">${a}</span>
    <span class="transaction-accordion__count">${l} ${l===1?"movimento":"movimenti"}</span>
  `;const c=document.createElement("div");if(c.className="transaction-accordion__body",!e.length)c.innerHTML=`<p class="muted">Nessuna ${a.toLowerCase()} registrata.</p>`;else{const m=document.createElement("ul");m.className="transaction-items",e.forEach(h=>m.appendChild(un(h))),c.appendChild(m)}return i.classList.toggle("transaction-list--scrollable",e.length>pn),i.append(s,c),i}function $n(a){const e=document.createElement("div");if(e.className="transaction-list transaction-list--grouped",!a.length)return e.innerHTML='<p class="muted">Nessuna transazione registrata.</p>',e;const t=a.filter(l=>l.direction!=="pay"),i=a.filter(l=>l.direction==="pay");return e.appendChild(ma({title:"Entrate",transactions:t,open:t.length>0})),e.appendChild(ma({title:"Uscite",transactions:i,open:t.length===0&&i.length>0})),e}function Nn(a,e="lb"){const t=a.filter(s=>s.category==="container"),i=a.filter(s=>!s.container_item_id&&s.category!=="container");return`
    ${t.map(s=>{const c=a.filter(R=>R.container_item_id===s.id),m=c.reduce((R,Q)=>{const K=Number(Q.volume)||0,x=Number(Q.qty)||1;return R+K*x},0),h=Number(s.max_volume)||null,f=h?`Volume ${m}/${h}`:m?`Volume ${m}`:"";return`
      <details class="inventory-group inventory-group--container inventory-container-accordion" open>
        <summary class="inventory-table__row inventory-table__row--container inventory-container-accordion__summary">
          <div class="inventory-table__cell inventory-table__cell--item">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <div class="item-info-body">
              <strong>${s.name}</strong>
              ${f?`<span class="muted">${f}</span>`:""}
            </div>
          </div>
          <div class="inventory-table__cell" data-label="Categoria"><span class="inventory-data-pill">${ya(s.category)}</span></div>
          <div class="inventory-table__cell" data-label="Quantità">${s.qty}</div>
          <div class="inventory-table__cell" data-label="Peso">${va(s.weight??0,e)}</div>
          <div class="inventory-table__cell" data-label="Volume">${s.max_volume??"-"}</div>
          <div class="inventory-table__cell inventory-table__cell--actions">
            <button class="resource-action-button icon-button" data-edit="${s.id}" aria-label="Modifica" title="Modifica">
              <span aria-hidden="true">✏️</span>
            </button>
            <button class="resource-action-button icon-button" data-delete="${s.id}" aria-label="Elimina" title="Elimina">
              <span aria-hidden="true">🗑️</span>
            </button>
          </div>
        </summary>
        <div class="inventory-group__children">
          <p class="inventory-group__label">Contenuto del contenitore</p>
          ${ga(c,e,{nested:!0,emptyLabel:"Nessun oggetto nel contenitore."})}
        </div>
      </details>
    `}).join("")}
    <details class="inventory-group inventory-group--loose inventory-loose-accordion" open>
      <summary class="inventory-loose-accordion__summary">
        <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
        <span class="inventory-loose-accordion__title">Oggetti Sfusi</span>
        <span class="inventory-loose-accordion__count">${i.length} ${i.length===1?"oggetto":"oggetti"}</span>
      </summary>
      <div class="inventory-group__children inventory-group__children--loose">
        ${ga(i,e)}
      </div>
    </details>
  `}function ga(a,e="lb",{nested:t=!1,emptyLabel:i="Nessun oggetto."}={}){return a.length?`
    <div class="inventory-table ${t?"inventory-table--nested":""}">
      <div class="inventory-table__header">
        <span>Oggetto</span>
        <span>Cat.</span>
        <span>Qtà</span>
        <span>Peso</span>
        <span>Vol.</span>
        <span>Azioni</span>
      </div>
      <div class="inventory-table__body">
        ${a.map(l=>{const s=l.volume!==null&&l.volume!==void 0?l.volume:"-",c=sn(l);return`
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
                ${l.ammunition_type?`<span class="muted">Munizioni: ${pa.get(l.ammunition_type)||l.ammunition_type}</span>`:""}
                ${l.consumes_ammunition?`<span class="muted">Consuma: ${pa.get(l.required_ammunition_type)||l.required_ammunition_type||"munizioni"}</span>`:""}
                ${l.damage_type?`<span class="muted">Danno: ${tn.get(l.damage_type)||l.damage_type}</span>`:""}
              </div>
            </div>
            <div class="inventory-table__cell" data-label="Categoria"><span class="inventory-data-pill">${ya(l.category)}</span></div>
            <div class="inventory-table__cell" data-label="Quantità">${l.qty}</div>
            <div class="inventory-table__cell" data-label="Peso">${va(l.weight??0,e)}</div>
            <div class="inventory-table__cell" data-label="Volume">${s}</div>
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
  `:`<p class="muted eyebrow">${i}</p>`}function qn({amount:a=0,coin:e="gp",reason:t="",occurredOn:i,direction:l="receive",includeDirection:s=!1}={}){const c=i||new Date().toISOString().split("T")[0];return`
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
          <input name="reason" placeholder="Motivo" value="${t}" />
        </label>
      </div>
    `:`
      <label class="field">
        <span>Motivo</span>
        <input name="reason" placeholder="Motivo" value="${t}" />
      </label>
    `}
   
  `}function Cn({amount:a=0,source:e="gp",target:t="pp",targetAmount:i=0,available:l={}}={}){const s=[{key:"pp",label:"Platino",value:Number(l.pp??0)},{key:"gp",label:"Oro",value:Number(l.gp??0)},{key:"sp",label:"Argento",value:Number(l.sp??0)},{key:"cp",label:"Rame",value:Number(l.cp??0)}],c=s.some(f=>f.value>0),m=s.filter(f=>f.value>0).map(f=>`
          <option value="${f.key}" ${e===f.key?"selected":""}>${f.label}</option>
        `).join(""),h=s.map(f=>`
          <option value="${f.key}" ${t===f.key?"selected":""}>${f.label}</option>
        `).join("");return`
    <div class="modal-section">
      <h4 class="modal-section__title">Seleziona le monete da scambiare</h4>
      <div class="money-grid compact-grid-fields">
        <label class="field">
          <span>Tipo moneta</span>
          <select name="source" ${c?"":"disabled"}>
            ${c?m:'<option value="" selected>Nessuna moneta disponibile</option>'}
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
            ${h}
          </select>
        </label>
        <label class="field">
          <span>Controvalore</span>
          <input name="target_amount" type="number" value="${i}" min="0" step="1" readonly />
        </label>
      </div>
    </div>
  `}function En(a={}){const e="/dungeons-dragons-app/",t={pp:`${e}icons/moneta_platino.png`,gp:`${e}icons/moneta_oro.png`,sp:`${e}icons/moneta_argento.png`,cp:`${e}icons/moneta_rame.png`},i={pp:Number(a.pp??0),gp:Number(a.gp??0),sp:Number(a.sp??0),cp:Number(a.cp??0)};return`
    <div class="wallet-edit-grid compact-grid-fields">
      <div class="compact-field-grid">
        ${ie("Platino","pp",i.pp,t.pp,"coin-avatar--pp")}
        ${ie("Oro","gp",i.gp,t.gp,"coin-avatar--gp")}
      </div>
      <div class="compact-field-grid">
        ${ie("Argento","sp",i.sp,t.sp,"coin-avatar--sp")}
        ${ie("Rame","cp",i.cp,t.cp,"coin-avatar--cp")}
      </div>
    </div>
  `}function Sn(a){return`
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
  `}async function Ln(a,e,t,i){var ta,la,oa,ia,sa,ra;const l=n=>{n==null||n.querySelectorAll('input[type="number"]').forEach(o=>{var u,p,v;const d=(v=(p=(u=o.closest(".field"))==null?void 0:u.querySelector("span"))==null?void 0:p.textContent)==null?void 0:v.trim();Qa(o,{decrementLabel:d?`Riduci ${d}`:"Diminuisci valore",incrementLabel:d?`Aumenta ${d}`:"Aumenta valore"})})},s=document.createElement("div");s.className="drawer-form modal-form-grid item-editor-form";const c=(n,o=[],{icon:d="",description:u="",className:p=""}={})=>{const v=document.createElement("section");v.className=["item-modal-section",p].filter(Boolean).join(" ");const _=document.createElement("div");if(_.className="item-modal-section__header",d){const y=document.createElement("span");y.className="item-modal-section__icon",y.setAttribute("aria-hidden","true"),y.textContent=d,_.appendChild(y)}const g=document.createElement("div");g.className="item-modal-section__heading";const q=document.createElement("h4");if(q.className="item-modal-section__title",q.textContent=n,g.appendChild(q),u){const y=document.createElement("p");y.className="item-modal-section__description",y.textContent=u,g.appendChild(y)}return _.appendChild(g),v.appendChild(_),o.filter(Boolean).forEach(y=>v.appendChild(y)),v},m=(n,o="balanced")=>{const d=document.createElement("div");return d.className=`modal-form-row modal-form-row--${o}`,n.filter(Boolean).forEach(u=>d.appendChild(u)),d},h=({name:n,label:o,checked:d=!1,type:u="checkbox",value:p=""})=>{const v=document.createElement("label");v.className="condition-modal__item item-modal-toggle-field";const _=p?` value="${p}"`:"";v.innerHTML=`
      <span class="condition-modal__item-label"><strong>${o}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="${u}" name="${n}"${_} ${d?"checked":""} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;const g=v.querySelector("input");return v.classList.toggle("is-selected",!!(g!=null&&g.checked)),g==null||g.addEventListener("change",()=>{v.classList.toggle("is-selected",g.checked)}),{field:v,input:g}},f=b({label:"Nome",name:"name",value:(e==null?void 0:e.name)??""}),R=b({label:"Foto (URL)",name:"image_url",placeholder:"https://.../oggetto.png",value:(e==null?void 0:e.image_url)??""}),Q=c("Identità oggetto",[m([f,R],"balanced")],{icon:"✦",description:"Parti dalle informazioni che riconosci subito nella lista inventario.",className:"item-modal-section--identity"}),K=b({label:"Quantità",name:"qty",type:"number",value:(e==null?void 0:e.qty)??1}),x=K.querySelector("input");x&&(x.min="0",x.step="1");const Le=b({label:"Peso",name:"weight",type:"number",value:(e==null?void 0:e.weight)??0}),se=Le.querySelector("input");if(se){const n=on(a);se.min="0",se.step=n==="kg"?"0.1":"1"}const Te=b({label:"Volume",name:"volume",type:"number",value:(e==null?void 0:e.volume)??0}),re=Te.querySelector("input");re&&(re.min="0",re.step="0.1");const Me=b({label:"Valore (cp)",name:"value_cp",type:"number",value:(e==null?void 0:e.value_cp)??0}),ce=Me.querySelector("input");ce&&(ce.min="0",ce.step="1");const ha=c("Quantità, peso e valore",[m([K,Le,Te,Me],"compact")],{icon:"⚖️",description:"Numeri essenziali per carico, scorte e tesoro."}),w=E([{value:"",label:"Seleziona"},...Se],(e==null?void 0:e.category)??"");w.name="category";const U=document.createElement("label");U.className="field",U.innerHTML="<span>Categoria</span>",U.appendChild(w);const wa=[{value:"",label:"Nessuno"}].concat(t.filter(n=>n.category==="container").map(n=>({value:n.id,label:n.name}))),Fe=E(wa,(e==null?void 0:e.container_item_id)??"");Fe.name="container_item_id";const J=document.createElement("label");J.className="field",J.innerHTML="<span>Contenitore</span>",J.appendChild(Fe);const de=b({label:"Volume massimo contenitore",name:"max_volume",type:"number",value:(e==null?void 0:e.max_volume)??""}),pe=de.querySelector("input"),D=document.createElement("label");D.className="field",D.innerHTML="<span>Tipo munizione dell'oggetto</span>";const ue=E(Ce,(e==null?void 0:e.ammunition_type)??"");ue.name="ammunition_type",D.appendChild(ue);const X=document.createElement("div");X.className="item-modal-kind",X.innerHTML='<span class="item-modal-kind__label">Tipologia rapida</span><p class="item-modal-kind__hint">Scegli una tipologia per mostrare solo i campi davvero utili.</p>';const me=document.createElement("div");me.className="condition-modal__list item-modal-kind__list";const ke=[{value:"generic",label:"Oggetto"},{value:"weapon",label:"Arma"},{value:"armor",label:"Armatura"}].map(n=>{const o=document.createElement("label");return o.className="condition-modal__item item-modal-kind__item",o.innerHTML=`
      <span class="condition-modal__item-label"><strong>${n.label}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="radio" name="item_kind" value="${n.value}" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `,me.appendChild(o),o.querySelector("input")});X.appendChild(me);const $a=m([U,J,de,D],"balanced"),Na=c("Categoria e collocazione",[X,$a],{icon:"🧭",description:"Definisci tipo, contenitore e dettagli contestuali."}),Y=document.createElement("div");Y.className="condition-modal__list item-modal-toggle-list";const{field:qa}=h({name:"attunement_active",label:"Sintonia attiva",checked:(e==null?void 0:e.attunement_active)??!1}),{field:Ca}=h({name:"is_magic",label:"Magico",checked:(e==null?void 0:e.is_magic)??!1});Y.appendChild(qa),Y.appendChild(Ca);const Ea=c("Stato speciale",[Y],{icon:"✨",description:"Flag rapidi per magia e sintonia."}),Z=document.createElement("div");Z.className="condition-modal__list item-modal-toggle-list";const{field:Sa,input:P}=h({name:"equipable",label:"Equipaggiabile",checked:(e==null?void 0:e.equipable)??!1}),{field:La,input:H}=h({name:"sovrapponibile",label:"Sovrapponibile",checked:(e==null?void 0:e.sovrapponibile)??!1});Z.appendChild(Sa),Z.appendChild(La);const B=document.createElement("fieldset");B.className="equip-slot-field",B.innerHTML="<legend>Punti del corpo</legend>";const ge=document.createElement("div");ge.className="equip-slot-list";const Ta=ua(e),Ma=_a.map(n=>{const o=document.createElement("label");o.className="checkbox",o.innerHTML=`<input type="checkbox" name="equip_slots" value="${n.value}" /> <span>${n.label}</span>`;const d=o.querySelector("input");return d&&Ta.includes(n.value)&&(d.checked=!0),ge.appendChild(o),d});B.appendChild(ge);const Fa=c("Equipaggiamento",[Z,B],{icon:"🛡️",description:"Attiva l’equipaggiamento solo se l’oggetto occupa slot del corpo."}),ka=c("Note e descrizione",[Ga({label:"Note",name:"notes",value:(e==null?void 0:e.notes)??""})],{icon:"📝",description:"Descrizione, effetti particolari o promemoria di gioco."}),N=document.createElement("div");N.className="drawer-form modal-form-grid";const I=document.createElement("label");I.className="field",I.innerHTML="<span>Tipo arma</span>";const be=E(Ia,(e==null?void 0:e.weapon_type)??"");be.name="weapon_type",I.appendChild(be);const ee=document.createElement("label");ee.className="field",ee.innerHTML="<span>Proprietà arma</span>";const ve=E(en,(e==null?void 0:e.weapon_range)??"");ve.name="weapon_range",ee.appendChild(ve);const ae=document.createElement("label");ae.className="field",ae.innerHTML="<span>Caratteristica tiro per colpire</span>";const _e=E(an,(e==null?void 0:e.attack_ability)??"");_e.name="attack_ability",ae.appendChild(_e);const V=document.createElement("label");V.className="field",V.innerHTML="<span>Maestria arma (2024)</span>";const j=E(Ka,(e==null?void 0:e.weapon_mastery)??"");j.name="weapon_mastery",V.appendChild(j);const fe=document.createElement("p");fe.className="muted weapon-mastery-help",V.appendChild(fe);const Ae=()=>{fe.textContent=Ua(j.value)};j.addEventListener("change",Ae),Ae();const ze=b({label:"Dado danno",name:"damage_die",placeholder:"Es. 1d8",value:(e==null?void 0:e.damage_die)??""}),Pe=b({label:"Modificatore per colpire",name:"attack_modifier",type:"number",value:(e==null?void 0:e.attack_modifier)??0}),Oe=b({label:"Modificatore danno",name:"damage_modifier",type:"number",value:(e==null?void 0:e.damage_modifier)??0}),ne=document.createElement("label");ne.className="field",ne.innerHTML="<span>Tipo danno</span>";const te=E(Ee,(e==null?void 0:e.damage_type)??"");te.name="damage_type",ne.appendChild(te);const{field:Re,input:S}=h({name:"consumes_ammunition",label:"Consuma munizioni",checked:(e==null?void 0:e.consumes_ammunition)??!1});Re.classList.add("item-modal-toggle-field--compact");const le=document.createElement("label");le.className="field",le.innerHTML="<span>Munizione richiesta</span>";const ye=E(Ce,(e==null?void 0:e.required_ammunition_type)??(e==null?void 0:e.ammunition_type)??"");ye.name="required_ammunition_type",le.appendChild(ye);const Aa=n=>{const o=n==null?void 0:n.weapon_damage_modes;let d=[];if(Array.isArray(o))d=o;else if(typeof o=="string"&&o.trim())try{const p=JSON.parse(o);d=Array.isArray(p)?p:[]}catch{d=[]}const u=d.map(p=>({label:p.label||p.name||"",damage_die:p.damage_die||p.damageDie||"",damage_modifier:p.damage_modifier??p.damageModifier??0,damage_type:p.damage_type||p.damageType||(n==null?void 0:n.damage_type)||""})).filter(p=>p.label||p.damage_die);return!u.length&&(n!=null&&n.has_alternate_damage_mode)&&(n!=null&&n.alternate_damage_die)&&u.push({label:n.alternate_damage_label||"Due mani",damage_die:n.alternate_damage_die,damage_modifier:n.alternate_damage_modifier??n.damage_modifier??0,damage_type:n.alternate_damage_type||n.damage_type||""}),u},F=document.createElement("div");F.className="weapon-damage-modes-field",F.innerHTML=`
    <div class="weapon-damage-modes-field__header">
      <div>
        <strong>Impugnature aggiuntive</strong>
        <p class="muted">Aggiungi più modalità oltre al danno base dell'arma.</p>
      </div>
      <button type="button" class="resource-action-button" data-add-weapon-damage-mode>Aggiungi</button>
    </div>
    <div class="weapon-damage-modes-field__list" data-weapon-damage-modes></div>
  `;const he=F.querySelector("[data-weapon-damage-modes]"),we=F.querySelector("[data-add-weapon-damage-mode]"),za=({label:n="",damage_die:o="",damage_modifier:d=0,damage_type:u=""}={})=>{const p=document.createElement("div");p.className="weapon-damage-mode-row";const v=b({label:"Nome",name:"weapon_damage_mode_label",placeholder:"Es. Due mani",value:n}),_=b({label:"Dado",name:"weapon_damage_mode_die",placeholder:"Es. 1d10",value:o}),g=b({label:"Mod.",name:"weapon_damage_mode_modifier",type:"number",value:d??0}),q=document.createElement("label");q.className="field",q.innerHTML="<span>Tipo</span>";const y=E(Ee,u||(e==null?void 0:e.damage_type)||"");y.name="weapon_damage_mode_type",q.appendChild(y);const T=document.createElement("button");return T.type="button",T.className="icon-button weapon-damage-mode-row__remove",T.setAttribute("aria-label","Rimuovi impugnatura"),T.title="Rimuovi",T.innerHTML='<span aria-hidden="true">🗑️</span>',T.addEventListener("click",()=>p.remove()),p.append(v,_,g,q,T),l(p),p},xe=(n={})=>{he==null||he.appendChild(za(n))};Aa(e).forEach(n=>xe(n)),we==null||we.addEventListener("click",()=>xe({damage_type:te.value}));const{field:Pa,input:k}=h({name:"is_thrown",label:"Proprietà lancio",checked:(e==null?void 0:e.is_thrown)??!1}),A=document.createElement("div");A.className="compact-field-grid";const Oa=b({label:"Portata arma (m)",name:"melee_range",type:"text",placeholder:"Es. 1,5",value:(e==null?void 0:e.melee_range)??1.5}),Ra=b({label:"Gittata normale",name:"range_normal",type:"number",value:(e==null?void 0:e.range_normal)??""}),xa=b({label:"Gittata svantaggio",name:"range_disadvantage",type:"number",value:(e==null?void 0:e.range_disadvantage)??""});A.appendChild(Oa),A.appendChild(Ra),A.appendChild(xa);const oe=document.createElement("label");oe.className="field",oe.innerHTML="<span>Tipo armatura</span>";const $e=E(nn,(e==null?void 0:e.armor_type)??"");$e.name="armor_type",oe.appendChild($e);const{field:De,input:L}=h({name:"is_shield",label:"Scudo",checked:(e==null?void 0:e.is_shield)??!1});De.classList.add("item-modal-toggle-field--compact");const He=b({label:"Classe armatura base",name:"armor_class",type:"number",value:(e==null?void 0:e.armor_class)??""}),Be=He.querySelector("input"),Ve=b({label:"Bonus armatura",name:"armor_bonus",type:"number",value:(e==null?void 0:e.armor_bonus)??0}),je=Ve.querySelector("input"),We=b({label:"Bonus scudo",name:"shield_bonus",type:"number",value:(e==null?void 0:e.shield_bonus)??2}),Ge=We.querySelector("input"),Qe=m([I,ee,ae],"balanced"),Ke=m([V],"balanced"),Ue=m([ze,ne,Pe,Oe],"compact"),Je=m([Re,le],"compact"),Xe=m([Pa],"compact"),Ye=m([oe,He],"balanced"),Ne=m([Ve,We,De],"compact");Ne.classList.add("item-modal-row--armor-bonus"),N.appendChild(Qe),N.appendChild(Ke),N.appendChild(Ue),N.appendChild(Je),N.appendChild(F),N.appendChild(Xe),N.appendChild(A),N.appendChild(Ye),N.appendChild(Ne);const Ze=c("Statistiche da combattimento",[N],{icon:"⚔️",description:"Questa sezione appare solo per armi e armature."});s.appendChild(Q),s.appendChild(ha),s.appendChild(Na),s.appendChild(Ea),s.appendChild(Fa),s.appendChild(Ze),s.appendChild(ka);const Ie=n=>n==="weapon"?"weapon":n==="armor"?"armor":"generic",qe=()=>{const n=Ie(w.value);ke.forEach(o=>{var u;if(!o)return;const d=o.value===n;o.checked=d,(u=o.closest(".condition-modal__item"))==null||u.classList.toggle("is-selected",d)})};ke.forEach(n=>{n==null||n.addEventListener("change",()=>{n.checked&&(n.value==="weapon"?w.value="weapon":n.value==="armor"?w.value="armor":(w.value==="weapon"||w.value==="armor")&&(w.value="gear"),qe(),z())})});const $=(n,o)=>{n&&(n.hidden=!o)},z=()=>{var q,y,T,ca;const n=(P==null?void 0:P.checked)??!1;Ma.forEach(C=>{C&&(C.disabled=!n,n||(C.checked=!1))}),H&&(H.disabled=!n,n||(H.checked=!1),(q=H.closest(".condition-modal__item"))==null||q.classList.toggle("is-selected",H.checked)),$(B,n);const o=w.value==="weapon",d=w.value==="armor",u=w.value==="container",p=Ie(w.value);be.disabled=!o,ve.disabled=!o,_e.disabled=!o,j.disabled=!o,ze.querySelector("input").disabled=!o,te.disabled=!o,Pe.querySelector("input").disabled=!o,Oe.querySelector("input").disabled=!o,S&&(S.disabled=!o,(y=S.closest(".condition-modal__item"))==null||y.classList.toggle("is-selected",S.checked)),ye.disabled=!o||!((S==null?void 0:S.checked)??!1),F.querySelectorAll("input, select, button").forEach(C=>{C.disabled=!o}),k&&(k.disabled=!o,(T=k.closest(".condition-modal__item"))==null||T.classList.toggle("is-selected",k.checked)),A.querySelectorAll("input").forEach(C=>{C.disabled=!o,o?C.name==="melee_range"&&!C.value&&(C.value="1.5"):C.value=""}),$e.disabled=!d,L&&(L.disabled=!d,(ca=L.closest(".condition-modal__item"))==null||ca.classList.toggle("is-selected",L.checked)),Be&&(Be.disabled=!d),je&&(je.disabled=!d),Ge&&(Ge.disabled=!d||!((L==null?void 0:L.checked)??!1));const _=p==="weapon",g=p==="armor";$(Qe,_),$(Ke,_),$(Ue,_),$(Je,_),$(F,_),$(Xe,_),$(A,_),$(Ye,g),$(Ne,g),$(Ze,_||g),$(de,u),$(D,!o&&!u),ue.disabled=o||u,pe&&(pe.disabled=!u,u||(pe.value=""))};P==null||P.addEventListener("change",z),w.addEventListener("change",()=>{qe(),z()}),L==null||L.addEventListener("change",z),k==null||k.addEventListener("change",z),S==null||S.addEventListener("change",z),qe(),z(),l(s);const r=await ba({title:e?"Modifica oggetto":"Nuovo oggetto",submitLabel:e?"Salva":"Crea",content:s,cardClass:["modal-card--wide","modal-card--scrollable","modal-card--item-editor"]});if(!r)return;const ea=r.get("equipable")==="on",W=ea?r.getAll("equip_slots"):[],Da=W[0]||null,Ha=r.get("category");if(W.length&&!rn(a,r)){G("Non hai la competenza per equipaggiare questo oggetto","error");return}const aa=r.get("sovrapponibile")==="on";if(W.length&&!aa&&t.filter(o=>o.id!==(e==null?void 0:e.id)).filter(o=>ua(o).some(d=>W.includes(d))).length){G("Uno o più slot selezionati sono già occupati","error");return}const Ba=r.getAll("weapon_damage_mode_label"),Va=r.getAll("weapon_damage_mode_die"),ja=r.getAll("weapon_damage_mode_modifier"),Wa=r.getAll("weapon_damage_mode_type"),O=Va.map((n,o)=>({id:`mode-${o+1}`,label:String(Ba[o]||"").trim()||`Impugnatura ${o+1}`,damage_die:String(n||"").trim(),damage_modifier:Number(ja[o])||0,damage_type:Wa[o]||null})).filter(n=>n.damage_die),na={user_id:a.user_id,character_id:a.id,name:r.get("name"),image_url:((ta=r.get("image_url"))==null?void 0:ta.trim())||null,qty:Number(r.get("qty")),weight:Number(r.get("weight")),volume:Number(r.get("volume"))||0,value_cp:Number(r.get("value_cp")),category:Ha,container_item_id:r.get("container_item_id")||null,max_volume:r.get("max_volume")===""?null:Number(r.get("max_volume")),equipable:ea,equip_slot:Da,equip_slots:W,sovrapponibile:aa,attunement_active:r.get("attunement_active")==="on",is_magic:r.get("is_magic")==="on",notes:r.get("notes"),weapon_type:r.get("weapon_type")||null,weapon_range:r.get("weapon_range")||null,attack_ability:r.get("attack_ability")||null,weapon_mastery:r.get("weapon_mastery")||null,ammunition_type:r.get("ammunition_type")||null,required_ammunition_type:r.get("required_ammunition_type")||null,consumes_ammunition:r.get("consumes_ammunition")==="on",damage_die:((la=r.get("damage_die"))==null?void 0:la.trim())||null,damage_type:r.get("damage_type")||null,attack_modifier:Number(r.get("attack_modifier"))||0,damage_modifier:Number(r.get("damage_modifier"))||0,weapon_damage_modes:O,has_alternate_damage_mode:O.length>0,alternate_damage_label:((oa=O[0])==null?void 0:oa.label)||null,alternate_damage_die:((ia=O[0])==null?void 0:ia.damage_die)||null,alternate_damage_modifier:Number((sa=O[0])==null?void 0:sa.damage_modifier)||0,alternate_damage_type:((ra=O[0])==null?void 0:ra.damage_type)||null,is_thrown:r.get("is_thrown")==="on",melee_range:(()=>{const n=String(r.get("melee_range")??"").trim().replace(",",".");if(!n)return null;const o=Number(n);return Number.isNaN(o)?null:o})(),range_normal:Number(r.get("range_normal"))||null,range_disadvantage:Number(r.get("range_disadvantage"))||null,armor_type:r.get("armor_type")||null,is_shield:r.get("is_shield")==="on",armor_class:Number(r.get("armor_class"))||null,armor_bonus:Number(r.get("armor_bonus"))||0,shield_bonus:Number(r.get("shield_bonus"))||0};da(!0);try{e?(await Xa(e.id,na),G("Oggetto aggiornato")):(await Ja(na),G("Oggetto creato")),await(i==null?void 0:i())}catch{G("Errore salvataggio oggetto","error")}finally{da(!1)}}function Tn(a){var i,l;if(!(a!=null&&a.image_url))return;const e=document.createElement("div");e.className="equipment-preview-modal";const t=((i=a.description)==null?void 0:i.trim())||((l=a.notes)==null?void 0:l.trim())||"Nessuna descrizione disponibile per questo equipaggiamento.";e.innerHTML=`
    <div class="detail-card detail-card--text equipment-preview-card">
      <img class="equipment-preview-image" src="${a.image_url}" alt="Foto di ${a.name}" />
      <div class="equipment-preview-content">
        <p>${t}</p>
      </div>
    </div>
  `,ba({title:a.name||"Equipaggiamento",cancelLabel:null,content:e,cardClass:"modal-card--equipment-preview",showFooter:!1})}async function Mn(a){const{data:e,error:t}=await M.from("wallets").select("*").eq("character_id",a).single();if(t&&t.code!=="PGRST116")throw t;return e??null}async function Fn(a){const{data:e,error:t}=await M.from("wallets").upsert(a).select("*").single();if(t)throw t;return e}async function kn(a){const{data:e,error:t}=await M.from("money_transactions").insert(a).select("*").single();if(t)throw t;return e}async function An(a){const{data:e,error:t}=await M.from("money_transactions").select("*").eq("character_id",a).order("created_at",{ascending:!1});if(t)throw t;return e??[]}async function zn(a,e){const{data:t,error:i}=await M.from("money_transactions").update(e).eq("id",a).select("*").single();if(i)throw i;return t}async function Pn(a){const{error:e}=await M.from("money_transactions").delete().eq("id",a);if(e)throw e}export{_n as A,zn as B,Pn as C,sn as a,ya as b,fn as c,wn as d,pa as e,va as f,on as g,Mn as h,yn as i,kn as j,Ja as k,vn as l,qn as m,_a as n,Xa as o,Tn as p,Sn as q,An as r,$n as s,hn as t,Fn as u,Cn as v,En as w,Ln as x,Nn as y,fa as z};
