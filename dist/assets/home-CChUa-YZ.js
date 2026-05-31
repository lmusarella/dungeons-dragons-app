import{s as Ee,a as Ae,b as Y,c as Xe,e as ha,R as ve,u as _a,f as Ye,d as he,g as ya,h as Le,i as $a}from"./constants-BTB_YdWW.js";import{c as ka,g as Ze,f as Sa,a as wa,b as Ea,d as Aa,e as La,h as Ma,m as Na,i as Ca,u as xa,j as qa,k as Ra,l as za,n as Ta,o as ke,p as De,q as Da}from"./walletApi-C9L-vyN_.js";import{c as E,o as le,u as ce,a as de,b as Me,g as X,n as ie,d as Se,e as Ne,s as Be,f as Ba,h as Ia,i as ja,j as Fa}from"./index-vKfam6Hr.js";import{openDiceOverlay as pe}from"./dice-CCuFshcZ.js";import{o as Ie}from"./characterDrawer-B3rXJpe3.js";import{n as G,c as ge,f as U,g as se,a as Pa,b as Ha,d as Oa,e as ne,h as ea,s as Va,i as Ua,p as Wa,j as je,k as qe,r as Ka,l as Ga,m as Fe,o as Qa,q as Ja,t as Xa}from"./utils-4CwezGg_.js";import{s as J,o as aa,a as Ya,f as Pe,b as He,c as Za,d as et,e as Oe,g as at,r as tt,h as st,i as it,j as nt,k as Ve,l as ot,m as lt,n as rt}from"./modals-DdvdxfJ2.js";function ct(e,a){return e?`
    <div>
      <p>Non hai ancora un personaggio.</p>
      <div class="button-row">
        <button class="primary" data-create-character>Nuovo personaggio</button>
      </div>
    </div>
  `:`<p class="muted">${a?"Modalità offline attiva: crea un personaggio quando torni online.":"Accedi per creare un personaggio."}</p>`}function dt(e,a,t=[]){const s=e.data||{},r=s.hp||{},l=s.hit_dice||{},n=s.abilities||{},o=G(s.proficiency_bonus),m=!!s.inspiration,f=!!s.concentration_active,g=s.initiative??se(n.dex),y=s.skills||{},i=s.skill_mastery||{},$=Pa(n,o,y,i),S=G(r.current),p=G(r.max),z=G(r.temp),k=s.death_saves||{},_=Math.max(0,Math.min(3,Number(k.successes)||0)),D=Math.max(0,Math.min(3,Number(k.failures)||0)),x=p?Math.min(Math.max(Number(S)/p*100,0),100):0,v=Math.max(0,Number(z)||0),I=Math.max(0,Number(p??S??0)),q=v>0,R=q?100:0,w=q?I:1,h=q?v:0,P=p?`${S??"-"}/${p}`:`${S??"-"}`,j=z??"-",V=Math.max(0,Math.min(6,Number(r.weak_points)||0)),W=Array.isArray(s.conditions)?s.conditions:s.condition?[s.condition]:[],c=Xe.filter(M=>W.includes(M.key)),d=c.length?c.map(M=>M.label).join(", "):"Nessuna condizione",b=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti delle condizioni">?</summary>
      <div class="info-tooltip__panel">
        ${c.length?`
      <ul class="condition-track__list">
        ${c.map(M=>`<li><strong>${M.label}:</strong> ${M.effect}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun effetto attivo.</p>'}
      </div>
    </details>
  `,A=[{value:1,description:"Svantaggio sulle prove di caratteristica."},{value:2,description:"Velocità dimezzata."},{value:3,description:"Svantaggio sui tiri per colpire e tiri salvezza."},{value:4,description:"Punti ferita massimi dimezzati."},{value:5,description:"Velocità ridotta a 0."},{value:6,description:"Morte."}],N=A.filter(M=>M.value<=V),L=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti dei punti indebolimento">?</summary>
      <div class="info-tooltip__panel">
        ${N.length?`
      <ul class="weakness-track__list">
        ${N.map(M=>`<li>${M.description}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun indebolimento.</p>'}
      </div>
    </details>
  `,T=`Livello attuale: ${V}`,H=Ha(s,n,t),Q=[{key:"str",label:Y.str,value:n.str},{key:"dex",label:Y.dex,value:n.dex},{key:"con",label:Y.con,value:n.con},{key:"int",label:Y.int,value:n.int},{key:"wis",label:Y.wis,value:n.wis},{key:"cha",label:Y.cha,value:n.cha}];return`
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
              aria-pressed="${m}"
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
          ${Q.map(M=>{const F=G(M.value),O=F===null?"-":Ua(F);return`
            <div class="stat-card stat-card--${M.key}">
              <span>${M.label}</span>
              <strong>${F??"-"}</strong>
              <span class="stat-card__modifier" aria-label="Modificatore ${M.label}">${O}</span>
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
              <div class="hp-bar" style="flex: ${w};">
                <div class="hp-bar__fill" style="width: ${x}%;"></div>
              </div>
              ${q?`
              <div class="hp-bar hp-bar--temp is-active" style="flex: ${h};">
                <div class="hp-bar__fill hp-bar__fill--temp" style="width: ${R}%;"></div>
              </div>
              `:""}
            </div>
            <div class="hp-panel-hit-dice">
              <span>Dadi vita</span>
              <strong>${Oa(l)}</strong>
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
                ${L}
              </div>
              <div class="weakness-track__group" role="radiogroup" aria-label="Livelli indebolimento">
                ${A.map(M=>{const F=M.value===V;return`
                  <button
                    class="death-save-dot ${F?"is-filled":""}"
                    type="button"
                    role="radio"
                    aria-checked="${F}"
                    data-weakness-level="${M.value}"
                    aria-label="Livello ${M.value}: ${M.description}"
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
                ${Array.from({length:3},(M,F)=>{const O=F+1;return`
                  <button class="death-save-dot ${O<=_?"is-filled":""}" type="button" data-death-save="successes" data-death-save-index="${O}" aria-label="Successi ${O}">
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="death-saves__group" aria-label="Fallimenti">
                <span class="death-saves__tag">✗</span>
                ${Array.from({length:3},(M,F)=>{const O=F+1;return`
                  <button class="death-save-dot ${O<=D?"is-filled":""}" type="button" data-death-save="failures" data-death-save-index="${O}" aria-label="Fallimenti ${O}">
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
        ${ft(e,t,a)}
      </div>
    </div>
  `}function ut(e){const a=e.data||{},t=a.abilities||{},s=G(a.proficiency_bonus),r=a.skills||{},l=a.skill_mastery||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Ae.map(n=>{const o=!!r[n.key],m=!!l[n.key],f=ge(t[n.ability],s,o?m?2:1:0);return`
          <button class="modifier-card modifier-card--interactive ${m?"modifier-card--mastery":o?"modifier-card--proficiency":""}" type="button" data-skill-card="${n.key}" aria-label="Tira abilità ${n.label}">
            <div>
              <div class="modifier-title">
                <strong>${n.label}</strong>
                <span class="modifier-ability modifier-ability--${n.ability}">${Y[n.ability]}</span>
              </div>
            </div>
            <div class="modifier-value">${U(f)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function pt(e){const a=e.data||{},t=a.abilities||{},s=G(a.proficiency_bonus),r=Array.isArray(a.special_skill_rolls)?a.special_skill_rolls:[];return r.length?`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${r.map((l,n)=>{var p;const o=Y[l.ability]?l.ability:"str",m=!!l.proficient,f=!!l.mastery&&m,g=ge(t[o],s,m?f?2:1:0),y=Number(l.bonus)||0,i=(g??0)+y,$=f?"modifier-card--mastery":m?"modifier-card--proficiency":"",S=((p=l.name)==null?void 0:p.trim())||`Tiro speciale ${n+1}`;return`
          <button class="modifier-card modifier-card--interactive ${$}" type="button" data-special-skill-card="${l.id??n}" aria-label="Tira abilità speciale ${S}">
            <div>
              <div class="modifier-title">
                <strong>${S}</strong>
                <span class="modifier-ability modifier-ability--${o}">${Y[o]}</span>
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
    `}function mt(e){const a=e.data||{},t=a.abilities||{},s=G(a.proficiency_bonus),r=a.saving_throws||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Ee.map(l=>{const n=!!r[l.key],o=ge(t[l.key],s,n?1:0);return`
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
  `}function ft(e,a=[],t=!1){const s=e.data||{},r=s.proficiencies||{},l=s.proficiency_notes||"",{tools:n,languages:o}=Wa(l),m=s.language_proficiencies||"",f=je(m),g=s.talents||"",y=je(g),$=[...f,...o].reduce((p,z)=>{const k=z.trim();if(!k)return p;const _=k.toLowerCase();return p.seen.has(_)||(p.seen.add(_),p.values.push(k)),p},{values:[],seen:new Set}).values,S=ha.filter(p=>r[p.key]).map(p=>p.label);return`
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
          ${S.length?`<div class="tag-row">${S.map(p=>`<span class="chip">${p}</span>`).join("")}</div>`:'<p class="muted">Nessuna competenza equipaggiamento.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="tools">
          ${n.length?`<div class="tag-row">${n.map(p=>`<span class="chip">${p}</span>`).join("")}</div>`:'<p class="muted">Aggiungi strumenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="languages">
          ${$.length?`<div class="tag-row">${$.map(p=>`<span class="chip">${p}</span>`).join("")}</div>`:'<p class="muted">Aggiungi lingue conosciute nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="talents">
          ${y.length?`<div class="tag-row">${y.map(p=>`<span class="chip">${p}</span>`).join("")}</div>`:'<p class="muted">Aggiungi talenti nel profilo.</p>'}
        </div>
      </div>
    </div>
  `}function gt(e,a=[],t=!1){const s=(a||[]).filter(o=>ne(o).length),r=(a||[]).filter(o=>o.attunement_active).length,l=ka(a),n=Ze(e);return`
    <section class="card home-card home-section home-scroll-panel">
      <header class="card-header">
        <div>
          <p class="eyebrow">Gestione Equipaggiamento</p>
          <div class="pill-row">
            <span class="pill pill--accent">Oggetti in sintonia: ${r}</span>
            <span class="pill">Carico totale: ${Sa(l,n)}</span>
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
            ${s.map(o=>{const m=wa(o);return`
              <li class="modifier-card attack-card resource-card inventory-item-card">
                <div class="resource-card__badges">
                  ${o.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${m.magic}</span>`:""}
                  ${o.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${m.attunement}</span>`:""}
                </div>
                <div class="attack-card__body resource-card__body">
                  <div class="resource-card__title item-info">
                    ${o.image_url?`<img class="item-avatar" src="${o.image_url}" alt="Foto di ${o.name}" data-item-image="${o.id}" />`:""}
                    <div class="item-info-body">
                      <div class="item-info-line">
                        <button class="item-name-button attack-card__name-button" type="button" data-item-preview="${o.id}" aria-label="Apri anteprima ${o.name}">${o.name}</button>
                        <span class="muted item-meta">
                          ${Ea(o.category)} · ${Aa(ne(o))}
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
  `}function bt(e,a=[]){var x;const t=e.data||{},s=Number(t.attack_bonus_melee??t.attack_bonus)||0,r=Number(t.attack_bonus_ranged??t.attack_bonus)||0,l=Number(t.damage_bonus_melee??t.damage_bonus)||0,n=Number(t.damage_bonus_ranged??t.damage_bonus)||0,o=Number(t.extra_attacks)||0,m=a.filter(v=>v.category==="weapon"&&v.equipable&&ne(v).length),g=(t.spellcasting||{}).ability,y=g?(x=t.abilities)==null?void 0:x[g]:null,i=se(y),$=G(t.proficiency_bonus),S=i===null||$===null?null:i+$,z=(Array.isArray(t.spells)?t.spells:[]).filter(v=>(v.kind==="cantrip"||Number(v.level)===0)&&v.attack_roll&&v.damage_die),k=z.length&&S!==null&&g;if(!m.length&&!k)return'<p class="muted">Nessuna arma equipaggiata.</p>';const _=[];return o>0&&_.push(`Attacco Extra (${o})`),s&&_.push(`Mischia attacco ${U(s)}`),l&&_.push(`Mischia danni ${U(l)}`),r&&_.push(`Distanza attacco ${U(r)}`),n&&_.push(`Distanza danni ${U(n)}`),`
    ${_.length?`<div class="tag-row">${_.map(v=>`<span class="chip">${v}</span>`).join("")}</div>`:""}
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${m.map(v=>{var Te;const I=v.weapon_range||(v.range_normal?"ranged":"melee"),q=v.attack_ability||(I==="ranged"?"dex":"str"),R=se((Te=t.abilities)==null?void 0:Te[q])??0,w=t.proficiencies||{},P=(v.weapon_type==="simple"?!!w.weapon_simple:v.weapon_type==="martial"?!!w.weapon_martial:!1)?G(t.proficiency_bonus)??0:0,j=I==="ranged"?r:s,V=I==="ranged"?n:l,W=R+P+(Number(v.attack_modifier)||0)+j,c=ea(v).filter(ee=>ee.damageDie),d=Number(v.range_normal)||null,u=Number(v.range_disadvantage)||null,b=Number(v.melee_range)||1.5,A=[];I==="melee"&&b>1.5&&A.push(`Portata ${b} m`),I==="melee"&&v.is_thrown&&d&&A.push(`Lancio ${d}${u?`/${u}`:""}`),I!=="melee"&&d&&A.push(`Gittata ${d}${u?`/${u}`:""}`);const N=v.required_ammunition_type||v.ammunition_type,C=v.consumes_ammunition?a.filter(ee=>ee.category!=="container").filter(ee=>N?ee.ammunition_type===N:ee.ammunition_type).reduce((ee,va)=>ee+(Number(va.qty)||0),0):null,L=La.get(N)||"Munizioni",T=C!==null?`${L} ${C}`:"",H=[...A,T].filter(Boolean).join(" · "),Q=q==="dex"?"DES":q==="str"?"FOR":q.toUpperCase(),M=v.id??v.name,F=c.length?c:[{id:"default",label:"",damageDie:null,damageModifier:Number(v.damage_modifier)||0}],O=F.find(ee=>ee.id===v.selected_damage_mode)||F[0],K=R+(Number(O.damageModifier)||0)+V,Z=O.damageDie?`${O.damageDie}${K?` ${U(K)}`:""}`:"-",te=O.id!=="default"?O.label:"",re=te?`Impugnatura: ${te}`:"",ue=`weapon:${M}:${O.id}`,be=F.length>1?`<button class="icon-button icon-button--weapon-mode" data-cycle-weapon-mode="${M}" aria-label="Cambia impugnatura ${v.name}" title="Cambia impugnatura: ${te||O.label}"><span aria-hidden="true">🔁</span></button>`:"";return`
          <div class="modifier-card attack-card" data-roll-attack="weapon:${v.id??v.name}">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${v.name}</strong>
                <span class="modifier-ability modifier-ability--${q}">${Q}</span>
                <span class="attack-card__hit">${U(W)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${Z}</span>
                ${re?`<span class="muted">${re}</span>`:""}
                ${H?`<span class="muted">${H}</span>`:""}
              </div>
            </div>
            <div class="attack-card__actions">
              ${be}
              <button class="icon-button icon-button--fire" data-roll-damage="${ue}" aria-label="Calcola danni ${v.name}${te?` ${te}`:""}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          </div>
        `}).join("")}
        ${k?z.map(v=>{const I=Number(v.damage_modifier)||0,q=`${v.damage_die}${I?` ${U(I)}`:""}`,R=Y[g]??(g==null?void 0:g.toUpperCase()),w=v.range?`Range ${v.range}`:"";return`
            <div class="modifier-card attack-card" data-roll-attack="spell:${v.id}">
              <div class="attack-card__body">
                <div class="attack-card__title">
                  <strong class="attack-card__name">${v.name}</strong>
                  <span class="modifier-ability modifier-ability--${g}">${R}</span>
                  <span class="attack-card__hit">${U(S)}</span>
                </div>
                <div class="attack-card__meta">
                  <span class="attack-card__damage">${q}</span>
                 
                  ${w?`<span class="muted">${w}</span>`:""}
                </div>
              </div>
              <button class="icon-button icon-button--fire" data-roll-damage="spell:${v.id}" aria-label="Calcola danni ${v.name}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          `}).join(""):""}
      </div>
    </div>
  `}function vt(e,a=!1){var w;const t=e.data||{},s=t.spell_notes||"",r=Array.isArray(t.spells)?Va(t.spells):[],l=t.spellcasting||{},n=G(t.proficiency_bonus),o=l.ability,m=o?(w=t.abilities)==null?void 0:w[o]:null,f=se(m),g=f===null||n===null?null:8+f+n,y=f===null||n===null?null:f+n,i=o?Y[o]:null,$=l.slots||{},S=l.slots_max||{},p=l.recharge||"long_rest",k=Array.from({length:9},(h,P)=>P+1).map(h=>{const P=Math.max(0,Number($[h])||0),j=Math.max(P,Number(S[h])||0);return{level:h,count:P,max:j}}).filter(h=>h.max>0),_=[`${i??"-"}`,`CD ${g===null?"-":g}`,`TC ${y===null?"-":U(y)}`],D=_.length?`<div class="tag-row">${_.map(h=>`<span class="chip">${h}</span>`).join("")}</div>`:"",x=r.filter(h=>{if((Number(h.level)||0)<1)return!1;const j=h.prep_state||"known";return j==="prepared"||j==="always"}),v=r.filter(h=>(Number(h.level)||0)===0),I=x.filter(h=>(h.prep_state||"known")==="always"),q=x.filter(h=>(h.prep_state||"known")!=="always"),R=(h,P="")=>{const j=Number(h.level)||0,V=_e(h.cast_time),W=ta(V);return`
      <div class="modifier-card attack-card resource-card spell-prepared-list__card">
        <div class="resource-card__badges spell-card__badges">
          ${h.concentration?'<span class="resource-chip resource-chip--floating resource-chip--concentration">C</span>':""}
          ${h.is_ritual?'<span class="resource-chip resource-chip--floating resource-chip--ritual">R</span>':""}
          ${V?`<span class="resource-chip resource-chip--floating ${W}">${V}</span>`:""}
        </div>
        <button class="spell-prepared-list__item" type="button" data-spell-quick-open="${h.id}">
          <span class="spell-prepared-list__name">${h.name}</span>
          ${j>0?`<span class="chip chip--small">${j}°</span>`:""}
        </button>
        <div class="resource-card-actions spell-card-actions">
          ${j>0?`<button class="resource-cta-button resource-cta-button--label" type="button" data-use-spell="${h.id}">Usa</button>`:""}
          ${a?`
            <button class="resource-action-button resource-icon-button" type="button" data-edit-spell="${h.id}" aria-label="Modifica incantesimo ${h.name}">✏️</button>
            <button class="resource-action-button resource-icon-button" type="button" data-delete-spell="${h.id}" aria-label="Elimina incantesimo ${h.name}">🗑️</button>
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
            ${k.map(h=>{const P=p==="short_rest"?"charge-indicator":"charge-indicator charge-indicator--long",j=Array.from({length:h.max},(V,W)=>{const c=W>=h.count,u=[P,c?"charge-indicator--used":""].filter(Boolean).join(" ");return a&&c?`<button type="button" class="${u}" data-restore-spell-slot="${h.level}" aria-label="Ripristina uno slot di livello ${h.level}"></button>`:a&&!c?`<button type="button" class="${u}" data-consume-spell-slot="${h.level}" aria-label="Consuma uno slot di livello ${h.level}"></button>`:`<span class="${u}"></span>`}).join("");return`
              <div class="spell-slot-row">
                <span class="spell-slot-label">Slot ${h.level}°</span>
                <span class="spell-slot-count">${h.count}</span>
                <div class="spell-slot-charges" aria-hidden="true">${j||'<span class="spell-slot-empty">-</span>'}</div>
              </div>
            `}).join("")}
          </div>
        </div>
        ${s?`<p class="spell-notes">${s}</p>`:""}
      </div>
      <div class="spell-prepared-list">
        <span class="spell-prepared-list__group-title">Trucchetti</span>
        ${v.length?`
          <div class="spell-prepared-list__items">
            ${v.map(h=>R(h)).join("")}
          </div>
        `:'<p class="muted">Nessun trucchetto disponibile.</p>'}
      </div>
      <div class="spell-prepared-list">
       
        ${x.length?`
          <div class="spell-prepared-list__group">
            <span class="spell-prepared-list__group-title">Preparati</span>
            ${q.length?`<div class="spell-prepared-list__items">${q.map(h=>R(h,"Preparato")).join("")}</div>`:'<p class="muted">Nessun incantesimo preparato.</p>'}
          </div>
          <div class="spell-prepared-list__group">
            <span class="spell-prepared-list__group-title">Sempre conosciuti</span>
            ${I.length?`<div class="spell-prepared-list__items">${I.map(h=>R(h,"Sempre preparato")).join("")}</div>`:'<p class="muted">Nessun incantesimo sempre conosciuto.</p>'}
          </div>
        `:'<p class="muted">Nessun incantesimo preparato disponibile.</p>'}
      </div>
    </div>
  `}function _e(e){const a=e==null?void 0:e.toString().trim();if(!a)return"";const t=a.toLowerCase();if(t.includes("bonus"))return"Azione Bonus";if(t.includes("reaz"))return"Reazione";if(t.includes("gratuit"))return"Azione Gratuita";if(t.includes("durata")||t.includes("più")||t.includes("piu")||t.includes("superiore"))return"Durata";if(t.includes("azion"))return"Azione";const s=ve.find(r=>r.label.toLowerCase()===t);return(s==null?void 0:s.label)??""}function Ue(e){if(!e)return ve.length;const a=_e(e),t=ve.findIndex(s=>s.label===a);return t===-1?ve.length:t}function ta(e){var t;if(!e)return"";const a=_e(e);return((t=ve.find(s=>s.label===a))==null?void 0:t.className)??""}function ht(e){return[...e].sort((a,t)=>{const s=Ue(a.cast_time)-Ue(t.cast_time);return s!==0?s:(a.name??"").localeCompare(t.name??"","it",{sensitivity:"base"})})}function We(e,a,{showCharges:t=!0,showUseButton:s=!0,showDescription:r=!1,showCastTime:l=!0}={}){return`
    <ul class="resource-list resource-list--compact">
      ${e.map(n=>`
        <li class="modifier-card attack-card resource-card" data-resource-card="${n.id}">
          ${l&&_e(n.cast_time)?`<span class="resource-chip resource-chip--floating ${ta(n.cast_time)}">${_e(n.cast_time)}</span>`:""}
          <div class="attack-card__body resource-card__body">
            <div class="attack-card__title resource-card__title">
              <strong class="attack-card__name">${n.name}</strong>
            </div>
            ${r?`<p class="resource-card__description">${n.description??""}</p>`:""}
            ${t&&Number(n.max_uses)?`
              <div class="resource-card__charges">
                ${yt(n)}
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
  `}function _t(e,a){if(!e.length)return"<p>Nessuna risorsa.</p>";const t=ht(e),s=t.filter(o=>o.reset_on===null||o.reset_on==="none"),r=t.filter(o=>o.reset_on!==null&&o.reset_on!=="none"),l=r.length?`
      <div class="resource-section resource-section--active">
        <div class="resource-section__body">
          ${We(r,a,{showUseButton:!0})}
        </div>
      </div>
    `:'<p class="muted">Nessuna risorsa attiva.</p>',n=s.length?`
      <div class="resource-section">
        <header class="card-header"><div><p class="eyebrow">Risorse Passive</p></div></header>
        <div class="resource-section__body">
          ${We(s,a,{showCharges:!1,showUseButton:!1,showDescription:!0,showCastTime:!0})}
        </div>
      </div>
    `:"";return`${l}${n}`}function yt(e){const a=Number(e.max_uses)||0,t=Number(e.used)||0;if(!a)return"";const s=e.reset_on==="long_rest"?"long":"short",r=Math.max(a-t,0),l=Array.from({length:a},(n,o)=>{const m=o<t;return`<span class="${["charge-indicator",s==="long"?"charge-indicator--long":"charge-indicator--short",m?"charge-indicator--used":""].filter(Boolean).join(" ")}" aria-hidden="true"></span>`}).join("");return`
    <div class="resource-charge-row" aria-label="Cariche risorsa">
      <span class="resource-charge-label">Cariche</span>
      <span class="resource-charge-count">${r}/${a}</span>
      <div class="resource-charges" aria-hidden="true">${l}</div>
    </div>
  `}let Ke=!1,we=null;function $t(e){return e?{id:`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.id,name:e.name,level:e.level,kind:Number(e.level)===0?"cantrip":"spell",cast_time:e.cast_time,duration:e.duration,range:e.range,components:e.components,concentration:!!e.concentration,attack_roll:!!e.attack_roll,is_ritual:!!e.ritual,damage_die:e.damage_die,damage_modifier:e.damage_modifier,upcast_damage_die:e.upcast_damage_die,upcast_damage_modifier:e.upcast_damage_modifier,upcast_start_level:e.upcast_start_level,description:e.description,rules_version:e.rules_version,prep_state:"known"}:null}function kt(e){const a=(e==null?void 0:e.shared_spell)||{},t=(e==null?void 0:e.custom_spell)||{},s=e!=null&&e.shared_spell_id?a:t;if(!(s!=null&&s.name))return null;const r=Number(s.level)||0;return{id:e.id||`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.shared_spell_id||null,name:s.name,level:r,kind:s.kind||(r===0?"cantrip":"spell"),cast_time:s.cast_time||null,duration:s.duration||null,range:s.range||null,components:s.components||null,concentration:!!s.concentration,attack_roll:!!s.attack_roll,is_ritual:!!(s.ritual??s.is_ritual),damage_die:s.damage_die||null,damage_modifier:s.damage_modifier??null,upcast_damage_die:s.upcast_damage_die||null,upcast_damage_modifier:s.upcast_damage_modifier??null,upcast_start_level:s.upcast_start_level??null,description:s.description||null,school:s.school||null,caster_classes:s.caster_classes||[],rules_version:s.rules_version||null,prep_state:e.prep_state||"known"}}async function St(){var q;const e=["","Abiurazione","Ammaliamento","Divinazione","Evocazione","Illusione","Invocazione","Necromanzia","Trasmutazione"],a=["mago","warlock","stregone","chierico","druido","ranger","artefice","paladino","bardo"],t=document.createElement("div");t.className="modal-form-grid";const s=Se({label:"Cerca incantesimo",name:"spell_query",placeholder:"Es. Palla di fuoco"}),r=s.querySelector("input"),l=document.createElement("label");l.className="field",l.innerHTML="<span>Versione regole</span>";const n=document.createElement("select");n.name="rules_version",[{value:"2024",label:"2024"},{value:"2014",label:"2014"},{value:"Custom",label:"Custom"}].forEach(R=>{const w=document.createElement("option");w.value=R.value,w.textContent=R.label,n.appendChild(w)}),l.appendChild(n);const o=document.createElement("label");o.className="field",o.innerHTML="<span>Scuola</span>";const m=document.createElement("select");m.name="spell_school_filter",e.forEach(R=>{const w=document.createElement("option");w.value=R,w.textContent=R||"Tutte",m.appendChild(w)}),o.appendChild(m);const f=Se({label:"Livello",name:"spell_level_filter",type:"number",value:""}),g=document.createElement("div");g.className="field",g.innerHTML=`<span>Classi</span><div class="tag-row">${a.map(R=>`<label class="chip"><input type="checkbox" name="spell_caster_filter" value="${R}" /> ${R}</label>`).join("")}</div>`;const y=document.createElement("div");y.className="modal-form-row modal-form-row--compact",y.append(f,o,l),t.appendChild(s),t.appendChild(y),t.appendChild(g);const i=document.createElement("label");i.className="field",i.innerHTML="<span>Risultati</span>";const $=document.createElement("select");$.name="shared_spell_id",i.appendChild($);const S=document.createElement("div");S.className="tab-bar",S.innerHTML='<button type="button" class="tab-bar__button" data-prev-page>◀</button><span data-page-label class="muted">Pagina 1</span><button type="button" class="tab-bar__button" data-next-page>▶</button>',t.appendChild(i),t.appendChild(S);let p=1,z=[];const k=S.querySelector("[data-page-label]"),_=S.querySelector("[data-prev-page]"),D=S.querySelector("[data-next-page]"),x=async()=>{var P;const R=Array.from(t.querySelectorAll('input[name="spell_caster_filter"]:checked')).map(j=>j.value),w=await rt({query:(r==null?void 0:r.value)||"",rulesVersion:n.value||"2024",level:((P=t.querySelector('input[name="spell_level_filter"]'))==null?void 0:P.value)||"",school:m.value||"",casterClasses:R,page:p,pageSize:25});if(z=w.items||[],$.innerHTML="",z.forEach(j=>{const V=document.createElement("option");V.value=j.id,V.textContent=`${j.name} (Lv ${j.level})`,$.appendChild(V)}),!z.length){const j=document.createElement("option");j.value="",j.textContent="Nessun risultato",$.appendChild(j)}const h=Math.max(1,Math.ceil((w.total||0)/(w.pageSize||25)));k.textContent=`Pagina ${p} / ${h}`,_.disabled=p<=1,D.disabled=p>=h};r==null||r.addEventListener("input",()=>{p=1,x()}),m.addEventListener("change",()=>{p=1,x()}),n.addEventListener("change",()=>{p=1,x()}),(q=t.querySelector('input[name="spell_level_filter"]'))==null||q.addEventListener("input",()=>{p=1,x()}),t.querySelectorAll('input[name="spell_caster_filter"]').forEach(R=>R.addEventListener("change",()=>{p=1,x()})),_==null||_.addEventListener("click",()=>{p=Math.max(1,p-1),x()}),D==null||D.addEventListener("click",()=>{p+=1,x()}),await x();const v=await le({title:"Seleziona incantesimo condiviso",submitLabel:"Aggiungi",cancelLabel:"Annulla",content:t,cardClass:"modal-card--form"});if(!v)return null;const I=v.get("shared_spell_id");return z.find(R=>R.id===I)||null}function Ge(e){var a,t;return((t=(a=e==null?void 0:e.data)==null?void 0:a.settings)==null?void 0:t.auto_usage_dice)!==!1}function wt(e,a){var t,s;return Xa((s=(t=e==null?void 0:e.data)==null?void 0:t.spellcasting)==null?void 0:s.slots,a)}async function Et(e,a){const t=Math.max(1,Number(a==null?void 0:a.level)||1),s=wt(e,t);if(!s.length)return E("Slot incantesimo esauriti","error"),null;if(s.length===1)return s[0].level;const r=document.createElement("label");r.className="field",r.innerHTML="<span>Seleziona slot da consumare</span>";const l=document.createElement("select");l.name="cast_slot_level",l.className="input",s.forEach(f=>{const g=document.createElement("option");g.value=String(f.level),g.textContent=`${f.level}° livello (${f.available} slot)`,l.appendChild(g)}),r.appendChild(l);const n=document.createElement("div");n.className="modal-form-grid",n.appendChild(r);const o=await le({title:a!=null&&a.name?`Lancia ${a.name}`:"Scegli slot incantesimo",submitLabel:"Conferma",cancelLabel:"Annulla",content:n,cardClass:"modal-card--form"});return o?Math.max(t,Number(o.get("cast_slot_level"))||t):null}async function B(e){var r,l,n,o;we=e;const a=X(),{user:t,offline:s}=a;Be(!0);try{let m=a.characters;if(!s&&t)try{m=await ya(t.id),Ba({characters:m}),await de({characters:m})}catch{E("Errore caricamento personaggi","error")}const f=ie(a.activeCharacterId);!m.some(c=>ie(c.id)===f)&&m.length&&Ia(m[0].id);const y=ie(X().activeCharacterId),i=m.find(c=>ie(c.id)===y),$=!!t&&!s,S=!!t&&!s,p=!!t&&!s;let z=a.cache.resources,k=a.cache.items;if(!s&&i){const[c,d,u]=await Promise.allSettled([Ye(i.id),za(i.id),Pe(i.id)]),b={};if(c.status==="fulfilled"?(z=c.value,ce("resources",z),b.resources=z):E("Errore caricamento risorse","error"),d.status==="fulfilled"?(k=d.value,ce("items",k),b.items=k):E("Errore caricamento equip","error"),u.status==="fulfilled"){const A=(u.value||[]).map(N=>kt(N)).filter(Boolean);if(A.length){const C=[...Array.isArray((r=i.data)==null?void 0:r.spells)?i.data.spells:[]];A.forEach(L=>{C.some(H=>H.shared_spell_id&&H.shared_spell_id===L.shared_spell_id)||C.push(L)}),i.data={...i.data||{},spells:C}}}Object.keys(b).length&&await de(b)}e.innerHTML=`
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
          ${i?mt(i):"<p>Nessun personaggio selezionato.</p>"}
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
            ${i?ut(i):"<p>Nessun personaggio selezionato.</p>"}
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
            ${i?pt(i):"<p>Nessun personaggio selezionato.</p>"}
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
              ${i&&p?`
                <button class="icon-button" data-edit-character aria-label="Modifica personaggio">
                  <span aria-hidden="true">✏️</span>
                </button>
              `:""}
            </div>
          </header>
          ${i?dt(i,p,k):ct($,s)}
        </section>
        ${i?gt(i,k,p):""}
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
            ${i?bt(i,k||[]):"<p>Nessun personaggio selezionato.</p>"}
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
              ${i&&p?`
                <button class="icon-button icon-button--add" data-add-spell aria-label="Aggiungi incantesimo">
                  <span aria-hidden="true">+</span>
                </button>
              `:""}
            </div>
          </header>
          <div class="home-scroll-body">
            ${vt(i,p)}
          </div>
        </section>
        `:""}
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Risorse</p>           
            </div>
            ${i&&S?`
              <button class="icon-button icon-button--add" data-add-resource aria-label="Nuova risorsa">
                <span aria-hidden="true">+</span>
              </button>
            `:""}
          </header>
          <div class="home-scroll-body home-scroll-body--resources">
            ${i?_t(z,S):"<p>Nessun personaggio selezionato.</p>"}
            ${i&&!S?'<p class="muted">Connettiti per aggiungere nuove risorse.</p>':""}
          </div>
        </section>
      </div>
    </div>
  `,sa();const _=e.querySelector("[data-create-character]");_&&_.addEventListener("click",()=>{Ie(t,()=>B(e))});const D=e.querySelector("[data-edit-character]");D&&D.addEventListener("click",()=>{Ie(t,()=>B(e),i)});const x=e.querySelector("[data-add-resource]");x&&x.addEventListener("click",()=>{He(i,()=>B(e))});const v=e.querySelector("[data-add-spell]");v&&v.addEventListener("click",async()=>{var d;if(!i)return;const c=await Za();if(c){if(c==="shared")try{const u=await St();if(!u)return;const b=$t(u),A=Array.isArray((d=i.data)==null?void 0:d.spells)?i.data.spells:[];if(A.some(L=>L.shared_spell_id===u.id)){E("Incantesimo già presente nella scheda personaggio","info");return}i.user_id&&await et({user_id:i.user_id,character_id:i.id,shared_spell_id:u.id,prep_state:b.prep_state});const C={...i.data||{},spells:[...A,b]};await J(i,C,"Incantesimo aggiunto dalla lista condivisa",()=>B(e));return}catch{E("Errore durante l'associazione dell'incantesimo condiviso","error");return}Oe(i,async u=>{if(!u)return B(e);try{await at({created_by:i.user_id,rules_version:u.rules_version||"2024",name:u.name,level:u.level,school:u.school||null,caster_classes:Array.isArray(u.caster_classes)?u.caster_classes:[],cast_time:u.cast_time||null,range:u.range||null,duration:u.duration||null,components:u.components||null,concentration:!!u.concentration,ritual:!!u.is_ritual,attack_roll:!!u.attack_roll,damage_die:u.damage_die||null,damage_modifier:u.damage_modifier??null,upcast_damage_die:u.upcast_damage_die||null,upcast_damage_modifier:u.upcast_damage_modifier??null,upcast_start_level:u.upcast_start_level??null,description:u.description||null})}catch{E("Incantesimo salvato sul personaggio ma non sul catalogo condiviso","info")}B(e)})}}),e.querySelectorAll("[data-edit-spell]").forEach(c=>c.addEventListener("click",()=>{var A;const d=c.dataset.editSpell;if(!d||!i)return;const b=(Array.isArray((A=i.data)==null?void 0:A.spells)?i.data.spells:[]).find(N=>N.id===d);b&&Oe(i,()=>B(e),b)})),e.querySelectorAll("[data-delete-spell]").forEach(c=>c.addEventListener("click",async()=>{var C;const d=c.dataset.deleteSpell;if(!d||!i)return;const u=Array.isArray((C=i.data)==null?void 0:C.spells)?i.data.spells:[],b=u.find(L=>L.id===d);if(!b||!await Me({title:"Conferma eliminazione incantesimo",message:`Stai per eliminare l'incantesimo "${b.name}" dalla scheda del personaggio. Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))return;if(b.shared_spell_id)try{const T=(await Pe(i.id)).find(H=>H.shared_spell_id===b.shared_spell_id);T!=null&&T.id&&await tt(T.id)}catch{E("Errore rimozione associazione incantesimo","error");return}const N={...i.data||{},spells:u.filter(L=>L.id!==b.id)};await J(i,N,"Incantesimo eliminato",()=>B(e))}));const I=e.querySelector("[data-open-prepared-spells]");I&&I.addEventListener("click",()=>{aa(i,()=>B(e))}),e.querySelectorAll("[data-spell-quick-open]").forEach(c=>c.addEventListener("click",()=>{var A;const d=c.dataset.spellQuickOpen;if(!d||!i)return;const b=(Array.isArray((A=i.data)==null?void 0:A.spells)?i.data.spells:[]).find(N=>N.id===d);b&&st(i,b,()=>B(e))}));const q=e.querySelector("[data-show-background]");q&&q.addEventListener("click",()=>{it(i)});const R=e.querySelector("[data-edit-conditions]");R&&R.addEventListener("click",async()=>{await ia(e)}),e.querySelectorAll("[data-proficiency-tabs]").forEach(c=>{var N;const d=Array.from(c.querySelectorAll("[data-proficiency-tab]")),u=Array.from(c.querySelectorAll("[data-proficiency-panel]"));if(!d.length||!u.length)return;const b=C=>{d.forEach(L=>{const T=L.dataset.proficiencyTab===C;L.classList.toggle("is-active",T),L.setAttribute("aria-selected",String(T))}),u.forEach(L=>{L.classList.toggle("is-active",L.dataset.proficiencyPanel===C)})};d.forEach(C=>{C.addEventListener("click",()=>{b(C.dataset.proficiencyTab)})});const A=((N=d.find(C=>C.classList.contains("is-active")))==null?void 0:N.dataset.proficiencyTab)??d[0].dataset.proficiencyTab;A&&b(A)});const w=e.querySelector("[data-add-equip]");w&&i&&p&&w.addEventListener("click",async()=>{var Q;const c=(k||[]).filter(M=>M.equipable&&!ne(M).length);if(!c.length){E("Nessun oggetto equipaggiabile disponibile","error");return}const d=document.createElement("div");d.className="drawer-form";const u=document.createElement("label");u.className="field",u.innerHTML="<span>Oggetto</span>";const b=document.createElement("select");b.name="item_id",c.forEach(M=>{const F=document.createElement("option");F.value=M.id,F.textContent=M.name,b.appendChild(F)}),u.appendChild(b),d.appendChild(u);const A=document.createElement("fieldset");A.className="equip-slot-field",A.innerHTML="<legend>Punti del corpo</legend>";const N=document.createElement("div");N.className="equip-slot-list",Ta.forEach(M=>{const F=document.createElement("label");F.className="checkbox",F.innerHTML=`<input type="checkbox" name="equip_slots" value="${M.value}" /> <span>${M.label}</span>`,N.appendChild(F)}),A.appendChild(N),d.appendChild(A);const C=await le({title:"Equipaggia oggetto",submitLabel:"Equipaggia",content:d});if(!C)return;const L=C.getAll("equip_slots");if(!L.length){E("Seleziona almeno uno slot","error");return}const T=c.find(M=>String(M.id)===C.get("item_id"));if(!T)return;const H=((Q=i.data)==null?void 0:Q.proficiencies)||{};if(T.category==="weapon"){if(!T.weapon_type){E("Definisci il tipo di arma prima di equipaggiarla","error");return}if(!(T.weapon_type==="simple"?!!H.weapon_simple:!!H.weapon_martial)){E("Non hai la competenza per equipaggiare questo oggetto","error");return}}if(T.category==="armor")if(T.is_shield){if(!H.shield){E("Non hai la competenza per equipaggiare questo oggetto","error");return}}else if(T.armor_type){if(!(T.armor_type==="light"?!!H.armor_light:T.armor_type==="medium"?!!H.armor_medium:!!H.armor_heavy)){E("Non hai la competenza per equipaggiare questo oggetto","error");return}}else{E("Definisci il tipo di armatura prima di equipaggiarla","error");return}if(!T.sovrapponibile&&(k||[]).filter(F=>F.id!==T.id).filter(F=>ne(F).some(O=>L.includes(O))).length){E("Uno o più slot selezionati sono già occupati","error");return}try{await ke(T.id,{equip_slot:L[0]||null,equip_slots:L}),E("Equipaggiamento aggiornato"),B(e)}catch{E("Errore aggiornamento equip","error")}}),e.querySelectorAll("[data-unequip]").forEach(c=>c.addEventListener("click",async()=>{const d=(k||[]).find(u=>u.id===c.dataset.unequip);if(d)try{await ke(d.id,{equip_slot:null,equip_slots:[]}),E("Equipaggiamento rimosso"),B(e)}catch{E("Errore aggiornamento equip","error")}}));const h=e.querySelector("[data-toggle-inspiration]");h&&i&&p&&h.addEventListener("click",async()=>{const c=i.data||{},d={...c,inspiration:!c.inspiration};await J(i,d,"Ispirazione aggiornata",()=>B(e))});const P=e.querySelector("[data-toggle-concentration]");P&&i&&p&&P.addEventListener("click",async()=>{const c=i.data||{},d={...c,concentration_active:!c.concentration_active};await J(i,d,"Concentrazione aggiornata",()=>B(e))}),e.querySelectorAll("[data-open-dice]").forEach(c=>c.addEventListener("click",()=>{ba(c.dataset.openDice)})),e.querySelectorAll("[data-saving-throw-card]").forEach(c=>c.addEventListener("click",()=>{var A,N,C;if(!i)return;const d=c.dataset.savingThrowCard;if(!d)return;const u=ze(i),b=u.find(L=>L.value===d);b&&me({title:`Tiro salvezza • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:u,value:b.value},allowInspiration:!!((A=i==null?void 0:i.data)!=null&&A.inspiration)&&p,weakPoints:Number((C=(N=i==null?void 0:i.data)==null?void 0:N.hp)==null?void 0:C.weak_points)||0,characterId:i.id})})),e.querySelectorAll("[data-skill-card]").forEach(c=>c.addEventListener("click",()=>{var A,N,C;if(!i)return;const d=c.dataset.skillCard;if(!d)return;const u=pa(i,k||[]),b=u.find(L=>L.value===d);b&&me({title:`Tiro abilità • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità",options:u,value:b.value},allowInspiration:!!((A=i==null?void 0:i.data)!=null&&A.inspiration)&&p,weakPoints:Number((C=(N=i==null?void 0:i.data)==null?void 0:N.hp)==null?void 0:C.weak_points)||0,characterId:i.id})})),e.querySelectorAll("[data-special-skill-card]").forEach(c=>c.addEventListener("click",()=>{var A,N,C;if(!i)return;const d=c.dataset.specialSkillCard;if(!d)return;const u=ma(i,k||[]),b=u.find(L=>L.value===d);b&&me({title:`Tiro abilità speciale • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità speciale",options:u,value:b.value},allowInspiration:!!((A=i==null?void 0:i.data)!=null&&A.inspiration)&&p,weakPoints:Number((C=(N=i==null?void 0:i.data)==null?void 0:N.hp)==null?void 0:C.weak_points)||0,characterId:i.id})})),e.querySelectorAll("[data-edit-resource]").forEach(c=>c.addEventListener("click",()=>{const d=z.find(u=>u.id===c.dataset.editResource);d&&He(i,()=>B(e),d)})),e.querySelectorAll("[data-roll-hit-dice]").forEach(c=>c.addEventListener("click",async()=>{await Vt(i,e)})),e.querySelectorAll("[data-roll-attack]").forEach(c=>c.addEventListener("click",d=>{d.target.closest("button")||Ht(c.dataset.rollAttack)})),e.querySelectorAll("[data-cycle-weapon-mode]").forEach(c=>c.addEventListener("click",()=>{if(!i)return;const d=c.dataset.cycleWeaponMode,u=k==null?void 0:k.find(L=>String(L.id)===d||L.name===d);if(!u)return;const b=ea(u).filter(L=>L.damageDie);if(b.length<=1)return;const A=u.selected_damage_mode||b[0].id,N=Math.max(b.findIndex(L=>L.id===A),0),C=b[(N+1)%b.length];ke(u.id,{selected_damage_mode:C.id}).then(L=>{const T=(X().cache.items||k||[]).map(H=>String(H.id)===String(u.id)?{...H,...L||{},selected_damage_mode:C.id}:H);return ce("items",T),de({items:T})}).then(()=>{E(`Modalità ${C.label}`),B(e)}).catch(()=>E("Errore cambio modalità arma","error"))})),e.querySelectorAll("[data-roll-damage]").forEach(c=>c.addEventListener("click",()=>{var L,T,H;if(!i)return;const d=c.dataset.rollDamage;if(!d)return;if(d.startsWith("spell:")){const Q=d.replace("spell:",""),F=(Array.isArray((L=i.data)==null?void 0:L.spells)?i.data.spells:[]).find(Z=>Z.id===Q);if(!F)return;const O=Number(F.cast_level??F.level)||0,K=Fe(F,O);if(!K){E("Danno non calcolabile per questo trucchetto.","error");return}pe({keepOpen:!0,title:K.title,mode:"generic",notation:K.notation,modifier:K.modifier,rollType:"DMG",characterId:i==null?void 0:i.id,historyLabel:F.name||null,sneakAttackDice:((T=i==null?void 0:i.data)==null?void 0:T.sneak_attack_dice)||null});return}const u=d.startsWith("weapon:")?d.split(":"):[null,d,"default"],b=u[1]||d,A=u[2]||"default",N=k==null?void 0:k.find(Q=>String(Q.id)===b||Q.name===b);if(!N)return;const C=Qa(i,N,A);if(!C){E("Danno non calcolabile per questa arma.","error");return}pe({keepOpen:!0,title:C.title,mode:"generic",notation:C.notation,modifier:C.modifier,rollType:"DMG",characterId:i==null?void 0:i.id,historyLabel:N.name||null,sneakAttackDice:((H=i==null?void 0:i.data)==null?void 0:H.sneak_attack_dice)||null})}));const j=c=>{var b;const d=(b=c==null?void 0:c.damage_dice_notation)==null?void 0:b.trim();if(!d)return;const u=Ja(d);if(!(u!=null&&u.notation)){E("Notazione dado non valida per questa risorsa","error");return}pe({keepOpen:!0,title:c.name||"Tiro abilità",mode:"generic",notation:u.notation,modifier:Number(c.damage_modifier)||0,rollType:"GEN",characterId:i==null?void 0:i.id,historyLabel:c.name||null})},V=async c=>{const d=Number(c.max_uses)||0;if(!(!d||c.used>=d))try{await Le(c.id,{used:Math.min(c.used+1,d)}),E("Risorsa usata"),Ge(i)&&j(c),B(e)}catch{E("Errore utilizzo risorsa","error")}};e.querySelectorAll("[data-resource-card]").forEach(c=>{const d=async u=>{if(u.target.closest("button"))return;const b=z.find(A=>A.id===c.dataset.resourceCard);b&&nt(b,{onUse:()=>V(b),onReset:async()=>{try{await Le(b.id,{used:0}),E("Risorsa ripristinata"),B(e)}catch{E("Errore ripristino risorsa","error")}},onRecover:async()=>{try{await Le(b.id,{used:Math.max((Number(b.used)||0)-1,0)}),E("Carica recuperata"),B(e)}catch{E("Errore recupero carica","error")}}})};c.addEventListener("click",d)}),e.querySelectorAll("[data-use-resource]").forEach(c=>c.addEventListener("click",async()=>{const d=z.find(u=>u.id===c.dataset.useResource);d&&await V(d)})),e.querySelectorAll("[data-use-spell]").forEach(c=>c.addEventListener("click",async()=>{var H,Q;if(!i)return;const d=c.dataset.useSpell;if(!d)return;const b=(Array.isArray((H=i.data)==null?void 0:H.spells)?i.data.spells:[]).find(M=>M.id===d);if(!b||(Number(b.level)||0)<1)return;const N=await Et(i,b);if(!N||!await Ve(i,N,()=>B(e)))return;const L=X().characters.find(M=>ie(M.id)===ie(i.id))||i;if(b.concentration){const M=L.data||{};M.concentration_active||await J(L,{...M,concentration_active:!0},"Concentrazione attiva",()=>B(e))}if(!Ge(L)){B(e);return}const T=Fe(b,N);if(!T){E("Danno non calcolabile per questo incantesimo.","error");return}pe({keepOpen:!0,title:T.title,mode:"generic",notation:T.notation,modifier:T.modifier,rollType:"DMG",characterId:i.id,historyLabel:b.name||null,sneakAttackDice:((Q=i==null?void 0:i.data)==null?void 0:Q.sneak_attack_dice)||null})})),e.querySelectorAll("[data-consume-spell-slot]").forEach(c=>c.addEventListener("click",async()=>{if(!i)return;const d=Number(c.dataset.consumeSpellSlot);!Number.isFinite(d)||d<1||await Ve(i,d,()=>B(e))})),e.querySelectorAll("[data-restore-spell-slot]").forEach(c=>c.addEventListener("click",async()=>{if(!i)return;const d=Number(c.dataset.restoreSpellSlot);!Number.isFinite(d)||d<1||await ot(i,d,()=>B(e))})),e.querySelectorAll("[data-delete-resource]").forEach(c=>c.addEventListener("click",async()=>{const d=z.find(b=>b.id===c.dataset.deleteResource);if(!(!d||!await Me({title:"Conferma eliminazione risorsa",message:`Stai per eliminare la risorsa "${d.name}". Questa azione non può essere annullata.`,confirmLabel:"Elimina"})))try{await $a(d.id),E("Risorsa eliminata"),B(e)}catch{E("Errore eliminazione risorsa","error")}})),e.querySelectorAll("[data-death-save]").forEach(c=>c.addEventListener("click",async()=>{if(!i||!p)return;const{deathSave:d,deathSaveIndex:u}=c.dataset,b=Number(u);if(!d||!b)return;const A=i.data||{},N=A.death_saves||{},C=Math.max(0,Math.min(3,Number(N[d])||0)),L=b===C?C-1:b,T={successes:Math.max(0,Math.min(3,d==="successes"?L:Number(N.successes)||0)),failures:Math.max(0,Math.min(3,d==="failures"?L:Number(N.failures)||0))};await J(i,{...A,death_saves:T},"Tiri salvezza contro morte aggiornati",()=>B(e))})),e.querySelectorAll("[data-weakness-level]").forEach(c=>c.addEventListener("click",async()=>{if(!i||!p)return;const d=Number(c.dataset.weaknessLevel);if(!d)return;const u=i.data||{},b=u.hp||{},A=Math.max(0,Math.min(6,Number(b.weak_points)||0));await J(i,{...u,hp:{...b,weak_points:d===A?0:d}},"Punti indebolimento aggiornati",()=>B(e))}));const W=e.querySelector(".character-avatar");W&&(W.setAttribute("draggable","false"),W.addEventListener("click",c=>{c.preventDefault(),lt(i)}),W.addEventListener("contextmenu",c=>{c.preventDefault()}),W.addEventListener("dragstart",c=>{c.preventDefault()})),e.querySelectorAll("[data-item-image]").forEach(c=>{c.setAttribute("draggable","false"),c.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const u=k==null?void 0:k.find(b=>String(b.id)===c.dataset.itemImage);u&&De(u)})}),e.querySelectorAll("[data-item-preview]").forEach(c=>{c.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const u=k==null?void 0:k.find(b=>String(b.id)===c.dataset.itemPreview);u&&De(u)})})}finally{Be(!1)}}function es(){sa()}function sa(){Ke||(document.addEventListener("click",async e=>{if(!e.target.closest("[data-actions-fab]"))return;const t=e.target.closest("[data-hp-action]"),s=e.target.closest("[data-money-action]"),r=e.target.closest("[data-rest]"),l=e.target.closest("[data-open-dice]"),n=e.target.closest("[data-add-loot]"),o=e.target.closest("[data-edit-conditions]"),m=e.target.closest("[data-edit-resistances]"),f=e.target.closest("[data-edit-roll-adjustments]");if(!t&&!s&&!r&&!l&&!n&&!o&&!m&&!f)return;e.preventDefault(),At();const g=we??null;if(t){await Ut(t.dataset.hpAction,g);return}if(s){if((window.location.hash.replace("#/","")||"home")==="inventory")return;await Tt(s.dataset.moneyAction,g);return}if(r){await Ot(r.dataset.rest,g);return}if(l){ba(l.dataset.openDice);return}if(n){await zt();return}if(o){await ia(g);return}if(m){await Rt(g);return}f&&await Ct(g)}),Ke=!0)}function At(){const e=document.querySelector("[data-actions-fab]"),a=document.querySelector("[data-actions-toggle]");!e||!e.classList.contains("is-open")||(e.classList.remove("is-open"),a==null||a.setAttribute("aria-expanded","false"))}function ae(){const e=X(),{user:a,offline:t,characters:s,activeCharacterId:r}=e,l=ie(r);return{activeCharacter:s.find(o=>ie(o.id)===l),canEditCharacter:!!a&&!t}}async function ia(e){const{activeCharacter:a,canEditCharacter:t}=ae();if(!a||!t)return;const s=await Ya(a);if(!s)return;const r=s.getAll("conditions");await J(a,{...a.data,conditions:r},"Condizioni aggiornate",()=>{e&&B(e)})}function Lt(e){var t;const a=((t=e==null?void 0:e.data)==null?void 0:t.roll_adjustments)||{};return{attack_rolls:a.attack_rolls||{},saving_throws:a.saving_throws||{},skills:a.skills||{}}}function Mt(e){const a=Lt(e),t=X().cache.items||[],s=document.createElement("div");s.className="modal-form-grid compact-settings-form compact-settings-form--rolls";const r=[{value:"",label:"Nessuno"},{value:"advantage",label:"Vantaggio"},{value:"disadvantage",label:"Svantaggio"}],l=(n,o,m)=>{const f=document.createElement("section");f.className="character-edit-section compact-settings-section",f.innerHTML=`<h4>${n}</h4><p class="muted compact-settings-help">Indica solo gli override manuali; gli effetti automatici restano visibili sotto la riga.</p>`;const g=document.createElement("div");g.className="compact-setting-grid compact-setting-grid--roll",m.forEach(y=>{var w;const i=((w=a[o])==null?void 0:w[y.key])||{},$=da(e,t,o,y),S=oe($).rollMode||"",p=$.length===1&&$[0].source||"",z=i.mode||S,k=i.source||p,_=document.createElement("div");_.className="compact-setting-row compact-setting-row--roll";const D=document.createElement("label");D.className="field compact-setting-field";const x=document.createElement("span");x.textContent=y.label;const v=Ne(r,z);v.name=`roll_${o}_${y.key}_mode`,D.append(x,v);const I=document.createElement("label");I.className="field compact-setting-field";const q=document.createElement("span");q.textContent="Fonte manuale";const R=Ne(na,k);if(R.name=`roll_${o}_${y.key}_source`,I.append(q,R),_.append(D,I),$.length){const h=document.createElement("p");h.className="muted compact-setting-note",h.textContent=`Automatico: ${$.map(P=>P.reason).join(" ")}`,_.appendChild(h)}g.appendChild(_)}),f.appendChild(g),s.appendChild(f)};return l("Tiri per colpire","attack_rolls",la(e,t)),l("Tiri salvezza","saving_throws",Ee),l("Abilità","skills",Ae),s}function Nt(e,a){const t=X().cache.items||[],s={attack_rolls:{},saving_throws:{},skills:{}};return[{scope:"attack_rolls",entries:la(a,t)},{scope:"saving_throws",entries:Ee},{scope:"skills",entries:Ae}].forEach(({scope:r,entries:l})=>{l.forEach(n=>{var $,S;const o=(($=e.get(`roll_${r}_${n.key}_mode`))==null?void 0:$.toString())||"",m=((S=e.get(`roll_${r}_${n.key}_source`))==null?void 0:S.toString().trim())||"",f=da(a,t,r,n),g=oe(f).rollMode||"",y=f.length===1&&f[0].source||"";(o==="advantage"||o==="disadvantage")&&!(o===g&&m===y)&&(s[r][n.key]={mode:o,source:m})})}),s}async function Ct(e){const{activeCharacter:a,canEditCharacter:t}=ae();if(!a||!t)return;const s=await le({title:"Vantaggi / Svantaggi situazionali",submitLabel:"Salva",content:Mt(a),cardClass:"modal-card--wide"});s&&await J(a,{...a.data,roll_adjustments:Nt(s,a)},"Vantaggi/svantaggi aggiornati",()=>{e&&B(e)})}function xt(e){var r;const a=((r=e==null?void 0:e.data)==null?void 0:r.damage_defenses)||{},t=he.reduce((l,n)=>{const o=n.group||"Altro";return l[o]||(l[o]=[]),l[o].push(n),l},{}),s=document.createElement("div");return s.className="modal-form-grid compact-settings-form compact-settings-form--defenses",s.innerHTML=Object.entries(t).map(([l,n])=>`
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
  `).join(""),s}function qt(e){return{resistances:he.filter(a=>e.has(`damage_resistance_${a.key}`)).map(a=>a.key),immunities:he.filter(a=>e.has(`damage_immunity_${a.key}`)).map(a=>a.key)}}async function Rt(e){const{activeCharacter:a,canEditCharacter:t}=ae();if(!a||!t)return;const s=await le({title:"Resistenze & Immunità",submitLabel:"Salva",content:xt(a),cardClass:"modal-card--wide"});s&&await J(a,{...a.data,damage_defenses:qt(s)},"Resistenze aggiornate",()=>{e&&B(e)})}async function zt(e){const{activeCharacter:a}=ae(),t=X();if(!a)return;if(t.offline){E("Loot disponibile solo online.","error");return}const r=Ze(a)==="kg"?"0.1":"1",l=await le({title:"Aggiungi loot rapido",submitLabel:"Aggiungi",content:Da(r),onOpen:({fieldsEl:n})=>{ja(n)}});if(l)try{await Ra({user_id:a.user_id,character_id:a.id,name:l.get("name"),qty:Number(l.get("qty")),weight:Number(l.get("weight")),volume:Number(l.get("volume"))||0,value_cp:Number(l.get("value_cp")),category:"loot",equipable:!1,equip_slot:null,equip_slots:[],sovrapponibile:!1,is_magic:!1,max_volume:null}),E("Loot aggiunto")}catch{E("Errore loot","error")}}function Ce(e,{min:a=null,max:t=null}={}){if(!(e instanceof HTMLInputElement)||e.type!=="number"||e.closest(".modal-value-stepper"))return;const s=document.createElement("div");s.className="number-stepper modal-value-stepper";const r=document.createElement("button");r.type="button",r.className="number-stepper__button modal-value-stepper__button",r.textContent="−",r.setAttribute("aria-label","Diminuisci valore");const l=document.createElement("button");l.type="button",l.className="number-stepper__button modal-value-stepper__button",l.textContent="+",l.setAttribute("aria-label","Aumenta valore");const n=e.parentNode;if(!n)return;n.insertBefore(s,e),s.append(r,e,l);const o=f=>Number.isFinite(f)?f:0,m=f=>{const g=o(e.valueAsNumber),y=Number(e.step),i=Number.isFinite(y)&&y>0?y:1;let $=g+i*f;const S=a??(e.min!==""?Number(e.min):null),p=t??(e.max!==""?Number(e.max):null);Number.isFinite(S)&&($=Math.max(S,$)),Number.isFinite(p)&&($=Math.min(p,$)),e.value=String($),e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))};r.addEventListener("click",()=>m(-1)),l.addEventListener("click",()=>m(1))}async function Tt(e,a){const{activeCharacter:t,canEditCharacter:s}=ae();if(!t)return;if(!s){E("Azioni denaro disponibili solo con profilo online","error");return}const r=X();let l=r.cache.wallet;if(!l&&!r.offline)try{l=await Ma(t.id),ce("wallet",l),l&&await de({wallet:l})}catch{E("Errore caricamento wallet","error")}const m=await le({title:e==="pay"?"Paga monete":"Ricevi monete",submitLabel:e==="pay"?"Paga":"Ricevi",content:Na({direction:e}),onOpen:({fieldsEl:p})=>{const z=p==null?void 0:p.querySelector('input[name="amount"]');z&&Ce(z,{min:0})}});if(!m)return;l||(l={user_id:t.user_id,character_id:t.id,cp:0,sp:0,gp:0,pp:0});const f=m.get("coin"),g=Number(m.get("amount")||0),y={cp:f==="cp"?g:0,sp:f==="sp"?g:0,gp:f==="gp"?g:0,pp:f==="pp"?g:0},i=e==="pay"?-1:1,$=Object.fromEntries(Object.entries(y).map(([p,z])=>[p,z*i])),S=Ca(l,$);try{const p=await xa({...S,user_id:l.user_id,character_id:l.character_id});await qa({user_id:l.user_id,character_id:l.character_id,direction:e,amount:$,reason:m.get("reason"),occurred_on:m.get("occurred_on")}),ce("wallet",p),await de({wallet:p}),E("Wallet aggiornato"),a&&B(a)}catch{E("Errore aggiornamento denaro","error")}}const Dt=Xe.reduce((e,a)=>(e[a.key]=a.label,e),{}),Qe={advantage:["invisibile"],disadvantage:["accecato","avvelenato","intralciato","prono","spaventato"]},Je={disadvantage:{dex:["intralciato"]},autoFail:{str:["paralizzato","privo_di_sensi","stordito"],dex:["paralizzato","privo_di_sensi","stordito"]}},na=[{value:"",label:"Seleziona fonte"},{value:"situational",label:"Situazionale"},{value:"effect",label:"Effetto temporaneo"},{value:"condition",label:"Condizione"},{value:"armor",label:"Armatura"},{value:"racial",label:"Abilità razziale"},{value:"class",label:"Privilegio di classe"},{value:"spell",label:"Incantesimo"},{value:"item",label:"Oggetto magico/equipaggiamento"},{value:"other",label:"Altro"}];function $e(e){const a=(e==null?void 0:e.data)||{};return Array.isArray(a.conditions)?a.conditions:a.condition?[a.condition]:[]}function fe(e){return e.map(a=>Dt[a]||a).filter(Boolean)}function oa(e=[]){return(e||[]).some(a=>a.category==="armor"&&a.armor_type==="heavy"&&a.equipable&&ne(a).length)}function la(e,a=[]){const t=(e==null?void 0:e.data)||{},r=(a||[]).filter(g=>g.category==="weapon"&&g.equipable&&ne(g).length).map(g=>({key:`weapon:${g.id??g.name}`,label:g.name||"Arma"})),n=(Array.isArray(t.spells)?t.spells:[]).filter(g=>(g.kind==="cantrip"||Number(g.level)===0)&&g.attack_roll&&g.damage_die).map(g=>({key:`spell:${g.id}`,label:g.name||"Incantesimo"})),f=!!((t.spellcasting||{}).ability&&G(t.proficiency_bonus)!==null)?[{key:"spell-attack",label:"Incantesimi"}]:[];return[...r,...n,...f]}function Re(e){const a=$e(e),t=Qe.advantage.filter(l=>a.includes(l)),s=Qe.disadvantage.filter(l=>a.includes(l)),r=[];return t.length&&r.push({mode:"advantage",source:"condition",reason:`Vantaggio: condizioni ${fe(t).join(", ")}.`}),s.length&&r.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${fe(s).join(", ")}.`}),r}function ra(e,a,t){const r=$e(e).includes("avvelenato")?["avvelenato"]:[],l=oa(a),n=[];return r.length&&n.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${fe(r).join(", ")}.`}),t.key==="stealth"&&l&&n.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su Furtività."}),n}function Bt(e,a,t){const r=$e(e).includes("avvelenato")?["avvelenato"]:[],l=oa(a),n=[];return r.length&&n.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${fe(r).join(", ")}.`}),t==="dex"&&l&&n.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su tiri speciali basati su DES."}),n}function ca(e,a){const t=ua($e(e),a.key);return t.rollMode?[{mode:t.rollMode,source:"condition",reason:t.rollModeReason}]:[]}function da(e,a,t,s){return t==="attack_rolls"?Re(e):t==="skills"?ra(e,a,s):t==="saving_throws"?ca(e,s):[]}function It(e){var a;return((a=na.find(t=>t.value===e))==null?void 0:a.label)||e}function ye(e,a,t,s){var m,f,g,y;const r=(g=(f=(m=e==null?void 0:e.data)==null?void 0:m.roll_adjustments)==null?void 0:f[a])==null?void 0:g[t];if(!r||r.mode!=="advantage"&&r.mode!=="disadvantage")return null;const l=r.mode==="advantage"?"Vantaggio":"Svantaggio",n=(y=r.source)==null?void 0:y.toString().trim(),o=n?It(n):"Situazionale";return{mode:r.mode,reason:`${l}: ${s} (${o}).`}}function oe(e){const a=e.filter(Boolean),t=a.filter(r=>r.mode==="advantage").map(r=>r.reason).filter(Boolean),s=a.filter(r=>r.mode==="disadvantage").map(r=>r.reason).filter(Boolean);return t.length&&s.length?{rollMode:null,rollModeReason:`Vantaggio e svantaggio si annullano. ${[...t,...s].join(" ")}`}:t.length?{rollMode:"advantage",rollModeReason:t.join(" ")}:s.length?{rollMode:"disadvantage",rollModeReason:s.join(" ")}:{rollMode:null,rollModeReason:null}}function ua(e,a){const s=(Je.autoFail[a]||[]).filter(n=>e.includes(n));if(s.length)return{disabled:!0,disabledReason:`Condizioni: ${fe(s).join(", ")}`};const l=(Je.disadvantage[a]||[]).filter(n=>e.includes(n));return l.length?{rollMode:"disadvantage",rollModeReason:`Svantaggio: condizioni ${fe(l).join(", ")}.`}:{}}function pa(e,a=[]){const t=e.data||{},s=t.abilities||{},r=G(t.proficiency_bonus),l=t.skills||{},n=t.skill_mastery||{};return Ae.map(o=>{const m=!!l[o.key],f=!!n[o.key],g=ge(s[o.ability],r,m?f?2:1:0),y=g??0,i=ra(e,a,o);i.push(ye(e,"skills",o.key,o.label));const $=oe(i);return{value:o.key,label:`${o.label} (${U(g)})`,shortLabel:o.label,modifier:y,rollMode:$.rollMode,rollModeReason:$.rollModeReason}})}function ma(e,a=[]){const t=e.data||{},s=t.abilities||{},r=G(t.proficiency_bonus);return(Array.isArray(t.special_skill_rolls)?t.special_skill_rolls:[]).map((n,o)=>{var k;const m=Y[n.ability]?n.ability:"str",f=!!n.proficient,g=!!n.mastery&&f,y=ge(s[m],r,f?g?2:1:0),i=Number(n.bonus)||0,$=(y??0)+i,S=((k=n.name)==null?void 0:k.trim())||`Tiro speciale ${o+1}`,p=Bt(e,a,m),z=oe(p);return{value:String(n.id??o),label:`${S} (${U($)})`,shortLabel:S,modifier:$,rollMode:z.rollMode,rollModeReason:z.rollModeReason}})}function ze(e){const a=e.data||{},t=a.abilities||{},s=G(a.proficiency_bonus),r=a.saving_throws||{},l=$e(e);return Ee.map(n=>{const o=!!r[n.key],m=ge(t[n.key],s,o?1:0),f=m??0,g=ua(l,n.key),y=ye(e,"saving_throws",n.key,n.label),i=g.disabled?{rollMode:null,rollModeReason:null}:oe([...ca(e,n),y]),$=g.disabled?" · fallimento diretto":"";return{value:n.key,label:`${n.label} (${U(m)})${$}`,shortLabel:Y[n.key]||n.label,modifier:f,rollMode:i.rollMode,rollModeReason:i.rollModeReason,disabled:g.disabled||!1,disabledReason:g.disabledReason||null}})}function fa(e,a=[]){var k;const t=e.data||{},s=Number(t.attack_bonus_melee??t.attack_bonus)||0,r=Number(t.attack_bonus_ranged??t.attack_bonus)||0,l=(a||[]).filter(_=>_.category==="weapon"&&_.equipable&&ne(_).length),n=G(t.proficiency_bonus)??0,o=t.proficiencies||{},m=Re(e),f=l.map(_=>{var j;const D=_.weapon_range||(_.range_normal?"ranged":"melee"),x=_.attack_ability||(D==="ranged"?"dex":"str"),v=se((j=t.abilities)==null?void 0:j[x])??0,q=(_.weapon_type==="simple"?!!o.weapon_simple:_.weapon_type==="martial"?!!o.weapon_martial:!1)?n:0,R=D==="ranged"?r:s,w=v+q+(Number(_.attack_modifier)||0)+R,h=`weapon:${_.id??_.name}`,P=oe([...m,ye(e,"attack_rolls",h,_.name)]);return{value:h,label:`${_.name} (${U(w)})`,shortLabel:_.name,modifier:w,rollMode:P.rollMode,rollModeReason:P.rollModeReason}}),y=(t.spellcasting||{}).ability,i=y?(k=t.abilities)==null?void 0:k[y]:null,$=se(i),S=$===null||n===null?null:$+n,z=(Array.isArray(t.spells)?t.spells:[]).filter(_=>(_.kind==="cantrip"||Number(_.level)===0)&&_.attack_roll&&_.damage_die);return y&&S!==null&&z.forEach(_=>{const D=`spell:${_.id}`,x=oe([...m,ye(e,"attack_rolls",D,_.name)]);f.push({value:D,label:`${_.name} (${U(S)})`,shortLabel:_.name,modifier:S,rollMode:x.rollMode,rollModeReason:x.rollModeReason})}),f}function jt(e){var g;const a=e.data||{},t=G(a.proficiency_bonus),r=(a.spellcasting||{}).ability,l=r?(g=a.abilities)==null?void 0:g[r]:null,n=se(l);if(!r||n===null||t===null)return[];const o=n+t,m="spell-attack",f=oe([...Re(e),ye(e,"attack_rolls",m,"Incantesimi")]);return[{value:m,label:`Incantesimi (${U(o)})`,shortLabel:"Incantesimi",modifier:o,rollMode:f.rollMode,rollModeReason:f.rollModeReason}]}function xe(e){var a;return((a=he.find(t=>t.key===e))==null?void 0:a.label)||e}function Ft(e,a,t){var o;const s=Math.max(Number(a)||0,0);if(!t)return{amount:s,reason:null};const r=((o=e==null?void 0:e.data)==null?void 0:o.damage_defenses)||{},l=Array.isArray(r.resistances)?r.resistances:[],n=Array.isArray(r.immunities)?r.immunities:[];return n.includes("all")||n.includes(t)?{amount:0,reason:`immunità a ${xe(t)}`}:l.includes("all")||l.includes(t)?{amount:Math.floor(s/2),reason:`resistenza a ${xe(t)}`}:{amount:s,reason:null}}function ga(e,a){if(!(a!=null&&a.consumes_ammunition))return null;const t=a.required_ammunition_type||a.ammunition_type;return(e||[]).filter(s=>s.id!==a.id).filter(s=>s.category!=="container").filter(s=>!t||s.ammunition_type===t).filter(s=>Number(s.qty)>0).sort((s,r)=>String(s.name||"").localeCompare(String(r.name||""),"it",{sensitivity:"base"}))[0]||null}async function Pt(e,a){const t=ga(e,a);if(!t)return!1;const s=Math.max((Number(t.qty)||0)-1,0),r=await ke(t.id,{qty:s}),n=(X().cache.items||[]).map(o=>String(o.id)===String(t.id)?{...o,...r||{},qty:s}:o);return ce("items",n),await de({items:n}),E(`${t.name} consumato (${s} rimasti)`),!0}function Ht(e){var f,g,y;const{activeCharacter:a,canEditCharacter:t}=ae();if(!a||!e)return;const s=X().cache.items||[],r=fa(a,s),l=r.find(i=>i.value===e);if(!l)return;const n=e.startsWith("weapon:")?e.replace("weapon:",""):null,o=n?s.find(i=>String(i.id)===n||i.name===n):null;if(o!=null&&o.consumes_ammunition&&!ga(s,o)){E("Munizioni esaurite o non disponibili per questa arma.","error");return}let m=!1;me({title:`Tiro per Colpire • ${l.shortLabel||l.label}`,mode:"d20",rollType:"TC",selection:{label:"Attacco",options:r,value:l.value},allowInspiration:!!((f=a==null?void 0:a.data)!=null&&f.inspiration)&&t,weakPoints:Number((y=(g=a==null?void 0:a.data)==null?void 0:g.hp)==null?void 0:y.weak_points)||0,characterId:a.id,historyLabel:l.shortLabel||l.label,onRollComplete:async()=>{if(!(!(o!=null&&o.consumes_ammunition)||m)){m=!0;try{await Pt(X().cache.items||s,o)}catch{E("Errore consumo munizioni","error")}}}})}function ba(e){var f,g,y,i,$;const{activeCharacter:a,canEditCharacter:t}=ae(),s=X().cache.items||[],r=!!((f=a==null?void 0:a.data)!=null&&f.inspiration)&&t,l=Number((y=(g=a==null?void 0:a.data)==null?void 0:g.hp)==null?void 0:y.weak_points)||0,n=r&&a?async()=>{const S=a.data||{};S.inspiration&&await J(a,{...S,inspiration:!1},"Ispirazione consumata",we?()=>B(we):null)}:null,m={"saving-throws":{title:"Tiro Salvezza",mode:"d20",rollType:"TS",selection:a?{label:"Tiro salvezza",options:ze(a)}:null},skills:{title:"Tiro Abilità",mode:"d20",rollType:"TA",selection:a?{label:"Abilità",options:pa(a,s)}:null},"special-skills":{title:"Tiro Abilità Speciale",mode:"d20",rollType:"TA",selection:a?{label:"Abilità speciale",options:ma(a,s)}:null},"attack-roll":{title:"Tiro per Colpire",mode:"d20",rollType:"TC",selection:a?{label:"Attacco",options:fa(a,s)}:null},"spell-attack":{title:"Tiro per Colpire Incantesimi",mode:"d20",rollType:"TC",selection:a?{label:"Incantesimi",options:jt(a)}:null},roller:{title:"Lancia Dadi generico",mode:"generic",rollType:"GEN"}}[e]??{title:"Lancia dadi",mode:"generic"};if(e==="spell-attack"&&!(($=(i=m.selection)==null?void 0:i.options)!=null&&$.length)){E("Configura abilità da incantatore e bonus competenza per usare questo tiro.","error");return}me({...m,allowInspiration:r,onConsumeInspiration:n,weakPoints:l,characterId:a==null?void 0:a.id})}async function Ot(e,a){var r,l;const{activeCharacter:t}=ae();if(!(!t||!await Me({title:"Conferma riposo",message:e==="long_rest"?"Stai per effettuare un riposo lungo: risorse, slot e recuperi verranno aggiornati in base alle regole configurate.":"Stai per effettuare un riposo breve: verranno aggiornate solo le risorse che si recuperano con questo tipo di riposo.",confirmLabel:"Conferma riposo"})))try{await _a(t.id,e),E(e==="long_rest"?"Riposo lungo completato":"Riposo breve completato");const o=await Ye(t.id);ce("resources",o),await de({resources:o});const m=Ga(t.data,e);if(m?await J(t,m,null,a?()=>B(a):null):a&&B(a),e==="long_rest"){const f=X().characters.find(g=>g.id===t.id);(l=(r=f==null?void 0:f.data)==null?void 0:r.spellcasting)!=null&&l.can_prepare&&await aa(f,a?()=>B(a):null)}}catch{E("Errore aggiornamento risorse","error")}}async function Vt(e,a){var z,k,_,D,x,v,I,q;const{canEditCharacter:t}=ae();if(!e)return;if(!t){E("Azioni HP disponibili solo con profilo online","error");return}const s=((z=e.data)==null?void 0:z.hit_dice)||{},r=Number(s.used)||0,l=Number(s.max)||0,n=Math.max(l-r,0),o=qe(s.die);if(!o){E("Configura un dado vita valido","error");return}if(n<=0){E("Nessun dado vita disponibile","error");return}const m=se((_=(k=e.data)==null?void 0:k.abilities)==null?void 0:_.con)??0;let f=1;const y=await pe({keepOpen:!1,title:`Dado vita • ${s.die||`d${o}`}`,mode:"generic",notation:`1d${o}`,modifier:m,rollType:"GEN",characterId:e.id,historyLabel:"Dado vita",genericDiceMax:n,warning:"Attenzione: ogni dado vita lanciato verrà sottratto ai dadi vita disponibili.",onRollComplete:({diceCount:R})=>{f=Math.max(Number(R)||1,1)}}).waitForRoll;if(!y||y<=0)return;if(f>n){E(`Hai solo ${n} dadi vita disponibili`,"error");return}const i=Number((x=(D=e.data)==null?void 0:D.hp)==null?void 0:x.current)||0,$=(I=(v=e.data)==null?void 0:v.hp)==null?void 0:I.max,S=i+Number(y),p=$!=null?Math.min(S,Number($)):S;await J(e,{...e.data,hp:{...(q=e.data)==null?void 0:q.hp,current:p},hit_dice:{...s,used:Math.min(r+f,l)}},`PF curati +${y} (${f}d${o})`,()=>{a&&B(a)})}async function Ut(e,a){var b,A,N,C,L,T,H,Q,M,F,O;const{activeCharacter:t,canEditCharacter:s}=ae();if(!t)return;if(!s){E("Azioni HP disponibili solo con profilo online","error");return}const n=await le({title:e==="heal"?"Cura PF":"Subisci danno",submitLabel:e==="heal"?"Cura":"Danno",content:Wt(t,{allowHitDice:!1,allowTempHp:e==="heal",allowMaxOverride:e==="damage"})});if(!n)return;const o=n.has("use_hit_dice"),m=n.has("temp_hp"),f=((b=t.data)==null?void 0:b.hit_dice)||{},g=((A=t.data)==null?void 0:A.abilities)||{},y=Number(f.used)||0,i=Number(f.max)||0,$=qe(f.die),S=Math.max(Number(n.get("hit_dice_count"))||1,1);let p=Number(n.get("amount"));const z=p,k=e==="damage"&&((N=n.get("damage_type"))==null?void 0:N.toString())||"";if(e==="heal"&&o){if(!$){E("Configura un dado vita valido","error");return}if(y>=i){E("Nessun dado vita disponibile","error");return}const K=Math.max(i-y,0);if(S>K){E(`Hai solo ${K} dadi vita disponibili`,"error");return}const Z=se(g.con)??0,re=Array.from({length:S},()=>Ka($)).reduce((ue,be)=>ue+be,0);p=Math.max(re+Z*S,1)}if(!p||p<=0){E("Inserisci un valore valido","error");return}const _=e==="damage"?Ft(t,p,k):{amount:p,reason:null};e==="damage"&&(p=_.amount);const D=Number((L=(C=t.data)==null?void 0:C.hp)==null?void 0:L.current)||0,x=Number((H=(T=t.data)==null?void 0:T.hp)==null?void 0:H.temp)||0,v=(M=(Q=t.data)==null?void 0:Q.hp)==null?void 0:M.max,I=n.get("hp_max_override"),q=I===null||I===""?null:Number(I);if(e==="damage"&&q!==null&&(!Number.isFinite(q)||q<=0)){E("Inserisci un massimo PF valido","error");return}let R=D,w=x;if(e==="heal"&&m)w=x+p;else if(e==="heal")R=D+p;else{const K=Math.min(x,p);w=x-K;const Z=p-K;R=Math.max(D-Z,0)}const h=q??v,P=h!=null?Math.min(R,Number(h)):R,j=e==="heal"&&o?{...f,used:Math.min(y+S,i)}:f,V=e==="damage"&&k?` ${xe(k).toLowerCase()}`:"",W=e==="damage"&&_.reason?` (da ${z}, ${_.reason})`:"",c=e==="heal"?`${m?"HP temporanei +":"PF curati +"}${p}${o?` (${S}d${$})`:""}`:`Danno${V} ${p}${W}`,d=e==="damage"&&Number(p)>0&&!!((F=t.data)!=null&&F.concentration_active),u=async()=>{var te,re,ue;if(a&&B(a),!d)return;const K=ze(t),Z=K.find(be=>be.value==="con");!Z||Z.disabled||me({title:"Tiro salvezza concentrazione • COS",mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:K,value:Z.value},allowInspiration:!!((te=t==null?void 0:t.data)!=null&&te.inspiration)&&s,weakPoints:Number((ue=(re=t==null?void 0:t.data)==null?void 0:re.hp)==null?void 0:ue.weak_points)||0,characterId:t.id,historyLabel:"TS concentrazione"})};await J(t,{...t.data,hp:{...(O=t.data)==null?void 0:O.hp,current:P,temp:w,max:q??v},hit_dice:j},c,u)}function me({title:e,mode:a,selection:t=null,allowInspiration:s=!1,onConsumeInspiration:r=null,rollType:l=null,weakPoints:n=0,characterId:o=null,historyLabel:m=null,onRollComplete:f=null}){pe({keepOpen:!0,title:e,mode:a,selection:t,allowInspiration:s,onConsumeInspiration:r,rollType:l,weakPoints:n,characterId:o,historyLabel:m,onRollComplete:f})}function Wt(e,{allowHitDice:a=!0,allowTempHp:t=!1,allowMaxOverride:s=!1}={}){var I,q,R;const r=(w,h={})=>{const P=w==null?void 0:w.querySelector('input[type="number"]');P&&Fa(P,h)},l=document.createElement("div");l.className="modal-form-grid hp-shortcut-fields";const n=Se({label:"Valore",name:"amount",type:"number",value:"1"});n.classList.add("hp-shortcut-fields__amount");const o=n.querySelector("input");o&&Ce(o,{min:1}),o&&(o.min="1",o.required=!0);const m=document.createElement("div");if(m.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",m.appendChild(n),t){const w=document.createElement("div");w.className="modal-toggle-field",w.innerHTML=`
      <span class="modal-toggle-field__label">HP temporanei</span>
      <label class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="temp_hp" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </label>
    `,m.appendChild(w)}if(l.appendChild(m),!a){if(s){const w=document.createElement("label");w.className="field hp-shortcut-fields__damage-type";const h=document.createElement("span");h.textContent="Tipo di danno";const P=Ne([{value:"",label:"Nessun tipo (danno normale)"},...he.map(W=>({value:W.key,label:W.label}))],"");P.name="damage_type",w.append(h,P),m.appendChild(w);const j=Se({label:"Nuovo massimo PF",name:"hp_max_override",type:"number",value:((q=(I=e==null?void 0:e.data)==null?void 0:I.hp)==null?void 0:q.max)??""});j.classList.add("hp-shortcut-fields__max");const V=j.querySelector("input");V&&(Ce(V,{min:1}),V.min="1"),m.appendChild(j)}return l}const f=((R=e==null?void 0:e.data)==null?void 0:R.hit_dice)||{},g=Number(f.used)||0,y=Number(f.max)||0,i=Math.max(y-g,0),$=qe(f.die),S=i>0&&$,p=document.createElement("div");p.className="modal-toggle-field";const z=f.die?`${f.die}`:"dado vita";p.innerHTML=`
    <span class="modal-toggle-field__label">Usa dado vita (${z}) · rimasti ${i}/${y||"-"}</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="use_hit_dice" ${S?"":"disabled"} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const k=document.createElement("label");k.className="field hit-dice-count hp-shortcut-fields__count",k.innerHTML=`
    <span>Numero dadi vita</span>
    <input type="number" name="hit_dice_count" min="1" max="${i}" value="1" />
  `,r(k,{decrementLabel:"Riduci dadi vita",incrementLabel:"Aumenta dadi vita"});const _=document.createElement("div");if(_.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",_.append(p,k),l.appendChild(_),!S){const w=document.createElement("p");w.className="muted",w.textContent="Nessun dado vita disponibile o configurato.",l.appendChild(w)}const D=p.querySelector("input"),x=k.querySelector("input");x&&(x.required=!1);const v=()=>{const w=D==null?void 0:D.checked;o&&(o.disabled=!!w,o.required=!w,w?o.value="":o.value||(o.value="1"),x&&(x.disabled=!w,x.required=!!w,w||(x.value="1")))};return D==null||D.addEventListener("change",v),v(),l}export{es as bindGlobalFabHandlers,B as renderHome};
