import{k as h,n as I,u as R,c as d,a as z,s as _,g as G,b as U,d as T,p as D,o as q}from"./index-DtIC5mHn.js";const M="journal-session-files";async function V(a){const{data:e,error:t}=await h.from("journal_entries").select("*").eq("character_id",a).order("entry_date",{ascending:!1});if(t)throw t;return e??[]}async function Q(a){const{data:e,error:t}=await h.from("journal_tags").select("*").eq("user_id",a).order("name");if(t)throw t;return e??[]}async function J(a){if(!a.length)return[];const{data:e,error:t}=await h.from("journal_entry_tags").select("*").in("entry_id",a);if(t)throw t;return e??[]}async function K(a){const{data:e,error:t}=await h.from("journal_session_files").select("*").eq("character_id",a).order("created_at",{ascending:!1});if(t)throw t;return e??[]}async function X({userId:a,characterId:e,file:t}){const i=(t.name.split(".").pop()||"pdf").toLowerCase(),n=(t.name.replace(/\.[^.]+$/,"")||"session-file").toLowerCase().replace(/[^a-z0-9-_]+/g,"-").replace(/^-+|-+$/g,"").slice(0,64)||"session-file",o=`${a}/${e}/${Date.now()}-${n}.${i}`,{error:r}=await h.storage.from(M).upload(o,t,{cacheControl:"3600",upsert:!1,contentType:t.type||"application/pdf"});if(r)throw r;return o}async function H(a,e=300){const{data:t,error:i}=await h.storage.from(M).createSignedUrl(a,e);if(i)throw i;return(t==null?void 0:t.signedUrl)??null}async function Y(a){const{data:e,error:t}=await h.from("journal_session_files").insert(a).select("*").single();if(t)throw t;return e}async function Z(a){const{error:e}=await h.from("journal_session_files").delete().eq("id",a.id);if(e)throw e;const{error:t}=await h.storage.from(M).remove([a.file_path]);if(t)throw t}async function ee(a){const{data:e,error:t}=await h.from("journal_entries").insert(a).select("*").single();if(t)throw t;return e}async function x(a,e){const{data:t,error:i}=await h.from("journal_entries").update(e).eq("id",a).select("*").single();if(i)throw i;return t}async function ae(a){const{error:e}=await h.from("journal_entries").delete().eq("id",a);if(e)throw e}async function te(a){const{data:e,error:t}=await h.from("journal_tags").insert(a).select("*").single();if(t)throw t;return e}async function B(a,e){const{error:t}=await h.from("journal_entry_tags").insert({entry_id:a,tag_id:e});if(t)throw t}async function ne(a,e){const{error:t}=await h.from("journal_entry_tags").delete().eq("entry_id",a).eq("tag_id",e);if(t)throw t}async function ie(a){const{error:e}=await h.from("journal_entry_tags").delete().eq("tag_id",a);if(e)throw e}async function oe(a){const{error:e}=await h.from("journal_tags").delete().eq("id",a);if(e)throw e}async function re(a){const e=G(),t=I(e.activeCharacterId),i=e.characters.find(s=>I(s.id)===t);if(!i){a.innerHTML='<section class="card"><p>Nessun personaggio selezionato.</p></section>';return}let n=e.cache.journal,o=e.cache.tags,r=[],l=[];if(!e.offline)try{const[s,u,c]=await Promise.allSettled([V(i.id),Q(i.user_id),K(i.id)]);if(s.status==="fulfilled"?(n=s.value,R("journal",n)):d("Errore caricamento voci diario","error"),u.status==="fulfilled"?(o=u.value,R("tags",o)):d("Errore caricamento tag","error"),c.status==="fulfilled"?l=c.value:d("Errore caricamento file sessione","error"),n.length)try{r=await J(n.map(f=>f.id)),await z({journal:n,tags:o,entryTags:r})}catch{d("Errore caricamento associazioni tag","error"),await z({journal:n,tags:o})}else await z({journal:n,tags:o})}catch{d("Errore caricamento diario","error")}const $=new Map(o.map(s=>[s.id,s])),g=r.reduce((s,u)=>(s[u.entry_id]||(s[u.entry_id]=[]),s[u.entry_id].push(u.tag_id),s),{}),y=n.filter(s=>s.is_pinned).length;a.innerHTML=`
    <div class="journal-layout">
      <section class="card journal-hero-card">
        <div class="journal-hero-card__copy">
          <p class="eyebrow">Diario</p>
          <h2>Appunti di avventura</h2>
          <p class="muted">Organizza sessioni, PNG, indizi e file del personaggio.</p>
        </div>
        <div class="journal-hero-card__stats" aria-label="Statistiche diario">
          <span><strong>${n.length}</strong> voci</span>
          <span><strong>${y}</strong> in evidenza</span>
          <span><strong>${o.length}</strong> tag</span>
          <span><strong>${l.length}</strong> file</span>
        </div>
      </section>
      <section class="card journal-section-card journal-section-card--entries">
        <header class="card-header journal-card-header">
          <div>
            <p class="eyebrow">Voci diario</p>
            <p class="muted">Cerca, espandi e aggiorna rapidamente gli appunti.</p>
          </div>
          <button class="icon-button icon-button--add" data-add-entry aria-label="Nuova voce" title="Nuova voce">
            <span aria-hidden="true">+</span>
          </button>
        </header>
        <div class="filters journal-filters-row">
          <label class="journal-search-field">
            <span aria-hidden="true">🔎</span>
            <input type="search" placeholder="Cerca per titolo o contenuto" data-search />
          </label>
          <button data-add-tag class="ghost-button journal-tag-button" aria-label="Gestisci tag" title="Gestisci tag">
            <span aria-hidden="true">🏷️</span> Tag
          </button>
        </div>
        <div data-journal-list></div>
      </section>

      <section class="card journal-section-card journal-section-card--files">
        <header class="card-header journal-card-header">
          <div>
            <p class="eyebrow">File sessioni</p>
            <p class="muted">PDF, mappe e handout consultabili al volo.</p>
          </div>
          <button class="icon-button" type="button" data-upload-session-file aria-label="Carica file sessione" title="Carica file sessione (PDF)">
            <span aria-hidden="true">📎</span>
          </button>
        </header>
        <input type="file" accept="application/pdf,.pdf" hidden data-session-file-input />
        <p class="journal-upload-feedback" data-upload-feedback>${e.offline?"Modalità offline: upload non disponibile.":"Carica un PDF di sessione per salvarlo nel diario."}</p>
        <div data-session-files-list></div>
      </section>
    </div>
  `;const w=a.querySelector("[data-journal-list]"),E=a.querySelector("[data-session-files-list]"),S=a.querySelector("[data-search]"),N=a.querySelector("[data-upload-session-file]"),m=a.querySelector("[data-session-file-input]"),p=a.querySelector("[data-upload-feedback]");function j(){const s=S.value.toLowerCase().trim(),u=se(n,s);w.innerHTML=u.length?le(u,g,$):'<div class="journal-empty-state"><strong>Nessuna voce trovata</strong><span>Prova una ricerca diversa o crea una nuova voce.</span></div>',w.querySelectorAll("[data-edit]").forEach(c=>c.addEventListener("click",async f=>{f.stopPropagation();const b=n.find(k=>k.id===c.dataset.edit);b&&await O(i,b,o,g[b.id]??[],v)})),w.querySelectorAll("[data-delete]").forEach(c=>c.addEventListener("click",async f=>{f.stopPropagation();const b=n.find(P=>P.id===c.dataset.delete);if(!(!b||!await U({title:"Conferma eliminazione voce",message:`Stai per eliminare la voce "${b.title||"Senza titolo"}" dal diario. Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))){_(!0);try{await ae(b.id),d("Voce eliminata"),await v()}catch{d("Errore eliminazione","error")}finally{_(!1)}}})),w.querySelectorAll("[data-entry-card]").forEach(c=>c.addEventListener("click",()=>{const f=c.querySelector("[data-entry-content]");if(!f)return;const b=c.classList.toggle("is-open");f.hidden=!b})),w.querySelectorAll("[data-quick-append]").forEach(c=>c.addEventListener("click",async f=>{f.stopPropagation();const b=n.find(k=>k.id===c.dataset.quickAppend);b&&await ye(b,v)}))}function C(){E.innerHTML=l.length?ue(l):'<div class="journal-empty-state"><strong>Nessun file caricato</strong><span>Aggiungi un PDF di sessione per averlo sempre a portata di mano.</span></div>',E.querySelectorAll("[data-delete-file]").forEach(s=>s.addEventListener("click",async()=>{const u=l.find(f=>f.id===s.dataset.deleteFile);if(!(!u||!await U({title:"Conferma eliminazione file",message:`Stai per eliminare il file "${u.file_name}". Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))){_(!0);try{await Z(u),d("File eliminato"),v()}catch{d("Errore eliminazione file","error")}finally{_(!1)}}})),E.querySelectorAll("[data-preview-file]").forEach(s=>s.addEventListener("click",async()=>{const u=l.find(f=>f.id===s.dataset.previewFile);if(!u)return;_(!0);let c=null;try{if(c=await H(u.file_path,600),!c){d("Impossibile aprire l’anteprima","error");return}}catch{d("Errore apertura anteprima","error")}finally{_(!1)}c&&ge(c)})),E.querySelectorAll("[data-download-file]").forEach(s=>s.addEventListener("click",async()=>{const u=l.find(c=>c.id===s.dataset.downloadFile);if(u){_(!0);try{const c=await H(u.file_path,120);if(!c){d("Impossibile scaricare il file","error");return}await me(c,u.file_name)}catch{d("Errore download file","error")}finally{_(!1)}}}))}async function v(){await re(a)}j(),C(),S.addEventListener("input",j),a.querySelector("[data-add-entry]").addEventListener("click",async()=>{await O(i,null,o,[],v)}),a.querySelector("[data-add-tag]").addEventListener("click",async()=>{await we(i,o,v)}),e.offline&&(N.disabled=!0),N==null||N.addEventListener("click",()=>m==null?void 0:m.click()),m==null||m.addEventListener("change",async()=>{var b;const s=(b=m.files)==null?void 0:b[0];if(!s)return;const u=10;if(s.type!=="application/pdf"){p&&(p.textContent="Formato non valido: carica un PDF."),d("Carica solo file PDF","error"),m.value="";return}if(s.size>u*1024*1024){p&&(p.textContent="File troppo grande (max 10MB)."),d("File troppo grande","error"),m.value="";return}const c=await he(s);if(!c){m.value="",p&&(p.textContent="Caricamento annullato.");return}const f=c.displayName||s.name;p&&(p.textContent=`Upload in corso: ${f}...`),_(!0);try{const k=await X({userId:i.user_id,characterId:i.id,file:s});await Y({user_id:i.user_id,character_id:i.id,file_name:f,file_path:k,mime_type:s.type||"application/pdf",size_bytes:s.size,session_no:c.sessionNo,notes:c.notes,metadata:{original_name:s.name,display_name:f}}),d("File caricato con successo","success"),p&&(p.textContent=`Caricato: ${f}`),m.value="",await v()}catch{p&&(p.textContent="Errore durante il caricamento del file."),d("Errore upload file","error")}finally{_(!1)}})}function se(a,e){return e?a.filter(t=>{var i,n;return((i=t.title)==null?void 0:i.toLowerCase().includes(e))||((n=t.content)==null?void 0:n.toLowerCase().includes(e))}):a}function le(a,e,t){return`
    <ul class="journal-entry-list">
      ${[...a].sort((n,o)=>+!!o.is_pinned-+!!n.is_pinned).map(n=>{const o=e[n.id]??[],r=de(n.content||""),l=ce(n.content||"");return`
          <li class="journal-entry-card journal-entry-card--entry ${n.is_pinned?"is-pinned":""}" data-entry-card>
            <div class="journal-entry-card__header">
              <div class="journal-entry-card__summary">
                <div class="journal-entry-card__title-row">
                  <strong>${n.title||"Senza titolo"}</strong>
                  ${n.is_pinned?'<span class="journal-entry-card__pin">In evidenza</span>':""}
                </div>
                <p class="muted">${n.entry_date||""} · Sessione ${n.session_no??"-"}</p>
                ${l?`<p class="journal-entry-card__preview">${l}</p>`:""}
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
            ${o.length?`
            <div class="tag-row journal-entry-card__tags">
              ${o.map($=>{var g;return`<span class="chip">${((g=t.get($))==null?void 0:g.name)??""}</span>`}).join("")}
            </div>`:""}
            <div class="journal-entry-card__content" data-entry-content hidden>
              ${r||'<p class="muted">Nessun contenuto.</p>'}
            </div>
          </li>
        `}).join("")}
    </ul>
  `}function ce(a){const e=W(a||"").replace(/[#>*_`-]/g,"").replace(/\s+/g," ").trim();return e?e.length>150?`${e.slice(0,150)}…`:e:""}function de(a){const i=W(a||"").split(`
`).map(o=>{let r=o;return r=r.replace(/`([^`]+)`/g,"<code>$1</code>"),r=r.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),r=r.replace(/_([^_]+)_/g,"<em>$1</em>"),r.startsWith("# ")?`<h4>${r.slice(2)}</h4>`:r.startsWith("- ")?`<li>${r.slice(2)}</li>`:r.startsWith("&gt; ")?`<blockquote>${r.slice(5)}</blockquote>`:`<p>${r||"<br />"}</p>`});let n=!1;return i.map(o=>o.startsWith("<li>")?n?o:(n=!0,`<ul>${o}`):n?(n=!1,`</ul>${o}`):o).join("")+(n?"</ul>":"")}function W(a){return a.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function ue(a){return`
    <ul class="journal-entry-list">
      ${a.map(e=>`
        <li class="journal-entry-card journal-entry-card--file">
          <div class="journal-file-card__icon" aria-hidden="true">PDF</div>
          <div class="journal-file-card__body">
            <strong>${e.file_name}</strong>
            <p class="muted">${pe(e.size_bytes)} · ${e.mime_type||"application/pdf"}</p>
            <div class="journal-file-card__meta">
              ${e.session_no!==null&&e.session_no!==void 0?`<span>Sessione ${e.session_no}</span>`:""}
              <span>${fe(e.created_at)}</span>
            </div>
            ${e.notes?`<p class="journal-file-card__notes">${e.notes}</p>`:""}
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
  `}function pe(a=0){const e=Number(a)||0;return e<1024?`${e} B`:e<1024*1024?`${Math.round(e/1024)} KB`:`${(e/(1024*1024)).toFixed(2)} MB`}function fe(a){if(!a)return"";const e=new Date(a);return Number.isNaN(e.getTime())?"":e.toLocaleString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}async function me(a,e){const t=e||"session-file.pdf";try{const i=await fetch(a,{credentials:"omit"});if(!i.ok)throw new Error(`Download HTTP error: ${i.status}`);const n=await i.blob(),o=URL.createObjectURL(n),r=document.createElement("a");r.href=o,r.download=t,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(o);return}catch{const n=document.createElement("a");n.href=a,n.download=t,n.rel="noopener",document.body.appendChild(n),n.click(),n.remove()}}function ge(a){if(window.open(a,"_blank","noopener,noreferrer"))return;const t=document.createElement("a");t.href=a,t.target="_blank",t.rel="noopener noreferrer",document.body.appendChild(t),t.click(),t.remove()}function L(a,e,t=[]){const i=document.createElement("section");return i.className="journal-modal-section",i.innerHTML=`
    <div class="journal-modal-section__header">
      <h4>${a}</h4>
      ${e?`<p class="muted">${e}</p>`:""}
    </div>
  `,t.filter(Boolean).forEach(n=>i.appendChild(n)),i}async function he(a){const e=document.createElement("div");e.className="drawer-form modal-form-grid journal-file-modal",e.appendChild(L("Dettagli file","Rinomina il file e collegalo a una sessione, se utile.",[T({label:"Nome file visibile",name:"display_name",value:a.name}),T({label:"Sessione (opzionale)",name:"session_no",type:"number"})])),e.appendChild(L("Note","Aggiungi contesto, scena o riferimento al contenuto del PDF.",[D({label:"Note (opzionale)",name:"notes",placeholder:"Aggiungi contesto o descrizione del file"})]));const t=await q({title:"Dettagli file sessione",submitLabel:"Carica file",content:e});if(!t)return null;const i=t.get("session_no"),n=Number(i),o=Number.isFinite(n)&&n>=0?n:null,r=String(t.get("display_name")||"").trim(),l=String(t.get("notes")||"").trim();return{displayName:r,sessionNo:o,notes:l||null}}async function O(a,e,t,i,n){const o=document.createElement("div");o.className="drawer-form modal-form-grid journal-entry-modal";const r=T({label:"Titolo",name:"title",value:(e==null?void 0:e.title)??""}),l=document.createElement("div");l.className="modal-form-row journal-entry-modal__meta",l.appendChild(r),l.appendChild(T({label:"Data",name:"entry_date",type:"date",value:(e==null?void 0:e.entry_date)??new Date().toISOString().split("T")[0]})),l.appendChild(T({label:"Sessione",name:"session_no",type:"number",value:(e==null?void 0:e.session_no)??""})),o.appendChild(L("Informazioni","Titolo, data e numero sessione aiutano a ritrovare la voce.",[l]));const $=_e({label:"In evidenza",name:"is_pinned",checked:!!(e!=null&&e.is_pinned)});$.classList.add("journal-entry-modal__pin-toggle-inline");const g=D({label:"Contenuto",name:"content",value:(e==null?void 0:e.content)??""});g.classList.add("journal-entry-modal__content-field");const y=g.querySelector("textarea");y==null||y.classList.add("journal-entry-modal__textarea");const w=document.createElement("div");w.className="journal-entry-modal__editor-header",w.appendChild(ve(y)),w.appendChild($),o.appendChild(L("Contenuto","Usa la toolbar per formattare appunti, indizi, PNG e promemoria.",[w,g]));const E=document.createElement("div");E.className="tag-selector journal-entry-modal__tag-selector",E.innerHTML="<span>Tag</span>",t.forEach(m=>{const p=document.createElement("label"),j=i.includes(m.id);p.className=`condition-modal__item journal-entry-modal__tag-item ${j?"is-selected":""}`,p.innerHTML=`
      <span class="condition-modal__item-label"><strong>${m.name}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="entry_tag" value="${m.id}" ${j?"checked":""} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;const C=p.querySelector('input[type="checkbox"]');C==null||C.addEventListener("change",()=>{p.classList.toggle("is-selected",C.checked)}),E.appendChild(p)}),o.appendChild(L("Tag","Etichetta la voce per filtri e consultazione rapida.",[E]));const S=await q({title:e?"Modifica voce":"Nuova voce",submitLabel:e?"Salva":"Crea",content:o,cardClass:"modal-card--wide"});if(!S)return;const N={user_id:a.user_id,character_id:a.id,title:S.get("title"),entry_date:S.get("entry_date"),session_no:Number(S.get("session_no")||0),content:S.get("content"),is_pinned:S.get("is_pinned")==="on"};_(!0);try{const m=e?await x(e.id,N):await ee(N),p=Array.from(E.querySelectorAll('input[type="checkbox"]')).filter(j=>j.checked).map(j=>j.value);if(e){const j=p.filter(v=>!i.includes(v)),C=i.filter(v=>!p.includes(v));await Promise.all([...j.map(v=>B(m.id,v)),...C.map(v=>ne(m.id,v))])}else await Promise.all(p.map(j=>B(m.id,j)));d("Voce salvata"),await n()}catch{d("Errore salvataggio voce","error")}finally{_(!1)}}function _e({label:a,name:e,checked:t=!1}){const i=document.createElement("label");return i.className="modal-toggle-field journal-entry-modal__pin-toggle",i.innerHTML=`
    <span class="modal-toggle-field__label">${a}</span>
    <span class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="${e}" ${t?"checked":""} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </span>
  `,i}function ve(a){const e=[{label:"B",title:"Grassetto",action:()=>A(a,"**","**")},{label:"I",title:"Corsivo",action:()=>A(a,"_","_")},{label:"H1",title:"Titolo",action:()=>F(a,"# ")},{label:"•",title:"Elenco",action:()=>F(a,"- ")},{label:"❝",title:"Citazione",action:()=>F(a,"> ")},{label:"</>",title:"Codice inline",action:()=>A(a,"`","`")},{label:"⇥",title:"Aumenta rientro",action:()=>F(a,"  ")},{label:"⇤",title:"Riduci rientro",action:()=>be(a,"  ")}],t=document.createElement("div");return t.className="journal-entry-modal__toolbar",e.forEach(i=>{const n=document.createElement("button");n.type="button",n.className="icon-button",n.title=i.title,n.textContent=i.label,n.addEventListener("click",i.action),t.appendChild(n)}),t}function A(a,e,t){if(!a)return;a.focus();const{selectionStart:i,selectionEnd:n,value:o}=a,r=o.slice(i,n);a.setRangeText(`${e}${r}${t}`,i,n,"end"),a.dispatchEvent(new Event("input",{bubbles:!0}))}function F(a,e){if(!a)return;a.focus();const{selectionStart:t,selectionEnd:i,value:n}=a,o=n.lastIndexOf(`
`,t-1)+1,r=n.indexOf(`
`,i),l=r===-1?n.length:r,g=n.slice(o,l).split(`
`).map(y=>`${e}${y}`).join(`
`);a.setRangeText(g,o,l,"end"),a.dispatchEvent(new Event("input",{bubbles:!0}))}function be(a,e){if(!a)return;a.focus();const{selectionStart:t,selectionEnd:i,value:n}=a,o=n.lastIndexOf(`
`,t-1)+1,r=n.indexOf(`
`,i),l=r===-1?n.length:r,g=n.slice(o,l).split(`
`).map(y=>y.startsWith(e)?y.slice(e.length):y).join(`
`);a.setRangeText(g,o,l,"end"),a.dispatchEvent(new Event("input",{bubbles:!0}))}async function ye(a,e){var r;const t=document.createElement("div");t.className="drawer-form modal-form-grid journal-quick-modal",t.appendChild(L("Nota rapida","Il testo verrà aggiunto in fondo alla voce selezionata.",[D({label:`Aggiungi testo a "${a.title||"Senza titolo"}"`,name:"append_content",placeholder:"Scrivi qui appunti veloci da aggiungere alla voce..."})]));const i=await q({title:"Aggiunta rapida al diario",submitLabel:"Aggiungi",content:t});if(!i)return;const n=String(i.get("append_content")||"").trim();if(!n){d("Nessun testo da aggiungere","info");return}const o=(r=a.content)!=null&&r.trim()?`${a.content.trim()}

${n}`:n;_(!0);try{await x(a.id,{user_id:a.user_id,character_id:a.character_id,title:a.title,entry_date:a.entry_date,session_no:a.session_no,is_pinned:a.is_pinned,content:o}),d("Testo aggiunto alla voce"),await e()}catch{d("Errore aggiunta rapida","error")}finally{_(!1)}}async function we(a,e,t){const i=document.createElement("div");i.className="drawer-form modal-form-grid journal-tag-manager",i.appendChild(L("Nuovo tag","Crea etichette brevi per catalogare le voci del diario.",[T({label:"Nome nuovo tag",name:"name"})]));const n=document.createElement("div");n.className="journal-tag-manager__list",n.innerHTML=e.length?e.map(l=>`
      <div class="journal-tag-manager__item">
        <span class="chip">${l.name}</span>
        <button type="button" class="icon-button icon-button--danger" data-remove-tag="${l.id}" aria-label="Elimina tag ${l.name}" title="Elimina tag">
          <span aria-hidden="true">🗑️</span>
        </button>
      </div>
    `).join(""):'<p class="muted">Nessun tag disponibile.</p>',i.appendChild(L("Tag esistenti","Eliminare un tag lo rimuove da tutte le voci collegate.",[n]));const o=await q({title:"Gestione tag diario",submitLabel:"Crea tag",content:i,onOpen:({fieldsEl:l})=>{l.querySelectorAll("[data-remove-tag]").forEach($=>{$.addEventListener("click",async()=>{var w;const g=$.dataset.removeTag;if(e.find(E=>E.id===g)){_(!0);try{await ie(g),await oe(g),d("Tag eliminato"),await t(),(w=document.querySelector("[data-form-cancel]"))==null||w.click()}catch{d("Errore eliminazione tag","error")}finally{_(!1)}}})})}});if(!o)return;const r=String(o.get("name")||"").trim();if(r)try{await te({user_id:a.user_id,name:r}),d("Tag creato"),t()}catch{d("Errore tag","error")}}export{re as renderJournal};
