import{k as Me,e as ze,q as qe,c as pe,g as ke,f as me,r as xe,s as Ne,m as ge,h as B,w as Te,t as Ie,v as he,x as Oe,o as fe,y as $e,n as ve,z as De,u as H,i as je,A as We,B as Pe}from"./walletApi-Dj-5Stq5.js";import{n as G,u as x,c as N,b as u,o as J,i as ee,h as ye,g as be,j as we}from"./index-BS7JkFzs.js";function Ve(i){const b="/dungeons-dragons-app/";return`
    <div class="wallet-summary">     
      <div class="wallet-list">
        ${[{key:"pp",label:"Platino",icon:`${b}icons/moneta_platino.png`},{key:"gp",label:"Oro",icon:`${b}icons/moneta_oro.png`},{key:"sp",label:"Argento",icon:`${b}icons/moneta_argento.png`},{key:"cp",label:"Rame",icon:`${b}icons/moneta_rame.png`}].map(w=>`
          <div class="stat-card wallet-card">
            <div class="wallet-card__info">
              <span class="coin-avatar coin-avatar--${w.key}" aria-hidden="true">
                <img src="${w.icon}" alt="" loading="lazy" />
              </span>
              <strong>${w.label}</strong>
            </div>
            <strong>${(i==null?void 0:i[w.key])??0}</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `}const K={cp:1,sp:10,gp:100,pp:1e3},He={cp:"Rame",sp:"Argento",gp:"Oro",pp:"Platino"};function _e(i,b){return i||{user_id:b.user_id,character_id:b.id,cp:0,sp:0,gp:0,pp:0}}async function C(i){const b=be(),te=G(b.activeCharacterId),w=b.characters.find(n=>G(n.id)===te);if(!w){i.innerHTML='<section class="card"><p>Nessun personaggio selezionato.</p></section>';return}const M=async n=>{we(!0);try{return await n()}finally{we(!1)}};let f=b.cache.items,r=b.cache.wallet,U=[];if(!b.offline){try{f=await Me(w.id),x("items",f),await N({items:f})}catch{u("Errore caricamento inventario","error")}try{r=await ze(w.id),x("wallet",r),r&&await N({wallet:r})}catch{u("Errore caricamento wallet","error")}try{U=await qe(w.id)}catch{u("Errore caricamento transazioni","error")}}const Ee=pe(f),X=ke(w);i.innerHTML=`
    <div class="inventory-layout">
      <section class="card inventory-main">
        <header class="card-header">
          <p class="eyebrow">Inventario</p>
          <div class="button-row">
            <button class="icon-button icon-button--add" type="button" data-add-item aria-label="Nuovo oggetto">
              <span aria-hidden="true">+</span>
            </button>
          </div>
        </header>
        <div class="filters">
          <input type="search" placeholder="Cerca" data-search />
          <select data-category></select>
          <label class="toggle-pill filter-toggle">
            <input type="checkbox" data-equipable-filter />
            <span>Oggetti equipaggiabili</span>
          </label>
          <label class="toggle-pill filter-toggle">
            <input type="checkbox" data-magic-filter />
            <span>Oggetti magici</span>
          </label>
          <span class="pill">Carico totale: <strong data-carry-total>${me(Ee,X)}</strong></span>
        </div>
        <div class="inventory-list-scroll" data-inventory-list></div>
      </section>
      <div class="inventory-side">
        <section class="card inventory-wallet">
          <header class="card-header">
            <p class="eyebrow">Monete</p>
            <div class="button-row">
              <button class="icon-button" type="button" data-edit-wallet aria-label="Modifica monete" title="Modifica monete">
                <span aria-hidden="true">✏️</span>
              </button>
            </div>
          </header>
          ${Ve(r)}
        </section>
        <section class="card">
          <header class="card-header">
            <p class="eyebrow">Transazioni</p>
            <div class="button-row">
              <button class="icon-button icon-button--swap" type="button" data-exchange-coins aria-label="Scambia monete" title="Scambia monete">
                <span aria-hidden="true">⇄</span>
              </button>
            </div>
          </header>
          <div class="inventory-transactions">
            ${b.offline?'<p class="muted">Transazioni disponibili solo online.</p>':xe(U).outerHTML}
          </div>
        </section>
      </div>
    </div>
  `;const T=i.querySelector("[data-inventory-list]"),ae=i.querySelector("[data-search]"),Y=i.querySelector("[data-category]"),I=i.querySelector("[data-equipable-filter]"),O=i.querySelector("[data-magic-filter]"),ne=i.querySelector("[data-carry-total]");Ne.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.equipable?`${n.label}`:n.label,Y.appendChild(o)});function P(){const n=ae.value.toLowerCase(),o=Y.value,l=(I==null?void 0:I.checked)??!1,S=(O==null?void 0:O.checked)??!1,v=f.filter(e=>{const t=e.name.toLowerCase().includes(n),a=!o||e.category===o,d=!l||e.equipable,_=!S||e.is_magic;return t&&a&&d&&_}),m=new Map(f.map(e=>[String(e.id),e])),s=new Map;f.forEach(e=>{const t=e.container_item_id;if(!t)return;const a=String(t);s.has(a)||s.set(a,[]),s.get(a).push(e)});const h=new Set(v.map(e=>String(e.id))),$=e=>{let t=e;for(;t!=null&&t.container_item_id;){const a=m.get(String(t.container_item_id));if(!a)break;const d=String(a.id);if(h.has(d))break;h.add(d),t=a}},z=e=>{const t=[...s.get(String(e.id))||[]];for(;t.length;){const a=t.pop(),d=String(a.id);if(h.has(d))continue;h.add(d);const _=s.get(d);_!=null&&_.length&&t.push(..._)}};v.forEach(e=>{$(e),e.category==="container"&&z(e)});const y=f.filter(e=>h.has(String(e.id)));T.innerHTML=Oe(y,X),ne&&(ne.textContent=me(pe(y),X)),T.querySelectorAll("[data-edit]").forEach(e=>e.addEventListener("click",()=>{const t=f.find(a=>a.id===e.dataset.edit);t&&he(w,t,f,C.bind(null,i))})),T.querySelectorAll("[data-item-image]").forEach(e=>e.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation();const a=f.find(d=>String(d.id)===e.dataset.itemImage);a&&fe(a)})),T.querySelectorAll("[data-item-preview]").forEach(e=>e.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation();const a=f.find(d=>String(d.id)===e.dataset.itemPreview);a&&fe(a)})),T.querySelectorAll("[data-delete]").forEach(e=>e.addEventListener("click",async()=>{const t=f.find(L=>L.id===e.dataset.delete);if(!t)return;const a=t.category==="container",d=a?f.filter(L=>L.container_item_id===t.id):[];await ye({title:"Conferma eliminazione oggetto",message:a?`Stai per eliminare il contenitore "${t.name}". Gli oggetti al suo interno resteranno nell'inventario senza contenitore. Questa azione non può essere annullata.`:`Stai per eliminare l'oggetto "${t.name}" dall'inventario. Questa azione non può essere annullata.`,confirmLabel:"Elimina"})&&await M(async()=>{try{d.length&&await Promise.all(d.map(L=>ve(L.id,{container_item_id:null}))),await De(t.id),u(a?"Contenitore eliminato":"Oggetto eliminato"),C(i)}catch{u("Errore eliminazione","error")}})})),T.querySelectorAll("[data-use]").forEach(e=>e.addEventListener("click",async()=>{const t=f.find(a=>a.id===e.dataset.use);if(t){if(t.qty<=0){u("Quantità esaurita","error");return}await M(async()=>{try{const a=Math.max(t.qty-1,0);await ve(t.id,{qty:a}),u("Consumabile usato"),C(i)}catch{u("Errore utilizzo consumabile","error")}})}}))}P(),ae.addEventListener("input",P),Y.addEventListener("change",P),I==null||I.addEventListener("change",P),O==null||O.addEventListener("change",P),document.querySelectorAll("[data-money-action]").forEach(n=>{n.dataset.bound||(n.dataset.bound="true",n.addEventListener("click",async()=>{if((window.location.hash.replace("#/","")||"home")!=="inventory")return;const l=be(),S=G(l.activeCharacterId),v=l.characters.find(c=>G(c.id)===S);if(!v)return;r=l.cache.wallet;const m=v.user_id,s=v.id,h=n.dataset.moneyAction,y=await J({title:h==="pay"?"Paga monete":"Ricevi monete",submitLabel:h==="pay"?"Paga":"Ricevi",content:ge({direction:h})});if(!y)return;r||(r={user_id:m,character_id:s,cp:0,sp:0,gp:0,pp:0});const e=y.get("coin"),t=Number(y.get("amount")||0),a={cp:e==="cp"?t:0,sp:e==="sp"?t:0,gp:e==="gp"?t:0,pp:e==="pp"?t:0},d=h==="pay"?-1:1,_=Object.fromEntries(Object.entries(a).map(([c,g])=>[c,g*d])),L=B(r,_);await M(async()=>{try{const c=await H({...L,user_id:m,character_id:s});await je({user_id:m,character_id:s,direction:h,amount:_,reason:y.get("reason"),occurred_on:y.get("occurred_on")}),r=c,x("wallet",c),await N({wallet:c}),u("Wallet aggiornato"),C(i)}catch{u("Errore aggiornamento denaro","error")}})}))});const Q=i.querySelector("[data-edit-wallet]");Q&&!Q.dataset.bound&&(Q.dataset.bound="true",Q.addEventListener("click",async()=>{r=_e(r,w);const n=await J({title:"Modifica monete",submitLabel:"Salva",content:Te(r),onOpen:({fieldsEl:l})=>{ee(l)}});if(!n)return;const o={...r,pp:Math.max(0,Number(n.get("pp")||0)),gp:Math.max(0,Number(n.get("gp")||0)),sp:Math.max(0,Number(n.get("sp")||0)),cp:Math.max(0,Number(n.get("cp")||0))};await M(async()=>{try{const l=await H({...o,user_id:r.user_id,character_id:r.character_id});x("wallet",l),await N({wallet:l}),u("Monete aggiornate"),C(i)}catch{u("Errore aggiornamento monete","error")}})}));const R=i.querySelector("[data-exchange-coins]");R&&!R.dataset.bound&&(R.dataset.bound="true",R.addEventListener("click",async()=>{const n={cp:Number((r==null?void 0:r.cp)??0),sp:Number((r==null?void 0:r.sp)??0),gp:Number((r==null?void 0:r.gp)??0),pp:Number((r==null?void 0:r.pp)??0)},o=Object.keys(n).filter(c=>n[c]>0),l=o[0]??"gp",S=o.find(c=>c!==l)??(l==="pp"?"gp":"pp"),v=await J({title:"Scambia monete",submitLabel:"Scambia",content:Ie({available:n,source:l,target:S}),onOpen:({fieldsEl:c})=>{if(!c)return null;ee(c);const g=c.querySelector('select[name="source"]'),A=c.querySelector('select[name="target"]'),p=c.querySelector('input[name="amount"]'),Z=c.querySelector('input[name="target_amount"]'),D=c.querySelector("[data-exchange-max]"),F=c.querySelector("[data-exchange-available]"),oe=(E,q,k)=>{const j=K[E],W=K[q];if(!j||!W)return{amount:0,targetAmount:0};const Le=Number(n[E]??0),Ce=Math.min(Number(k)||0,Le)*j,ue=Math.floor(Ce/W);return{amount:Math.floor(ue*W/j),targetAmount:ue}},ie=E=>{if(!F)return;if(!E){F.textContent="Nessuna moneta disponibile";return}const q=He[E]??E;F.textContent=`Disponibili: ${n[E]??0} ${q}`},V=(E,{useAdjustedAmount:q=!0}={})=>{const k=g==null?void 0:g.value,j=A==null?void 0:A.value;if(!k||!j||!p||!Z)return;const W=oe(k,j,E);q&&(p.value=W.amount),Z.value=W.targetAmount};g&&ie(g.value),p&&Z&&V(p.value,{useAdjustedAmount:!0});const se=()=>{ie(g==null?void 0:g.value),V((p==null?void 0:p.value)??0,{useAdjustedAmount:!0})},ce=()=>{V((p==null?void 0:p.value)??0,{useAdjustedAmount:!0})},le=()=>{V((p==null?void 0:p.value)??0,{useAdjustedAmount:!0})},de=()=>{if(!g||!A||!p)return;const E=g.value,q=A.value,k=oe(E,q,n[E]??0).amount;p.value=k,V(k,{useAdjustedAmount:!1})};return g==null||g.addEventListener("change",se),A==null||A.addEventListener("change",ce),p==null||p.addEventListener("input",le),D==null||D.addEventListener("click",de),()=>{g==null||g.removeEventListener("change",se),A==null||A.removeEventListener("change",ce),p==null||p.removeEventListener("input",le),D==null||D.removeEventListener("click",de)}}});if(!v)return;r=_e(r,w);const m=Number(v.get("amount")||0),s=v.get("source"),h=v.get("target"),$=Number(r[s]||0),z=K[s],y=K[h],t=Math.min(m,$)*z,a=Math.floor(t/y),d=Math.floor(a*y/z);if(m<=0){u("Inserisci un importo valido","error");return}if(s===h){u("Scegli due monete diverse","error");return}if(d<=0){u("Importo troppo basso per il cambio","error");return}if(d>Number(r[s]||0)){u("Monete insufficienti","error");return}d!==m&&u(`Adeguato a ${d} ${s.toUpperCase()} per un cambio preciso`,"info");const _={cp:0,sp:0,gp:0,pp:0,[s]:-d,[h]:a},L=B(r,_);await M(async()=>{try{const c=await H({...L,user_id:r.user_id,character_id:r.character_id});x("wallet",c),await N({wallet:c}),u("Scambio completato"),C(i)}catch{u("Errore scambio monete","error")}})}));const re=n=>{const o=$e(n.amount);return{cp:Number(o.cp??0),sp:Number(o.sp??0),gp:Number(o.gp??0),pp:Number(o.pp??0)}},Ae=n=>{if(!n)return"";const o=new Date(n);return Number.isNaN(o.getTime())?"":o.toISOString().split("T")[0]},Se=n=>["pp","gp","sp","cp"].map(l=>({coin:l,value:Number(n[l]??0)})).find(l=>l.value!==0)??{coin:"gp",value:0};i.querySelectorAll("[data-edit-transaction]").forEach(n=>n.addEventListener("click",async()=>{const o=U.find(a=>a.id===n.dataset.editTransaction);if(!o)return;const l=re(o),{coin:S,value:v}=Se(l),m=await J({title:"Modifica transazione",submitLabel:"Salva",content:ge({amount:Math.abs(v),coin:S,reason:o.reason??"",occurredOn:Ae(o.occurred_on||o.created_at),direction:o.direction,includeDirection:!0}),onOpen:({fieldsEl:a})=>{ee(a)}});if(!m)return;const s=m.get("direction")||o.direction,h=m.get("coin"),$=Number(m.get("amount")||0),z=s==="pay"?-1:1,y={cp:0,sp:0,gp:0,pp:0,[h]:$*z},e=Object.fromEntries(Object.keys(y).map(a=>[a,(y[a]||0)-(l[a]||0)])),t=r?B(r,e):null;await M(async()=>{try{if(t){const a=await H({...t,user_id:r.user_id,character_id:r.character_id});x("wallet",a),await N({wallet:a})}await We(o.id,{direction:s,amount:y,reason:m.get("reason"),occurred_on:m.get("occurred_on")}),u("Transazione aggiornata"),C(i)}catch{u("Errore aggiornamento transazione","error")}})})),i.querySelectorAll("[data-delete-transaction]").forEach(n=>n.addEventListener("click",async()=>{const o=U.find(s=>s.id===n.dataset.deleteTransaction);if(!o||!await ye({title:"Conferma eliminazione transazione",message:"Stai per eliminare una transazione dal registro del denaro. I saldi verranno aggiornati di conseguenza e l'azione non può essere annullata.",confirmLabel:"Elimina"}))return;const S=re(o),v=Object.fromEntries(Object.keys(S).map(s=>[s,-S[s]])),m=r?B(r,v):null;await M(async()=>{try{if(m){const s=await H({...m,user_id:r.user_id,character_id:r.character_id});x("wallet",s),await N({wallet:s})}await Pe(o.id),u("Transazione eliminata"),C(i)}catch{u("Errore eliminazione transazione","error")}})})),i.querySelector("[data-add-item]").addEventListener("click",()=>{he(w,null,f,C.bind(null,i))})}export{C as renderInventory};
