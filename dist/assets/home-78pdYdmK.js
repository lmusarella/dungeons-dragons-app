import{s as De,a as Re,b as Q,c as Be,e as Ge,R as oe,u as Qe,f as Ie,d as Je,g as he,h as Xe}from"./constants-D91WXhmy.js";import{c as Ye,g as Pe,f as Ze,a as ea,b as aa,d as ta,e as sa,m as ia,h as na,u as oa,i as la,j as ra,k as ca,l as da,n as _e,o as ye,p as ua}from"./walletApi-CZ7hcHyx.js";import{c as L,o as ie,u as re,a as ce,b as be,g as Z,n as Y,d as ue,s as $e,e as pa,f as ma,h as ba,i as fa}from"./index-xCsXiwLa.js";import{openDiceOverlay as te}from"./dice-DCJtKtuT.js";import{o as ke}from"./characterDrawer-BkpoIxuM.js";import{n as V,c as ne,f as U,g as X,a as ga,b as va,d as ha,e as ee,s as _a,h as ya,p as $a,i as Se,j as ge,r as ka,k as Sa,l as we,m as wa,o as La,q as Ea}from"./utils-D__OBfYe.js";import{s as J,o as He,a as Aa,f as Le,b as Ee,c as Na,d as Ca,e as Ae,g as Ma,r as xa,h as qa,i as za,j as Ta,k as Ne,l as Da,m as Ra,n as Ba}from"./modals-CF6dNxc9.js";function Ia(e,s){return e?`
    <div>
      <p>Non hai ancora un personaggio.</p>
      <div class="button-row">
        <button class="primary" data-create-character>Nuovo personaggio</button>
      </div>
    </div>
  `:`<p class="muted">${s?"Modalità offline attiva: crea un personaggio quando torni online.":"Accedi per creare un personaggio."}</p>`}function Pa(e,s,a=[]){const i=e.data||{},u=i.hp||{},l=i.hit_dice||{},n=i.abilities||{},r=V(i.proficiency_bonus),b=!!i.inspiration,f=!!i.concentration_active,g=i.initiative??X(n.dex),N=i.skills||{},t=i.skill_mastery||{},E=ga(n,r,N,t),$=V(u.current),d=V(u.max),C=V(u.temp),_=i.death_saves||{},T=Math.max(0,Math.min(3,Number(_.successes)||0)),k=Math.max(0,Math.min(3,Number(_.failures)||0)),q=d?Math.min(Math.max(Number($)/d*100,0),100):0,h=Math.max(0,Number(C)||0),I=Math.max(0,Number(d??$??0)),R=h>0,D=R?100:0,S=R?I:1,v=R?h:0,j=d?`${$??"-"}/${d}`:`${$??"-"}`,F=C??"-",O=Math.max(0,Math.min(6,Number(u.weak_points)||0)),K=Array.isArray(i.conditions)?i.conditions:i.condition?[i.condition]:[],o=Be.filter(y=>K.includes(y.key)),c=o.length?o.map(y=>y.label).join(", "):"Nessuna condizione",m=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti delle condizioni">?</summary>
      <div class="info-tooltip__panel">
        ${o.length?`
      <ul class="condition-track__list">
        ${o.map(y=>`<li><strong>${y.label}:</strong> ${y.effect}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun effetto attivo.</p>'}
      </div>
    </details>
  `,w=[{value:1,description:"Svantaggio sulle prove di caratteristica."},{value:2,description:"Velocità dimezzata."},{value:3,description:"Svantaggio sui tiri per colpire e tiri salvezza."},{value:4,description:"Punti ferita massimi dimezzati."},{value:5,description:"Velocità ridotta a 0."},{value:6,description:"Morte."}],M=w.filter(y=>y.value<=O),A=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti dei punti indebolimento">?</summary>
      <div class="info-tooltip__panel">
        ${M.length?`
      <ul class="weakness-track__list">
        ${M.map(y=>`<li>${y.description}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun indebolimento.</p>'}
      </div>
    </details>
  `,z=`Livello attuale: ${O}`,P=va(i,n,a),W=[{key:"str",label:Q.str,value:n.str},{key:"dex",label:Q.dex,value:n.dex},{key:"con",label:Q.con,value:n.con},{key:"int",label:Q.int,value:n.int},{key:"wis",label:Q.wis,value:n.wis},{key:"cha",label:Q.cha,value:n.cha}];return`
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
            <strong>${U(r)}</strong>
          </div>
          <div class="inspiration-chip">
            <span>Ispirazione</span>
            <button
              class="inspiration-toggle"
              type="button"
              data-toggle-inspiration
              aria-pressed="${b}"
              aria-label="Imposta ispirazione"
              ${s?"":"disabled"}
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
              ${s?"":"disabled"}
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
          ${W.map(y=>{const H=V(y.value),G=H===null?"-":ya(H);return`
            <div class="stat-card stat-card--${y.key}">
              <span>${y.label}</span>
              <strong>${H??"-"}</strong>
              <span class="stat-card__modifier" aria-label="Modificatore ${y.label}">${G}</span>
            </div>
          `}).join("")}
        </div>
      </div>
      <div class="hp-panel">
        <div class="hp-bar-row">
          <div class="armor-class-card">
            <span>CA</span>
            <strong>${P??"-"}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">🛡️</span>
          </div>
          <div class="armor-class-card armor-class-card--initiative">
            <span>Iniz</span>
            <strong>${U(V(g))}</strong>
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
              <strong>${j}</strong>
              <span class="hp-bar-label__divider" aria-hidden="true">•</span>
              <span class="hp-bar-label__temp-group ${R?"is-active":""}">
                <span class="hp-bar-label__temp">HP temporanei</span>
                <strong>${F}</strong>
              </span>
            </div>
            <div class="hp-bar-track">
              <div class="hp-bar" style="flex: ${S};">
                <div class="hp-bar__fill" style="width: ${q}%;"></div>
              </div>
              ${R?`
              <div class="hp-bar hp-bar--temp is-active" style="flex: ${v};">
                <div class="hp-bar__fill hp-bar__fill--temp" style="width: ${D}%;"></div>
              </div>
              `:""}
            </div>
            <div class="hp-panel-hit-dice">
              <span>Dadi vita</span>
              <strong>${ha(l)}</strong>
              <button
                class="icon-button icon-button--dice hp-panel-hit-dice__roll"
                type="button"
                data-roll-hit-dice
                aria-label="Lancia dado vita per curare PF"
                ${s?"":"disabled"}
              >
                <span aria-hidden="true">🎲</span>
              </button>
            </div>
            ${s?'<p class="hp-panel-hit-dice__warning">Se lanci il dado verrà sottratto ai dadi vita disponibili.</p>':""}
          </div>
        </div>
        <div class="hp-panel-subgrid">
          <div class="stat-chip stat-chip--highlight">
            <span>Percezione passiva</span>
            <strong>${E??"-"}</strong>
          </div>
          <div class="hp-panel-status-row">
            <div class="weakness-track">
              <div class="track-label-row">
                <span class="weakness-track__label">Punti indebolimento</span>
                ${A}
              </div>
              <div class="weakness-track__group" role="radiogroup" aria-label="Livelli indebolimento">
                ${w.map(y=>{const H=y.value===O;return`
                  <button
                    class="death-save-dot ${H?"is-filled":""}"
                    type="button"
                    role="radio"
                    aria-checked="${H}"
                    data-weakness-level="${y.value}"
                    aria-label="Livello ${y.value}: ${y.description}"
                  >
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="weakness-track__description">${z}</div>
            </div>
            <div class="condition-track">
              <div class="track-label-row">
                <span class="condition-track__label">Condizioni</span>
                ${m}
              </div>
              <div class="condition-track__row">
                <span class="condition-track__value">${c}</span>
              </div>
            </div>
            <div class="death-saves">
              <span class="death-saves__label">TS morte</span>
              <div class="death-saves__group" aria-label="Successi">
                <span class="death-saves__tag">✓</span>
                ${Array.from({length:3},(y,H)=>{const G=H+1;return`
                  <button class="death-save-dot ${G<=T?"is-filled":""}" type="button" data-death-save="successes" data-death-save-index="${G}" aria-label="Successi ${G}">
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="death-saves__group" aria-label="Fallimenti">
                <span class="death-saves__tag">✗</span>
                ${Array.from({length:3},(y,H)=>{const G=H+1;return`
                  <button class="death-save-dot ${G<=k?"is-filled":""}" type="button" data-death-save="failures" data-death-save-index="${G}" aria-label="Fallimenti ${G}">
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
        ${Oa(e,a,s)}
      </div>
    </div>
  `}function Ha(e){const s=e.data||{},a=s.abilities||{},i=V(s.proficiency_bonus),u=s.skills||{},l=s.skill_mastery||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Re.map(n=>{const r=!!u[n.key],b=!!l[n.key],f=ne(a[n.ability],i,r?b?2:1:0);return`
          <button class="modifier-card modifier-card--interactive ${b?"modifier-card--mastery":r?"modifier-card--proficiency":""}" type="button" data-skill-card="${n.key}" aria-label="Tira abilità ${n.label}">
            <div>
              <div class="modifier-title">
                <strong>${n.label}</strong>
                <span class="modifier-ability modifier-ability--${n.ability}">${Q[n.ability]}</span>
              </div>
            </div>
            <div class="modifier-value">${U(f)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function Fa(e){const s=e.data||{},a=s.abilities||{},i=V(s.proficiency_bonus),u=Array.isArray(s.special_skill_rolls)?s.special_skill_rolls:[];return u.length?`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${u.map((l,n)=>{var d;const r=Q[l.ability]?l.ability:"str",b=!!l.proficient,f=!!l.mastery&&b,g=ne(a[r],i,b?f?2:1:0),N=Number(l.bonus)||0,t=(g??0)+N,E=f?"modifier-card--mastery":b?"modifier-card--proficiency":"",$=((d=l.name)==null?void 0:d.trim())||`Tiro speciale ${n+1}`;return`
          <button class="modifier-card modifier-card--interactive ${E}" type="button" data-special-skill-card="${l.id??n}" aria-label="Tira abilità speciale ${$}">
            <div>
              <div class="modifier-title">
                <strong>${$}</strong>
                <span class="modifier-ability modifier-ability--${r}">${Q[r]}</span>
              </div>
            </div>
            <div class="modifier-value">${U(t)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `:`
      <div class="detail-section">
        <p class="muted">Nessun tiro speciale configurato. Aggiungilo dalla modifica personaggio.</p>
      </div>
    `}function ja(e){const s=e.data||{},a=s.abilities||{},i=V(s.proficiency_bonus),u=s.saving_throws||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${De.map(l=>{const n=!!u[l.key],r=ne(a[l.key],i,n?1:0);return`
          <button class="modifier-card modifier-card--interactive ${n?"modifier-card--proficiency":""}" type="button" data-saving-throw-card="${l.key}" aria-label="Tira salvezza ${l.label}">
            <div>
              <div class="modifier-title">
                <strong>${l.label}</strong>
              </div>
            </div>
            <div class="modifier-value">${U(r)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function Oa(e,s=[],a=!1){const i=e.data||{},u=i.proficiencies||{},l=i.proficiency_notes||"",{tools:n,languages:r}=$a(l),b=i.language_proficiencies||"",f=Se(b),g=i.talents||"",N=Se(g),E=[...f,...r].reduce((d,C)=>{const _=C.trim();if(!_)return d;const T=_.toLowerCase();return d.seen.has(T)||(d.seen.add(T),d.values.push(_)),d},{values:[],seen:new Set}).values,$=Ge.filter(d=>u[d.key]).map(d=>d.label);return`
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
          ${$.length?`<div class="tag-row">${$.map(d=>`<span class="chip">${d}</span>`).join("")}</div>`:'<p class="muted">Nessuna competenza equipaggiamento.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="tools">
          ${n.length?`<div class="tag-row">${n.map(d=>`<span class="chip">${d}</span>`).join("")}</div>`:'<p class="muted">Aggiungi strumenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="languages">
          ${E.length?`<div class="tag-row">${E.map(d=>`<span class="chip">${d}</span>`).join("")}</div>`:'<p class="muted">Aggiungi lingue conosciute nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="talents">
          ${N.length?`<div class="tag-row">${N.map(d=>`<span class="chip">${d}</span>`).join("")}</div>`:'<p class="muted">Aggiungi talenti nel profilo.</p>'}
        </div>
      </div>
    </div>
  `}function Ua(e,s=[],a=!1){const i=(s||[]).filter(r=>ee(r).length),u=(s||[]).filter(r=>r.attunement_active).length,l=Ye(s),n=Pe(e);return`
    <section class="card home-card home-section home-scroll-panel">
      <header class="card-header">
        <div>
          <p class="eyebrow">Gestione Equipaggiamento</p>
          <div class="pill-row">
            <span class="pill pill--accent">Oggetti in sintonia: ${u}</span>
            <span class="pill">Carico totale: ${Ze(l,n)}</span>
          </div>
        </div>
        <div class="actions">
          ${a?`
            <button class="icon-button icon-button--add" type="button" data-add-equip aria-label="Equipaggia oggetto">
              <span aria-hidden="true">+</span>
            </button>
          `:""}
        </div>
      </header>
      ${i.length?`
          <ul class="inventory-list resource-list resource-list--compact">
            ${i.map(r=>{const b=ea(r);return`
              <li class="modifier-card attack-card resource-card inventory-item-card">
                <div class="resource-card__badges">
                  ${r.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${b.magic}</span>`:""}
                  ${r.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${b.attunement}</span>`:""}
                </div>
                <div class="attack-card__body resource-card__body">
                  <div class="resource-card__title item-info">
                    ${r.image_url?`<img class="item-avatar" src="${r.image_url}" alt="Foto di ${r.name}" data-item-image="${r.id}" />`:""}
                    <div class="item-info-body">
                      <div class="item-info-line">
                        <button class="item-name-button attack-card__name-button" type="button" data-item-preview="${r.id}" aria-label="Apri anteprima ${r.name}">${r.name}</button>
                        <span class="muted item-meta">
                          ${aa(r.category)} · ${ta(ee(r))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ${a?`
                  <div class="resource-card-actions">
                    <button class="resource-action-button" type="button" data-unequip="${r.id}">Rimuovi</button>
                  </div>
                `:""}
              </li>
            `}).join("")}
          </ul>
        `:'<p class="muted">Nessun oggetto equipaggiato.</p>'}
    </section>
  `}function Va(e,s=[]){var q;const a=e.data||{},i=Number(a.attack_bonus_melee??a.attack_bonus)||0,u=Number(a.attack_bonus_ranged??a.attack_bonus)||0,l=Number(a.damage_bonus_melee??a.damage_bonus)||0,n=Number(a.damage_bonus_ranged??a.damage_bonus)||0,r=Number(a.extra_attacks)||0,b=s.filter(h=>h.category==="weapon"&&h.equipable&&ee(h).length),g=(a.spellcasting||{}).ability,N=g?(q=a.abilities)==null?void 0:q[g]:null,t=X(N),E=V(a.proficiency_bonus),$=t===null||E===null?null:t+E,C=(Array.isArray(a.spells)?a.spells:[]).filter(h=>(h.kind==="cantrip"||Number(h.level)===0)&&h.attack_roll&&h.damage_die),_=C.length&&$!==null&&g;if(!b.length&&!_)return'<p class="muted">Nessuna arma equipaggiata.</p>';const T=[];return r>0&&T.push(`Attacco Extra (${r})`),i&&T.push(`Mischia attacco ${U(i)}`),l&&T.push(`Mischia danni ${U(l)}`),u&&T.push(`Distanza attacco ${U(u)}`),n&&T.push(`Distanza danni ${U(n)}`),`
    ${T.length?`<div class="tag-row">${T.map(h=>`<span class="chip">${h}</span>`).join("")}</div>`:""}
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${b.map(h=>{var W;const I=h.weapon_range||(h.range_normal?"ranged":"melee"),R=h.attack_ability||(I==="ranged"?"dex":"str"),D=X((W=a.abilities)==null?void 0:W[R])??0,S=a.proficiencies||{},j=(h.weapon_type==="simple"?!!S.weapon_simple:h.weapon_type==="martial"?!!S.weapon_martial:!1)?V(a.proficiency_bonus)??0:0,F=I==="ranged"?u:i,O=I==="ranged"?n:l,K=D+j+(Number(h.attack_modifier)||0)+F,o=D+(Number(h.damage_modifier)||0)+O,c=h.damage_die?h.damage_die:"-",p=c==="-"?"-":`${c}${o?` ${U(o)}`:""}`,m=Number(h.range_normal)||null,w=Number(h.range_disadvantage)||null,M=Number(h.melee_range)||1.5,x=[];I==="melee"&&M>1.5&&x.push(`Portata ${M} m`),I==="melee"&&h.is_thrown&&m&&x.push(`Lancio ${m}${w?`/${w}`:""}`),I!=="melee"&&m&&x.push(`Gittata ${m}${w?`/${w}`:""}`);const A=x.join(" · "),z=R==="dex"?"DES":R==="str"?"FOR":R.toUpperCase(),P=h.id??h.name;return`
          <div class="modifier-card attack-card">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${h.name}</strong>
                <span class="modifier-ability modifier-ability--${R}">${z}</span>
                <span class="attack-card__hit">${U(K)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${p}</span>
                ${A?`<span class="muted">${A}</span>`:""}
              </div>
            </div>
            <button class="icon-button icon-button--fire" data-roll-damage="${P}" aria-label="Calcola danni ${h.name}">
              <span aria-hidden="true">🔥</span>
            </button>
          </div>
        `}).join("")}
        ${_?C.map(h=>{const I=Number(h.damage_modifier)||0,R=`${h.damage_die}${I?` ${U(I)}`:""}`,D=Q[g]??(g==null?void 0:g.toUpperCase()),S=h.range?`Range ${h.range}`:"";return`
            <div class="modifier-card attack-card">
              <div class="attack-card__body">
                <div class="attack-card__title">
                  <strong class="attack-card__name">${h.name}</strong>
                  <span class="modifier-ability modifier-ability--${g}">${D}</span>
                  <span class="attack-card__hit">${U($)}</span>
                </div>
                <div class="attack-card__meta">
                  <span class="attack-card__damage">${R}</span>
                 
                  ${S?`<span class="muted">${S}</span>`:""}
                </div>
              </div>
              <button class="icon-button icon-button--fire" data-roll-damage="spell:${h.id}" aria-label="Calcola danni ${h.name}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          `}).join(""):""}
      </div>
    </div>
  `}function Ka(e,s=!1){var S;const a=e.data||{},i=a.spell_notes||"",u=Array.isArray(a.spells)?_a(a.spells):[],l=a.spellcasting||{},n=V(a.proficiency_bonus),r=l.ability,b=r?(S=a.abilities)==null?void 0:S[r]:null,f=X(b),g=f===null||n===null?null:8+f+n,N=f===null||n===null?null:f+n,t=r?Q[r]:null,E=l.slots||{},$=l.slots_max||{},d=l.recharge||"long_rest",_=Array.from({length:9},(v,j)=>j+1).map(v=>{const j=Math.max(0,Number(E[v])||0),F=Math.max(j,Number($[v])||0);return{level:v,count:j,max:F}}).filter(v=>v.max>0),T=[`${t??"-"}`,`CD ${g===null?"-":g}`,`TC ${N===null?"-":U(N)}`],k=T.length?`<div class="tag-row">${T.map(v=>`<span class="chip">${v}</span>`).join("")}</div>`:"",q=u.filter(v=>{if((Number(v.level)||0)<1)return!1;const F=v.prep_state||"known";return F==="prepared"||F==="always"}),h=u.filter(v=>(Number(v.level)||0)===0),I=q.filter(v=>(v.prep_state||"known")==="always"),R=q.filter(v=>(v.prep_state||"known")!=="always"),D=(v,j="")=>{const F=Number(v.level)||0,O=de(v.cast_time),K=Fe(O);return`
      <div class="modifier-card attack-card resource-card spell-prepared-list__card">
        <div class="resource-card__badges spell-card__badges">
          ${v.concentration?'<span class="resource-chip resource-chip--floating resource-chip--concentration">C</span>':""}
          ${v.is_ritual?'<span class="resource-chip resource-chip--floating resource-chip--ritual">R</span>':""}
          ${O?`<span class="resource-chip resource-chip--floating ${K}">${O}</span>`:""}
        </div>
        <button class="spell-prepared-list__item" type="button" data-spell-quick-open="${v.id}">
          <span class="spell-prepared-list__name">${v.name}</span>
          ${F>0?`<span class="chip chip--small">${F}°</span>`:""}
        </button>
        <div class="resource-card-actions spell-card-actions">
          ${F>0?`<button class="resource-cta-button resource-cta-button--label" type="button" data-use-spell="${v.id}">Usa</button>`:""}
          ${s?`
            <button class="resource-action-button resource-icon-button" type="button" data-edit-spell="${v.id}" aria-label="Modifica incantesimo ${v.name}">✏️</button>
            <button class="resource-action-button resource-icon-button" type="button" data-delete-spell="${v.id}" aria-label="Elimina incantesimo ${v.name}">🗑️</button>
          `:""}
        </div>
      </div>
    `};return`
    ${k}
    <div class="detail-section">
      <div class="detail-card detail-card--text spell-summary-card">
        <div class="spell-slots">
          <span class="spell-slots__title">Slot rimanenti</span>
          <div class="spell-slots__list">
            ${_.map(v=>{const j=d==="short_rest"?"charge-indicator":"charge-indicator charge-indicator--long",F=Array.from({length:v.max},(O,K)=>{const o=K>=v.count,p=[j,o?"charge-indicator--used":""].filter(Boolean).join(" ");return s&&o?`<button type="button" class="${p}" data-restore-spell-slot="${v.level}" aria-label="Ripristina uno slot di livello ${v.level}"></button>`:s&&!o?`<button type="button" class="${p}" data-consume-spell-slot="${v.level}" aria-label="Consuma uno slot di livello ${v.level}"></button>`:`<span class="${p}"></span>`}).join("");return`
              <div class="spell-slot-row">
                <span class="spell-slot-label">Slot ${v.level}°</span>
                <span class="spell-slot-count">${v.count}</span>
                <div class="spell-slot-charges" aria-hidden="true">${F||'<span class="spell-slot-empty">-</span>'}</div>
              </div>
            `}).join("")}
          </div>
        </div>
        ${i?`<p class="spell-notes">${i}</p>`:""}
      </div>
      <div class="spell-prepared-list">
        <span class="spell-prepared-list__group-title">Trucchetti</span>
        ${h.length?`
          <div class="spell-prepared-list__items">
            ${h.map(v=>D(v)).join("")}
          </div>
        `:'<p class="muted">Nessun trucchetto disponibile.</p>'}
      </div>
      <div class="spell-prepared-list">
       
        ${q.length?`
          <div class="spell-prepared-list__group">
            <span class="spell-prepared-list__group-title">Preparati</span>
            ${R.length?`<div class="spell-prepared-list__items">${R.map(v=>D(v,"Preparato")).join("")}</div>`:'<p class="muted">Nessun incantesimo preparato.</p>'}
          </div>
          <div class="spell-prepared-list__group">
            <span class="spell-prepared-list__group-title">Sempre conosciuti</span>
            ${I.length?`<div class="spell-prepared-list__items">${I.map(v=>D(v,"Sempre preparato")).join("")}</div>`:'<p class="muted">Nessun incantesimo sempre conosciuto.</p>'}
          </div>
        `:'<p class="muted">Nessun incantesimo preparato disponibile.</p>'}
      </div>
    </div>
  `}function de(e){const s=e==null?void 0:e.toString().trim();if(!s)return"";const a=s.toLowerCase();if(a.includes("bonus"))return"Azione Bonus";if(a.includes("reaz"))return"Reazione";if(a.includes("gratuit"))return"Azione Gratuita";if(a.includes("durata")||a.includes("più")||a.includes("piu")||a.includes("superiore"))return"Durata";if(a.includes("azion"))return"Azione";const i=oe.find(u=>u.label.toLowerCase()===a);return(i==null?void 0:i.label)??""}function Ce(e){if(!e)return oe.length;const s=de(e),a=oe.findIndex(i=>i.label===s);return a===-1?oe.length:a}function Fe(e){var a;if(!e)return"";const s=de(e);return((a=oe.find(i=>i.label===s))==null?void 0:a.className)??""}function Wa(e){return[...e].sort((s,a)=>{const i=Ce(s.cast_time)-Ce(a.cast_time);return i!==0?i:(s.name??"").localeCompare(a.name??"","it",{sensitivity:"base"})})}function Me(e,s,{showCharges:a=!0,showUseButton:i=!0,showDescription:u=!1,showCastTime:l=!0}={}){return`
    <ul class="resource-list resource-list--compact">
      ${e.map(n=>`
        <li class="modifier-card attack-card resource-card" data-resource-card="${n.id}">
          ${l&&de(n.cast_time)?`<span class="resource-chip resource-chip--floating ${Fe(n.cast_time)}">${de(n.cast_time)}</span>`:""}
          <div class="attack-card__body resource-card__body">
            <div class="attack-card__title resource-card__title">
              <strong class="attack-card__name">${n.name}</strong>
            </div>
            ${u?`<p class="resource-card__description">${n.description??""}</p>`:""}
            ${a&&Number(n.max_uses)?`
              <div class="resource-card__charges">
                ${Qa(n)}
              </div>
            `:""}
          </div>
          <div class="resource-card-actions">
            ${i?`
              <button
                class="resource-cta-button resource-cta-button--label"
                data-use-resource="${n.id}"
                ${!Number(n.max_uses)||n.used>=Number(n.max_uses)?"disabled":""}
              >
                Usa
              </button>
            `:""}
            ${s?`
              <button class="resource-action-button resource-icon-button" data-edit-resource="${n.id}" aria-label="Modifica risorsa">✏️</button>
              <button class="resource-action-button resource-icon-button" data-delete-resource="${n.id}" aria-label="Elimina risorsa">🗑️</button>
            `:""}
          </div>
        </li>
      `).join("")}
    </ul>
  `}function Ga(e,s){if(!e.length)return"<p>Nessuna risorsa.</p>";const a=Wa(e),i=a.filter(r=>r.reset_on===null||r.reset_on==="none"),u=a.filter(r=>r.reset_on!==null&&r.reset_on!=="none"),l=u.length?`
      <div class="resource-section resource-section--active">
        <div class="resource-section__body">
          ${Me(u,s,{showUseButton:!0})}
        </div>
      </div>
    `:'<p class="muted">Nessuna risorsa attiva.</p>',n=i.length?`
      <div class="resource-section">
        <header class="card-header"><div><p class="eyebrow">Risorse Passive</p></div></header>
        <div class="resource-section__body">
          ${Me(i,s,{showCharges:!1,showUseButton:!1,showDescription:!0,showCastTime:!0})}
        </div>
      </div>
    `:"";return`${l}${n}`}function Qa(e){const s=Number(e.max_uses)||0,a=Number(e.used)||0;if(!s)return"";const i=e.reset_on==="long_rest"?"long":"short",u=Math.max(s-a,0),l=Array.from({length:s},(n,r)=>{const b=r<a;return`<span class="${["charge-indicator",i==="long"?"charge-indicator--long":"charge-indicator--short",b?"charge-indicator--used":""].filter(Boolean).join(" ")}" aria-hidden="true"></span>`}).join("");return`
    <div class="resource-charge-row" aria-label="Cariche risorsa">
      <span class="resource-charge-label">Cariche</span>
      <span class="resource-charge-count">${u}/${s}</span>
      <div class="resource-charges" aria-hidden="true">${l}</div>
    </div>
  `}let xe=!1,pe=null;function Ja(e){return e?{id:`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.id,name:e.name,level:e.level,kind:Number(e.level)===0?"cantrip":"spell",cast_time:e.cast_time,duration:e.duration,range:e.range,components:e.components,concentration:!!e.concentration,attack_roll:!!e.attack_roll,is_ritual:!!e.ritual,damage_die:e.damage_die,damage_modifier:e.damage_modifier,upcast_damage_die:e.upcast_damage_die,upcast_damage_modifier:e.upcast_damage_modifier,upcast_start_level:e.upcast_start_level,description:e.description,rules_version:e.rules_version,prep_state:"known"}:null}function Xa(e){const s=(e==null?void 0:e.shared_spell)||{},a=(e==null?void 0:e.custom_spell)||{},i=e!=null&&e.shared_spell_id?s:a;if(!(i!=null&&i.name))return null;const u=Number(i.level)||0;return{id:e.id||`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.shared_spell_id||null,name:i.name,level:u,kind:i.kind||(u===0?"cantrip":"spell"),cast_time:i.cast_time||null,duration:i.duration||null,range:i.range||null,components:i.components||null,concentration:!!i.concentration,attack_roll:!!i.attack_roll,is_ritual:!!(i.ritual??i.is_ritual),damage_die:i.damage_die||null,damage_modifier:i.damage_modifier??null,upcast_damage_die:i.upcast_damage_die||null,upcast_damage_modifier:i.upcast_damage_modifier??null,upcast_start_level:i.upcast_start_level??null,description:i.description||null,school:i.school||null,caster_classes:i.caster_classes||[],rules_version:i.rules_version||null,prep_state:e.prep_state||"known"}}async function Ya(){var R;const e=["","Abiurazione","Ammaliamento","Divinazione","Evocazione","Illusione","Invocazione","Necromanzia","Trasmutazione"],s=["mago","warlock","stregone","chierico","druido","ranger","artefice","paladino","bardo"],a=document.createElement("div");a.className="modal-form-grid";const i=ue({label:"Cerca incantesimo",name:"spell_query",placeholder:"Es. Palla di fuoco"}),u=i.querySelector("input"),l=document.createElement("label");l.className="field",l.innerHTML="<span>Versione regole</span>";const n=document.createElement("select");n.name="rules_version",[{value:"2024",label:"2024"},{value:"2014",label:"2014"},{value:"Custom",label:"Custom"}].forEach(D=>{const S=document.createElement("option");S.value=D.value,S.textContent=D.label,n.appendChild(S)}),l.appendChild(n);const r=document.createElement("label");r.className="field",r.innerHTML="<span>Scuola</span>";const b=document.createElement("select");b.name="spell_school_filter",e.forEach(D=>{const S=document.createElement("option");S.value=D,S.textContent=D||"Tutte",b.appendChild(S)}),r.appendChild(b);const f=ue({label:"Livello",name:"spell_level_filter",type:"number",value:""}),g=document.createElement("div");g.className="field",g.innerHTML=`<span>Classi</span><div class="tag-row">${s.map(D=>`<label class="chip"><input type="checkbox" name="spell_caster_filter" value="${D}" /> ${D}</label>`).join("")}</div>`;const N=document.createElement("div");N.className="modal-form-row modal-form-row--compact",N.append(f,r,l),a.appendChild(i),a.appendChild(N),a.appendChild(g);const t=document.createElement("label");t.className="field",t.innerHTML="<span>Risultati</span>";const E=document.createElement("select");E.name="shared_spell_id",t.appendChild(E);const $=document.createElement("div");$.className="tab-bar",$.innerHTML='<button type="button" class="tab-bar__button" data-prev-page>◀</button><span data-page-label class="muted">Pagina 1</span><button type="button" class="tab-bar__button" data-next-page>▶</button>',a.appendChild(t),a.appendChild($);let d=1,C=[];const _=$.querySelector("[data-page-label]"),T=$.querySelector("[data-prev-page]"),k=$.querySelector("[data-next-page]"),q=async()=>{var j;const D=Array.from(a.querySelectorAll('input[name="spell_caster_filter"]:checked')).map(F=>F.value),S=await Ba({query:(u==null?void 0:u.value)||"",rulesVersion:n.value||"2024",level:((j=a.querySelector('input[name="spell_level_filter"]'))==null?void 0:j.value)||"",school:b.value||"",casterClasses:D,page:d,pageSize:25});if(C=S.items||[],E.innerHTML="",C.forEach(F=>{const O=document.createElement("option");O.value=F.id,O.textContent=`${F.name} (Lv ${F.level})`,E.appendChild(O)}),!C.length){const F=document.createElement("option");F.value="",F.textContent="Nessun risultato",E.appendChild(F)}const v=Math.max(1,Math.ceil((S.total||0)/(S.pageSize||25)));_.textContent=`Pagina ${d} / ${v}`,T.disabled=d<=1,k.disabled=d>=v};u==null||u.addEventListener("input",()=>{d=1,q()}),b.addEventListener("change",()=>{d=1,q()}),n.addEventListener("change",()=>{d=1,q()}),(R=a.querySelector('input[name="spell_level_filter"]'))==null||R.addEventListener("input",()=>{d=1,q()}),a.querySelectorAll('input[name="spell_caster_filter"]').forEach(D=>D.addEventListener("change",()=>{d=1,q()})),T==null||T.addEventListener("click",()=>{d=Math.max(1,d-1),q()}),k==null||k.addEventListener("click",()=>{d+=1,q()}),await q();const h=await ie({title:"Seleziona incantesimo condiviso",submitLabel:"Aggiungi",cancelLabel:"Annulla",content:a,cardClass:"modal-card--form"});if(!h)return null;const I=h.get("shared_spell_id");return C.find(D=>D.id===I)||null}function qe(e){var s,a;return((a=(s=e==null?void 0:e.data)==null?void 0:s.settings)==null?void 0:a.auto_usage_dice)!==!1}function Za(e,s){var a,i;return Ea((i=(a=e==null?void 0:e.data)==null?void 0:a.spellcasting)==null?void 0:i.slots,s)}async function et(e,s){const a=Math.max(1,Number(s==null?void 0:s.level)||1),i=Za(e,a);if(!i.length)return L("Slot incantesimo esauriti","error"),null;if(i.length===1)return i[0].level;const u=document.createElement("label");u.className="field",u.innerHTML="<span>Seleziona slot da consumare</span>";const l=document.createElement("select");l.name="cast_slot_level",l.className="input",i.forEach(f=>{const g=document.createElement("option");g.value=String(f.level),g.textContent=`${f.level}° livello (${f.available} slot)`,l.appendChild(g)}),u.appendChild(l);const n=document.createElement("div");n.className="modal-form-grid",n.appendChild(u);const r=await ie({title:s!=null&&s.name?`Lancia ${s.name}`:"Scegli slot incantesimo",submitLabel:"Conferma",cancelLabel:"Annulla",content:n,cardClass:"modal-card--form"});return r?Math.max(a,Number(r.get("cast_slot_level"))||a):null}async function B(e){var u,l,n,r;pe=e;const s=Z(),{user:a,offline:i}=s;$e(!0);try{let b=s.characters;if(!i&&a)try{b=await Je(a.id),pa({characters:b}),await ce({characters:b})}catch{L("Errore caricamento personaggi","error")}const f=Y(s.activeCharacterId);!b.some(o=>Y(o.id)===f)&&b.length&&ma(b[0].id);const N=Y(Z().activeCharacterId),t=b.find(o=>Y(o.id)===N),E=!!a&&!i,$=!!a&&!i,d=!!a&&!i;let C=s.cache.resources,_=s.cache.items;if(!i&&t){const[o,c,p]=await Promise.allSettled([Ie(t.id),ca(t.id),Le(t.id)]),m={};if(o.status==="fulfilled"?(C=o.value,re("resources",C),m.resources=C):L("Errore caricamento risorse","error"),c.status==="fulfilled"?(_=c.value,re("items",_),m.items=_):L("Errore caricamento equip","error"),p.status==="fulfilled"){const w=(p.value||[]).map(M=>Xa(M)).filter(Boolean);if(w.length){const x=[...Array.isArray((u=t.data)==null?void 0:u.spells)?t.data.spells:[]];w.forEach(A=>{x.some(P=>P.shared_spell_id&&P.shared_spell_id===A.shared_spell_id)||x.push(A)}),t.data={...t.data||{},spells:x}}}Object.keys(m).length&&await ce(m)}e.innerHTML=`
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
          ${t?ja(t):"<p>Nessun personaggio selezionato.</p>"}
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
            ${t?Ha(t):"<p>Nessun personaggio selezionato.</p>"}
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
            ${t?Fa(t):"<p>Nessun personaggio selezionato.</p>"}
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
              ${t&&d?`
                <button class="icon-button" data-edit-character aria-label="Modifica personaggio">
                  <span aria-hidden="true">✏️</span>
                </button>
              `:""}
            </div>
          </header>
          ${t?Pa(t,d,_):Ia(E,i)}
        </section>
        ${t?Ua(t,_,d):""}
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
            ${t?Va(t,_||[]):"<p>Nessun personaggio selezionato.</p>"}
          </div>
        </section>
        ${(l=t==null?void 0:t.data)!=null&&l.is_spellcaster?`
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Incantesimi</p>
            </div>
            <div class="actions">
              <button class="icon-button icon-button--dice" data-open-dice="spell-attack" aria-label="Lancia dado tiro per colpire incantesimi">
                <span aria-hidden="true">🎲</span>
              </button>
              ${(r=(n=t==null?void 0:t.data)==null?void 0:n.spellcasting)!=null&&r.can_prepare?`
                <button class="icon-button icon-button--spell-prepare" type="button" data-open-prepared-spells aria-label="Prepara incantesimi" title="Prepara incantesimi">
                  <span aria-hidden="true">📖</span>
                </button>
              `:""}
              ${t&&d?`
                <button class="icon-button icon-button--add" data-add-spell aria-label="Aggiungi incantesimo">
                  <span aria-hidden="true">+</span>
                </button>
              `:""}
            </div>
          </header>
          <div class="home-scroll-body">
            ${Ka(t,d)}
          </div>
        </section>
        `:""}
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Risorse</p>           
            </div>
            ${t&&$?`
              <button class="icon-button icon-button--add" data-add-resource aria-label="Nuova risorsa">
                <span aria-hidden="true">+</span>
              </button>
            `:""}
          </header>
          <div class="home-scroll-body home-scroll-body--resources">
            ${t?Ga(C,$):"<p>Nessun personaggio selezionato.</p>"}
            ${t&&!$?'<p class="muted">Connettiti per aggiungere nuove risorse.</p>':""}
          </div>
        </section>
      </div>
    </div>
  `,je();const T=e.querySelector("[data-create-character]");T&&T.addEventListener("click",()=>{ke(a,()=>B(e))});const k=e.querySelector("[data-edit-character]");k&&k.addEventListener("click",()=>{ke(a,()=>B(e),t)});const q=e.querySelector("[data-add-resource]");q&&q.addEventListener("click",()=>{Ee(t,()=>B(e))});const h=e.querySelector("[data-add-spell]");h&&h.addEventListener("click",async()=>{var c;if(!t)return;const o=await Na();if(o){if(o==="shared")try{const p=await Ya();if(!p)return;const m=Ja(p),w=Array.isArray((c=t.data)==null?void 0:c.spells)?t.data.spells:[];if(w.some(A=>A.shared_spell_id===p.id)){L("Incantesimo già presente nella scheda personaggio","info");return}t.user_id&&await Ca({user_id:t.user_id,character_id:t.id,shared_spell_id:p.id,prep_state:m.prep_state});const x={...t.data||{},spells:[...w,m]};await J(t,x,"Incantesimo aggiunto dalla lista condivisa",()=>B(e));return}catch{L("Errore durante l'associazione dell'incantesimo condiviso","error");return}Ae(t,async p=>{if(!p)return B(e);try{await Ma({created_by:t.user_id,rules_version:p.rules_version||"2024",name:p.name,level:p.level,school:p.school||null,caster_classes:Array.isArray(p.caster_classes)?p.caster_classes:[],cast_time:p.cast_time||null,range:p.range||null,duration:p.duration||null,components:p.components||null,concentration:!!p.concentration,ritual:!!p.is_ritual,attack_roll:!!p.attack_roll,damage_die:p.damage_die||null,damage_modifier:p.damage_modifier??null,upcast_damage_die:p.upcast_damage_die||null,upcast_damage_modifier:p.upcast_damage_modifier??null,upcast_start_level:p.upcast_start_level??null,description:p.description||null})}catch{L("Incantesimo salvato sul personaggio ma non sul catalogo condiviso","info")}B(e)})}}),e.querySelectorAll("[data-edit-spell]").forEach(o=>o.addEventListener("click",()=>{var w;const c=o.dataset.editSpell;if(!c||!t)return;const m=(Array.isArray((w=t.data)==null?void 0:w.spells)?t.data.spells:[]).find(M=>M.id===c);m&&Ae(t,()=>B(e),m)})),e.querySelectorAll("[data-delete-spell]").forEach(o=>o.addEventListener("click",async()=>{var x;const c=o.dataset.deleteSpell;if(!c||!t)return;const p=Array.isArray((x=t.data)==null?void 0:x.spells)?t.data.spells:[],m=p.find(A=>A.id===c);if(!m||!await be({title:"Conferma eliminazione incantesimo",message:`Stai per eliminare l'incantesimo "${m.name}" dalla scheda del personaggio. Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))return;if(m.shared_spell_id)try{const z=(await Le(t.id)).find(P=>P.shared_spell_id===m.shared_spell_id);z!=null&&z.id&&await xa(z.id)}catch{L("Errore rimozione associazione incantesimo","error");return}const M={...t.data||{},spells:p.filter(A=>A.id!==m.id)};await J(t,M,"Incantesimo eliminato",()=>B(e))}));const I=e.querySelector("[data-open-prepared-spells]");I&&I.addEventListener("click",()=>{He(t,()=>B(e))}),e.querySelectorAll("[data-spell-quick-open]").forEach(o=>o.addEventListener("click",()=>{var w;const c=o.dataset.spellQuickOpen;if(!c||!t)return;const m=(Array.isArray((w=t.data)==null?void 0:w.spells)?t.data.spells:[]).find(M=>M.id===c);m&&qa(t,m,()=>B(e))}));const R=e.querySelector("[data-show-background]");R&&R.addEventListener("click",()=>{za(t)});const D=e.querySelector("[data-edit-conditions]");D&&D.addEventListener("click",async()=>{await Oe(e)}),e.querySelectorAll("[data-proficiency-tabs]").forEach(o=>{var M;const c=Array.from(o.querySelectorAll("[data-proficiency-tab]")),p=Array.from(o.querySelectorAll("[data-proficiency-panel]"));if(!c.length||!p.length)return;const m=x=>{c.forEach(A=>{const z=A.dataset.proficiencyTab===x;A.classList.toggle("is-active",z),A.setAttribute("aria-selected",String(z))}),p.forEach(A=>{A.classList.toggle("is-active",A.dataset.proficiencyPanel===x)})};c.forEach(x=>{x.addEventListener("click",()=>{m(x.dataset.proficiencyTab)})});const w=((M=c.find(x=>x.classList.contains("is-active")))==null?void 0:M.dataset.proficiencyTab)??c[0].dataset.proficiencyTab;w&&m(w)});const S=e.querySelector("[data-add-equip]");S&&t&&d&&S.addEventListener("click",async()=>{var W;const o=(_||[]).filter(y=>y.equipable&&!ee(y).length);if(!o.length){L("Nessun oggetto equipaggiabile disponibile","error");return}const c=document.createElement("div");c.className="drawer-form";const p=document.createElement("label");p.className="field",p.innerHTML="<span>Oggetto</span>";const m=document.createElement("select");m.name="item_id",o.forEach(y=>{const H=document.createElement("option");H.value=y.id,H.textContent=y.name,m.appendChild(H)}),p.appendChild(m),c.appendChild(p);const w=document.createElement("fieldset");w.className="equip-slot-field",w.innerHTML="<legend>Punti del corpo</legend>";const M=document.createElement("div");M.className="equip-slot-list",da.forEach(y=>{const H=document.createElement("label");H.className="checkbox",H.innerHTML=`<input type="checkbox" name="equip_slots" value="${y.value}" /> <span>${y.label}</span>`,M.appendChild(H)}),w.appendChild(M),c.appendChild(w);const x=await ie({title:"Equipaggia oggetto",submitLabel:"Equipaggia",content:c});if(!x)return;const A=x.getAll("equip_slots");if(!A.length){L("Seleziona almeno uno slot","error");return}const z=o.find(y=>String(y.id)===x.get("item_id"));if(!z)return;const P=((W=t.data)==null?void 0:W.proficiencies)||{};if(z.category==="weapon"){if(!z.weapon_type){L("Definisci il tipo di arma prima di equipaggiarla","error");return}if(!(z.weapon_type==="simple"?!!P.weapon_simple:!!P.weapon_martial)){L("Non hai la competenza per equipaggiare questo oggetto","error");return}}if(z.category==="armor")if(z.is_shield){if(!P.shield){L("Non hai la competenza per equipaggiare questo oggetto","error");return}}else if(z.armor_type){if(!(z.armor_type==="light"?!!P.armor_light:z.armor_type==="medium"?!!P.armor_medium:!!P.armor_heavy)){L("Non hai la competenza per equipaggiare questo oggetto","error");return}}else{L("Definisci il tipo di armatura prima di equipaggiarla","error");return}if(!z.sovrapponibile&&(_||[]).filter(H=>H.id!==z.id).filter(H=>ee(H).some(G=>A.includes(G))).length){L("Uno o più slot selezionati sono già occupati","error");return}try{await _e(z.id,{equip_slot:A[0]||null,equip_slots:A}),L("Equipaggiamento aggiornato"),B(e)}catch{L("Errore aggiornamento equip","error")}}),e.querySelectorAll("[data-unequip]").forEach(o=>o.addEventListener("click",async()=>{const c=(_||[]).find(p=>p.id===o.dataset.unequip);if(c)try{await _e(c.id,{equip_slot:null,equip_slots:[]}),L("Equipaggiamento rimosso"),B(e)}catch{L("Errore aggiornamento equip","error")}}));const v=e.querySelector("[data-toggle-inspiration]");v&&t&&d&&v.addEventListener("click",async()=>{const o=t.data||{},c={...o,inspiration:!o.inspiration};await J(t,c,"Ispirazione aggiornata",()=>B(e))});const j=e.querySelector("[data-toggle-concentration]");j&&t&&d&&j.addEventListener("click",async()=>{const o=t.data||{},c={...o,concentration_active:!o.concentration_active};await J(t,c,"Concentrazione aggiornata",()=>B(e))}),e.querySelectorAll("[data-open-dice]").forEach(o=>o.addEventListener("click",()=>{Ke(o.dataset.openDice)})),e.querySelectorAll("[data-saving-throw-card]").forEach(o=>o.addEventListener("click",()=>{var w,M,x;if(!t)return;const c=o.dataset.savingThrowCard;if(!c)return;const p=ve(t),m=p.find(A=>A.value===c);m&&le({title:`Tiro salvezza • ${m.shortLabel||m.label}`,mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:p,value:m.value},allowInspiration:!!((w=t==null?void 0:t.data)!=null&&w.inspiration)&&d,weakPoints:Number((x=(M=t==null?void 0:t.data)==null?void 0:M.hp)==null?void 0:x.weak_points)||0,characterId:t.id})})),e.querySelectorAll("[data-skill-card]").forEach(o=>o.addEventListener("click",()=>{var w,M,x;if(!t)return;const c=o.dataset.skillCard;if(!c)return;const p=Ue(t,_||[]),m=p.find(A=>A.value===c);m&&le({title:`Tiro abilità • ${m.shortLabel||m.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità",options:p,value:m.value},allowInspiration:!!((w=t==null?void 0:t.data)!=null&&w.inspiration)&&d,weakPoints:Number((x=(M=t==null?void 0:t.data)==null?void 0:M.hp)==null?void 0:x.weak_points)||0,characterId:t.id})})),e.querySelectorAll("[data-special-skill-card]").forEach(o=>o.addEventListener("click",()=>{var w,M,x;if(!t)return;const c=o.dataset.specialSkillCard;if(!c)return;const p=Ve(t,_||[]),m=p.find(A=>A.value===c);m&&le({title:`Tiro abilità speciale • ${m.shortLabel||m.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità speciale",options:p,value:m.value},allowInspiration:!!((w=t==null?void 0:t.data)!=null&&w.inspiration)&&d,weakPoints:Number((x=(M=t==null?void 0:t.data)==null?void 0:M.hp)==null?void 0:x.weak_points)||0,characterId:t.id})})),e.querySelectorAll("[data-edit-resource]").forEach(o=>o.addEventListener("click",()=>{const c=C.find(p=>p.id===o.dataset.editResource);c&&Ee(t,()=>B(e),c)})),e.querySelectorAll("[data-roll-hit-dice]").forEach(o=>o.addEventListener("click",async()=>{await dt(t,e)})),e.querySelectorAll("[data-roll-damage]").forEach(o=>o.addEventListener("click",()=>{var w,M,x;if(!t)return;const c=o.dataset.rollDamage;if(!c)return;if(c.startsWith("spell:")){const A=c.replace("spell:",""),P=(Array.isArray((w=t.data)==null?void 0:w.spells)?t.data.spells:[]).find(H=>H.id===A);if(!P)return;const W=Number(P.cast_level??P.level)||0,y=we(P,W);if(!y){L("Danno non calcolabile per questo trucchetto.","error");return}te({keepOpen:!0,title:y.title,mode:"generic",notation:y.notation,modifier:y.modifier,rollType:"DMG",characterId:t==null?void 0:t.id,historyLabel:P.name||null,sneakAttackDice:((M=t==null?void 0:t.data)==null?void 0:M.sneak_attack_dice)||null});return}const p=_==null?void 0:_.find(A=>String(A.id)===c||A.name===c);if(!p)return;const m=wa(t,p);if(!m){L("Danno non calcolabile per questa arma.","error");return}te({keepOpen:!0,title:m.title,mode:"generic",notation:m.notation,modifier:m.modifier,rollType:"DMG",characterId:t==null?void 0:t.id,historyLabel:p.name||null,sneakAttackDice:((x=t==null?void 0:t.data)==null?void 0:x.sneak_attack_dice)||null})}));const F=o=>{var m;const c=(m=o==null?void 0:o.damage_dice_notation)==null?void 0:m.trim();if(!c)return;const p=La(c);if(!(p!=null&&p.notation)){L("Notazione dado non valida per questa risorsa","error");return}te({keepOpen:!0,title:o.name||"Tiro abilità",mode:"generic",notation:p.notation,modifier:Number(o.damage_modifier)||0,rollType:"GEN",characterId:t==null?void 0:t.id,historyLabel:o.name||null})},O=async o=>{const c=Number(o.max_uses)||0;if(!(!c||o.used>=c))try{await he(o.id,{used:Math.min(o.used+1,c)}),L("Risorsa usata"),qe(t)&&F(o),B(e)}catch{L("Errore utilizzo risorsa","error")}};e.querySelectorAll("[data-resource-card]").forEach(o=>{const c=async p=>{if(p.target.closest("button"))return;const m=C.find(w=>w.id===o.dataset.resourceCard);m&&Ta(m,{onUse:()=>O(m),onReset:async()=>{try{await he(m.id,{used:0}),L("Risorsa ripristinata"),B(e)}catch{L("Errore ripristino risorsa","error")}}})};o.addEventListener("click",c)}),e.querySelectorAll("[data-use-resource]").forEach(o=>o.addEventListener("click",async()=>{const c=C.find(p=>p.id===o.dataset.useResource);c&&await O(c)})),e.querySelectorAll("[data-use-spell]").forEach(o=>o.addEventListener("click",async()=>{var P,W;if(!t)return;const c=o.dataset.useSpell;if(!c)return;const m=(Array.isArray((P=t.data)==null?void 0:P.spells)?t.data.spells:[]).find(y=>y.id===c);if(!m||(Number(m.level)||0)<1)return;const M=await et(t,m);if(!M||!await Ne(t,M,()=>B(e)))return;const A=Z().characters.find(y=>Y(y.id)===Y(t.id))||t;if(m.concentration){const y=A.data||{};y.concentration_active||await J(A,{...y,concentration_active:!0},"Concentrazione attiva",()=>B(e))}if(!qe(A)){B(e);return}const z=we(m,M);if(!z){L("Danno non calcolabile per questo incantesimo.","error");return}te({keepOpen:!0,title:z.title,mode:"generic",notation:z.notation,modifier:z.modifier,rollType:"DMG",characterId:t.id,historyLabel:m.name||null,sneakAttackDice:((W=t==null?void 0:t.data)==null?void 0:W.sneak_attack_dice)||null})})),e.querySelectorAll("[data-consume-spell-slot]").forEach(o=>o.addEventListener("click",async()=>{if(!t)return;const c=Number(o.dataset.consumeSpellSlot);!Number.isFinite(c)||c<1||await Ne(t,c,()=>B(e))})),e.querySelectorAll("[data-restore-spell-slot]").forEach(o=>o.addEventListener("click",async()=>{if(!t)return;const c=Number(o.dataset.restoreSpellSlot);!Number.isFinite(c)||c<1||await Da(t,c,()=>B(e))})),e.querySelectorAll("[data-delete-resource]").forEach(o=>o.addEventListener("click",async()=>{const c=C.find(m=>m.id===o.dataset.deleteResource);if(!(!c||!await be({title:"Conferma eliminazione risorsa",message:`Stai per eliminare la risorsa "${c.name}". Questa azione non può essere annullata.`,confirmLabel:"Elimina"})))try{await Xe(c.id),L("Risorsa eliminata"),B(e)}catch{L("Errore eliminazione risorsa","error")}})),e.querySelectorAll("[data-death-save]").forEach(o=>o.addEventListener("click",async()=>{if(!t||!d)return;const{deathSave:c,deathSaveIndex:p}=o.dataset,m=Number(p);if(!c||!m)return;const w=t.data||{},M=w.death_saves||{},x=Math.max(0,Math.min(3,Number(M[c])||0)),A=m===x?x-1:m,z={successes:Math.max(0,Math.min(3,c==="successes"?A:Number(M.successes)||0)),failures:Math.max(0,Math.min(3,c==="failures"?A:Number(M.failures)||0))};await J(t,{...w,death_saves:z},"Tiri salvezza contro morte aggiornati",()=>B(e))})),e.querySelectorAll("[data-weakness-level]").forEach(o=>o.addEventListener("click",async()=>{if(!t||!d)return;const c=Number(o.dataset.weaknessLevel);if(!c)return;const p=t.data||{},m=p.hp||{},w=Math.max(0,Math.min(6,Number(m.weak_points)||0));await J(t,{...p,hp:{...m,weak_points:c===w?0:c}},"Punti indebolimento aggiornati",()=>B(e))}));const K=e.querySelector(".character-avatar");K&&(K.setAttribute("draggable","false"),K.addEventListener("click",o=>{o.preventDefault(),Ra(t)}),K.addEventListener("contextmenu",o=>{o.preventDefault()}),K.addEventListener("dragstart",o=>{o.preventDefault()})),e.querySelectorAll("[data-item-image]").forEach(o=>{o.setAttribute("draggable","false"),o.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();const p=_==null?void 0:_.find(m=>String(m.id)===o.dataset.itemImage);p&&ye(p)})}),e.querySelectorAll("[data-item-preview]").forEach(o=>{o.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();const p=_==null?void 0:_.find(m=>String(m.id)===o.dataset.itemPreview);p&&ye(p)})})}finally{$e(!1)}}function yt(){je()}function je(){xe||(document.addEventListener("click",async e=>{if(!e.target.closest("[data-actions-fab]"))return;const a=e.target.closest("[data-hp-action]"),i=e.target.closest("[data-money-action]"),u=e.target.closest("[data-rest]"),l=e.target.closest("[data-open-dice]"),n=e.target.closest("[data-add-loot]"),r=e.target.closest("[data-edit-conditions]");if(!a&&!i&&!u&&!l&&!n&&!r)return;e.preventDefault(),at();const b=pe??null;if(a){await ut(a.dataset.hpAction,b);return}if(i){if((window.location.hash.replace("#/","")||"home")==="inventory")return;await st(i.dataset.moneyAction,b);return}if(u){await ct(u.dataset.rest,b);return}if(l){Ke(l.dataset.openDice);return}if(n){await tt();return}r&&await Oe(b)}),xe=!0)}function at(){const e=document.querySelector("[data-actions-fab]"),s=document.querySelector("[data-actions-toggle]");!e||!e.classList.contains("is-open")||(e.classList.remove("is-open"),s==null||s.setAttribute("aria-expanded","false"))}function ae(){const e=Z(),{user:s,offline:a,characters:i,activeCharacterId:u}=e,l=Y(u);return{activeCharacter:i.find(r=>Y(r.id)===l),canEditCharacter:!!s&&!a}}async function Oe(e){const{activeCharacter:s,canEditCharacter:a}=ae();if(!s||!a)return;const i=await Aa(s);if(!i)return;const u=i.getAll("conditions");await J(s,{...s.data,conditions:u},"Condizioni aggiornate",()=>{e&&B(e)})}async function tt(e){const{activeCharacter:s}=ae(),a=Z();if(!s)return;if(a.offline){L("Loot disponibile solo online.","error");return}const u=Pe(s)==="kg"?"0.1":"1",l=await ie({title:"Aggiungi loot rapido",submitLabel:"Aggiungi",content:ua(u),onOpen:({fieldsEl:n})=>{ba(n)}});if(l)try{await ra({user_id:s.user_id,character_id:s.id,name:l.get("name"),qty:Number(l.get("qty")),weight:Number(l.get("weight")),volume:Number(l.get("volume"))||0,value_cp:Number(l.get("value_cp")),category:"loot",equipable:!1,equip_slot:null,equip_slots:[],sovrapponibile:!1,is_magic:!1,max_volume:null}),L("Loot aggiunto")}catch{L("Errore loot","error")}}function fe(e,{min:s=null,max:a=null}={}){if(!(e instanceof HTMLInputElement)||e.type!=="number"||e.closest(".modal-value-stepper"))return;const i=document.createElement("div");i.className="number-stepper modal-value-stepper";const u=document.createElement("button");u.type="button",u.className="number-stepper__button modal-value-stepper__button",u.textContent="−",u.setAttribute("aria-label","Diminuisci valore");const l=document.createElement("button");l.type="button",l.className="number-stepper__button modal-value-stepper__button",l.textContent="+",l.setAttribute("aria-label","Aumenta valore");const n=e.parentNode;if(!n)return;n.insertBefore(i,e),i.append(u,e,l);const r=f=>Number.isFinite(f)?f:0,b=f=>{const g=r(e.valueAsNumber),N=Number(e.step),t=Number.isFinite(N)&&N>0?N:1;let E=g+t*f;const $=s??(e.min!==""?Number(e.min):null),d=a??(e.max!==""?Number(e.max):null);Number.isFinite($)&&(E=Math.max($,E)),Number.isFinite(d)&&(E=Math.min(d,E)),e.value=String(E),e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))};u.addEventListener("click",()=>b(-1)),l.addEventListener("click",()=>b(1))}async function st(e,s){const{activeCharacter:a,canEditCharacter:i}=ae();if(!a)return;if(!i){L("Azioni denaro disponibili solo con profilo online","error");return}const u=Z();let l=u.cache.wallet;if(!l&&!u.offline)try{l=await sa(a.id),re("wallet",l),l&&await ce({wallet:l})}catch{L("Errore caricamento wallet","error")}const b=await ie({title:e==="pay"?"Paga monete":"Ricevi monete",submitLabel:e==="pay"?"Paga":"Ricevi",content:ia({direction:e}),onOpen:({fieldsEl:d})=>{const C=d==null?void 0:d.querySelector('input[name="amount"]');C&&fe(C,{min:0})}});if(!b)return;l||(l={user_id:a.user_id,character_id:a.id,cp:0,sp:0,gp:0,pp:0});const f=b.get("coin"),g=Number(b.get("amount")||0),N={cp:f==="cp"?g:0,sp:f==="sp"?g:0,gp:f==="gp"?g:0,pp:f==="pp"?g:0},t=e==="pay"?-1:1,E=Object.fromEntries(Object.entries(N).map(([d,C])=>[d,C*t])),$=na(l,E);try{const d=await oa({...$,user_id:l.user_id,character_id:l.character_id});await la({user_id:l.user_id,character_id:l.character_id,direction:e,amount:E,reason:b.get("reason"),occurred_on:b.get("occurred_on")}),re("wallet",d),await ce({wallet:d}),L("Wallet aggiornato"),s&&B(s)}catch{L("Errore aggiornamento denaro","error")}}const it=Be.reduce((e,s)=>(e[s.key]=s.label,e),{}),ze={advantage:["invisibile"],disadvantage:["accecato","avvelenato","intralciato","prono","spaventato"]},Te={disadvantage:{dex:["intralciato"]},autoFail:{str:["paralizzato","privo_di_sensi","stordito"],dex:["paralizzato","privo_di_sensi","stordito"]}};function me(e){const s=(e==null?void 0:e.data)||{};return Array.isArray(s.conditions)?s.conditions:s.condition?[s.condition]:[]}function se(e){return e.map(s=>it[s]||s).filter(Boolean)}function nt(e){const s=ze.advantage.filter(i=>e.includes(i)),a=ze.disadvantage.filter(i=>e.includes(i));return s.length&&a.length?{rollMode:null,rollModeReason:null}:s.length?{rollMode:"advantage",rollModeReason:`Vantaggio: condizioni ${se(s).join(", ")}.`}:a.length?{rollMode:"disadvantage",rollModeReason:`Svantaggio: condizioni ${se(a).join(", ")}.`}:{rollMode:null,rollModeReason:null}}function ot(e,s){const i=(Te.autoFail[s]||[]).filter(n=>e.includes(n));if(i.length)return{disabled:!0,disabledReason:`Condizioni: ${se(i).join(", ")}`};const l=(Te.disadvantage[s]||[]).filter(n=>e.includes(n));return l.length?{rollMode:"disadvantage",rollModeReason:`Svantaggio: condizioni ${se(l).join(", ")}.`}:{}}function Ue(e,s=[]){const a=e.data||{},i=a.abilities||{},u=V(a.proficiency_bonus),l=a.skills||{},n=a.skill_mastery||{},b=me(e).includes("avvelenato")?["avvelenato"]:[],f=(s||[]).some(g=>g.category==="armor"&&g.armor_type==="heavy"&&g.equipable&&ee(g).length);return Re.map(g=>{const N=!!l[g.key],t=!!n[g.key],E=ne(i[g.ability],u,N?t?2:1:0),$=E??0,d=g.key==="stealth"&&f,C=[];return b.length&&C.push(`Svantaggio: condizioni ${se(b).join(", ")}.`),d&&C.push("Svantaggio automatico: armatura pesante su Furtività."),{value:g.key,label:`${g.label} (${U(E)})`,shortLabel:g.label,modifier:$,rollMode:C.length?"disadvantage":null,rollModeReason:C.length?C.join(" "):null}})}function Ve(e,s=[]){const a=e.data||{},i=a.abilities||{},u=V(a.proficiency_bonus),n=me(e).includes("avvelenato")?["avvelenato"]:[],r=(s||[]).some(f=>f.category==="armor"&&f.armor_type==="heavy"&&f.equipable&&ee(f).length);return(Array.isArray(a.special_skill_rolls)?a.special_skill_rolls:[]).map((f,g)=>{var k;const N=Q[f.ability]?f.ability:"str",t=!!f.proficient,E=!!f.mastery&&t,$=ne(i[N],u,t?E?2:1:0),d=Number(f.bonus)||0,C=($??0)+d,_=[];n.length&&_.push(`Svantaggio: condizioni ${se(n).join(", ")}.`),N==="dex"&&r&&_.push("Svantaggio automatico: armatura pesante su tiri speciali basati su DES.");const T=((k=f.name)==null?void 0:k.trim())||`Tiro speciale ${g+1}`;return{value:String(f.id??g),label:`${T} (${U(C)})`,shortLabel:T,modifier:C,rollMode:_.length?"disadvantage":null,rollModeReason:_.length?_.join(" "):null}})}function ve(e){const s=e.data||{},a=s.abilities||{},i=V(s.proficiency_bonus),u=s.saving_throws||{},l=me(e);return De.map(n=>{const r=!!u[n.key],b=ne(a[n.key],i,r?1:0),f=b??0,g=ot(l,n.key),N=g.disabled?" · fallimento diretto":"";return{value:n.key,label:`${n.label} (${U(b)})${N}`,shortLabel:Q[n.key]||n.label,modifier:f,rollMode:g.rollMode||null,rollModeReason:g.rollModeReason||null,disabled:g.disabled||!1,disabledReason:g.disabledReason||null}})}function lt(e,s=[]){var T;const a=e.data||{},i=Number(a.attack_bonus_melee??a.attack_bonus)||0,u=Number(a.attack_bonus_ranged??a.attack_bonus)||0,l=(s||[]).filter(k=>k.category==="weapon"&&k.equipable&&ee(k).length),n=V(a.proficiency_bonus)??0,r=a.proficiencies||{},b=me(e),f=nt(b),g=l.map(k=>{var j;const q=k.weapon_range||(k.range_normal?"ranged":"melee"),h=k.attack_ability||(q==="ranged"?"dex":"str"),I=X((j=a.abilities)==null?void 0:j[h])??0,D=(k.weapon_type==="simple"?!!r.weapon_simple:k.weapon_type==="martial"?!!r.weapon_martial:!1)?n:0,S=q==="ranged"?u:i,v=I+D+(Number(k.attack_modifier)||0)+S;return{value:`weapon:${k.id??k.name}`,label:`${k.name} (${U(v)})`,shortLabel:k.name,modifier:v,rollMode:f.rollMode,rollModeReason:f.rollModeReason}}),t=(a.spellcasting||{}).ability,E=t?(T=a.abilities)==null?void 0:T[t]:null,$=X(E),d=$===null||n===null?null:$+n,_=(Array.isArray(a.spells)?a.spells:[]).filter(k=>(k.kind==="cantrip"||Number(k.level)===0)&&k.attack_roll&&k.damage_die);return t&&d!==null&&_.forEach(k=>{g.push({value:`spell:${k.id}`,label:`${k.name} (${U(d)})`,shortLabel:k.name,modifier:d,rollMode:f.rollMode,rollModeReason:f.rollModeReason})}),g}function rt(e){var b;const s=e.data||{},a=V(s.proficiency_bonus),u=(s.spellcasting||{}).ability,l=u?(b=s.abilities)==null?void 0:b[u]:null,n=X(l);if(!u||n===null||a===null)return[];const r=n+a;return[{value:"spell-attack",label:`Incantesimi (${U(r)})`,shortLabel:"Incantesimi",modifier:r}]}function Ke(e){var f,g,N,t,E;const{activeCharacter:s,canEditCharacter:a}=ae(),i=Z().cache.items||[],u=!!((f=s==null?void 0:s.data)!=null&&f.inspiration)&&a,l=Number((N=(g=s==null?void 0:s.data)==null?void 0:g.hp)==null?void 0:N.weak_points)||0,n=u&&s?async()=>{const $=s.data||{};$.inspiration&&await J(s,{...$,inspiration:!1},"Ispirazione consumata",pe?()=>B(pe):null)}:null,b={"saving-throws":{title:"Tiro Salvezza",mode:"d20",rollType:"TS",selection:s?{label:"Tiro salvezza",options:ve(s)}:null},skills:{title:"Tiro Abilità",mode:"d20",rollType:"TA",selection:s?{label:"Abilità",options:Ue(s,i)}:null},"special-skills":{title:"Tiro Abilità Speciale",mode:"d20",rollType:"TA",selection:s?{label:"Abilità speciale",options:Ve(s,i)}:null},"attack-roll":{title:"Tiro per Colpire",mode:"d20",rollType:"TC",selection:s?{label:"Attacco",options:lt(s,i)}:null},"spell-attack":{title:"Tiro per Colpire Incantesimi",mode:"d20",rollType:"TC",selection:s?{label:"Incantesimi",options:rt(s)}:null},roller:{title:"Lancia Dadi generico",mode:"generic",rollType:"GEN"}}[e]??{title:"Lancia dadi",mode:"generic"};if(e==="spell-attack"&&!((E=(t=b.selection)==null?void 0:t.options)!=null&&E.length)){L("Configura abilità da incantatore e bonus competenza per usare questo tiro.","error");return}le({...b,allowInspiration:u,onConsumeInspiration:n,weakPoints:l,characterId:s==null?void 0:s.id})}async function ct(e,s){var u,l;const{activeCharacter:a}=ae();if(!(!a||!await be({title:"Conferma riposo",message:e==="long_rest"?"Stai per effettuare un riposo lungo: risorse, slot e recuperi verranno aggiornati in base alle regole configurate.":"Stai per effettuare un riposo breve: verranno aggiornate solo le risorse che si recuperano con questo tipo di riposo.",confirmLabel:"Conferma riposo"})))try{await Qe(a.id,e),L(e==="long_rest"?"Riposo lungo completato":"Riposo breve completato");const r=await Ie(a.id);re("resources",r),await ce({resources:r});const b=Sa(a.data,e);if(b?await J(a,b,null,s?()=>B(s):null):s&&B(s),e==="long_rest"){const f=Z().characters.find(g=>g.id===a.id);(l=(u=f==null?void 0:f.data)==null?void 0:u.spellcasting)!=null&&l.can_prepare&&await He(f,s?()=>B(s):null)}}catch{L("Errore aggiornamento risorse","error")}}async function dt(e,s){var C,_,T,k,q,h,I,R;const{canEditCharacter:a}=ae();if(!e)return;if(!a){L("Azioni HP disponibili solo con profilo online","error");return}const i=((C=e.data)==null?void 0:C.hit_dice)||{},u=Number(i.used)||0,l=Number(i.max)||0,n=Math.max(l-u,0),r=ge(i.die);if(!r){L("Configura un dado vita valido","error");return}if(n<=0){L("Nessun dado vita disponibile","error");return}const b=X((T=(_=e.data)==null?void 0:_.abilities)==null?void 0:T.con)??0;let f=1;const N=await te({keepOpen:!1,title:`Dado vita • ${i.die||`d${r}`}`,mode:"generic",notation:`1d${r}`,modifier:b,rollType:"GEN",characterId:e.id,historyLabel:"Dado vita",genericDiceMax:n,warning:"Attenzione: ogni dado vita lanciato verrà sottratto ai dadi vita disponibili.",onRollComplete:({diceCount:D})=>{f=Math.max(Number(D)||1,1)}}).waitForRoll;if(!N||N<=0)return;if(f>n){L(`Hai solo ${n} dadi vita disponibili`,"error");return}const t=Number((q=(k=e.data)==null?void 0:k.hp)==null?void 0:q.current)||0,E=(I=(h=e.data)==null?void 0:h.hp)==null?void 0:I.max,$=t+Number(N),d=E!=null?Math.min($,Number(E)):$;await J(e,{...e.data,hp:{...(R=e.data)==null?void 0:R.hp,current:d},hit_dice:{...i,used:Math.min(u+f,l)}},`PF curati +${N} (${f}d${r})`,()=>{s&&B(s)})}async function ut(e,s){var O,K,o,c,p,m,w,M,x,A;const{activeCharacter:a,canEditCharacter:i}=ae();if(!a)return;if(!i){L("Azioni HP disponibili solo con profilo online","error");return}const n=await ie({title:e==="heal"?"Cura PF":"Subisci danno",submitLabel:e==="heal"?"Cura":"Danno",content:pt(a,{allowHitDice:!1,allowTempHp:e==="heal",allowMaxOverride:e==="damage"})});if(!n)return;const r=n.has("use_hit_dice"),b=n.has("temp_hp"),f=((O=a.data)==null?void 0:O.hit_dice)||{},g=((K=a.data)==null?void 0:K.abilities)||{},N=Number(f.used)||0,t=Number(f.max)||0,E=ge(f.die),$=Math.max(Number(n.get("hit_dice_count"))||1,1);let d=Number(n.get("amount"));if(e==="heal"&&r){if(!E){L("Configura un dado vita valido","error");return}if(N>=t){L("Nessun dado vita disponibile","error");return}const z=Math.max(t-N,0);if($>z){L(`Hai solo ${z} dadi vita disponibili`,"error");return}const P=X(g.con)??0,y=Array.from({length:$},()=>ka(E)).reduce((H,G)=>H+G,0);d=Math.max(y+P*$,1)}if(!d||d<=0){L("Inserisci un valore valido","error");return}const C=Number((c=(o=a.data)==null?void 0:o.hp)==null?void 0:c.current)||0,_=Number((m=(p=a.data)==null?void 0:p.hp)==null?void 0:m.temp)||0,T=(M=(w=a.data)==null?void 0:w.hp)==null?void 0:M.max,k=n.get("hp_max_override"),q=k===null||k===""?null:Number(k);if(e==="damage"&&q!==null&&(!Number.isFinite(q)||q<=0)){L("Inserisci un massimo PF valido","error");return}let h=C,I=_;if(e==="heal"&&b)I=_+d;else if(e==="heal")h=C+d;else{const z=Math.min(_,d);I=_-z;const P=d-z;h=Math.max(C-P,0)}const R=q??T,D=R!=null?Math.min(h,Number(R)):h,S=e==="heal"&&r?{...f,used:Math.min(N+$,t)}:f,v=e==="heal"?`${b?"HP temporanei +":"PF curati +"}${d}${r?` (${$}d${E})`:""}`:`Danno ${d}`,j=e==="damage"&&Number(d)>0&&!!((x=a.data)!=null&&x.concentration_active),F=async()=>{var W,y,H;if(s&&B(s),!j)return;const z=ve(a),P=z.find(G=>G.value==="con");!P||P.disabled||le({title:"Tiro salvezza concentrazione • COS",mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:z,value:P.value},allowInspiration:!!((W=a==null?void 0:a.data)!=null&&W.inspiration)&&i,weakPoints:Number((H=(y=a==null?void 0:a.data)==null?void 0:y.hp)==null?void 0:H.weak_points)||0,characterId:a.id,historyLabel:"TS concentrazione"})};await J(a,{...a.data,hp:{...(A=a.data)==null?void 0:A.hp,current:D,temp:I,max:q??T},hit_dice:S},v,F)}function le({title:e,mode:s,selection:a=null,allowInspiration:i=!1,onConsumeInspiration:u=null,rollType:l=null,weakPoints:n=0,characterId:r=null,historyLabel:b=null}){te({keepOpen:!0,title:e,mode:s,selection:a,allowInspiration:i,onConsumeInspiration:u,rollType:l,weakPoints:n,characterId:r,historyLabel:b})}function pt(e,{allowHitDice:s=!0,allowTempHp:a=!1,allowMaxOverride:i=!1}={}){var I,R,D;const u=(S,v={})=>{const j=S==null?void 0:S.querySelector('input[type="number"]');j&&fa(j,v)},l=document.createElement("div");l.className="modal-form-grid hp-shortcut-fields";const n=ue({label:"Valore",name:"amount",type:"number",value:"1"});n.classList.add("hp-shortcut-fields__amount");const r=n.querySelector("input");r&&fe(r,{min:1}),r&&(r.min="1",r.required=!0);const b=document.createElement("div");if(b.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",b.appendChild(n),a){const S=document.createElement("div");S.className="modal-toggle-field",S.innerHTML=`
      <span class="modal-toggle-field__label">HP temporanei</span>
      <label class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="temp_hp" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </label>
    `,b.appendChild(S)}if(l.appendChild(b),!s){if(i){const S=ue({label:"Nuovo massimo PF",name:"hp_max_override",type:"number",value:((R=(I=e==null?void 0:e.data)==null?void 0:I.hp)==null?void 0:R.max)??""});S.classList.add("hp-shortcut-fields__max");const v=S.querySelector("input");v&&(fe(v,{min:1}),v.min="1"),b.appendChild(S)}return l}const f=((D=e==null?void 0:e.data)==null?void 0:D.hit_dice)||{},g=Number(f.used)||0,N=Number(f.max)||0,t=Math.max(N-g,0),E=ge(f.die),$=t>0&&E,d=document.createElement("div");d.className="modal-toggle-field";const C=f.die?`${f.die}`:"dado vita";d.innerHTML=`
    <span class="modal-toggle-field__label">Usa dado vita (${C}) · rimasti ${t}/${N||"-"}</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="use_hit_dice" ${$?"":"disabled"} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const _=document.createElement("label");_.className="field hit-dice-count hp-shortcut-fields__count",_.innerHTML=`
    <span>Numero dadi vita</span>
    <input type="number" name="hit_dice_count" min="1" max="${t}" value="1" />
  `,u(_,{decrementLabel:"Riduci dadi vita",incrementLabel:"Aumenta dadi vita"});const T=document.createElement("div");if(T.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",T.append(d,_),l.appendChild(T),!$){const S=document.createElement("p");S.className="muted",S.textContent="Nessun dado vita disponibile o configurato.",l.appendChild(S)}const k=d.querySelector("input"),q=_.querySelector("input");q&&(q.required=!1);const h=()=>{const S=k==null?void 0:k.checked;r&&(r.disabled=!!S,r.required=!S,S?r.value="":r.value||(r.value="1"),q&&(q.disabled=!S,q.required=!!S,S||(q.value="1")))};return k==null||k.addEventListener("change",h),h(),l}export{yt as bindGlobalFabHandlers,B as renderHome};
