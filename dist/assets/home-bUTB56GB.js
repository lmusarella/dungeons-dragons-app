import{s as Be,a as ze,b as oe,c as ua,e as Ra,d as Se,R as Me,u as Ta,f as pa,g as Ba,h as Ie,i as za}from"./constants--atOIwl7.js";import{c as Da,g as ma,f as Ia,a as ja,b as Fa,d as Ha,e as Pa,h as Oa,m as Wa,i as Va,u as Ua,j as Ka,k as Ga,l as Qa,n as Xa,o as Ce,p as Xe,q as Ya}from"./walletApi-C6WlvUb8.js";import{c as A,o as ce,u as be,a as ye,b as je,g as te,n as fe,d as qe,e as Re,s as Ye,f as Ja,h as Za,i as et,j as at}from"./index-B3mIQOv_.js";import{openDiceOverlay as he}from"./dice-DsFE2rIl.js";import{o as Je}from"./characterDrawer-Cmm8geID.js";import{g as We,a as Ve}from"./weaponMasteries-zUcl4F-E.js";import{n as X,c as Ee,f as V,g as me,a as tt,b as st,d as nt,e as ge,h as fa,s as it,i as ot,p as lt,j as Ze,k as Fe,l as Ue,r as rt,m as ct,o as dt,q as ut,t as pt}from"./utils-Tv02vTp-.js";import{f as mt}from"./companionsApi-DktEtGrr.js";import{s as J,o as ba,a as ft,f as ea,b as aa,c as bt,d as gt,e as ta,g as vt,r as ht,h as _t,i as yt,j as $t,k as sa,l as kt,m as wt,n as St}from"./modals-Ck6rRns6.js";function _e(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function At(e){const a=e&&typeof e=="object"?e:{};return{abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10,...a.abilities||{}},hp:{current:1,max:1,...a.hp||{}},speeds:{walk:null,fly:null,climb:null,burrow:null,...a.speeds||{}},attacks:Array.isArray(a.attacks)?a.attacks:[]}}function ga(e,a=[]){const t=(e==null?void 0:e.data)||{};if(!t.wild_shape_enabled)return null;const s=t.wild_shape||{};if(!s.active_companion_id)return null;const i=(a||[]).find(c=>String(c.id)===String(s.active_companion_id));if(!i)return null;const o=At(i.stat_block),r=Math.max(Number(o.hp.max)||Number(o.hp.current)||1,1),l=Math.max(0,Math.min(Number(s.hp_current??o.hp.current??r)||0,r));return{companion:i,statBlock:o,hpCurrent:l,hpMax:r}}function Et(e={}){return[["walk","terra"],["fly","volo"],["climb","scalata"],["burrow","scavare"]].map(([t,s])=>Number(e==null?void 0:e[t])?`${s} ${Number(e[t])} m`:"").filter(Boolean).join(" · ")}function Mt(e,a){return e?`
    <div>
      <p>Non hai ancora un personaggio.</p>
      <div class="button-row">
        <button class="primary" data-create-character>Nuovo personaggio</button>
      </div>
    </div>
  `:`<p class="muted">${a?"Modalità offline attiva: crea un personaggio quando torni online.":"Accedi per creare un personaggio."}</p>`}function Lt(e,a,t=[],s=[]){const i=e.data||{},o=i.hp||{},r=i.hit_dice||{},l=i.abilities||{},c=ga(e,s),u=c?{...l,str:Math.max(Number(l.str)||0,Number(c.statBlock.abilities.str)||0),dex:Math.max(Number(l.dex)||0,Number(c.statBlock.abilities.dex)||0),con:Math.max(Number(l.con)||0,Number(c.statBlock.abilities.con)||0)}:l,p=X(i.proficiency_bonus),$=!!i.inspiration,y=!!i.concentration_active,n=i.initiative??me(u.dex),E=i.skills||{},w=i.skill_mastery||{},k=tt(u,p,E,w),B=X(o.current),g=X(o.max),q=X(o.temp),v=i.death_saves||{},T=Math.max(0,Math.min(3,Number(v.successes)||0)),F=Math.max(0,Math.min(3,Number(v.failures)||0)),h=g?Math.min(Math.max(Number(B)/g*100,0),100):0,N=Math.max(0,Number(q)||0),S=Math.max(0,Number(g??B??0)),_=N>0,D=_?100:0,I=_?S:1,O=_?N:0,K=g?`${B??"-"}/${g}`:`${B??"-"}`,Z=g?`${Math.round(h)}%`:"-",ue=q??"-",Y=Math.max(0,Math.min(6,Number(o.weak_points)||0)),d=Array.isArray(i.conditions)?i.conditions:i.condition?[i.condition]:[],m=ua.filter(P=>d.includes(P.key)),f=m.length?m.map(P=>P.label).join(", "):"Nessuna condizione",L=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti delle condizioni">?</summary>
      <div class="info-tooltip__panel">
        ${m.length?`
      <ul class="condition-track__list">
        ${m.map(P=>`<li><strong>${P.label}:</strong> ${P.effect}</li>`).join("")}
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
  `,W=`Livello attuale: ${Y}`,G=st(i,l,t),j=!!i.darkvision_enabled,H=X(i.darkvision_range_m),U=j?`${H??18} m`:"No",ie=(s||[]).filter(P=>["familiar","summon","transformation"].includes(P.kind||"familiar")),ee=c?Math.min(Math.max(c.hpCurrent/c.hpMax*100,0),100):0,le=c?Et(c.statBlock.speeds):"",ve=[{key:"str",label:oe.str,value:u.str,wild:!!c},{key:"dex",label:oe.dex,value:u.dex,wild:!!c},{key:"con",label:oe.con,value:u.con,wild:!!c},{key:"int",label:oe.int,value:l.int},{key:"wis",label:oe.wis,value:l.wis},{key:"cha",label:oe.cha,value:l.cha}];return`
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
            <strong>${V(p)}</strong>
          </div>
          <div class="inspiration-chip">
            <span>Ispirazione</span>
            <button
              class="inspiration-toggle"
              type="button"
              data-toggle-inspiration
              aria-pressed="${$}"
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
              aria-pressed="${y}"
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
          ${ve.map(P=>{const ae=X(P.value),Q=ae===null?"-":ot(ae);return`
            <div class="stat-card stat-card--${P.key} ${P.wild?"stat-card--wild-shape":""}">
              <span>${P.label}${P.wild?" <small>forma</small>":""}</span>
              <strong>${ae??"-"}</strong>
              <span class="stat-card__modifier" aria-label="Modificatore ${P.label}">${Q}</span>
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
            <strong>${V(X(n))}</strong>
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
              <strong>${K}</strong>
              <span class="hp-bar-label__percent" aria-label="Percentuale vita ${Z}">${Z}</span>
              <span class="hp-bar-label__divider" aria-hidden="true">•</span>
              <span class="hp-bar-label__temp-group ${_?"is-active":""}">
                <span class="hp-bar-label__temp">HP temporanei</span>
                <strong>${ue}</strong>
              </span>
            </div>
            <div class="hp-bar-track">
              <div class="hp-bar" style="flex: ${I};">
                <div class="hp-bar__fill" style="width: ${h}%;"></div>
              </div>
              ${_?`
              <div class="hp-bar hp-bar--temp is-active" style="flex: ${O};">
                <div class="hp-bar__fill hp-bar__fill--temp" style="width: ${D}%;"></div>
              </div>
              `:""}
            </div>
            ${c?`
            <div class="hp-bar-label hp-bar-label--wild-shape">
              <span>HP forma selvatica</span>
              <strong>${c.hpCurrent}/${c.hpMax}</strong>
              <span class="hp-bar-label__percent">${Math.round(ee)}%</span>
              <span class="hp-bar-label__divider" aria-hidden="true">•</span>
              <span>${_e(c.companion.name)}</span>
              ${le?`<span class="muted">${_e(le)}</span>`:""}
            </div>
            <div class="hp-bar-track hp-bar-track--wild-shape">
              <div class="hp-bar">
                <div class="hp-bar__fill" style="width: ${ee}%;"></div>
              </div>
            </div>
            <div class="wild-shape-hp-actions">
              <button class="ghost-button ghost-button--compact wild-shape-end-button" type="button" data-end-wild-shape ${a?"":"disabled"}>Termina</button>
            </div>
            `:i.wild_shape_enabled?`
            <div class="wild-shape-empty">
              <span>Forma selvatica pronta</span>
              <button class="ghost-button ghost-button--compact" type="button" data-open-wild-shape ${a&&ie.length?"":"disabled"}>
                Scegli forma (${ie.length})
              </button>
            </div>
            `:""}
            <div class="hp-panel-hit-dice">
              <span>Dadi vita</span>
              <strong>${nt(r)}</strong>
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
            <strong>${k??"-"}</strong>
          </div>
          <div class="stat-chip stat-chip--highlight stat-chip--darkvision">
            <span>Scurovisione</span>
            <strong>${U}</strong>
          </div>
          <div class="hp-panel-status-row">
            <div class="weakness-track">
              <div class="track-label-row">
                <span class="weakness-track__label">Punti indebolimento</span>
                ${R}
              </div>
              <div class="weakness-track__group" role="radiogroup" aria-label="Livelli indebolimento">
                ${x.map(P=>{const ae=P.value===Y;return`
                  <button
                    class="death-save-dot ${ae?"is-filled":""}"
                    type="button"
                    role="radio"
                    aria-checked="${ae}"
                    data-weakness-level="${P.value}"
                    aria-label="Livello ${P.value}: ${P.description}"
                  >
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="weakness-track__description">${W}</div>
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
                ${Array.from({length:3},(P,ae)=>{const Q=ae+1;return`
                  <button class="death-save-dot ${Q<=T?"is-filled":""}" type="button" data-death-save="successes" data-death-save-index="${Q}" aria-label="Successi ${Q}">
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="death-saves__group" aria-label="Fallimenti">
                <span class="death-saves__tag">✗</span>
                ${Array.from({length:3},(P,ae)=>{const Q=ae+1;return`
                  <button class="death-save-dot ${Q<=F?"is-filled":""}" type="button" data-death-save="failures" data-death-save-index="${Q}" aria-label="Fallimenti ${Q}">
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
        ${Rt(e,t,a)}
      </div>
    </div>
  `}function Nt(e){const a=e.data||{},t=a.abilities||{},s=X(a.proficiency_bonus),i=a.skills||{},o=a.skill_mastery||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${ze.map(r=>{const l=!!i[r.key],c=!!o[r.key],u=Ee(t[r.ability],s,l?c?2:1:0);return`
          <button class="modifier-card modifier-card--interactive ${c?"modifier-card--mastery":l?"modifier-card--proficiency":""}" type="button" data-skill-card="${r.key}" aria-label="Tira abilità ${r.label}">
            <div>
              <div class="modifier-title">
                <strong>${r.label}</strong>
                <span class="modifier-ability modifier-ability--${r.ability}">${oe[r.ability]}</span>
              </div>
            </div>
            <div class="modifier-value">${V(u)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function xt(e){const a=Array.isArray(e.special_skill_rolls)?e.special_skill_rolls:[];return a.some(i=>{const o=String((i==null?void 0:i.id)??"").toLowerCase(),r=String((i==null?void 0:i.name)??"").trim().toLowerCase();return o==="initiative"||o==="default_initiative"||r==="iniziativa"})?a:[{id:"default_initiative",name:"Iniziativa",ability:"dex",proficient:!1,mastery:!1,bonus:0},...a]}function Ct(e){const a=e.data||{},t=a.abilities||{},s=X(a.proficiency_bonus);return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${xt(a).map((o,r)=>{var w;const l=oe[o.ability]?o.ability:"str",c=!!o.proficient,u=!!o.mastery&&c,p=Ee(t[l],s,c?u?2:1:0),$=Number(o.bonus)||0,y=(p??0)+$,n=u?"modifier-card--mastery":c?"modifier-card--proficiency":"",E=((w=o.name)==null?void 0:w.trim())||`Tiro speciale ${r+1}`;return`
          <button class="modifier-card modifier-card--interactive ${n}" type="button" data-special-skill-card="${o.id??r}" aria-label="Tira abilità speciale ${E}">
            <div>
              <div class="modifier-title">
                <strong>${E}</strong>
                <span class="modifier-ability modifier-ability--${l}">${oe[l]}</span>
              </div>
            </div>
            <div class="modifier-value">${V(y)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function qt(e){const a=e.data||{},t=a.abilities||{},s=X(a.proficiency_bonus),i=a.saving_throws||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Be.map(o=>{const r=!!i[o.key],l=Ee(t[o.key],s,r?1:0);return`
          <button class="modifier-card modifier-card--interactive ${r?"modifier-card--proficiency":""}" type="button" data-saving-throw-card="${o.key}" aria-label="Tira salvezza ${o.label}">
            <div>
              <div class="modifier-title">
                <strong>${o.label}</strong>
              </div>
            </div>
            <div class="modifier-value">${V(l)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function na(e,a){const s=(Array.isArray(e==null?void 0:e[a])?e[a]:[]).map(i=>{var o;return((o=Se.find(r=>r.key===i))==null?void 0:o.label)||i}).filter(Boolean);return s.length?`<div class="tag-row">${s.map(i=>`<span class="chip chip--defense">${i}</span>`).join("")}</div>`:'<p class="muted">Nessuna voce configurata.</p>'}function Rt(e,a=[],t=!1){const s=e.data||{},i=s.proficiencies||{},o=s.proficiency_notes||"",{tools:r,languages:l}=lt(o),c=s.language_proficiencies||"",u=Ze(c),p=s.talents||"",$=Ze(p),y=s.damage_defenses||{},E=[...u,...l].reduce((g,q)=>{const v=q.trim();if(!v)return g;const T=v.toLowerCase();return g.seen.has(T)||(g.seen.add(T),g.values.push(v)),g},{values:[],seen:new Set}).values,w=Ra.filter(g=>i[g.key]).map(g=>g.label),k=s.weapon_mastery_enabled||Array.isArray(s.weapon_masteries)&&s.weapon_masteries.length>0?Array.isArray(s.weapon_masteries)?s.weapon_masteries:[]:[],B=k.length>0||!!s.weapon_mastery_enabled;return`
    <div class="detail-section">
      <div class="proficiency-tabs" data-proficiency-tabs>
        <div class="tab-bar" role="tablist" aria-label="Competenze extra">
          <button class="tab-bar__button is-active" type="button" role="tab" aria-selected="true" data-proficiency-tab="equipment">
            Equipaggiamento
          </button>
          ${B?`<button class="tab-bar__button" type="button" role="tab" aria-selected="false" data-proficiency-tab="weapon-masteries">
            Maestrie armi
          </button>`:""}
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
          ${w.length?`<div class="tag-row">${w.map(g=>`<span class="chip">${g}</span>`).join("")}</div>`:'<p class="muted">Nessuna competenza equipaggiamento.</p>'}
        </div>
        ${B?`<div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="weapon-masteries">
          ${k.length?`<div class="weapon-mastery-list">${k.map(g=>`<div class="weapon-mastery-card__body"><strong>${We(g)}</strong><small>${Ve(g)}</small></div>`).join("")}</div>`:'<p class="muted">Nessuna maestria arma selezionata.</p>'}
        </div>`:""}
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="tools">
          ${r.length?`<div class="tag-row">${r.map(g=>`<span class="chip">${g}</span>`).join("")}</div>`:'<p class="muted">Aggiungi strumenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="languages">
          ${E.length?`<div class="tag-row">${E.map(g=>`<span class="chip">${g}</span>`).join("")}</div>`:'<p class="muted">Aggiungi lingue conosciute nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="talents">
          ${$.length?`<div class="tag-row">${$.map(g=>`<span class="chip">${g}</span>`).join("")}</div>`:'<p class="muted">Aggiungi talenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="defenses">
          <div class="defense-summary-grid">
            <div class="defense-summary-card">
              <span>Resistenze</span>
              ${na(y,"resistances")}
            </div>
            <div class="defense-summary-card">
              <span>Immunità</span>
              ${na(y,"immunities")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function Tt(e,a=[],t=!1){const s=(a||[]).filter(l=>ge(l).length),i=(a||[]).filter(l=>l.attunement_active).length,o=Da(a),r=ma(e);return`
    <section class="card home-card home-section home-scroll-panel">
      <header class="card-header">
        <div>
          <p class="eyebrow">Gestione Equipaggiamento</p>
          <div class="pill-row">
            <span class="pill pill--accent">Oggetti in sintonia: ${i}</span>
            <span class="pill">Carico totale: ${Ia(o,r)}</span>
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
            ${s.map(l=>{const c=ja(l);return`
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
                          ${Fa(l.category)} · ${Ha(ge(l))}
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
  `}function Bt(e,a=[],t=[]){var F;const s=e.data||{},i=Number(s.attack_bonus_melee??s.attack_bonus)||0,o=Number(s.attack_bonus_ranged??s.attack_bonus)||0,r=Number(s.damage_bonus_melee??s.damage_bonus)||0,l=Number(s.damage_bonus_ranged??s.damage_bonus)||0,c=Number(s.extra_attacks)||0,u=a.filter(h=>h.category==="weapon"&&h.equipable&&ge(h).length),p=ga(e,t),y=(s.spellcasting||{}).ability,n=y?(F=s.abilities)==null?void 0:F[y]:null,E=me(n),w=X(s.proficiency_bonus),k=E===null||w===null?null:E+w,g=(Array.isArray(s.spells)?s.spells:[]).filter(h=>(h.kind==="cantrip"||Number(h.level)===0)&&h.attack_roll&&h.damage_die),q=g.length&&k!==null&&y;if(!u.length&&!q&&!(p!=null&&p.statBlock.attacks.length))return'<p class="muted">Nessuna arma equipaggiata.</p>';const v=[];c>0&&v.push(`Attacco Extra (${c})`),i&&v.push(`Mischia attacco ${V(i)}`),r&&v.push(`Mischia danni ${V(r)}`),o&&v.push(`Distanza attacco ${V(o)}`),l&&v.push(`Distanza danni ${V(l)}`);const T=v.length?`<div class="tag-row">${v.map(h=>`<span class="chip">${h}</span>`).join("")}</div>`:"";return`
    ${p?`<div class="tag-row"><span class="chip chip--wild-shape">Forma selvatica: ${_e(p.companion.name)}</span><span class="chip">FOR/DES/COS sostituite</span></div>`:""}
    ${T}
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${p!=null&&p.statBlock.attacks.length?p.statBlock.attacks.map((h,N)=>{const S=h.name||`Attacco ${N+1}`,_=Number(h.damage_modifier)||0,D=`${h.damage||"-"}${_?` ${V(_)}`:""}`;return`
          <div class="modifier-card attack-card attack-card--wild-shape" data-roll-attack="wildshape:${N}">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${_e(S)}</strong>
                <span class="modifier-ability modifier-ability--str">Forma</span>
                <span class="attack-card__hit">${V(h.to_hit||0)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${_e(D)}</span>
                <span class="muted">${_e(p.companion.name)}</span>
              </div>
            </div>
            <div class="attack-card__actions">
              <button class="icon-button icon-button--fire" data-roll-damage="wildshape:${N}" aria-label="Calcola danni ${_e(S)}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          </div>
        `}).join(""):""}
        ${u.map(h=>{var re;const N=h.weapon_range||(h.range_normal?"ranged":"melee"),S=h.attack_ability||(N==="ranged"?"dex":"str"),_=me((re=s.abilities)==null?void 0:re[S])??0,D=s.proficiencies||{},O=(h.weapon_type==="simple"?!!D.weapon_simple:h.weapon_type==="martial"?!!D.weapon_martial:!1)?X(s.proficiency_bonus)??0:0,K=N==="ranged"?o:i,Z=N==="ranged"?l:r,ue=_+O+(Number(h.attack_modifier)||0)+K,Y=fa(h).filter(ne=>ne.damageDie),d=Number(h.range_normal)||null,m=Number(h.range_disadvantage)||null,f=Number(h.melee_range)||1.5,b=[];N==="melee"&&f>1.5&&b.push(`Portata ${f} m`),N==="melee"&&h.is_thrown&&d&&b.push(`Lancio ${d}${m?`/${m}`:""}`),N!=="melee"&&d&&b.push(`Gittata ${d}${m?`/${m}`:""}`);const L=h.required_ammunition_type||h.ammunition_type,x=h.consumes_ammunition?a.filter(ne=>ne.category!=="container").filter(ne=>L?ne.ammunition_type===L:ne.ammunition_type).reduce((ne,$e)=>ne+(Number($e.qty)||0),0):null,C=Pa.get(L)||"Munizioni",M=x!==null?`${C} ${x}`:"",R=[...b,M].filter(Boolean).join(" · "),W=S==="dex"?"DES":S==="str"?"FOR":S.toUpperCase(),G=h.id??h.name,j=Y.length?Y:[{id:"default",label:"",damageDie:null,damageModifier:Number(h.damage_modifier)||0}],H=j.find(ne=>ne.id===h.selected_damage_mode)||j[0],U=_+(Number(H.damageModifier)||0)+Z,ie=H.damageDie?`${H.damageDie}${U?` ${V(U)}`:""}`:"-",ee=H.id!=="default"?H.label:"",le=ee?`Impugnatura: ${ee}`:"",ve=h.weapon_mastery?We(h.weapon_mastery):"",P=h.weapon_mastery&&Array.isArray(s.weapon_masteries)&&s.weapon_masteries.includes(h.weapon_mastery),ae=ve?`Maestria: ${ve}${P?"":" (non selezionata)"}`:"",Q=`weapon:${G}:${H.id}`,se=j.length>1?`<button class="icon-button icon-button--weapon-mode" data-cycle-weapon-mode="${G}" aria-label="Cambia impugnatura ${h.name}" title="Cambia impugnatura: ${ee||H.label}"><span aria-hidden="true">🔁</span></button>`:"";return`
          <div class="modifier-card attack-card" data-roll-attack="weapon:${h.id??h.name}">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${h.name}</strong>
                <span class="modifier-ability modifier-ability--${S}">${W}</span>
                <span class="attack-card__hit">${V(ue)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${ie}</span>
                ${le?`<span class="muted">${le}</span>`:""}
                ${ae?`<span class="muted" title="${Ve(h.weapon_mastery)}">${ae}</span>`:""}
                ${R?`<span class="muted">${R}</span>`:""}
              </div>
            </div>
            <div class="attack-card__actions">
              ${se}
              <button class="icon-button icon-button--fire" data-roll-damage="${Q}" aria-label="Calcola danni ${h.name}${ee?` ${ee}`:""}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          </div>
        `}).join("")}
        ${q?g.map(h=>{const N=Number(h.damage_modifier)||0,S=`${h.damage_die}${N?` ${V(N)}`:""}`,_=oe[y]??(y==null?void 0:y.toUpperCase()),D=h.range?`Range ${h.range}`:"";return`
            <div class="modifier-card attack-card" data-roll-attack="spell:${h.id}">
              <div class="attack-card__body">
                <div class="attack-card__title">
                  <strong class="attack-card__name">${h.name}</strong>
                  <span class="modifier-ability modifier-ability--${y}">${_}</span>
                  <span class="attack-card__hit">${V(k)}</span>
                </div>
                <div class="attack-card__meta">
                  <span class="attack-card__damage">${S}</span>
                 
                  ${D?`<span class="muted">${D}</span>`:""}
                </div>
              </div>
              <button class="icon-button icon-button--fire" data-roll-damage="spell:${h.id}" aria-label="Calcola danni ${h.name}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          `}).join(""):""}
      </div>
    </div>
  `}function zt(e,a=!1){var S;const t=e.data||{},s=t.spell_notes||"",i=Array.isArray(t.spells)?it(t.spells):[],o=t.spellcasting||{},r=X(t.proficiency_bonus),l=o.ability,c=l?(S=t.abilities)==null?void 0:S[l]:null,u=me(c),p=u===null||r===null?null:8+u+r,$=u===null||r===null?null:u+r,y=l?oe[l]:null,n=o.slots||{},E=o.slots_max||{},w=o.recharge||"long_rest",B=Array.from({length:9},(_,D)=>D+1).map(_=>{const D=Math.max(0,Number(n[_])||0),I=Math.max(D,Number(E[_])||0);return{level:_,count:D,max:I}}).filter(_=>_.max>0),g=[`${y??"-"}`,`CD ${p===null?"-":p}`,`TC ${$===null?"-":V($)}`],q=g.length?`<div class="tag-row">${g.map(_=>`<span class="chip">${_}</span>`).join("")}</div>`:"",v=i.filter(_=>{if((Number(_.level)||0)<1)return!1;const I=_.prep_state||"known";return I==="prepared"||I==="always"}),T=i.filter(_=>(Number(_.level)||0)===0),F=v.filter(_=>(_.prep_state||"known")==="always"),h=v.filter(_=>(_.prep_state||"known")!=="always"),N=(_,D="")=>{const I=Number(_.level)||0,O=Le(_.cast_time),K=va(O),Z=Fe(_,I);return`
      <div class="modifier-card attack-card resource-card spell-prepared-list__card">
        <div class="resource-card__badges spell-card__badges">
          ${_.concentration?'<span class="resource-chip resource-chip--floating resource-chip--concentration">C</span>':""}
          ${_.is_ritual?'<span class="resource-chip resource-chip--floating resource-chip--ritual">R</span>':""}
          ${O?`<span class="resource-chip resource-chip--floating ${K}">${O}</span>`:""}
        </div>
        <button class="spell-prepared-list__item" type="button" data-spell-quick-open="${_.id}">
          <span class="spell-prepared-list__name">${_.name}</span>
          ${I>0?`<span class="chip chip--small">${I}°</span>`:""}
        </button>
        <div class="resource-card-actions spell-card-actions">
          ${Z?`
            <button class="icon-button icon-button--fire spell-card-actions__damage" type="button" data-roll-damage="spell:${_.id}" aria-label="Lancia danni ${_.name}" title="Lancia danni">
              <span aria-hidden="true">🔥</span>
            </button>
          `:""}
          ${I>0?`<button class="resource-cta-button resource-cta-button--label" type="button" data-use-spell="${_.id}">Usa</button>`:""}
          ${a?`
            <button class="resource-action-button resource-icon-button" type="button" data-edit-spell="${_.id}" aria-label="Modifica incantesimo ${_.name}">✏️</button>
            <button class="resource-action-button resource-icon-button" type="button" data-delete-spell="${_.id}" aria-label="Elimina incantesimo ${_.name}">🗑️</button>
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
            ${B.map(_=>{const D=w==="short_rest"?"charge-indicator":"charge-indicator charge-indicator--long",I=Array.from({length:_.max},(O,K)=>{const Z=K>=_.count,Y=[D,Z?"charge-indicator--used":""].filter(Boolean).join(" ");return a&&Z?`<button type="button" class="${Y}" data-restore-spell-slot="${_.level}" aria-label="Ripristina uno slot di livello ${_.level}"></button>`:a&&!Z?`<button type="button" class="${Y}" data-consume-spell-slot="${_.level}" aria-label="Consuma uno slot di livello ${_.level}"></button>`:`<span class="${Y}"></span>`}).join("");return`
              <div class="spell-slot-row">
                <span class="spell-slot-label">Slot ${_.level}°</span>
                <span class="spell-slot-count">${_.count}</span>
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
            <span class="spell-list-accordion__count">${T.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${T.length?`<div class="spell-prepared-list__items">${T.map(_=>N(_)).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun trucchetto disponibile.</p>'}
          </div>
        </details>
        <details class="spell-list-accordion" open>
          <summary class="spell-list-accordion__summary">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <span class="spell-list-accordion__title">Preparati</span>
            <span class="spell-list-accordion__count">${h.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${h.length?`<div class="spell-prepared-list__items">${h.map(_=>N(_,"Preparato")).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun incantesimo preparato.</p>'}
          </div>
        </details>
        <details class="spell-list-accordion" open>
          <summary class="spell-list-accordion__summary">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <span class="spell-list-accordion__title">Sempre conosciuti</span>
            <span class="spell-list-accordion__count">${F.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${F.length?`<div class="spell-prepared-list__items">${F.map(_=>N(_,"Sempre preparato")).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun incantesimo sempre conosciuto.</p>'}
          </div>
        </details>
      </div>
    </div>
  `}function Le(e){const a=e==null?void 0:e.toString().trim();if(!a)return"";const t=a.toLowerCase();if(t.includes("bonus"))return"Azione Bonus";if(t.includes("reaz"))return"Reazione";if(t.includes("gratuit"))return"Azione Gratuita";if(t.includes("durata")||t.includes("più")||t.includes("piu")||t.includes("superiore"))return"Durata";if(t.includes("azion"))return"Azione";const s=Me.find(i=>i.label.toLowerCase()===t);return(s==null?void 0:s.label)??""}function ia(e){if(!e)return Me.length;const a=Le(e),t=Me.findIndex(s=>s.label===a);return t===-1?Me.length:t}function va(e){var t;if(!e)return"";const a=Le(e);return((t=Me.find(s=>s.label===a))==null?void 0:t.className)??""}function Dt(e){return[...e].sort((a,t)=>{const s=ia(a.cast_time)-ia(t.cast_time);return s!==0?s:(a.name??"").localeCompare(t.name??"","it",{sensitivity:"base"})})}function oa(e,a,{showCharges:t=!0,showUseButton:s=!0,showDescription:i=!1,showCastTime:o=!0}={}){return`
    <ul class="resource-list resource-list--compact">
      ${e.map(r=>`
        <li class="modifier-card attack-card resource-card" data-resource-card="${r.id}">
          ${o&&Le(r.cast_time)?`<span class="resource-chip resource-chip--floating ${va(r.cast_time)}">${Le(r.cast_time)}</span>`:""}
          <div class="attack-card__body resource-card__body">
            <div class="attack-card__title resource-card__title">
              <strong class="attack-card__name">${r.name}</strong>
            </div>
            ${i?`<p class="resource-card__description">${r.description??""}</p>`:""}
            ${t&&Number(r.max_uses)?`
              <div class="resource-card__charges">
                ${jt(r)}
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
  `}function It(e,a){if(!e.length)return"<p>Nessuna risorsa.</p>";const t=Dt(e),s=t.filter(l=>l.reset_on===null||l.reset_on==="none"),i=t.filter(l=>l.reset_on!==null&&l.reset_on!=="none"),o=`
    <details class="resource-accordion resource-section resource-section--active" open>
      <summary class="resource-accordion__summary">
        <span>Attive</span>
        <span class="resource-accordion__meta">${i.length} risorse</span>
        <span class="resource-accordion__icon" aria-hidden="true">▾</span>
      </summary>
      <div class="resource-section__body resource-accordion__body">
        ${i.length?oa(i,a,{showUseButton:!0}):'<p class="muted">Nessuna risorsa attiva.</p>'}
      </div>
    </details>
  `,r=`
    <details class="resource-accordion resource-section" ${i.length?"":"open"}>
      <summary class="resource-accordion__summary">
        <span>Passive</span>
        <span class="resource-accordion__meta">${s.length} risorse</span>
        <span class="resource-accordion__icon" aria-hidden="true">▾</span>
      </summary>
      <div class="resource-section__body resource-accordion__body">
        ${s.length?oa(s,a,{showCharges:!1,showUseButton:!1,showDescription:!0,showCastTime:!0}):'<p class="muted">Nessuna risorsa passiva.</p>'}
      </div>
    </details>
  `;return`<div class="resource-accordion-stack">${o}${r}</div>`}function jt(e){const a=Number(e.max_uses)||0,t=Number(e.used)||0;if(!a)return"";const s=e.reset_on==="long_rest"?"long":"short",i=Math.max(a-t,0),o=Array.from({length:a},(r,l)=>{const c=l<t;return`<span class="${["charge-indicator",s==="long"?"charge-indicator--long":"charge-indicator--short",c?"charge-indicator--used":""].filter(Boolean).join(" ")}" aria-hidden="true"></span>`}).join("");return`
    <div class="resource-charge-row" aria-label="Cariche risorsa">
      <span class="resource-charge-label">Cariche</span>
      <span class="resource-charge-count">${i}/${a}</span>
      <div class="resource-charges" aria-hidden="true">${o}</div>
    </div>
  `}function He(e){const a=e&&typeof e=="object"?e:{};return{abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10,...a.abilities||{}},hp:{current:1,max:1,...a.hp||{}},attacks:Array.isArray(a.attacks)?a.attacks:[]}}function De(e,a=[]){const t=(e==null?void 0:e.data)||{};if(!t.wild_shape_enabled)return null;const s=t.wild_shape||{};if(!s.active_companion_id)return null;const i=(a||[]).find(c=>String(c.id)===String(s.active_companion_id));if(!i)return null;const o=He(i.stat_block),r=Math.max(Number(o.hp.max)||Number(o.hp.current)||1,1),l=Math.max(0,Math.min(Number(s.hp_current??o.hp.current??r)||0,r));return{companion:i,statBlock:o,hpCurrent:l,hpMax:r}}function Ke(e,a=[]){const t=De(e,a);if(!e||!t)return e;const s=e.data||{},i=s.abilities||{};return{...e,data:{...s,abilities:{...i,str:Math.max(Number(i.str)||0,Number(t.statBlock.abilities.str)||0),dex:Math.max(Number(i.dex)||0,Number(t.statBlock.abilities.dex)||0),con:Math.max(Number(i.con)||0,Number(t.statBlock.abilities.con)||0)}}}}function Ft(e=[]){return(e||[]).filter(a=>["familiar","summon","transformation"].includes(a.kind||"familiar"))}async function Ht(e,a,t){var n,E,w;if(!((n=e==null?void 0:e.data)!=null&&n.wild_shape_enabled))return;const s=Ft(a);if(!s.length){A("Crea prima una forma nella sezione Famigli","error");return}const i=((E=e.data)==null?void 0:E.wild_shape)||{},o=document.createElement("div");o.className="modal-form-grid wild-shape-picker";const r=document.createElement("label");r.className="field",r.innerHTML="<span>Forma animale</span>";const l=Re(s.map(k=>{const B=He(k.stat_block),g=Math.max(Number(B.hp.max)||Number(B.hp.current)||1,1);return{value:k.id,label:`${k.name} · HP ${g}`}}),i.active_companion_id||((w=s[0])==null?void 0:w.id)||"");l.name="wild_shape_companion_id",r.appendChild(l),o.appendChild(r);const c=await ce({title:"Scegli forma selvatica",submitLabel:"Trasformati",content:o,cardClass:"modal-card--form"});if(!c)return;const u=String(c.get("wild_shape_companion_id")||""),p=s.find(k=>String(k.id)===u);if(!p)return;const $=He(p.stat_block),y=Math.max(Number($.hp.max)||Number($.hp.current)||1,1);await J(e,{...e.data||{},wild_shape:{active_companion_id:p.id,hp_current:y,activated_at:new Date().toISOString()}},`Forma selvatica: ${p.name}`,()=>z(t))}async function Pt(e,a){await J(e,{...e.data||{},wild_shape:null},"Forma selvatica terminata",()=>z(a))}let la=!1,Te=null;function Ot(e){return!e||!e.querySelector(".home-layout")?null:{windowX:window.scrollX||0,windowY:window.scrollY||0,panels:Array.from(e.querySelectorAll(".home-scroll-body, .home-scroll-panel")).map((a,t)=>({index:t,top:a.scrollTop||0,left:a.scrollLeft||0}))}}function Wt(e,a){if(!e||!a)return;const t=()=>{const s=Array.from(e.querySelectorAll(".home-scroll-body, .home-scroll-panel"));a.panels.forEach(i=>{const o=s[i.index];o&&(o.scrollTop=i.top,o.scrollLeft=i.left)}),window.scrollTo(a.windowX,a.windowY)};typeof window.requestAnimationFrame=="function"?window.requestAnimationFrame(t):setTimeout(t,0)}function Vt(e){return e?{id:`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.id,name:e.name,level:e.level,kind:Number(e.level)===0?"cantrip":"spell",cast_time:e.cast_time,duration:e.duration,range:e.range,components:e.components,concentration:!!e.concentration,attack_roll:!!e.attack_roll,is_ritual:!!e.ritual,damage_die:e.damage_die,damage_modifier:e.damage_modifier,upcast_damage_die:e.upcast_damage_die,upcast_damage_modifier:e.upcast_damage_modifier,upcast_start_level:e.upcast_start_level,description:e.description,rules_version:e.rules_version,prep_state:"known"}:null}function Ut(e){const a=(e==null?void 0:e.shared_spell)||{},t=(e==null?void 0:e.custom_spell)||{},s=e!=null&&e.shared_spell_id?a:t;if(!(s!=null&&s.name))return null;const i=Number(s.level)||0;return{id:e.id||`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.shared_spell_id||null,name:s.name,level:i,kind:s.kind||(i===0?"cantrip":"spell"),cast_time:s.cast_time||null,duration:s.duration||null,range:s.range||null,components:s.components||null,concentration:!!s.concentration,attack_roll:!!s.attack_roll,is_ritual:!!(s.ritual??s.is_ritual),damage_die:s.damage_die||null,damage_modifier:s.damage_modifier??null,upcast_damage_die:s.upcast_damage_die||null,upcast_damage_modifier:s.upcast_damage_modifier??null,upcast_start_level:s.upcast_start_level??null,description:s.description||null,school:s.school||null,caster_classes:s.caster_classes||[],rules_version:s.rules_version||null,prep_state:e.prep_state||"known"}}async function Kt(){var h;const e=["","Abiurazione","Ammaliamento","Divinazione","Evocazione","Illusione","Invocazione","Necromanzia","Trasmutazione"],a=["mago","warlock","stregone","chierico","druido","ranger","artefice","paladino","bardo"],t=document.createElement("div");t.className="modal-form-grid";const s=qe({label:"Cerca incantesimo",name:"spell_query",placeholder:"Es. Palla di fuoco"}),i=s.querySelector("input"),o=document.createElement("label");o.className="field",o.innerHTML="<span>Versione regole</span>";const r=document.createElement("select");r.name="rules_version",[{value:"2024",label:"2024"},{value:"2014",label:"2014"},{value:"Custom",label:"Custom"}].forEach(N=>{const S=document.createElement("option");S.value=N.value,S.textContent=N.label,r.appendChild(S)}),o.appendChild(r);const l=document.createElement("label");l.className="field",l.innerHTML="<span>Scuola</span>";const c=document.createElement("select");c.name="spell_school_filter",e.forEach(N=>{const S=document.createElement("option");S.value=N,S.textContent=N||"Tutte",c.appendChild(S)}),l.appendChild(c);const u=qe({label:"Livello",name:"spell_level_filter",type:"number",value:""}),p=document.createElement("div");p.className="field",p.innerHTML=`<span>Classi</span><div class="tag-row">${a.map(N=>`<label class="chip"><input type="checkbox" name="spell_caster_filter" value="${N}" /> ${N}</label>`).join("")}</div>`;const $=document.createElement("div");$.className="modal-form-row modal-form-row--compact",$.append(u,l,o),t.appendChild(s),t.appendChild($),t.appendChild(p);const y=document.createElement("label");y.className="field",y.innerHTML="<span>Risultati</span>";const n=document.createElement("select");n.name="shared_spell_id",y.appendChild(n);const E=document.createElement("div");E.className="tab-bar",E.innerHTML='<button type="button" class="tab-bar__button" data-prev-page>◀</button><span data-page-label class="muted">Pagina 1</span><button type="button" class="tab-bar__button" data-next-page>▶</button>',t.appendChild(y),t.appendChild(E);let w=1,k=[];const B=E.querySelector("[data-page-label]"),g=E.querySelector("[data-prev-page]"),q=E.querySelector("[data-next-page]"),v=async()=>{var D;const N=Array.from(t.querySelectorAll('input[name="spell_caster_filter"]:checked')).map(I=>I.value),S=await St({query:(i==null?void 0:i.value)||"",rulesVersion:r.value||"2024",level:((D=t.querySelector('input[name="spell_level_filter"]'))==null?void 0:D.value)||"",school:c.value||"",casterClasses:N,page:w,pageSize:25});if(k=S.items||[],n.innerHTML="",k.forEach(I=>{const O=document.createElement("option");O.value=I.id,O.textContent=`${I.name} (Lv ${I.level})`,n.appendChild(O)}),!k.length){const I=document.createElement("option");I.value="",I.textContent="Nessun risultato",n.appendChild(I)}const _=Math.max(1,Math.ceil((S.total||0)/(S.pageSize||25)));B.textContent=`Pagina ${w} / ${_}`,g.disabled=w<=1,q.disabled=w>=_};i==null||i.addEventListener("input",()=>{w=1,v()}),c.addEventListener("change",()=>{w=1,v()}),r.addEventListener("change",()=>{w=1,v()}),(h=t.querySelector('input[name="spell_level_filter"]'))==null||h.addEventListener("input",()=>{w=1,v()}),t.querySelectorAll('input[name="spell_caster_filter"]').forEach(N=>N.addEventListener("change",()=>{w=1,v()})),g==null||g.addEventListener("click",()=>{w=Math.max(1,w-1),v()}),q==null||q.addEventListener("click",()=>{w+=1,v()}),await v();const T=await ce({title:"Seleziona incantesimo condiviso",submitLabel:"Aggiungi",cancelLabel:"Annulla",content:t,cardClass:"modal-card--form"});if(!T)return null;const F=T.get("shared_spell_id");return k.find(N=>N.id===F)||null}function ra(e){var a,t;return((t=(a=e==null?void 0:e.data)==null?void 0:a.settings)==null?void 0:t.auto_usage_dice)!==!1}function Gt(e,a){var t,s;return pt((s=(t=e==null?void 0:e.data)==null?void 0:t.spellcasting)==null?void 0:s.slots,a)}async function Qt(e,a){const t=Math.max(1,Number(a==null?void 0:a.level)||1),s=Gt(e,t);if(!s.length)return A("Slot incantesimo esauriti","error"),null;if(s.length===1)return s[0].level;const i=document.createElement("label");i.className="field",i.innerHTML="<span>Seleziona slot da consumare</span>";const o=document.createElement("select");o.name="cast_slot_level",o.className="input",s.forEach(u=>{const p=document.createElement("option");p.value=String(u.level),p.textContent=`${u.level}° livello (${u.available} slot)`,o.appendChild(p)}),i.appendChild(o);const r=document.createElement("div");r.className="modal-form-grid",r.appendChild(i);const l=await ce({title:a!=null&&a.name?`Lancia ${a.name}`:"Scegli slot incantesimo",submitLabel:"Conferma",cancelLabel:"Annulla",content:r,cardClass:"modal-card--form"});return l?Math.max(t,Number(l.get("cast_slot_level"))||t):null}async function z(e){var o,r,l,c;const a=Ot(e);Te=e;const t=te(),{user:s,offline:i}=t;Ye(!0);try{let u=t.characters;if(!i&&s)try{u=await Ba(s.id),Ja({characters:u}),await ye({characters:u})}catch{A("Errore caricamento personaggi","error")}const p=fe(t.activeCharacterId);!u.some(d=>fe(d.id)===p)&&u.length&&Za(u[0].id);const y=fe(te().activeCharacterId),n=u.find(d=>fe(d.id)===y),E=!!s&&!i,w=!!s&&!i,k=!!s&&!i;let B=t.cache.resources,g=t.cache.items,q=[];if(!i&&n){const[d,m,f,b]=await Promise.allSettled([pa(n.id),Qa(n.id),ea(n.id),mt(n.id)]),L={};if(d.status==="fulfilled"?(B=d.value,be("resources",B),L.resources=B):A("Errore caricamento risorse","error"),m.status==="fulfilled"?(g=m.value,be("items",g),L.items=g):A("Errore caricamento equip","error"),b.status==="fulfilled"?(q=b.value||[],be("companions",q)):A("Errore caricamento forme animali","error"),f.status==="fulfilled"){const x=(f.value||[]).map(C=>Ut(C)).filter(Boolean);if(x.length){const M=[...Array.isArray((o=n.data)==null?void 0:o.spells)?n.data.spells:[]];x.forEach(R=>{M.some(G=>G.shared_spell_id&&G.shared_spell_id===R.shared_spell_id)||M.push(R)}),n.data={...n.data||{},spells:M}}}Object.keys(L).length&&await ye(L)}const v=Ke(n,q);e.innerHTML=`
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
          ${v?qt(v):"<p>Nessun personaggio selezionato.</p>"}
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
            ${v?Nt(v):"<p>Nessun personaggio selezionato.</p>"}
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
            ${v?Ct(v):"<p>Nessun personaggio selezionato.</p>"}
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
              ${n&&k?`
                <button class="icon-button" data-edit-character aria-label="Modifica personaggio">
                  <span aria-hidden="true">✏️</span>
                </button>
              `:""}
            </div>
          </header>
          ${v?Lt(v,k,g,q):Mt(E,i)}
        </section>
        ${n?Tt(n,g,k):""}
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
            ${n?Bt(v,g||[],q):"<p>Nessun personaggio selezionato.</p>"}
          </div>
        </section>
        ${(r=n==null?void 0:n.data)!=null&&r.is_spellcaster?`
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Incantesimi</p>
            </div>
            <div class="actions">
              <button class="icon-button icon-button--dice" data-open-dice="spell-attack" aria-label="Lancia dado tiro per colpire incantesimi">
                <span aria-hidden="true">🎲</span>
              </button>
              ${(c=(l=n==null?void 0:n.data)==null?void 0:l.spellcasting)!=null&&c.can_prepare?`
                <button class="icon-button icon-button--spell-prepare" type="button" data-open-prepared-spells aria-label="Prepara incantesimi" title="Prepara incantesimi">
                  <span aria-hidden="true">📖</span>
                </button>
              `:""}
              ${n&&k?`
                <button class="icon-button icon-button--add" data-add-spell aria-label="Aggiungi incantesimo">
                  <span aria-hidden="true">+</span>
                </button>
              `:""}
            </div>
          </header>
          <div class="home-scroll-body">
            ${zt(n,k)}
          </div>
        </section>
        `:""}
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Risorse</p>           
            </div>
            ${n&&w?`
              <button class="icon-button icon-button--add" data-add-resource aria-label="Nuova risorsa">
                <span aria-hidden="true">+</span>
              </button>
            `:""}
          </header>
          <div class="home-scroll-body home-scroll-body--resources">
            ${n?It(B,w):"<p>Nessun personaggio selezionato.</p>"}
            ${n&&!w?'<p class="muted">Connettiti per aggiungere nuove risorse.</p>':""}
          </div>
        </section>
      </div>
    </div>
  `,ha();const T=e.querySelector("[data-create-character]");T&&T.addEventListener("click",()=>{Je(s,()=>z(e))});const F=e.querySelector("[data-edit-character]");F&&F.addEventListener("click",()=>{Je(s,()=>z(e),n)});const h=e.querySelector("[data-add-resource]");h&&h.addEventListener("click",()=>{aa(n,()=>z(e))});const N=e.querySelector("[data-add-spell]");N&&N.addEventListener("click",async()=>{var m;if(!n)return;const d=await bt();if(d){if(d==="shared")try{const f=await Kt();if(!f)return;const b=Vt(f),L=Array.isArray((m=n.data)==null?void 0:m.spells)?n.data.spells:[];if(L.some(M=>M.shared_spell_id===f.id)){A("Incantesimo già presente nella scheda personaggio","info");return}n.user_id&&await gt({user_id:n.user_id,character_id:n.id,shared_spell_id:f.id,prep_state:b.prep_state});const C={...n.data||{},spells:[...L,b]};await J(n,C,"Incantesimo aggiunto dalla lista condivisa",()=>z(e));return}catch{A("Errore durante l'associazione dell'incantesimo condiviso","error");return}ta(n,async f=>{if(!f)return z(e);try{await vt({created_by:n.user_id,rules_version:f.rules_version||"2024",name:f.name,level:f.level,school:f.school||null,caster_classes:Array.isArray(f.caster_classes)?f.caster_classes:[],cast_time:f.cast_time||null,range:f.range||null,duration:f.duration||null,components:f.components||null,concentration:!!f.concentration,ritual:!!f.is_ritual,attack_roll:!!f.attack_roll,damage_die:f.damage_die||null,damage_modifier:f.damage_modifier??null,upcast_damage_die:f.upcast_damage_die||null,upcast_damage_modifier:f.upcast_damage_modifier??null,upcast_start_level:f.upcast_start_level??null,description:f.description||null})}catch{A("Incantesimo salvato sul personaggio ma non sul catalogo condiviso","info")}z(e)})}}),e.querySelectorAll("[data-edit-spell]").forEach(d=>d.addEventListener("click",()=>{var L;const m=d.dataset.editSpell;if(!m||!n)return;const b=(Array.isArray((L=n.data)==null?void 0:L.spells)?n.data.spells:[]).find(x=>x.id===m);b&&ta(n,()=>z(e),b)})),e.querySelectorAll("[data-delete-spell]").forEach(d=>d.addEventListener("click",async()=>{var C;const m=d.dataset.deleteSpell;if(!m||!n)return;const f=Array.isArray((C=n.data)==null?void 0:C.spells)?n.data.spells:[],b=f.find(M=>M.id===m);if(!b||!await je({title:"Conferma eliminazione incantesimo",message:`Stai per eliminare l'incantesimo "${b.name}" dalla scheda del personaggio. Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))return;if(b.shared_spell_id)try{const R=(await ea(n.id)).find(W=>W.shared_spell_id===b.shared_spell_id);R!=null&&R.id&&await ht(R.id)}catch{A("Errore rimozione associazione incantesimo","error");return}const x={...n.data||{},spells:f.filter(M=>M.id!==b.id)};await J(n,x,"Incantesimo eliminato",()=>z(e))}));const S=e.querySelector("[data-open-prepared-spells]");S&&S.addEventListener("click",()=>{ba(n,()=>z(e))}),e.querySelectorAll("[data-spell-quick-open]").forEach(d=>d.addEventListener("click",()=>{var L;const m=d.dataset.spellQuickOpen;if(!m||!n)return;const b=(Array.isArray((L=n.data)==null?void 0:L.spells)?n.data.spells:[]).find(x=>x.id===m);b&&_t(n,b,()=>z(e))}));const _=e.querySelector("[data-show-background]");_&&_.addEventListener("click",()=>{yt(n)});const D=e.querySelector("[data-edit-conditions]");D&&D.addEventListener("click",async()=>{await _a(e)}),e.querySelectorAll("[data-proficiency-tabs]").forEach(d=>{var x;const m=Array.from(d.querySelectorAll("[data-proficiency-tab]")),f=Array.from(d.querySelectorAll("[data-proficiency-panel]"));if(!m.length||!f.length)return;const b=C=>{m.forEach(M=>{const R=M.dataset.proficiencyTab===C;M.classList.toggle("is-active",R),M.setAttribute("aria-selected",String(R))}),f.forEach(M=>{M.classList.toggle("is-active",M.dataset.proficiencyPanel===C)})};m.forEach(C=>{C.addEventListener("click",()=>{b(C.dataset.proficiencyTab)})});const L=((x=m.find(C=>C.classList.contains("is-active")))==null?void 0:x.dataset.proficiencyTab)??m[0].dataset.proficiencyTab;L&&b(L)});const I=e.querySelector("[data-add-equip]");I&&n&&k&&I.addEventListener("click",async()=>{var G;const d=(g||[]).filter(j=>j.equipable&&!ge(j).length);if(!d.length){A("Nessun oggetto equipaggiabile disponibile","error");return}const m=document.createElement("div");m.className="drawer-form";const f=document.createElement("label");f.className="field",f.innerHTML="<span>Oggetto</span>";const b=document.createElement("select");b.name="item_id",d.forEach(j=>{const H=document.createElement("option");H.value=j.id,H.textContent=j.name,b.appendChild(H)}),f.appendChild(b),m.appendChild(f);const L=document.createElement("fieldset");L.className="equip-slot-field",L.innerHTML="<legend>Punti del corpo</legend>";const x=document.createElement("div");x.className="equip-slot-list",Xa.forEach(j=>{const H=document.createElement("label");H.className="checkbox",H.innerHTML=`<input type="checkbox" name="equip_slots" value="${j.value}" /> <span>${j.label}</span>`,x.appendChild(H)}),L.appendChild(x),m.appendChild(L);const C=await ce({title:"Equipaggia oggetto",submitLabel:"Equipaggia",content:m});if(!C)return;const M=C.getAll("equip_slots");if(!M.length){A("Seleziona almeno uno slot","error");return}const R=d.find(j=>String(j.id)===C.get("item_id"));if(!R)return;const W=((G=n.data)==null?void 0:G.proficiencies)||{};if(R.category==="weapon"){if(!R.weapon_type){A("Definisci il tipo di arma prima di equipaggiarla","error");return}if(!(R.weapon_type==="simple"?!!W.weapon_simple:!!W.weapon_martial)){A("Non hai la competenza per equipaggiare questo oggetto","error");return}}if(R.category==="armor")if(R.is_shield){if(!W.shield){A("Non hai la competenza per equipaggiare questo oggetto","error");return}}else if(R.armor_type){if(!(R.armor_type==="light"?!!W.armor_light:R.armor_type==="medium"?!!W.armor_medium:!!W.armor_heavy)){A("Non hai la competenza per equipaggiare questo oggetto","error");return}}else{A("Definisci il tipo di armatura prima di equipaggiarla","error");return}if(!R.sovrapponibile&&(g||[]).filter(H=>H.id!==R.id).filter(H=>ge(H).some(U=>M.includes(U))).length){A("Uno o più slot selezionati sono già occupati","error");return}try{await Ce(R.id,{equip_slot:M[0]||null,equip_slots:M}),A("Equipaggiamento aggiornato"),z(e)}catch{A("Errore aggiornamento equip","error")}}),e.querySelectorAll("[data-unequip]").forEach(d=>d.addEventListener("click",async()=>{const m=(g||[]).find(f=>f.id===d.dataset.unequip);if(m)try{await Ce(m.id,{equip_slot:null,equip_slots:[]}),A("Equipaggiamento rimosso"),z(e)}catch{A("Errore aggiornamento equip","error")}}));const O=e.querySelector("[data-toggle-inspiration]");O&&n&&k&&O.addEventListener("click",async()=>{const d=n.data||{},m={...d,inspiration:!d.inspiration};await J(n,m,"Ispirazione aggiornata",()=>z(e))});const K=e.querySelector("[data-toggle-concentration]");K&&n&&k&&K.addEventListener("click",async()=>{const d=n.data||{},m={...d,concentration_active:!d.concentration_active};await J(n,m,"Concentrazione aggiornata",()=>z(e))}),e.querySelectorAll("[data-open-wild-shape]").forEach(d=>d.addEventListener("click",()=>{!n||!k||Ht(n,q,e)})),e.querySelectorAll("[data-end-wild-shape]").forEach(d=>d.addEventListener("click",()=>{!n||!k||Pt(n,e)})),e.querySelectorAll("[data-open-dice]").forEach(d=>d.addEventListener("click",()=>{Ca(d.dataset.openDice)})),e.querySelectorAll("[data-saving-throw-card]").forEach(d=>d.addEventListener("click",()=>{var L,x,C;if(!n)return;const m=d.dataset.savingThrowCard;if(!m)return;const f=Qe(n),b=f.find(M=>M.value===m);b&&we({title:`Tiro salvezza • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:f,value:b.value},allowInspiration:!!((L=n==null?void 0:n.data)!=null&&L.inspiration)&&k,weakPoints:Number((C=(x=n==null?void 0:n.data)==null?void 0:x.hp)==null?void 0:C.weak_points)||0,characterId:n.id})})),e.querySelectorAll("[data-skill-card]").forEach(d=>d.addEventListener("click",()=>{var L,x,C;if(!n)return;const m=d.dataset.skillCard;if(!m)return;const f=Ma(n,g||[]),b=f.find(M=>M.value===m);b&&we({title:`Tiro abilità • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità",options:f,value:b.value},allowInspiration:!!((L=n==null?void 0:n.data)!=null&&L.inspiration)&&k,weakPoints:Number((C=(x=n==null?void 0:n.data)==null?void 0:x.hp)==null?void 0:C.weak_points)||0,characterId:n.id})})),e.querySelectorAll("[data-special-skill-card]").forEach(d=>d.addEventListener("click",()=>{var L,x,C;if(!n)return;const m=d.dataset.specialSkillCard;if(!m)return;const f=La(n,g||[]),b=f.find(M=>M.value===m);b&&we({title:`Tiro abilità speciale • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità speciale",options:f,value:b.value},allowInspiration:!!((L=n==null?void 0:n.data)!=null&&L.inspiration)&&k,weakPoints:Number((C=(x=n==null?void 0:n.data)==null?void 0:x.hp)==null?void 0:C.weak_points)||0,characterId:n.id})})),e.querySelectorAll("[data-edit-resource]").forEach(d=>d.addEventListener("click",()=>{const m=B.find(f=>f.id===d.dataset.editResource);m&&aa(n,()=>z(e),m)})),e.querySelectorAll("[data-roll-hit-dice]").forEach(d=>d.addEventListener("click",async()=>{await gs(n,e)})),e.querySelectorAll("[data-roll-attack]").forEach(d=>d.addEventListener("click",m=>{m.target.closest("button")||ms(d.dataset.rollAttack)})),e.querySelectorAll("[data-cycle-weapon-mode]").forEach(d=>d.addEventListener("click",()=>{if(!n)return;const m=d.dataset.cycleWeaponMode,f=g==null?void 0:g.find(M=>String(M.id)===m||M.name===m);if(!f)return;const b=fa(f).filter(M=>M.damageDie);if(b.length<=1)return;const L=f.selected_damage_mode||b[0].id,x=Math.max(b.findIndex(M=>M.id===L),0),C=b[(x+1)%b.length];Ce(f.id,{selected_damage_mode:C.id}).then(M=>{const R=(te().cache.items||g||[]).map(W=>String(W.id)===String(f.id)?{...W,...M||{},selected_damage_mode:C.id}:W);return be("items",R),ye({items:R})}).then(()=>{A(`Modalità ${C.label}`),z(e)}).catch(()=>A("Errore cambio modalità arma","error"))})),e.querySelectorAll("[data-roll-damage]").forEach(d=>d.addEventListener("click",()=>{var M,R,W,G;if(!n)return;const m=d.dataset.rollDamage;if(!m)return;if(m.startsWith("wildshape:")){const j=Number(m.replace("wildshape:",""))||0,H=De(n,q),U=(M=H==null?void 0:H.statBlock.attacks)==null?void 0:M[j],ie=String((U==null?void 0:U.damage)||"").trim();if(!ie||ie==="-"){A("Danni non configurati per questo attacco","error");return}he({keepOpen:!0,title:`${H.companion.name} · Danni ${U.name||"Attacco"}`,mode:"generic",notation:ie,modifier:Number(U.damage_modifier)||0,rollType:"DMG",characterId:n==null?void 0:n.id,historyLabel:`${H.companion.name} · ${U.name||"Danni"}`});return}if(m.startsWith("spell:")){const j=m.replace("spell:",""),U=(Array.isArray((R=n.data)==null?void 0:R.spells)?n.data.spells:[]).find(le=>le.id===j);if(!U)return;const ie=Number(U.cast_level??U.level)||0,ee=Fe(U,ie);if(!ee){A("Danno non calcolabile per questo trucchetto.","error");return}he({keepOpen:!0,title:ee.title,mode:"generic",notation:ee.notation,modifier:ee.modifier,rollType:"DMG",characterId:n==null?void 0:n.id,historyLabel:U.name||null,sneakAttackDice:((W=n==null?void 0:n.data)==null?void 0:W.sneak_attack_dice)||null});return}const f=m.startsWith("weapon:")?m.split(":"):[null,m,"default"],b=f[1]||m,L=f[2]||"default",x=g==null?void 0:g.find(j=>String(j.id)===b||j.name===b);if(!x)return;const C=dt(n,x,L);if(!C){A("Danno non calcolabile per questa arma.","error");return}he({keepOpen:!0,title:C.title,mode:"generic",notation:C.notation,modifier:C.modifier,rollType:"DMG",characterId:n==null?void 0:n.id,historyLabel:x.name||null,sneakAttackDice:((G=n==null?void 0:n.data)==null?void 0:G.sneak_attack_dice)||null})}));const Z=d=>{var b;const m=(b=d==null?void 0:d.damage_dice_notation)==null?void 0:b.trim();if(!m)return;const f=ut(m);if(!(f!=null&&f.notation)){A("Notazione dado non valida per questa risorsa","error");return}he({keepOpen:!0,title:d.name||"Tiro abilità",mode:"generic",notation:f.notation,modifier:Number(d.damage_modifier)||0,rollType:"GEN",characterId:n==null?void 0:n.id,historyLabel:d.name||null})},ue=async d=>{const m=Number(d.max_uses)||0;if(!(!m||d.used>=m))try{await Ie(d.id,{used:Math.min(d.used+1,m)}),A("Risorsa usata"),ra(n)&&Z(d),z(e)}catch{A("Errore utilizzo risorsa","error")}};e.querySelectorAll("[data-resource-card]").forEach(d=>{const m=async f=>{if(f.target.closest("button"))return;const b=B.find(L=>L.id===d.dataset.resourceCard);b&&$t(b,{onUse:()=>ue(b),onReset:async()=>{try{await Ie(b.id,{used:0}),A("Risorsa ripristinata"),z(e)}catch{A("Errore ripristino risorsa","error")}},onRecover:async()=>{try{await Ie(b.id,{used:Math.max((Number(b.used)||0)-1,0)}),A("Carica recuperata"),z(e)}catch{A("Errore recupero carica","error")}}})};d.addEventListener("click",m)}),e.querySelectorAll("[data-use-resource]").forEach(d=>d.addEventListener("click",async()=>{const m=B.find(f=>f.id===d.dataset.useResource);m&&await ue(m)})),e.querySelectorAll("[data-use-spell]").forEach(d=>d.addEventListener("click",async()=>{var W,G;if(!n)return;const m=d.dataset.useSpell;if(!m)return;const b=(Array.isArray((W=n.data)==null?void 0:W.spells)?n.data.spells:[]).find(j=>j.id===m);if(!b||(Number(b.level)||0)<1)return;const x=await Qt(n,b);if(!x||!await sa(n,x,()=>z(e)))return;const M=te().characters.find(j=>fe(j.id)===fe(n.id))||n;if(b.concentration){const j=M.data||{};j.concentration_active||await J(M,{...j,concentration_active:!0},"Concentrazione attiva",()=>z(e))}if(!ra(M)){z(e);return}const R=Fe(b,x);if(!R){A("Danno non calcolabile per questo incantesimo.","error");return}he({keepOpen:!0,title:R.title,mode:"generic",notation:R.notation,modifier:R.modifier,rollType:"DMG",characterId:n.id,historyLabel:b.name||null,sneakAttackDice:((G=n==null?void 0:n.data)==null?void 0:G.sneak_attack_dice)||null})})),e.querySelectorAll("[data-consume-spell-slot]").forEach(d=>d.addEventListener("click",async()=>{if(!n)return;const m=Number(d.dataset.consumeSpellSlot);!Number.isFinite(m)||m<1||await sa(n,m,()=>z(e))})),e.querySelectorAll("[data-restore-spell-slot]").forEach(d=>d.addEventListener("click",async()=>{if(!n)return;const m=Number(d.dataset.restoreSpellSlot);!Number.isFinite(m)||m<1||await kt(n,m,()=>z(e))})),e.querySelectorAll("[data-delete-resource]").forEach(d=>d.addEventListener("click",async()=>{const m=B.find(b=>b.id===d.dataset.deleteResource);if(!(!m||!await je({title:"Conferma eliminazione risorsa",message:`Stai per eliminare la risorsa "${m.name}". Questa azione non può essere annullata.`,confirmLabel:"Elimina"})))try{await za(m.id),A("Risorsa eliminata"),z(e)}catch{A("Errore eliminazione risorsa","error")}})),e.querySelectorAll("[data-death-save]").forEach(d=>d.addEventListener("click",async()=>{if(!n||!k)return;const{deathSave:m,deathSaveIndex:f}=d.dataset,b=Number(f);if(!m||!b)return;const L=n.data||{},x=L.death_saves||{},C=Math.max(0,Math.min(3,Number(x[m])||0)),M=b===C?C-1:b,R={successes:Math.max(0,Math.min(3,m==="successes"?M:Number(x.successes)||0)),failures:Math.max(0,Math.min(3,m==="failures"?M:Number(x.failures)||0))};await J(n,{...L,death_saves:R},"Tiri salvezza contro morte aggiornati",()=>z(e))})),e.querySelectorAll("[data-weakness-level]").forEach(d=>d.addEventListener("click",async()=>{if(!n||!k)return;const m=Number(d.dataset.weaknessLevel);if(!m)return;const f=n.data||{},b=f.hp||{},L=Math.max(0,Math.min(6,Number(b.weak_points)||0));await J(n,{...f,hp:{...b,weak_points:m===L?0:m}},"Punti indebolimento aggiornati",()=>z(e))}));const Y=e.querySelector(".character-avatar");Y&&(Y.setAttribute("draggable","false"),Y.addEventListener("click",d=>{d.preventDefault(),wt(n)}),Y.addEventListener("contextmenu",d=>{d.preventDefault()}),Y.addEventListener("dragstart",d=>{d.preventDefault()})),e.querySelectorAll("[data-item-image]").forEach(d=>{d.setAttribute("draggable","false"),d.addEventListener("click",m=>{m.preventDefault(),m.stopPropagation();const f=g==null?void 0:g.find(b=>String(b.id)===d.dataset.itemImage);f&&Xe(f)})}),e.querySelectorAll("[data-item-preview]").forEach(d=>{d.addEventListener("click",m=>{m.preventDefault(),m.stopPropagation();const f=g==null?void 0:g.find(b=>String(b.id)===d.dataset.itemPreview);f&&Xe(f)})}),Wt(e,a)}finally{Ye(!1)}}function Ls(){ha()}function ha(){la||(document.addEventListener("click",async e=>{if(!e.target.closest("[data-actions-fab]"))return;const t=e.target.closest("[data-hp-action]"),s=e.target.closest("[data-money-action]"),i=e.target.closest("[data-rest]"),o=e.target.closest("[data-open-dice]"),r=e.target.closest("[data-add-loot]"),l=e.target.closest("[data-edit-conditions]"),c=e.target.closest("[data-edit-resistances]"),u=e.target.closest("[data-edit-roll-adjustments]");if(!t&&!s&&!i&&!o&&!r&&!l&&!c&&!u)return;e.preventDefault(),Xt();const p=Te??null;if(t){await vs(t.dataset.hpAction,p);return}if(s){if((window.location.hash.replace("#/","")||"home")==="inventory")return;await is(s.dataset.moneyAction,p);return}if(i){await bs(i.dataset.rest,p);return}if(o){Ca(o.dataset.openDice);return}if(r){await ns();return}if(l){await _a(p);return}if(c){await ss(p);return}u&&await es(p)}),la=!0)}function Xt(){const e=document.querySelector("[data-actions-fab]"),a=document.querySelector("[data-actions-toggle]");!e||!e.classList.contains("is-open")||(e.classList.remove("is-open"),a==null||a.setAttribute("aria-expanded","false"))}function de(){const e=te(),{user:a,offline:t,characters:s,activeCharacterId:i}=e,o=fe(i),r=s.find(u=>fe(u.id)===o),l=e.cache.companions||[],c=Ke(r,l);return{activeCharacter:r,sheetCharacter:c,companions:l,canEditCharacter:!!a&&!t}}async function _a(e){const{activeCharacter:a,canEditCharacter:t}=de();if(!a||!t)return;const s=await ft(a);if(!s)return;const i=s.getAll("conditions");await J(a,{...a.data,conditions:i},"Condizioni aggiornate",()=>{e&&z(e)})}function Yt(e){var t;const a=((t=e==null?void 0:e.data)==null?void 0:t.roll_adjustments)||{};return{attack_rolls:a.attack_rolls||{},saving_throws:a.saving_throws||{},skills:a.skills||{}}}function Jt(e){const a=Yt(e),t=te().cache.items||[],s=document.createElement("div");s.className="modal-form-grid compact-settings-form compact-settings-form--rolls";const i=[{value:"",label:"Nessuno"},{value:"advantage",label:"Vantaggio"},{value:"disadvantage",label:"Svantaggio"}],o=(r,l,c)=>{const u=document.createElement("section");u.className="character-edit-section compact-settings-section",u.innerHTML=`<h4>${r}</h4><p class="muted compact-settings-help">Indica solo gli override manuali; gli effetti automatici restano visibili sotto la riga.</p>`;const p=document.createElement("div");p.className="compact-setting-grid compact-setting-grid--roll",c.forEach($=>{var S;const y=((S=a[l])==null?void 0:S[$.key])||{},n=Aa(e,t,l,$),E=pe(n).rollMode||"",w=n.length===1&&n[0].source||"",k=y.mode||E,B=y.source||w,g=document.createElement("div");g.className="compact-setting-row compact-setting-row--roll";const q=document.createElement("label");q.className="field compact-setting-field";const v=document.createElement("span");v.textContent=$.label;const T=Re(i,k);T.name=`roll_${l}_${$.key}_mode`,q.append(v,T);const F=document.createElement("label");F.className="field compact-setting-field";const h=document.createElement("span");h.textContent="Fonte manuale";const N=Re(ya,B);if(N.name=`roll_${l}_${$.key}_source`,F.append(h,N),g.append(q,F),n.length){const _=document.createElement("p");_.className="muted compact-setting-note",_.textContent=`Automatico: ${n.map(D=>D.reason).join(" ")}`,g.appendChild(_)}p.appendChild(g)}),u.appendChild(p),s.appendChild(u)};return o("Tiri per colpire","attack_rolls",ka(e,t)),o("Tiri salvezza","saving_throws",Be),o("Abilità","skills",ze),s}function Zt(e,a){const t=te().cache.items||[],s={attack_rolls:{},saving_throws:{},skills:{}};return[{scope:"attack_rolls",entries:ka(a,t)},{scope:"saving_throws",entries:Be},{scope:"skills",entries:ze}].forEach(({scope:i,entries:o})=>{o.forEach(r=>{var n,E;const l=((n=e.get(`roll_${i}_${r.key}_mode`))==null?void 0:n.toString())||"",c=((E=e.get(`roll_${i}_${r.key}_source`))==null?void 0:E.toString().trim())||"",u=Aa(a,t,i,r),p=pe(u).rollMode||"",$=u.length===1&&u[0].source||"";(l==="advantage"||l==="disadvantage")&&!(l===p&&c===$)&&(s[i][r.key]={mode:l,source:c})})}),s}async function es(e){const{activeCharacter:a,canEditCharacter:t}=de();if(!a||!t)return;const s=await ce({title:"Vantaggi / Svantaggi situazionali",submitLabel:"Salva",content:Jt(a),cardClass:"modal-card--wide"});s&&await J(a,{...a.data,roll_adjustments:Zt(s,a)},"Vantaggi/svantaggi aggiornati",()=>{e&&z(e)})}function as(e){var i;const a=((i=e==null?void 0:e.data)==null?void 0:i.damage_defenses)||{},t=Se.reduce((o,r)=>{const l=r.group||"Altro";return o[l]||(o[l]=[]),o[l].push(r),o},{}),s=document.createElement("div");return s.className="modal-form-grid compact-settings-form compact-settings-form--defenses",s.innerHTML=Object.entries(t).map(([o,r])=>`
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
  `).join(""),s}function ts(e){return{resistances:Se.filter(a=>e.has(`damage_resistance_${a.key}`)).map(a=>a.key),immunities:Se.filter(a=>e.has(`damage_immunity_${a.key}`)).map(a=>a.key)}}async function ss(e){const{activeCharacter:a,canEditCharacter:t}=de();if(!a||!t)return;const s=await ce({title:"Resistenze & Immunità",submitLabel:"Salva",content:as(a),cardClass:"modal-card--wide"});s&&await J(a,{...a.data,damage_defenses:ts(s)},"Resistenze aggiornate",()=>{e&&z(e)})}async function ns(e){const{activeCharacter:a}=de(),t=te();if(!a)return;if(t.offline){A("Loot disponibile solo online.","error");return}const i=ma(a)==="kg"?"0.1":"1",o=await ce({title:"Aggiungi loot rapido",submitLabel:"Aggiungi",content:Ya(i),onOpen:({fieldsEl:r})=>{et(r)}});if(o)try{await Ga({user_id:a.user_id,character_id:a.id,name:o.get("name"),qty:Number(o.get("qty")),weight:Number(o.get("weight")),volume:Number(o.get("volume"))||0,value_cp:Number(o.get("value_cp")),category:"loot",equipable:!1,equip_slot:null,equip_slots:[],sovrapponibile:!1,is_magic:!1,max_volume:null}),A("Loot aggiunto")}catch{A("Errore loot","error")}}function Pe(e,{min:a=null,max:t=null}={}){if(!(e instanceof HTMLInputElement)||e.type!=="number"||e.closest(".modal-value-stepper"))return;const s=document.createElement("div");s.className="number-stepper modal-value-stepper";const i=document.createElement("button");i.type="button",i.className="number-stepper__button modal-value-stepper__button",i.textContent="−",i.setAttribute("aria-label","Diminuisci valore");const o=document.createElement("button");o.type="button",o.className="number-stepper__button modal-value-stepper__button",o.textContent="+",o.setAttribute("aria-label","Aumenta valore");const r=e.parentNode;if(!r)return;r.insertBefore(s,e),s.append(i,e,o);const l=u=>Number.isFinite(u)?u:0,c=u=>{const p=l(e.valueAsNumber),$=Number(e.step),y=Number.isFinite($)&&$>0?$:1;let n=p+y*u;const E=a??(e.min!==""?Number(e.min):null),w=t??(e.max!==""?Number(e.max):null);Number.isFinite(E)&&(n=Math.max(E,n)),Number.isFinite(w)&&(n=Math.min(w,n)),e.value=String(n),e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))};i.addEventListener("click",()=>c(-1)),o.addEventListener("click",()=>c(1))}async function is(e,a){const{activeCharacter:t,canEditCharacter:s}=de();if(!t)return;if(!s){A("Azioni denaro disponibili solo con profilo online","error");return}const i=te();let o=i.cache.wallet;if(!o&&!i.offline)try{o=await Oa(t.id),be("wallet",o),o&&await ye({wallet:o})}catch{A("Errore caricamento wallet","error")}const c=await ce({title:e==="pay"?"Paga monete":"Ricevi monete",submitLabel:e==="pay"?"Paga":"Ricevi",content:Wa({direction:e}),onOpen:({fieldsEl:w})=>{const k=w==null?void 0:w.querySelector('input[name="amount"]');k&&Pe(k,{min:0})}});if(!c)return;o||(o={user_id:t.user_id,character_id:t.id,cp:0,sp:0,gp:0,pp:0});const u=c.get("coin"),p=Number(c.get("amount")||0),$={cp:u==="cp"?p:0,sp:u==="sp"?p:0,gp:u==="gp"?p:0,pp:u==="pp"?p:0},y=e==="pay"?-1:1,n=Object.fromEntries(Object.entries($).map(([w,k])=>[w,k*y])),E=Va(o,n);try{const w=await Ua({...E,user_id:o.user_id,character_id:o.character_id});await Ka({user_id:o.user_id,character_id:o.character_id,direction:e,amount:n,reason:c.get("reason"),occurred_on:c.get("occurred_on")}),be("wallet",w),await ye({wallet:w}),A("Wallet aggiornato"),a&&z(a)}catch{A("Errore aggiornamento denaro","error")}}const os=ua.reduce((e,a)=>(e[a.key]=a.label,e),{}),ca={advantage:["invisibile"],disadvantage:["accecato","avvelenato","intralciato","prono","spaventato"]},da={disadvantage:{dex:["intralciato"]},autoFail:{str:["paralizzato","privo_di_sensi","stordito"],dex:["paralizzato","privo_di_sensi","stordito"]}},ya=[{value:"",label:"Seleziona fonte"},{value:"situational",label:"Situazionale"},{value:"effect",label:"Effetto temporaneo"},{value:"condition",label:"Condizione"},{value:"armor",label:"Armatura"},{value:"racial",label:"Abilità razziale"},{value:"class",label:"Privilegio di classe"},{value:"spell",label:"Incantesimo"},{value:"item",label:"Oggetto magico/equipaggiamento"},{value:"other",label:"Altro"}];function Ne(e){const a=(e==null?void 0:e.data)||{};return Array.isArray(a.conditions)?a.conditions:a.condition?[a.condition]:[]}function Ae(e){return e.map(a=>os[a]||a).filter(Boolean)}function $a(e=[]){return(e||[]).some(a=>a.category==="armor"&&a.armor_type==="heavy"&&a.equipable&&ge(a).length)}function ka(e,a=[]){const t=(e==null?void 0:e.data)||{},i=(a||[]).filter(p=>p.category==="weapon"&&p.equipable&&ge(p).length).map(p=>({key:`weapon:${p.id??p.name}`,label:p.name||"Arma"})),r=(Array.isArray(t.spells)?t.spells:[]).filter(p=>(p.kind==="cantrip"||Number(p.level)===0)&&p.attack_roll&&p.damage_die).map(p=>({key:`spell:${p.id}`,label:p.name||"Incantesimo"})),u=!!((t.spellcasting||{}).ability&&X(t.proficiency_bonus)!==null)?[{key:"spell-attack",label:"Incantesimi"}]:[];return[...i,...r,...u]}function Ge(e){const a=Ne(e),t=ca.advantage.filter(o=>a.includes(o)),s=ca.disadvantage.filter(o=>a.includes(o)),i=[];return t.length&&i.push({mode:"advantage",source:"condition",reason:`Vantaggio: condizioni ${Ae(t).join(", ")}.`}),s.length&&i.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${Ae(s).join(", ")}.`}),i}function wa(e,a,t){const i=Ne(e).includes("avvelenato")?["avvelenato"]:[],o=$a(a),r=[];return i.length&&r.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${Ae(i).join(", ")}.`}),t.key==="stealth"&&o&&r.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su Furtività."}),r}function ls(e){const a=String((e==null?void 0:e.id)??"").toLowerCase(),t=String((e==null?void 0:e.name)??"").trim().toLowerCase();return a==="initiative"||a==="default_initiative"||t==="iniziativa"}function rs(e,a,t,s=null){const o=Ne(e).includes("avvelenato")?["avvelenato"]:[],r=$a(a),l=[];return o.length&&l.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${Ae(o).join(", ")}.`}),t==="dex"&&r&&!ls(s)&&l.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su tiri speciali basati su DES."}),l}function Sa(e,a){const t=Ea(Ne(e),a.key);return t.rollMode?[{mode:t.rollMode,source:"condition",reason:t.rollModeReason}]:[]}function Aa(e,a,t,s){return t==="attack_rolls"?Ge(e):t==="skills"?wa(e,a,s):t==="saving_throws"?Sa(e,s):[]}function cs(e){var a;return((a=ya.find(t=>t.value===e))==null?void 0:a.label)||e}function ke(e,a,t,s){var c,u,p,$;const i=(p=(u=(c=e==null?void 0:e.data)==null?void 0:c.roll_adjustments)==null?void 0:u[a])==null?void 0:p[t];if(!i||i.mode!=="advantage"&&i.mode!=="disadvantage")return null;const o=i.mode==="advantage"?"Vantaggio":"Svantaggio",r=($=i.source)==null?void 0:$.toString().trim(),l=r?cs(r):"Situazionale";return{mode:i.mode,reason:`${o}: ${s} (${l}).`}}function pe(e){const a=e.filter(Boolean),t=a.filter(i=>i.mode==="advantage").map(i=>i.reason).filter(Boolean),s=a.filter(i=>i.mode==="disadvantage").map(i=>i.reason).filter(Boolean);return t.length&&s.length?{rollMode:null,rollModeReason:`Vantaggio e svantaggio si annullano. ${[...t,...s].join(" ")}`}:t.length?{rollMode:"advantage",rollModeReason:t.join(" ")}:s.length?{rollMode:"disadvantage",rollModeReason:s.join(" ")}:{rollMode:null,rollModeReason:null}}function Ea(e,a){const s=(da.autoFail[a]||[]).filter(r=>e.includes(r));if(s.length)return{disabled:!0,disabledReason:`Condizioni: ${Ae(s).join(", ")}`};const o=(da.disadvantage[a]||[]).filter(r=>e.includes(r));return o.length?{rollMode:"disadvantage",rollModeReason:`Svantaggio: condizioni ${Ae(o).join(", ")}.`}:{}}function Ma(e,a=[]){const t=e.data||{},s=t.abilities||{},i=X(t.proficiency_bonus),o=t.skills||{},r=t.skill_mastery||{};return ze.map(l=>{const c=!!o[l.key],u=!!r[l.key],p=Ee(s[l.ability],i,c?u?2:1:0),$=p??0,y=wa(e,a,l);y.push(ke(e,"skills",l.key,l.label));const n=pe(y);return{value:l.key,label:`${l.label} (${V(p)})`,shortLabel:l.label,modifier:$,rollMode:n.rollMode,rollModeReason:n.rollModeReason}})}function La(e,a=[]){const t=e.data||{},s=t.abilities||{},i=X(t.proficiency_bonus),o=Array.isArray(t.special_skill_rolls)?t.special_skill_rolls:[];return(o.some(c=>{const u=String((c==null?void 0:c.id)??"").toLowerCase(),p=String((c==null?void 0:c.name)??"").trim().toLowerCase();return u==="initiative"||u==="default_initiative"||p==="iniziativa"})?o:[{id:"default_initiative",name:"Iniziativa",ability:"dex",proficient:!1,mastery:!1,bonus:0},...o]).map((c,u)=>{var q;const p=oe[c.ability]?c.ability:"str",$=!!c.proficient,y=!!c.mastery&&$,n=Ee(s[p],i,$?y?2:1:0),E=Number(c.bonus)||0,w=(n??0)+E,k=((q=c.name)==null?void 0:q.trim())||`Tiro speciale ${u+1}`,B=rs(e,a,p,c),g=pe(B);return{value:String(c.id??u),label:`${k} (${V(w)})`,shortLabel:k,modifier:w,rollMode:g.rollMode,rollModeReason:g.rollModeReason}})}function Qe(e){const a=e.data||{},t=a.abilities||{},s=X(a.proficiency_bonus),i=a.saving_throws||{},o=Ne(e);return Be.map(r=>{const l=!!i[r.key],c=Ee(t[r.key],s,l?1:0),u=c??0,p=Ea(o,r.key),$=ke(e,"saving_throws",r.key,r.label),y=p.disabled?{rollMode:null,rollModeReason:null}:pe([...Sa(e,r),$]),n=p.disabled?" · fallimento diretto":"";return{value:r.key,label:`${r.label} (${V(c)})${n}`,shortLabel:oe[r.key]||r.label,modifier:u,rollMode:y.rollMode,rollModeReason:y.rollModeReason,disabled:p.disabled||!1,disabledReason:p.disabledReason||null}})}function Na(e,a=[],t=[]){var q;const s=e.data||{},i=Number(s.attack_bonus_melee??s.attack_bonus)||0,o=Number(s.attack_bonus_ranged??s.attack_bonus)||0,r=(a||[]).filter(v=>v.category==="weapon"&&v.equipable&&ge(v).length),l=X(s.proficiency_bonus)??0,c=s.proficiencies||{},u=Ge(e),p=r.map(v=>{var K;const T=v.weapon_range||(v.range_normal?"ranged":"melee"),F=v.attack_ability||(T==="ranged"?"dex":"str"),h=me((K=s.abilities)==null?void 0:K[F])??0,S=(v.weapon_type==="simple"?!!c.weapon_simple:v.weapon_type==="martial"?!!c.weapon_martial:!1)?l:0,_=T==="ranged"?o:i,D=h+S+(Number(v.attack_modifier)||0)+_,I=`weapon:${v.id??v.name}`,O=pe([...u,ke(e,"attack_rolls",I,v.name)]);return{value:I,label:`${v.name} (${V(D)})`,shortLabel:v.name,modifier:D,rollMode:O.rollMode,rollModeReason:O.rollModeReason}}),$=De(e,t);$!=null&&$.statBlock.attacks.length&&$.statBlock.attacks.forEach((v,T)=>{const F=`wildshape:${T}`,h=pe([...u,ke(e,"attack_rolls",F,v.name||`Attacco ${T+1}`)]);p.push({value:F,label:`${v.name||`Attacco ${T+1}`} (${V(v.to_hit||0)})`,shortLabel:v.name||`Attacco ${T+1}`,modifier:Number(v.to_hit)||0,rollMode:h.rollMode,rollModeReason:h.rollModeReason})});const n=(s.spellcasting||{}).ability,E=n?(q=s.abilities)==null?void 0:q[n]:null,w=me(E),k=w===null||l===null?null:w+l,g=(Array.isArray(s.spells)?s.spells:[]).filter(v=>(v.kind==="cantrip"||Number(v.level)===0)&&v.attack_roll&&v.damage_die);return n&&k!==null&&g.forEach(v=>{const T=`spell:${v.id}`,F=pe([...u,ke(e,"attack_rolls",T,v.name)]);p.push({value:T,label:`${v.name} (${V(k)})`,shortLabel:v.name,modifier:k,rollMode:F.rollMode,rollModeReason:F.rollModeReason})}),p}function ds(e){var p;const a=e.data||{},t=X(a.proficiency_bonus),i=(a.spellcasting||{}).ability,o=i?(p=a.abilities)==null?void 0:p[i]:null,r=me(o);if(!i||r===null||t===null)return[];const l=r+t,c="spell-attack",u=pe([...Ge(e),ke(e,"attack_rolls",c,"Incantesimi")]);return[{value:c,label:`Incantesimi (${V(l)})`,shortLabel:"Incantesimi",modifier:l,rollMode:u.rollMode,rollModeReason:u.rollModeReason}]}function Oe(e){var a;return((a=Se.find(t=>t.key===e))==null?void 0:a.label)||e}function us(e,a,t){var l;const s=Math.max(Number(a)||0,0);if(!t)return{amount:s,reason:null};const i=((l=e==null?void 0:e.data)==null?void 0:l.damage_defenses)||{},o=Array.isArray(i.resistances)?i.resistances:[],r=Array.isArray(i.immunities)?i.immunities:[];return r.includes("all")||r.includes(t)?{amount:0,reason:`immunità a ${Oe(t)}`}:o.includes("all")||o.includes(t)?{amount:Math.floor(s/2),reason:`resistenza a ${Oe(t)}`}:{amount:s,reason:null}}function xa(e,a){if(!(a!=null&&a.consumes_ammunition))return null;const t=a.required_ammunition_type||a.ammunition_type;return(e||[]).filter(s=>s.id!==a.id).filter(s=>s.category!=="container").filter(s=>!t||s.ammunition_type===t).filter(s=>Number(s.qty)>0).sort((s,i)=>String(s.name||"").localeCompare(String(i.name||""),"it",{sensitivity:"base"}))[0]||null}async function ps(e,a){const t=xa(e,a);if(!t)return!1;const s=Math.max((Number(t.qty)||0)-1,0),i=await Ce(t.id,{qty:s}),r=(te().cache.items||[]).map(l=>String(l.id)===String(t.id)?{...l,...i||{},qty:s}:l);return be("items",r),await ye({items:r}),A(`${t.name} consumato (${s} rimasti)`),!0}function ms(e){var $,y,n;const{activeCharacter:a,sheetCharacter:t,canEditCharacter:s,companions:i}=de();if(!a||!e)return;const o=te().cache.items||[],r=Na(t||a,o,i),l=r.find(E=>E.value===e);if(!l)return;const c=e.startsWith("weapon:")?e.replace("weapon:",""):null,u=c?o.find(E=>String(E.id)===c||E.name===c):null;if(u!=null&&u.consumes_ammunition&&!xa(o,u)){A("Munizioni esaurite o non disponibili per questa arma.","error");return}let p=!1;we({title:`Tiro per Colpire • ${l.shortLabel||l.label}`,mode:"d20",rollType:"TC",selection:{label:"Attacco",options:r,value:l.value},allowInspiration:!!(($=a==null?void 0:a.data)!=null&&$.inspiration)&&s,weakPoints:Number((n=(y=a==null?void 0:a.data)==null?void 0:y.hp)==null?void 0:n.weak_points)||0,characterId:a.id,historyLabel:l.shortLabel||l.label,onRollComplete:async()=>{if(!(!(u!=null&&u.consumes_ammunition)||p)){p=!0;try{await ps(te().cache.items||o,u)}catch{A("Errore consumo munizioni","error")}}}})}function Ca(e){var $,y,n,E,w;const{activeCharacter:a,sheetCharacter:t,companions:s,canEditCharacter:i}=de(),o=te().cache.items||[],r=!!(($=a==null?void 0:a.data)!=null&&$.inspiration)&&i,l=Number((n=(y=a==null?void 0:a.data)==null?void 0:y.hp)==null?void 0:n.weak_points)||0,c=r&&a?async()=>{const k=a.data||{};k.inspiration&&await J(a,{...k,inspiration:!1},"Ispirazione consumata",Te?()=>z(Te):null)}:null,p={"saving-throws":{title:"Tiro Salvezza",mode:"d20",rollType:"TS",selection:a?{label:"Tiro salvezza",options:Qe(t||a)}:null},skills:{title:"Tiro Abilità",mode:"d20",rollType:"TA",selection:a?{label:"Abilità",options:Ma(t||a,o)}:null},"special-skills":{title:"Tiro Abilità Speciale",mode:"d20",rollType:"TA",selection:a?{label:"Abilità speciale",options:La(t||a,o)}:null},"attack-roll":{title:"Tiro per Colpire",mode:"d20",rollType:"TC",selection:a?{label:"Attacco",options:Na(t||a,o,s)}:null},"spell-attack":{title:"Tiro per Colpire Incantesimi",mode:"d20",rollType:"TC",selection:a?{label:"Incantesimi",options:ds(a)}:null},roller:{title:"Lancia Dadi generico",mode:"generic",rollType:"GEN"}}[e]??{title:"Lancia dadi",mode:"generic"};if(e==="spell-attack"&&!((w=(E=p.selection)==null?void 0:E.options)!=null&&w.length)){A("Configura abilità da incantatore e bonus competenza per usare questo tiro.","error");return}we({...p,allowInspiration:r,onConsumeInspiration:c,weakPoints:l,characterId:a==null?void 0:a.id})}async function fs(e,a=[],t=null){var p,$;const s=Array.isArray((p=e==null?void 0:e.data)==null?void 0:p.weapon_masteries)?e.data.weapon_masteries:[];if(!(!!(($=e==null?void 0:e.data)!=null&&$.weapon_mastery_enabled)||s.length>0))return;const o=[...new Set((a||[]).filter(y=>y.category==="weapon"&&y.weapon_mastery).map(y=>y.weapon_mastery))];if(!o.length)return;const r=document.createElement("div");r.className="drawer-form modal-form-grid",r.innerHTML=`
    <p class="muted">A fine riposo lungo puoi riconfigurare le maestrie tra quelle disponibili sulle armi nel tuo inventario.</p>
    <div class="weapon-mastery-list">
      ${o.map(y=>`
        <label class="toggle-pill weapon-mastery-card">
          <input type="checkbox" name="rest_weapon_mastery_${y}" ${s.includes(y)?"checked":""} />
          <span class="weapon-mastery-card__body">
            <strong>${We(y)}</strong>
            <small>${Ve(y)}</small>
          </span>
        </label>
      `).join("")}
    </div>
  `;const l=await ce({title:"Maestrie armi dopo riposo lungo",submitLabel:"Salva maestrie",content:r,cardClass:["modal-card--wide","modal-card--scrollable"]});if(!l)return;const c=o.filter(y=>l.has(`rest_weapon_mastery_${y}`)),u={...e.data||{},weapon_masteries:c};await J(e,u,null,t?()=>z(t):null)}async function bs(e,a){var i,o;const{activeCharacter:t}=de();if(!(!t||!await je({title:"Conferma riposo",message:e==="long_rest"?"Stai per effettuare un riposo lungo: risorse, slot e recuperi verranno aggiornati in base alle regole configurate.":"Stai per effettuare un riposo breve: verranno aggiornate solo le risorse che si recuperano con questo tipo di riposo.",confirmLabel:"Conferma riposo"})))try{await Ta(t.id,e),A(e==="long_rest"?"Riposo lungo completato":"Riposo breve completato");const l=await pa(t.id);be("resources",l),await ye({resources:l});const c=ct(t.data,e);if(c?await J(t,c,null,a?()=>z(a):null):a&&z(a),e==="long_rest"){const u=te().characters.find(y=>y.id===t.id),p=te().cache.items||[];u&&await fs(u,p,a);const $=te().characters.find(y=>y.id===t.id)||u;(o=(i=$==null?void 0:$.data)==null?void 0:i.spellcasting)!=null&&o.can_prepare&&await ba($,a?()=>z(a):null)}}catch{A("Errore aggiornamento risorse","error")}}async function gs(e,a){var k,B,g,q,v,T,F,h;const{canEditCharacter:t}=de();if(!e)return;if(!t){A("Azioni HP disponibili solo con profilo online","error");return}const s=((k=e.data)==null?void 0:k.hit_dice)||{},i=Number(s.used)||0,o=Number(s.max)||0,r=Math.max(o-i,0),l=Ue(s.die);if(!l){A("Configura un dado vita valido","error");return}if(r<=0){A("Nessun dado vita disponibile","error");return}const c=me((g=(B=e.data)==null?void 0:B.abilities)==null?void 0:g.con)??0;let u=1;const $=await he({keepOpen:!1,title:`Dado vita • ${s.die||`d${l}`}`,mode:"generic",notation:`1d${l}`,modifier:c,rollType:"GEN",characterId:e.id,historyLabel:"Dado vita",genericDiceMax:r,warning:"Attenzione: ogni dado vita lanciato verrà sottratto ai dadi vita disponibili.",onRollComplete:({diceCount:N})=>{u=Math.max(Number(N)||1,1)}}).waitForRoll;if(!$||$<=0)return;if(u>r){A(`Hai solo ${r} dadi vita disponibili`,"error");return}const y=Number((v=(q=e.data)==null?void 0:q.hp)==null?void 0:v.current)||0,n=(F=(T=e.data)==null?void 0:T.hp)==null?void 0:F.max,E=y+Number($),w=n!=null?Math.min(E,Number(n)):E;await J(e,{...e.data,hp:{...(h=e.data)==null?void 0:h.hp,current:w},hit_dice:{...s,used:Math.min(i+u,o)}},`PF curati +${$} (${u}d${l})`,()=>{a&&z(a)})}async function vs(e,a){var M,R,W,G,j,H,U,ie,ee,le,ve,P,ae;const{activeCharacter:t,companions:s,canEditCharacter:i}=de();if(!t)return;if(!i){A("Azioni HP disponibili solo con profilo online","error");return}const l=await ce({title:e==="heal"?"Cura PF":"Subisci danno",submitLabel:e==="heal"?"Cura":"Danno",content:hs(t,{allowHitDice:!1,allowTempHp:e==="heal",allowMaxOverride:e==="damage"})});if(!l)return;const c=l.has("use_hit_dice"),u=l.has("temp_hp"),p=((M=t.data)==null?void 0:M.hit_dice)||{},$=((R=t.data)==null?void 0:R.abilities)||{},y=Number(p.used)||0,n=Number(p.max)||0,E=Ue(p.die),w=Math.max(Number(l.get("hit_dice_count"))||1,1);let k=Number(l.get("amount"));const B=k,g=e==="damage"&&((W=l.get("damage_type"))==null?void 0:W.toString())||"";if(e==="heal"&&c){if(!E){A("Configura un dado vita valido","error");return}if(y>=n){A("Nessun dado vita disponibile","error");return}const Q=Math.max(n-y,0);if(w>Q){A(`Hai solo ${Q} dadi vita disponibili`,"error");return}const se=me($.con)??0,ne=Array.from({length:w},()=>rt(E)).reduce(($e,xe)=>$e+xe,0);k=Math.max(ne+se*w,1)}if(!k||k<=0){A("Inserisci un valore valido","error");return}const q=e==="damage"?us(t,k,g):{amount:k,reason:null};e==="damage"&&(k=q.amount);const v=Number((j=(G=t.data)==null?void 0:G.hp)==null?void 0:j.current)||0,T=Number((U=(H=t.data)==null?void 0:H.hp)==null?void 0:U.temp)||0,F=(ee=(ie=t.data)==null?void 0:ie.hp)==null?void 0:ee.max,h=e==="damage"?De(t,s):null,N=l.get("hp_max_override"),S=N===null||N===""?null:Number(N);if(e==="damage"&&S!==null&&(!Number.isFinite(S)||S<=0)){A("Inserisci un massimo PF valido","error");return}let _=v,D=T,I=((le=t.data)==null?void 0:le.wild_shape)??null,O=0,K=0;if(e==="heal"&&u)D=T+k;else if(e==="heal")_=v+k;else{const Q=Math.min(T,k);D=T-Q;let se=k-Q;if(h&&se>0){O=Math.min(h.hpCurrent,se);const re=Math.max(h.hpCurrent-O,0);se-=O,I=re>0?{...((ve=t.data)==null?void 0:ve.wild_shape)||{},active_companion_id:h.companion.id,hp_current:re}:null}se>0&&(K=se,_=Math.max(v-se,0))}const Z=S??F,ue=Z!=null?Math.min(_,Number(Z)):_,Y=e==="heal"&&c?{...p,used:Math.min(y+w,n)}:p,d=e==="damage"&&g?` ${Oe(g).toLowerCase()}`:"",m=e==="damage"&&q.reason?` (da ${B}, ${q.reason})`:"",f=e==="damage"&&O>0?` · forma selvatica -${O}`:"",b=e==="damage"&&K>0?` · PF -${K}`:"",L=e==="heal"?`${u?"HP temporanei +":"PF curati +"}${k}${c?` (${w}d${E})`:""}`:`Danno${d} ${k}${m}${f}${b}`,x=e==="damage"&&Number(k)>0&&!!((P=t.data)!=null&&P.concentration_active),C=async()=>{var ne,$e,xe;if(a&&z(a),!x)return;const Q=Ke(t,s),se=Qe(Q||t),re=se.find(qa=>qa.value==="con");!re||re.disabled||we({title:"Tiro salvezza concentrazione • COS",mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:se,value:re.value},allowInspiration:!!((ne=t==null?void 0:t.data)!=null&&ne.inspiration)&&i,weakPoints:Number((xe=($e=t==null?void 0:t.data)==null?void 0:$e.hp)==null?void 0:xe.weak_points)||0,characterId:t.id,historyLabel:"TS concentrazione"})};await J(t,{...t.data,hp:{...(ae=t.data)==null?void 0:ae.hp,current:ue,temp:D,max:S??F},wild_shape:I,hit_dice:Y},L,C)}function we({title:e,mode:a,selection:t=null,allowInspiration:s=!1,onConsumeInspiration:i=null,rollType:o=null,weakPoints:r=0,characterId:l=null,historyLabel:c=null,onRollComplete:u=null}){he({keepOpen:!0,title:e,mode:a,selection:t,allowInspiration:s,onConsumeInspiration:i,rollType:o,weakPoints:r,characterId:l,historyLabel:c,onRollComplete:u})}function hs(e,{allowHitDice:a=!0,allowTempHp:t=!1,allowMaxOverride:s=!1}={}){var F,h,N;const i=(S,_={})=>{const D=S==null?void 0:S.querySelector('input[type="number"]');D&&at(D,_)},o=document.createElement("div");o.className="modal-form-grid hp-shortcut-fields";const r=qe({label:"Valore",name:"amount",type:"number",value:"1"});r.classList.add("hp-shortcut-fields__amount");const l=r.querySelector("input");l&&Pe(l,{min:1}),l&&(l.min="1",l.required=!0);const c=document.createElement("div");if(c.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",c.appendChild(r),t){const S=document.createElement("div");S.className="modal-toggle-field",S.innerHTML=`
      <span class="modal-toggle-field__label">HP temporanei</span>
      <label class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="temp_hp" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </label>
    `,c.appendChild(S)}if(o.appendChild(c),!a){if(s){const S=document.createElement("label");S.className="field hp-shortcut-fields__damage-type";const _=document.createElement("span");_.textContent="Tipo di danno";const D=Re([{value:"",label:"Nessun tipo (danno normale)"},...Se.map(K=>({value:K.key,label:K.label}))],"");D.name="damage_type",S.append(_,D),c.appendChild(S);const I=qe({label:"Nuovo massimo PF",name:"hp_max_override",type:"number",value:((h=(F=e==null?void 0:e.data)==null?void 0:F.hp)==null?void 0:h.max)??""});I.classList.add("hp-shortcut-fields__max");const O=I.querySelector("input");O&&(Pe(O,{min:1}),O.min="1"),c.appendChild(I)}return o}const u=((N=e==null?void 0:e.data)==null?void 0:N.hit_dice)||{},p=Number(u.used)||0,$=Number(u.max)||0,y=Math.max($-p,0),n=Ue(u.die),E=y>0&&n,w=document.createElement("div");w.className="modal-toggle-field";const k=u.die?`${u.die}`:"dado vita";w.innerHTML=`
    <span class="modal-toggle-field__label">Usa dado vita (${k}) · rimasti ${y}/${$||"-"}</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="use_hit_dice" ${E?"":"disabled"} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const B=document.createElement("label");B.className="field hit-dice-count hp-shortcut-fields__count",B.innerHTML=`
    <span>Numero dadi vita</span>
    <input type="number" name="hit_dice_count" min="1" max="${y}" value="1" />
  `,i(B,{decrementLabel:"Riduci dadi vita",incrementLabel:"Aumenta dadi vita"});const g=document.createElement("div");if(g.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",g.append(w,B),o.appendChild(g),!E){const S=document.createElement("p");S.className="muted",S.textContent="Nessun dado vita disponibile o configurato.",o.appendChild(S)}const q=w.querySelector("input"),v=B.querySelector("input");v&&(v.required=!1);const T=()=>{const S=q==null?void 0:q.checked;l&&(l.disabled=!!S,l.required=!S,S?l.value="":l.value||(l.value="1"),v&&(v.disabled=!S,v.required=!!S,S||(v.value="1")))};return q==null||q.addEventListener("change",T),T(),o}export{Ls as bindGlobalFabHandlers,z as renderHome};
