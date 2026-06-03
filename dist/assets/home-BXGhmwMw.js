import{s as Be,a as ze,b as ie,c as ca,e as Ca,d as ke,R as Ae,u as qa,f as da,g as Ra,h as Ie,i as Ta}from"./constants-B3wU3-LX.js";import{c as Ba,g as ua,f as za,a as Da,b as Ia,d as Fa,e as ja,h as Pa,m as Ha,i as Oa,u as Wa,j as Va,k as Ua,l as Ka,n as Ga,o as Ce,p as Ge,q as Qa}from"./walletApi-3er6babx.js";import{c as w,o as ue,u as me,a as he,b as Fe,g as se,n as pe,d as qe,e as Re,s as Qe,f as Xa,h as Ya,i as Ja,j as Za}from"./index-BGCrdw0j.js";import{openDiceOverlay as ge}from"./dice-DLj4bpHx.js";import{o as Xe}from"./characterDrawer-BpRLTvmK.js";import{n as X,c as we,f as U,g as de,a as et,b as at,d as tt,e as fe,h as pa,s as st,i as nt,p as it,j as Ye,k as je,l as We,r as ot,m as lt,o as rt,q as ct,t as dt}from"./utils-Tv02vTp-.js";import{f as ut}from"./companionsApi-VDB5s9Sf.js";import{s as ae,o as ma,a as pt,f as Je,b as Ze,c as mt,d as ft,e as ea,g as bt,r as gt,h as vt,i as ht,j as _t,k as aa,l as yt,m as $t,n as kt}from"./modals-B4uoeZOb.js";function ve(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function St(e){const a=e&&typeof e=="object"?e:{};return{abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10,...a.abilities||{}},hp:{current:1,max:1,...a.hp||{}},speeds:{walk:null,fly:null,climb:null,burrow:null,...a.speeds||{}},attacks:Array.isArray(a.attacks)?a.attacks:[]}}function fa(e,a=[]){const t=(e==null?void 0:e.data)||{};if(!t.wild_shape_enabled)return null;const s=t.wild_shape||{};if(!s.active_companion_id)return null;const n=(a||[]).find(c=>String(c.id)===String(s.active_companion_id));if(!n)return null;const o=St(n.stat_block),r=Math.max(Number(o.hp.max)||Number(o.hp.current)||1,1),l=Math.max(0,Math.min(Number(s.hp_current??o.hp.current??r)||0,r));return{companion:n,statBlock:o,hpCurrent:l,hpMax:r}}function wt(e={}){return[["walk","terra"],["fly","volo"],["climb","scalata"],["burrow","scavare"]].map(([t,s])=>Number(e==null?void 0:e[t])?`${s} ${Number(e[t])} m`:"").filter(Boolean).join(" · ")}function At(e,a){return e?`
    <div>
      <p>Non hai ancora un personaggio.</p>
      <div class="button-row">
        <button class="primary" data-create-character>Nuovo personaggio</button>
      </div>
    </div>
  `:`<p class="muted">${a?"Modalità offline attiva: crea un personaggio quando torni online.":"Accedi per creare un personaggio."}</p>`}function Et(e,a,t=[],s=[]){const n=e.data||{},o=n.hp||{},r=n.hit_dice||{},l=n.abilities||{},c=fa(e,s),u=c?{...l,str:Math.max(Number(l.str)||0,Number(c.statBlock.abilities.str)||0),dex:Math.max(Number(l.dex)||0,Number(c.statBlock.abilities.dex)||0),con:Math.max(Number(l.con)||0,Number(c.statBlock.abilities.con)||0)}:l,m=X(n.proficiency_bonus),S=!!n.inspiration,A=!!n.concentration_active,i=n.initiative??de(u.dex),E=n.skills||{},y=n.skill_mastery||{},b=et(u,m,E,y),T=X(o.current),$=X(o.max),q=X(o.temp),h=n.death_saves||{},B=Math.max(0,Math.min(3,Number(h.successes)||0)),j=Math.max(0,Math.min(3,Number(h.failures)||0)),_=$?Math.min(Math.max(Number(T)/$*100,0),100):0,N=Math.max(0,Number(q)||0),k=Math.max(0,Number($??T??0)),v=N>0,z=v?100:0,I=v?k:1,O=v?N:0,G=$?`${T??"-"}/${$}`:`${T??"-"}`,J=$?`${Math.round(_)}%`:"-",re=q??"-",Y=Math.max(0,Math.min(6,Number(o.weak_points)||0)),d=Array.isArray(n.conditions)?n.conditions:n.condition?[n.condition]:[],p=ca.filter(H=>d.includes(H.key)),f=p.length?p.map(H=>H.label).join(", "):"Nessuna condizione",M=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti delle condizioni">?</summary>
      <div class="info-tooltip__panel">
        ${p.length?`
      <ul class="condition-track__list">
        ${p.map(H=>`<li><strong>${H.label}:</strong> ${H.effect}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun effetto attivo.</p>'}
      </div>
    </details>
  `,x=[{value:1,description:"Svantaggio sulle prove di caratteristica."},{value:2,description:"Velocità dimezzata."},{value:3,description:"Svantaggio sui tiri per colpire e tiri salvezza."},{value:4,description:"Punti ferita massimi dimezzati."},{value:5,description:"Velocità ridotta a 0."},{value:6,description:"Morte."}],C=x.filter(H=>H.value<=Y),R=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti dei punti indebolimento">?</summary>
      <div class="info-tooltip__panel">
        ${C.length?`
      <ul class="weakness-track__list">
        ${C.map(H=>`<li>${H.description}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun indebolimento.</p>'}
      </div>
    </details>
  `,V=`Livello attuale: ${Y}`,Q=at(n,l,t),F=!!n.darkvision_enabled,P=X(n.darkvision_range_m),K=F?`${P??18} m`:"No",ne=(s||[]).filter(H=>["familiar","summon","transformation"].includes(H.kind||"familiar")),Z=c?Math.min(Math.max(c.hpCurrent/c.hpMax*100,0),100):0,oe=c?wt(c.statBlock.speeds):"",_e=[{key:"str",label:ie.str,value:u.str,wild:!!c},{key:"dex",label:ie.dex,value:u.dex,wild:!!c},{key:"con",label:ie.con,value:u.con,wild:!!c},{key:"int",label:ie.int,value:l.int},{key:"wis",label:ie.wis,value:l.wis},{key:"cha",label:ie.cha,value:l.cha}];return`
    <div class="character-overview">
      <div class="character-summary">
        <div class="character-hero">
          ${n.avatar_url?`<img class="character-avatar" src="${n.avatar_url}" alt="Ritratto di ${e.name}" />`:""}
          <div>
            <h3 class="character-name">${e.name}</h3>
            <div class="character-meta">
              <span class="meta-tag">Livello ${n.level??"-"}</span>
              <span class="meta-tag">Razza ${n.race??"-"}</span>
              <span class="meta-tag">Classe ${n.class_name??n.class_archetype??"-"}</span>
              <span class="meta-tag">Archetipo ${n.archetype??"-"}</span>
              <span class="meta-tag">Allineamento ${n.alignment??"-"}</span>
              <span class="meta-tag">Background ${n.background??"-"}</span>
            </div>
          </div>
        </div>
        <div class="character-summary-actions">
          <div class="proficiency-chip">
            <span>Bonus competenza</span>
            <strong>${U(m)}</strong>
          </div>
          <div class="inspiration-chip">
            <span>Ispirazione</span>
            <button
              class="inspiration-toggle"
              type="button"
              data-toggle-inspiration
              aria-pressed="${S}"
              aria-label="Imposta ispirazione"
              ${a?"":"disabled"}
            >
              <span class="inspiration-toggle__icon" aria-hidden="true">★</span>
            </button>
          </div>
          <div class="inspiration-chip concentration-chip">
            <span>Concentrazione</span>
            <button
              class="inspiration-toggle concentration-toggle"
              type="button"
              data-toggle-concentration
              aria-pressed="${A}"
              aria-label="Imposta concentrazione"
              ${a?"":"disabled"}
            >
              <span class="inspiration-toggle__icon" aria-hidden="true">🧠</span>
            </button>
          </div>
          <button class="ghost-button background-button" type="button" data-show-background>
            Background
          </button>
        </div>
      </div>
      <div class="stat-panel">     
        <div class="stat-grid stat-grid--compact stat-grid--abilities">
          ${_e.map(H=>{const ee=X(H.value),W=ee===null?"-":nt(ee);return`
            <div class="stat-card stat-card--${H.key} ${H.wild?"stat-card--wild-shape":""}">
              <span>${H.label}${H.wild?" <small>forma</small>":""}</span>
              <strong>${ee??"-"}</strong>
              <span class="stat-card__modifier" aria-label="Modificatore ${H.label}">${W}</span>
            </div>
          `}).join("")}
        </div>
      </div>
      <div class="hp-panel">
        <div class="hp-bar-row">
          <div class="armor-class-card">
            <span>CA</span>
            <strong>${Q??"-"}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">🛡️</span>
          </div>
          <div class="armor-class-card armor-class-card--initiative">
            <span>Iniz</span>
            <strong>${U(X(i))}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">⚡</span>
          </div>
          <div class="armor-class-card armor-class-card--speed">
            <span>Vel</span>
            <strong>${n.speed??"-"}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">🏃</span>
          </div>
          <div class="hp-bar-stack">
            <div class="hp-bar-label">
              <span>HP</span>
              <strong>${G}</strong>
              <span class="hp-bar-label__percent" aria-label="Percentuale vita ${J}">${J}</span>
              <span class="hp-bar-label__divider" aria-hidden="true">•</span>
              <span class="hp-bar-label__temp-group ${v?"is-active":""}">
                <span class="hp-bar-label__temp">HP temporanei</span>
                <strong>${re}</strong>
              </span>
            </div>
            <div class="hp-bar-track">
              <div class="hp-bar" style="flex: ${I};">
                <div class="hp-bar__fill" style="width: ${_}%;"></div>
              </div>
              ${v?`
              <div class="hp-bar hp-bar--temp is-active" style="flex: ${O};">
                <div class="hp-bar__fill hp-bar__fill--temp" style="width: ${z}%;"></div>
              </div>
              `:""}
            </div>
            ${c?`
            <div class="hp-bar-label hp-bar-label--wild-shape">
              <span>HP forma selvatica</span>
              <strong>${c.hpCurrent}/${c.hpMax}</strong>
              <span class="hp-bar-label__percent">${Math.round(Z)}%</span>
              <span class="hp-bar-label__divider" aria-hidden="true">•</span>
              <span>${ve(c.companion.name)}</span>
              ${oe?`<span class="muted">${ve(oe)}</span>`:""}
            </div>
            <div class="hp-bar-track hp-bar-track--wild-shape">
              <div class="hp-bar">
                <div class="hp-bar__fill" style="width: ${Z}%;"></div>
              </div>
            </div>
            <div class="wild-shape-hp-actions">
              <button class="ghost-button ghost-button--compact wild-shape-end-button" type="button" data-end-wild-shape ${a?"":"disabled"}>Termina</button>
            </div>
            `:n.wild_shape_enabled?`
            <div class="wild-shape-empty">
              <span>Forma selvatica pronta</span>
              <button class="ghost-button ghost-button--compact" type="button" data-open-wild-shape ${a&&ne.length?"":"disabled"}>
                Scegli forma (${ne.length})
              </button>
            </div>
            `:""}
            <div class="hp-panel-hit-dice">
              <span>Dadi vita</span>
              <strong>${tt(r)}</strong>
              <button
                class="icon-button icon-button--dice hp-panel-hit-dice__roll"
                type="button"
                data-roll-hit-dice
                aria-label="Lancia dado vita per curare PF"
                ${a?"":"disabled"}
              >
                <span aria-hidden="true">🎲</span>
              </button>
            </div>
          </div>
        </div>
        <div class="hp-panel-subgrid">
          <div class="stat-chip stat-chip--highlight">
            <span>Percezione passiva</span>
            <strong>${b??"-"}</strong>
          </div>
          <div class="stat-chip stat-chip--highlight stat-chip--darkvision">
            <span>Scurovisione</span>
            <strong>${K}</strong>
          </div>
          <div class="hp-panel-status-row">
            <div class="weakness-track">
              <div class="track-label-row">
                <span class="weakness-track__label">Punti indebolimento</span>
                ${R}
              </div>
              <div class="weakness-track__group" role="radiogroup" aria-label="Livelli indebolimento">
                ${x.map(H=>{const ee=H.value===Y;return`
                  <button
                    class="death-save-dot ${ee?"is-filled":""}"
                    type="button"
                    role="radio"
                    aria-checked="${ee}"
                    data-weakness-level="${H.value}"
                    aria-label="Livello ${H.value}: ${H.description}"
                  >
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="weakness-track__description">${V}</div>
            </div>
            <div class="condition-track">
              <div class="track-label-row">
                <span class="condition-track__label">Condizioni</span>
                ${M}
              </div>
              <div class="condition-track__row">
                <span class="condition-track__value">${f}</span>
              </div>
            </div>
            <div class="death-saves">
              <span class="death-saves__label">TS morte</span>
              <div class="death-saves__group" aria-label="Successi">
                <span class="death-saves__tag">✓</span>
                ${Array.from({length:3},(H,ee)=>{const W=ee+1;return`
                  <button class="death-save-dot ${W<=B?"is-filled":""}" type="button" data-death-save="successes" data-death-save-index="${W}" aria-label="Successi ${W}">
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="death-saves__group" aria-label="Fallimenti">
                <span class="death-saves__tag">✗</span>
                ${Array.from({length:3},(H,ee)=>{const W=ee+1;return`
                  <button class="death-save-dot ${W<=j?"is-filled":""}" type="button" data-death-save="failures" data-death-save-index="${W}" aria-label="Fallimenti ${W}">
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="home-section">
        <header class="card-header">
          <div>
            <p class="eyebrow">Competenze extra</p>
          </div>
        </header>
        ${Ct(e,t,a)}
      </div>
    </div>
  `}function Lt(e){const a=e.data||{},t=a.abilities||{},s=X(a.proficiency_bonus),n=a.skills||{},o=a.skill_mastery||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${ze.map(r=>{const l=!!n[r.key],c=!!o[r.key],u=we(t[r.ability],s,l?c?2:1:0);return`
          <button class="modifier-card modifier-card--interactive ${c?"modifier-card--mastery":l?"modifier-card--proficiency":""}" type="button" data-skill-card="${r.key}" aria-label="Tira abilità ${r.label}">
            <div>
              <div class="modifier-title">
                <strong>${r.label}</strong>
                <span class="modifier-ability modifier-ability--${r.ability}">${ie[r.ability]}</span>
              </div>
            </div>
            <div class="modifier-value">${U(u)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function Mt(e){const a=Array.isArray(e.special_skill_rolls)?e.special_skill_rolls:[];return a.some(n=>{const o=String((n==null?void 0:n.id)??"").toLowerCase(),r=String((n==null?void 0:n.name)??"").trim().toLowerCase();return o==="initiative"||o==="default_initiative"||r==="iniziativa"})?a:[{id:"default_initiative",name:"Iniziativa",ability:"dex",proficient:!1,mastery:!1,bonus:0},...a]}function Nt(e){const a=e.data||{},t=a.abilities||{},s=X(a.proficiency_bonus);return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Mt(a).map((o,r)=>{var y;const l=ie[o.ability]?o.ability:"str",c=!!o.proficient,u=!!o.mastery&&c,m=we(t[l],s,c?u?2:1:0),S=Number(o.bonus)||0,A=(m??0)+S,i=u?"modifier-card--mastery":c?"modifier-card--proficiency":"",E=((y=o.name)==null?void 0:y.trim())||`Tiro speciale ${r+1}`;return`
          <button class="modifier-card modifier-card--interactive ${i}" type="button" data-special-skill-card="${o.id??r}" aria-label="Tira abilità speciale ${E}">
            <div>
              <div class="modifier-title">
                <strong>${E}</strong>
                <span class="modifier-ability modifier-ability--${l}">${ie[l]}</span>
              </div>
            </div>
            <div class="modifier-value">${U(A)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function xt(e){const a=e.data||{},t=a.abilities||{},s=X(a.proficiency_bonus),n=a.saving_throws||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Be.map(o=>{const r=!!n[o.key],l=we(t[o.key],s,r?1:0);return`
          <button class="modifier-card modifier-card--interactive ${r?"modifier-card--proficiency":""}" type="button" data-saving-throw-card="${o.key}" aria-label="Tira salvezza ${o.label}">
            <div>
              <div class="modifier-title">
                <strong>${o.label}</strong>
              </div>
            </div>
            <div class="modifier-value">${U(l)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function ta(e,a){const s=(Array.isArray(e==null?void 0:e[a])?e[a]:[]).map(n=>{var o;return((o=ke.find(r=>r.key===n))==null?void 0:o.label)||n}).filter(Boolean);return s.length?`<div class="tag-row">${s.map(n=>`<span class="chip chip--defense">${n}</span>`).join("")}</div>`:'<p class="muted">Nessuna voce configurata.</p>'}function Ct(e,a=[],t=!1){const s=e.data||{},n=s.proficiencies||{},o=s.proficiency_notes||"",{tools:r,languages:l}=it(o),c=s.language_proficiencies||"",u=Ye(c),m=s.talents||"",S=Ye(m),A=s.damage_defenses||{},E=[...u,...l].reduce((b,T)=>{const $=T.trim();if(!$)return b;const q=$.toLowerCase();return b.seen.has(q)||(b.seen.add(q),b.values.push($)),b},{values:[],seen:new Set}).values,y=Ca.filter(b=>n[b.key]).map(b=>b.label);return`
    <div class="detail-section">
      <div class="proficiency-tabs" data-proficiency-tabs>
        <div class="tab-bar" role="tablist" aria-label="Competenze extra">
          <button class="tab-bar__button is-active" type="button" role="tab" aria-selected="true" data-proficiency-tab="equipment">
            Equipaggiamento
          </button>
          <button class="tab-bar__button" type="button" role="tab" aria-selected="false" data-proficiency-tab="tools">
            Strumenti
          </button>
          <button class="tab-bar__button" type="button" role="tab" aria-selected="false" data-proficiency-tab="languages">
            Lingue
          </button>
          <button class="tab-bar__button" type="button" role="tab" aria-selected="false" data-proficiency-tab="talents">
            Talenti
          </button>
          <button class="tab-bar__button" type="button" role="tab" aria-selected="false" data-proficiency-tab="defenses">
            Resistenze & Immunità
          </button>
        </div>
        <div class="detail-card detail-card--text tab-panel is-active" role="tabpanel" data-proficiency-panel="equipment">
          ${y.length?`<div class="tag-row">${y.map(b=>`<span class="chip">${b}</span>`).join("")}</div>`:'<p class="muted">Nessuna competenza equipaggiamento.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="tools">
          ${r.length?`<div class="tag-row">${r.map(b=>`<span class="chip">${b}</span>`).join("")}</div>`:'<p class="muted">Aggiungi strumenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="languages">
          ${E.length?`<div class="tag-row">${E.map(b=>`<span class="chip">${b}</span>`).join("")}</div>`:'<p class="muted">Aggiungi lingue conosciute nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="talents">
          ${S.length?`<div class="tag-row">${S.map(b=>`<span class="chip">${b}</span>`).join("")}</div>`:'<p class="muted">Aggiungi talenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="defenses">
          <div class="defense-summary-grid">
            <div class="defense-summary-card">
              <span>Resistenze</span>
              ${ta(A,"resistances")}
            </div>
            <div class="defense-summary-card">
              <span>Immunità</span>
              ${ta(A,"immunities")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function qt(e,a=[],t=!1){const s=(a||[]).filter(l=>fe(l).length),n=(a||[]).filter(l=>l.attunement_active).length,o=Ba(a),r=ua(e);return`
    <section class="card home-card home-section home-scroll-panel">
      <header class="card-header">
        <div>
          <p class="eyebrow">Gestione Equipaggiamento</p>
          <div class="pill-row">
            <span class="pill pill--accent">Oggetti in sintonia: ${n}</span>
            <span class="pill">Carico totale: ${za(o,r)}</span>
          </div>
        </div>
        <div class="actions">
          ${t?`
            <button class="icon-button icon-button--add" type="button" data-add-equip aria-label="Equipaggia oggetto">
              <span aria-hidden="true">+</span>
            </button>
          `:""}
        </div>
      </header>
      ${s.length?`
          <ul class="inventory-list resource-list resource-list--compact">
            ${s.map(l=>{const c=Da(l);return`
              <li class="modifier-card attack-card resource-card inventory-item-card">
                <div class="resource-card__badges">
                  ${l.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${c.magic}</span>`:""}
                  ${l.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${c.attunement}</span>`:""}
                </div>
                <div class="attack-card__body resource-card__body">
                  <div class="resource-card__title item-info">
                    ${l.image_url?`<img class="item-avatar" src="${l.image_url}" alt="Foto di ${l.name}" data-item-image="${l.id}" />`:""}
                    <div class="item-info-body">
                      <div class="item-info-line">
                        <button class="item-name-button attack-card__name-button" type="button" data-item-preview="${l.id}" aria-label="Apri anteprima ${l.name}">${l.name}</button>
                        <span class="muted item-meta">
                          ${Ia(l.category)} · ${Fa(fe(l))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ${t?`
                  <div class="resource-card-actions">
                    <button class="resource-action-button" type="button" data-unequip="${l.id}">Rimuovi</button>
                  </div>
                `:""}
              </li>
            `}).join("")}
          </ul>
        `:'<p class="muted">Nessun oggetto equipaggiato.</p>'}
    </section>
  `}function Rt(e,a=[],t=[]){var j;const s=e.data||{},n=Number(s.attack_bonus_melee??s.attack_bonus)||0,o=Number(s.attack_bonus_ranged??s.attack_bonus)||0,r=Number(s.damage_bonus_melee??s.damage_bonus)||0,l=Number(s.damage_bonus_ranged??s.damage_bonus)||0,c=Number(s.extra_attacks)||0,u=a.filter(_=>_.category==="weapon"&&_.equipable&&fe(_).length),m=fa(e,t),A=(s.spellcasting||{}).ability,i=A?(j=s.abilities)==null?void 0:j[A]:null,E=de(i),y=X(s.proficiency_bonus),b=E===null||y===null?null:E+y,$=(Array.isArray(s.spells)?s.spells:[]).filter(_=>(_.kind==="cantrip"||Number(_.level)===0)&&_.attack_roll&&_.damage_die),q=$.length&&b!==null&&A;if(!u.length&&!q&&!(m!=null&&m.statBlock.attacks.length))return'<p class="muted">Nessuna arma equipaggiata.</p>';const h=[];c>0&&h.push(`Attacco Extra (${c})`),n&&h.push(`Mischia attacco ${U(n)}`),r&&h.push(`Mischia danni ${U(r)}`),o&&h.push(`Distanza attacco ${U(o)}`),l&&h.push(`Distanza danni ${U(l)}`);const B=h.length?`<div class="tag-row">${h.map(_=>`<span class="chip">${_}</span>`).join("")}</div>`:"";return`
    ${m?`<div class="tag-row"><span class="chip chip--wild-shape">Forma selvatica: ${ve(m.companion.name)}</span><span class="chip">FOR/DES/COS sostituite</span></div>`:""}
    ${B}
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${m!=null&&m.statBlock.attacks.length?m.statBlock.attacks.map((_,N)=>{const k=_.name||`Attacco ${N+1}`,v=Number(_.damage_modifier)||0,z=`${_.damage||"-"}${v?` ${U(v)}`:""}`;return`
          <div class="modifier-card attack-card attack-card--wild-shape" data-roll-attack="wildshape:${N}">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${ve(k)}</strong>
                <span class="modifier-ability modifier-ability--str">Forma</span>
                <span class="attack-card__hit">${U(_.to_hit||0)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${ve(z)}</span>
                <span class="muted">${ve(m.companion.name)}</span>
              </div>
            </div>
            <div class="attack-card__actions">
              <button class="icon-button icon-button--fire" data-roll-damage="wildshape:${N}" aria-label="Calcola danni ${ve(k)}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          </div>
        `}).join(""):""}
        ${u.map(_=>{var ee;const N=_.weapon_range||(_.range_normal?"ranged":"melee"),k=_.attack_ability||(N==="ranged"?"dex":"str"),v=de((ee=s.abilities)==null?void 0:ee[k])??0,z=s.proficiencies||{},O=(_.weapon_type==="simple"?!!z.weapon_simple:_.weapon_type==="martial"?!!z.weapon_martial:!1)?X(s.proficiency_bonus)??0:0,G=N==="ranged"?o:n,J=N==="ranged"?l:r,re=v+O+(Number(_.attack_modifier)||0)+G,Y=pa(_).filter(W=>W.damageDie),d=Number(_.range_normal)||null,p=Number(_.range_disadvantage)||null,f=Number(_.melee_range)||1.5,g=[];N==="melee"&&f>1.5&&g.push(`Portata ${f} m`),N==="melee"&&_.is_thrown&&d&&g.push(`Lancio ${d}${p?`/${p}`:""}`),N!=="melee"&&d&&g.push(`Gittata ${d}${p?`/${p}`:""}`);const M=_.required_ammunition_type||_.ammunition_type,x=_.consumes_ammunition?a.filter(W=>W.category!=="container").filter(W=>M?W.ammunition_type===M:W.ammunition_type).reduce((W,te)=>W+(Number(te.qty)||0),0):null,C=ja.get(M)||"Munizioni",L=x!==null?`${C} ${x}`:"",R=[...g,L].filter(Boolean).join(" · "),V=k==="dex"?"DES":k==="str"?"FOR":k.toUpperCase(),Q=_.id??_.name,F=Y.length?Y:[{id:"default",label:"",damageDie:null,damageModifier:Number(_.damage_modifier)||0}],P=F.find(W=>W.id===_.selected_damage_mode)||F[0],K=v+(Number(P.damageModifier)||0)+J,ne=P.damageDie?`${P.damageDie}${K?` ${U(K)}`:""}`:"-",Z=P.id!=="default"?P.label:"",oe=Z?`Impugnatura: ${Z}`:"",_e=`weapon:${Q}:${P.id}`,H=F.length>1?`<button class="icon-button icon-button--weapon-mode" data-cycle-weapon-mode="${Q}" aria-label="Cambia impugnatura ${_.name}" title="Cambia impugnatura: ${Z||P.label}"><span aria-hidden="true">🔁</span></button>`:"";return`
          <div class="modifier-card attack-card" data-roll-attack="weapon:${_.id??_.name}">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${_.name}</strong>
                <span class="modifier-ability modifier-ability--${k}">${V}</span>
                <span class="attack-card__hit">${U(re)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${ne}</span>
                ${oe?`<span class="muted">${oe}</span>`:""}
                ${R?`<span class="muted">${R}</span>`:""}
              </div>
            </div>
            <div class="attack-card__actions">
              ${H}
              <button class="icon-button icon-button--fire" data-roll-damage="${_e}" aria-label="Calcola danni ${_.name}${Z?` ${Z}`:""}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          </div>
        `}).join("")}
        ${q?$.map(_=>{const N=Number(_.damage_modifier)||0,k=`${_.damage_die}${N?` ${U(N)}`:""}`,v=ie[A]??(A==null?void 0:A.toUpperCase()),z=_.range?`Range ${_.range}`:"";return`
            <div class="modifier-card attack-card" data-roll-attack="spell:${_.id}">
              <div class="attack-card__body">
                <div class="attack-card__title">
                  <strong class="attack-card__name">${_.name}</strong>
                  <span class="modifier-ability modifier-ability--${A}">${v}</span>
                  <span class="attack-card__hit">${U(b)}</span>
                </div>
                <div class="attack-card__meta">
                  <span class="attack-card__damage">${k}</span>
                 
                  ${z?`<span class="muted">${z}</span>`:""}
                </div>
              </div>
              <button class="icon-button icon-button--fire" data-roll-damage="spell:${_.id}" aria-label="Calcola danni ${_.name}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          `}).join(""):""}
      </div>
    </div>
  `}function Tt(e,a=!1){var k;const t=e.data||{},s=t.spell_notes||"",n=Array.isArray(t.spells)?st(t.spells):[],o=t.spellcasting||{},r=X(t.proficiency_bonus),l=o.ability,c=l?(k=t.abilities)==null?void 0:k[l]:null,u=de(c),m=u===null||r===null?null:8+u+r,S=u===null||r===null?null:u+r,A=l?ie[l]:null,i=o.slots||{},E=o.slots_max||{},y=o.recharge||"long_rest",T=Array.from({length:9},(v,z)=>z+1).map(v=>{const z=Math.max(0,Number(i[v])||0),I=Math.max(z,Number(E[v])||0);return{level:v,count:z,max:I}}).filter(v=>v.max>0),$=[`${A??"-"}`,`CD ${m===null?"-":m}`,`TC ${S===null?"-":U(S)}`],q=$.length?`<div class="tag-row">${$.map(v=>`<span class="chip">${v}</span>`).join("")}</div>`:"",h=n.filter(v=>{if((Number(v.level)||0)<1)return!1;const I=v.prep_state||"known";return I==="prepared"||I==="always"}),B=n.filter(v=>(Number(v.level)||0)===0),j=h.filter(v=>(v.prep_state||"known")==="always"),_=h.filter(v=>(v.prep_state||"known")!=="always"),N=(v,z="")=>{const I=Number(v.level)||0,O=Ee(v.cast_time),G=ba(O),J=je(v,I);return`
      <div class="modifier-card attack-card resource-card spell-prepared-list__card">
        <div class="resource-card__badges spell-card__badges">
          ${v.concentration?'<span class="resource-chip resource-chip--floating resource-chip--concentration">C</span>':""}
          ${v.is_ritual?'<span class="resource-chip resource-chip--floating resource-chip--ritual">R</span>':""}
          ${O?`<span class="resource-chip resource-chip--floating ${G}">${O}</span>`:""}
        </div>
        <button class="spell-prepared-list__item" type="button" data-spell-quick-open="${v.id}">
          <span class="spell-prepared-list__name">${v.name}</span>
          ${I>0?`<span class="chip chip--small">${I}°</span>`:""}
        </button>
        <div class="resource-card-actions spell-card-actions">
          ${J?`
            <button class="icon-button icon-button--fire spell-card-actions__damage" type="button" data-roll-damage="spell:${v.id}" aria-label="Lancia danni ${v.name}" title="Lancia danni">
              <span aria-hidden="true">🔥</span>
            </button>
          `:""}
          ${I>0?`<button class="resource-cta-button resource-cta-button--label" type="button" data-use-spell="${v.id}">Usa</button>`:""}
          ${a?`
            <button class="resource-action-button resource-icon-button" type="button" data-edit-spell="${v.id}" aria-label="Modifica incantesimo ${v.name}">✏️</button>
            <button class="resource-action-button resource-icon-button" type="button" data-delete-spell="${v.id}" aria-label="Elimina incantesimo ${v.name}">🗑️</button>
          `:""}
        </div>
      </div>
    `};return`
    ${q}
    <div class="detail-section">
      <div class="detail-card detail-card--text spell-summary-card">
        <div class="spell-slots">
          <span class="spell-slots__title">Slot rimanenti</span>
          <div class="spell-slots__list">
            ${T.map(v=>{const z=y==="short_rest"?"charge-indicator":"charge-indicator charge-indicator--long",I=Array.from({length:v.max},(O,G)=>{const J=G>=v.count,Y=[z,J?"charge-indicator--used":""].filter(Boolean).join(" ");return a&&J?`<button type="button" class="${Y}" data-restore-spell-slot="${v.level}" aria-label="Ripristina uno slot di livello ${v.level}"></button>`:a&&!J?`<button type="button" class="${Y}" data-consume-spell-slot="${v.level}" aria-label="Consuma uno slot di livello ${v.level}"></button>`:`<span class="${Y}"></span>`}).join("");return`
              <div class="spell-slot-row">
                <span class="spell-slot-label">Slot ${v.level}°</span>
                <span class="spell-slot-count">${v.count}</span>
                <div class="spell-slot-charges" aria-hidden="true">${I||'<span class="spell-slot-empty">-</span>'}</div>
              </div>
            `}).join("")}
          </div>
        </div>
        ${s?`<p class="spell-notes">${s}</p>`:""}
      </div>
      <div class="spell-prepared-list spell-prepared-list--accordion">
        <details class="spell-list-accordion" open>
          <summary class="spell-list-accordion__summary">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <span class="spell-list-accordion__title">Trucchetti</span>
            <span class="spell-list-accordion__count">${B.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${B.length?`<div class="spell-prepared-list__items">${B.map(v=>N(v)).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun trucchetto disponibile.</p>'}
          </div>
        </details>
        <details class="spell-list-accordion" open>
          <summary class="spell-list-accordion__summary">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <span class="spell-list-accordion__title">Preparati</span>
            <span class="spell-list-accordion__count">${_.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${_.length?`<div class="spell-prepared-list__items">${_.map(v=>N(v,"Preparato")).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun incantesimo preparato.</p>'}
          </div>
        </details>
        <details class="spell-list-accordion" open>
          <summary class="spell-list-accordion__summary">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <span class="spell-list-accordion__title">Sempre conosciuti</span>
            <span class="spell-list-accordion__count">${j.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${j.length?`<div class="spell-prepared-list__items">${j.map(v=>N(v,"Sempre preparato")).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun incantesimo sempre conosciuto.</p>'}
          </div>
        </details>
      </div>
    </div>
  `}function Ee(e){const a=e==null?void 0:e.toString().trim();if(!a)return"";const t=a.toLowerCase();if(t.includes("bonus"))return"Azione Bonus";if(t.includes("reaz"))return"Reazione";if(t.includes("gratuit"))return"Azione Gratuita";if(t.includes("durata")||t.includes("più")||t.includes("piu")||t.includes("superiore"))return"Durata";if(t.includes("azion"))return"Azione";const s=Ae.find(n=>n.label.toLowerCase()===t);return(s==null?void 0:s.label)??""}function sa(e){if(!e)return Ae.length;const a=Ee(e),t=Ae.findIndex(s=>s.label===a);return t===-1?Ae.length:t}function ba(e){var t;if(!e)return"";const a=Ee(e);return((t=Ae.find(s=>s.label===a))==null?void 0:t.className)??""}function Bt(e){return[...e].sort((a,t)=>{const s=sa(a.cast_time)-sa(t.cast_time);return s!==0?s:(a.name??"").localeCompare(t.name??"","it",{sensitivity:"base"})})}function na(e,a,{showCharges:t=!0,showUseButton:s=!0,showDescription:n=!1,showCastTime:o=!0}={}){return`
    <ul class="resource-list resource-list--compact">
      ${e.map(r=>`
        <li class="modifier-card attack-card resource-card" data-resource-card="${r.id}">
          ${o&&Ee(r.cast_time)?`<span class="resource-chip resource-chip--floating ${ba(r.cast_time)}">${Ee(r.cast_time)}</span>`:""}
          <div class="attack-card__body resource-card__body">
            <div class="attack-card__title resource-card__title">
              <strong class="attack-card__name">${r.name}</strong>
            </div>
            ${n?`<p class="resource-card__description">${r.description??""}</p>`:""}
            ${t&&Number(r.max_uses)?`
              <div class="resource-card__charges">
                ${Dt(r)}
              </div>
            `:""}
          </div>
          <div class="resource-card-actions">
            ${s?`
              <button
                class="resource-cta-button resource-cta-button--label"
                data-use-resource="${r.id}"
                ${!Number(r.max_uses)||r.used>=Number(r.max_uses)?"disabled":""}
              >
                Usa
              </button>
            `:""}
            ${a?`
              <button class="resource-action-button resource-icon-button" data-edit-resource="${r.id}" aria-label="Modifica risorsa">✏️</button>
              <button class="resource-action-button resource-icon-button" data-delete-resource="${r.id}" aria-label="Elimina risorsa">🗑️</button>
            `:""}
          </div>
        </li>
      `).join("")}
    </ul>
  `}function zt(e,a){if(!e.length)return"<p>Nessuna risorsa.</p>";const t=Bt(e),s=t.filter(l=>l.reset_on===null||l.reset_on==="none"),n=t.filter(l=>l.reset_on!==null&&l.reset_on!=="none"),o=`
    <details class="resource-accordion resource-section resource-section--active" open>
      <summary class="resource-accordion__summary">
        <span>Attive</span>
        <span class="resource-accordion__meta">${n.length} risorse</span>
        <span class="resource-accordion__icon" aria-hidden="true">▾</span>
      </summary>
      <div class="resource-section__body resource-accordion__body">
        ${n.length?na(n,a,{showUseButton:!0}):'<p class="muted">Nessuna risorsa attiva.</p>'}
      </div>
    </details>
  `,r=`
    <details class="resource-accordion resource-section" ${n.length?"":"open"}>
      <summary class="resource-accordion__summary">
        <span>Passive</span>
        <span class="resource-accordion__meta">${s.length} risorse</span>
        <span class="resource-accordion__icon" aria-hidden="true">▾</span>
      </summary>
      <div class="resource-section__body resource-accordion__body">
        ${s.length?na(s,a,{showCharges:!1,showUseButton:!1,showDescription:!0,showCastTime:!0}):'<p class="muted">Nessuna risorsa passiva.</p>'}
      </div>
    </details>
  `;return`<div class="resource-accordion-stack">${o}${r}</div>`}function Dt(e){const a=Number(e.max_uses)||0,t=Number(e.used)||0;if(!a)return"";const s=e.reset_on==="long_rest"?"long":"short",n=Math.max(a-t,0),o=Array.from({length:a},(r,l)=>{const c=l<t;return`<span class="${["charge-indicator",s==="long"?"charge-indicator--long":"charge-indicator--short",c?"charge-indicator--used":""].filter(Boolean).join(" ")}" aria-hidden="true"></span>`}).join("");return`
    <div class="resource-charge-row" aria-label="Cariche risorsa">
      <span class="resource-charge-label">Cariche</span>
      <span class="resource-charge-count">${n}/${a}</span>
      <div class="resource-charges" aria-hidden="true">${o}</div>
    </div>
  `}function Pe(e){const a=e&&typeof e=="object"?e:{};return{abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10,...a.abilities||{}},hp:{current:1,max:1,...a.hp||{}},attacks:Array.isArray(a.attacks)?a.attacks:[]}}function De(e,a=[]){const t=(e==null?void 0:e.data)||{};if(!t.wild_shape_enabled)return null;const s=t.wild_shape||{};if(!s.active_companion_id)return null;const n=(a||[]).find(c=>String(c.id)===String(s.active_companion_id));if(!n)return null;const o=Pe(n.stat_block),r=Math.max(Number(o.hp.max)||Number(o.hp.current)||1,1),l=Math.max(0,Math.min(Number(s.hp_current??o.hp.current??r)||0,r));return{companion:n,statBlock:o,hpCurrent:l,hpMax:r}}function Ve(e,a=[]){const t=De(e,a);if(!e||!t)return e;const s=e.data||{},n=s.abilities||{};return{...e,data:{...s,abilities:{...n,str:Math.max(Number(n.str)||0,Number(t.statBlock.abilities.str)||0),dex:Math.max(Number(n.dex)||0,Number(t.statBlock.abilities.dex)||0),con:Math.max(Number(n.con)||0,Number(t.statBlock.abilities.con)||0)}}}}function It(e=[]){return(e||[]).filter(a=>["familiar","summon","transformation"].includes(a.kind||"familiar"))}async function Ft(e,a,t){var i,E,y;if(!((i=e==null?void 0:e.data)!=null&&i.wild_shape_enabled))return;const s=It(a);if(!s.length){w("Crea prima una forma nella sezione Famigli","error");return}const n=((E=e.data)==null?void 0:E.wild_shape)||{},o=document.createElement("div");o.className="modal-form-grid wild-shape-picker";const r=document.createElement("label");r.className="field",r.innerHTML="<span>Forma animale</span>";const l=Re(s.map(b=>{const T=Pe(b.stat_block),$=Math.max(Number(T.hp.max)||Number(T.hp.current)||1,1);return{value:b.id,label:`${b.name} · HP ${$}`}}),n.active_companion_id||((y=s[0])==null?void 0:y.id)||"");l.name="wild_shape_companion_id",r.appendChild(l),o.appendChild(r);const c=await ue({title:"Scegli forma selvatica",submitLabel:"Trasformati",content:o,cardClass:"modal-card--form"});if(!c)return;const u=String(c.get("wild_shape_companion_id")||""),m=s.find(b=>String(b.id)===u);if(!m)return;const S=Pe(m.stat_block),A=Math.max(Number(S.hp.max)||Number(S.hp.current)||1,1);await ae(e,{...e.data||{},wild_shape:{active_companion_id:m.id,hp_current:A,activated_at:new Date().toISOString()}},`Forma selvatica: ${m.name}`,()=>D(t))}async function jt(e,a){await ae(e,{...e.data||{},wild_shape:null},"Forma selvatica terminata",()=>D(a))}let ia=!1,Te=null;function Pt(e){return!e||!e.querySelector(".home-layout")?null:{windowX:window.scrollX||0,windowY:window.scrollY||0,panels:Array.from(e.querySelectorAll(".home-scroll-body, .home-scroll-panel")).map((a,t)=>({index:t,top:a.scrollTop||0,left:a.scrollLeft||0}))}}function Ht(e,a){if(!e||!a)return;const t=()=>{const s=Array.from(e.querySelectorAll(".home-scroll-body, .home-scroll-panel"));a.panels.forEach(n=>{const o=s[n.index];o&&(o.scrollTop=n.top,o.scrollLeft=n.left)}),window.scrollTo(a.windowX,a.windowY)};typeof window.requestAnimationFrame=="function"?window.requestAnimationFrame(t):setTimeout(t,0)}function Ot(e){return e?{id:`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.id,name:e.name,level:e.level,kind:Number(e.level)===0?"cantrip":"spell",cast_time:e.cast_time,duration:e.duration,range:e.range,components:e.components,concentration:!!e.concentration,attack_roll:!!e.attack_roll,is_ritual:!!e.ritual,damage_die:e.damage_die,damage_modifier:e.damage_modifier,upcast_damage_die:e.upcast_damage_die,upcast_damage_modifier:e.upcast_damage_modifier,upcast_start_level:e.upcast_start_level,description:e.description,rules_version:e.rules_version,prep_state:"known"}:null}function Wt(e){const a=(e==null?void 0:e.shared_spell)||{},t=(e==null?void 0:e.custom_spell)||{},s=e!=null&&e.shared_spell_id?a:t;if(!(s!=null&&s.name))return null;const n=Number(s.level)||0;return{id:e.id||`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.shared_spell_id||null,name:s.name,level:n,kind:s.kind||(n===0?"cantrip":"spell"),cast_time:s.cast_time||null,duration:s.duration||null,range:s.range||null,components:s.components||null,concentration:!!s.concentration,attack_roll:!!s.attack_roll,is_ritual:!!(s.ritual??s.is_ritual),damage_die:s.damage_die||null,damage_modifier:s.damage_modifier??null,upcast_damage_die:s.upcast_damage_die||null,upcast_damage_modifier:s.upcast_damage_modifier??null,upcast_start_level:s.upcast_start_level??null,description:s.description||null,school:s.school||null,caster_classes:s.caster_classes||[],rules_version:s.rules_version||null,prep_state:e.prep_state||"known"}}async function Vt(){var _;const e=["","Abiurazione","Ammaliamento","Divinazione","Evocazione","Illusione","Invocazione","Necromanzia","Trasmutazione"],a=["mago","warlock","stregone","chierico","druido","ranger","artefice","paladino","bardo"],t=document.createElement("div");t.className="modal-form-grid";const s=qe({label:"Cerca incantesimo",name:"spell_query",placeholder:"Es. Palla di fuoco"}),n=s.querySelector("input"),o=document.createElement("label");o.className="field",o.innerHTML="<span>Versione regole</span>";const r=document.createElement("select");r.name="rules_version",[{value:"2024",label:"2024"},{value:"2014",label:"2014"},{value:"Custom",label:"Custom"}].forEach(N=>{const k=document.createElement("option");k.value=N.value,k.textContent=N.label,r.appendChild(k)}),o.appendChild(r);const l=document.createElement("label");l.className="field",l.innerHTML="<span>Scuola</span>";const c=document.createElement("select");c.name="spell_school_filter",e.forEach(N=>{const k=document.createElement("option");k.value=N,k.textContent=N||"Tutte",c.appendChild(k)}),l.appendChild(c);const u=qe({label:"Livello",name:"spell_level_filter",type:"number",value:""}),m=document.createElement("div");m.className="field",m.innerHTML=`<span>Classi</span><div class="tag-row">${a.map(N=>`<label class="chip"><input type="checkbox" name="spell_caster_filter" value="${N}" /> ${N}</label>`).join("")}</div>`;const S=document.createElement("div");S.className="modal-form-row modal-form-row--compact",S.append(u,l,o),t.appendChild(s),t.appendChild(S),t.appendChild(m);const A=document.createElement("label");A.className="field",A.innerHTML="<span>Risultati</span>";const i=document.createElement("select");i.name="shared_spell_id",A.appendChild(i);const E=document.createElement("div");E.className="tab-bar",E.innerHTML='<button type="button" class="tab-bar__button" data-prev-page>◀</button><span data-page-label class="muted">Pagina 1</span><button type="button" class="tab-bar__button" data-next-page>▶</button>',t.appendChild(A),t.appendChild(E);let y=1,b=[];const T=E.querySelector("[data-page-label]"),$=E.querySelector("[data-prev-page]"),q=E.querySelector("[data-next-page]"),h=async()=>{var z;const N=Array.from(t.querySelectorAll('input[name="spell_caster_filter"]:checked')).map(I=>I.value),k=await kt({query:(n==null?void 0:n.value)||"",rulesVersion:r.value||"2024",level:((z=t.querySelector('input[name="spell_level_filter"]'))==null?void 0:z.value)||"",school:c.value||"",casterClasses:N,page:y,pageSize:25});if(b=k.items||[],i.innerHTML="",b.forEach(I=>{const O=document.createElement("option");O.value=I.id,O.textContent=`${I.name} (Lv ${I.level})`,i.appendChild(O)}),!b.length){const I=document.createElement("option");I.value="",I.textContent="Nessun risultato",i.appendChild(I)}const v=Math.max(1,Math.ceil((k.total||0)/(k.pageSize||25)));T.textContent=`Pagina ${y} / ${v}`,$.disabled=y<=1,q.disabled=y>=v};n==null||n.addEventListener("input",()=>{y=1,h()}),c.addEventListener("change",()=>{y=1,h()}),r.addEventListener("change",()=>{y=1,h()}),(_=t.querySelector('input[name="spell_level_filter"]'))==null||_.addEventListener("input",()=>{y=1,h()}),t.querySelectorAll('input[name="spell_caster_filter"]').forEach(N=>N.addEventListener("change",()=>{y=1,h()})),$==null||$.addEventListener("click",()=>{y=Math.max(1,y-1),h()}),q==null||q.addEventListener("click",()=>{y+=1,h()}),await h();const B=await ue({title:"Seleziona incantesimo condiviso",submitLabel:"Aggiungi",cancelLabel:"Annulla",content:t,cardClass:"modal-card--form"});if(!B)return null;const j=B.get("shared_spell_id");return b.find(N=>N.id===j)||null}function oa(e){var a,t;return((t=(a=e==null?void 0:e.data)==null?void 0:a.settings)==null?void 0:t.auto_usage_dice)!==!1}function Ut(e,a){var t,s;return dt((s=(t=e==null?void 0:e.data)==null?void 0:t.spellcasting)==null?void 0:s.slots,a)}async function Kt(e,a){const t=Math.max(1,Number(a==null?void 0:a.level)||1),s=Ut(e,t);if(!s.length)return w("Slot incantesimo esauriti","error"),null;if(s.length===1)return s[0].level;const n=document.createElement("label");n.className="field",n.innerHTML="<span>Seleziona slot da consumare</span>";const o=document.createElement("select");o.name="cast_slot_level",o.className="input",s.forEach(u=>{const m=document.createElement("option");m.value=String(u.level),m.textContent=`${u.level}° livello (${u.available} slot)`,o.appendChild(m)}),n.appendChild(o);const r=document.createElement("div");r.className="modal-form-grid",r.appendChild(n);const l=await ue({title:a!=null&&a.name?`Lancia ${a.name}`:"Scegli slot incantesimo",submitLabel:"Conferma",cancelLabel:"Annulla",content:r,cardClass:"modal-card--form"});return l?Math.max(t,Number(l.get("cast_slot_level"))||t):null}async function D(e){var o,r,l,c;const a=Pt(e);Te=e;const t=se(),{user:s,offline:n}=t;Qe(!0);try{let u=t.characters;if(!n&&s)try{u=await Ra(s.id),Xa({characters:u}),await he({characters:u})}catch{w("Errore caricamento personaggi","error")}const m=pe(t.activeCharacterId);!u.some(d=>pe(d.id)===m)&&u.length&&Ya(u[0].id);const A=pe(se().activeCharacterId),i=u.find(d=>pe(d.id)===A),E=!!s&&!n,y=!!s&&!n,b=!!s&&!n;let T=t.cache.resources,$=t.cache.items,q=[];if(!n&&i){const[d,p,f,g]=await Promise.allSettled([da(i.id),Ka(i.id),Je(i.id),ut(i.id)]),M={};if(d.status==="fulfilled"?(T=d.value,me("resources",T),M.resources=T):w("Errore caricamento risorse","error"),p.status==="fulfilled"?($=p.value,me("items",$),M.items=$):w("Errore caricamento equip","error"),g.status==="fulfilled"?(q=g.value||[],me("companions",q)):w("Errore caricamento forme animali","error"),f.status==="fulfilled"){const x=(f.value||[]).map(C=>Wt(C)).filter(Boolean);if(x.length){const L=[...Array.isArray((o=i.data)==null?void 0:o.spells)?i.data.spells:[]];x.forEach(R=>{L.some(Q=>Q.shared_spell_id&&Q.shared_spell_id===R.shared_spell_id)||L.push(R)}),i.data={...i.data||{},spells:L}}}Object.keys(M).length&&await he(M)}const h=Ve(i,q);e.innerHTML=`
    <div class="home-layout">
      <div class="home-column home-column--left">
        <section class="card home-card home-section">
          <header class="card-header">
            <div>
              <p class="eyebrow">Tiri salvezza</p>
              <h3></h3>
            </div>
            <div class="actions">
              <button class="icon-button" data-open-dice="saving-throws" aria-label="Lancia dadi tiri salvezza">
                <span aria-hidden="true">🎲</span>
              </button>
            </div>
          </header>
          ${h?xt(h):"<p>Nessun personaggio selezionato.</p>"}
        </section>
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Abilità</p>            
            </div>
            <div class="actions">
              <button class="icon-button" data-open-dice="skills" aria-label="Lancia dadi abilità">
                <span aria-hidden="true">🎲</span>
              </button>
            </div>
          </header>
          <div class="home-scroll-body">
            ${h?Lt(h):"<p>Nessun personaggio selezionato.</p>"}
          </div>
        </section>
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Tiri abilità speciali</p>
            </div>
            <div class="actions">
              <button class="icon-button" data-open-dice="special-skills" aria-label="Lancia dadi abilità speciali">
                <span aria-hidden="true">🎲</span>
              </button>
            </div>
          </header>
          <div class="home-scroll-body">
            ${h?Nt(h):"<p>Nessun personaggio selezionato.</p>"}
          </div>
        </section>
      </div>
      <div class="home-column home-column--center">
        <section class="card home-card home-section">
          <header class="card-header">
            <div>
              <p class="eyebrow">Scheda Personaggio</p>           
            </div>
            <div class="actions">
              ${i&&b?`
                <button class="icon-button" data-edit-character aria-label="Modifica personaggio">
                  <span aria-hidden="true">✏️</span>
                </button>
              `:""}
            </div>
          </header>
          ${h?Et(h,b,$,q):At(E,n)}
        </section>
        ${i?qt(i,$,b):""}
      </div>
      <div class="home-column home-column--right">
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Attacchi</p>
            </div>
            <div class="actions">
              <button class="icon-button icon-button--dice" data-open-dice="attack-roll" aria-label="Lancia dadi attacchi">
                <span aria-hidden="true">🎲</span>
              </button>
            </div>
          </header>
          <div class="home-scroll-body">
            ${i?Rt(h,$||[],q):"<p>Nessun personaggio selezionato.</p>"}
          </div>
        </section>
        ${(r=i==null?void 0:i.data)!=null&&r.is_spellcaster?`
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Incantesimi</p>
            </div>
            <div class="actions">
              <button class="icon-button icon-button--dice" data-open-dice="spell-attack" aria-label="Lancia dado tiro per colpire incantesimi">
                <span aria-hidden="true">🎲</span>
              </button>
              ${(c=(l=i==null?void 0:i.data)==null?void 0:l.spellcasting)!=null&&c.can_prepare?`
                <button class="icon-button icon-button--spell-prepare" type="button" data-open-prepared-spells aria-label="Prepara incantesimi" title="Prepara incantesimi">
                  <span aria-hidden="true">📖</span>
                </button>
              `:""}
              ${i&&b?`
                <button class="icon-button icon-button--add" data-add-spell aria-label="Aggiungi incantesimo">
                  <span aria-hidden="true">+</span>
                </button>
              `:""}
            </div>
          </header>
          <div class="home-scroll-body">
            ${Tt(i,b)}
          </div>
        </section>
        `:""}
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Risorse</p>           
            </div>
            ${i&&y?`
              <button class="icon-button icon-button--add" data-add-resource aria-label="Nuova risorsa">
                <span aria-hidden="true">+</span>
              </button>
            `:""}
          </header>
          <div class="home-scroll-body home-scroll-body--resources">
            ${i?zt(T,y):"<p>Nessun personaggio selezionato.</p>"}
            ${i&&!y?'<p class="muted">Connettiti per aggiungere nuove risorse.</p>':""}
          </div>
        </section>
      </div>
    </div>
  `,ga();const B=e.querySelector("[data-create-character]");B&&B.addEventListener("click",()=>{Xe(s,()=>D(e))});const j=e.querySelector("[data-edit-character]");j&&j.addEventListener("click",()=>{Xe(s,()=>D(e),i)});const _=e.querySelector("[data-add-resource]");_&&_.addEventListener("click",()=>{Ze(i,()=>D(e))});const N=e.querySelector("[data-add-spell]");N&&N.addEventListener("click",async()=>{var p;if(!i)return;const d=await mt();if(d){if(d==="shared")try{const f=await Vt();if(!f)return;const g=Ot(f),M=Array.isArray((p=i.data)==null?void 0:p.spells)?i.data.spells:[];if(M.some(L=>L.shared_spell_id===f.id)){w("Incantesimo già presente nella scheda personaggio","info");return}i.user_id&&await ft({user_id:i.user_id,character_id:i.id,shared_spell_id:f.id,prep_state:g.prep_state});const C={...i.data||{},spells:[...M,g]};await ae(i,C,"Incantesimo aggiunto dalla lista condivisa",()=>D(e));return}catch{w("Errore durante l'associazione dell'incantesimo condiviso","error");return}ea(i,async f=>{if(!f)return D(e);try{await bt({created_by:i.user_id,rules_version:f.rules_version||"2024",name:f.name,level:f.level,school:f.school||null,caster_classes:Array.isArray(f.caster_classes)?f.caster_classes:[],cast_time:f.cast_time||null,range:f.range||null,duration:f.duration||null,components:f.components||null,concentration:!!f.concentration,ritual:!!f.is_ritual,attack_roll:!!f.attack_roll,damage_die:f.damage_die||null,damage_modifier:f.damage_modifier??null,upcast_damage_die:f.upcast_damage_die||null,upcast_damage_modifier:f.upcast_damage_modifier??null,upcast_start_level:f.upcast_start_level??null,description:f.description||null})}catch{w("Incantesimo salvato sul personaggio ma non sul catalogo condiviso","info")}D(e)})}}),e.querySelectorAll("[data-edit-spell]").forEach(d=>d.addEventListener("click",()=>{var M;const p=d.dataset.editSpell;if(!p||!i)return;const g=(Array.isArray((M=i.data)==null?void 0:M.spells)?i.data.spells:[]).find(x=>x.id===p);g&&ea(i,()=>D(e),g)})),e.querySelectorAll("[data-delete-spell]").forEach(d=>d.addEventListener("click",async()=>{var C;const p=d.dataset.deleteSpell;if(!p||!i)return;const f=Array.isArray((C=i.data)==null?void 0:C.spells)?i.data.spells:[],g=f.find(L=>L.id===p);if(!g||!await Fe({title:"Conferma eliminazione incantesimo",message:`Stai per eliminare l'incantesimo "${g.name}" dalla scheda del personaggio. Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))return;if(g.shared_spell_id)try{const R=(await Je(i.id)).find(V=>V.shared_spell_id===g.shared_spell_id);R!=null&&R.id&&await gt(R.id)}catch{w("Errore rimozione associazione incantesimo","error");return}const x={...i.data||{},spells:f.filter(L=>L.id!==g.id)};await ae(i,x,"Incantesimo eliminato",()=>D(e))}));const k=e.querySelector("[data-open-prepared-spells]");k&&k.addEventListener("click",()=>{ma(i,()=>D(e))}),e.querySelectorAll("[data-spell-quick-open]").forEach(d=>d.addEventListener("click",()=>{var M;const p=d.dataset.spellQuickOpen;if(!p||!i)return;const g=(Array.isArray((M=i.data)==null?void 0:M.spells)?i.data.spells:[]).find(x=>x.id===p);g&&vt(i,g,()=>D(e))}));const v=e.querySelector("[data-show-background]");v&&v.addEventListener("click",()=>{ht(i)});const z=e.querySelector("[data-edit-conditions]");z&&z.addEventListener("click",async()=>{await va(e)}),e.querySelectorAll("[data-proficiency-tabs]").forEach(d=>{var x;const p=Array.from(d.querySelectorAll("[data-proficiency-tab]")),f=Array.from(d.querySelectorAll("[data-proficiency-panel]"));if(!p.length||!f.length)return;const g=C=>{p.forEach(L=>{const R=L.dataset.proficiencyTab===C;L.classList.toggle("is-active",R),L.setAttribute("aria-selected",String(R))}),f.forEach(L=>{L.classList.toggle("is-active",L.dataset.proficiencyPanel===C)})};p.forEach(C=>{C.addEventListener("click",()=>{g(C.dataset.proficiencyTab)})});const M=((x=p.find(C=>C.classList.contains("is-active")))==null?void 0:x.dataset.proficiencyTab)??p[0].dataset.proficiencyTab;M&&g(M)});const I=e.querySelector("[data-add-equip]");I&&i&&b&&I.addEventListener("click",async()=>{var Q;const d=($||[]).filter(F=>F.equipable&&!fe(F).length);if(!d.length){w("Nessun oggetto equipaggiabile disponibile","error");return}const p=document.createElement("div");p.className="drawer-form";const f=document.createElement("label");f.className="field",f.innerHTML="<span>Oggetto</span>";const g=document.createElement("select");g.name="item_id",d.forEach(F=>{const P=document.createElement("option");P.value=F.id,P.textContent=F.name,g.appendChild(P)}),f.appendChild(g),p.appendChild(f);const M=document.createElement("fieldset");M.className="equip-slot-field",M.innerHTML="<legend>Punti del corpo</legend>";const x=document.createElement("div");x.className="equip-slot-list",Ga.forEach(F=>{const P=document.createElement("label");P.className="checkbox",P.innerHTML=`<input type="checkbox" name="equip_slots" value="${F.value}" /> <span>${F.label}</span>`,x.appendChild(P)}),M.appendChild(x),p.appendChild(M);const C=await ue({title:"Equipaggia oggetto",submitLabel:"Equipaggia",content:p});if(!C)return;const L=C.getAll("equip_slots");if(!L.length){w("Seleziona almeno uno slot","error");return}const R=d.find(F=>String(F.id)===C.get("item_id"));if(!R)return;const V=((Q=i.data)==null?void 0:Q.proficiencies)||{};if(R.category==="weapon"){if(!R.weapon_type){w("Definisci il tipo di arma prima di equipaggiarla","error");return}if(!(R.weapon_type==="simple"?!!V.weapon_simple:!!V.weapon_martial)){w("Non hai la competenza per equipaggiare questo oggetto","error");return}}if(R.category==="armor")if(R.is_shield){if(!V.shield){w("Non hai la competenza per equipaggiare questo oggetto","error");return}}else if(R.armor_type){if(!(R.armor_type==="light"?!!V.armor_light:R.armor_type==="medium"?!!V.armor_medium:!!V.armor_heavy)){w("Non hai la competenza per equipaggiare questo oggetto","error");return}}else{w("Definisci il tipo di armatura prima di equipaggiarla","error");return}if(!R.sovrapponibile&&($||[]).filter(P=>P.id!==R.id).filter(P=>fe(P).some(K=>L.includes(K))).length){w("Uno o più slot selezionati sono già occupati","error");return}try{await Ce(R.id,{equip_slot:L[0]||null,equip_slots:L}),w("Equipaggiamento aggiornato"),D(e)}catch{w("Errore aggiornamento equip","error")}}),e.querySelectorAll("[data-unequip]").forEach(d=>d.addEventListener("click",async()=>{const p=($||[]).find(f=>f.id===d.dataset.unequip);if(p)try{await Ce(p.id,{equip_slot:null,equip_slots:[]}),w("Equipaggiamento rimosso"),D(e)}catch{w("Errore aggiornamento equip","error")}}));const O=e.querySelector("[data-toggle-inspiration]");O&&i&&b&&O.addEventListener("click",async()=>{const d=i.data||{},p={...d,inspiration:!d.inspiration};await ae(i,p,"Ispirazione aggiornata",()=>D(e))});const G=e.querySelector("[data-toggle-concentration]");G&&i&&b&&G.addEventListener("click",async()=>{const d=i.data||{},p={...d,concentration_active:!d.concentration_active};await ae(i,p,"Concentrazione aggiornata",()=>D(e))}),e.querySelectorAll("[data-open-wild-shape]").forEach(d=>d.addEventListener("click",()=>{!i||!b||Ft(i,q,e)})),e.querySelectorAll("[data-end-wild-shape]").forEach(d=>d.addEventListener("click",()=>{!i||!b||jt(i,e)})),e.querySelectorAll("[data-open-dice]").forEach(d=>d.addEventListener("click",()=>{Na(d.dataset.openDice)})),e.querySelectorAll("[data-saving-throw-card]").forEach(d=>d.addEventListener("click",()=>{var M,x,C;if(!i)return;const p=d.dataset.savingThrowCard;if(!p)return;const f=Ke(i),g=f.find(L=>L.value===p);g&&$e({title:`Tiro salvezza • ${g.shortLabel||g.label}`,mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:f,value:g.value},allowInspiration:!!((M=i==null?void 0:i.data)!=null&&M.inspiration)&&b,weakPoints:Number((C=(x=i==null?void 0:i.data)==null?void 0:x.hp)==null?void 0:C.weak_points)||0,characterId:i.id})})),e.querySelectorAll("[data-skill-card]").forEach(d=>d.addEventListener("click",()=>{var M,x,C;if(!i)return;const p=d.dataset.skillCard;if(!p)return;const f=Aa(i,$||[]),g=f.find(L=>L.value===p);g&&$e({title:`Tiro abilità • ${g.shortLabel||g.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità",options:f,value:g.value},allowInspiration:!!((M=i==null?void 0:i.data)!=null&&M.inspiration)&&b,weakPoints:Number((C=(x=i==null?void 0:i.data)==null?void 0:x.hp)==null?void 0:C.weak_points)||0,characterId:i.id})})),e.querySelectorAll("[data-special-skill-card]").forEach(d=>d.addEventListener("click",()=>{var M,x,C;if(!i)return;const p=d.dataset.specialSkillCard;if(!p)return;const f=Ea(i,$||[]),g=f.find(L=>L.value===p);g&&$e({title:`Tiro abilità speciale • ${g.shortLabel||g.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità speciale",options:f,value:g.value},allowInspiration:!!((M=i==null?void 0:i.data)!=null&&M.inspiration)&&b,weakPoints:Number((C=(x=i==null?void 0:i.data)==null?void 0:x.hp)==null?void 0:C.weak_points)||0,characterId:i.id})})),e.querySelectorAll("[data-edit-resource]").forEach(d=>d.addEventListener("click",()=>{const p=T.find(f=>f.id===d.dataset.editResource);p&&Ze(i,()=>D(e),p)})),e.querySelectorAll("[data-roll-hit-dice]").forEach(d=>d.addEventListener("click",async()=>{await ps(i,e)})),e.querySelectorAll("[data-roll-attack]").forEach(d=>d.addEventListener("click",p=>{p.target.closest("button")||ds(d.dataset.rollAttack)})),e.querySelectorAll("[data-cycle-weapon-mode]").forEach(d=>d.addEventListener("click",()=>{if(!i)return;const p=d.dataset.cycleWeaponMode,f=$==null?void 0:$.find(L=>String(L.id)===p||L.name===p);if(!f)return;const g=pa(f).filter(L=>L.damageDie);if(g.length<=1)return;const M=f.selected_damage_mode||g[0].id,x=Math.max(g.findIndex(L=>L.id===M),0),C=g[(x+1)%g.length];Ce(f.id,{selected_damage_mode:C.id}).then(L=>{const R=(se().cache.items||$||[]).map(V=>String(V.id)===String(f.id)?{...V,...L||{},selected_damage_mode:C.id}:V);return me("items",R),he({items:R})}).then(()=>{w(`Modalità ${C.label}`),D(e)}).catch(()=>w("Errore cambio modalità arma","error"))})),e.querySelectorAll("[data-roll-damage]").forEach(d=>d.addEventListener("click",()=>{var L,R,V,Q;if(!i)return;const p=d.dataset.rollDamage;if(!p)return;if(p.startsWith("wildshape:")){const F=Number(p.replace("wildshape:",""))||0,P=De(i,q),K=(L=P==null?void 0:P.statBlock.attacks)==null?void 0:L[F],ne=String((K==null?void 0:K.damage)||"").trim();if(!ne||ne==="-"){w("Danni non configurati per questo attacco","error");return}ge({keepOpen:!0,title:`${P.companion.name} · Danni ${K.name||"Attacco"}`,mode:"generic",notation:ne,modifier:Number(K.damage_modifier)||0,rollType:"DMG",characterId:i==null?void 0:i.id,historyLabel:`${P.companion.name} · ${K.name||"Danni"}`});return}if(p.startsWith("spell:")){const F=p.replace("spell:",""),K=(Array.isArray((R=i.data)==null?void 0:R.spells)?i.data.spells:[]).find(oe=>oe.id===F);if(!K)return;const ne=Number(K.cast_level??K.level)||0,Z=je(K,ne);if(!Z){w("Danno non calcolabile per questo trucchetto.","error");return}ge({keepOpen:!0,title:Z.title,mode:"generic",notation:Z.notation,modifier:Z.modifier,rollType:"DMG",characterId:i==null?void 0:i.id,historyLabel:K.name||null,sneakAttackDice:((V=i==null?void 0:i.data)==null?void 0:V.sneak_attack_dice)||null});return}const f=p.startsWith("weapon:")?p.split(":"):[null,p,"default"],g=f[1]||p,M=f[2]||"default",x=$==null?void 0:$.find(F=>String(F.id)===g||F.name===g);if(!x)return;const C=rt(i,x,M);if(!C){w("Danno non calcolabile per questa arma.","error");return}ge({keepOpen:!0,title:C.title,mode:"generic",notation:C.notation,modifier:C.modifier,rollType:"DMG",characterId:i==null?void 0:i.id,historyLabel:x.name||null,sneakAttackDice:((Q=i==null?void 0:i.data)==null?void 0:Q.sneak_attack_dice)||null})}));const J=d=>{var g;const p=(g=d==null?void 0:d.damage_dice_notation)==null?void 0:g.trim();if(!p)return;const f=ct(p);if(!(f!=null&&f.notation)){w("Notazione dado non valida per questa risorsa","error");return}ge({keepOpen:!0,title:d.name||"Tiro abilità",mode:"generic",notation:f.notation,modifier:Number(d.damage_modifier)||0,rollType:"GEN",characterId:i==null?void 0:i.id,historyLabel:d.name||null})},re=async d=>{const p=Number(d.max_uses)||0;if(!(!p||d.used>=p))try{await Ie(d.id,{used:Math.min(d.used+1,p)}),w("Risorsa usata"),oa(i)&&J(d),D(e)}catch{w("Errore utilizzo risorsa","error")}};e.querySelectorAll("[data-resource-card]").forEach(d=>{const p=async f=>{if(f.target.closest("button"))return;const g=T.find(M=>M.id===d.dataset.resourceCard);g&&_t(g,{onUse:()=>re(g),onReset:async()=>{try{await Ie(g.id,{used:0}),w("Risorsa ripristinata"),D(e)}catch{w("Errore ripristino risorsa","error")}},onRecover:async()=>{try{await Ie(g.id,{used:Math.max((Number(g.used)||0)-1,0)}),w("Carica recuperata"),D(e)}catch{w("Errore recupero carica","error")}}})};d.addEventListener("click",p)}),e.querySelectorAll("[data-use-resource]").forEach(d=>d.addEventListener("click",async()=>{const p=T.find(f=>f.id===d.dataset.useResource);p&&await re(p)})),e.querySelectorAll("[data-use-spell]").forEach(d=>d.addEventListener("click",async()=>{var V,Q;if(!i)return;const p=d.dataset.useSpell;if(!p)return;const g=(Array.isArray((V=i.data)==null?void 0:V.spells)?i.data.spells:[]).find(F=>F.id===p);if(!g||(Number(g.level)||0)<1)return;const x=await Kt(i,g);if(!x||!await aa(i,x,()=>D(e)))return;const L=se().characters.find(F=>pe(F.id)===pe(i.id))||i;if(g.concentration){const F=L.data||{};F.concentration_active||await ae(L,{...F,concentration_active:!0},"Concentrazione attiva",()=>D(e))}if(!oa(L)){D(e);return}const R=je(g,x);if(!R){w("Danno non calcolabile per questo incantesimo.","error");return}ge({keepOpen:!0,title:R.title,mode:"generic",notation:R.notation,modifier:R.modifier,rollType:"DMG",characterId:i.id,historyLabel:g.name||null,sneakAttackDice:((Q=i==null?void 0:i.data)==null?void 0:Q.sneak_attack_dice)||null})})),e.querySelectorAll("[data-consume-spell-slot]").forEach(d=>d.addEventListener("click",async()=>{if(!i)return;const p=Number(d.dataset.consumeSpellSlot);!Number.isFinite(p)||p<1||await aa(i,p,()=>D(e))})),e.querySelectorAll("[data-restore-spell-slot]").forEach(d=>d.addEventListener("click",async()=>{if(!i)return;const p=Number(d.dataset.restoreSpellSlot);!Number.isFinite(p)||p<1||await yt(i,p,()=>D(e))})),e.querySelectorAll("[data-delete-resource]").forEach(d=>d.addEventListener("click",async()=>{const p=T.find(g=>g.id===d.dataset.deleteResource);if(!(!p||!await Fe({title:"Conferma eliminazione risorsa",message:`Stai per eliminare la risorsa "${p.name}". Questa azione non può essere annullata.`,confirmLabel:"Elimina"})))try{await Ta(p.id),w("Risorsa eliminata"),D(e)}catch{w("Errore eliminazione risorsa","error")}})),e.querySelectorAll("[data-death-save]").forEach(d=>d.addEventListener("click",async()=>{if(!i||!b)return;const{deathSave:p,deathSaveIndex:f}=d.dataset,g=Number(f);if(!p||!g)return;const M=i.data||{},x=M.death_saves||{},C=Math.max(0,Math.min(3,Number(x[p])||0)),L=g===C?C-1:g,R={successes:Math.max(0,Math.min(3,p==="successes"?L:Number(x.successes)||0)),failures:Math.max(0,Math.min(3,p==="failures"?L:Number(x.failures)||0))};await ae(i,{...M,death_saves:R},"Tiri salvezza contro morte aggiornati",()=>D(e))})),e.querySelectorAll("[data-weakness-level]").forEach(d=>d.addEventListener("click",async()=>{if(!i||!b)return;const p=Number(d.dataset.weaknessLevel);if(!p)return;const f=i.data||{},g=f.hp||{},M=Math.max(0,Math.min(6,Number(g.weak_points)||0));await ae(i,{...f,hp:{...g,weak_points:p===M?0:p}},"Punti indebolimento aggiornati",()=>D(e))}));const Y=e.querySelector(".character-avatar");Y&&(Y.setAttribute("draggable","false"),Y.addEventListener("click",d=>{d.preventDefault(),$t(i)}),Y.addEventListener("contextmenu",d=>{d.preventDefault()}),Y.addEventListener("dragstart",d=>{d.preventDefault()})),e.querySelectorAll("[data-item-image]").forEach(d=>{d.setAttribute("draggable","false"),d.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation();const f=$==null?void 0:$.find(g=>String(g.id)===d.dataset.itemImage);f&&Ge(f)})}),e.querySelectorAll("[data-item-preview]").forEach(d=>{d.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation();const f=$==null?void 0:$.find(g=>String(g.id)===d.dataset.itemPreview);f&&Ge(f)})}),Ht(e,a)}finally{Qe(!1)}}function Ss(){ga()}function ga(){ia||(document.addEventListener("click",async e=>{if(!e.target.closest("[data-actions-fab]"))return;const t=e.target.closest("[data-hp-action]"),s=e.target.closest("[data-money-action]"),n=e.target.closest("[data-rest]"),o=e.target.closest("[data-open-dice]"),r=e.target.closest("[data-add-loot]"),l=e.target.closest("[data-edit-conditions]"),c=e.target.closest("[data-edit-resistances]"),u=e.target.closest("[data-edit-roll-adjustments]");if(!t&&!s&&!n&&!o&&!r&&!l&&!c&&!u)return;e.preventDefault(),Gt();const m=Te??null;if(t){await ms(t.dataset.hpAction,m);return}if(s){if((window.location.hash.replace("#/","")||"home")==="inventory")return;await ss(s.dataset.moneyAction,m);return}if(n){await us(n.dataset.rest,m);return}if(o){Na(o.dataset.openDice);return}if(r){await ts();return}if(l){await va(m);return}if(c){await as(m);return}u&&await Jt(m)}),ia=!0)}function Gt(){const e=document.querySelector("[data-actions-fab]"),a=document.querySelector("[data-actions-toggle]");!e||!e.classList.contains("is-open")||(e.classList.remove("is-open"),a==null||a.setAttribute("aria-expanded","false"))}function le(){const e=se(),{user:a,offline:t,characters:s,activeCharacterId:n}=e,o=pe(n),r=s.find(u=>pe(u.id)===o),l=e.cache.companions||[],c=Ve(r,l);return{activeCharacter:r,sheetCharacter:c,companions:l,canEditCharacter:!!a&&!t}}async function va(e){const{activeCharacter:a,canEditCharacter:t}=le();if(!a||!t)return;const s=await pt(a);if(!s)return;const n=s.getAll("conditions");await ae(a,{...a.data,conditions:n},"Condizioni aggiornate",()=>{e&&D(e)})}function Qt(e){var t;const a=((t=e==null?void 0:e.data)==null?void 0:t.roll_adjustments)||{};return{attack_rolls:a.attack_rolls||{},saving_throws:a.saving_throws||{},skills:a.skills||{}}}function Xt(e){const a=Qt(e),t=se().cache.items||[],s=document.createElement("div");s.className="modal-form-grid compact-settings-form compact-settings-form--rolls";const n=[{value:"",label:"Nessuno"},{value:"advantage",label:"Vantaggio"},{value:"disadvantage",label:"Svantaggio"}],o=(r,l,c)=>{const u=document.createElement("section");u.className="character-edit-section compact-settings-section",u.innerHTML=`<h4>${r}</h4><p class="muted compact-settings-help">Indica solo gli override manuali; gli effetti automatici restano visibili sotto la riga.</p>`;const m=document.createElement("div");m.className="compact-setting-grid compact-setting-grid--roll",c.forEach(S=>{var k;const A=((k=a[l])==null?void 0:k[S.key])||{},i=Sa(e,t,l,S),E=ce(i).rollMode||"",y=i.length===1&&i[0].source||"",b=A.mode||E,T=A.source||y,$=document.createElement("div");$.className="compact-setting-row compact-setting-row--roll";const q=document.createElement("label");q.className="field compact-setting-field";const h=document.createElement("span");h.textContent=S.label;const B=Re(n,b);B.name=`roll_${l}_${S.key}_mode`,q.append(h,B);const j=document.createElement("label");j.className="field compact-setting-field";const _=document.createElement("span");_.textContent="Fonte manuale";const N=Re(ha,T);if(N.name=`roll_${l}_${S.key}_source`,j.append(_,N),$.append(q,j),i.length){const v=document.createElement("p");v.className="muted compact-setting-note",v.textContent=`Automatico: ${i.map(z=>z.reason).join(" ")}`,$.appendChild(v)}m.appendChild($)}),u.appendChild(m),s.appendChild(u)};return o("Tiri per colpire","attack_rolls",ya(e,t)),o("Tiri salvezza","saving_throws",Be),o("Abilità","skills",ze),s}function Yt(e,a){const t=se().cache.items||[],s={attack_rolls:{},saving_throws:{},skills:{}};return[{scope:"attack_rolls",entries:ya(a,t)},{scope:"saving_throws",entries:Be},{scope:"skills",entries:ze}].forEach(({scope:n,entries:o})=>{o.forEach(r=>{var i,E;const l=((i=e.get(`roll_${n}_${r.key}_mode`))==null?void 0:i.toString())||"",c=((E=e.get(`roll_${n}_${r.key}_source`))==null?void 0:E.toString().trim())||"",u=Sa(a,t,n,r),m=ce(u).rollMode||"",S=u.length===1&&u[0].source||"";(l==="advantage"||l==="disadvantage")&&!(l===m&&c===S)&&(s[n][r.key]={mode:l,source:c})})}),s}async function Jt(e){const{activeCharacter:a,canEditCharacter:t}=le();if(!a||!t)return;const s=await ue({title:"Vantaggi / Svantaggi situazionali",submitLabel:"Salva",content:Xt(a),cardClass:"modal-card--wide"});s&&await ae(a,{...a.data,roll_adjustments:Yt(s,a)},"Vantaggi/svantaggi aggiornati",()=>{e&&D(e)})}function Zt(e){var n;const a=((n=e==null?void 0:e.data)==null?void 0:n.damage_defenses)||{},t=ke.reduce((o,r)=>{const l=r.group||"Altro";return o[l]||(o[l]=[]),o[l].push(r),o},{}),s=document.createElement("div");return s.className="modal-form-grid compact-settings-form compact-settings-form--defenses",s.innerHTML=Object.entries(t).map(([o,r])=>`
    <section class="character-edit-section compact-settings-section">
      <h4>${o}</h4>
      <div class="compact-setting-grid compact-setting-grid--defense">
        ${r.map(l=>`
          <div class="compact-setting-row compact-setting-row--defense">
            <strong>${l.label}</strong>
            <div class="character-toggle-group">
              <label class="toggle-pill">
                <input type="checkbox" name="damage_resistance_${l.key}" ${Array.isArray(a.resistances)&&a.resistances.includes(l.key)?"checked":""} />
                <span>Resistenza</span>
              </label>
              <label class="toggle-pill">
                <input type="checkbox" name="damage_immunity_${l.key}" ${Array.isArray(a.immunities)&&a.immunities.includes(l.key)?"checked":""} />
                <span>Immunità</span>
              </label>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `).join(""),s}function es(e){return{resistances:ke.filter(a=>e.has(`damage_resistance_${a.key}`)).map(a=>a.key),immunities:ke.filter(a=>e.has(`damage_immunity_${a.key}`)).map(a=>a.key)}}async function as(e){const{activeCharacter:a,canEditCharacter:t}=le();if(!a||!t)return;const s=await ue({title:"Resistenze & Immunità",submitLabel:"Salva",content:Zt(a),cardClass:"modal-card--wide"});s&&await ae(a,{...a.data,damage_defenses:es(s)},"Resistenze aggiornate",()=>{e&&D(e)})}async function ts(e){const{activeCharacter:a}=le(),t=se();if(!a)return;if(t.offline){w("Loot disponibile solo online.","error");return}const n=ua(a)==="kg"?"0.1":"1",o=await ue({title:"Aggiungi loot rapido",submitLabel:"Aggiungi",content:Qa(n),onOpen:({fieldsEl:r})=>{Ja(r)}});if(o)try{await Ua({user_id:a.user_id,character_id:a.id,name:o.get("name"),qty:Number(o.get("qty")),weight:Number(o.get("weight")),volume:Number(o.get("volume"))||0,value_cp:Number(o.get("value_cp")),category:"loot",equipable:!1,equip_slot:null,equip_slots:[],sovrapponibile:!1,is_magic:!1,max_volume:null}),w("Loot aggiunto")}catch{w("Errore loot","error")}}function He(e,{min:a=null,max:t=null}={}){if(!(e instanceof HTMLInputElement)||e.type!=="number"||e.closest(".modal-value-stepper"))return;const s=document.createElement("div");s.className="number-stepper modal-value-stepper";const n=document.createElement("button");n.type="button",n.className="number-stepper__button modal-value-stepper__button",n.textContent="−",n.setAttribute("aria-label","Diminuisci valore");const o=document.createElement("button");o.type="button",o.className="number-stepper__button modal-value-stepper__button",o.textContent="+",o.setAttribute("aria-label","Aumenta valore");const r=e.parentNode;if(!r)return;r.insertBefore(s,e),s.append(n,e,o);const l=u=>Number.isFinite(u)?u:0,c=u=>{const m=l(e.valueAsNumber),S=Number(e.step),A=Number.isFinite(S)&&S>0?S:1;let i=m+A*u;const E=a??(e.min!==""?Number(e.min):null),y=t??(e.max!==""?Number(e.max):null);Number.isFinite(E)&&(i=Math.max(E,i)),Number.isFinite(y)&&(i=Math.min(y,i)),e.value=String(i),e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))};n.addEventListener("click",()=>c(-1)),o.addEventListener("click",()=>c(1))}async function ss(e,a){const{activeCharacter:t,canEditCharacter:s}=le();if(!t)return;if(!s){w("Azioni denaro disponibili solo con profilo online","error");return}const n=se();let o=n.cache.wallet;if(!o&&!n.offline)try{o=await Pa(t.id),me("wallet",o),o&&await he({wallet:o})}catch{w("Errore caricamento wallet","error")}const c=await ue({title:e==="pay"?"Paga monete":"Ricevi monete",submitLabel:e==="pay"?"Paga":"Ricevi",content:Ha({direction:e}),onOpen:({fieldsEl:y})=>{const b=y==null?void 0:y.querySelector('input[name="amount"]');b&&He(b,{min:0})}});if(!c)return;o||(o={user_id:t.user_id,character_id:t.id,cp:0,sp:0,gp:0,pp:0});const u=c.get("coin"),m=Number(c.get("amount")||0),S={cp:u==="cp"?m:0,sp:u==="sp"?m:0,gp:u==="gp"?m:0,pp:u==="pp"?m:0},A=e==="pay"?-1:1,i=Object.fromEntries(Object.entries(S).map(([y,b])=>[y,b*A])),E=Oa(o,i);try{const y=await Wa({...E,user_id:o.user_id,character_id:o.character_id});await Va({user_id:o.user_id,character_id:o.character_id,direction:e,amount:i,reason:c.get("reason"),occurred_on:c.get("occurred_on")}),me("wallet",y),await he({wallet:y}),w("Wallet aggiornato"),a&&D(a)}catch{w("Errore aggiornamento denaro","error")}}const ns=ca.reduce((e,a)=>(e[a.key]=a.label,e),{}),la={advantage:["invisibile"],disadvantage:["accecato","avvelenato","intralciato","prono","spaventato"]},ra={disadvantage:{dex:["intralciato"]},autoFail:{str:["paralizzato","privo_di_sensi","stordito"],dex:["paralizzato","privo_di_sensi","stordito"]}},ha=[{value:"",label:"Seleziona fonte"},{value:"situational",label:"Situazionale"},{value:"effect",label:"Effetto temporaneo"},{value:"condition",label:"Condizione"},{value:"armor",label:"Armatura"},{value:"racial",label:"Abilità razziale"},{value:"class",label:"Privilegio di classe"},{value:"spell",label:"Incantesimo"},{value:"item",label:"Oggetto magico/equipaggiamento"},{value:"other",label:"Altro"}];function Le(e){const a=(e==null?void 0:e.data)||{};return Array.isArray(a.conditions)?a.conditions:a.condition?[a.condition]:[]}function Se(e){return e.map(a=>ns[a]||a).filter(Boolean)}function _a(e=[]){return(e||[]).some(a=>a.category==="armor"&&a.armor_type==="heavy"&&a.equipable&&fe(a).length)}function ya(e,a=[]){const t=(e==null?void 0:e.data)||{},n=(a||[]).filter(m=>m.category==="weapon"&&m.equipable&&fe(m).length).map(m=>({key:`weapon:${m.id??m.name}`,label:m.name||"Arma"})),r=(Array.isArray(t.spells)?t.spells:[]).filter(m=>(m.kind==="cantrip"||Number(m.level)===0)&&m.attack_roll&&m.damage_die).map(m=>({key:`spell:${m.id}`,label:m.name||"Incantesimo"})),u=!!((t.spellcasting||{}).ability&&X(t.proficiency_bonus)!==null)?[{key:"spell-attack",label:"Incantesimi"}]:[];return[...n,...r,...u]}function Ue(e){const a=Le(e),t=la.advantage.filter(o=>a.includes(o)),s=la.disadvantage.filter(o=>a.includes(o)),n=[];return t.length&&n.push({mode:"advantage",source:"condition",reason:`Vantaggio: condizioni ${Se(t).join(", ")}.`}),s.length&&n.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${Se(s).join(", ")}.`}),n}function $a(e,a,t){const n=Le(e).includes("avvelenato")?["avvelenato"]:[],o=_a(a),r=[];return n.length&&r.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${Se(n).join(", ")}.`}),t.key==="stealth"&&o&&r.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su Furtività."}),r}function is(e,a,t){const n=Le(e).includes("avvelenato")?["avvelenato"]:[],o=_a(a),r=[];return n.length&&r.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${Se(n).join(", ")}.`}),t==="dex"&&o&&r.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su tiri speciali basati su DES."}),r}function ka(e,a){const t=wa(Le(e),a.key);return t.rollMode?[{mode:t.rollMode,source:"condition",reason:t.rollModeReason}]:[]}function Sa(e,a,t,s){return t==="attack_rolls"?Ue(e):t==="skills"?$a(e,a,s):t==="saving_throws"?ka(e,s):[]}function os(e){var a;return((a=ha.find(t=>t.value===e))==null?void 0:a.label)||e}function ye(e,a,t,s){var c,u,m,S;const n=(m=(u=(c=e==null?void 0:e.data)==null?void 0:c.roll_adjustments)==null?void 0:u[a])==null?void 0:m[t];if(!n||n.mode!=="advantage"&&n.mode!=="disadvantage")return null;const o=n.mode==="advantage"?"Vantaggio":"Svantaggio",r=(S=n.source)==null?void 0:S.toString().trim(),l=r?os(r):"Situazionale";return{mode:n.mode,reason:`${o}: ${s} (${l}).`}}function ce(e){const a=e.filter(Boolean),t=a.filter(n=>n.mode==="advantage").map(n=>n.reason).filter(Boolean),s=a.filter(n=>n.mode==="disadvantage").map(n=>n.reason).filter(Boolean);return t.length&&s.length?{rollMode:null,rollModeReason:`Vantaggio e svantaggio si annullano. ${[...t,...s].join(" ")}`}:t.length?{rollMode:"advantage",rollModeReason:t.join(" ")}:s.length?{rollMode:"disadvantage",rollModeReason:s.join(" ")}:{rollMode:null,rollModeReason:null}}function wa(e,a){const s=(ra.autoFail[a]||[]).filter(r=>e.includes(r));if(s.length)return{disabled:!0,disabledReason:`Condizioni: ${Se(s).join(", ")}`};const o=(ra.disadvantage[a]||[]).filter(r=>e.includes(r));return o.length?{rollMode:"disadvantage",rollModeReason:`Svantaggio: condizioni ${Se(o).join(", ")}.`}:{}}function Aa(e,a=[]){const t=e.data||{},s=t.abilities||{},n=X(t.proficiency_bonus),o=t.skills||{},r=t.skill_mastery||{};return ze.map(l=>{const c=!!o[l.key],u=!!r[l.key],m=we(s[l.ability],n,c?u?2:1:0),S=m??0,A=$a(e,a,l);A.push(ye(e,"skills",l.key,l.label));const i=ce(A);return{value:l.key,label:`${l.label} (${U(m)})`,shortLabel:l.label,modifier:S,rollMode:i.rollMode,rollModeReason:i.rollModeReason}})}function Ea(e,a=[]){const t=e.data||{},s=t.abilities||{},n=X(t.proficiency_bonus),o=Array.isArray(t.special_skill_rolls)?t.special_skill_rolls:[];return(o.some(c=>{const u=String((c==null?void 0:c.id)??"").toLowerCase(),m=String((c==null?void 0:c.name)??"").trim().toLowerCase();return u==="initiative"||u==="default_initiative"||m==="iniziativa"})?o:[{id:"default_initiative",name:"Iniziativa",ability:"dex",proficient:!1,mastery:!1,bonus:0},...o]).map((c,u)=>{var q;const m=ie[c.ability]?c.ability:"str",S=!!c.proficient,A=!!c.mastery&&S,i=we(s[m],n,S?A?2:1:0),E=Number(c.bonus)||0,y=(i??0)+E,b=((q=c.name)==null?void 0:q.trim())||`Tiro speciale ${u+1}`,T=is(e,a,m),$=ce(T);return{value:String(c.id??u),label:`${b} (${U(y)})`,shortLabel:b,modifier:y,rollMode:$.rollMode,rollModeReason:$.rollModeReason}})}function Ke(e){const a=e.data||{},t=a.abilities||{},s=X(a.proficiency_bonus),n=a.saving_throws||{},o=Le(e);return Be.map(r=>{const l=!!n[r.key],c=we(t[r.key],s,l?1:0),u=c??0,m=wa(o,r.key),S=ye(e,"saving_throws",r.key,r.label),A=m.disabled?{rollMode:null,rollModeReason:null}:ce([...ka(e,r),S]),i=m.disabled?" · fallimento diretto":"";return{value:r.key,label:`${r.label} (${U(c)})${i}`,shortLabel:ie[r.key]||r.label,modifier:u,rollMode:A.rollMode,rollModeReason:A.rollModeReason,disabled:m.disabled||!1,disabledReason:m.disabledReason||null}})}function La(e,a=[],t=[]){var q;const s=e.data||{},n=Number(s.attack_bonus_melee??s.attack_bonus)||0,o=Number(s.attack_bonus_ranged??s.attack_bonus)||0,r=(a||[]).filter(h=>h.category==="weapon"&&h.equipable&&fe(h).length),l=X(s.proficiency_bonus)??0,c=s.proficiencies||{},u=Ue(e),m=r.map(h=>{var G;const B=h.weapon_range||(h.range_normal?"ranged":"melee"),j=h.attack_ability||(B==="ranged"?"dex":"str"),_=de((G=s.abilities)==null?void 0:G[j])??0,k=(h.weapon_type==="simple"?!!c.weapon_simple:h.weapon_type==="martial"?!!c.weapon_martial:!1)?l:0,v=B==="ranged"?o:n,z=_+k+(Number(h.attack_modifier)||0)+v,I=`weapon:${h.id??h.name}`,O=ce([...u,ye(e,"attack_rolls",I,h.name)]);return{value:I,label:`${h.name} (${U(z)})`,shortLabel:h.name,modifier:z,rollMode:O.rollMode,rollModeReason:O.rollModeReason}}),S=De(e,t);S!=null&&S.statBlock.attacks.length&&S.statBlock.attacks.forEach((h,B)=>{const j=`wildshape:${B}`,_=ce([...u,ye(e,"attack_rolls",j,h.name||`Attacco ${B+1}`)]);m.push({value:j,label:`${h.name||`Attacco ${B+1}`} (${U(h.to_hit||0)})`,shortLabel:h.name||`Attacco ${B+1}`,modifier:Number(h.to_hit)||0,rollMode:_.rollMode,rollModeReason:_.rollModeReason})});const i=(s.spellcasting||{}).ability,E=i?(q=s.abilities)==null?void 0:q[i]:null,y=de(E),b=y===null||l===null?null:y+l,$=(Array.isArray(s.spells)?s.spells:[]).filter(h=>(h.kind==="cantrip"||Number(h.level)===0)&&h.attack_roll&&h.damage_die);return i&&b!==null&&$.forEach(h=>{const B=`spell:${h.id}`,j=ce([...u,ye(e,"attack_rolls",B,h.name)]);m.push({value:B,label:`${h.name} (${U(b)})`,shortLabel:h.name,modifier:b,rollMode:j.rollMode,rollModeReason:j.rollModeReason})}),m}function ls(e){var m;const a=e.data||{},t=X(a.proficiency_bonus),n=(a.spellcasting||{}).ability,o=n?(m=a.abilities)==null?void 0:m[n]:null,r=de(o);if(!n||r===null||t===null)return[];const l=r+t,c="spell-attack",u=ce([...Ue(e),ye(e,"attack_rolls",c,"Incantesimi")]);return[{value:c,label:`Incantesimi (${U(l)})`,shortLabel:"Incantesimi",modifier:l,rollMode:u.rollMode,rollModeReason:u.rollModeReason}]}function Oe(e){var a;return((a=ke.find(t=>t.key===e))==null?void 0:a.label)||e}function rs(e,a,t){var l;const s=Math.max(Number(a)||0,0);if(!t)return{amount:s,reason:null};const n=((l=e==null?void 0:e.data)==null?void 0:l.damage_defenses)||{},o=Array.isArray(n.resistances)?n.resistances:[],r=Array.isArray(n.immunities)?n.immunities:[];return r.includes("all")||r.includes(t)?{amount:0,reason:`immunità a ${Oe(t)}`}:o.includes("all")||o.includes(t)?{amount:Math.floor(s/2),reason:`resistenza a ${Oe(t)}`}:{amount:s,reason:null}}function Ma(e,a){if(!(a!=null&&a.consumes_ammunition))return null;const t=a.required_ammunition_type||a.ammunition_type;return(e||[]).filter(s=>s.id!==a.id).filter(s=>s.category!=="container").filter(s=>!t||s.ammunition_type===t).filter(s=>Number(s.qty)>0).sort((s,n)=>String(s.name||"").localeCompare(String(n.name||""),"it",{sensitivity:"base"}))[0]||null}async function cs(e,a){const t=Ma(e,a);if(!t)return!1;const s=Math.max((Number(t.qty)||0)-1,0),n=await Ce(t.id,{qty:s}),r=(se().cache.items||[]).map(l=>String(l.id)===String(t.id)?{...l,...n||{},qty:s}:l);return me("items",r),await he({items:r}),w(`${t.name} consumato (${s} rimasti)`),!0}function ds(e){var S,A,i;const{activeCharacter:a,sheetCharacter:t,canEditCharacter:s,companions:n}=le();if(!a||!e)return;const o=se().cache.items||[],r=La(t||a,o,n),l=r.find(E=>E.value===e);if(!l)return;const c=e.startsWith("weapon:")?e.replace("weapon:",""):null,u=c?o.find(E=>String(E.id)===c||E.name===c):null;if(u!=null&&u.consumes_ammunition&&!Ma(o,u)){w("Munizioni esaurite o non disponibili per questa arma.","error");return}let m=!1;$e({title:`Tiro per Colpire • ${l.shortLabel||l.label}`,mode:"d20",rollType:"TC",selection:{label:"Attacco",options:r,value:l.value},allowInspiration:!!((S=a==null?void 0:a.data)!=null&&S.inspiration)&&s,weakPoints:Number((i=(A=a==null?void 0:a.data)==null?void 0:A.hp)==null?void 0:i.weak_points)||0,characterId:a.id,historyLabel:l.shortLabel||l.label,onRollComplete:async()=>{if(!(!(u!=null&&u.consumes_ammunition)||m)){m=!0;try{await cs(se().cache.items||o,u)}catch{w("Errore consumo munizioni","error")}}}})}function Na(e){var S,A,i,E,y;const{activeCharacter:a,sheetCharacter:t,companions:s,canEditCharacter:n}=le(),o=se().cache.items||[],r=!!((S=a==null?void 0:a.data)!=null&&S.inspiration)&&n,l=Number((i=(A=a==null?void 0:a.data)==null?void 0:A.hp)==null?void 0:i.weak_points)||0,c=r&&a?async()=>{const b=a.data||{};b.inspiration&&await ae(a,{...b,inspiration:!1},"Ispirazione consumata",Te?()=>D(Te):null)}:null,m={"saving-throws":{title:"Tiro Salvezza",mode:"d20",rollType:"TS",selection:a?{label:"Tiro salvezza",options:Ke(t||a)}:null},skills:{title:"Tiro Abilità",mode:"d20",rollType:"TA",selection:a?{label:"Abilità",options:Aa(t||a,o)}:null},"special-skills":{title:"Tiro Abilità Speciale",mode:"d20",rollType:"TA",selection:a?{label:"Abilità speciale",options:Ea(t||a,o)}:null},"attack-roll":{title:"Tiro per Colpire",mode:"d20",rollType:"TC",selection:a?{label:"Attacco",options:La(t||a,o,s)}:null},"spell-attack":{title:"Tiro per Colpire Incantesimi",mode:"d20",rollType:"TC",selection:a?{label:"Incantesimi",options:ls(a)}:null},roller:{title:"Lancia Dadi generico",mode:"generic",rollType:"GEN"}}[e]??{title:"Lancia dadi",mode:"generic"};if(e==="spell-attack"&&!((y=(E=m.selection)==null?void 0:E.options)!=null&&y.length)){w("Configura abilità da incantatore e bonus competenza per usare questo tiro.","error");return}$e({...m,allowInspiration:r,onConsumeInspiration:c,weakPoints:l,characterId:a==null?void 0:a.id})}async function us(e,a){var n,o;const{activeCharacter:t}=le();if(!(!t||!await Fe({title:"Conferma riposo",message:e==="long_rest"?"Stai per effettuare un riposo lungo: risorse, slot e recuperi verranno aggiornati in base alle regole configurate.":"Stai per effettuare un riposo breve: verranno aggiornate solo le risorse che si recuperano con questo tipo di riposo.",confirmLabel:"Conferma riposo"})))try{await qa(t.id,e),w(e==="long_rest"?"Riposo lungo completato":"Riposo breve completato");const l=await da(t.id);me("resources",l),await he({resources:l});const c=lt(t.data,e);if(c?await ae(t,c,null,a?()=>D(a):null):a&&D(a),e==="long_rest"){const u=se().characters.find(m=>m.id===t.id);(o=(n=u==null?void 0:u.data)==null?void 0:n.spellcasting)!=null&&o.can_prepare&&await ma(u,a?()=>D(a):null)}}catch{w("Errore aggiornamento risorse","error")}}async function ps(e,a){var b,T,$,q,h,B,j,_;const{canEditCharacter:t}=le();if(!e)return;if(!t){w("Azioni HP disponibili solo con profilo online","error");return}const s=((b=e.data)==null?void 0:b.hit_dice)||{},n=Number(s.used)||0,o=Number(s.max)||0,r=Math.max(o-n,0),l=We(s.die);if(!l){w("Configura un dado vita valido","error");return}if(r<=0){w("Nessun dado vita disponibile","error");return}const c=de(($=(T=e.data)==null?void 0:T.abilities)==null?void 0:$.con)??0;let u=1;const S=await ge({keepOpen:!1,title:`Dado vita • ${s.die||`d${l}`}`,mode:"generic",notation:`1d${l}`,modifier:c,rollType:"GEN",characterId:e.id,historyLabel:"Dado vita",genericDiceMax:r,warning:"Attenzione: ogni dado vita lanciato verrà sottratto ai dadi vita disponibili.",onRollComplete:({diceCount:N})=>{u=Math.max(Number(N)||1,1)}}).waitForRoll;if(!S||S<=0)return;if(u>r){w(`Hai solo ${r} dadi vita disponibili`,"error");return}const A=Number((h=(q=e.data)==null?void 0:q.hp)==null?void 0:h.current)||0,i=(j=(B=e.data)==null?void 0:B.hp)==null?void 0:j.max,E=A+Number(S),y=i!=null?Math.min(E,Number(i)):E;await ae(e,{...e.data,hp:{...(_=e.data)==null?void 0:_.hp,current:y},hit_dice:{...s,used:Math.min(n+u,o)}},`PF curati +${S} (${u}d${l})`,()=>{a&&D(a)})}async function ms(e,a){var L,R,V,Q,F,P,K,ne,Z,oe,_e,H,ee;const{activeCharacter:t,companions:s,canEditCharacter:n}=le();if(!t)return;if(!n){w("Azioni HP disponibili solo con profilo online","error");return}const l=await ue({title:e==="heal"?"Cura PF":"Subisci danno",submitLabel:e==="heal"?"Cura":"Danno",content:fs(t,{allowHitDice:!1,allowTempHp:e==="heal",allowMaxOverride:e==="damage"})});if(!l)return;const c=l.has("use_hit_dice"),u=l.has("temp_hp"),m=((L=t.data)==null?void 0:L.hit_dice)||{},S=((R=t.data)==null?void 0:R.abilities)||{},A=Number(m.used)||0,i=Number(m.max)||0,E=We(m.die),y=Math.max(Number(l.get("hit_dice_count"))||1,1);let b=Number(l.get("amount"));const T=b,$=e==="damage"&&((V=l.get("damage_type"))==null?void 0:V.toString())||"";if(e==="heal"&&c){if(!E){w("Configura un dado vita valido","error");return}if(A>=i){w("Nessun dado vita disponibile","error");return}const W=Math.max(i-A,0);if(y>W){w(`Hai solo ${W} dadi vita disponibili`,"error");return}const te=de(S.con)??0,Me=Array.from({length:y},()=>ot(E)).reduce((Ne,xe)=>Ne+xe,0);b=Math.max(Me+te*y,1)}if(!b||b<=0){w("Inserisci un valore valido","error");return}const q=e==="damage"?rs(t,b,$):{amount:b,reason:null};e==="damage"&&(b=q.amount);const h=Number((F=(Q=t.data)==null?void 0:Q.hp)==null?void 0:F.current)||0,B=Number((K=(P=t.data)==null?void 0:P.hp)==null?void 0:K.temp)||0,j=(Z=(ne=t.data)==null?void 0:ne.hp)==null?void 0:Z.max,_=e==="damage"?De(t,s):null,N=l.get("hp_max_override"),k=N===null||N===""?null:Number(N);if(e==="damage"&&k!==null&&(!Number.isFinite(k)||k<=0)){w("Inserisci un massimo PF valido","error");return}let v=h,z=B,I=((oe=t.data)==null?void 0:oe.wild_shape)??null,O=0,G=0;if(e==="heal"&&u)z=B+b;else if(e==="heal")v=h+b;else{const W=Math.min(B,b);z=B-W;let te=b-W;if(_&&te>0){O=Math.min(_.hpCurrent,te);const be=Math.max(_.hpCurrent-O,0);te-=O,I=be>0?{...((_e=t.data)==null?void 0:_e.wild_shape)||{},active_companion_id:_.companion.id,hp_current:be}:null}te>0&&(G=te,v=Math.max(h-te,0))}const J=k??j,re=J!=null?Math.min(v,Number(J)):v,Y=e==="heal"&&c?{...m,used:Math.min(A+y,i)}:m,d=e==="damage"&&$?` ${Oe($).toLowerCase()}`:"",p=e==="damage"&&q.reason?` (da ${T}, ${q.reason})`:"",f=e==="damage"&&O>0?` · forma selvatica -${O}`:"",g=e==="damage"&&G>0?` · PF -${G}`:"",M=e==="heal"?`${u?"HP temporanei +":"PF curati +"}${b}${c?` (${y}d${E})`:""}`:`Danno${d} ${b}${p}${f}${g}`,x=e==="damage"&&Number(b)>0&&!!((H=t.data)!=null&&H.concentration_active),C=async()=>{var Me,Ne,xe;if(a&&D(a),!x)return;const W=Ve(t,s),te=Ke(W||t),be=te.find(xa=>xa.value==="con");!be||be.disabled||$e({title:"Tiro salvezza concentrazione • COS",mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:te,value:be.value},allowInspiration:!!((Me=t==null?void 0:t.data)!=null&&Me.inspiration)&&n,weakPoints:Number((xe=(Ne=t==null?void 0:t.data)==null?void 0:Ne.hp)==null?void 0:xe.weak_points)||0,characterId:t.id,historyLabel:"TS concentrazione"})};await ae(t,{...t.data,hp:{...(ee=t.data)==null?void 0:ee.hp,current:re,temp:z,max:k??j},wild_shape:I,hit_dice:Y},M,C)}function $e({title:e,mode:a,selection:t=null,allowInspiration:s=!1,onConsumeInspiration:n=null,rollType:o=null,weakPoints:r=0,characterId:l=null,historyLabel:c=null,onRollComplete:u=null}){ge({keepOpen:!0,title:e,mode:a,selection:t,allowInspiration:s,onConsumeInspiration:n,rollType:o,weakPoints:r,characterId:l,historyLabel:c,onRollComplete:u})}function fs(e,{allowHitDice:a=!0,allowTempHp:t=!1,allowMaxOverride:s=!1}={}){var j,_,N;const n=(k,v={})=>{const z=k==null?void 0:k.querySelector('input[type="number"]');z&&Za(z,v)},o=document.createElement("div");o.className="modal-form-grid hp-shortcut-fields";const r=qe({label:"Valore",name:"amount",type:"number",value:"1"});r.classList.add("hp-shortcut-fields__amount");const l=r.querySelector("input");l&&He(l,{min:1}),l&&(l.min="1",l.required=!0);const c=document.createElement("div");if(c.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",c.appendChild(r),t){const k=document.createElement("div");k.className="modal-toggle-field",k.innerHTML=`
      <span class="modal-toggle-field__label">HP temporanei</span>
      <label class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="temp_hp" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </label>
    `,c.appendChild(k)}if(o.appendChild(c),!a){if(s){const k=document.createElement("label");k.className="field hp-shortcut-fields__damage-type";const v=document.createElement("span");v.textContent="Tipo di danno";const z=Re([{value:"",label:"Nessun tipo (danno normale)"},...ke.map(G=>({value:G.key,label:G.label}))],"");z.name="damage_type",k.append(v,z),c.appendChild(k);const I=qe({label:"Nuovo massimo PF",name:"hp_max_override",type:"number",value:((_=(j=e==null?void 0:e.data)==null?void 0:j.hp)==null?void 0:_.max)??""});I.classList.add("hp-shortcut-fields__max");const O=I.querySelector("input");O&&(He(O,{min:1}),O.min="1"),c.appendChild(I)}return o}const u=((N=e==null?void 0:e.data)==null?void 0:N.hit_dice)||{},m=Number(u.used)||0,S=Number(u.max)||0,A=Math.max(S-m,0),i=We(u.die),E=A>0&&i,y=document.createElement("div");y.className="modal-toggle-field";const b=u.die?`${u.die}`:"dado vita";y.innerHTML=`
    <span class="modal-toggle-field__label">Usa dado vita (${b}) · rimasti ${A}/${S||"-"}</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="use_hit_dice" ${E?"":"disabled"} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const T=document.createElement("label");T.className="field hit-dice-count hp-shortcut-fields__count",T.innerHTML=`
    <span>Numero dadi vita</span>
    <input type="number" name="hit_dice_count" min="1" max="${A}" value="1" />
  `,n(T,{decrementLabel:"Riduci dadi vita",incrementLabel:"Aumenta dadi vita"});const $=document.createElement("div");if($.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",$.append(y,T),o.appendChild($),!E){const k=document.createElement("p");k.className="muted",k.textContent="Nessun dado vita disponibile o configurato.",o.appendChild(k)}const q=y.querySelector("input"),h=T.querySelector("input");h&&(h.required=!1);const B=()=>{const k=q==null?void 0:q.checked;l&&(l.disabled=!!k,l.required=!k,k?l.value="":l.value||(l.value="1"),h&&(h.disabled=!k,h.required=!!k,k||(h.value="1")))};return q==null||q.addEventListener("change",B),B(),o}export{Ss as bindGlobalFabHandlers,D as renderHome};
