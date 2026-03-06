import{l as g,n as D,u as R,b as d,c as q,j as h,g as x,h as I,d as N,f as z,o as T}from"./index-BS7JkFzs.js";const A="journal-session-files";async function B(t){const{data:e,error:a}=await g.from("journal_entries").select("*").eq("character_id",t).order("entry_date",{ascending:!1});if(a)throw a;return e??[]}async function W(t){const{data:e,error:a}=await g.from("journal_tags").select("*").eq("user_id",t).order("name");if(a)throw a;return e??[]}async function G(t){if(!t.length)return[];const{data:e,error:a}=await g.from("journal_entry_tags").select("*").in("entry_id",t);if(a)throw a;return e??[]}async function V(t){const{data:e,error:a}=await g.from("journal_session_files").select("*").eq("character_id",t).order("created_at",{ascending:!1});if(a)throw a;return e??[]}async function Q({userId:t,characterId:e,file:a}){const n=(a.name.split(".").pop()||"pdf").toLowerCase(),i=(a.name.replace(/\.[^.]+$/,"")||"session-file").toLowerCase().replace(/[^a-z0-9-_]+/g,"-").replace(/^-+|-+$/g,"").slice(0,64)||"session-file",o=`${t}/${e}/${Date.now()}-${i}.${n}`,{error:r}=await g.storage.from(A).upload(o,a,{cacheControl:"3600",upsert:!1,contentType:a.type||"application/pdf"});if(r)throw r;return o}async function P(t,e=300){const{data:a,error:n}=await g.storage.from(A).createSignedUrl(t,e);if(n)throw n;return(a==null?void 0:a.signedUrl)??null}async function K(t){const{data:e,error:a}=await g.from("journal_session_files").insert(t).select("*").single();if(a)throw a;return e}async function J(t){const{error:e}=await g.from("journal_session_files").delete().eq("id",t.id);if(e)throw e;const{error:a}=await g.storage.from(A).remove([t.file_path]);if(a)throw a}async function X(t){const{data:e,error:a}=await g.from("journal_entries").insert(t).select("*").single();if(a)throw a;return e}async function O(t,e){const{data:a,error:n}=await g.from("journal_entries").update(e).eq("id",t).select("*").single();if(n)throw n;return a}async function Y(t){const{error:e}=await g.from("journal_entries").delete().eq("id",t);if(e)throw e}async function Z(t){const{data:e,error:a}=await g.from("journal_tags").insert(t).select("*").single();if(a)throw a;return e}async function U(t,e){const{error:a}=await g.from("journal_entry_tags").insert({entry_id:t,tag_id:e});if(a)throw a}async function ee(t,e){const{error:a}=await g.from("journal_entry_tags").delete().eq("entry_id",t).eq("tag_id",e);if(a)throw a}async function te(t){const{error:e}=await g.from("journal_entry_tags").delete().eq("tag_id",t);if(e)throw e}async function ae(t){const{error:e}=await g.from("journal_tags").delete().eq("id",t);if(e)throw e}async function ne(t){const e=x(),a=D(e.activeCharacterId),n=e.characters.find(s=>D(s.id)===a);if(!n){t.innerHTML='<section class="card"><p>Nessun personaggio selezionato.</p></section>';return}let i=e.cache.journal,o=e.cache.tags,r=[],c=[];if(!e.offline)try{const[s,u,l]=await Promise.allSettled([B(n.id),W(n.user_id),V(n.id)]);if(s.status==="fulfilled"?(i=s.value,R("journal",i)):d("Errore caricamento voci diario","error"),u.status==="fulfilled"?(o=u.value,R("tags",o)):d("Errore caricamento tag","error"),l.status==="fulfilled"?c=l.value:d("Errore caricamento file sessione","error"),i.length)try{r=await G(i.map(p=>p.id)),await q({journal:i,tags:o,entryTags:r})}catch{d("Errore caricamento associazioni tag","error"),await q({journal:i,tags:o})}else await q({journal:i,tags:o})}catch{d("Errore caricamento diario","error")}const C=new Map(o.map(s=>[s.id,s])),b=r.reduce((s,u)=>(s[u.entry_id]||(s[u.entry_id]=[]),s[u.entry_id].push(u.tag_id),s),{});t.innerHTML=`
    <div class="journal-layout">
      <section class="card journal-section-card journal-section-card--entries">
        <header class="card-header">
          <div>
            <p class="eyebrow">Diario</p>         
          </div>
          <button class="icon-button icon-button--add" data-add-entry aria-label="Nuova voce" title="Nuova voce">
            <span aria-hidden="true">+</span>
          </button>
        </header>
        <div class="filters journal-filters-row">
          <input type="search" placeholder="Cerca per titolo o contenuto" data-search />
          <button data-add-tag class="icon-button" aria-label="Gestisci tag" title="Gestisci tag">
            <span aria-hidden="true">🏷️</span>
          </button>
        </div>
        <div data-journal-list></div>
      </section>

      <section class="card journal-section-card journal-section-card--files">
        <header class="card-header">
          <p class="eyebrow">File sessioni</p>
          <button class="icon-button" type="button" data-upload-session-file aria-label="Carica file sessione" title="Carica file sessione (PDF)">
            <span aria-hidden="true">📎</span>
          </button>
        </header>
        <input type="file" accept="application/pdf,.pdf" hidden data-session-file-input />
        <p class="muted" data-upload-feedback>${e.offline?"Modalità offline: upload non disponibile.":"Carica un PDF di sessione per salvarlo nel diario."}</p>
        <div data-session-files-list></div>
      </section>
    </div>
  `;const m=t.querySelector("[data-journal-list]"),w=t.querySelector("[data-session-files-list]"),S=t.querySelector("[data-search]"),j=t.querySelector("[data-upload-session-file]"),v=t.querySelector("[data-session-file-input]"),f=t.querySelector("[data-upload-feedback]");function E(){const s=S.value.toLowerCase().trim(),u=ie(i,s);m.innerHTML=u.length?oe(u,b,C):'<p class="muted">Nessuna voce trovata.</p>',m.querySelectorAll("[data-edit]").forEach(l=>l.addEventListener("click",async p=>{p.stopPropagation();const _=i.find(L=>L.id===l.dataset.edit);_&&await H(n,_,o,b[_.id]??[],y)})),m.querySelectorAll("[data-delete]").forEach(l=>l.addEventListener("click",async p=>{p.stopPropagation();const _=i.find(M=>M.id===l.dataset.delete);if(!(!_||!await I({title:"Conferma eliminazione voce",message:`Stai per eliminare la voce "${_.title||"Senza titolo"}" dal diario. Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))){h(!0);try{await Y(_.id),d("Voce eliminata"),await y()}catch{d("Errore eliminazione","error")}finally{h(!1)}}})),m.querySelectorAll("[data-entry-card]").forEach(l=>l.addEventListener("click",()=>{const p=l.querySelector("[data-entry-content]");if(!p)return;const _=l.classList.toggle("is-open");p.hidden=!_})),m.querySelectorAll("[data-quick-append]").forEach(l=>l.addEventListener("click",async p=>{p.stopPropagation();const _=i.find(L=>L.id===l.dataset.quickAppend);_&&await _e(_,y)}))}function $(){w.innerHTML=c.length?le(c):'<p class="muted">Nessun file caricato.</p>',w.querySelectorAll("[data-delete-file]").forEach(s=>s.addEventListener("click",async()=>{const u=c.find(p=>p.id===s.dataset.deleteFile);if(!(!u||!await I({title:"Conferma eliminazione file",message:`Stai per eliminare il file "${u.file_name}". Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))){h(!0);try{await J(u),d("File eliminato"),y()}catch{d("Errore eliminazione file","error")}finally{h(!1)}}})),w.querySelectorAll("[data-preview-file]").forEach(s=>s.addEventListener("click",async()=>{const u=c.find(p=>p.id===s.dataset.previewFile);if(!u)return;h(!0);let l=null;try{if(l=await P(u.file_path,600),!l){d("Impossibile aprire l’anteprima","error");return}}catch{d("Errore apertura anteprima","error")}finally{h(!1)}l&&pe(l)})),w.querySelectorAll("[data-download-file]").forEach(s=>s.addEventListener("click",async()=>{const u=c.find(l=>l.id===s.dataset.downloadFile);if(u){h(!0);try{const l=await P(u.file_path,120);if(!l){d("Impossibile scaricare il file","error");return}await ue(l,u.file_name)}catch{d("Errore download file","error")}finally{h(!1)}}}))}async function y(){await ne(t)}E(),$(),S.addEventListener("input",E),t.querySelector("[data-add-entry]").addEventListener("click",async()=>{await H(n,null,o,[],y)}),t.querySelector("[data-add-tag]").addEventListener("click",async()=>{await be(n,o,y)}),e.offline&&(j.disabled=!0),j==null||j.addEventListener("click",()=>v==null?void 0:v.click()),v==null||v.addEventListener("change",async()=>{var _;const s=(_=v.files)==null?void 0:_[0];if(!s)return;const u=10;if(s.type!=="application/pdf"){f&&(f.textContent="Formato non valido: carica un PDF."),d("Carica solo file PDF","error"),v.value="";return}if(s.size>u*1024*1024){f&&(f.textContent="File troppo grande (max 10MB)."),d("File troppo grande","error"),v.value="";return}const l=await fe(s);if(!l){v.value="",f&&(f.textContent="Caricamento annullato.");return}const p=l.displayName||s.name;f&&(f.textContent=`Upload in corso: ${p}...`),h(!0);try{const L=await Q({userId:n.user_id,characterId:n.id,file:s});await K({user_id:n.user_id,character_id:n.id,file_name:p,file_path:L,mime_type:s.type||"application/pdf",size_bytes:s.size,session_no:l.sessionNo,notes:l.notes,metadata:{original_name:s.name,display_name:p}}),d("File caricato con successo","success"),f&&(f.textContent=`Caricato: ${p}`),v.value="",await y()}catch{f&&(f.textContent="Errore durante il caricamento del file."),d("Errore upload file","error")}finally{h(!1)}})}function ie(t,e){return e?t.filter(a=>{var n,i;return((n=a.title)==null?void 0:n.toLowerCase().includes(e))||((i=a.content)==null?void 0:i.toLowerCase().includes(e))}):t}function oe(t,e,a){return`
    <ul class="journal-entry-list">
      ${t.map(n=>{const i=e[n.id]??[],o=re(n.content||"");return`
          <li class="journal-entry-card journal-entry-card--entry" data-entry-card>
            <div class="journal-entry-card__header">
              <div class="journal-entry-card__summary">
                <strong>${n.title||"Senza titolo"}</strong>
                <p class="muted">${n.entry_date||""} · Sessione ${n.session_no??"-"}</p>
              </div>
              <div class="actions journal-entry-card__actions">
                <button class="icon-button" data-quick-append="${n.id}" aria-label="Aggiunta rapida" title="Aggiunta rapida testo">
                  <span aria-hidden="true">➕</span>
                </button>
                <button class="icon-button" data-edit="${n.id}" aria-label="Modifica voce" title="Modifica">
                  <span aria-hidden="true">✏️</span>
                </button>
                <button class="icon-button icon-button--danger" data-delete="${n.id}" aria-label="Elimina voce" title="Elimina">
                  <span aria-hidden="true">🗑️</span>
                </button>
              </div>
            </div>
            <div class="tag-row">
              ${i.map(r=>{var c;return`<span class="chip">${((c=a.get(r))==null?void 0:c.name)??""}</span>`}).join("")}
            </div>
            <div class="journal-entry-card__content" data-entry-content hidden>
              ${o||'<p class="muted">Nessun contenuto.</p>'}
            </div>
          </li>
        `}).join("")}
    </ul>
  `}function re(t){const n=se(t||"").split(`
`).map(o=>{let r=o;return r=r.replace(/`([^`]+)`/g,"<code>$1</code>"),r=r.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),r=r.replace(/_([^_]+)_/g,"<em>$1</em>"),r.startsWith("# ")?`<h4>${r.slice(2)}</h4>`:r.startsWith("- ")?`<li>${r.slice(2)}</li>`:r.startsWith("&gt; ")?`<blockquote>${r.slice(5)}</blockquote>`:`<p>${r||"<br />"}</p>`});let i=!1;return n.map(o=>o.startsWith("<li>")?i?o:(i=!0,`<ul>${o}`):i?(i=!1,`</ul>${o}`):o).join("")+(i?"</ul>":"")}function se(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function le(t){return`
    <ul class="journal-entry-list">
      ${t.map(e=>`
        <li class="journal-entry-card journal-entry-card--file">
          <div>
            <strong>${e.file_name}</strong>
            <p class="muted">${ce(e.size_bytes)} · ${e.mime_type||"application/pdf"}</p>
            ${e.session_no!==null&&e.session_no!==void 0?`<p class="muted">Sessione ${e.session_no}</p>`:""}
            ${e.notes?`<p class="muted">${e.notes}</p>`:""}
            <p class="muted">${de(e.created_at)}</p>
          </div>
          <div class="actions">
            <button class="icon-button" data-preview-file="${e.id}" aria-label="Visualizza file" title="Visualizza">
              <span aria-hidden="true">👁️</span>
            </button>
            <button class="icon-button" data-download-file="${e.id}" aria-label="Scarica file" title="Scarica">
              <span aria-hidden="true">⬇️</span>
            </button>
            <button class="icon-button icon-button--danger" data-delete-file="${e.id}" aria-label="Elimina file" title="Elimina file">
              <span aria-hidden="true">🗑️</span>
            </button>
          </div>
        </li>
      `).join("")}
    </ul>
  `}function ce(t=0){const e=Number(t)||0;return e<1024?`${e} B`:e<1024*1024?`${Math.round(e/1024)} KB`:`${(e/(1024*1024)).toFixed(2)} MB`}function de(t){if(!t)return"";const e=new Date(t);return Number.isNaN(e.getTime())?"":e.toLocaleString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}async function ue(t,e){const a=e||"session-file.pdf";try{const n=await fetch(t,{credentials:"omit"});if(!n.ok)throw new Error(`Download HTTP error: ${n.status}`);const i=await n.blob(),o=URL.createObjectURL(i),r=document.createElement("a");r.href=o,r.download=a,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(o);return}catch{const i=document.createElement("a");i.href=t,i.download=a,i.rel="noopener",document.body.appendChild(i),i.click(),i.remove()}}function pe(t){if(window.open(t,"_blank","noopener,noreferrer"))return;const a=document.createElement("a");a.href=t,a.target="_blank",a.rel="noopener noreferrer",document.body.appendChild(a),a.click(),a.remove()}async function fe(t){const e=document.createElement("div");e.className="drawer-form modal-form-grid",e.appendChild(N({label:"Nome file visibile",name:"display_name",value:t.name})),e.appendChild(N({label:"Sessione (opzionale)",name:"session_no",type:"number"})),e.appendChild(z({label:"Note (opzionale)",name:"notes",placeholder:"Aggiungi contesto o descrizione del file"}));const a=await T({title:"Dettagli file sessione",submitLabel:"Carica file",content:e});if(!a)return null;const n=a.get("session_no"),i=Number(n),o=Number.isFinite(i)&&i>=0?i:null,r=String(a.get("display_name")||"").trim(),c=String(a.get("notes")||"").trim();return{displayName:r,sessionNo:o,notes:c||null}}async function H(t,e,a,n,i){const o=document.createElement("div");o.className="drawer-form modal-form-grid journal-entry-modal";const r=N({label:"Titolo",name:"title",value:(e==null?void 0:e.title)??""}),c=document.createElement("div");c.className="modal-form-row journal-entry-modal__meta",c.appendChild(r),c.appendChild(N({label:"Data",name:"entry_date",type:"date",value:(e==null?void 0:e.entry_date)??new Date().toISOString().split("T")[0]})),c.appendChild(N({label:"Sessione",name:"session_no",type:"number",value:(e==null?void 0:e.session_no)??""})),o.appendChild(c);const C=me({label:"In evidenza",name:"is_pinned",checked:!!(e!=null&&e.is_pinned)});C.classList.add("journal-entry-modal__pin-toggle-inline");const b=z({label:"Contenuto",name:"content",value:(e==null?void 0:e.content)??""});b.classList.add("journal-entry-modal__content-field");const m=b.querySelector("textarea");m==null||m.classList.add("journal-entry-modal__textarea");const w=document.createElement("div");w.className="journal-entry-modal__editor-header",w.appendChild(ge(m)),w.appendChild(C),o.appendChild(w),o.appendChild(b);const S=document.createElement("div");S.className="tag-selector journal-entry-modal__tag-selector",S.innerHTML="<span>Tag</span>",a.forEach(f=>{const E=document.createElement("label"),$=n.includes(f.id);E.className=`condition-modal__item journal-entry-modal__tag-item ${$?"is-selected":""}`,E.innerHTML=`
      <span class="condition-modal__item-label"><strong>${f.name}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="entry_tag" value="${f.id}" ${$?"checked":""} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;const y=E.querySelector('input[type="checkbox"]');y==null||y.addEventListener("change",()=>{E.classList.toggle("is-selected",y.checked)}),S.appendChild(E)}),o.appendChild(S);const j=await T({title:e?"Modifica voce":"Nuova voce",submitLabel:e?"Salva":"Crea",content:o,cardClass:"modal-card--wide"});if(!j)return;const v={user_id:t.user_id,character_id:t.id,title:j.get("title"),entry_date:j.get("entry_date"),session_no:Number(j.get("session_no")||0),content:j.get("content"),is_pinned:j.get("is_pinned")==="on"};h(!0);try{const f=e?await O(e.id,v):await X(v),E=Array.from(S.querySelectorAll('input[type="checkbox"]')).filter($=>$.checked).map($=>$.value);if(e){const $=E.filter(s=>!n.includes(s)),y=n.filter(s=>!E.includes(s));await Promise.all([...$.map(s=>U(f.id,s)),...y.map(s=>ee(f.id,s))])}else await Promise.all(E.map($=>U(f.id,$)));d("Voce salvata"),await i()}catch{d("Errore salvataggio voce","error")}finally{h(!1)}}function me({label:t,name:e,checked:a=!1}){const n=document.createElement("label");return n.className="modal-toggle-field journal-entry-modal__pin-toggle",n.innerHTML=`
    <span class="modal-toggle-field__label">${t}</span>
    <span class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="${e}" ${a?"checked":""} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </span>
  `,n}function ge(t){const e=[{label:"B",title:"Grassetto",action:()=>F(t,"**","**")},{label:"I",title:"Corsivo",action:()=>F(t,"_","_")},{label:"H1",title:"Titolo",action:()=>k(t,"# ")},{label:"•",title:"Elenco",action:()=>k(t,"- ")},{label:"❝",title:"Citazione",action:()=>k(t,"> ")},{label:"</>",title:"Codice inline",action:()=>F(t,"`","`")},{label:"⇥",title:"Aumenta rientro",action:()=>k(t,"  ")},{label:"⇤",title:"Riduci rientro",action:()=>he(t,"  ")}],a=document.createElement("div");return a.className="journal-entry-modal__toolbar",e.forEach(n=>{const i=document.createElement("button");i.type="button",i.className="icon-button",i.title=n.title,i.textContent=n.label,i.addEventListener("click",n.action),a.appendChild(i)}),a}function F(t,e,a){if(!t)return;t.focus();const{selectionStart:n,selectionEnd:i,value:o}=t,r=o.slice(n,i);t.setRangeText(`${e}${r}${a}`,n,i,"end"),t.dispatchEvent(new Event("input",{bubbles:!0}))}function k(t,e){if(!t)return;t.focus();const{selectionStart:a,selectionEnd:n,value:i}=t,o=i.lastIndexOf(`
`,a-1)+1,r=i.indexOf(`
`,n),c=r===-1?i.length:r,b=i.slice(o,c).split(`
`).map(m=>`${e}${m}`).join(`
`);t.setRangeText(b,o,c,"end"),t.dispatchEvent(new Event("input",{bubbles:!0}))}function he(t,e){if(!t)return;t.focus();const{selectionStart:a,selectionEnd:n,value:i}=t,o=i.lastIndexOf(`
`,a-1)+1,r=i.indexOf(`
`,n),c=r===-1?i.length:r,b=i.slice(o,c).split(`
`).map(m=>m.startsWith(e)?m.slice(e.length):m).join(`
`);t.setRangeText(b,o,c,"end"),t.dispatchEvent(new Event("input",{bubbles:!0}))}async function _e(t,e){var r;const a=document.createElement("div");a.className="drawer-form modal-form-grid",a.appendChild(z({label:`Aggiungi testo a "${t.title||"Senza titolo"}"`,name:"append_content",placeholder:"Scrivi qui appunti veloci da aggiungere alla voce..."}));const n=await T({title:"Aggiunta rapida al diario",submitLabel:"Aggiungi",content:a});if(!n)return;const i=String(n.get("append_content")||"").trim();if(!i){d("Nessun testo da aggiungere","info");return}const o=(r=t.content)!=null&&r.trim()?`${t.content.trim()}

${i}`:i;h(!0);try{await O(t.id,{user_id:t.user_id,character_id:t.character_id,title:t.title,entry_date:t.entry_date,session_no:t.session_no,is_pinned:t.is_pinned,content:o}),d("Testo aggiunto alla voce"),await e()}catch{d("Errore aggiunta rapida","error")}finally{h(!1)}}async function be(t,e,a){const n=document.createElement("div");n.className="drawer-form modal-form-grid journal-tag-manager",n.appendChild(N({label:"Nome nuovo tag",name:"name"}));const i=document.createElement("div");i.className="journal-tag-manager__list",i.innerHTML=e.length?e.map(c=>`
      <div class="journal-tag-manager__item">
        <span class="chip">${c.name}</span>
        <button type="button" class="icon-button icon-button--danger" data-remove-tag="${c.id}" aria-label="Elimina tag ${c.name}" title="Elimina tag">
          <span aria-hidden="true">🗑️</span>
        </button>
      </div>
    `).join(""):'<p class="muted">Nessun tag disponibile.</p>',n.appendChild(i);const o=await T({title:"Gestione tag diario",submitLabel:"Crea tag",content:n,onOpen:({fieldsEl:c})=>{c.querySelectorAll("[data-remove-tag]").forEach(C=>{C.addEventListener("click",async()=>{var w;const b=C.dataset.removeTag;if(e.find(S=>S.id===b)){h(!0);try{await te(b),await ae(b),d("Tag eliminato"),await a(),(w=document.querySelector("[data-form-cancel]"))==null||w.click()}catch{d("Errore eliminazione tag","error")}finally{h(!1)}}})})}});if(!o)return;const r=String(o.get("name")||"").trim();if(r)try{await Z({user_id:t.user_id,name:r}),d("Tag creato"),a()}catch{d("Errore tag","error")}}export{ne as renderJournal};
