import{s as $e,a as ke,b as X,c as Qe,e as fa,R as pe,u as ga,f as Je,d as me,g as ba,h as Ee,i as va}from"./constants-Dd0uyYi2.js";import{c as ha,g as Xe,f as _a,a as ya,b as $a,d as ka,e as Sa,m as wa,h as Ea,u as Aa,i as La,j as Na,k as Ma,l as Ca,n as Ae,o as ze,p as xa}from"./walletApi-D2zkTG4e.js";import{c as E,o as ne,u as re,a as ce,b as Le,g as Y,n as te,d as _e,e as Ne,s as De,f as qa,h as Ra,i as za,j as Da}from"./index-8QWsgLEo.js";import{openDiceOverlay as oe}from"./dice-uSJYQlZ0.js";import{o as Te}from"./characterDrawer-BZfhdHMC.js";import{n as G,c as ue,f as U,g as ae,a as Ta,b as Ba,d as Ia,e as se,h as ja,s as Fa,i as Pa,p as Ha,j as Be,k as xe,r as Oa,l as Va,m as Ie,o as Ua,q as Wa,t as Ka}from"./utils-BKuRJuHw.js";import{s as J,o as Ye,a as Ga,f as je,b as Fe,c as Qa,d as Ja,e as Pe,g as Xa,r as Ya,h as Za,i as et,j as at,k as He,l as tt,m as st,n as it}from"./modals-BAD1eAgc.js";function nt(e,a){return e?`
    <div>
      <p>Non hai ancora un personaggio.</p>
      <div class="button-row">
        <button class="primary" data-create-character>Nuovo personaggio</button>
      </div>
    </div>
  `:`<p class="muted">${a?"Modalità offline attiva: crea un personaggio quando torni online.":"Accedi per creare un personaggio."}</p>`}function ot(e,a,t=[]){const s=e.data||{},r=s.hp||{},l=s.hit_dice||{},n=s.abilities||{},o=G(s.proficiency_bonus),p=!!s.inspiration,f=!!s.concentration_active,g=s.initiative??ae(n.dex),_=s.skills||{},i=s.skill_mastery||{},$=Ta(n,o,_,i),k=G(r.current),u=G(r.max),z=G(r.temp),w=s.death_saves||{},h=Math.max(0,Math.min(3,Number(w.successes)||0)),D=Math.max(0,Math.min(3,Number(w.failures)||0)),x=u?Math.min(Math.max(Number(k)/u*100,0),100):0,y=Math.max(0,Number(z)||0),I=Math.max(0,Number(u??k??0)),q=y>0,R=q?100:0,S=q?I:1,v=q?y:0,P=u?`${k??"-"}/${u}`:`${k??"-"}`,j=z??"-",V=Math.max(0,Math.min(6,Number(r.weak_points)||0)),K=Array.isArray(s.conditions)?s.conditions:s.condition?[s.condition]:[],c=Qe.filter(L=>K.includes(L.key)),d=c.length?c.map(L=>L.label).join(", "):"Nessuna condizione",b=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti delle condizioni">?</summary>
      <div class="info-tooltip__panel">
        ${c.length?`
      <ul class="condition-track__list">
        ${c.map(L=>`<li><strong>${L.label}:</strong> ${L.effect}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun effetto attivo.</p>'}
      </div>
    </details>
  `,A=[{value:1,description:"Svantaggio sulle prove di caratteristica."},{value:2,description:"Velocità dimezzata."},{value:3,description:"Svantaggio sui tiri per colpire e tiri salvezza."},{value:4,description:"Punti ferita massimi dimezzati."},{value:5,description:"Velocità ridotta a 0."},{value:6,description:"Morte."}],N=A.filter(L=>L.value<=V),M=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti dei punti indebolimento">?</summary>
      <div class="info-tooltip__panel">
        ${N.length?`
      <ul class="weakness-track__list">
        ${N.map(L=>`<li>${L.description}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun indebolimento.</p>'}
      </div>
    </details>
  `,T=`Livello attuale: ${V}`,H=Ba(s,n,t),O=[{key:"str",label:X.str,value:n.str},{key:"dex",label:X.dex,value:n.dex},{key:"con",label:X.con,value:n.con},{key:"int",label:X.int,value:n.int},{key:"wis",label:X.wis,value:n.wis},{key:"cha",label:X.cha,value:n.cha}];return`
    <div class="character-overview">
      <div class="character-summary">
        <div class="character-hero">
          ${s.avatar_url?`<img class="character-avatar" src="${s.avatar_url}" alt="Ritratto di ${e.name}" />`:""}
          <div>
            <h3 class="character-name">${e.name}</h3>
            <div class="character-meta">
              <span class="meta-tag">Livello ${s.level??"-"}</span>
              <span class="meta-tag">Razza ${s.race??"-"}</span>
              <span class="meta-tag">Classe ${s.class_name??s.class_archetype??"-"}</span>
              <span class="meta-tag">Archetipo ${s.archetype??"-"}</span>
              <span class="meta-tag">Allineamento ${s.alignment??"-"}</span>
              <span class="meta-tag">Background ${s.background??"-"}</span>
            </div>
          </div>
        </div>
        <div class="character-summary-actions">
          <div class="proficiency-chip">
            <span>Bonus competenza</span>
            <strong>${U(o)}</strong>
          </div>
          <div class="inspiration-chip">
            <span>Ispirazione</span>
            <button
              class="inspiration-toggle"
              type="button"
              data-toggle-inspiration
              aria-pressed="${p}"
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
              aria-pressed="${f}"
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
          ${O.map(L=>{const F=G(L.value),W=F===null?"-":Pa(F);return`
            <div class="stat-card stat-card--${L.key}">
              <span>${L.label}</span>
              <strong>${F??"-"}</strong>
              <span class="stat-card__modifier" aria-label="Modificatore ${L.label}">${W}</span>
            </div>
          `}).join("")}
        </div>
      </div>
      <div class="hp-panel">
        <div class="hp-bar-row">
          <div class="armor-class-card">
            <span>CA</span>
            <strong>${H??"-"}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">🛡️</span>
          </div>
          <div class="armor-class-card armor-class-card--initiative">
            <span>Iniz</span>
            <strong>${U(G(g))}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">⚡</span>
          </div>
          <div class="armor-class-card armor-class-card--speed">
            <span>Vel</span>
            <strong>${s.speed??"-"}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">🏃</span>
          </div>
          <div class="hp-bar-stack">
            <div class="hp-bar-label">
              <span>HP</span>
              <strong>${P}</strong>
              <span class="hp-bar-label__divider" aria-hidden="true">•</span>
              <span class="hp-bar-label__temp-group ${q?"is-active":""}">
                <span class="hp-bar-label__temp">HP temporanei</span>
                <strong>${j}</strong>
              </span>
            </div>
            <div class="hp-bar-track">
              <div class="hp-bar" style="flex: ${S};">
                <div class="hp-bar__fill" style="width: ${x}%;"></div>
              </div>
              ${q?`
              <div class="hp-bar hp-bar--temp is-active" style="flex: ${v};">
                <div class="hp-bar__fill hp-bar__fill--temp" style="width: ${R}%;"></div>
              </div>
              `:""}
            </div>
            <div class="hp-panel-hit-dice">
              <span>Dadi vita</span>
              <strong>${Ia(l)}</strong>
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
            ${a?'<p class="hp-panel-hit-dice__warning">Se lanci il dado verrà sottratto ai dadi vita disponibili.</p>':""}
          </div>
        </div>
        <div class="hp-panel-subgrid">
          <div class="stat-chip stat-chip--highlight">
            <span>Percezione passiva</span>
            <strong>${$??"-"}</strong>
          </div>
          <div class="hp-panel-status-row">
            <div class="weakness-track">
              <div class="track-label-row">
                <span class="weakness-track__label">Punti indebolimento</span>
                ${M}
              </div>
              <div class="weakness-track__group" role="radiogroup" aria-label="Livelli indebolimento">
                ${A.map(L=>{const F=L.value===V;return`
                  <button
                    class="death-save-dot ${F?"is-filled":""}"
                    type="button"
                    role="radio"
                    aria-checked="${F}"
                    data-weakness-level="${L.value}"
                    aria-label="Livello ${L.value}: ${L.description}"
                  >
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="weakness-track__description">${T}</div>
            </div>
            <div class="condition-track">
              <div class="track-label-row">
                <span class="condition-track__label">Condizioni</span>
                ${b}
              </div>
              <div class="condition-track__row">
                <span class="condition-track__value">${d}</span>
              </div>
            </div>
            <div class="death-saves">
              <span class="death-saves__label">TS morte</span>
              <div class="death-saves__group" aria-label="Successi">
                <span class="death-saves__tag">✓</span>
                ${Array.from({length:3},(L,F)=>{const W=F+1;return`
                  <button class="death-save-dot ${W<=h?"is-filled":""}" type="button" data-death-save="successes" data-death-save-index="${W}" aria-label="Successi ${W}">
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="death-saves__group" aria-label="Fallimenti">
                <span class="death-saves__tag">✗</span>
                ${Array.from({length:3},(L,F)=>{const W=F+1;return`
                  <button class="death-save-dot ${W<=D?"is-filled":""}" type="button" data-death-save="failures" data-death-save-index="${W}" aria-label="Fallimenti ${W}">
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
        ${dt(e,t,a)}
      </div>
    </div>
  `}function lt(e){const a=e.data||{},t=a.abilities||{},s=G(a.proficiency_bonus),r=a.skills||{},l=a.skill_mastery||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${ke.map(n=>{const o=!!r[n.key],p=!!l[n.key],f=ue(t[n.ability],s,o?p?2:1:0);return`
          <button class="modifier-card modifier-card--interactive ${p?"modifier-card--mastery":o?"modifier-card--proficiency":""}" type="button" data-skill-card="${n.key}" aria-label="Tira abilità ${n.label}">
            <div>
              <div class="modifier-title">
                <strong>${n.label}</strong>
                <span class="modifier-ability modifier-ability--${n.ability}">${X[n.ability]}</span>
              </div>
            </div>
            <div class="modifier-value">${U(f)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function rt(e){const a=e.data||{},t=a.abilities||{},s=G(a.proficiency_bonus),r=Array.isArray(a.special_skill_rolls)?a.special_skill_rolls:[];return r.length?`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${r.map((l,n)=>{var u;const o=X[l.ability]?l.ability:"str",p=!!l.proficient,f=!!l.mastery&&p,g=ue(t[o],s,p?f?2:1:0),_=Number(l.bonus)||0,i=(g??0)+_,$=f?"modifier-card--mastery":p?"modifier-card--proficiency":"",k=((u=l.name)==null?void 0:u.trim())||`Tiro speciale ${n+1}`;return`
          <button class="modifier-card modifier-card--interactive ${$}" type="button" data-special-skill-card="${l.id??n}" aria-label="Tira abilità speciale ${k}">
            <div>
              <div class="modifier-title">
                <strong>${k}</strong>
                <span class="modifier-ability modifier-ability--${o}">${X[o]}</span>
              </div>
            </div>
            <div class="modifier-value">${U(i)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `:`
      <div class="detail-section">
        <p class="muted">Nessun tiro speciale configurato. Aggiungilo dalla modifica personaggio.</p>
      </div>
    `}function ct(e){const a=e.data||{},t=a.abilities||{},s=G(a.proficiency_bonus),r=a.saving_throws||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${$e.map(l=>{const n=!!r[l.key],o=ue(t[l.key],s,n?1:0);return`
          <button class="modifier-card modifier-card--interactive ${n?"modifier-card--proficiency":""}" type="button" data-saving-throw-card="${l.key}" aria-label="Tira salvezza ${l.label}">
            <div>
              <div class="modifier-title">
                <strong>${l.label}</strong>
              </div>
            </div>
            <div class="modifier-value">${U(o)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function dt(e,a=[],t=!1){const s=e.data||{},r=s.proficiencies||{},l=s.proficiency_notes||"",{tools:n,languages:o}=Ha(l),p=s.language_proficiencies||"",f=Be(p),g=s.talents||"",_=Be(g),$=[...f,...o].reduce((u,z)=>{const w=z.trim();if(!w)return u;const h=w.toLowerCase();return u.seen.has(h)||(u.seen.add(h),u.values.push(w)),u},{values:[],seen:new Set}).values,k=fa.filter(u=>r[u.key]).map(u=>u.label);return`
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
        </div>
        <div class="detail-card detail-card--text tab-panel is-active" role="tabpanel" data-proficiency-panel="equipment">
          ${k.length?`<div class="tag-row">${k.map(u=>`<span class="chip">${u}</span>`).join("")}</div>`:'<p class="muted">Nessuna competenza equipaggiamento.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="tools">
          ${n.length?`<div class="tag-row">${n.map(u=>`<span class="chip">${u}</span>`).join("")}</div>`:'<p class="muted">Aggiungi strumenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="languages">
          ${$.length?`<div class="tag-row">${$.map(u=>`<span class="chip">${u}</span>`).join("")}</div>`:'<p class="muted">Aggiungi lingue conosciute nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="talents">
          ${_.length?`<div class="tag-row">${_.map(u=>`<span class="chip">${u}</span>`).join("")}</div>`:'<p class="muted">Aggiungi talenti nel profilo.</p>'}
        </div>
      </div>
    </div>
  `}function ut(e,a=[],t=!1){const s=(a||[]).filter(o=>se(o).length),r=(a||[]).filter(o=>o.attunement_active).length,l=ha(a),n=Xe(e);return`
    <section class="card home-card home-section home-scroll-panel">
      <header class="card-header">
        <div>
          <p class="eyebrow">Gestione Equipaggiamento</p>
          <div class="pill-row">
            <span class="pill pill--accent">Oggetti in sintonia: ${r}</span>
            <span class="pill">Carico totale: ${_a(l,n)}</span>
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
            ${s.map(o=>{const p=ya(o);return`
              <li class="modifier-card attack-card resource-card inventory-item-card">
                <div class="resource-card__badges">
                  ${o.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${p.magic}</span>`:""}
                  ${o.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${p.attunement}</span>`:""}
                </div>
                <div class="attack-card__body resource-card__body">
                  <div class="resource-card__title item-info">
                    ${o.image_url?`<img class="item-avatar" src="${o.image_url}" alt="Foto di ${o.name}" data-item-image="${o.id}" />`:""}
                    <div class="item-info-body">
                      <div class="item-info-line">
                        <button class="item-name-button attack-card__name-button" type="button" data-item-preview="${o.id}" aria-label="Apri anteprima ${o.name}">${o.name}</button>
                        <span class="muted item-meta">
                          ${$a(o.category)} · ${ka(se(o))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ${t?`
                  <div class="resource-card-actions">
                    <button class="resource-action-button" type="button" data-unequip="${o.id}">Rimuovi</button>
                  </div>
                `:""}
              </li>
            `}).join("")}
          </ul>
        `:'<p class="muted">Nessun oggetto equipaggiato.</p>'}
    </section>
  `}function pt(e,a=[]){var x;const t=e.data||{},s=Number(t.attack_bonus_melee??t.attack_bonus)||0,r=Number(t.attack_bonus_ranged??t.attack_bonus)||0,l=Number(t.damage_bonus_melee??t.damage_bonus)||0,n=Number(t.damage_bonus_ranged??t.damage_bonus)||0,o=Number(t.extra_attacks)||0,p=a.filter(y=>y.category==="weapon"&&y.equipable&&se(y).length),g=(t.spellcasting||{}).ability,_=g?(x=t.abilities)==null?void 0:x[g]:null,i=ae(_),$=G(t.proficiency_bonus),k=i===null||$===null?null:i+$,z=(Array.isArray(t.spells)?t.spells:[]).filter(y=>(y.kind==="cantrip"||Number(y.level)===0)&&y.attack_roll&&y.damage_die),w=z.length&&k!==null&&g;if(!p.length&&!w)return'<p class="muted">Nessuna arma equipaggiata.</p>';const h=[];return o>0&&h.push(`Attacco Extra (${o})`),s&&h.push(`Mischia attacco ${U(s)}`),l&&h.push(`Mischia danni ${U(l)}`),r&&h.push(`Distanza attacco ${U(r)}`),n&&h.push(`Distanza danni ${U(n)}`),`
    ${h.length?`<div class="tag-row">${h.map(y=>`<span class="chip">${y}</span>`).join("")}</div>`:""}
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${p.map(y=>{var H;const I=y.weapon_range||(y.range_normal?"ranged":"melee"),q=y.attack_ability||(I==="ranged"?"dex":"str"),R=ae((H=t.abilities)==null?void 0:H[q])??0,S=t.proficiencies||{},P=(y.weapon_type==="simple"?!!S.weapon_simple:y.weapon_type==="martial"?!!S.weapon_martial:!1)?G(t.proficiency_bonus)??0:0,j=I==="ranged"?r:s,V=I==="ranged"?n:l,K=R+P+(Number(y.attack_modifier)||0)+j,c=ja(y).filter(O=>O.damageDie),d=Number(y.range_normal)||null,m=Number(y.range_disadvantage)||null,b=Number(y.melee_range)||1.5,A=[];I==="melee"&&b>1.5&&A.push(`Portata ${b} m`),I==="melee"&&y.is_thrown&&d&&A.push(`Lancio ${d}${m?`/${m}`:""}`),I!=="melee"&&d&&A.push(`Gittata ${d}${m?`/${m}`:""}`);const N=A.join(" · "),C=q==="dex"?"DES":q==="str"?"FOR":q.toUpperCase(),M=y.id??y.name;return(c.length?c:[{id:"default",label:"",damageDie:null,damageModifier:Number(y.damage_modifier)||0}]).map(O=>{const L=R+(Number(O.damageModifier)||0)+V,F=O.damageDie?`${O.damageDie}${L?` ${U(L)}`:""}`:"-",W=O.id==="alternate"?` · ${O.label}`:"",Q=`weapon:${M}:${O.id}`;return`
          <div class="modifier-card attack-card" data-roll-attack="weapon:${y.id??y.name}">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${y.name}${W}</strong>
                <span class="modifier-ability modifier-ability--${q}">${C}</span>
                <span class="attack-card__hit">${U(K)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${F}</span>
                ${N?`<span class="muted">${N}</span>`:""}
              </div>
            </div>
            <button class="icon-button icon-button--fire" data-roll-damage="${Q}" aria-label="Calcola danni ${y.name}${W}">
              <span aria-hidden="true">🔥</span>
            </button>
          </div>
        `}).join("")}).join("")}
        ${w?z.map(y=>{const I=Number(y.damage_modifier)||0,q=`${y.damage_die}${I?` ${U(I)}`:""}`,R=X[g]??(g==null?void 0:g.toUpperCase()),S=y.range?`Range ${y.range}`:"";return`
            <div class="modifier-card attack-card" data-roll-attack="spell:${y.id}">
              <div class="attack-card__body">
                <div class="attack-card__title">
                  <strong class="attack-card__name">${y.name}</strong>
                  <span class="modifier-ability modifier-ability--${g}">${R}</span>
                  <span class="attack-card__hit">${U(k)}</span>
                </div>
                <div class="attack-card__meta">
                  <span class="attack-card__damage">${q}</span>
                 
                  ${S?`<span class="muted">${S}</span>`:""}
                </div>
              </div>
              <button class="icon-button icon-button--fire" data-roll-damage="spell:${y.id}" aria-label="Calcola danni ${y.name}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          `}).join(""):""}
      </div>
    </div>
  `}function mt(e,a=!1){var S;const t=e.data||{},s=t.spell_notes||"",r=Array.isArray(t.spells)?Fa(t.spells):[],l=t.spellcasting||{},n=G(t.proficiency_bonus),o=l.ability,p=o?(S=t.abilities)==null?void 0:S[o]:null,f=ae(p),g=f===null||n===null?null:8+f+n,_=f===null||n===null?null:f+n,i=o?X[o]:null,$=l.slots||{},k=l.slots_max||{},u=l.recharge||"long_rest",w=Array.from({length:9},(v,P)=>P+1).map(v=>{const P=Math.max(0,Number($[v])||0),j=Math.max(P,Number(k[v])||0);return{level:v,count:P,max:j}}).filter(v=>v.max>0),h=[`${i??"-"}`,`CD ${g===null?"-":g}`,`TC ${_===null?"-":U(_)}`],D=h.length?`<div class="tag-row">${h.map(v=>`<span class="chip">${v}</span>`).join("")}</div>`:"",x=r.filter(v=>{if((Number(v.level)||0)<1)return!1;const j=v.prep_state||"known";return j==="prepared"||j==="always"}),y=r.filter(v=>(Number(v.level)||0)===0),I=x.filter(v=>(v.prep_state||"known")==="always"),q=x.filter(v=>(v.prep_state||"known")!=="always"),R=(v,P="")=>{const j=Number(v.level)||0,V=fe(v.cast_time),K=Ze(V);return`
      <div class="modifier-card attack-card resource-card spell-prepared-list__card">
        <div class="resource-card__badges spell-card__badges">
          ${v.concentration?'<span class="resource-chip resource-chip--floating resource-chip--concentration">C</span>':""}
          ${v.is_ritual?'<span class="resource-chip resource-chip--floating resource-chip--ritual">R</span>':""}
          ${V?`<span class="resource-chip resource-chip--floating ${K}">${V}</span>`:""}
        </div>
        <button class="spell-prepared-list__item" type="button" data-spell-quick-open="${v.id}">
          <span class="spell-prepared-list__name">${v.name}</span>
          ${j>0?`<span class="chip chip--small">${j}°</span>`:""}
        </button>
        <div class="resource-card-actions spell-card-actions">
          ${j>0?`<button class="resource-cta-button resource-cta-button--label" type="button" data-use-spell="${v.id}">Usa</button>`:""}
          ${a?`
            <button class="resource-action-button resource-icon-button" type="button" data-edit-spell="${v.id}" aria-label="Modifica incantesimo ${v.name}">✏️</button>
            <button class="resource-action-button resource-icon-button" type="button" data-delete-spell="${v.id}" aria-label="Elimina incantesimo ${v.name}">🗑️</button>
          `:""}
        </div>
      </div>
    `};return`
    ${D}
    <div class="detail-section">
      <div class="detail-card detail-card--text spell-summary-card">
        <div class="spell-slots">
          <span class="spell-slots__title">Slot rimanenti</span>
          <div class="spell-slots__list">
            ${w.map(v=>{const P=u==="short_rest"?"charge-indicator":"charge-indicator charge-indicator--long",j=Array.from({length:v.max},(V,K)=>{const c=K>=v.count,m=[P,c?"charge-indicator--used":""].filter(Boolean).join(" ");return a&&c?`<button type="button" class="${m}" data-restore-spell-slot="${v.level}" aria-label="Ripristina uno slot di livello ${v.level}"></button>`:a&&!c?`<button type="button" class="${m}" data-consume-spell-slot="${v.level}" aria-label="Consuma uno slot di livello ${v.level}"></button>`:`<span class="${m}"></span>`}).join("");return`
              <div class="spell-slot-row">
                <span class="spell-slot-label">Slot ${v.level}°</span>
                <span class="spell-slot-count">${v.count}</span>
                <div class="spell-slot-charges" aria-hidden="true">${j||'<span class="spell-slot-empty">-</span>'}</div>
              </div>
            `}).join("")}
          </div>
        </div>
        ${s?`<p class="spell-notes">${s}</p>`:""}
      </div>
      <div class="spell-prepared-list">
        <span class="spell-prepared-list__group-title">Trucchetti</span>
        ${y.length?`
          <div class="spell-prepared-list__items">
            ${y.map(v=>R(v)).join("")}
          </div>
        `:'<p class="muted">Nessun trucchetto disponibile.</p>'}
      </div>
      <div class="spell-prepared-list">
       
        ${x.length?`
          <div class="spell-prepared-list__group">
            <span class="spell-prepared-list__group-title">Preparati</span>
            ${q.length?`<div class="spell-prepared-list__items">${q.map(v=>R(v,"Preparato")).join("")}</div>`:'<p class="muted">Nessun incantesimo preparato.</p>'}
          </div>
          <div class="spell-prepared-list__group">
            <span class="spell-prepared-list__group-title">Sempre conosciuti</span>
            ${I.length?`<div class="spell-prepared-list__items">${I.map(v=>R(v,"Sempre preparato")).join("")}</div>`:'<p class="muted">Nessun incantesimo sempre conosciuto.</p>'}
          </div>
        `:'<p class="muted">Nessun incantesimo preparato disponibile.</p>'}
      </div>
    </div>
  `}function fe(e){const a=e==null?void 0:e.toString().trim();if(!a)return"";const t=a.toLowerCase();if(t.includes("bonus"))return"Azione Bonus";if(t.includes("reaz"))return"Reazione";if(t.includes("gratuit"))return"Azione Gratuita";if(t.includes("durata")||t.includes("più")||t.includes("piu")||t.includes("superiore"))return"Durata";if(t.includes("azion"))return"Azione";const s=pe.find(r=>r.label.toLowerCase()===t);return(s==null?void 0:s.label)??""}function Oe(e){if(!e)return pe.length;const a=fe(e),t=pe.findIndex(s=>s.label===a);return t===-1?pe.length:t}function Ze(e){var t;if(!e)return"";const a=fe(e);return((t=pe.find(s=>s.label===a))==null?void 0:t.className)??""}function ft(e){return[...e].sort((a,t)=>{const s=Oe(a.cast_time)-Oe(t.cast_time);return s!==0?s:(a.name??"").localeCompare(t.name??"","it",{sensitivity:"base"})})}function Ve(e,a,{showCharges:t=!0,showUseButton:s=!0,showDescription:r=!1,showCastTime:l=!0}={}){return`
    <ul class="resource-list resource-list--compact">
      ${e.map(n=>`
        <li class="modifier-card attack-card resource-card" data-resource-card="${n.id}">
          ${l&&fe(n.cast_time)?`<span class="resource-chip resource-chip--floating ${Ze(n.cast_time)}">${fe(n.cast_time)}</span>`:""}
          <div class="attack-card__body resource-card__body">
            <div class="attack-card__title resource-card__title">
              <strong class="attack-card__name">${n.name}</strong>
            </div>
            ${r?`<p class="resource-card__description">${n.description??""}</p>`:""}
            ${t&&Number(n.max_uses)?`
              <div class="resource-card__charges">
                ${bt(n)}
              </div>
            `:""}
          </div>
          <div class="resource-card-actions">
            ${s?`
              <button
                class="resource-cta-button resource-cta-button--label"
                data-use-resource="${n.id}"
                ${!Number(n.max_uses)||n.used>=Number(n.max_uses)?"disabled":""}
              >
                Usa
              </button>
            `:""}
            ${a?`
              <button class="resource-action-button resource-icon-button" data-edit-resource="${n.id}" aria-label="Modifica risorsa">✏️</button>
              <button class="resource-action-button resource-icon-button" data-delete-resource="${n.id}" aria-label="Elimina risorsa">🗑️</button>
            `:""}
          </div>
        </li>
      `).join("")}
    </ul>
  `}function gt(e,a){if(!e.length)return"<p>Nessuna risorsa.</p>";const t=ft(e),s=t.filter(o=>o.reset_on===null||o.reset_on==="none"),r=t.filter(o=>o.reset_on!==null&&o.reset_on!=="none"),l=r.length?`
      <div class="resource-section resource-section--active">
        <div class="resource-section__body">
          ${Ve(r,a,{showUseButton:!0})}
        </div>
      </div>
    `:'<p class="muted">Nessuna risorsa attiva.</p>',n=s.length?`
      <div class="resource-section">
        <header class="card-header"><div><p class="eyebrow">Risorse Passive</p></div></header>
        <div class="resource-section__body">
          ${Ve(s,a,{showCharges:!1,showUseButton:!1,showDescription:!0,showCastTime:!0})}
        </div>
      </div>
    `:"";return`${l}${n}`}function bt(e){const a=Number(e.max_uses)||0,t=Number(e.used)||0;if(!a)return"";const s=e.reset_on==="long_rest"?"long":"short",r=Math.max(a-t,0),l=Array.from({length:a},(n,o)=>{const p=o<t;return`<span class="${["charge-indicator",s==="long"?"charge-indicator--long":"charge-indicator--short",p?"charge-indicator--used":""].filter(Boolean).join(" ")}" aria-hidden="true"></span>`}).join("");return`
    <div class="resource-charge-row" aria-label="Cariche risorsa">
      <span class="resource-charge-label">Cariche</span>
      <span class="resource-charge-count">${r}/${a}</span>
      <div class="resource-charges" aria-hidden="true">${l}</div>
    </div>
  `}let Ue=!1,ye=null;function vt(e){return e?{id:`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.id,name:e.name,level:e.level,kind:Number(e.level)===0?"cantrip":"spell",cast_time:e.cast_time,duration:e.duration,range:e.range,components:e.components,concentration:!!e.concentration,attack_roll:!!e.attack_roll,is_ritual:!!e.ritual,damage_die:e.damage_die,damage_modifier:e.damage_modifier,upcast_damage_die:e.upcast_damage_die,upcast_damage_modifier:e.upcast_damage_modifier,upcast_start_level:e.upcast_start_level,description:e.description,rules_version:e.rules_version,prep_state:"known"}:null}function ht(e){const a=(e==null?void 0:e.shared_spell)||{},t=(e==null?void 0:e.custom_spell)||{},s=e!=null&&e.shared_spell_id?a:t;if(!(s!=null&&s.name))return null;const r=Number(s.level)||0;return{id:e.id||`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.shared_spell_id||null,name:s.name,level:r,kind:s.kind||(r===0?"cantrip":"spell"),cast_time:s.cast_time||null,duration:s.duration||null,range:s.range||null,components:s.components||null,concentration:!!s.concentration,attack_roll:!!s.attack_roll,is_ritual:!!(s.ritual??s.is_ritual),damage_die:s.damage_die||null,damage_modifier:s.damage_modifier??null,upcast_damage_die:s.upcast_damage_die||null,upcast_damage_modifier:s.upcast_damage_modifier??null,upcast_start_level:s.upcast_start_level??null,description:s.description||null,school:s.school||null,caster_classes:s.caster_classes||[],rules_version:s.rules_version||null,prep_state:e.prep_state||"known"}}async function _t(){var q;const e=["","Abiurazione","Ammaliamento","Divinazione","Evocazione","Illusione","Invocazione","Necromanzia","Trasmutazione"],a=["mago","warlock","stregone","chierico","druido","ranger","artefice","paladino","bardo"],t=document.createElement("div");t.className="modal-form-grid";const s=_e({label:"Cerca incantesimo",name:"spell_query",placeholder:"Es. Palla di fuoco"}),r=s.querySelector("input"),l=document.createElement("label");l.className="field",l.innerHTML="<span>Versione regole</span>";const n=document.createElement("select");n.name="rules_version",[{value:"2024",label:"2024"},{value:"2014",label:"2014"},{value:"Custom",label:"Custom"}].forEach(R=>{const S=document.createElement("option");S.value=R.value,S.textContent=R.label,n.appendChild(S)}),l.appendChild(n);const o=document.createElement("label");o.className="field",o.innerHTML="<span>Scuola</span>";const p=document.createElement("select");p.name="spell_school_filter",e.forEach(R=>{const S=document.createElement("option");S.value=R,S.textContent=R||"Tutte",p.appendChild(S)}),o.appendChild(p);const f=_e({label:"Livello",name:"spell_level_filter",type:"number",value:""}),g=document.createElement("div");g.className="field",g.innerHTML=`<span>Classi</span><div class="tag-row">${a.map(R=>`<label class="chip"><input type="checkbox" name="spell_caster_filter" value="${R}" /> ${R}</label>`).join("")}</div>`;const _=document.createElement("div");_.className="modal-form-row modal-form-row--compact",_.append(f,o,l),t.appendChild(s),t.appendChild(_),t.appendChild(g);const i=document.createElement("label");i.className="field",i.innerHTML="<span>Risultati</span>";const $=document.createElement("select");$.name="shared_spell_id",i.appendChild($);const k=document.createElement("div");k.className="tab-bar",k.innerHTML='<button type="button" class="tab-bar__button" data-prev-page>◀</button><span data-page-label class="muted">Pagina 1</span><button type="button" class="tab-bar__button" data-next-page>▶</button>',t.appendChild(i),t.appendChild(k);let u=1,z=[];const w=k.querySelector("[data-page-label]"),h=k.querySelector("[data-prev-page]"),D=k.querySelector("[data-next-page]"),x=async()=>{var P;const R=Array.from(t.querySelectorAll('input[name="spell_caster_filter"]:checked')).map(j=>j.value),S=await it({query:(r==null?void 0:r.value)||"",rulesVersion:n.value||"2024",level:((P=t.querySelector('input[name="spell_level_filter"]'))==null?void 0:P.value)||"",school:p.value||"",casterClasses:R,page:u,pageSize:25});if(z=S.items||[],$.innerHTML="",z.forEach(j=>{const V=document.createElement("option");V.value=j.id,V.textContent=`${j.name} (Lv ${j.level})`,$.appendChild(V)}),!z.length){const j=document.createElement("option");j.value="",j.textContent="Nessun risultato",$.appendChild(j)}const v=Math.max(1,Math.ceil((S.total||0)/(S.pageSize||25)));w.textContent=`Pagina ${u} / ${v}`,h.disabled=u<=1,D.disabled=u>=v};r==null||r.addEventListener("input",()=>{u=1,x()}),p.addEventListener("change",()=>{u=1,x()}),n.addEventListener("change",()=>{u=1,x()}),(q=t.querySelector('input[name="spell_level_filter"]'))==null||q.addEventListener("input",()=>{u=1,x()}),t.querySelectorAll('input[name="spell_caster_filter"]').forEach(R=>R.addEventListener("change",()=>{u=1,x()})),h==null||h.addEventListener("click",()=>{u=Math.max(1,u-1),x()}),D==null||D.addEventListener("click",()=>{u+=1,x()}),await x();const y=await ne({title:"Seleziona incantesimo condiviso",submitLabel:"Aggiungi",cancelLabel:"Annulla",content:t,cardClass:"modal-card--form"});if(!y)return null;const I=y.get("shared_spell_id");return z.find(R=>R.id===I)||null}function We(e){var a,t;return((t=(a=e==null?void 0:e.data)==null?void 0:a.settings)==null?void 0:t.auto_usage_dice)!==!1}function yt(e,a){var t,s;return Ka((s=(t=e==null?void 0:e.data)==null?void 0:t.spellcasting)==null?void 0:s.slots,a)}async function $t(e,a){const t=Math.max(1,Number(a==null?void 0:a.level)||1),s=yt(e,t);if(!s.length)return E("Slot incantesimo esauriti","error"),null;if(s.length===1)return s[0].level;const r=document.createElement("label");r.className="field",r.innerHTML="<span>Seleziona slot da consumare</span>";const l=document.createElement("select");l.name="cast_slot_level",l.className="input",s.forEach(f=>{const g=document.createElement("option");g.value=String(f.level),g.textContent=`${f.level}° livello (${f.available} slot)`,l.appendChild(g)}),r.appendChild(l);const n=document.createElement("div");n.className="modal-form-grid",n.appendChild(r);const o=await ne({title:a!=null&&a.name?`Lancia ${a.name}`:"Scegli slot incantesimo",submitLabel:"Conferma",cancelLabel:"Annulla",content:n,cardClass:"modal-card--form"});return o?Math.max(t,Number(o.get("cast_slot_level"))||t):null}async function B(e){var r,l,n,o;ye=e;const a=Y(),{user:t,offline:s}=a;De(!0);try{let p=a.characters;if(!s&&t)try{p=await ba(t.id),qa({characters:p}),await ce({characters:p})}catch{E("Errore caricamento personaggi","error")}const f=te(a.activeCharacterId);!p.some(c=>te(c.id)===f)&&p.length&&Ra(p[0].id);const _=te(Y().activeCharacterId),i=p.find(c=>te(c.id)===_),$=!!t&&!s,k=!!t&&!s,u=!!t&&!s;let z=a.cache.resources,w=a.cache.items;if(!s&&i){const[c,d,m]=await Promise.allSettled([Je(i.id),Ma(i.id),je(i.id)]),b={};if(c.status==="fulfilled"?(z=c.value,re("resources",z),b.resources=z):E("Errore caricamento risorse","error"),d.status==="fulfilled"?(w=d.value,re("items",w),b.items=w):E("Errore caricamento equip","error"),m.status==="fulfilled"){const A=(m.value||[]).map(N=>ht(N)).filter(Boolean);if(A.length){const C=[...Array.isArray((r=i.data)==null?void 0:r.spells)?i.data.spells:[]];A.forEach(M=>{C.some(H=>H.shared_spell_id&&H.shared_spell_id===M.shared_spell_id)||C.push(M)}),i.data={...i.data||{},spells:C}}}Object.keys(b).length&&await ce(b)}e.innerHTML=`
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
          ${i?ct(i):"<p>Nessun personaggio selezionato.</p>"}
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
            ${i?lt(i):"<p>Nessun personaggio selezionato.</p>"}
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
            ${i?rt(i):"<p>Nessun personaggio selezionato.</p>"}
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
              ${i&&u?`
                <button class="icon-button" data-edit-character aria-label="Modifica personaggio">
                  <span aria-hidden="true">✏️</span>
                </button>
              `:""}
            </div>
          </header>
          ${i?ot(i,u,w):nt($,s)}
        </section>
        ${i?ut(i,w,u):""}
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
            ${i?pt(i,w||[]):"<p>Nessun personaggio selezionato.</p>"}
          </div>
        </section>
        ${(l=i==null?void 0:i.data)!=null&&l.is_spellcaster?`
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Incantesimi</p>
            </div>
            <div class="actions">
              <button class="icon-button icon-button--dice" data-open-dice="spell-attack" aria-label="Lancia dado tiro per colpire incantesimi">
                <span aria-hidden="true">🎲</span>
              </button>
              ${(o=(n=i==null?void 0:i.data)==null?void 0:n.spellcasting)!=null&&o.can_prepare?`
                <button class="icon-button icon-button--spell-prepare" type="button" data-open-prepared-spells aria-label="Prepara incantesimi" title="Prepara incantesimi">
                  <span aria-hidden="true">📖</span>
                </button>
              `:""}
              ${i&&u?`
                <button class="icon-button icon-button--add" data-add-spell aria-label="Aggiungi incantesimo">
                  <span aria-hidden="true">+</span>
                </button>
              `:""}
            </div>
          </header>
          <div class="home-scroll-body">
            ${mt(i,u)}
          </div>
        </section>
        `:""}
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Risorse</p>           
            </div>
            ${i&&k?`
              <button class="icon-button icon-button--add" data-add-resource aria-label="Nuova risorsa">
                <span aria-hidden="true">+</span>
              </button>
            `:""}
          </header>
          <div class="home-scroll-body home-scroll-body--resources">
            ${i?gt(z,k):"<p>Nessun personaggio selezionato.</p>"}
            ${i&&!k?'<p class="muted">Connettiti per aggiungere nuove risorse.</p>':""}
          </div>
        </section>
      </div>
    </div>
  `,ea();const h=e.querySelector("[data-create-character]");h&&h.addEventListener("click",()=>{Te(t,()=>B(e))});const D=e.querySelector("[data-edit-character]");D&&D.addEventListener("click",()=>{Te(t,()=>B(e),i)});const x=e.querySelector("[data-add-resource]");x&&x.addEventListener("click",()=>{Fe(i,()=>B(e))});const y=e.querySelector("[data-add-spell]");y&&y.addEventListener("click",async()=>{var d;if(!i)return;const c=await Qa();if(c){if(c==="shared")try{const m=await _t();if(!m)return;const b=vt(m),A=Array.isArray((d=i.data)==null?void 0:d.spells)?i.data.spells:[];if(A.some(M=>M.shared_spell_id===m.id)){E("Incantesimo già presente nella scheda personaggio","info");return}i.user_id&&await Ja({user_id:i.user_id,character_id:i.id,shared_spell_id:m.id,prep_state:b.prep_state});const C={...i.data||{},spells:[...A,b]};await J(i,C,"Incantesimo aggiunto dalla lista condivisa",()=>B(e));return}catch{E("Errore durante l'associazione dell'incantesimo condiviso","error");return}Pe(i,async m=>{if(!m)return B(e);try{await Xa({created_by:i.user_id,rules_version:m.rules_version||"2024",name:m.name,level:m.level,school:m.school||null,caster_classes:Array.isArray(m.caster_classes)?m.caster_classes:[],cast_time:m.cast_time||null,range:m.range||null,duration:m.duration||null,components:m.components||null,concentration:!!m.concentration,ritual:!!m.is_ritual,attack_roll:!!m.attack_roll,damage_die:m.damage_die||null,damage_modifier:m.damage_modifier??null,upcast_damage_die:m.upcast_damage_die||null,upcast_damage_modifier:m.upcast_damage_modifier??null,upcast_start_level:m.upcast_start_level??null,description:m.description||null})}catch{E("Incantesimo salvato sul personaggio ma non sul catalogo condiviso","info")}B(e)})}}),e.querySelectorAll("[data-edit-spell]").forEach(c=>c.addEventListener("click",()=>{var A;const d=c.dataset.editSpell;if(!d||!i)return;const b=(Array.isArray((A=i.data)==null?void 0:A.spells)?i.data.spells:[]).find(N=>N.id===d);b&&Pe(i,()=>B(e),b)})),e.querySelectorAll("[data-delete-spell]").forEach(c=>c.addEventListener("click",async()=>{var C;const d=c.dataset.deleteSpell;if(!d||!i)return;const m=Array.isArray((C=i.data)==null?void 0:C.spells)?i.data.spells:[],b=m.find(M=>M.id===d);if(!b||!await Le({title:"Conferma eliminazione incantesimo",message:`Stai per eliminare l'incantesimo "${b.name}" dalla scheda del personaggio. Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))return;if(b.shared_spell_id)try{const T=(await je(i.id)).find(H=>H.shared_spell_id===b.shared_spell_id);T!=null&&T.id&&await Ya(T.id)}catch{E("Errore rimozione associazione incantesimo","error");return}const N={...i.data||{},spells:m.filter(M=>M.id!==b.id)};await J(i,N,"Incantesimo eliminato",()=>B(e))}));const I=e.querySelector("[data-open-prepared-spells]");I&&I.addEventListener("click",()=>{Ye(i,()=>B(e))}),e.querySelectorAll("[data-spell-quick-open]").forEach(c=>c.addEventListener("click",()=>{var A;const d=c.dataset.spellQuickOpen;if(!d||!i)return;const b=(Array.isArray((A=i.data)==null?void 0:A.spells)?i.data.spells:[]).find(N=>N.id===d);b&&Za(i,b,()=>B(e))}));const q=e.querySelector("[data-show-background]");q&&q.addEventListener("click",()=>{et(i)});const R=e.querySelector("[data-edit-conditions]");R&&R.addEventListener("click",async()=>{await aa(e)}),e.querySelectorAll("[data-proficiency-tabs]").forEach(c=>{var N;const d=Array.from(c.querySelectorAll("[data-proficiency-tab]")),m=Array.from(c.querySelectorAll("[data-proficiency-panel]"));if(!d.length||!m.length)return;const b=C=>{d.forEach(M=>{const T=M.dataset.proficiencyTab===C;M.classList.toggle("is-active",T),M.setAttribute("aria-selected",String(T))}),m.forEach(M=>{M.classList.toggle("is-active",M.dataset.proficiencyPanel===C)})};d.forEach(C=>{C.addEventListener("click",()=>{b(C.dataset.proficiencyTab)})});const A=((N=d.find(C=>C.classList.contains("is-active")))==null?void 0:N.dataset.proficiencyTab)??d[0].dataset.proficiencyTab;A&&b(A)});const S=e.querySelector("[data-add-equip]");S&&i&&u&&S.addEventListener("click",async()=>{var O;const c=(w||[]).filter(L=>L.equipable&&!se(L).length);if(!c.length){E("Nessun oggetto equipaggiabile disponibile","error");return}const d=document.createElement("div");d.className="drawer-form";const m=document.createElement("label");m.className="field",m.innerHTML="<span>Oggetto</span>";const b=document.createElement("select");b.name="item_id",c.forEach(L=>{const F=document.createElement("option");F.value=L.id,F.textContent=L.name,b.appendChild(F)}),m.appendChild(b),d.appendChild(m);const A=document.createElement("fieldset");A.className="equip-slot-field",A.innerHTML="<legend>Punti del corpo</legend>";const N=document.createElement("div");N.className="equip-slot-list",Ca.forEach(L=>{const F=document.createElement("label");F.className="checkbox",F.innerHTML=`<input type="checkbox" name="equip_slots" value="${L.value}" /> <span>${L.label}</span>`,N.appendChild(F)}),A.appendChild(N),d.appendChild(A);const C=await ne({title:"Equipaggia oggetto",submitLabel:"Equipaggia",content:d});if(!C)return;const M=C.getAll("equip_slots");if(!M.length){E("Seleziona almeno uno slot","error");return}const T=c.find(L=>String(L.id)===C.get("item_id"));if(!T)return;const H=((O=i.data)==null?void 0:O.proficiencies)||{};if(T.category==="weapon"){if(!T.weapon_type){E("Definisci il tipo di arma prima di equipaggiarla","error");return}if(!(T.weapon_type==="simple"?!!H.weapon_simple:!!H.weapon_martial)){E("Non hai la competenza per equipaggiare questo oggetto","error");return}}if(T.category==="armor")if(T.is_shield){if(!H.shield){E("Non hai la competenza per equipaggiare questo oggetto","error");return}}else if(T.armor_type){if(!(T.armor_type==="light"?!!H.armor_light:T.armor_type==="medium"?!!H.armor_medium:!!H.armor_heavy)){E("Non hai la competenza per equipaggiare questo oggetto","error");return}}else{E("Definisci il tipo di armatura prima di equipaggiarla","error");return}if(!T.sovrapponibile&&(w||[]).filter(F=>F.id!==T.id).filter(F=>se(F).some(W=>M.includes(W))).length){E("Uno o più slot selezionati sono già occupati","error");return}try{await Ae(T.id,{equip_slot:M[0]||null,equip_slots:M}),E("Equipaggiamento aggiornato"),B(e)}catch{E("Errore aggiornamento equip","error")}}),e.querySelectorAll("[data-unequip]").forEach(c=>c.addEventListener("click",async()=>{const d=(w||[]).find(m=>m.id===c.dataset.unequip);if(d)try{await Ae(d.id,{equip_slot:null,equip_slots:[]}),E("Equipaggiamento rimosso"),B(e)}catch{E("Errore aggiornamento equip","error")}}));const v=e.querySelector("[data-toggle-inspiration]");v&&i&&u&&v.addEventListener("click",async()=>{const c=i.data||{},d={...c,inspiration:!c.inspiration};await J(i,d,"Ispirazione aggiornata",()=>B(e))});const P=e.querySelector("[data-toggle-concentration]");P&&i&&u&&P.addEventListener("click",async()=>{const c=i.data||{},d={...c,concentration_active:!c.concentration_active};await J(i,d,"Concentrazione aggiornata",()=>B(e))}),e.querySelectorAll("[data-open-dice]").forEach(c=>c.addEventListener("click",()=>{ma(c.dataset.openDice)})),e.querySelectorAll("[data-saving-throw-card]").forEach(c=>c.addEventListener("click",()=>{var A,N,C;if(!i)return;const d=c.dataset.savingThrowCard;if(!d)return;const m=Re(i),b=m.find(M=>M.value===d);b&&le({title:`Tiro salvezza • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:m,value:b.value},allowInspiration:!!((A=i==null?void 0:i.data)!=null&&A.inspiration)&&u,weakPoints:Number((C=(N=i==null?void 0:i.data)==null?void 0:N.hp)==null?void 0:C.weak_points)||0,characterId:i.id})})),e.querySelectorAll("[data-skill-card]").forEach(c=>c.addEventListener("click",()=>{var A,N,C;if(!i)return;const d=c.dataset.skillCard;if(!d)return;const m=ca(i,w||[]),b=m.find(M=>M.value===d);b&&le({title:`Tiro abilità • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità",options:m,value:b.value},allowInspiration:!!((A=i==null?void 0:i.data)!=null&&A.inspiration)&&u,weakPoints:Number((C=(N=i==null?void 0:i.data)==null?void 0:N.hp)==null?void 0:C.weak_points)||0,characterId:i.id})})),e.querySelectorAll("[data-special-skill-card]").forEach(c=>c.addEventListener("click",()=>{var A,N,C;if(!i)return;const d=c.dataset.specialSkillCard;if(!d)return;const m=da(i,w||[]),b=m.find(M=>M.value===d);b&&le({title:`Tiro abilità speciale • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità speciale",options:m,value:b.value},allowInspiration:!!((A=i==null?void 0:i.data)!=null&&A.inspiration)&&u,weakPoints:Number((C=(N=i==null?void 0:i.data)==null?void 0:N.hp)==null?void 0:C.weak_points)||0,characterId:i.id})})),e.querySelectorAll("[data-edit-resource]").forEach(c=>c.addEventListener("click",()=>{const d=z.find(m=>m.id===c.dataset.editResource);d&&Fe(i,()=>B(e),d)})),e.querySelectorAll("[data-roll-hit-dice]").forEach(c=>c.addEventListener("click",async()=>{await Ft(i,e)})),e.querySelectorAll("[data-roll-attack]").forEach(c=>c.addEventListener("click",d=>{d.target.closest("button")||It(c.dataset.rollAttack)})),e.querySelectorAll("[data-roll-damage]").forEach(c=>c.addEventListener("click",()=>{var M,T,H;if(!i)return;const d=c.dataset.rollDamage;if(!d)return;if(d.startsWith("spell:")){const O=d.replace("spell:",""),F=(Array.isArray((M=i.data)==null?void 0:M.spells)?i.data.spells:[]).find(ee=>ee.id===O);if(!F)return;const W=Number(F.cast_level??F.level)||0,Q=Ie(F,W);if(!Q){E("Danno non calcolabile per questo trucchetto.","error");return}oe({keepOpen:!0,title:Q.title,mode:"generic",notation:Q.notation,modifier:Q.modifier,rollType:"DMG",characterId:i==null?void 0:i.id,historyLabel:F.name||null,sneakAttackDice:((T=i==null?void 0:i.data)==null?void 0:T.sneak_attack_dice)||null});return}const m=d.startsWith("weapon:")?d.split(":"):[null,d,"default"],b=m[1]||d,A=m[2]||"default",N=w==null?void 0:w.find(O=>String(O.id)===b||O.name===b);if(!N)return;const C=Ua(i,N,A);if(!C){E("Danno non calcolabile per questa arma.","error");return}oe({keepOpen:!0,title:C.title,mode:"generic",notation:C.notation,modifier:C.modifier,rollType:"DMG",characterId:i==null?void 0:i.id,historyLabel:N.name||null,sneakAttackDice:((H=i==null?void 0:i.data)==null?void 0:H.sneak_attack_dice)||null})}));const j=c=>{var b;const d=(b=c==null?void 0:c.damage_dice_notation)==null?void 0:b.trim();if(!d)return;const m=Wa(d);if(!(m!=null&&m.notation)){E("Notazione dado non valida per questa risorsa","error");return}oe({keepOpen:!0,title:c.name||"Tiro abilità",mode:"generic",notation:m.notation,modifier:Number(c.damage_modifier)||0,rollType:"GEN",characterId:i==null?void 0:i.id,historyLabel:c.name||null})},V=async c=>{const d=Number(c.max_uses)||0;if(!(!d||c.used>=d))try{await Ee(c.id,{used:Math.min(c.used+1,d)}),E("Risorsa usata"),We(i)&&j(c),B(e)}catch{E("Errore utilizzo risorsa","error")}};e.querySelectorAll("[data-resource-card]").forEach(c=>{const d=async m=>{if(m.target.closest("button"))return;const b=z.find(A=>A.id===c.dataset.resourceCard);b&&at(b,{onUse:()=>V(b),onReset:async()=>{try{await Ee(b.id,{used:0}),E("Risorsa ripristinata"),B(e)}catch{E("Errore ripristino risorsa","error")}},onRecover:async()=>{try{await Ee(b.id,{used:Math.max((Number(b.used)||0)-1,0)}),E("Carica recuperata"),B(e)}catch{E("Errore recupero carica","error")}}})};c.addEventListener("click",d)}),e.querySelectorAll("[data-use-resource]").forEach(c=>c.addEventListener("click",async()=>{const d=z.find(m=>m.id===c.dataset.useResource);d&&await V(d)})),e.querySelectorAll("[data-use-spell]").forEach(c=>c.addEventListener("click",async()=>{var H,O;if(!i)return;const d=c.dataset.useSpell;if(!d)return;const b=(Array.isArray((H=i.data)==null?void 0:H.spells)?i.data.spells:[]).find(L=>L.id===d);if(!b||(Number(b.level)||0)<1)return;const N=await $t(i,b);if(!N||!await He(i,N,()=>B(e)))return;const M=Y().characters.find(L=>te(L.id)===te(i.id))||i;if(b.concentration){const L=M.data||{};L.concentration_active||await J(M,{...L,concentration_active:!0},"Concentrazione attiva",()=>B(e))}if(!We(M)){B(e);return}const T=Ie(b,N);if(!T){E("Danno non calcolabile per questo incantesimo.","error");return}oe({keepOpen:!0,title:T.title,mode:"generic",notation:T.notation,modifier:T.modifier,rollType:"DMG",characterId:i.id,historyLabel:b.name||null,sneakAttackDice:((O=i==null?void 0:i.data)==null?void 0:O.sneak_attack_dice)||null})})),e.querySelectorAll("[data-consume-spell-slot]").forEach(c=>c.addEventListener("click",async()=>{if(!i)return;const d=Number(c.dataset.consumeSpellSlot);!Number.isFinite(d)||d<1||await He(i,d,()=>B(e))})),e.querySelectorAll("[data-restore-spell-slot]").forEach(c=>c.addEventListener("click",async()=>{if(!i)return;const d=Number(c.dataset.restoreSpellSlot);!Number.isFinite(d)||d<1||await tt(i,d,()=>B(e))})),e.querySelectorAll("[data-delete-resource]").forEach(c=>c.addEventListener("click",async()=>{const d=z.find(b=>b.id===c.dataset.deleteResource);if(!(!d||!await Le({title:"Conferma eliminazione risorsa",message:`Stai per eliminare la risorsa "${d.name}". Questa azione non può essere annullata.`,confirmLabel:"Elimina"})))try{await va(d.id),E("Risorsa eliminata"),B(e)}catch{E("Errore eliminazione risorsa","error")}})),e.querySelectorAll("[data-death-save]").forEach(c=>c.addEventListener("click",async()=>{if(!i||!u)return;const{deathSave:d,deathSaveIndex:m}=c.dataset,b=Number(m);if(!d||!b)return;const A=i.data||{},N=A.death_saves||{},C=Math.max(0,Math.min(3,Number(N[d])||0)),M=b===C?C-1:b,T={successes:Math.max(0,Math.min(3,d==="successes"?M:Number(N.successes)||0)),failures:Math.max(0,Math.min(3,d==="failures"?M:Number(N.failures)||0))};await J(i,{...A,death_saves:T},"Tiri salvezza contro morte aggiornati",()=>B(e))})),e.querySelectorAll("[data-weakness-level]").forEach(c=>c.addEventListener("click",async()=>{if(!i||!u)return;const d=Number(c.dataset.weaknessLevel);if(!d)return;const m=i.data||{},b=m.hp||{},A=Math.max(0,Math.min(6,Number(b.weak_points)||0));await J(i,{...m,hp:{...b,weak_points:d===A?0:d}},"Punti indebolimento aggiornati",()=>B(e))}));const K=e.querySelector(".character-avatar");K&&(K.setAttribute("draggable","false"),K.addEventListener("click",c=>{c.preventDefault(),st(i)}),K.addEventListener("contextmenu",c=>{c.preventDefault()}),K.addEventListener("dragstart",c=>{c.preventDefault()})),e.querySelectorAll("[data-item-image]").forEach(c=>{c.setAttribute("draggable","false"),c.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const m=w==null?void 0:w.find(b=>String(b.id)===c.dataset.itemImage);m&&ze(m)})}),e.querySelectorAll("[data-item-preview]").forEach(c=>{c.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const m=w==null?void 0:w.find(b=>String(b.id)===c.dataset.itemPreview);m&&ze(m)})})}finally{De(!1)}}function Jt(){ea()}function ea(){Ue||(document.addEventListener("click",async e=>{if(!e.target.closest("[data-actions-fab]"))return;const t=e.target.closest("[data-hp-action]"),s=e.target.closest("[data-money-action]"),r=e.target.closest("[data-rest]"),l=e.target.closest("[data-open-dice]"),n=e.target.closest("[data-add-loot]"),o=e.target.closest("[data-edit-conditions]"),p=e.target.closest("[data-edit-resistances]"),f=e.target.closest("[data-edit-roll-adjustments]");if(!t&&!s&&!r&&!l&&!n&&!o&&!p&&!f)return;e.preventDefault(),kt();const g=ye??null;if(t){await Pt(t.dataset.hpAction,g);return}if(s){if((window.location.hash.replace("#/","")||"home")==="inventory")return;await xt(s.dataset.moneyAction,g);return}if(r){await jt(r.dataset.rest,g);return}if(l){ma(l.dataset.openDice);return}if(n){await Ct();return}if(o){await aa(g);return}if(p){await Mt(g);return}f&&await At(g)}),Ue=!0)}function kt(){const e=document.querySelector("[data-actions-fab]"),a=document.querySelector("[data-actions-toggle]");!e||!e.classList.contains("is-open")||(e.classList.remove("is-open"),a==null||a.setAttribute("aria-expanded","false"))}function Z(){const e=Y(),{user:a,offline:t,characters:s,activeCharacterId:r}=e,l=te(r);return{activeCharacter:s.find(o=>te(o.id)===l),canEditCharacter:!!a&&!t}}async function aa(e){const{activeCharacter:a,canEditCharacter:t}=Z();if(!a||!t)return;const s=await Ga(a);if(!s)return;const r=s.getAll("conditions");await J(a,{...a.data,conditions:r},"Condizioni aggiornate",()=>{e&&B(e)})}function St(e){var t;const a=((t=e==null?void 0:e.data)==null?void 0:t.roll_adjustments)||{};return{attack_rolls:a.attack_rolls||{},saving_throws:a.saving_throws||{},skills:a.skills||{}}}function wt(e){const a=St(e),t=Y().cache.items||[],s=document.createElement("div");s.className="modal-form-grid compact-settings-form compact-settings-form--rolls";const r=[{value:"",label:"Nessuno"},{value:"advantage",label:"Vantaggio"},{value:"disadvantage",label:"Svantaggio"}],l=(n,o,p)=>{const f=document.createElement("section");f.className="character-edit-section compact-settings-section",f.innerHTML=`<h4>${n}</h4><p class="muted compact-settings-help">Indica solo gli override manuali; gli effetti automatici restano visibili sotto la riga.</p>`;const g=document.createElement("div");g.className="compact-setting-grid compact-setting-grid--roll",p.forEach(_=>{var S;const i=((S=a[o])==null?void 0:S[_.key])||{},$=la(e,t,o,_),k=ie($).rollMode||"",u=$.length===1&&$[0].source||"",z=i.mode||k,w=i.source||u,h=document.createElement("div");h.className="compact-setting-row compact-setting-row--roll";const D=document.createElement("label");D.className="field compact-setting-field";const x=document.createElement("span");x.textContent=_.label;const y=Ne(r,z);y.name=`roll_${o}_${_.key}_mode`,D.append(x,y);const I=document.createElement("label");I.className="field compact-setting-field";const q=document.createElement("span");q.textContent="Fonte manuale";const R=Ne(ta,w);if(R.name=`roll_${o}_${_.key}_source`,I.append(q,R),h.append(D,I),$.length){const v=document.createElement("p");v.className="muted compact-setting-note",v.textContent=`Automatico: ${$.map(P=>P.reason).join(" ")}`,h.appendChild(v)}g.appendChild(h)}),f.appendChild(g),s.appendChild(f)};return l("Tiri per colpire","attack_rolls",ia(e,t)),l("Tiri salvezza","saving_throws",$e),l("Abilità","skills",ke),s}function Et(e,a){const t=Y().cache.items||[],s={attack_rolls:{},saving_throws:{},skills:{}};return[{scope:"attack_rolls",entries:ia(a,t)},{scope:"saving_throws",entries:$e},{scope:"skills",entries:ke}].forEach(({scope:r,entries:l})=>{l.forEach(n=>{var $,k;const o=(($=e.get(`roll_${r}_${n.key}_mode`))==null?void 0:$.toString())||"",p=((k=e.get(`roll_${r}_${n.key}_source`))==null?void 0:k.toString().trim())||"",f=la(a,t,r,n),g=ie(f).rollMode||"",_=f.length===1&&f[0].source||"";(o==="advantage"||o==="disadvantage")&&!(o===g&&p===_)&&(s[r][n.key]={mode:o,source:p})})}),s}async function At(e){const{activeCharacter:a,canEditCharacter:t}=Z();if(!a||!t)return;const s=await ne({title:"Vantaggi / Svantaggi situazionali",submitLabel:"Salva",content:wt(a),cardClass:"modal-card--wide"});s&&await J(a,{...a.data,roll_adjustments:Et(s,a)},"Vantaggi/svantaggi aggiornati",()=>{e&&B(e)})}function Lt(e){var r;const a=((r=e==null?void 0:e.data)==null?void 0:r.damage_defenses)||{},t=me.reduce((l,n)=>{const o=n.group||"Altro";return l[o]||(l[o]=[]),l[o].push(n),l},{}),s=document.createElement("div");return s.className="modal-form-grid compact-settings-form compact-settings-form--defenses",s.innerHTML=Object.entries(t).map(([l,n])=>`
    <section class="character-edit-section compact-settings-section">
      <h4>${l}</h4>
      <div class="compact-setting-grid compact-setting-grid--defense">
        ${n.map(o=>`
          <div class="compact-setting-row compact-setting-row--defense">
            <strong>${o.label}</strong>
            <div class="character-toggle-group">
              <label class="toggle-pill">
                <input type="checkbox" name="damage_resistance_${o.key}" ${Array.isArray(a.resistances)&&a.resistances.includes(o.key)?"checked":""} />
                <span>Resistenza</span>
              </label>
              <label class="toggle-pill">
                <input type="checkbox" name="damage_immunity_${o.key}" ${Array.isArray(a.immunities)&&a.immunities.includes(o.key)?"checked":""} />
                <span>Immunità</span>
              </label>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `).join(""),s}function Nt(e){return{resistances:me.filter(a=>e.has(`damage_resistance_${a.key}`)).map(a=>a.key),immunities:me.filter(a=>e.has(`damage_immunity_${a.key}`)).map(a=>a.key)}}async function Mt(e){const{activeCharacter:a,canEditCharacter:t}=Z();if(!a||!t)return;const s=await ne({title:"Resistenze & Immunità",submitLabel:"Salva",content:Lt(a),cardClass:"modal-card--wide"});s&&await J(a,{...a.data,damage_defenses:Nt(s)},"Resistenze aggiornate",()=>{e&&B(e)})}async function Ct(e){const{activeCharacter:a}=Z(),t=Y();if(!a)return;if(t.offline){E("Loot disponibile solo online.","error");return}const r=Xe(a)==="kg"?"0.1":"1",l=await ne({title:"Aggiungi loot rapido",submitLabel:"Aggiungi",content:xa(r),onOpen:({fieldsEl:n})=>{za(n)}});if(l)try{await Na({user_id:a.user_id,character_id:a.id,name:l.get("name"),qty:Number(l.get("qty")),weight:Number(l.get("weight")),volume:Number(l.get("volume"))||0,value_cp:Number(l.get("value_cp")),category:"loot",equipable:!1,equip_slot:null,equip_slots:[],sovrapponibile:!1,is_magic:!1,max_volume:null}),E("Loot aggiunto")}catch{E("Errore loot","error")}}function Me(e,{min:a=null,max:t=null}={}){if(!(e instanceof HTMLInputElement)||e.type!=="number"||e.closest(".modal-value-stepper"))return;const s=document.createElement("div");s.className="number-stepper modal-value-stepper";const r=document.createElement("button");r.type="button",r.className="number-stepper__button modal-value-stepper__button",r.textContent="−",r.setAttribute("aria-label","Diminuisci valore");const l=document.createElement("button");l.type="button",l.className="number-stepper__button modal-value-stepper__button",l.textContent="+",l.setAttribute("aria-label","Aumenta valore");const n=e.parentNode;if(!n)return;n.insertBefore(s,e),s.append(r,e,l);const o=f=>Number.isFinite(f)?f:0,p=f=>{const g=o(e.valueAsNumber),_=Number(e.step),i=Number.isFinite(_)&&_>0?_:1;let $=g+i*f;const k=a??(e.min!==""?Number(e.min):null),u=t??(e.max!==""?Number(e.max):null);Number.isFinite(k)&&($=Math.max(k,$)),Number.isFinite(u)&&($=Math.min(u,$)),e.value=String($),e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))};r.addEventListener("click",()=>p(-1)),l.addEventListener("click",()=>p(1))}async function xt(e,a){const{activeCharacter:t,canEditCharacter:s}=Z();if(!t)return;if(!s){E("Azioni denaro disponibili solo con profilo online","error");return}const r=Y();let l=r.cache.wallet;if(!l&&!r.offline)try{l=await Sa(t.id),re("wallet",l),l&&await ce({wallet:l})}catch{E("Errore caricamento wallet","error")}const p=await ne({title:e==="pay"?"Paga monete":"Ricevi monete",submitLabel:e==="pay"?"Paga":"Ricevi",content:wa({direction:e}),onOpen:({fieldsEl:u})=>{const z=u==null?void 0:u.querySelector('input[name="amount"]');z&&Me(z,{min:0})}});if(!p)return;l||(l={user_id:t.user_id,character_id:t.id,cp:0,sp:0,gp:0,pp:0});const f=p.get("coin"),g=Number(p.get("amount")||0),_={cp:f==="cp"?g:0,sp:f==="sp"?g:0,gp:f==="gp"?g:0,pp:f==="pp"?g:0},i=e==="pay"?-1:1,$=Object.fromEntries(Object.entries(_).map(([u,z])=>[u,z*i])),k=Ea(l,$);try{const u=await Aa({...k,user_id:l.user_id,character_id:l.character_id});await La({user_id:l.user_id,character_id:l.character_id,direction:e,amount:$,reason:p.get("reason"),occurred_on:p.get("occurred_on")}),re("wallet",u),await ce({wallet:u}),E("Wallet aggiornato"),a&&B(a)}catch{E("Errore aggiornamento denaro","error")}}const qt=Qe.reduce((e,a)=>(e[a.key]=a.label,e),{}),Ke={advantage:["invisibile"],disadvantage:["accecato","avvelenato","intralciato","prono","spaventato"]},Ge={disadvantage:{dex:["intralciato"]},autoFail:{str:["paralizzato","privo_di_sensi","stordito"],dex:["paralizzato","privo_di_sensi","stordito"]}},ta=[{value:"",label:"Seleziona fonte"},{value:"situational",label:"Situazionale"},{value:"effect",label:"Effetto temporaneo"},{value:"condition",label:"Condizione"},{value:"armor",label:"Armatura"},{value:"racial",label:"Abilità razziale"},{value:"class",label:"Privilegio di classe"},{value:"spell",label:"Incantesimo"},{value:"item",label:"Oggetto magico/equipaggiamento"},{value:"other",label:"Altro"}];function be(e){const a=(e==null?void 0:e.data)||{};return Array.isArray(a.conditions)?a.conditions:a.condition?[a.condition]:[]}function de(e){return e.map(a=>qt[a]||a).filter(Boolean)}function sa(e=[]){return(e||[]).some(a=>a.category==="armor"&&a.armor_type==="heavy"&&a.equipable&&se(a).length)}function ia(e,a=[]){const t=(e==null?void 0:e.data)||{},r=(a||[]).filter(g=>g.category==="weapon"&&g.equipable&&se(g).length).map(g=>({key:`weapon:${g.id??g.name}`,label:g.name||"Arma"})),n=(Array.isArray(t.spells)?t.spells:[]).filter(g=>(g.kind==="cantrip"||Number(g.level)===0)&&g.attack_roll&&g.damage_die).map(g=>({key:`spell:${g.id}`,label:g.name||"Incantesimo"})),f=!!((t.spellcasting||{}).ability&&G(t.proficiency_bonus)!==null)?[{key:"spell-attack",label:"Incantesimi"}]:[];return[...r,...n,...f]}function qe(e){const a=be(e),t=Ke.advantage.filter(l=>a.includes(l)),s=Ke.disadvantage.filter(l=>a.includes(l)),r=[];return t.length&&r.push({mode:"advantage",source:"condition",reason:`Vantaggio: condizioni ${de(t).join(", ")}.`}),s.length&&r.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${de(s).join(", ")}.`}),r}function na(e,a,t){const r=be(e).includes("avvelenato")?["avvelenato"]:[],l=sa(a),n=[];return r.length&&n.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${de(r).join(", ")}.`}),t.key==="stealth"&&l&&n.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su Furtività."}),n}function Rt(e,a,t){const r=be(e).includes("avvelenato")?["avvelenato"]:[],l=sa(a),n=[];return r.length&&n.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${de(r).join(", ")}.`}),t==="dex"&&l&&n.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su tiri speciali basati su DES."}),n}function oa(e,a){const t=ra(be(e),a.key);return t.rollMode?[{mode:t.rollMode,source:"condition",reason:t.rollModeReason}]:[]}function la(e,a,t,s){return t==="attack_rolls"?qe(e):t==="skills"?na(e,a,s):t==="saving_throws"?oa(e,s):[]}function zt(e){var a;return((a=ta.find(t=>t.value===e))==null?void 0:a.label)||e}function ge(e,a,t,s){var p,f,g,_;const r=(g=(f=(p=e==null?void 0:e.data)==null?void 0:p.roll_adjustments)==null?void 0:f[a])==null?void 0:g[t];if(!r||r.mode!=="advantage"&&r.mode!=="disadvantage")return null;const l=r.mode==="advantage"?"Vantaggio":"Svantaggio",n=(_=r.source)==null?void 0:_.toString().trim(),o=n?zt(n):"Situazionale";return{mode:r.mode,reason:`${l}: ${s} (${o}).`}}function ie(e){const a=e.filter(Boolean),t=a.filter(r=>r.mode==="advantage").map(r=>r.reason).filter(Boolean),s=a.filter(r=>r.mode==="disadvantage").map(r=>r.reason).filter(Boolean);return t.length&&s.length?{rollMode:null,rollModeReason:`Vantaggio e svantaggio si annullano. ${[...t,...s].join(" ")}`}:t.length?{rollMode:"advantage",rollModeReason:t.join(" ")}:s.length?{rollMode:"disadvantage",rollModeReason:s.join(" ")}:{rollMode:null,rollModeReason:null}}function ra(e,a){const s=(Ge.autoFail[a]||[]).filter(n=>e.includes(n));if(s.length)return{disabled:!0,disabledReason:`Condizioni: ${de(s).join(", ")}`};const l=(Ge.disadvantage[a]||[]).filter(n=>e.includes(n));return l.length?{rollMode:"disadvantage",rollModeReason:`Svantaggio: condizioni ${de(l).join(", ")}.`}:{}}function ca(e,a=[]){const t=e.data||{},s=t.abilities||{},r=G(t.proficiency_bonus),l=t.skills||{},n=t.skill_mastery||{};return ke.map(o=>{const p=!!l[o.key],f=!!n[o.key],g=ue(s[o.ability],r,p?f?2:1:0),_=g??0,i=na(e,a,o);i.push(ge(e,"skills",o.key,o.label));const $=ie(i);return{value:o.key,label:`${o.label} (${U(g)})`,shortLabel:o.label,modifier:_,rollMode:$.rollMode,rollModeReason:$.rollModeReason}})}function da(e,a=[]){const t=e.data||{},s=t.abilities||{},r=G(t.proficiency_bonus);return(Array.isArray(t.special_skill_rolls)?t.special_skill_rolls:[]).map((n,o)=>{var w;const p=X[n.ability]?n.ability:"str",f=!!n.proficient,g=!!n.mastery&&f,_=ue(s[p],r,f?g?2:1:0),i=Number(n.bonus)||0,$=(_??0)+i,k=((w=n.name)==null?void 0:w.trim())||`Tiro speciale ${o+1}`,u=Rt(e,a,p),z=ie(u);return{value:String(n.id??o),label:`${k} (${U($)})`,shortLabel:k,modifier:$,rollMode:z.rollMode,rollModeReason:z.rollModeReason}})}function Re(e){const a=e.data||{},t=a.abilities||{},s=G(a.proficiency_bonus),r=a.saving_throws||{},l=be(e);return $e.map(n=>{const o=!!r[n.key],p=ue(t[n.key],s,o?1:0),f=p??0,g=ra(l,n.key),_=ge(e,"saving_throws",n.key,n.label),i=g.disabled?{rollMode:null,rollModeReason:null}:ie([...oa(e,n),_]),$=g.disabled?" · fallimento diretto":"";return{value:n.key,label:`${n.label} (${U(p)})${$}`,shortLabel:X[n.key]||n.label,modifier:f,rollMode:i.rollMode,rollModeReason:i.rollModeReason,disabled:g.disabled||!1,disabledReason:g.disabledReason||null}})}function ua(e,a=[]){var w;const t=e.data||{},s=Number(t.attack_bonus_melee??t.attack_bonus)||0,r=Number(t.attack_bonus_ranged??t.attack_bonus)||0,l=(a||[]).filter(h=>h.category==="weapon"&&h.equipable&&se(h).length),n=G(t.proficiency_bonus)??0,o=t.proficiencies||{},p=qe(e),f=l.map(h=>{var j;const D=h.weapon_range||(h.range_normal?"ranged":"melee"),x=h.attack_ability||(D==="ranged"?"dex":"str"),y=ae((j=t.abilities)==null?void 0:j[x])??0,q=(h.weapon_type==="simple"?!!o.weapon_simple:h.weapon_type==="martial"?!!o.weapon_martial:!1)?n:0,R=D==="ranged"?r:s,S=y+q+(Number(h.attack_modifier)||0)+R,v=`weapon:${h.id??h.name}`,P=ie([...p,ge(e,"attack_rolls",v,h.name)]);return{value:v,label:`${h.name} (${U(S)})`,shortLabel:h.name,modifier:S,rollMode:P.rollMode,rollModeReason:P.rollModeReason}}),_=(t.spellcasting||{}).ability,i=_?(w=t.abilities)==null?void 0:w[_]:null,$=ae(i),k=$===null||n===null?null:$+n,z=(Array.isArray(t.spells)?t.spells:[]).filter(h=>(h.kind==="cantrip"||Number(h.level)===0)&&h.attack_roll&&h.damage_die);return _&&k!==null&&z.forEach(h=>{const D=`spell:${h.id}`,x=ie([...p,ge(e,"attack_rolls",D,h.name)]);f.push({value:D,label:`${h.name} (${U(k)})`,shortLabel:h.name,modifier:k,rollMode:x.rollMode,rollModeReason:x.rollModeReason})}),f}function Dt(e){var g;const a=e.data||{},t=G(a.proficiency_bonus),r=(a.spellcasting||{}).ability,l=r?(g=a.abilities)==null?void 0:g[r]:null,n=ae(l);if(!r||n===null||t===null)return[];const o=n+t,p="spell-attack",f=ie([...qe(e),ge(e,"attack_rolls",p,"Incantesimi")]);return[{value:p,label:`Incantesimi (${U(o)})`,shortLabel:"Incantesimi",modifier:o,rollMode:f.rollMode,rollModeReason:f.rollModeReason}]}function Ce(e){var a;return((a=me.find(t=>t.key===e))==null?void 0:a.label)||e}function Tt(e,a,t){var o;const s=Math.max(Number(a)||0,0);if(!t)return{amount:s,reason:null};const r=((o=e==null?void 0:e.data)==null?void 0:o.damage_defenses)||{},l=Array.isArray(r.resistances)?r.resistances:[],n=Array.isArray(r.immunities)?r.immunities:[];return n.includes("all")||n.includes(t)?{amount:0,reason:`immunità a ${Ce(t)}`}:l.includes("all")||l.includes(t)?{amount:Math.floor(s/2),reason:`resistenza a ${Ce(t)}`}:{amount:s,reason:null}}function pa(e,a){if(!(a!=null&&a.consumes_ammunition))return null;const t=a.required_ammunition_type||a.ammunition_type;return(e||[]).filter(s=>s.id!==a.id).filter(s=>s.category!=="container").filter(s=>!t||s.ammunition_type===t).filter(s=>Number(s.qty)>0).sort((s,r)=>String(s.name||"").localeCompare(String(r.name||""),"it",{sensitivity:"base"}))[0]||null}async function Bt(e,a){const t=pa(e,a);if(!t)return!1;const s=Math.max((Number(t.qty)||0)-1,0),r=await Ae(t.id,{qty:s}),n=(Y().cache.items||[]).map(o=>String(o.id)===String(t.id)?{...o,...r||{},qty:s}:o);return re("items",n),await ce({items:n}),E(`${t.name} consumato (${s} rimasti)`),!0}function It(e){var f,g,_;const{activeCharacter:a,canEditCharacter:t}=Z();if(!a||!e)return;const s=Y().cache.items||[],r=ua(a,s),l=r.find(i=>i.value===e);if(!l)return;const n=e.startsWith("weapon:")?e.replace("weapon:",""):null,o=n?s.find(i=>String(i.id)===n||i.name===n):null;if(o!=null&&o.consumes_ammunition&&!pa(s,o)){E("Munizioni esaurite o non disponibili per questa arma.","error");return}let p=!1;le({title:`Tiro per Colpire • ${l.shortLabel||l.label}`,mode:"d20",rollType:"TC",selection:{label:"Attacco",options:r,value:l.value},allowInspiration:!!((f=a==null?void 0:a.data)!=null&&f.inspiration)&&t,weakPoints:Number((_=(g=a==null?void 0:a.data)==null?void 0:g.hp)==null?void 0:_.weak_points)||0,characterId:a.id,historyLabel:l.shortLabel||l.label,onRollComplete:async()=>{if(!(!(o!=null&&o.consumes_ammunition)||p)){p=!0;try{await Bt(Y().cache.items||s,o)}catch{E("Errore consumo munizioni","error")}}}})}function ma(e){var f,g,_,i,$;const{activeCharacter:a,canEditCharacter:t}=Z(),s=Y().cache.items||[],r=!!((f=a==null?void 0:a.data)!=null&&f.inspiration)&&t,l=Number((_=(g=a==null?void 0:a.data)==null?void 0:g.hp)==null?void 0:_.weak_points)||0,n=r&&a?async()=>{const k=a.data||{};k.inspiration&&await J(a,{...k,inspiration:!1},"Ispirazione consumata",ye?()=>B(ye):null)}:null,p={"saving-throws":{title:"Tiro Salvezza",mode:"d20",rollType:"TS",selection:a?{label:"Tiro salvezza",options:Re(a)}:null},skills:{title:"Tiro Abilità",mode:"d20",rollType:"TA",selection:a?{label:"Abilità",options:ca(a,s)}:null},"special-skills":{title:"Tiro Abilità Speciale",mode:"d20",rollType:"TA",selection:a?{label:"Abilità speciale",options:da(a,s)}:null},"attack-roll":{title:"Tiro per Colpire",mode:"d20",rollType:"TC",selection:a?{label:"Attacco",options:ua(a,s)}:null},"spell-attack":{title:"Tiro per Colpire Incantesimi",mode:"d20",rollType:"TC",selection:a?{label:"Incantesimi",options:Dt(a)}:null},roller:{title:"Lancia Dadi generico",mode:"generic",rollType:"GEN"}}[e]??{title:"Lancia dadi",mode:"generic"};if(e==="spell-attack"&&!(($=(i=p.selection)==null?void 0:i.options)!=null&&$.length)){E("Configura abilità da incantatore e bonus competenza per usare questo tiro.","error");return}le({...p,allowInspiration:r,onConsumeInspiration:n,weakPoints:l,characterId:a==null?void 0:a.id})}async function jt(e,a){var r,l;const{activeCharacter:t}=Z();if(!(!t||!await Le({title:"Conferma riposo",message:e==="long_rest"?"Stai per effettuare un riposo lungo: risorse, slot e recuperi verranno aggiornati in base alle regole configurate.":"Stai per effettuare un riposo breve: verranno aggiornate solo le risorse che si recuperano con questo tipo di riposo.",confirmLabel:"Conferma riposo"})))try{await ga(t.id,e),E(e==="long_rest"?"Riposo lungo completato":"Riposo breve completato");const o=await Je(t.id);re("resources",o),await ce({resources:o});const p=Va(t.data,e);if(p?await J(t,p,null,a?()=>B(a):null):a&&B(a),e==="long_rest"){const f=Y().characters.find(g=>g.id===t.id);(l=(r=f==null?void 0:f.data)==null?void 0:r.spellcasting)!=null&&l.can_prepare&&await Ye(f,a?()=>B(a):null)}}catch{E("Errore aggiornamento risorse","error")}}async function Ft(e,a){var z,w,h,D,x,y,I,q;const{canEditCharacter:t}=Z();if(!e)return;if(!t){E("Azioni HP disponibili solo con profilo online","error");return}const s=((z=e.data)==null?void 0:z.hit_dice)||{},r=Number(s.used)||0,l=Number(s.max)||0,n=Math.max(l-r,0),o=xe(s.die);if(!o){E("Configura un dado vita valido","error");return}if(n<=0){E("Nessun dado vita disponibile","error");return}const p=ae((h=(w=e.data)==null?void 0:w.abilities)==null?void 0:h.con)??0;let f=1;const _=await oe({keepOpen:!1,title:`Dado vita • ${s.die||`d${o}`}`,mode:"generic",notation:`1d${o}`,modifier:p,rollType:"GEN",characterId:e.id,historyLabel:"Dado vita",genericDiceMax:n,warning:"Attenzione: ogni dado vita lanciato verrà sottratto ai dadi vita disponibili.",onRollComplete:({diceCount:R})=>{f=Math.max(Number(R)||1,1)}}).waitForRoll;if(!_||_<=0)return;if(f>n){E(`Hai solo ${n} dadi vita disponibili`,"error");return}const i=Number((x=(D=e.data)==null?void 0:D.hp)==null?void 0:x.current)||0,$=(I=(y=e.data)==null?void 0:y.hp)==null?void 0:I.max,k=i+Number(_),u=$!=null?Math.min(k,Number($)):k;await J(e,{...e.data,hp:{...(q=e.data)==null?void 0:q.hp,current:u},hit_dice:{...s,used:Math.min(r+f,l)}},`PF curati +${_} (${f}d${o})`,()=>{a&&B(a)})}async function Pt(e,a){var b,A,N,C,M,T,H,O,L,F,W;const{activeCharacter:t,canEditCharacter:s}=Z();if(!t)return;if(!s){E("Azioni HP disponibili solo con profilo online","error");return}const n=await ne({title:e==="heal"?"Cura PF":"Subisci danno",submitLabel:e==="heal"?"Cura":"Danno",content:Ht(t,{allowHitDice:!1,allowTempHp:e==="heal",allowMaxOverride:e==="damage"})});if(!n)return;const o=n.has("use_hit_dice"),p=n.has("temp_hp"),f=((b=t.data)==null?void 0:b.hit_dice)||{},g=((A=t.data)==null?void 0:A.abilities)||{},_=Number(f.used)||0,i=Number(f.max)||0,$=xe(f.die),k=Math.max(Number(n.get("hit_dice_count"))||1,1);let u=Number(n.get("amount"));const z=u,w=e==="damage"&&((N=n.get("damage_type"))==null?void 0:N.toString())||"";if(e==="heal"&&o){if(!$){E("Configura un dado vita valido","error");return}if(_>=i){E("Nessun dado vita disponibile","error");return}const Q=Math.max(i-_,0);if(k>Q){E(`Hai solo ${Q} dadi vita disponibili`,"error");return}const ee=ae(g.con)??0,ve=Array.from({length:k},()=>Oa($)).reduce((he,we)=>he+we,0);u=Math.max(ve+ee*k,1)}if(!u||u<=0){E("Inserisci un valore valido","error");return}const h=e==="damage"?Tt(t,u,w):{amount:u,reason:null};e==="damage"&&(u=h.amount);const D=Number((M=(C=t.data)==null?void 0:C.hp)==null?void 0:M.current)||0,x=Number((H=(T=t.data)==null?void 0:T.hp)==null?void 0:H.temp)||0,y=(L=(O=t.data)==null?void 0:O.hp)==null?void 0:L.max,I=n.get("hp_max_override"),q=I===null||I===""?null:Number(I);if(e==="damage"&&q!==null&&(!Number.isFinite(q)||q<=0)){E("Inserisci un massimo PF valido","error");return}let R=D,S=x;if(e==="heal"&&p)S=x+u;else if(e==="heal")R=D+u;else{const Q=Math.min(x,u);S=x-Q;const ee=u-Q;R=Math.max(D-ee,0)}const v=q??y,P=v!=null?Math.min(R,Number(v)):R,j=e==="heal"&&o?{...f,used:Math.min(_+k,i)}:f,V=e==="damage"&&w?` ${Ce(w).toLowerCase()}`:"",K=e==="damage"&&h.reason?` (da ${z}, ${h.reason})`:"",c=e==="heal"?`${p?"HP temporanei +":"PF curati +"}${u}${o?` (${k}d${$})`:""}`:`Danno${V} ${u}${K}`,d=e==="damage"&&Number(u)>0&&!!((F=t.data)!=null&&F.concentration_active),m=async()=>{var Se,ve,he;if(a&&B(a),!d)return;const Q=Re(t),ee=Q.find(we=>we.value==="con");!ee||ee.disabled||le({title:"Tiro salvezza concentrazione • COS",mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:Q,value:ee.value},allowInspiration:!!((Se=t==null?void 0:t.data)!=null&&Se.inspiration)&&s,weakPoints:Number((he=(ve=t==null?void 0:t.data)==null?void 0:ve.hp)==null?void 0:he.weak_points)||0,characterId:t.id,historyLabel:"TS concentrazione"})};await J(t,{...t.data,hp:{...(W=t.data)==null?void 0:W.hp,current:P,temp:S,max:q??y},hit_dice:j},c,m)}function le({title:e,mode:a,selection:t=null,allowInspiration:s=!1,onConsumeInspiration:r=null,rollType:l=null,weakPoints:n=0,characterId:o=null,historyLabel:p=null,onRollComplete:f=null}){oe({keepOpen:!0,title:e,mode:a,selection:t,allowInspiration:s,onConsumeInspiration:r,rollType:l,weakPoints:n,characterId:o,historyLabel:p,onRollComplete:f})}function Ht(e,{allowHitDice:a=!0,allowTempHp:t=!1,allowMaxOverride:s=!1}={}){var I,q,R;const r=(S,v={})=>{const P=S==null?void 0:S.querySelector('input[type="number"]');P&&Da(P,v)},l=document.createElement("div");l.className="modal-form-grid hp-shortcut-fields";const n=_e({label:"Valore",name:"amount",type:"number",value:"1"});n.classList.add("hp-shortcut-fields__amount");const o=n.querySelector("input");o&&Me(o,{min:1}),o&&(o.min="1",o.required=!0);const p=document.createElement("div");if(p.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",p.appendChild(n),t){const S=document.createElement("div");S.className="modal-toggle-field",S.innerHTML=`
      <span class="modal-toggle-field__label">HP temporanei</span>
      <label class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="temp_hp" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </label>
    `,p.appendChild(S)}if(l.appendChild(p),!a){if(s){const S=document.createElement("label");S.className="field hp-shortcut-fields__damage-type";const v=document.createElement("span");v.textContent="Tipo di danno";const P=Ne([{value:"",label:"Nessun tipo (danno normale)"},...me.map(K=>({value:K.key,label:K.label}))],"");P.name="damage_type",S.append(v,P),p.appendChild(S);const j=_e({label:"Nuovo massimo PF",name:"hp_max_override",type:"number",value:((q=(I=e==null?void 0:e.data)==null?void 0:I.hp)==null?void 0:q.max)??""});j.classList.add("hp-shortcut-fields__max");const V=j.querySelector("input");V&&(Me(V,{min:1}),V.min="1"),p.appendChild(j)}return l}const f=((R=e==null?void 0:e.data)==null?void 0:R.hit_dice)||{},g=Number(f.used)||0,_=Number(f.max)||0,i=Math.max(_-g,0),$=xe(f.die),k=i>0&&$,u=document.createElement("div");u.className="modal-toggle-field";const z=f.die?`${f.die}`:"dado vita";u.innerHTML=`
    <span class="modal-toggle-field__label">Usa dado vita (${z}) · rimasti ${i}/${_||"-"}</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="use_hit_dice" ${k?"":"disabled"} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const w=document.createElement("label");w.className="field hit-dice-count hp-shortcut-fields__count",w.innerHTML=`
    <span>Numero dadi vita</span>
    <input type="number" name="hit_dice_count" min="1" max="${i}" value="1" />
  `,r(w,{decrementLabel:"Riduci dadi vita",incrementLabel:"Aumenta dadi vita"});const h=document.createElement("div");if(h.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",h.append(u,w),l.appendChild(h),!k){const S=document.createElement("p");S.className="muted",S.textContent="Nessun dado vita disponibile o configurato.",l.appendChild(S)}const D=u.querySelector("input"),x=w.querySelector("input");x&&(x.required=!1);const y=()=>{const S=D==null?void 0:D.checked;o&&(o.disabled=!!S,o.required=!S,S?o.value="":o.value||(o.value="1"),x&&(x.disabled=!S,x.required=!!S,S||(x.value="1")))};return D==null||D.addEventListener("change",y),y(),l}export{Jt as bindGlobalFabHandlers,B as renderHome};
