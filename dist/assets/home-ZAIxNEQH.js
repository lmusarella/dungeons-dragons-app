import{s as Ne,a as xe,b as ne,c as na,e as Ea,d as _e,R as ke,u as La,f as ia,g as Ma,h as Be,i as Na}from"./constants-aeYu7nqQ.js";import{c as xa,g as oa,f as Ca,a as qa,b as Ra,d as Ba,e as za,h as Ta,m as Da,i as Ia,u as Fa,j as ja,k as Ha,l as Pa,n as Oa,o as Ae,p as Oe,q as Wa}from"./walletApi-BIy-0P7V.js";import{c as S,o as de,u as pe,a as ge,b as ze,g as te,n as ue,d as Ee,e as Le,s as We,f as Va,h as Ua,i as Ka,j as Ga}from"./index-_fTQz7em.js";import{openDiceOverlay as fe}from"./dice-BsiJC6I5.js";import{o as Ve}from"./characterDrawer-D1azoetx.js";import{n as Q,c as $e,f as U,g as ce,a as Qa,b as Xa,d as Ya,e as me,h as la,s as Ja,i as Za,p as et,j as Ue,k as Te,l as je,r as at,m as tt,o as st,q as nt,t as it}from"./utils-Tv02vTp-.js";import{f as ot}from"./companionsApi-D_ESDEc3.js";import{s as Z,o as ra,a as lt,f as Ke,b as Ge,c as rt,d as ct,e as Qe,g as dt,r as ut,h as pt,i as mt,j as ft,k as Xe,l as bt,m as gt,n as vt}from"./modals-5CnOQjRc.js";function be(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ht(e){const a=e&&typeof e=="object"?e:{};return{abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10,...a.abilities||{}},hp:{current:1,max:1,...a.hp||{}},speeds:{walk:null,fly:null,climb:null,burrow:null,...a.speeds||{}},attacks:Array.isArray(a.attacks)?a.attacks:[]}}function ca(e,a=[]){const t=(e==null?void 0:e.data)||{};if(!t.wild_shape_enabled)return null;const s=t.wild_shape||{};if(!s.active_companion_id)return null;const i=(a||[]).find(d=>String(d.id)===String(s.active_companion_id));if(!i)return null;const o=ht(i.stat_block),l=Math.max(Number(o.hp.max)||Number(o.hp.current)||1,1),r=Math.max(0,Math.min(Number(s.hp_current??o.hp.current??l)||0,l));return{companion:i,statBlock:o,hpCurrent:r,hpMax:l}}function _t(e={}){return[["walk","terra"],["fly","volo"],["climb","scalata"],["burrow","scavare"]].map(([t,s])=>Number(e==null?void 0:e[t])?`${s} ${Number(e[t])} m`:"").filter(Boolean).join(" · ")}function yt(e,a){return e?`
    <div>
      <p>Non hai ancora un personaggio.</p>
      <div class="button-row">
        <button class="primary" data-create-character>Nuovo personaggio</button>
      </div>
    </div>
  `:`<p class="muted">${a?"Modalità offline attiva: crea un personaggio quando torni online.":"Accedi per creare un personaggio."}</p>`}function $t(e,a,t=[],s=[]){const i=e.data||{},o=i.hp||{},l=i.hit_dice||{},r=i.abilities||{},d=ca(e,s),u=d?{...r,str:d.statBlock.abilities.str,dex:d.statBlock.abilities.dex,con:d.statBlock.abilities.con}:r,m=Q(i.proficiency_bonus),k=!!i.inspiration,A=!!i.concentration_active,n=i.initiative??ce(u.dex),E=i.skills||{},_=i.skill_mastery||{},y=Qa(u,m,E,_),z=Q(o.current),$=Q(o.max),q=Q(o.temp),v=i.death_saves||{},D=Math.max(0,Math.min(3,Number(v.successes)||0)),H=Math.max(0,Math.min(3,Number(v.failures)||0)),g=$?Math.min(Math.max(Number(z)/$*100,0),100):0,N=Math.max(0,Number(q)||0),w=Math.max(0,Number($??z??0)),h=N>0,I=h?100:0,F=h?w:1,W=h?N:0,X=$?`${z??"-"}/${$}`:`${z??"-"}`,ae=$?`${Math.round(g)}%`:"-",le=q??"-",Y=Math.max(0,Math.min(6,Number(o.weak_points)||0)),c=Array.isArray(i.conditions)?i.conditions:i.condition?[i.condition]:[],p=na.filter(P=>c.includes(P.key)),f=p.length?p.map(P=>P.label).join(", "):"Nessuna condizione",L=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti delle condizioni">?</summary>
      <div class="info-tooltip__panel">
        ${p.length?`
      <ul class="condition-track__list">
        ${p.map(P=>`<li><strong>${P.label}:</strong> ${P.effect}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun effetto attivo.</p>'}
      </div>
    </details>
  `,x=[{value:1,description:"Svantaggio sulle prove di caratteristica."},{value:2,description:"Velocità dimezzata."},{value:3,description:"Svantaggio sui tiri per colpire e tiri salvezza."},{value:4,description:"Punti ferita massimi dimezzati."},{value:5,description:"Velocità ridotta a 0."},{value:6,description:"Morte."}],C=x.filter(P=>P.value<=Y),R=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti dei punti indebolimento">?</summary>
      <div class="info-tooltip__panel">
        ${C.length?`
      <ul class="weakness-track__list">
        ${C.map(P=>`<li>${P.description}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun indebolimento.</p>'}
      </div>
    </details>
  `,O=`Livello attuale: ${Y}`,G=Xa(i,r,t),B=!!i.darkvision_enabled,j=Q(i.darkvision_range_m),V=B?`${j??18} m`:"No",ee=(s||[]).filter(P=>["familiar","summon","transformation"].includes(P.kind||"familiar")),J=d?Math.min(Math.max(d.hpCurrent/d.hpMax*100,0),100):0,ie=d?_t(d.statBlock.speeds):"",qe=[{key:"str",label:ne.str,value:u.str,wild:!!d},{key:"dex",label:ne.dex,value:u.dex,wild:!!d},{key:"con",label:ne.con,value:u.con,wild:!!d},{key:"int",label:ne.int,value:r.int},{key:"wis",label:ne.wis,value:r.wis},{key:"cha",label:ne.cha,value:r.cha}];return`
    <div class="character-overview">
      <div class="character-summary">
        <div class="character-hero">
          ${i.avatar_url?`<img class="character-avatar" src="${i.avatar_url}" alt="Ritratto di ${e.name}" />`:""}
          <div>
            <h3 class="character-name">${e.name}</h3>
            <div class="character-meta">
              <span class="meta-tag">Livello ${i.level??"-"}</span>
              <span class="meta-tag">Razza ${i.race??"-"}</span>
              <span class="meta-tag">Classe ${i.class_name??i.class_archetype??"-"}</span>
              <span class="meta-tag">Archetipo ${i.archetype??"-"}</span>
              <span class="meta-tag">Allineamento ${i.alignment??"-"}</span>
              <span class="meta-tag">Background ${i.background??"-"}</span>
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
              aria-pressed="${k}"
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
          ${i.wild_shape_enabled?`
            <button class="ghost-button wild-shape-button" type="button" data-open-wild-shape ${a&&ee.length?"":"disabled"}>
              ${d?"Cambia forma":"Forma selvatica"}
            </button>
          `:""}
        </div>
      </div>
      <div class="stat-panel">     
        <div class="stat-grid stat-grid--compact stat-grid--abilities">
          ${qe.map(P=>{const se=Q(P.value),K=se===null?"-":Za(se);return`
            <div class="stat-card stat-card--${P.key} ${P.wild?"stat-card--wild-shape":""}">
              <span>${P.label}${P.wild?" <small>forma</small>":""}</span>
              <strong>${se??"-"}</strong>
              <span class="stat-card__modifier" aria-label="Modificatore ${P.label}">${K}</span>
            </div>
          `}).join("")}
        </div>
      </div>
      <div class="hp-panel">
        <div class="hp-bar-row">
          <div class="armor-class-card">
            <span>CA</span>
            <strong>${G??"-"}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">🛡️</span>
          </div>
          <div class="armor-class-card armor-class-card--initiative">
            <span>Iniz</span>
            <strong>${U(Q(n))}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">⚡</span>
          </div>
          <div class="armor-class-card armor-class-card--speed">
            <span>Vel</span>
            <strong>${i.speed??"-"}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">🏃</span>
          </div>
          <div class="hp-bar-stack">
            <div class="hp-bar-label">
              <span>HP</span>
              <strong>${X}</strong>
              <span class="hp-bar-label__percent" aria-label="Percentuale vita ${ae}">${ae}</span>
              <span class="hp-bar-label__divider" aria-hidden="true">•</span>
              <span class="hp-bar-label__temp-group ${h?"is-active":""}">
                <span class="hp-bar-label__temp">HP temporanei</span>
                <strong>${le}</strong>
              </span>
            </div>
            <div class="hp-bar-track">
              <div class="hp-bar" style="flex: ${F};">
                <div class="hp-bar__fill" style="width: ${g}%;"></div>
              </div>
              ${h?`
              <div class="hp-bar hp-bar--temp is-active" style="flex: ${W};">
                <div class="hp-bar__fill hp-bar__fill--temp" style="width: ${I}%;"></div>
              </div>
              `:""}
            </div>
            ${d?`
            <div class="hp-bar-label hp-bar-label--wild-shape">
              <span>HP forma selvatica</span>
              <strong>${d.hpCurrent}/${d.hpMax}</strong>
              <span class="hp-bar-label__percent">${Math.round(J)}%</span>
              <span class="hp-bar-label__divider" aria-hidden="true">•</span>
              <span>${be(d.companion.name)}</span>
              ${ie?`<span class="muted">${be(ie)}</span>`:""}
            </div>
            <div class="hp-bar-track hp-bar-track--wild-shape">
              <div class="hp-bar hp-bar--wild-shape">
                <div class="hp-bar__fill hp-bar__fill--wild-shape" style="width: ${J}%;"></div>
              </div>
              <div class="wild-shape-hp-actions">
                <button class="icon-button" type="button" data-wild-shape-hp-delta="-1" ${a?"":"disabled"} aria-label="Riduci HP forma selvatica">−</button>
                <button class="icon-button" type="button" data-wild-shape-hp-delta="1" ${a?"":"disabled"} aria-label="Aumenta HP forma selvatica">+</button>
                <button class="ghost-button ghost-button--compact" type="button" data-end-wild-shape ${a?"":"disabled"}>Termina</button>
              </div>
            </div>
            `:i.wild_shape_enabled?`
            <div class="wild-shape-empty">
              <span>Forma selvatica pronta</span>
              <button class="ghost-button ghost-button--compact" type="button" data-open-wild-shape ${a&&ee.length?"":"disabled"}>
                Scegli forma (${ee.length})
              </button>
            </div>
            `:""}
            <div class="hp-panel-hit-dice">
              <span>Dadi vita</span>
              <strong>${Ya(l)}</strong>
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
            <strong>${y??"-"}</strong>
          </div>
          <div class="stat-chip stat-chip--highlight stat-chip--darkvision">
            <span>Scurovisione</span>
            <strong>${V}</strong>
          </div>
          <div class="hp-panel-status-row">
            <div class="weakness-track">
              <div class="track-label-row">
                <span class="weakness-track__label">Punti indebolimento</span>
                ${R}
              </div>
              <div class="weakness-track__group" role="radiogroup" aria-label="Livelli indebolimento">
                ${x.map(P=>{const se=P.value===Y;return`
                  <button
                    class="death-save-dot ${se?"is-filled":""}"
                    type="button"
                    role="radio"
                    aria-checked="${se}"
                    data-weakness-level="${P.value}"
                    aria-label="Livello ${P.value}: ${P.description}"
                  >
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="weakness-track__description">${O}</div>
            </div>
            <div class="condition-track">
              <div class="track-label-row">
                <span class="condition-track__label">Condizioni</span>
                ${L}
              </div>
              <div class="condition-track__row">
                <span class="condition-track__value">${f}</span>
              </div>
            </div>
            <div class="death-saves">
              <span class="death-saves__label">TS morte</span>
              <div class="death-saves__group" aria-label="Successi">
                <span class="death-saves__tag">✓</span>
                ${Array.from({length:3},(P,se)=>{const K=se+1;return`
                  <button class="death-save-dot ${K<=D?"is-filled":""}" type="button" data-death-save="successes" data-death-save-index="${K}" aria-label="Successi ${K}">
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="death-saves__group" aria-label="Fallimenti">
                <span class="death-saves__tag">✗</span>
                ${Array.from({length:3},(P,se)=>{const K=se+1;return`
                  <button class="death-save-dot ${K<=H?"is-filled":""}" type="button" data-death-save="failures" data-death-save-index="${K}" aria-label="Fallimenti ${K}">
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
        ${Et(e,t,a)}
      </div>
    </div>
  `}function kt(e){const a=e.data||{},t=a.abilities||{},s=Q(a.proficiency_bonus),i=a.skills||{},o=a.skill_mastery||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${xe.map(l=>{const r=!!i[l.key],d=!!o[l.key],u=$e(t[l.ability],s,r?d?2:1:0);return`
          <button class="modifier-card modifier-card--interactive ${d?"modifier-card--mastery":r?"modifier-card--proficiency":""}" type="button" data-skill-card="${l.key}" aria-label="Tira abilità ${l.label}">
            <div>
              <div class="modifier-title">
                <strong>${l.label}</strong>
                <span class="modifier-ability modifier-ability--${l.ability}">${ne[l.ability]}</span>
              </div>
            </div>
            <div class="modifier-value">${U(u)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function wt(e){const a=Array.isArray(e.special_skill_rolls)?e.special_skill_rolls:[];return a.some(i=>{const o=String((i==null?void 0:i.id)??"").toLowerCase(),l=String((i==null?void 0:i.name)??"").trim().toLowerCase();return o==="initiative"||o==="default_initiative"||l==="iniziativa"})?a:[{id:"default_initiative",name:"Iniziativa",ability:"dex",proficient:!1,mastery:!1,bonus:0},...a]}function St(e){const a=e.data||{},t=a.abilities||{},s=Q(a.proficiency_bonus);return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${wt(a).map((o,l)=>{var _;const r=ne[o.ability]?o.ability:"str",d=!!o.proficient,u=!!o.mastery&&d,m=$e(t[r],s,d?u?2:1:0),k=Number(o.bonus)||0,A=(m??0)+k,n=u?"modifier-card--mastery":d?"modifier-card--proficiency":"",E=((_=o.name)==null?void 0:_.trim())||`Tiro speciale ${l+1}`;return`
          <button class="modifier-card modifier-card--interactive ${n}" type="button" data-special-skill-card="${o.id??l}" aria-label="Tira abilità speciale ${E}">
            <div>
              <div class="modifier-title">
                <strong>${E}</strong>
                <span class="modifier-ability modifier-ability--${r}">${ne[r]}</span>
              </div>
            </div>
            <div class="modifier-value">${U(A)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function At(e){const a=e.data||{},t=a.abilities||{},s=Q(a.proficiency_bonus),i=a.saving_throws||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Ne.map(o=>{const l=!!i[o.key],r=$e(t[o.key],s,l?1:0);return`
          <button class="modifier-card modifier-card--interactive ${l?"modifier-card--proficiency":""}" type="button" data-saving-throw-card="${o.key}" aria-label="Tira salvezza ${o.label}">
            <div>
              <div class="modifier-title">
                <strong>${o.label}</strong>
              </div>
            </div>
            <div class="modifier-value">${U(r)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function Ye(e,a){const s=(Array.isArray(e==null?void 0:e[a])?e[a]:[]).map(i=>{var o;return((o=_e.find(l=>l.key===i))==null?void 0:o.label)||i}).filter(Boolean);return s.length?`<div class="tag-row">${s.map(i=>`<span class="chip chip--defense">${i}</span>`).join("")}</div>`:'<p class="muted">Nessuna voce configurata.</p>'}function Et(e,a=[],t=!1){const s=e.data||{},i=s.proficiencies||{},o=s.proficiency_notes||"",{tools:l,languages:r}=et(o),d=s.language_proficiencies||"",u=Ue(d),m=s.talents||"",k=Ue(m),A=s.damage_defenses||{},E=[...u,...r].reduce((y,z)=>{const $=z.trim();if(!$)return y;const q=$.toLowerCase();return y.seen.has(q)||(y.seen.add(q),y.values.push($)),y},{values:[],seen:new Set}).values,_=Ea.filter(y=>i[y.key]).map(y=>y.label);return`
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
          ${_.length?`<div class="tag-row">${_.map(y=>`<span class="chip">${y}</span>`).join("")}</div>`:'<p class="muted">Nessuna competenza equipaggiamento.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="tools">
          ${l.length?`<div class="tag-row">${l.map(y=>`<span class="chip">${y}</span>`).join("")}</div>`:'<p class="muted">Aggiungi strumenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="languages">
          ${E.length?`<div class="tag-row">${E.map(y=>`<span class="chip">${y}</span>`).join("")}</div>`:'<p class="muted">Aggiungi lingue conosciute nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="talents">
          ${k.length?`<div class="tag-row">${k.map(y=>`<span class="chip">${y}</span>`).join("")}</div>`:'<p class="muted">Aggiungi talenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="defenses">
          <div class="defense-summary-grid">
            <div class="defense-summary-card">
              <span>Resistenze</span>
              ${Ye(A,"resistances")}
            </div>
            <div class="defense-summary-card">
              <span>Immunità</span>
              ${Ye(A,"immunities")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function Lt(e,a=[],t=!1){const s=(a||[]).filter(r=>me(r).length),i=(a||[]).filter(r=>r.attunement_active).length,o=xa(a),l=oa(e);return`
    <section class="card home-card home-section home-scroll-panel">
      <header class="card-header">
        <div>
          <p class="eyebrow">Gestione Equipaggiamento</p>
          <div class="pill-row">
            <span class="pill pill--accent">Oggetti in sintonia: ${i}</span>
            <span class="pill">Carico totale: ${Ca(o,l)}</span>
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
            ${s.map(r=>{const d=qa(r);return`
              <li class="modifier-card attack-card resource-card inventory-item-card">
                <div class="resource-card__badges">
                  ${r.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${d.magic}</span>`:""}
                  ${r.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${d.attunement}</span>`:""}
                </div>
                <div class="attack-card__body resource-card__body">
                  <div class="resource-card__title item-info">
                    ${r.image_url?`<img class="item-avatar" src="${r.image_url}" alt="Foto di ${r.name}" data-item-image="${r.id}" />`:""}
                    <div class="item-info-body">
                      <div class="item-info-line">
                        <button class="item-name-button attack-card__name-button" type="button" data-item-preview="${r.id}" aria-label="Apri anteprima ${r.name}">${r.name}</button>
                        <span class="muted item-meta">
                          ${Ra(r.category)} · ${Ba(me(r))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ${t?`
                  <div class="resource-card-actions">
                    <button class="resource-action-button" type="button" data-unequip="${r.id}">Rimuovi</button>
                  </div>
                `:""}
              </li>
            `}).join("")}
          </ul>
        `:'<p class="muted">Nessun oggetto equipaggiato.</p>'}
    </section>
  `}function Mt(e,a=[],t=[]){var H;const s=e.data||{},i=Number(s.attack_bonus_melee??s.attack_bonus)||0,o=Number(s.attack_bonus_ranged??s.attack_bonus)||0,l=Number(s.damage_bonus_melee??s.damage_bonus)||0,r=Number(s.damage_bonus_ranged??s.damage_bonus)||0,d=Number(s.extra_attacks)||0,u=a.filter(g=>g.category==="weapon"&&g.equipable&&me(g).length),m=ca(e,t),A=(s.spellcasting||{}).ability,n=A?(H=s.abilities)==null?void 0:H[A]:null,E=ce(n),_=Q(s.proficiency_bonus),y=E===null||_===null?null:E+_,$=(Array.isArray(s.spells)?s.spells:[]).filter(g=>(g.kind==="cantrip"||Number(g.level)===0)&&g.attack_roll&&g.damage_die),q=$.length&&y!==null&&A;if(!u.length&&!q&&!(m!=null&&m.statBlock.attacks.length))return'<p class="muted">Nessuna arma equipaggiata.</p>';const v=[];d>0&&v.push(`Attacco Extra (${d})`),i&&v.push(`Mischia attacco ${U(i)}`),l&&v.push(`Mischia danni ${U(l)}`),o&&v.push(`Distanza attacco ${U(o)}`),r&&v.push(`Distanza danni ${U(r)}`);const D=v.length?`<div class="tag-row">${v.map(g=>`<span class="chip">${g}</span>`).join("")}</div>`:"";return`
    ${m?`<div class="tag-row"><span class="chip chip--wild-shape">Forma selvatica: ${be(m.companion.name)}</span><span class="chip">FOR/DES/COS sostituite</span></div>`:""}
    ${D}
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${m!=null&&m.statBlock.attacks.length?m.statBlock.attacks.map((g,N)=>{const w=g.name||`Attacco ${N+1}`,h=Number(g.damage_modifier)||0,I=`${g.damage||"-"}${h?` ${U(h)}`:""}`;return`
          <div class="modifier-card attack-card attack-card--wild-shape" data-roll-attack="wildshape:${N}">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${be(w)}</strong>
                <span class="modifier-ability modifier-ability--str">Forma</span>
                <span class="attack-card__hit">${U(g.to_hit||0)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${be(I)}</span>
                <span class="muted">${be(m.companion.name)}</span>
              </div>
            </div>
            <div class="attack-card__actions">
              <button class="icon-button icon-button--fire" data-roll-damage="wildshape:${N}" aria-label="Calcola danni ${be(w)}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          </div>
        `}).join(""):""}
        ${u.map(g=>{var se;const N=g.weapon_range||(g.range_normal?"ranged":"melee"),w=g.attack_ability||(N==="ranged"?"dex":"str"),h=ce((se=s.abilities)==null?void 0:se[w])??0,I=s.proficiencies||{},W=(g.weapon_type==="simple"?!!I.weapon_simple:g.weapon_type==="martial"?!!I.weapon_martial:!1)?Q(s.proficiency_bonus)??0:0,X=N==="ranged"?o:i,ae=N==="ranged"?r:l,le=h+W+(Number(g.attack_modifier)||0)+X,Y=la(g).filter(K=>K.damageDie),c=Number(g.range_normal)||null,p=Number(g.range_disadvantage)||null,f=Number(g.melee_range)||1.5,b=[];N==="melee"&&f>1.5&&b.push(`Portata ${f} m`),N==="melee"&&g.is_thrown&&c&&b.push(`Lancio ${c}${p?`/${p}`:""}`),N!=="melee"&&c&&b.push(`Gittata ${c}${p?`/${p}`:""}`);const L=g.required_ammunition_type||g.ammunition_type,x=g.consumes_ammunition?a.filter(K=>K.category!=="container").filter(K=>L?K.ammunition_type===L:K.ammunition_type).reduce((K,Re)=>K+(Number(Re.qty)||0),0):null,C=za.get(L)||"Munizioni",M=x!==null?`${C} ${x}`:"",R=[...b,M].filter(Boolean).join(" · "),O=w==="dex"?"DES":w==="str"?"FOR":w.toUpperCase(),G=g.id??g.name,B=Y.length?Y:[{id:"default",label:"",damageDie:null,damageModifier:Number(g.damage_modifier)||0}],j=B.find(K=>K.id===g.selected_damage_mode)||B[0],V=h+(Number(j.damageModifier)||0)+ae,ee=j.damageDie?`${j.damageDie}${V?` ${U(V)}`:""}`:"-",J=j.id!=="default"?j.label:"",ie=J?`Impugnatura: ${J}`:"",qe=`weapon:${G}:${j.id}`,P=B.length>1?`<button class="icon-button icon-button--weapon-mode" data-cycle-weapon-mode="${G}" aria-label="Cambia impugnatura ${g.name}" title="Cambia impugnatura: ${J||j.label}"><span aria-hidden="true">🔁</span></button>`:"";return`
          <div class="modifier-card attack-card" data-roll-attack="weapon:${g.id??g.name}">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${g.name}</strong>
                <span class="modifier-ability modifier-ability--${w}">${O}</span>
                <span class="attack-card__hit">${U(le)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${ee}</span>
                ${ie?`<span class="muted">${ie}</span>`:""}
                ${R?`<span class="muted">${R}</span>`:""}
              </div>
            </div>
            <div class="attack-card__actions">
              ${P}
              <button class="icon-button icon-button--fire" data-roll-damage="${qe}" aria-label="Calcola danni ${g.name}${J?` ${J}`:""}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          </div>
        `}).join("")}
        ${q?$.map(g=>{const N=Number(g.damage_modifier)||0,w=`${g.damage_die}${N?` ${U(N)}`:""}`,h=ne[A]??(A==null?void 0:A.toUpperCase()),I=g.range?`Range ${g.range}`:"";return`
            <div class="modifier-card attack-card" data-roll-attack="spell:${g.id}">
              <div class="attack-card__body">
                <div class="attack-card__title">
                  <strong class="attack-card__name">${g.name}</strong>
                  <span class="modifier-ability modifier-ability--${A}">${h}</span>
                  <span class="attack-card__hit">${U(y)}</span>
                </div>
                <div class="attack-card__meta">
                  <span class="attack-card__damage">${w}</span>
                 
                  ${I?`<span class="muted">${I}</span>`:""}
                </div>
              </div>
              <button class="icon-button icon-button--fire" data-roll-damage="spell:${g.id}" aria-label="Calcola danni ${g.name}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          `}).join(""):""}
      </div>
    </div>
  `}function Nt(e,a=!1){var w;const t=e.data||{},s=t.spell_notes||"",i=Array.isArray(t.spells)?Ja(t.spells):[],o=t.spellcasting||{},l=Q(t.proficiency_bonus),r=o.ability,d=r?(w=t.abilities)==null?void 0:w[r]:null,u=ce(d),m=u===null||l===null?null:8+u+l,k=u===null||l===null?null:u+l,A=r?ne[r]:null,n=o.slots||{},E=o.slots_max||{},_=o.recharge||"long_rest",z=Array.from({length:9},(h,I)=>I+1).map(h=>{const I=Math.max(0,Number(n[h])||0),F=Math.max(I,Number(E[h])||0);return{level:h,count:I,max:F}}).filter(h=>h.max>0),$=[`${A??"-"}`,`CD ${m===null?"-":m}`,`TC ${k===null?"-":U(k)}`],q=$.length?`<div class="tag-row">${$.map(h=>`<span class="chip">${h}</span>`).join("")}</div>`:"",v=i.filter(h=>{if((Number(h.level)||0)<1)return!1;const F=h.prep_state||"known";return F==="prepared"||F==="always"}),D=i.filter(h=>(Number(h.level)||0)===0),H=v.filter(h=>(h.prep_state||"known")==="always"),g=v.filter(h=>(h.prep_state||"known")!=="always"),N=(h,I="")=>{const F=Number(h.level)||0,W=we(h.cast_time),X=da(W),ae=Te(h,F);return`
      <div class="modifier-card attack-card resource-card spell-prepared-list__card">
        <div class="resource-card__badges spell-card__badges">
          ${h.concentration?'<span class="resource-chip resource-chip--floating resource-chip--concentration">C</span>':""}
          ${h.is_ritual?'<span class="resource-chip resource-chip--floating resource-chip--ritual">R</span>':""}
          ${W?`<span class="resource-chip resource-chip--floating ${X}">${W}</span>`:""}
        </div>
        <button class="spell-prepared-list__item" type="button" data-spell-quick-open="${h.id}">
          <span class="spell-prepared-list__name">${h.name}</span>
          ${F>0?`<span class="chip chip--small">${F}°</span>`:""}
        </button>
        <div class="resource-card-actions spell-card-actions">
          ${ae?`
            <button class="icon-button icon-button--fire spell-card-actions__damage" type="button" data-roll-damage="spell:${h.id}" aria-label="Lancia danni ${h.name}" title="Lancia danni">
              <span aria-hidden="true">🔥</span>
            </button>
          `:""}
          ${F>0?`<button class="resource-cta-button resource-cta-button--label" type="button" data-use-spell="${h.id}">Usa</button>`:""}
          ${a?`
            <button class="resource-action-button resource-icon-button" type="button" data-edit-spell="${h.id}" aria-label="Modifica incantesimo ${h.name}">✏️</button>
            <button class="resource-action-button resource-icon-button" type="button" data-delete-spell="${h.id}" aria-label="Elimina incantesimo ${h.name}">🗑️</button>
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
            ${z.map(h=>{const I=_==="short_rest"?"charge-indicator":"charge-indicator charge-indicator--long",F=Array.from({length:h.max},(W,X)=>{const ae=X>=h.count,Y=[I,ae?"charge-indicator--used":""].filter(Boolean).join(" ");return a&&ae?`<button type="button" class="${Y}" data-restore-spell-slot="${h.level}" aria-label="Ripristina uno slot di livello ${h.level}"></button>`:a&&!ae?`<button type="button" class="${Y}" data-consume-spell-slot="${h.level}" aria-label="Consuma uno slot di livello ${h.level}"></button>`:`<span class="${Y}"></span>`}).join("");return`
              <div class="spell-slot-row">
                <span class="spell-slot-label">Slot ${h.level}°</span>
                <span class="spell-slot-count">${h.count}</span>
                <div class="spell-slot-charges" aria-hidden="true">${F||'<span class="spell-slot-empty">-</span>'}</div>
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
            <span class="spell-list-accordion__count">${D.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${D.length?`<div class="spell-prepared-list__items">${D.map(h=>N(h)).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun trucchetto disponibile.</p>'}
          </div>
        </details>
        <details class="spell-list-accordion" open>
          <summary class="spell-list-accordion__summary">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <span class="spell-list-accordion__title">Preparati</span>
            <span class="spell-list-accordion__count">${g.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${g.length?`<div class="spell-prepared-list__items">${g.map(h=>N(h,"Preparato")).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun incantesimo preparato.</p>'}
          </div>
        </details>
        <details class="spell-list-accordion" open>
          <summary class="spell-list-accordion__summary">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <span class="spell-list-accordion__title">Sempre conosciuti</span>
            <span class="spell-list-accordion__count">${H.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${H.length?`<div class="spell-prepared-list__items">${H.map(h=>N(h,"Sempre preparato")).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun incantesimo sempre conosciuto.</p>'}
          </div>
        </details>
      </div>
    </div>
  `}function we(e){const a=e==null?void 0:e.toString().trim();if(!a)return"";const t=a.toLowerCase();if(t.includes("bonus"))return"Azione Bonus";if(t.includes("reaz"))return"Reazione";if(t.includes("gratuit"))return"Azione Gratuita";if(t.includes("durata")||t.includes("più")||t.includes("piu")||t.includes("superiore"))return"Durata";if(t.includes("azion"))return"Azione";const s=ke.find(i=>i.label.toLowerCase()===t);return(s==null?void 0:s.label)??""}function Je(e){if(!e)return ke.length;const a=we(e),t=ke.findIndex(s=>s.label===a);return t===-1?ke.length:t}function da(e){var t;if(!e)return"";const a=we(e);return((t=ke.find(s=>s.label===a))==null?void 0:t.className)??""}function xt(e){return[...e].sort((a,t)=>{const s=Je(a.cast_time)-Je(t.cast_time);return s!==0?s:(a.name??"").localeCompare(t.name??"","it",{sensitivity:"base"})})}function Ze(e,a,{showCharges:t=!0,showUseButton:s=!0,showDescription:i=!1,showCastTime:o=!0}={}){return`
    <ul class="resource-list resource-list--compact">
      ${e.map(l=>`
        <li class="modifier-card attack-card resource-card" data-resource-card="${l.id}">
          ${o&&we(l.cast_time)?`<span class="resource-chip resource-chip--floating ${da(l.cast_time)}">${we(l.cast_time)}</span>`:""}
          <div class="attack-card__body resource-card__body">
            <div class="attack-card__title resource-card__title">
              <strong class="attack-card__name">${l.name}</strong>
            </div>
            ${i?`<p class="resource-card__description">${l.description??""}</p>`:""}
            ${t&&Number(l.max_uses)?`
              <div class="resource-card__charges">
                ${qt(l)}
              </div>
            `:""}
          </div>
          <div class="resource-card-actions">
            ${s?`
              <button
                class="resource-cta-button resource-cta-button--label"
                data-use-resource="${l.id}"
                ${!Number(l.max_uses)||l.used>=Number(l.max_uses)?"disabled":""}
              >
                Usa
              </button>
            `:""}
            ${a?`
              <button class="resource-action-button resource-icon-button" data-edit-resource="${l.id}" aria-label="Modifica risorsa">✏️</button>
              <button class="resource-action-button resource-icon-button" data-delete-resource="${l.id}" aria-label="Elimina risorsa">🗑️</button>
            `:""}
          </div>
        </li>
      `).join("")}
    </ul>
  `}function Ct(e,a){if(!e.length)return"<p>Nessuna risorsa.</p>";const t=xt(e),s=t.filter(r=>r.reset_on===null||r.reset_on==="none"),i=t.filter(r=>r.reset_on!==null&&r.reset_on!=="none"),o=`
    <details class="resource-accordion resource-section resource-section--active" open>
      <summary class="resource-accordion__summary">
        <span>Attive</span>
        <span class="resource-accordion__meta">${i.length} risorse</span>
        <span class="resource-accordion__icon" aria-hidden="true">▾</span>
      </summary>
      <div class="resource-section__body resource-accordion__body">
        ${i.length?Ze(i,a,{showUseButton:!0}):'<p class="muted">Nessuna risorsa attiva.</p>'}
      </div>
    </details>
  `,l=`
    <details class="resource-accordion resource-section" ${i.length?"":"open"}>
      <summary class="resource-accordion__summary">
        <span>Passive</span>
        <span class="resource-accordion__meta">${s.length} risorse</span>
        <span class="resource-accordion__icon" aria-hidden="true">▾</span>
      </summary>
      <div class="resource-section__body resource-accordion__body">
        ${s.length?Ze(s,a,{showCharges:!1,showUseButton:!1,showDescription:!0,showCastTime:!0}):'<p class="muted">Nessuna risorsa passiva.</p>'}
      </div>
    </details>
  `;return`<div class="resource-accordion-stack">${o}${l}</div>`}function qt(e){const a=Number(e.max_uses)||0,t=Number(e.used)||0;if(!a)return"";const s=e.reset_on==="long_rest"?"long":"short",i=Math.max(a-t,0),o=Array.from({length:a},(l,r)=>{const d=r<t;return`<span class="${["charge-indicator",s==="long"?"charge-indicator--long":"charge-indicator--short",d?"charge-indicator--used":""].filter(Boolean).join(" ")}" aria-hidden="true"></span>`}).join("");return`
    <div class="resource-charge-row" aria-label="Cariche risorsa">
      <span class="resource-charge-label">Cariche</span>
      <span class="resource-charge-count">${i}/${a}</span>
      <div class="resource-charges" aria-hidden="true">${o}</div>
    </div>
  `}function De(e){const a=e&&typeof e=="object"?e:{};return{abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10,...a.abilities||{}},hp:{current:1,max:1,...a.hp||{}},attacks:Array.isArray(a.attacks)?a.attacks:[]}}function Ce(e,a=[]){const t=(e==null?void 0:e.data)||{};if(!t.wild_shape_enabled)return null;const s=t.wild_shape||{};if(!s.active_companion_id)return null;const i=(a||[]).find(d=>String(d.id)===String(s.active_companion_id));if(!i)return null;const o=De(i.stat_block),l=Math.max(Number(o.hp.max)||Number(o.hp.current)||1,1),r=Math.max(0,Math.min(Number(s.hp_current??o.hp.current??l)||0,l));return{companion:i,statBlock:o,hpCurrent:r,hpMax:l}}function ua(e,a=[]){const t=Ce(e,a);if(!e||!t)return e;const s=e.data||{},i=s.abilities||{};return{...e,data:{...s,abilities:{...i,str:t.statBlock.abilities.str,dex:t.statBlock.abilities.dex,con:t.statBlock.abilities.con}}}}function Rt(e=[]){return(e||[]).filter(a=>["familiar","summon","transformation"].includes(a.kind||"familiar"))}async function Bt(e,a,t){var n,E,_;if(!((n=e==null?void 0:e.data)!=null&&n.wild_shape_enabled))return;const s=Rt(a);if(!s.length){S("Crea prima una forma nella sezione Famigli","error");return}const i=((E=e.data)==null?void 0:E.wild_shape)||{},o=document.createElement("div");o.className="modal-form-grid wild-shape-picker";const l=document.createElement("label");l.className="field",l.innerHTML="<span>Forma animale</span>";const r=Le(s.map(y=>{const z=De(y.stat_block),$=Math.max(Number(z.hp.max)||Number(z.hp.current)||1,1);return{value:y.id,label:`${y.name} · HP ${$}`}}),i.active_companion_id||((_=s[0])==null?void 0:_.id)||"");r.name="wild_shape_companion_id",l.appendChild(r),o.appendChild(l);const d=await de({title:"Scegli forma selvatica",submitLabel:"Trasformati",content:o,cardClass:"modal-card--form"});if(!d)return;const u=String(d.get("wild_shape_companion_id")||""),m=s.find(y=>String(y.id)===u);if(!m)return;const k=De(m.stat_block),A=Math.max(Number(k.hp.max)||Number(k.hp.current)||1,1);await Z(e,{...e.data||{},wild_shape:{active_companion_id:m.id,hp_current:A,activated_at:new Date().toISOString()}},`Forma selvatica: ${m.name}`,()=>T(t))}async function zt(e,a){await Z(e,{...e.data||{},wild_shape:null},"Forma selvatica terminata",()=>T(a))}async function Tt(e,a,t,s){var o;const i=Ce(e,a);i&&await Z(e,{...e.data||{},wild_shape:{...((o=e.data)==null?void 0:o.wild_shape)||{},active_companion_id:i.companion.id,hp_current:Math.max(0,Math.min(i.hpCurrent+t,i.hpMax))}},null,()=>T(s))}let ea=!1,Me=null;function Dt(e){return!e||!e.querySelector(".home-layout")?null:{windowX:window.scrollX||0,windowY:window.scrollY||0,panels:Array.from(e.querySelectorAll(".home-scroll-body, .home-scroll-panel")).map((a,t)=>({index:t,top:a.scrollTop||0,left:a.scrollLeft||0}))}}function It(e,a){if(!e||!a)return;const t=()=>{const s=Array.from(e.querySelectorAll(".home-scroll-body, .home-scroll-panel"));a.panels.forEach(i=>{const o=s[i.index];o&&(o.scrollTop=i.top,o.scrollLeft=i.left)}),window.scrollTo(a.windowX,a.windowY)};typeof window.requestAnimationFrame=="function"?window.requestAnimationFrame(t):setTimeout(t,0)}function Ft(e){return e?{id:`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.id,name:e.name,level:e.level,kind:Number(e.level)===0?"cantrip":"spell",cast_time:e.cast_time,duration:e.duration,range:e.range,components:e.components,concentration:!!e.concentration,attack_roll:!!e.attack_roll,is_ritual:!!e.ritual,damage_die:e.damage_die,damage_modifier:e.damage_modifier,upcast_damage_die:e.upcast_damage_die,upcast_damage_modifier:e.upcast_damage_modifier,upcast_start_level:e.upcast_start_level,description:e.description,rules_version:e.rules_version,prep_state:"known"}:null}function jt(e){const a=(e==null?void 0:e.shared_spell)||{},t=(e==null?void 0:e.custom_spell)||{},s=e!=null&&e.shared_spell_id?a:t;if(!(s!=null&&s.name))return null;const i=Number(s.level)||0;return{id:e.id||`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.shared_spell_id||null,name:s.name,level:i,kind:s.kind||(i===0?"cantrip":"spell"),cast_time:s.cast_time||null,duration:s.duration||null,range:s.range||null,components:s.components||null,concentration:!!s.concentration,attack_roll:!!s.attack_roll,is_ritual:!!(s.ritual??s.is_ritual),damage_die:s.damage_die||null,damage_modifier:s.damage_modifier??null,upcast_damage_die:s.upcast_damage_die||null,upcast_damage_modifier:s.upcast_damage_modifier??null,upcast_start_level:s.upcast_start_level??null,description:s.description||null,school:s.school||null,caster_classes:s.caster_classes||[],rules_version:s.rules_version||null,prep_state:e.prep_state||"known"}}async function Ht(){var g;const e=["","Abiurazione","Ammaliamento","Divinazione","Evocazione","Illusione","Invocazione","Necromanzia","Trasmutazione"],a=["mago","warlock","stregone","chierico","druido","ranger","artefice","paladino","bardo"],t=document.createElement("div");t.className="modal-form-grid";const s=Ee({label:"Cerca incantesimo",name:"spell_query",placeholder:"Es. Palla di fuoco"}),i=s.querySelector("input"),o=document.createElement("label");o.className="field",o.innerHTML="<span>Versione regole</span>";const l=document.createElement("select");l.name="rules_version",[{value:"2024",label:"2024"},{value:"2014",label:"2014"},{value:"Custom",label:"Custom"}].forEach(N=>{const w=document.createElement("option");w.value=N.value,w.textContent=N.label,l.appendChild(w)}),o.appendChild(l);const r=document.createElement("label");r.className="field",r.innerHTML="<span>Scuola</span>";const d=document.createElement("select");d.name="spell_school_filter",e.forEach(N=>{const w=document.createElement("option");w.value=N,w.textContent=N||"Tutte",d.appendChild(w)}),r.appendChild(d);const u=Ee({label:"Livello",name:"spell_level_filter",type:"number",value:""}),m=document.createElement("div");m.className="field",m.innerHTML=`<span>Classi</span><div class="tag-row">${a.map(N=>`<label class="chip"><input type="checkbox" name="spell_caster_filter" value="${N}" /> ${N}</label>`).join("")}</div>`;const k=document.createElement("div");k.className="modal-form-row modal-form-row--compact",k.append(u,r,o),t.appendChild(s),t.appendChild(k),t.appendChild(m);const A=document.createElement("label");A.className="field",A.innerHTML="<span>Risultati</span>";const n=document.createElement("select");n.name="shared_spell_id",A.appendChild(n);const E=document.createElement("div");E.className="tab-bar",E.innerHTML='<button type="button" class="tab-bar__button" data-prev-page>◀</button><span data-page-label class="muted">Pagina 1</span><button type="button" class="tab-bar__button" data-next-page>▶</button>',t.appendChild(A),t.appendChild(E);let _=1,y=[];const z=E.querySelector("[data-page-label]"),$=E.querySelector("[data-prev-page]"),q=E.querySelector("[data-next-page]"),v=async()=>{var I;const N=Array.from(t.querySelectorAll('input[name="spell_caster_filter"]:checked')).map(F=>F.value),w=await vt({query:(i==null?void 0:i.value)||"",rulesVersion:l.value||"2024",level:((I=t.querySelector('input[name="spell_level_filter"]'))==null?void 0:I.value)||"",school:d.value||"",casterClasses:N,page:_,pageSize:25});if(y=w.items||[],n.innerHTML="",y.forEach(F=>{const W=document.createElement("option");W.value=F.id,W.textContent=`${F.name} (Lv ${F.level})`,n.appendChild(W)}),!y.length){const F=document.createElement("option");F.value="",F.textContent="Nessun risultato",n.appendChild(F)}const h=Math.max(1,Math.ceil((w.total||0)/(w.pageSize||25)));z.textContent=`Pagina ${_} / ${h}`,$.disabled=_<=1,q.disabled=_>=h};i==null||i.addEventListener("input",()=>{_=1,v()}),d.addEventListener("change",()=>{_=1,v()}),l.addEventListener("change",()=>{_=1,v()}),(g=t.querySelector('input[name="spell_level_filter"]'))==null||g.addEventListener("input",()=>{_=1,v()}),t.querySelectorAll('input[name="spell_caster_filter"]').forEach(N=>N.addEventListener("change",()=>{_=1,v()})),$==null||$.addEventListener("click",()=>{_=Math.max(1,_-1),v()}),q==null||q.addEventListener("click",()=>{_+=1,v()}),await v();const D=await de({title:"Seleziona incantesimo condiviso",submitLabel:"Aggiungi",cancelLabel:"Annulla",content:t,cardClass:"modal-card--form"});if(!D)return null;const H=D.get("shared_spell_id");return y.find(N=>N.id===H)||null}function aa(e){var a,t;return((t=(a=e==null?void 0:e.data)==null?void 0:a.settings)==null?void 0:t.auto_usage_dice)!==!1}function Pt(e,a){var t,s;return it((s=(t=e==null?void 0:e.data)==null?void 0:t.spellcasting)==null?void 0:s.slots,a)}async function Ot(e,a){const t=Math.max(1,Number(a==null?void 0:a.level)||1),s=Pt(e,t);if(!s.length)return S("Slot incantesimo esauriti","error"),null;if(s.length===1)return s[0].level;const i=document.createElement("label");i.className="field",i.innerHTML="<span>Seleziona slot da consumare</span>";const o=document.createElement("select");o.name="cast_slot_level",o.className="input",s.forEach(u=>{const m=document.createElement("option");m.value=String(u.level),m.textContent=`${u.level}° livello (${u.available} slot)`,o.appendChild(m)}),i.appendChild(o);const l=document.createElement("div");l.className="modal-form-grid",l.appendChild(i);const r=await de({title:a!=null&&a.name?`Lancia ${a.name}`:"Scegli slot incantesimo",submitLabel:"Conferma",cancelLabel:"Annulla",content:l,cardClass:"modal-card--form"});return r?Math.max(t,Number(r.get("cast_slot_level"))||t):null}async function T(e){var o,l,r,d;const a=Dt(e);Me=e;const t=te(),{user:s,offline:i}=t;We(!0);try{let u=t.characters;if(!i&&s)try{u=await Ma(s.id),Va({characters:u}),await ge({characters:u})}catch{S("Errore caricamento personaggi","error")}const m=ue(t.activeCharacterId);!u.some(c=>ue(c.id)===m)&&u.length&&Ua(u[0].id);const A=ue(te().activeCharacterId),n=u.find(c=>ue(c.id)===A),E=!!s&&!i,_=!!s&&!i,y=!!s&&!i;let z=t.cache.resources,$=t.cache.items,q=[];if(!i&&n){const[c,p,f,b]=await Promise.allSettled([ia(n.id),Pa(n.id),Ke(n.id),ot(n.id)]),L={};if(c.status==="fulfilled"?(z=c.value,pe("resources",z),L.resources=z):S("Errore caricamento risorse","error"),p.status==="fulfilled"?($=p.value,pe("items",$),L.items=$):S("Errore caricamento equip","error"),b.status==="fulfilled"?(q=b.value||[],pe("companions",q)):S("Errore caricamento forme animali","error"),f.status==="fulfilled"){const x=(f.value||[]).map(C=>jt(C)).filter(Boolean);if(x.length){const M=[...Array.isArray((o=n.data)==null?void 0:o.spells)?n.data.spells:[]];x.forEach(R=>{M.some(G=>G.shared_spell_id&&G.shared_spell_id===R.shared_spell_id)||M.push(R)}),n.data={...n.data||{},spells:M}}}Object.keys(L).length&&await ge(L)}const v=ua(n,q);e.innerHTML=`
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
          ${v?At(v):"<p>Nessun personaggio selezionato.</p>"}
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
            ${v?kt(v):"<p>Nessun personaggio selezionato.</p>"}
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
            ${v?St(v):"<p>Nessun personaggio selezionato.</p>"}
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
              ${n&&y?`
                <button class="icon-button" data-edit-character aria-label="Modifica personaggio">
                  <span aria-hidden="true">✏️</span>
                </button>
              `:""}
            </div>
          </header>
          ${v?$t(v,y,$,q):yt(E,i)}
        </section>
        ${n?Lt(n,$,y):""}
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
            ${n?Mt(v,$||[],q):"<p>Nessun personaggio selezionato.</p>"}
          </div>
        </section>
        ${(l=n==null?void 0:n.data)!=null&&l.is_spellcaster?`
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Incantesimi</p>
            </div>
            <div class="actions">
              <button class="icon-button icon-button--dice" data-open-dice="spell-attack" aria-label="Lancia dado tiro per colpire incantesimi">
                <span aria-hidden="true">🎲</span>
              </button>
              ${(d=(r=n==null?void 0:n.data)==null?void 0:r.spellcasting)!=null&&d.can_prepare?`
                <button class="icon-button icon-button--spell-prepare" type="button" data-open-prepared-spells aria-label="Prepara incantesimi" title="Prepara incantesimi">
                  <span aria-hidden="true">📖</span>
                </button>
              `:""}
              ${n&&y?`
                <button class="icon-button icon-button--add" data-add-spell aria-label="Aggiungi incantesimo">
                  <span aria-hidden="true">+</span>
                </button>
              `:""}
            </div>
          </header>
          <div class="home-scroll-body">
            ${Nt(n,y)}
          </div>
        </section>
        `:""}
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Risorse</p>           
            </div>
            ${n&&_?`
              <button class="icon-button icon-button--add" data-add-resource aria-label="Nuova risorsa">
                <span aria-hidden="true">+</span>
              </button>
            `:""}
          </header>
          <div class="home-scroll-body home-scroll-body--resources">
            ${n?Ct(z,_):"<p>Nessun personaggio selezionato.</p>"}
            ${n&&!_?'<p class="muted">Connettiti per aggiungere nuove risorse.</p>':""}
          </div>
        </section>
      </div>
    </div>
  `,pa();const D=e.querySelector("[data-create-character]");D&&D.addEventListener("click",()=>{Ve(s,()=>T(e))});const H=e.querySelector("[data-edit-character]");H&&H.addEventListener("click",()=>{Ve(s,()=>T(e),n)});const g=e.querySelector("[data-add-resource]");g&&g.addEventListener("click",()=>{Ge(n,()=>T(e))});const N=e.querySelector("[data-add-spell]");N&&N.addEventListener("click",async()=>{var p;if(!n)return;const c=await rt();if(c){if(c==="shared")try{const f=await Ht();if(!f)return;const b=Ft(f),L=Array.isArray((p=n.data)==null?void 0:p.spells)?n.data.spells:[];if(L.some(M=>M.shared_spell_id===f.id)){S("Incantesimo già presente nella scheda personaggio","info");return}n.user_id&&await ct({user_id:n.user_id,character_id:n.id,shared_spell_id:f.id,prep_state:b.prep_state});const C={...n.data||{},spells:[...L,b]};await Z(n,C,"Incantesimo aggiunto dalla lista condivisa",()=>T(e));return}catch{S("Errore durante l'associazione dell'incantesimo condiviso","error");return}Qe(n,async f=>{if(!f)return T(e);try{await dt({created_by:n.user_id,rules_version:f.rules_version||"2024",name:f.name,level:f.level,school:f.school||null,caster_classes:Array.isArray(f.caster_classes)?f.caster_classes:[],cast_time:f.cast_time||null,range:f.range||null,duration:f.duration||null,components:f.components||null,concentration:!!f.concentration,ritual:!!f.is_ritual,attack_roll:!!f.attack_roll,damage_die:f.damage_die||null,damage_modifier:f.damage_modifier??null,upcast_damage_die:f.upcast_damage_die||null,upcast_damage_modifier:f.upcast_damage_modifier??null,upcast_start_level:f.upcast_start_level??null,description:f.description||null})}catch{S("Incantesimo salvato sul personaggio ma non sul catalogo condiviso","info")}T(e)})}}),e.querySelectorAll("[data-edit-spell]").forEach(c=>c.addEventListener("click",()=>{var L;const p=c.dataset.editSpell;if(!p||!n)return;const b=(Array.isArray((L=n.data)==null?void 0:L.spells)?n.data.spells:[]).find(x=>x.id===p);b&&Qe(n,()=>T(e),b)})),e.querySelectorAll("[data-delete-spell]").forEach(c=>c.addEventListener("click",async()=>{var C;const p=c.dataset.deleteSpell;if(!p||!n)return;const f=Array.isArray((C=n.data)==null?void 0:C.spells)?n.data.spells:[],b=f.find(M=>M.id===p);if(!b||!await ze({title:"Conferma eliminazione incantesimo",message:`Stai per eliminare l'incantesimo "${b.name}" dalla scheda del personaggio. Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))return;if(b.shared_spell_id)try{const R=(await Ke(n.id)).find(O=>O.shared_spell_id===b.shared_spell_id);R!=null&&R.id&&await ut(R.id)}catch{S("Errore rimozione associazione incantesimo","error");return}const x={...n.data||{},spells:f.filter(M=>M.id!==b.id)};await Z(n,x,"Incantesimo eliminato",()=>T(e))}));const w=e.querySelector("[data-open-prepared-spells]");w&&w.addEventListener("click",()=>{ra(n,()=>T(e))}),e.querySelectorAll("[data-spell-quick-open]").forEach(c=>c.addEventListener("click",()=>{var L;const p=c.dataset.spellQuickOpen;if(!p||!n)return;const b=(Array.isArray((L=n.data)==null?void 0:L.spells)?n.data.spells:[]).find(x=>x.id===p);b&&pt(n,b,()=>T(e))}));const h=e.querySelector("[data-show-background]");h&&h.addEventListener("click",()=>{mt(n)});const I=e.querySelector("[data-edit-conditions]");I&&I.addEventListener("click",async()=>{await ma(e)}),e.querySelectorAll("[data-proficiency-tabs]").forEach(c=>{var x;const p=Array.from(c.querySelectorAll("[data-proficiency-tab]")),f=Array.from(c.querySelectorAll("[data-proficiency-panel]"));if(!p.length||!f.length)return;const b=C=>{p.forEach(M=>{const R=M.dataset.proficiencyTab===C;M.classList.toggle("is-active",R),M.setAttribute("aria-selected",String(R))}),f.forEach(M=>{M.classList.toggle("is-active",M.dataset.proficiencyPanel===C)})};p.forEach(C=>{C.addEventListener("click",()=>{b(C.dataset.proficiencyTab)})});const L=((x=p.find(C=>C.classList.contains("is-active")))==null?void 0:x.dataset.proficiencyTab)??p[0].dataset.proficiencyTab;L&&b(L)});const F=e.querySelector("[data-add-equip]");F&&n&&y&&F.addEventListener("click",async()=>{var G;const c=($||[]).filter(B=>B.equipable&&!me(B).length);if(!c.length){S("Nessun oggetto equipaggiabile disponibile","error");return}const p=document.createElement("div");p.className="drawer-form";const f=document.createElement("label");f.className="field",f.innerHTML="<span>Oggetto</span>";const b=document.createElement("select");b.name="item_id",c.forEach(B=>{const j=document.createElement("option");j.value=B.id,j.textContent=B.name,b.appendChild(j)}),f.appendChild(b),p.appendChild(f);const L=document.createElement("fieldset");L.className="equip-slot-field",L.innerHTML="<legend>Punti del corpo</legend>";const x=document.createElement("div");x.className="equip-slot-list",Oa.forEach(B=>{const j=document.createElement("label");j.className="checkbox",j.innerHTML=`<input type="checkbox" name="equip_slots" value="${B.value}" /> <span>${B.label}</span>`,x.appendChild(j)}),L.appendChild(x),p.appendChild(L);const C=await de({title:"Equipaggia oggetto",submitLabel:"Equipaggia",content:p});if(!C)return;const M=C.getAll("equip_slots");if(!M.length){S("Seleziona almeno uno slot","error");return}const R=c.find(B=>String(B.id)===C.get("item_id"));if(!R)return;const O=((G=n.data)==null?void 0:G.proficiencies)||{};if(R.category==="weapon"){if(!R.weapon_type){S("Definisci il tipo di arma prima di equipaggiarla","error");return}if(!(R.weapon_type==="simple"?!!O.weapon_simple:!!O.weapon_martial)){S("Non hai la competenza per equipaggiare questo oggetto","error");return}}if(R.category==="armor")if(R.is_shield){if(!O.shield){S("Non hai la competenza per equipaggiare questo oggetto","error");return}}else if(R.armor_type){if(!(R.armor_type==="light"?!!O.armor_light:R.armor_type==="medium"?!!O.armor_medium:!!O.armor_heavy)){S("Non hai la competenza per equipaggiare questo oggetto","error");return}}else{S("Definisci il tipo di armatura prima di equipaggiarla","error");return}if(!R.sovrapponibile&&($||[]).filter(j=>j.id!==R.id).filter(j=>me(j).some(V=>M.includes(V))).length){S("Uno o più slot selezionati sono già occupati","error");return}try{await Ae(R.id,{equip_slot:M[0]||null,equip_slots:M}),S("Equipaggiamento aggiornato"),T(e)}catch{S("Errore aggiornamento equip","error")}}),e.querySelectorAll("[data-unequip]").forEach(c=>c.addEventListener("click",async()=>{const p=($||[]).find(f=>f.id===c.dataset.unequip);if(p)try{await Ae(p.id,{equip_slot:null,equip_slots:[]}),S("Equipaggiamento rimosso"),T(e)}catch{S("Errore aggiornamento equip","error")}}));const W=e.querySelector("[data-toggle-inspiration]");W&&n&&y&&W.addEventListener("click",async()=>{const c=n.data||{},p={...c,inspiration:!c.inspiration};await Z(n,p,"Ispirazione aggiornata",()=>T(e))});const X=e.querySelector("[data-toggle-concentration]");X&&n&&y&&X.addEventListener("click",async()=>{const c=n.data||{},p={...c,concentration_active:!c.concentration_active};await Z(n,p,"Concentrazione aggiornata",()=>T(e))}),e.querySelectorAll("[data-open-wild-shape]").forEach(c=>c.addEventListener("click",()=>{!n||!y||Bt(n,q,e)})),e.querySelectorAll("[data-end-wild-shape]").forEach(c=>c.addEventListener("click",()=>{!n||!y||zt(n,e)})),e.querySelectorAll("[data-wild-shape-hp-delta]").forEach(c=>c.addEventListener("click",()=>{if(!n||!y)return;const p=Number(c.dataset.wildShapeHpDelta)||0;Tt(n,q,p,e)})),e.querySelectorAll("[data-open-dice]").forEach(c=>c.addEventListener("click",()=>{Aa(c.dataset.openDice)})),e.querySelectorAll("[data-saving-throw-card]").forEach(c=>c.addEventListener("click",()=>{var L,x,C;if(!n)return;const p=c.dataset.savingThrowCard;if(!p)return;const f=Pe(n),b=f.find(M=>M.value===p);b&&he({title:`Tiro salvezza • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:f,value:b.value},allowInspiration:!!((L=n==null?void 0:n.data)!=null&&L.inspiration)&&y,weakPoints:Number((C=(x=n==null?void 0:n.data)==null?void 0:x.hp)==null?void 0:C.weak_points)||0,characterId:n.id})})),e.querySelectorAll("[data-skill-card]").forEach(c=>c.addEventListener("click",()=>{var L,x,C;if(!n)return;const p=c.dataset.skillCard;if(!p)return;const f=$a(n,$||[]),b=f.find(M=>M.value===p);b&&he({title:`Tiro abilità • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità",options:f,value:b.value},allowInspiration:!!((L=n==null?void 0:n.data)!=null&&L.inspiration)&&y,weakPoints:Number((C=(x=n==null?void 0:n.data)==null?void 0:x.hp)==null?void 0:C.weak_points)||0,characterId:n.id})})),e.querySelectorAll("[data-special-skill-card]").forEach(c=>c.addEventListener("click",()=>{var L,x,C;if(!n)return;const p=c.dataset.specialSkillCard;if(!p)return;const f=ka(n,$||[]),b=f.find(M=>M.value===p);b&&he({title:`Tiro abilità speciale • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità speciale",options:f,value:b.value},allowInspiration:!!((L=n==null?void 0:n.data)!=null&&L.inspiration)&&y,weakPoints:Number((C=(x=n==null?void 0:n.data)==null?void 0:x.hp)==null?void 0:C.weak_points)||0,characterId:n.id})})),e.querySelectorAll("[data-edit-resource]").forEach(c=>c.addEventListener("click",()=>{const p=z.find(f=>f.id===c.dataset.editResource);p&&Ge(n,()=>T(e),p)})),e.querySelectorAll("[data-roll-hit-dice]").forEach(c=>c.addEventListener("click",async()=>{await rs(n,e)})),e.querySelectorAll("[data-roll-attack]").forEach(c=>c.addEventListener("click",p=>{p.target.closest("button")||os(c.dataset.rollAttack)})),e.querySelectorAll("[data-cycle-weapon-mode]").forEach(c=>c.addEventListener("click",()=>{if(!n)return;const p=c.dataset.cycleWeaponMode,f=$==null?void 0:$.find(M=>String(M.id)===p||M.name===p);if(!f)return;const b=la(f).filter(M=>M.damageDie);if(b.length<=1)return;const L=f.selected_damage_mode||b[0].id,x=Math.max(b.findIndex(M=>M.id===L),0),C=b[(x+1)%b.length];Ae(f.id,{selected_damage_mode:C.id}).then(M=>{const R=(te().cache.items||$||[]).map(O=>String(O.id)===String(f.id)?{...O,...M||{},selected_damage_mode:C.id}:O);return pe("items",R),ge({items:R})}).then(()=>{S(`Modalità ${C.label}`),T(e)}).catch(()=>S("Errore cambio modalità arma","error"))})),e.querySelectorAll("[data-roll-damage]").forEach(c=>c.addEventListener("click",()=>{var M,R,O,G;if(!n)return;const p=c.dataset.rollDamage;if(!p)return;if(p.startsWith("wildshape:")){const B=Number(p.replace("wildshape:",""))||0,j=Ce(n,q),V=(M=j==null?void 0:j.statBlock.attacks)==null?void 0:M[B],ee=String((V==null?void 0:V.damage)||"").trim();if(!ee||ee==="-"){S("Danni non configurati per questo attacco","error");return}fe({keepOpen:!0,title:`${j.companion.name} · Danni ${V.name||"Attacco"}`,mode:"generic",notation:ee,modifier:Number(V.damage_modifier)||0,rollType:"DMG",characterId:n==null?void 0:n.id,historyLabel:`${j.companion.name} · ${V.name||"Danni"}`});return}if(p.startsWith("spell:")){const B=p.replace("spell:",""),V=(Array.isArray((R=n.data)==null?void 0:R.spells)?n.data.spells:[]).find(ie=>ie.id===B);if(!V)return;const ee=Number(V.cast_level??V.level)||0,J=Te(V,ee);if(!J){S("Danno non calcolabile per questo trucchetto.","error");return}fe({keepOpen:!0,title:J.title,mode:"generic",notation:J.notation,modifier:J.modifier,rollType:"DMG",characterId:n==null?void 0:n.id,historyLabel:V.name||null,sneakAttackDice:((O=n==null?void 0:n.data)==null?void 0:O.sneak_attack_dice)||null});return}const f=p.startsWith("weapon:")?p.split(":"):[null,p,"default"],b=f[1]||p,L=f[2]||"default",x=$==null?void 0:$.find(B=>String(B.id)===b||B.name===b);if(!x)return;const C=st(n,x,L);if(!C){S("Danno non calcolabile per questa arma.","error");return}fe({keepOpen:!0,title:C.title,mode:"generic",notation:C.notation,modifier:C.modifier,rollType:"DMG",characterId:n==null?void 0:n.id,historyLabel:x.name||null,sneakAttackDice:((G=n==null?void 0:n.data)==null?void 0:G.sneak_attack_dice)||null})}));const ae=c=>{var b;const p=(b=c==null?void 0:c.damage_dice_notation)==null?void 0:b.trim();if(!p)return;const f=nt(p);if(!(f!=null&&f.notation)){S("Notazione dado non valida per questa risorsa","error");return}fe({keepOpen:!0,title:c.name||"Tiro abilità",mode:"generic",notation:f.notation,modifier:Number(c.damage_modifier)||0,rollType:"GEN",characterId:n==null?void 0:n.id,historyLabel:c.name||null})},le=async c=>{const p=Number(c.max_uses)||0;if(!(!p||c.used>=p))try{await Be(c.id,{used:Math.min(c.used+1,p)}),S("Risorsa usata"),aa(n)&&ae(c),T(e)}catch{S("Errore utilizzo risorsa","error")}};e.querySelectorAll("[data-resource-card]").forEach(c=>{const p=async f=>{if(f.target.closest("button"))return;const b=z.find(L=>L.id===c.dataset.resourceCard);b&&ft(b,{onUse:()=>le(b),onReset:async()=>{try{await Be(b.id,{used:0}),S("Risorsa ripristinata"),T(e)}catch{S("Errore ripristino risorsa","error")}},onRecover:async()=>{try{await Be(b.id,{used:Math.max((Number(b.used)||0)-1,0)}),S("Carica recuperata"),T(e)}catch{S("Errore recupero carica","error")}}})};c.addEventListener("click",p)}),e.querySelectorAll("[data-use-resource]").forEach(c=>c.addEventListener("click",async()=>{const p=z.find(f=>f.id===c.dataset.useResource);p&&await le(p)})),e.querySelectorAll("[data-use-spell]").forEach(c=>c.addEventListener("click",async()=>{var O,G;if(!n)return;const p=c.dataset.useSpell;if(!p)return;const b=(Array.isArray((O=n.data)==null?void 0:O.spells)?n.data.spells:[]).find(B=>B.id===p);if(!b||(Number(b.level)||0)<1)return;const x=await Ot(n,b);if(!x||!await Xe(n,x,()=>T(e)))return;const M=te().characters.find(B=>ue(B.id)===ue(n.id))||n;if(b.concentration){const B=M.data||{};B.concentration_active||await Z(M,{...B,concentration_active:!0},"Concentrazione attiva",()=>T(e))}if(!aa(M)){T(e);return}const R=Te(b,x);if(!R){S("Danno non calcolabile per questo incantesimo.","error");return}fe({keepOpen:!0,title:R.title,mode:"generic",notation:R.notation,modifier:R.modifier,rollType:"DMG",characterId:n.id,historyLabel:b.name||null,sneakAttackDice:((G=n==null?void 0:n.data)==null?void 0:G.sneak_attack_dice)||null})})),e.querySelectorAll("[data-consume-spell-slot]").forEach(c=>c.addEventListener("click",async()=>{if(!n)return;const p=Number(c.dataset.consumeSpellSlot);!Number.isFinite(p)||p<1||await Xe(n,p,()=>T(e))})),e.querySelectorAll("[data-restore-spell-slot]").forEach(c=>c.addEventListener("click",async()=>{if(!n)return;const p=Number(c.dataset.restoreSpellSlot);!Number.isFinite(p)||p<1||await bt(n,p,()=>T(e))})),e.querySelectorAll("[data-delete-resource]").forEach(c=>c.addEventListener("click",async()=>{const p=z.find(b=>b.id===c.dataset.deleteResource);if(!(!p||!await ze({title:"Conferma eliminazione risorsa",message:`Stai per eliminare la risorsa "${p.name}". Questa azione non può essere annullata.`,confirmLabel:"Elimina"})))try{await Na(p.id),S("Risorsa eliminata"),T(e)}catch{S("Errore eliminazione risorsa","error")}})),e.querySelectorAll("[data-death-save]").forEach(c=>c.addEventListener("click",async()=>{if(!n||!y)return;const{deathSave:p,deathSaveIndex:f}=c.dataset,b=Number(f);if(!p||!b)return;const L=n.data||{},x=L.death_saves||{},C=Math.max(0,Math.min(3,Number(x[p])||0)),M=b===C?C-1:b,R={successes:Math.max(0,Math.min(3,p==="successes"?M:Number(x.successes)||0)),failures:Math.max(0,Math.min(3,p==="failures"?M:Number(x.failures)||0))};await Z(n,{...L,death_saves:R},"Tiri salvezza contro morte aggiornati",()=>T(e))})),e.querySelectorAll("[data-weakness-level]").forEach(c=>c.addEventListener("click",async()=>{if(!n||!y)return;const p=Number(c.dataset.weaknessLevel);if(!p)return;const f=n.data||{},b=f.hp||{},L=Math.max(0,Math.min(6,Number(b.weak_points)||0));await Z(n,{...f,hp:{...b,weak_points:p===L?0:p}},"Punti indebolimento aggiornati",()=>T(e))}));const Y=e.querySelector(".character-avatar");Y&&(Y.setAttribute("draggable","false"),Y.addEventListener("click",c=>{c.preventDefault(),gt(n)}),Y.addEventListener("contextmenu",c=>{c.preventDefault()}),Y.addEventListener("dragstart",c=>{c.preventDefault()})),e.querySelectorAll("[data-item-image]").forEach(c=>{c.setAttribute("draggable","false"),c.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation();const f=$==null?void 0:$.find(b=>String(b.id)===c.dataset.itemImage);f&&Oe(f)})}),e.querySelectorAll("[data-item-preview]").forEach(c=>{c.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation();const f=$==null?void 0:$.find(b=>String(b.id)===c.dataset.itemPreview);f&&Oe(f)})}),It(e,a)}finally{We(!1)}}function _s(){pa()}function pa(){ea||(document.addEventListener("click",async e=>{if(!e.target.closest("[data-actions-fab]"))return;const t=e.target.closest("[data-hp-action]"),s=e.target.closest("[data-money-action]"),i=e.target.closest("[data-rest]"),o=e.target.closest("[data-open-dice]"),l=e.target.closest("[data-add-loot]"),r=e.target.closest("[data-edit-conditions]"),d=e.target.closest("[data-edit-resistances]"),u=e.target.closest("[data-edit-roll-adjustments]");if(!t&&!s&&!i&&!o&&!l&&!r&&!d&&!u)return;e.preventDefault(),Wt();const m=Me??null;if(t){await cs(t.dataset.hpAction,m);return}if(s){if((window.location.hash.replace("#/","")||"home")==="inventory")return;await Zt(s.dataset.moneyAction,m);return}if(i){await ls(i.dataset.rest,m);return}if(o){Aa(o.dataset.openDice);return}if(l){await Jt();return}if(r){await ma(m);return}if(d){await Yt(m);return}u&&await Gt(m)}),ea=!0)}function Wt(){const e=document.querySelector("[data-actions-fab]"),a=document.querySelector("[data-actions-toggle]");!e||!e.classList.contains("is-open")||(e.classList.remove("is-open"),a==null||a.setAttribute("aria-expanded","false"))}function oe(){const e=te(),{user:a,offline:t,characters:s,activeCharacterId:i}=e,o=ue(i),l=s.find(u=>ue(u.id)===o),r=e.cache.companions||[],d=ua(l,r);return{activeCharacter:l,sheetCharacter:d,companions:r,canEditCharacter:!!a&&!t}}async function ma(e){const{activeCharacter:a,canEditCharacter:t}=oe();if(!a||!t)return;const s=await lt(a);if(!s)return;const i=s.getAll("conditions");await Z(a,{...a.data,conditions:i},"Condizioni aggiornate",()=>{e&&T(e)})}function Vt(e){var t;const a=((t=e==null?void 0:e.data)==null?void 0:t.roll_adjustments)||{};return{attack_rolls:a.attack_rolls||{},saving_throws:a.saving_throws||{},skills:a.skills||{}}}function Ut(e){const a=Vt(e),t=te().cache.items||[],s=document.createElement("div");s.className="modal-form-grid compact-settings-form compact-settings-form--rolls";const i=[{value:"",label:"Nessuno"},{value:"advantage",label:"Vantaggio"},{value:"disadvantage",label:"Svantaggio"}],o=(l,r,d)=>{const u=document.createElement("section");u.className="character-edit-section compact-settings-section",u.innerHTML=`<h4>${l}</h4><p class="muted compact-settings-help">Indica solo gli override manuali; gli effetti automatici restano visibili sotto la riga.</p>`;const m=document.createElement("div");m.className="compact-setting-grid compact-setting-grid--roll",d.forEach(k=>{var w;const A=((w=a[r])==null?void 0:w[k.key])||{},n=_a(e,t,r,k),E=re(n).rollMode||"",_=n.length===1&&n[0].source||"",y=A.mode||E,z=A.source||_,$=document.createElement("div");$.className="compact-setting-row compact-setting-row--roll";const q=document.createElement("label");q.className="field compact-setting-field";const v=document.createElement("span");v.textContent=k.label;const D=Le(i,y);D.name=`roll_${r}_${k.key}_mode`,q.append(v,D);const H=document.createElement("label");H.className="field compact-setting-field";const g=document.createElement("span");g.textContent="Fonte manuale";const N=Le(fa,z);if(N.name=`roll_${r}_${k.key}_source`,H.append(g,N),$.append(q,H),n.length){const h=document.createElement("p");h.className="muted compact-setting-note",h.textContent=`Automatico: ${n.map(I=>I.reason).join(" ")}`,$.appendChild(h)}m.appendChild($)}),u.appendChild(m),s.appendChild(u)};return o("Tiri per colpire","attack_rolls",ga(e,t)),o("Tiri salvezza","saving_throws",Ne),o("Abilità","skills",xe),s}function Kt(e,a){const t=te().cache.items||[],s={attack_rolls:{},saving_throws:{},skills:{}};return[{scope:"attack_rolls",entries:ga(a,t)},{scope:"saving_throws",entries:Ne},{scope:"skills",entries:xe}].forEach(({scope:i,entries:o})=>{o.forEach(l=>{var n,E;const r=((n=e.get(`roll_${i}_${l.key}_mode`))==null?void 0:n.toString())||"",d=((E=e.get(`roll_${i}_${l.key}_source`))==null?void 0:E.toString().trim())||"",u=_a(a,t,i,l),m=re(u).rollMode||"",k=u.length===1&&u[0].source||"";(r==="advantage"||r==="disadvantage")&&!(r===m&&d===k)&&(s[i][l.key]={mode:r,source:d})})}),s}async function Gt(e){const{activeCharacter:a,canEditCharacter:t}=oe();if(!a||!t)return;const s=await de({title:"Vantaggi / Svantaggi situazionali",submitLabel:"Salva",content:Ut(a),cardClass:"modal-card--wide"});s&&await Z(a,{...a.data,roll_adjustments:Kt(s,a)},"Vantaggi/svantaggi aggiornati",()=>{e&&T(e)})}function Qt(e){var i;const a=((i=e==null?void 0:e.data)==null?void 0:i.damage_defenses)||{},t=_e.reduce((o,l)=>{const r=l.group||"Altro";return o[r]||(o[r]=[]),o[r].push(l),o},{}),s=document.createElement("div");return s.className="modal-form-grid compact-settings-form compact-settings-form--defenses",s.innerHTML=Object.entries(t).map(([o,l])=>`
    <section class="character-edit-section compact-settings-section">
      <h4>${o}</h4>
      <div class="compact-setting-grid compact-setting-grid--defense">
        ${l.map(r=>`
          <div class="compact-setting-row compact-setting-row--defense">
            <strong>${r.label}</strong>
            <div class="character-toggle-group">
              <label class="toggle-pill">
                <input type="checkbox" name="damage_resistance_${r.key}" ${Array.isArray(a.resistances)&&a.resistances.includes(r.key)?"checked":""} />
                <span>Resistenza</span>
              </label>
              <label class="toggle-pill">
                <input type="checkbox" name="damage_immunity_${r.key}" ${Array.isArray(a.immunities)&&a.immunities.includes(r.key)?"checked":""} />
                <span>Immunità</span>
              </label>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `).join(""),s}function Xt(e){return{resistances:_e.filter(a=>e.has(`damage_resistance_${a.key}`)).map(a=>a.key),immunities:_e.filter(a=>e.has(`damage_immunity_${a.key}`)).map(a=>a.key)}}async function Yt(e){const{activeCharacter:a,canEditCharacter:t}=oe();if(!a||!t)return;const s=await de({title:"Resistenze & Immunità",submitLabel:"Salva",content:Qt(a),cardClass:"modal-card--wide"});s&&await Z(a,{...a.data,damage_defenses:Xt(s)},"Resistenze aggiornate",()=>{e&&T(e)})}async function Jt(e){const{activeCharacter:a}=oe(),t=te();if(!a)return;if(t.offline){S("Loot disponibile solo online.","error");return}const i=oa(a)==="kg"?"0.1":"1",o=await de({title:"Aggiungi loot rapido",submitLabel:"Aggiungi",content:Wa(i),onOpen:({fieldsEl:l})=>{Ka(l)}});if(o)try{await Ha({user_id:a.user_id,character_id:a.id,name:o.get("name"),qty:Number(o.get("qty")),weight:Number(o.get("weight")),volume:Number(o.get("volume"))||0,value_cp:Number(o.get("value_cp")),category:"loot",equipable:!1,equip_slot:null,equip_slots:[],sovrapponibile:!1,is_magic:!1,max_volume:null}),S("Loot aggiunto")}catch{S("Errore loot","error")}}function Ie(e,{min:a=null,max:t=null}={}){if(!(e instanceof HTMLInputElement)||e.type!=="number"||e.closest(".modal-value-stepper"))return;const s=document.createElement("div");s.className="number-stepper modal-value-stepper";const i=document.createElement("button");i.type="button",i.className="number-stepper__button modal-value-stepper__button",i.textContent="−",i.setAttribute("aria-label","Diminuisci valore");const o=document.createElement("button");o.type="button",o.className="number-stepper__button modal-value-stepper__button",o.textContent="+",o.setAttribute("aria-label","Aumenta valore");const l=e.parentNode;if(!l)return;l.insertBefore(s,e),s.append(i,e,o);const r=u=>Number.isFinite(u)?u:0,d=u=>{const m=r(e.valueAsNumber),k=Number(e.step),A=Number.isFinite(k)&&k>0?k:1;let n=m+A*u;const E=a??(e.min!==""?Number(e.min):null),_=t??(e.max!==""?Number(e.max):null);Number.isFinite(E)&&(n=Math.max(E,n)),Number.isFinite(_)&&(n=Math.min(_,n)),e.value=String(n),e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))};i.addEventListener("click",()=>d(-1)),o.addEventListener("click",()=>d(1))}async function Zt(e,a){const{activeCharacter:t,canEditCharacter:s}=oe();if(!t)return;if(!s){S("Azioni denaro disponibili solo con profilo online","error");return}const i=te();let o=i.cache.wallet;if(!o&&!i.offline)try{o=await Ta(t.id),pe("wallet",o),o&&await ge({wallet:o})}catch{S("Errore caricamento wallet","error")}const d=await de({title:e==="pay"?"Paga monete":"Ricevi monete",submitLabel:e==="pay"?"Paga":"Ricevi",content:Da({direction:e}),onOpen:({fieldsEl:_})=>{const y=_==null?void 0:_.querySelector('input[name="amount"]');y&&Ie(y,{min:0})}});if(!d)return;o||(o={user_id:t.user_id,character_id:t.id,cp:0,sp:0,gp:0,pp:0});const u=d.get("coin"),m=Number(d.get("amount")||0),k={cp:u==="cp"?m:0,sp:u==="sp"?m:0,gp:u==="gp"?m:0,pp:u==="pp"?m:0},A=e==="pay"?-1:1,n=Object.fromEntries(Object.entries(k).map(([_,y])=>[_,y*A])),E=Ia(o,n);try{const _=await Fa({...E,user_id:o.user_id,character_id:o.character_id});await ja({user_id:o.user_id,character_id:o.character_id,direction:e,amount:n,reason:d.get("reason"),occurred_on:d.get("occurred_on")}),pe("wallet",_),await ge({wallet:_}),S("Wallet aggiornato"),a&&T(a)}catch{S("Errore aggiornamento denaro","error")}}const es=na.reduce((e,a)=>(e[a.key]=a.label,e),{}),ta={advantage:["invisibile"],disadvantage:["accecato","avvelenato","intralciato","prono","spaventato"]},sa={disadvantage:{dex:["intralciato"]},autoFail:{str:["paralizzato","privo_di_sensi","stordito"],dex:["paralizzato","privo_di_sensi","stordito"]}},fa=[{value:"",label:"Seleziona fonte"},{value:"situational",label:"Situazionale"},{value:"effect",label:"Effetto temporaneo"},{value:"condition",label:"Condizione"},{value:"armor",label:"Armatura"},{value:"racial",label:"Abilità razziale"},{value:"class",label:"Privilegio di classe"},{value:"spell",label:"Incantesimo"},{value:"item",label:"Oggetto magico/equipaggiamento"},{value:"other",label:"Altro"}];function Se(e){const a=(e==null?void 0:e.data)||{};return Array.isArray(a.conditions)?a.conditions:a.condition?[a.condition]:[]}function ye(e){return e.map(a=>es[a]||a).filter(Boolean)}function ba(e=[]){return(e||[]).some(a=>a.category==="armor"&&a.armor_type==="heavy"&&a.equipable&&me(a).length)}function ga(e,a=[]){const t=(e==null?void 0:e.data)||{},i=(a||[]).filter(m=>m.category==="weapon"&&m.equipable&&me(m).length).map(m=>({key:`weapon:${m.id??m.name}`,label:m.name||"Arma"})),l=(Array.isArray(t.spells)?t.spells:[]).filter(m=>(m.kind==="cantrip"||Number(m.level)===0)&&m.attack_roll&&m.damage_die).map(m=>({key:`spell:${m.id}`,label:m.name||"Incantesimo"})),u=!!((t.spellcasting||{}).ability&&Q(t.proficiency_bonus)!==null)?[{key:"spell-attack",label:"Incantesimi"}]:[];return[...i,...l,...u]}function He(e){const a=Se(e),t=ta.advantage.filter(o=>a.includes(o)),s=ta.disadvantage.filter(o=>a.includes(o)),i=[];return t.length&&i.push({mode:"advantage",source:"condition",reason:`Vantaggio: condizioni ${ye(t).join(", ")}.`}),s.length&&i.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${ye(s).join(", ")}.`}),i}function va(e,a,t){const i=Se(e).includes("avvelenato")?["avvelenato"]:[],o=ba(a),l=[];return i.length&&l.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${ye(i).join(", ")}.`}),t.key==="stealth"&&o&&l.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su Furtività."}),l}function as(e,a,t){const i=Se(e).includes("avvelenato")?["avvelenato"]:[],o=ba(a),l=[];return i.length&&l.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${ye(i).join(", ")}.`}),t==="dex"&&o&&l.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su tiri speciali basati su DES."}),l}function ha(e,a){const t=ya(Se(e),a.key);return t.rollMode?[{mode:t.rollMode,source:"condition",reason:t.rollModeReason}]:[]}function _a(e,a,t,s){return t==="attack_rolls"?He(e):t==="skills"?va(e,a,s):t==="saving_throws"?ha(e,s):[]}function ts(e){var a;return((a=fa.find(t=>t.value===e))==null?void 0:a.label)||e}function ve(e,a,t,s){var d,u,m,k;const i=(m=(u=(d=e==null?void 0:e.data)==null?void 0:d.roll_adjustments)==null?void 0:u[a])==null?void 0:m[t];if(!i||i.mode!=="advantage"&&i.mode!=="disadvantage")return null;const o=i.mode==="advantage"?"Vantaggio":"Svantaggio",l=(k=i.source)==null?void 0:k.toString().trim(),r=l?ts(l):"Situazionale";return{mode:i.mode,reason:`${o}: ${s} (${r}).`}}function re(e){const a=e.filter(Boolean),t=a.filter(i=>i.mode==="advantage").map(i=>i.reason).filter(Boolean),s=a.filter(i=>i.mode==="disadvantage").map(i=>i.reason).filter(Boolean);return t.length&&s.length?{rollMode:null,rollModeReason:`Vantaggio e svantaggio si annullano. ${[...t,...s].join(" ")}`}:t.length?{rollMode:"advantage",rollModeReason:t.join(" ")}:s.length?{rollMode:"disadvantage",rollModeReason:s.join(" ")}:{rollMode:null,rollModeReason:null}}function ya(e,a){const s=(sa.autoFail[a]||[]).filter(l=>e.includes(l));if(s.length)return{disabled:!0,disabledReason:`Condizioni: ${ye(s).join(", ")}`};const o=(sa.disadvantage[a]||[]).filter(l=>e.includes(l));return o.length?{rollMode:"disadvantage",rollModeReason:`Svantaggio: condizioni ${ye(o).join(", ")}.`}:{}}function $a(e,a=[]){const t=e.data||{},s=t.abilities||{},i=Q(t.proficiency_bonus),o=t.skills||{},l=t.skill_mastery||{};return xe.map(r=>{const d=!!o[r.key],u=!!l[r.key],m=$e(s[r.ability],i,d?u?2:1:0),k=m??0,A=va(e,a,r);A.push(ve(e,"skills",r.key,r.label));const n=re(A);return{value:r.key,label:`${r.label} (${U(m)})`,shortLabel:r.label,modifier:k,rollMode:n.rollMode,rollModeReason:n.rollModeReason}})}function ka(e,a=[]){const t=e.data||{},s=t.abilities||{},i=Q(t.proficiency_bonus),o=Array.isArray(t.special_skill_rolls)?t.special_skill_rolls:[];return(o.some(d=>{const u=String((d==null?void 0:d.id)??"").toLowerCase(),m=String((d==null?void 0:d.name)??"").trim().toLowerCase();return u==="initiative"||u==="default_initiative"||m==="iniziativa"})?o:[{id:"default_initiative",name:"Iniziativa",ability:"dex",proficient:!1,mastery:!1,bonus:0},...o]).map((d,u)=>{var q;const m=ne[d.ability]?d.ability:"str",k=!!d.proficient,A=!!d.mastery&&k,n=$e(s[m],i,k?A?2:1:0),E=Number(d.bonus)||0,_=(n??0)+E,y=((q=d.name)==null?void 0:q.trim())||`Tiro speciale ${u+1}`,z=as(e,a,m),$=re(z);return{value:String(d.id??u),label:`${y} (${U(_)})`,shortLabel:y,modifier:_,rollMode:$.rollMode,rollModeReason:$.rollModeReason}})}function Pe(e){const a=e.data||{},t=a.abilities||{},s=Q(a.proficiency_bonus),i=a.saving_throws||{},o=Se(e);return Ne.map(l=>{const r=!!i[l.key],d=$e(t[l.key],s,r?1:0),u=d??0,m=ya(o,l.key),k=ve(e,"saving_throws",l.key,l.label),A=m.disabled?{rollMode:null,rollModeReason:null}:re([...ha(e,l),k]),n=m.disabled?" · fallimento diretto":"";return{value:l.key,label:`${l.label} (${U(d)})${n}`,shortLabel:ne[l.key]||l.label,modifier:u,rollMode:A.rollMode,rollModeReason:A.rollModeReason,disabled:m.disabled||!1,disabledReason:m.disabledReason||null}})}function wa(e,a=[],t=[]){var q;const s=e.data||{},i=Number(s.attack_bonus_melee??s.attack_bonus)||0,o=Number(s.attack_bonus_ranged??s.attack_bonus)||0,l=(a||[]).filter(v=>v.category==="weapon"&&v.equipable&&me(v).length),r=Q(s.proficiency_bonus)??0,d=s.proficiencies||{},u=He(e),m=l.map(v=>{var X;const D=v.weapon_range||(v.range_normal?"ranged":"melee"),H=v.attack_ability||(D==="ranged"?"dex":"str"),g=ce((X=s.abilities)==null?void 0:X[H])??0,w=(v.weapon_type==="simple"?!!d.weapon_simple:v.weapon_type==="martial"?!!d.weapon_martial:!1)?r:0,h=D==="ranged"?o:i,I=g+w+(Number(v.attack_modifier)||0)+h,F=`weapon:${v.id??v.name}`,W=re([...u,ve(e,"attack_rolls",F,v.name)]);return{value:F,label:`${v.name} (${U(I)})`,shortLabel:v.name,modifier:I,rollMode:W.rollMode,rollModeReason:W.rollModeReason}}),k=Ce(e,t);k!=null&&k.statBlock.attacks.length&&k.statBlock.attacks.forEach((v,D)=>{const H=`wildshape:${D}`,g=re([...u,ve(e,"attack_rolls",H,v.name||`Attacco ${D+1}`)]);m.push({value:H,label:`${v.name||`Attacco ${D+1}`} (${U(v.to_hit||0)})`,shortLabel:v.name||`Attacco ${D+1}`,modifier:Number(v.to_hit)||0,rollMode:g.rollMode,rollModeReason:g.rollModeReason})});const n=(s.spellcasting||{}).ability,E=n?(q=s.abilities)==null?void 0:q[n]:null,_=ce(E),y=_===null||r===null?null:_+r,$=(Array.isArray(s.spells)?s.spells:[]).filter(v=>(v.kind==="cantrip"||Number(v.level)===0)&&v.attack_roll&&v.damage_die);return n&&y!==null&&$.forEach(v=>{const D=`spell:${v.id}`,H=re([...u,ve(e,"attack_rolls",D,v.name)]);m.push({value:D,label:`${v.name} (${U(y)})`,shortLabel:v.name,modifier:y,rollMode:H.rollMode,rollModeReason:H.rollModeReason})}),m}function ss(e){var m;const a=e.data||{},t=Q(a.proficiency_bonus),i=(a.spellcasting||{}).ability,o=i?(m=a.abilities)==null?void 0:m[i]:null,l=ce(o);if(!i||l===null||t===null)return[];const r=l+t,d="spell-attack",u=re([...He(e),ve(e,"attack_rolls",d,"Incantesimi")]);return[{value:d,label:`Incantesimi (${U(r)})`,shortLabel:"Incantesimi",modifier:r,rollMode:u.rollMode,rollModeReason:u.rollModeReason}]}function Fe(e){var a;return((a=_e.find(t=>t.key===e))==null?void 0:a.label)||e}function ns(e,a,t){var r;const s=Math.max(Number(a)||0,0);if(!t)return{amount:s,reason:null};const i=((r=e==null?void 0:e.data)==null?void 0:r.damage_defenses)||{},o=Array.isArray(i.resistances)?i.resistances:[],l=Array.isArray(i.immunities)?i.immunities:[];return l.includes("all")||l.includes(t)?{amount:0,reason:`immunità a ${Fe(t)}`}:o.includes("all")||o.includes(t)?{amount:Math.floor(s/2),reason:`resistenza a ${Fe(t)}`}:{amount:s,reason:null}}function Sa(e,a){if(!(a!=null&&a.consumes_ammunition))return null;const t=a.required_ammunition_type||a.ammunition_type;return(e||[]).filter(s=>s.id!==a.id).filter(s=>s.category!=="container").filter(s=>!t||s.ammunition_type===t).filter(s=>Number(s.qty)>0).sort((s,i)=>String(s.name||"").localeCompare(String(i.name||""),"it",{sensitivity:"base"}))[0]||null}async function is(e,a){const t=Sa(e,a);if(!t)return!1;const s=Math.max((Number(t.qty)||0)-1,0),i=await Ae(t.id,{qty:s}),l=(te().cache.items||[]).map(r=>String(r.id)===String(t.id)?{...r,...i||{},qty:s}:r);return pe("items",l),await ge({items:l}),S(`${t.name} consumato (${s} rimasti)`),!0}function os(e){var k,A,n;const{activeCharacter:a,sheetCharacter:t,canEditCharacter:s,companions:i}=oe();if(!a||!e)return;const o=te().cache.items||[],l=wa(t||a,o,i),r=l.find(E=>E.value===e);if(!r)return;const d=e.startsWith("weapon:")?e.replace("weapon:",""):null,u=d?o.find(E=>String(E.id)===d||E.name===d):null;if(u!=null&&u.consumes_ammunition&&!Sa(o,u)){S("Munizioni esaurite o non disponibili per questa arma.","error");return}let m=!1;he({title:`Tiro per Colpire • ${r.shortLabel||r.label}`,mode:"d20",rollType:"TC",selection:{label:"Attacco",options:l,value:r.value},allowInspiration:!!((k=a==null?void 0:a.data)!=null&&k.inspiration)&&s,weakPoints:Number((n=(A=a==null?void 0:a.data)==null?void 0:A.hp)==null?void 0:n.weak_points)||0,characterId:a.id,historyLabel:r.shortLabel||r.label,onRollComplete:async()=>{if(!(!(u!=null&&u.consumes_ammunition)||m)){m=!0;try{await is(te().cache.items||o,u)}catch{S("Errore consumo munizioni","error")}}}})}function Aa(e){var k,A,n,E,_;const{activeCharacter:a,sheetCharacter:t,companions:s,canEditCharacter:i}=oe(),o=te().cache.items||[],l=!!((k=a==null?void 0:a.data)!=null&&k.inspiration)&&i,r=Number((n=(A=a==null?void 0:a.data)==null?void 0:A.hp)==null?void 0:n.weak_points)||0,d=l&&a?async()=>{const y=a.data||{};y.inspiration&&await Z(a,{...y,inspiration:!1},"Ispirazione consumata",Me?()=>T(Me):null)}:null,m={"saving-throws":{title:"Tiro Salvezza",mode:"d20",rollType:"TS",selection:a?{label:"Tiro salvezza",options:Pe(t||a)}:null},skills:{title:"Tiro Abilità",mode:"d20",rollType:"TA",selection:a?{label:"Abilità",options:$a(t||a,o)}:null},"special-skills":{title:"Tiro Abilità Speciale",mode:"d20",rollType:"TA",selection:a?{label:"Abilità speciale",options:ka(t||a,o)}:null},"attack-roll":{title:"Tiro per Colpire",mode:"d20",rollType:"TC",selection:a?{label:"Attacco",options:wa(t||a,o,s)}:null},"spell-attack":{title:"Tiro per Colpire Incantesimi",mode:"d20",rollType:"TC",selection:a?{label:"Incantesimi",options:ss(a)}:null},roller:{title:"Lancia Dadi generico",mode:"generic",rollType:"GEN"}}[e]??{title:"Lancia dadi",mode:"generic"};if(e==="spell-attack"&&!((_=(E=m.selection)==null?void 0:E.options)!=null&&_.length)){S("Configura abilità da incantatore e bonus competenza per usare questo tiro.","error");return}he({...m,allowInspiration:l,onConsumeInspiration:d,weakPoints:r,characterId:a==null?void 0:a.id})}async function ls(e,a){var i,o;const{activeCharacter:t}=oe();if(!(!t||!await ze({title:"Conferma riposo",message:e==="long_rest"?"Stai per effettuare un riposo lungo: risorse, slot e recuperi verranno aggiornati in base alle regole configurate.":"Stai per effettuare un riposo breve: verranno aggiornate solo le risorse che si recuperano con questo tipo di riposo.",confirmLabel:"Conferma riposo"})))try{await La(t.id,e),S(e==="long_rest"?"Riposo lungo completato":"Riposo breve completato");const r=await ia(t.id);pe("resources",r),await ge({resources:r});const d=tt(t.data,e);if(d?await Z(t,d,null,a?()=>T(a):null):a&&T(a),e==="long_rest"){const u=te().characters.find(m=>m.id===t.id);(o=(i=u==null?void 0:u.data)==null?void 0:i.spellcasting)!=null&&o.can_prepare&&await ra(u,a?()=>T(a):null)}}catch{S("Errore aggiornamento risorse","error")}}async function rs(e,a){var y,z,$,q,v,D,H,g;const{canEditCharacter:t}=oe();if(!e)return;if(!t){S("Azioni HP disponibili solo con profilo online","error");return}const s=((y=e.data)==null?void 0:y.hit_dice)||{},i=Number(s.used)||0,o=Number(s.max)||0,l=Math.max(o-i,0),r=je(s.die);if(!r){S("Configura un dado vita valido","error");return}if(l<=0){S("Nessun dado vita disponibile","error");return}const d=ce(($=(z=e.data)==null?void 0:z.abilities)==null?void 0:$.con)??0;let u=1;const k=await fe({keepOpen:!1,title:`Dado vita • ${s.die||`d${r}`}`,mode:"generic",notation:`1d${r}`,modifier:d,rollType:"GEN",characterId:e.id,historyLabel:"Dado vita",genericDiceMax:l,warning:"Attenzione: ogni dado vita lanciato verrà sottratto ai dadi vita disponibili.",onRollComplete:({diceCount:N})=>{u=Math.max(Number(N)||1,1)}}).waitForRoll;if(!k||k<=0)return;if(u>l){S(`Hai solo ${l} dadi vita disponibili`,"error");return}const A=Number((v=(q=e.data)==null?void 0:q.hp)==null?void 0:v.current)||0,n=(H=(D=e.data)==null?void 0:D.hp)==null?void 0:H.max,E=A+Number(k),_=n!=null?Math.min(E,Number(n)):E;await Z(e,{...e.data,hp:{...(g=e.data)==null?void 0:g.hp,current:_},hit_dice:{...s,used:Math.min(i+u,o)}},`PF curati +${k} (${u}d${r})`,()=>{a&&T(a)})}async function cs(e,a){var c,p,f,b,L,x,C,M,R,O,G;const{activeCharacter:t,canEditCharacter:s}=oe();if(!t)return;if(!s){S("Azioni HP disponibili solo con profilo online","error");return}const l=await de({title:e==="heal"?"Cura PF":"Subisci danno",submitLabel:e==="heal"?"Cura":"Danno",content:ds(t,{allowHitDice:!1,allowTempHp:e==="heal",allowMaxOverride:e==="damage"})});if(!l)return;const r=l.has("use_hit_dice"),d=l.has("temp_hp"),u=((c=t.data)==null?void 0:c.hit_dice)||{},m=((p=t.data)==null?void 0:p.abilities)||{},k=Number(u.used)||0,A=Number(u.max)||0,n=je(u.die),E=Math.max(Number(l.get("hit_dice_count"))||1,1);let _=Number(l.get("amount"));const y=_,z=e==="damage"&&((f=l.get("damage_type"))==null?void 0:f.toString())||"";if(e==="heal"&&r){if(!n){S("Configura un dado vita valido","error");return}if(k>=A){S("Nessun dado vita disponibile","error");return}const B=Math.max(A-k,0);if(E>B){S(`Hai solo ${B} dadi vita disponibili`,"error");return}const j=ce(m.con)??0,ee=Array.from({length:E},()=>at(n)).reduce((J,ie)=>J+ie,0);_=Math.max(ee+j*E,1)}if(!_||_<=0){S("Inserisci un valore valido","error");return}const $=e==="damage"?ns(t,_,z):{amount:_,reason:null};e==="damage"&&(_=$.amount);const q=Number((L=(b=t.data)==null?void 0:b.hp)==null?void 0:L.current)||0,v=Number((C=(x=t.data)==null?void 0:x.hp)==null?void 0:C.temp)||0,D=(R=(M=t.data)==null?void 0:M.hp)==null?void 0:R.max,H=l.get("hp_max_override"),g=H===null||H===""?null:Number(H);if(e==="damage"&&g!==null&&(!Number.isFinite(g)||g<=0)){S("Inserisci un massimo PF valido","error");return}let N=q,w=v;if(e==="heal"&&d)w=v+_;else if(e==="heal")N=q+_;else{const B=Math.min(v,_);w=v-B;const j=_-B;N=Math.max(q-j,0)}const h=g??D,I=h!=null?Math.min(N,Number(h)):N,F=e==="heal"&&r?{...u,used:Math.min(k+E,A)}:u,W=e==="damage"&&z?` ${Fe(z).toLowerCase()}`:"",X=e==="damage"&&$.reason?` (da ${y}, ${$.reason})`:"",ae=e==="heal"?`${d?"HP temporanei +":"PF curati +"}${_}${r?` (${E}d${n})`:""}`:`Danno${W} ${_}${X}`,le=e==="damage"&&Number(_)>0&&!!((O=t.data)!=null&&O.concentration_active),Y=async()=>{var V,ee,J;if(a&&T(a),!le)return;const B=Pe(t),j=B.find(ie=>ie.value==="con");!j||j.disabled||he({title:"Tiro salvezza concentrazione • COS",mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:B,value:j.value},allowInspiration:!!((V=t==null?void 0:t.data)!=null&&V.inspiration)&&s,weakPoints:Number((J=(ee=t==null?void 0:t.data)==null?void 0:ee.hp)==null?void 0:J.weak_points)||0,characterId:t.id,historyLabel:"TS concentrazione"})};await Z(t,{...t.data,hp:{...(G=t.data)==null?void 0:G.hp,current:I,temp:w,max:g??D},hit_dice:F},ae,Y)}function he({title:e,mode:a,selection:t=null,allowInspiration:s=!1,onConsumeInspiration:i=null,rollType:o=null,weakPoints:l=0,characterId:r=null,historyLabel:d=null,onRollComplete:u=null}){fe({keepOpen:!0,title:e,mode:a,selection:t,allowInspiration:s,onConsumeInspiration:i,rollType:o,weakPoints:l,characterId:r,historyLabel:d,onRollComplete:u})}function ds(e,{allowHitDice:a=!0,allowTempHp:t=!1,allowMaxOverride:s=!1}={}){var H,g,N;const i=(w,h={})=>{const I=w==null?void 0:w.querySelector('input[type="number"]');I&&Ga(I,h)},o=document.createElement("div");o.className="modal-form-grid hp-shortcut-fields";const l=Ee({label:"Valore",name:"amount",type:"number",value:"1"});l.classList.add("hp-shortcut-fields__amount");const r=l.querySelector("input");r&&Ie(r,{min:1}),r&&(r.min="1",r.required=!0);const d=document.createElement("div");if(d.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",d.appendChild(l),t){const w=document.createElement("div");w.className="modal-toggle-field",w.innerHTML=`
      <span class="modal-toggle-field__label">HP temporanei</span>
      <label class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="temp_hp" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </label>
    `,d.appendChild(w)}if(o.appendChild(d),!a){if(s){const w=document.createElement("label");w.className="field hp-shortcut-fields__damage-type";const h=document.createElement("span");h.textContent="Tipo di danno";const I=Le([{value:"",label:"Nessun tipo (danno normale)"},..._e.map(X=>({value:X.key,label:X.label}))],"");I.name="damage_type",w.append(h,I),d.appendChild(w);const F=Ee({label:"Nuovo massimo PF",name:"hp_max_override",type:"number",value:((g=(H=e==null?void 0:e.data)==null?void 0:H.hp)==null?void 0:g.max)??""});F.classList.add("hp-shortcut-fields__max");const W=F.querySelector("input");W&&(Ie(W,{min:1}),W.min="1"),d.appendChild(F)}return o}const u=((N=e==null?void 0:e.data)==null?void 0:N.hit_dice)||{},m=Number(u.used)||0,k=Number(u.max)||0,A=Math.max(k-m,0),n=je(u.die),E=A>0&&n,_=document.createElement("div");_.className="modal-toggle-field";const y=u.die?`${u.die}`:"dado vita";_.innerHTML=`
    <span class="modal-toggle-field__label">Usa dado vita (${y}) · rimasti ${A}/${k||"-"}</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="use_hit_dice" ${E?"":"disabled"} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const z=document.createElement("label");z.className="field hit-dice-count hp-shortcut-fields__count",z.innerHTML=`
    <span>Numero dadi vita</span>
    <input type="number" name="hit_dice_count" min="1" max="${A}" value="1" />
  `,i(z,{decrementLabel:"Riduci dadi vita",incrementLabel:"Aumenta dadi vita"});const $=document.createElement("div");if($.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",$.append(_,z),o.appendChild($),!E){const w=document.createElement("p");w.className="muted",w.textContent="Nessun dado vita disponibile o configurato.",o.appendChild(w)}const q=_.querySelector("input"),v=z.querySelector("input");v&&(v.required=!1);const D=()=>{const w=q==null?void 0:q.checked;r&&(r.disabled=!!w,r.required=!w,w?r.value="":r.value||(r.value="1"),v&&(v.disabled=!w,v.required=!!w,w||(v.value="1")))};return q==null||q.addEventListener("change",D),D(),o}export{_s as bindGlobalFabHandlers,T as renderHome};
