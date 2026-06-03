import{k as M,o as ca,d as b,e as T,p as Da,c as j,s as oa,j as Ba}from"./index-DXBitu8v.js";async function on(a){const{data:e,error:l}=await M.from("items").select("*").eq("character_id",a).order("created_at",{ascending:!0});if(l)throw l;return e??[]}async function Ha(a){const{data:e,error:l}=await M.from("items").insert(a).select("*").single();if(l)throw l;return e}async function Va(a,e){const{data:l,error:i}=await M.from("items").update(e).eq("id",a).select("*").single();if(i)throw i;return l}async function sn(a){const{error:e}=await M.from("items").delete().eq("id",a);if(e)throw e}function rn(a=[]){return a.reduce((e,l)=>{const i=Number(l.qty??0),t=Number(l.weight??0);return e+i*t},0)}function cn(a,e){const l={...a};return Object.keys(e).forEach(i=>{l[i]=Number(l[i]??0)+Number(e[i]??0)}),l}function da(a,e="lb"){return a==null||Number.isNaN(a)?"-":`${Number(a).toFixed(2).replace(/\.00$/,"")} ${e}`}const pa=[{value:"head",label:"Testa"},{value:"eyes-left",label:"Occhio sinistro"},{value:"eyes-right",label:"Occhio destro"},{value:"ears-left",label:"Orecchio sinistro"},{value:"ears-right",label:"Orecchio destro"},{value:"neck",label:"Collo"},{value:"shoulder-left",label:"Spalla sinistra"},{value:"shoulder-right",label:"Spalla destra"},{value:"back",label:"Schiena"},{value:"chest",label:"Torso"},{value:"arm-left",label:"Braccio sinistro"},{value:"arm-right",label:"Braccio destro"},{value:"hand-left",label:"Mano sinistra"},{value:"hand-right",label:"Mano destra"},{value:"wrist-left",label:"Polso sinistro"},{value:"wrist-right",label:"Polso destro"},{value:"waist",label:"Vita"},{value:"leg-left",label:"Gamba sinistra"},{value:"leg-right",label:"Gamba destra"},{value:"foot-left",label:"Piede sinistro"},{value:"foot-right",label:"Piede destro"},{value:"ring-left",label:"Dita/Anello sinistro"},{value:"ring-right",label:"Dita/Anello destro"},{value:"main-hand",label:"Mano principale"},{value:"off-hand",label:"Mano secondaria"},{value:"eyes",label:"Occhi (generico)"},{value:"ears",label:"Orecchie (generico)"},{value:"shoulders",label:"Spalle (generico)"},{value:"arms",label:"Braccia (generico)"},{value:"hands",label:"Mani (generico)"},{value:"wrists",label:"Polsi (generico)"},{value:"legs",label:"Gambe (generico)"},{value:"feet",label:"Piedi (generico)"},{value:"ring",label:"Dita/Anelli (generico)"}],qe=[{value:"gear",label:"Vestiario",equipable:!0},{value:"loot",label:"Loot"},{value:"consumable",label:"Consumabili"},{value:"weapon",label:"Armi",equipable:!0},{value:"armor",label:"Armature",equipable:!0},{value:"jewelry",label:"Gioielli e ornamenti",equipable:!0},{value:"tool",label:"Strumenti"},{value:"container",label:"Contenitore",equipable:!0}],dn=[{value:"",label:"Tutte"},...qe],ja=new Map([...qe.map(a=>[a.value,a.label]),["magic","Magici"]]),Ga=new Map(pa.map(a=>[a.value,a.label])),Wa=[{value:"",label:"Seleziona"},{value:"simple",label:"Semplice"},{value:"martial",label:"Da guerra"}],Qa=[{value:"",label:"Seleziona"},{value:"melee",label:"Mischia"},{value:"ranged",label:"Distanza"}],Ka=[{value:"",label:"Seleziona"},{value:"str",label:"FOR"},{value:"dex",label:"DES"}],Ja=[{value:"",label:"Seleziona"},{value:"light",label:"Leggera"},{value:"medium",label:"Media"},{value:"heavy",label:"Pesante"}],$e=[{value:"",label:"Nessuna"},{value:"arrow",label:"Frecce"},{value:"bolt",label:"Dardi"},{value:"bullet",label:"Proiettili"}],Ne=[{value:"",label:"Seleziona"},{value:"acid",label:"Acido"},{value:"bludgeoning",label:"Contundente"},{value:"piercing",label:"Perforante"},{value:"slashing",label:"Tagliente"},{value:"cold",label:"Freddo"},{value:"fire",label:"Fuoco"},{value:"force",label:"Forza"},{value:"lightning",label:"Fulmine"},{value:"thunder",label:"Tuono"},{value:"necrotic",label:"Necrotico"},{value:"poison",label:"Veleno"},{value:"psychic",label:"Psichico"},{value:"radiant",label:"Radioso"}],ia=new Map($e.map(a=>[a.value,a.label])),Ua=new Map(Ne.map(a=>[a.value,a.label]));function ua(a){if(!a)return{};if(typeof a=="string")try{return JSON.parse(a)}catch{return{}}return a}function ma(a){return ja.get(a)??(a||"Altro")}function Xa(a){return Ga.get(a)??a}function pn(a){return a.map(e=>Xa(e)).join(", ")}function sa(a){if(!a)return[];if(Array.isArray(a.equip_slots))return a.equip_slots.filter(Boolean);if(typeof a.equip_slots=="string"&&a.equip_slots.trim())try{const e=JSON.parse(a.equip_slots);if(Array.isArray(e))return e.filter(Boolean)}catch{return[a.equip_slots]}return a.equip_slot?[a.equip_slot]:[]}function Ya(a){var e,l;return((l=(e=a.data)==null?void 0:e.settings)==null?void 0:l.weight_unit)??"lb"}function Za(a={}){return{magic:a.is_magic?"Magico":"Non magico",equipable:a.equipable?"Equipaggiabile":"Non equipaggiabile",attunement:a.attunement_active?"In sintonia":"Non in sintonia"}}function Ia(a,e){var t;const l=((t=a.data)==null?void 0:t.proficiencies)||{},i=e.get("category");if(i==="weapon"){const s=e.get("weapon_type");return s?s==="simple"?!!l.weapon_simple:!!l.weapon_martial:!1}if(i==="armor"){if(e.get("is_shield")==="on")return!!l.shield;const c=e.get("armor_type");return c?c==="light"?!!l.armor_light:c==="medium"?!!l.armor_medium:!!l.armor_heavy:!1}return!0}function en(a){const e="/dungeons-dragons-app/",l={pp:`${e}icons/moneta_platino.png`,gp:`${e}icons/moneta_oro.png`,sp:`${e}icons/moneta_argento.png`,cp:`${e}icons/moneta_rame.png`},i=ua(a),t=["pp","gp","sp","cp"].map(c=>({coin:c,value:Number((i==null?void 0:i[c])??0)})).filter(c=>c.value!==0);return(t.length?t:[{coin:"gp",value:0}]).map((c,m)=>`
      ${m?'<span class="transaction-coin__divider" aria-hidden="true">·</span>':""}
      <span class="transaction-coin" data-coin="${c.coin}">
        <span class="coin-avatar coin-avatar--${c.coin}" aria-hidden="true">
          <img src="${l[c.coin]}" alt="" loading="lazy" />
        </span>
        <span class="transaction-coin__value">${c.value}</span>
      </span>
    `).join("")}function an(a){const e=ua(a),l=["pp","gp","sp","cp"].map(i=>({coin:i,value:Number((e==null?void 0:e[i])??0)})).filter(i=>i.value!==0);return l.length?l.map(i=>`${i.value} ${i.coin}`).join(" · "):"0 gp"}const nn=8;function te(a,e,l,i,t){return`
      <label class="field wallet-edit-field">
        <span class="wallet-edit-field__label">
          <span class="coin-avatar ${t}" aria-hidden="true">
            <img src="${i}" alt="" loading="lazy" />
          </span>
          <span>${a}</span>
        </span>
        <input name="${e}" type="number" value="${l}" min="0" step="1" />
      </label>
  `}function un(a){const e=document.createElement("div");if(e.className="transaction-list",!a.length)return e.innerHTML='<p class="muted">Nessuna transazione registrata.</p>',e;const l=document.createElement("ul");l.className="transaction-items";const i=a.length>nn;return a.forEach(t=>{const s=document.createElement("li"),c=t.direction==="pay"?"Pagamento":"Entrata",m=en(t.amount),h=an(t.amount),v=t.direction==="pay"?"transaction-item--outgoing":"transaction-item--incoming";s.className=`transaction-item ${v}`,s.innerHTML=`
      <div class="transaction-info">
        <p class="muted">${t.reason||"Nessuna nota"}</p>
      </div>
      <span class="transaction-amount" aria-label="${h}">${m}</span>
      <div class="transaction-meta">
        <span class="resource-chip transaction-direction-chip ${t.direction==="pay"?"transaction-direction-chip--outgoing":"transaction-direction-chip--incoming"}">${c}</span>
        <div class="transaction-actions">
          <button class="icon-button transaction-action-button" type="button" data-edit-transaction="${t.id}" aria-label="Modifica transazione" title="Modifica">
            <span aria-hidden="true">✏️</span>
          </button>
          <button class="icon-button icon-button--danger transaction-action-button transaction-action-button--danger" type="button" data-delete-transaction="${t.id}" aria-label="Elimina transazione" title="Elimina">
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>
      </div>
    `,l.appendChild(s)}),e.classList.toggle("transaction-list--scrollable",i),e.appendChild(l),e}function mn(a,e="lb"){const l=a.filter(s=>s.category==="container"),i=a.filter(s=>!s.container_item_id&&s.category!=="container");return`
    ${l.map(s=>{const c=a.filter(R=>R.container_item_id===s.id),m=c.reduce((R,G)=>{const W=Number(G.volume)||0,x=Number(G.qty)||1;return R+W*x},0),h=Number(s.max_volume)||null,v=h?`Volume ${m}/${h}`:m?`Volume ${m}`:"";return`
      <details class="inventory-group inventory-group--container inventory-container-accordion" open>
        <summary class="inventory-table__row inventory-table__row--container inventory-container-accordion__summary">
          <div class="inventory-table__cell inventory-table__cell--item">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <div class="item-info-body">
              <strong>${s.name}</strong>
              ${v?`<span class="muted">${v}</span>`:""}
            </div>
          </div>
          <div class="inventory-table__cell" data-label="Categoria"><span class="inventory-data-pill">${ma(s.category)}</span></div>
          <div class="inventory-table__cell" data-label="Quantità">${s.qty}</div>
          <div class="inventory-table__cell" data-label="Peso">${da(s.weight??0,e)}</div>
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
          ${ra(c,e,{nested:!0,emptyLabel:"Nessun oggetto nel contenitore."})}
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
        ${ra(i,e)}
      </div>
    </details>
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
        ${a.map(t=>{const s=t.volume!==null&&t.volume!==void 0?t.volume:"-",c=Za(t);return`
          <div class="inventory-table__row">
            <div class="inventory-table__badges">
              ${t.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${c.magic}</span>`:""}
              ${t.equipable?`<span class="resource-chip resource-chip--floating resource-chip--equipable">${c.equipable}</span>`:""}
              ${t.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${c.attunement}</span>`:""}
            </div>
            <div class="inventory-table__cell inventory-table__cell--item">
              ${t.image_url?`<img class="item-avatar" src="${t.image_url}" alt="Foto di ${t.name}" data-item-image="${t.id}" />`:""}
              <div class="item-info-body">
                <button class="item-name-button" type="button" data-item-preview="${t.id}" aria-label="Apri anteprima ${t.name}">${t.name}</button>
                ${t.ammunition_type?`<span class="muted">Munizioni: ${ia.get(t.ammunition_type)||t.ammunition_type}</span>`:""}
                ${t.consumes_ammunition?`<span class="muted">Consuma: ${ia.get(t.required_ammunition_type)||t.required_ammunition_type||"munizioni"}</span>`:""}
                ${t.damage_type?`<span class="muted">Danno: ${Ua.get(t.damage_type)||t.damage_type}</span>`:""}
              </div>
            </div>
            <div class="inventory-table__cell" data-label="Categoria"><span class="inventory-data-pill">${ma(t.category)}</span></div>
            <div class="inventory-table__cell" data-label="Quantità">${t.qty}</div>
            <div class="inventory-table__cell" data-label="Peso">${da(t.weight??0,e)}</div>
            <div class="inventory-table__cell" data-label="Volume">${s}</div>
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
  `:`<p class="muted eyebrow">${i}</p>`}function gn({amount:a=0,coin:e="gp",reason:l="",occurredOn:i,direction:t="receive",includeDirection:s=!1}={}){const c=i||new Date().toISOString().split("T")[0];return`
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
   
  `}function bn({amount:a=0,source:e="gp",target:l="pp",targetAmount:i=0,available:t={}}={}){const s=[{key:"pp",label:"Platino",value:Number(t.pp??0)},{key:"gp",label:"Oro",value:Number(t.gp??0)},{key:"sp",label:"Argento",value:Number(t.sp??0)},{key:"cp",label:"Rame",value:Number(t.cp??0)}],c=s.some(v=>v.value>0),m=s.filter(v=>v.value>0).map(v=>`
          <option value="${v.key}" ${e===v.key?"selected":""}>${v.label}</option>
        `).join(""),h=s.map(v=>`
          <option value="${v.key}" ${l===v.key?"selected":""}>${v.label}</option>
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
  `}function vn(a={}){const e="/dungeons-dragons-app/",l={pp:`${e}icons/moneta_platino.png`,gp:`${e}icons/moneta_oro.png`,sp:`${e}icons/moneta_argento.png`,cp:`${e}icons/moneta_rame.png`},i={pp:Number(a.pp??0),gp:Number(a.gp??0),sp:Number(a.sp??0),cp:Number(a.cp??0)};return`
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
  `}function _n(a){return`
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
  `}async function fn(a,e,l,i){var Ze,Ie,ea,aa,na,la;const t=n=>{n==null||n.querySelectorAll('input[type="number"]').forEach(o=>{var u,p,_;const d=(_=(p=(u=o.closest(".field"))==null?void 0:u.querySelector("span"))==null?void 0:p.textContent)==null?void 0:_.trim();Ba(o,{decrementLabel:d?`Riduci ${d}`:"Diminuisci valore",incrementLabel:d?`Aumenta ${d}`:"Aumenta valore"})})},s=document.createElement("div");s.className="drawer-form modal-form-grid item-editor-form";const c=(n,o=[],{icon:d="",description:u="",className:p=""}={})=>{const _=document.createElement("section");_.className=["item-modal-section",p].filter(Boolean).join(" ");const f=document.createElement("div");if(f.className="item-modal-section__header",d){const y=document.createElement("span");y.className="item-modal-section__icon",y.setAttribute("aria-hidden","true"),y.textContent=d,f.appendChild(y)}const g=document.createElement("div");g.className="item-modal-section__heading";const N=document.createElement("h4");if(N.className="item-modal-section__title",N.textContent=n,g.appendChild(N),u){const y=document.createElement("p");y.className="item-modal-section__description",y.textContent=u,g.appendChild(y)}return f.appendChild(g),_.appendChild(f),o.filter(Boolean).forEach(y=>_.appendChild(y)),_},m=(n,o="balanced")=>{const d=document.createElement("div");return d.className=`modal-form-row modal-form-row--${o}`,n.filter(Boolean).forEach(u=>d.appendChild(u)),d},h=({name:n,label:o,checked:d=!1,type:u="checkbox",value:p=""})=>{const _=document.createElement("label");_.className="condition-modal__item item-modal-toggle-field";const f=p?` value="${p}"`:"";_.innerHTML=`
      <span class="condition-modal__item-label"><strong>${o}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="${u}" name="${n}"${f} ${d?"checked":""} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;const g=_.querySelector("input");return _.classList.toggle("is-selected",!!(g!=null&&g.checked)),g==null||g.addEventListener("change",()=>{_.classList.toggle("is-selected",g.checked)}),{field:_,input:g}},v=b({label:"Nome",name:"name",value:(e==null?void 0:e.name)??""}),R=b({label:"Foto (URL)",name:"image_url",placeholder:"https://.../oggetto.png",value:(e==null?void 0:e.image_url)??""}),G=c("Identità oggetto",[m([v,R],"balanced")],{icon:"✦",description:"Parti dalle informazioni che riconosci subito nella lista inventario.",className:"item-modal-section--identity"}),W=b({label:"Quantità",name:"qty",type:"number",value:(e==null?void 0:e.qty)??1}),x=W.querySelector("input");x&&(x.min="0",x.step="1");const Se=b({label:"Peso",name:"weight",type:"number",value:(e==null?void 0:e.weight)??0}),oe=Se.querySelector("input");if(oe){const n=Ya(a);oe.min="0",oe.step=n==="kg"?"0.1":"1"}const Ee=b({label:"Volume",name:"volume",type:"number",value:(e==null?void 0:e.volume)??0}),ie=Ee.querySelector("input");ie&&(ie.min="0",ie.step="0.1");const Ce=b({label:"Valore (cp)",name:"value_cp",type:"number",value:(e==null?void 0:e.value_cp)??0}),se=Ce.querySelector("input");se&&(se.min="0",se.step="1");const ga=c("Quantità, peso e valore",[m([W,Se,Ee,Ce],"compact")],{icon:"⚖️",description:"Numeri essenziali per carico, scorte e tesoro."}),w=T([{value:"",label:"Seleziona"},...qe],(e==null?void 0:e.category)??"");w.name="category";const Q=document.createElement("label");Q.className="field",Q.innerHTML="<span>Categoria</span>",Q.appendChild(w);const ba=[{value:"",label:"Nessuno"}].concat(l.filter(n=>n.category==="container").map(n=>({value:n.id,label:n.name}))),Le=T(ba,(e==null?void 0:e.container_item_id)??"");Le.name="container_item_id";const K=document.createElement("label");K.className="field",K.innerHTML="<span>Contenitore</span>",K.appendChild(Le);const re=b({label:"Volume massimo contenitore",name:"max_volume",type:"number",value:(e==null?void 0:e.max_volume)??""}),ce=re.querySelector("input"),D=document.createElement("label");D.className="field",D.innerHTML="<span>Tipo munizione dell'oggetto</span>";const de=T($e,(e==null?void 0:e.ammunition_type)??"");de.name="ammunition_type",D.appendChild(de);const J=document.createElement("div");J.className="item-modal-kind",J.innerHTML='<span class="item-modal-kind__label">Tipologia rapida</span><p class="item-modal-kind__hint">Scegli una tipologia per mostrare solo i campi davvero utili.</p>';const pe=document.createElement("div");pe.className="condition-modal__list item-modal-kind__list";const Te=[{value:"generic",label:"Oggetto"},{value:"weapon",label:"Arma"},{value:"armor",label:"Armatura"}].map(n=>{const o=document.createElement("label");return o.className="condition-modal__item item-modal-kind__item",o.innerHTML=`
      <span class="condition-modal__item-label"><strong>${n.label}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="radio" name="item_kind" value="${n.value}" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `,pe.appendChild(o),o.querySelector("input")});J.appendChild(pe);const va=m([Q,K,re,D],"balanced"),_a=c("Categoria e collocazione",[J,va],{icon:"🧭",description:"Definisci tipo, contenitore e dettagli contestuali."}),U=document.createElement("div");U.className="condition-modal__list item-modal-toggle-list";const{field:fa}=h({name:"attunement_active",label:"Sintonia attiva",checked:(e==null?void 0:e.attunement_active)??!1}),{field:ya}=h({name:"is_magic",label:"Magico",checked:(e==null?void 0:e.is_magic)??!1});U.appendChild(fa),U.appendChild(ya);const ha=c("Stato speciale",[U],{icon:"✨",description:"Flag rapidi per magia e sintonia."}),X=document.createElement("div");X.className="condition-modal__list item-modal-toggle-list";const{field:wa,input:P}=h({name:"equipable",label:"Equipaggiabile",checked:(e==null?void 0:e.equipable)??!1}),{field:$a,input:B}=h({name:"sovrapponibile",label:"Sovrapponibile",checked:(e==null?void 0:e.sovrapponibile)??!1});X.appendChild(wa),X.appendChild($a);const H=document.createElement("fieldset");H.className="equip-slot-field",H.innerHTML="<legend>Punti del corpo</legend>";const ue=document.createElement("div");ue.className="equip-slot-list";const Na=sa(e),qa=pa.map(n=>{const o=document.createElement("label");o.className="checkbox",o.innerHTML=`<input type="checkbox" name="equip_slots" value="${n.value}" /> <span>${n.label}</span>`;const d=o.querySelector("input");return d&&Na.includes(n.value)&&(d.checked=!0),ue.appendChild(o),d});H.appendChild(ue);const Sa=c("Equipaggiamento",[X,H],{icon:"🛡️",description:"Attiva l’equipaggiamento solo se l’oggetto occupa slot del corpo."}),Ea=c("Note e descrizione",[Da({label:"Note",name:"notes",value:(e==null?void 0:e.notes)??""})],{icon:"📝",description:"Descrizione, effetti particolari o promemoria di gioco."}),S=document.createElement("div");S.className="drawer-form modal-form-grid";const Y=document.createElement("label");Y.className="field",Y.innerHTML="<span>Tipo arma</span>";const me=T(Wa,(e==null?void 0:e.weapon_type)??"");me.name="weapon_type",Y.appendChild(me);const Z=document.createElement("label");Z.className="field",Z.innerHTML="<span>Proprietà arma</span>";const ge=T(Qa,(e==null?void 0:e.weapon_range)??"");ge.name="weapon_range",Z.appendChild(ge);const I=document.createElement("label");I.className="field",I.innerHTML="<span>Caratteristica tiro per colpire</span>";const be=T(Ka,(e==null?void 0:e.attack_ability)??"");be.name="attack_ability",I.appendChild(be);const Me=b({label:"Dado danno",name:"damage_die",placeholder:"Es. 1d8",value:(e==null?void 0:e.damage_die)??""}),Fe=b({label:"Modificatore per colpire",name:"attack_modifier",type:"number",value:(e==null?void 0:e.attack_modifier)??0}),ke=b({label:"Modificatore danno",name:"damage_modifier",type:"number",value:(e==null?void 0:e.damage_modifier)??0}),ee=document.createElement("label");ee.className="field",ee.innerHTML="<span>Tipo danno</span>";const ae=T(Ne,(e==null?void 0:e.damage_type)??"");ae.name="damage_type",ee.appendChild(ae);const{field:Ae,input:E}=h({name:"consumes_ammunition",label:"Consuma munizioni",checked:(e==null?void 0:e.consumes_ammunition)??!1});Ae.classList.add("item-modal-toggle-field--compact");const ne=document.createElement("label");ne.className="field",ne.innerHTML="<span>Munizione richiesta</span>";const ve=T($e,(e==null?void 0:e.required_ammunition_type)??(e==null?void 0:e.ammunition_type)??"");ve.name="required_ammunition_type",ne.appendChild(ve);const Ca=n=>{const o=n==null?void 0:n.weapon_damage_modes;let d=[];if(Array.isArray(o))d=o;else if(typeof o=="string"&&o.trim())try{const p=JSON.parse(o);d=Array.isArray(p)?p:[]}catch{d=[]}const u=d.map(p=>({label:p.label||p.name||"",damage_die:p.damage_die||p.damageDie||"",damage_modifier:p.damage_modifier??p.damageModifier??0,damage_type:p.damage_type||p.damageType||(n==null?void 0:n.damage_type)||""})).filter(p=>p.label||p.damage_die);return!u.length&&(n!=null&&n.has_alternate_damage_mode)&&(n!=null&&n.alternate_damage_die)&&u.push({label:n.alternate_damage_label||"Due mani",damage_die:n.alternate_damage_die,damage_modifier:n.alternate_damage_modifier??n.damage_modifier??0,damage_type:n.alternate_damage_type||n.damage_type||""}),u},F=document.createElement("div");F.className="weapon-damage-modes-field",F.innerHTML=`
    <div class="weapon-damage-modes-field__header">
      <div>
        <strong>Impugnature aggiuntive</strong>
        <p class="muted">Aggiungi più modalità oltre al danno base dell'arma.</p>
      </div>
      <button type="button" class="resource-action-button" data-add-weapon-damage-mode>Aggiungi</button>
    </div>
    <div class="weapon-damage-modes-field__list" data-weapon-damage-modes></div>
  `;const _e=F.querySelector("[data-weapon-damage-modes]"),fe=F.querySelector("[data-add-weapon-damage-mode]"),La=({label:n="",damage_die:o="",damage_modifier:d=0,damage_type:u=""}={})=>{const p=document.createElement("div");p.className="weapon-damage-mode-row";const _=b({label:"Nome",name:"weapon_damage_mode_label",placeholder:"Es. Due mani",value:n}),f=b({label:"Dado",name:"weapon_damage_mode_die",placeholder:"Es. 1d10",value:o}),g=b({label:"Mod.",name:"weapon_damage_mode_modifier",type:"number",value:d??0}),N=document.createElement("label");N.className="field",N.innerHTML="<span>Tipo</span>";const y=T(Ne,u||(e==null?void 0:e.damage_type)||"");y.name="weapon_damage_mode_type",N.appendChild(y);const L=document.createElement("button");return L.type="button",L.className="icon-button weapon-damage-mode-row__remove",L.setAttribute("aria-label","Rimuovi impugnatura"),L.title="Rimuovi",L.innerHTML='<span aria-hidden="true">🗑️</span>',L.addEventListener("click",()=>p.remove()),p.append(_,f,g,N,L),t(p),p},ze=(n={})=>{_e==null||_e.appendChild(La(n))};Ca(e).forEach(n=>ze(n)),fe==null||fe.addEventListener("click",()=>ze({damage_type:ae.value}));const{field:Ta,input:k}=h({name:"is_thrown",label:"Proprietà lancio",checked:(e==null?void 0:e.is_thrown)??!1}),A=document.createElement("div");A.className="compact-field-grid";const Ma=b({label:"Portata arma (m)",name:"melee_range",type:"text",placeholder:"Es. 1,5",value:(e==null?void 0:e.melee_range)??1.5}),Fa=b({label:"Gittata normale",name:"range_normal",type:"number",value:(e==null?void 0:e.range_normal)??""}),ka=b({label:"Gittata svantaggio",name:"range_disadvantage",type:"number",value:(e==null?void 0:e.range_disadvantage)??""});A.appendChild(Ma),A.appendChild(Fa),A.appendChild(ka);const le=document.createElement("label");le.className="field",le.innerHTML="<span>Tipo armatura</span>";const ye=T(Ja,(e==null?void 0:e.armor_type)??"");ye.name="armor_type",le.appendChild(ye);const{field:Pe,input:C}=h({name:"is_shield",label:"Scudo",checked:(e==null?void 0:e.is_shield)??!1});Pe.classList.add("item-modal-toggle-field--compact");const Oe=b({label:"Classe armatura base",name:"armor_class",type:"number",value:(e==null?void 0:e.armor_class)??""}),Re=Oe.querySelector("input"),xe=b({label:"Bonus armatura",name:"armor_bonus",type:"number",value:(e==null?void 0:e.armor_bonus)??0}),De=xe.querySelector("input"),Be=b({label:"Bonus scudo",name:"shield_bonus",type:"number",value:(e==null?void 0:e.shield_bonus)??2}),He=Be.querySelector("input"),Ve=m([Y,Z,I],"balanced"),je=m([Me,ee,Fe,ke],"compact"),Ge=m([Ae,ne],"compact"),We=m([Ta],"compact"),Qe=m([le,Oe],"balanced"),he=m([xe,Be,Pe],"compact");he.classList.add("item-modal-row--armor-bonus"),S.appendChild(Ve),S.appendChild(je),S.appendChild(Ge),S.appendChild(F),S.appendChild(We),S.appendChild(A),S.appendChild(Qe),S.appendChild(he);const Ke=c("Statistiche da combattimento",[S],{icon:"⚔️",description:"Questa sezione appare solo per armi e armature."});s.appendChild(G),s.appendChild(ga),s.appendChild(_a),s.appendChild(ha),s.appendChild(Sa),s.appendChild(Ke),s.appendChild(Ea);const Je=n=>n==="weapon"?"weapon":n==="armor"?"armor":"generic",we=()=>{const n=Je(w.value);Te.forEach(o=>{var u;if(!o)return;const d=o.value===n;o.checked=d,(u=o.closest(".condition-modal__item"))==null||u.classList.toggle("is-selected",d)})};Te.forEach(n=>{n==null||n.addEventListener("change",()=>{n.checked&&(n.value==="weapon"?w.value="weapon":n.value==="armor"?w.value="armor":(w.value==="weapon"||w.value==="armor")&&(w.value="gear"),we(),z())})});const $=(n,o)=>{n&&(n.hidden=!o)},z=()=>{var N,y,L,ta;const n=(P==null?void 0:P.checked)??!1;qa.forEach(q=>{q&&(q.disabled=!n,n||(q.checked=!1))}),B&&(B.disabled=!n,n||(B.checked=!1),(N=B.closest(".condition-modal__item"))==null||N.classList.toggle("is-selected",B.checked)),$(H,n);const o=w.value==="weapon",d=w.value==="armor",u=w.value==="container",p=Je(w.value);me.disabled=!o,ge.disabled=!o,be.disabled=!o,Me.querySelector("input").disabled=!o,ae.disabled=!o,Fe.querySelector("input").disabled=!o,ke.querySelector("input").disabled=!o,E&&(E.disabled=!o,(y=E.closest(".condition-modal__item"))==null||y.classList.toggle("is-selected",E.checked)),ve.disabled=!o||!((E==null?void 0:E.checked)??!1),F.querySelectorAll("input, select, button").forEach(q=>{q.disabled=!o}),k&&(k.disabled=!o,(L=k.closest(".condition-modal__item"))==null||L.classList.toggle("is-selected",k.checked)),A.querySelectorAll("input").forEach(q=>{q.disabled=!o,o?q.name==="melee_range"&&!q.value&&(q.value="1.5"):q.value=""}),ye.disabled=!d,C&&(C.disabled=!d,(ta=C.closest(".condition-modal__item"))==null||ta.classList.toggle("is-selected",C.checked)),Re&&(Re.disabled=!d),De&&(De.disabled=!d),He&&(He.disabled=!d||!((C==null?void 0:C.checked)??!1));const f=p==="weapon",g=p==="armor";$(Ve,f),$(je,f),$(Ge,f),$(F,f),$(We,f),$(A,f),$(Qe,g),$(he,g),$(Ke,f||g),$(re,u),$(D,!o&&!u),de.disabled=o||u,ce&&(ce.disabled=!u,u||(ce.value=""))};P==null||P.addEventListener("change",z),w.addEventListener("change",()=>{we(),z()}),C==null||C.addEventListener("change",z),k==null||k.addEventListener("change",z),E==null||E.addEventListener("change",z),we(),z(),t(s);const r=await ca({title:e?"Modifica oggetto":"Nuovo oggetto",submitLabel:e?"Salva":"Crea",content:s,cardClass:["modal-card--wide","modal-card--scrollable","modal-card--item-editor"]});if(!r)return;const Ue=r.get("equipable")==="on",V=Ue?r.getAll("equip_slots"):[],Aa=V[0]||null,za=r.get("category");if(V.length&&!Ia(a,r)){j("Non hai la competenza per equipaggiare questo oggetto","error");return}const Xe=r.get("sovrapponibile")==="on";if(V.length&&!Xe&&l.filter(o=>o.id!==(e==null?void 0:e.id)).filter(o=>sa(o).some(d=>V.includes(d))).length){j("Uno o più slot selezionati sono già occupati","error");return}const Pa=r.getAll("weapon_damage_mode_label"),Oa=r.getAll("weapon_damage_mode_die"),Ra=r.getAll("weapon_damage_mode_modifier"),xa=r.getAll("weapon_damage_mode_type"),O=Oa.map((n,o)=>({id:`mode-${o+1}`,label:String(Pa[o]||"").trim()||`Impugnatura ${o+1}`,damage_die:String(n||"").trim(),damage_modifier:Number(Ra[o])||0,damage_type:xa[o]||null})).filter(n=>n.damage_die),Ye={user_id:a.user_id,character_id:a.id,name:r.get("name"),image_url:((Ze=r.get("image_url"))==null?void 0:Ze.trim())||null,qty:Number(r.get("qty")),weight:Number(r.get("weight")),volume:Number(r.get("volume"))||0,value_cp:Number(r.get("value_cp")),category:za,container_item_id:r.get("container_item_id")||null,max_volume:r.get("max_volume")===""?null:Number(r.get("max_volume")),equipable:Ue,equip_slot:Aa,equip_slots:V,sovrapponibile:Xe,attunement_active:r.get("attunement_active")==="on",is_magic:r.get("is_magic")==="on",notes:r.get("notes"),weapon_type:r.get("weapon_type")||null,weapon_range:r.get("weapon_range")||null,attack_ability:r.get("attack_ability")||null,ammunition_type:r.get("ammunition_type")||null,required_ammunition_type:r.get("required_ammunition_type")||null,consumes_ammunition:r.get("consumes_ammunition")==="on",damage_die:((Ie=r.get("damage_die"))==null?void 0:Ie.trim())||null,damage_type:r.get("damage_type")||null,attack_modifier:Number(r.get("attack_modifier"))||0,damage_modifier:Number(r.get("damage_modifier"))||0,weapon_damage_modes:O,has_alternate_damage_mode:O.length>0,alternate_damage_label:((ea=O[0])==null?void 0:ea.label)||null,alternate_damage_die:((aa=O[0])==null?void 0:aa.damage_die)||null,alternate_damage_modifier:Number((na=O[0])==null?void 0:na.damage_modifier)||0,alternate_damage_type:((la=O[0])==null?void 0:la.damage_type)||null,is_thrown:r.get("is_thrown")==="on",melee_range:(()=>{const n=String(r.get("melee_range")??"").trim().replace(",",".");if(!n)return null;const o=Number(n);return Number.isNaN(o)?null:o})(),range_normal:Number(r.get("range_normal"))||null,range_disadvantage:Number(r.get("range_disadvantage"))||null,armor_type:r.get("armor_type")||null,is_shield:r.get("is_shield")==="on",armor_class:Number(r.get("armor_class"))||null,armor_bonus:Number(r.get("armor_bonus"))||0,shield_bonus:Number(r.get("shield_bonus"))||0};oa(!0);try{e?(await Va(e.id,Ye),j("Oggetto aggiornato")):(await Ha(Ye),j("Oggetto creato")),await(i==null?void 0:i())}catch{j("Errore salvataggio oggetto","error")}finally{oa(!1)}}function yn(a){var i,t;if(!(a!=null&&a.image_url))return;const e=document.createElement("div");e.className="equipment-preview-modal";const l=((i=a.description)==null?void 0:i.trim())||((t=a.notes)==null?void 0:t.trim())||"Nessuna descrizione disponibile per questo equipaggiamento.";e.innerHTML=`
    <div class="detail-card detail-card--text equipment-preview-card">
      <img class="equipment-preview-image" src="${a.image_url}" alt="Foto di ${a.name}" />
      <div class="equipment-preview-content">
        <p>${l}</p>
      </div>
    </div>
  `,ca({title:a.name||"Equipaggiamento",cancelLabel:null,content:e,cardClass:"modal-card--equipment-preview",showFooter:!1})}async function hn(a){const{data:e,error:l}=await M.from("wallets").select("*").eq("character_id",a).single();if(l&&l.code!=="PGRST116")throw l;return e??null}async function wn(a){const{data:e,error:l}=await M.from("wallets").upsert(a).select("*").single();if(l)throw l;return e}async function $n(a){const{data:e,error:l}=await M.from("money_transactions").insert(a).select("*").single();if(l)throw l;return e}async function Nn(a){const{data:e,error:l}=await M.from("money_transactions").select("*").eq("character_id",a).order("created_at",{ascending:!1});if(l)throw l;return e??[]}async function qn(a,e){const{data:l,error:i}=await M.from("money_transactions").update(e).eq("id",a).select("*").single();if(i)throw i;return l}async function Sn(a){const{error:e}=await M.from("money_transactions").delete().eq("id",a);if(e)throw e}export{sn as A,qn as B,Sn as C,Za as a,ma as b,rn as c,pn as d,ia as e,da as f,Ya as g,hn as h,cn as i,$n as j,Ha as k,on as l,gn as m,pa as n,Va as o,yn as p,_n as q,Nn as r,un as s,dn as t,wn as u,bn as v,vn as w,fn as x,mn as y,ua as z};
