import{s as Ae,a as Ee,b as ae,c as Je,e as _a,d as fe,R as he,u as ya,f as Ze,g as $a,h as Le,i as ka}from"./constants-BYO8hdze.js";import{c as Sa,g as ea,f as wa,a as Aa,b as Ea,d as La,e as Ma,h as Na,m as Ca,i as xa,u as qa,j as Ra,k as za,l as Ta,n as Da,o as ke,p as Be,q as Ba}from"./walletApi-CXxwX8w7.js";import{c as S,o as ce,u as de,a as ue,b as Me,g as ee,n as oe,d as Se,e as Ne,s as Ie,f as Ia,h as ja,i as Fa,j as Pa}from"./index-DXBitu8v.js";import{openDiceOverlay as pe}from"./dice-CIIItguY.js";import{o as je}from"./characterDrawer-z4sVQEoq.js";import{n as K,c as be,f as W,g as ne,a as Ha,b as Oa,d as Va,e as le,h as aa,s as Ua,i as Wa,p as Ka,j as Fe,k as Ce,l as Re,r as Ga,m as Qa,o as Xa,q as Ya,t as Ja}from"./utils-Tv02vTp-.js";import{s as Z,o as ta,a as Za,f as Pe,b as He,c as et,d as at,e as Oe,g as tt,r as st,h as nt,i as it,j as ot,k as Ve,l as lt,m as rt,n as ct}from"./modals-CT6wOzon.js";function dt(e,a){return e?`
    <div>
      <p>Non hai ancora un personaggio.</p>
      <div class="button-row">
        <button class="primary" data-create-character>Nuovo personaggio</button>
      </div>
    </div>
  `:`<p class="muted">${a?"Modalità offline attiva: crea un personaggio quando torni online.":"Accedi per creare un personaggio."}</p>`}function ut(e,a,t=[]){const s=e.data||{},o=s.hp||{},l=s.hit_dice||{},i=s.abilities||{},r=K(s.proficiency_bonus),p=!!s.inspiration,u=!!s.concentration_active,m=s.initiative??ne(i.dex),y=s.skills||{},w=s.skill_mastery||{},n=Ha(i,r,y,w),A=K(o.current),v=K(o.max),$=K(o.temp),T=s.death_saves||{},b=Math.max(0,Math.min(3,Number(T.successes)||0)),x=Math.max(0,Math.min(3,Number(T.failures)||0)),q=v?Math.min(Math.max(Number(A)/v*100,0),100):0,_=Math.max(0,Number($)||0),j=Math.max(0,Number(v??A??0)),C=_>0,R=C?100:0,k=C?j:1,h=C?_:0,F=v?`${A??"-"}/${v}`:`${A??"-"}`,D=v?`${Math.round(q)}%`:"-",U=$??"-",X=Math.max(0,Math.min(6,Number(o.weak_points)||0)),G=Array.isArray(s.conditions)?s.conditions:s.condition?[s.condition]:[],c=Je.filter(B=>G.includes(B.key)),d=c.length?c.map(B=>B.label).join(", "):"Nessuna condizione",g=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti delle condizioni">?</summary>
      <div class="info-tooltip__panel">
        ${c.length?`
      <ul class="condition-track__list">
        ${c.map(B=>`<li><strong>${B.label}:</strong> ${B.effect}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun effetto attivo.</p>'}
      </div>
    </details>
  `,L=[{value:1,description:"Svantaggio sulle prove di caratteristica."},{value:2,description:"Velocità dimezzata."},{value:3,description:"Svantaggio sui tiri per colpire e tiri salvezza."},{value:4,description:"Punti ferita massimi dimezzati."},{value:5,description:"Velocità ridotta a 0."},{value:6,description:"Morte."}],M=L.filter(B=>B.value<=X),E=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti dei punti indebolimento">?</summary>
      <div class="info-tooltip__panel">
        ${M.length?`
      <ul class="weakness-track__list">
        ${M.map(B=>`<li>${B.description}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun indebolimento.</p>'}
      </div>
    </details>
  `,z=`Livello attuale: ${X}`,O=Oa(s,i,t),Q=!!s.darkvision_enabled,P=K(s.darkvision_range_m),H=Q?`${P??18} m`:"No",Y=[{key:"str",label:ae.str,value:i.str},{key:"dex",label:ae.dex,value:i.dex},{key:"con",label:ae.con,value:i.con},{key:"int",label:ae.int,value:i.int},{key:"wis",label:ae.wis,value:i.wis},{key:"cha",label:ae.cha,value:i.cha}];return`
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
            <strong>${W(r)}</strong>
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
              aria-pressed="${u}"
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
          ${Y.map(B=>{const V=K(B.value),J=V===null?"-":Wa(V);return`
            <div class="stat-card stat-card--${B.key}">
              <span>${B.label}</span>
              <strong>${V??"-"}</strong>
              <span class="stat-card__modifier" aria-label="Modificatore ${B.label}">${J}</span>
            </div>
          `}).join("")}
        </div>
      </div>
      <div class="hp-panel">
        <div class="hp-bar-row">
          <div class="armor-class-card">
            <span>CA</span>
            <strong>${O??"-"}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">🛡️</span>
          </div>
          <div class="armor-class-card armor-class-card--initiative">
            <span>Iniz</span>
            <strong>${W(K(m))}</strong>
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
              <strong>${F}</strong>
              <span class="hp-bar-label__percent" aria-label="Percentuale vita ${D}">${D}</span>
              <span class="hp-bar-label__divider" aria-hidden="true">•</span>
              <span class="hp-bar-label__temp-group ${C?"is-active":""}">
                <span class="hp-bar-label__temp">HP temporanei</span>
                <strong>${U}</strong>
              </span>
            </div>
            <div class="hp-bar-track">
              <div class="hp-bar" style="flex: ${k};">
                <div class="hp-bar__fill" style="width: ${q}%;"></div>
              </div>
              ${C?`
              <div class="hp-bar hp-bar--temp is-active" style="flex: ${h};">
                <div class="hp-bar__fill hp-bar__fill--temp" style="width: ${R}%;"></div>
              </div>
              `:""}
            </div>
            <div class="hp-panel-hit-dice">
              <span>Dadi vita</span>
              <strong>${Va(l)}</strong>
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
            <strong>${n??"-"}</strong>
          </div>
          <div class="stat-chip stat-chip--highlight stat-chip--darkvision">
            <span>Scurovisione</span>
            <strong>${H}</strong>
          </div>
          <div class="hp-panel-status-row">
            <div class="weakness-track">
              <div class="track-label-row">
                <span class="weakness-track__label">Punti indebolimento</span>
                ${E}
              </div>
              <div class="weakness-track__group" role="radiogroup" aria-label="Livelli indebolimento">
                ${L.map(B=>{const V=B.value===X;return`
                  <button
                    class="death-save-dot ${V?"is-filled":""}"
                    type="button"
                    role="radio"
                    aria-checked="${V}"
                    data-weakness-level="${B.value}"
                    aria-label="Livello ${B.value}: ${B.description}"
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
                ${g}
              </div>
              <div class="condition-track__row">
                <span class="condition-track__value">${d}</span>
              </div>
            </div>
            <div class="death-saves">
              <span class="death-saves__label">TS morte</span>
              <div class="death-saves__group" aria-label="Successi">
                <span class="death-saves__tag">✓</span>
                ${Array.from({length:3},(B,V)=>{const J=V+1;return`
                  <button class="death-save-dot ${J<=b?"is-filled":""}" type="button" data-death-save="successes" data-death-save-index="${J}" aria-label="Successi ${J}">
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="death-saves__group" aria-label="Fallimenti">
                <span class="death-saves__tag">✗</span>
                ${Array.from({length:3},(B,V)=>{const J=V+1;return`
                  <button class="death-save-dot ${J<=x?"is-filled":""}" type="button" data-death-save="failures" data-death-save-index="${J}" aria-label="Fallimenti ${J}">
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
        ${bt(e,t,a)}
      </div>
    </div>
  `}function pt(e){const a=e.data||{},t=a.abilities||{},s=K(a.proficiency_bonus),o=a.skills||{},l=a.skill_mastery||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Ee.map(i=>{const r=!!o[i.key],p=!!l[i.key],u=be(t[i.ability],s,r?p?2:1:0);return`
          <button class="modifier-card modifier-card--interactive ${p?"modifier-card--mastery":r?"modifier-card--proficiency":""}" type="button" data-skill-card="${i.key}" aria-label="Tira abilità ${i.label}">
            <div>
              <div class="modifier-title">
                <strong>${i.label}</strong>
                <span class="modifier-ability modifier-ability--${i.ability}">${ae[i.ability]}</span>
              </div>
            </div>
            <div class="modifier-value">${W(u)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function mt(e){const a=Array.isArray(e.special_skill_rolls)?e.special_skill_rolls:[];return a.some(o=>{const l=String((o==null?void 0:o.id)??"").toLowerCase(),i=String((o==null?void 0:o.name)??"").trim().toLowerCase();return l==="initiative"||l==="default_initiative"||i==="iniziativa"})?a:[{id:"default_initiative",name:"Iniziativa",ability:"dex",proficient:!1,mastery:!1,bonus:0},...a]}function ft(e){const a=e.data||{},t=a.abilities||{},s=K(a.proficiency_bonus);return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${mt(a).map((l,i)=>{var v;const r=ae[l.ability]?l.ability:"str",p=!!l.proficient,u=!!l.mastery&&p,m=be(t[r],s,p?u?2:1:0),y=Number(l.bonus)||0,w=(m??0)+y,n=u?"modifier-card--mastery":p?"modifier-card--proficiency":"",A=((v=l.name)==null?void 0:v.trim())||`Tiro speciale ${i+1}`;return`
          <button class="modifier-card modifier-card--interactive ${n}" type="button" data-special-skill-card="${l.id??i}" aria-label="Tira abilità speciale ${A}">
            <div>
              <div class="modifier-title">
                <strong>${A}</strong>
                <span class="modifier-ability modifier-ability--${r}">${ae[r]}</span>
              </div>
            </div>
            <div class="modifier-value">${W(w)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function gt(e){const a=e.data||{},t=a.abilities||{},s=K(a.proficiency_bonus),o=a.saving_throws||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Ae.map(l=>{const i=!!o[l.key],r=be(t[l.key],s,i?1:0);return`
          <button class="modifier-card modifier-card--interactive ${i?"modifier-card--proficiency":""}" type="button" data-saving-throw-card="${l.key}" aria-label="Tira salvezza ${l.label}">
            <div>
              <div class="modifier-title">
                <strong>${l.label}</strong>
              </div>
            </div>
            <div class="modifier-value">${W(r)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function Ue(e,a){const s=(Array.isArray(e==null?void 0:e[a])?e[a]:[]).map(o=>{var l;return((l=fe.find(i=>i.key===o))==null?void 0:l.label)||o}).filter(Boolean);return s.length?`<div class="tag-row">${s.map(o=>`<span class="chip chip--defense">${o}</span>`).join("")}</div>`:'<p class="muted">Nessuna voce configurata.</p>'}function bt(e,a=[],t=!1){const s=e.data||{},o=s.proficiencies||{},l=s.proficiency_notes||"",{tools:i,languages:r}=Ka(l),p=s.language_proficiencies||"",u=Fe(p),m=s.talents||"",y=Fe(m),w=s.damage_defenses||{},A=[...u,...r].reduce(($,T)=>{const b=T.trim();if(!b)return $;const x=b.toLowerCase();return $.seen.has(x)||($.seen.add(x),$.values.push(b)),$},{values:[],seen:new Set}).values,v=_a.filter($=>o[$.key]).map($=>$.label);return`
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
          ${v.length?`<div class="tag-row">${v.map($=>`<span class="chip">${$}</span>`).join("")}</div>`:'<p class="muted">Nessuna competenza equipaggiamento.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="tools">
          ${i.length?`<div class="tag-row">${i.map($=>`<span class="chip">${$}</span>`).join("")}</div>`:'<p class="muted">Aggiungi strumenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="languages">
          ${A.length?`<div class="tag-row">${A.map($=>`<span class="chip">${$}</span>`).join("")}</div>`:'<p class="muted">Aggiungi lingue conosciute nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="talents">
          ${y.length?`<div class="tag-row">${y.map($=>`<span class="chip">${$}</span>`).join("")}</div>`:'<p class="muted">Aggiungi talenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="defenses">
          <div class="defense-summary-grid">
            <div class="defense-summary-card">
              <span>Resistenze</span>
              ${Ue(w,"resistances")}
            </div>
            <div class="defense-summary-card">
              <span>Immunità</span>
              ${Ue(w,"immunities")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function vt(e,a=[],t=!1){const s=(a||[]).filter(r=>le(r).length),o=(a||[]).filter(r=>r.attunement_active).length,l=Sa(a),i=ea(e);return`
    <section class="card home-card home-section home-scroll-panel">
      <header class="card-header">
        <div>
          <p class="eyebrow">Gestione Equipaggiamento</p>
          <div class="pill-row">
            <span class="pill pill--accent">Oggetti in sintonia: ${o}</span>
            <span class="pill">Carico totale: ${wa(l,i)}</span>
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
            ${s.map(r=>{const p=Aa(r);return`
              <li class="modifier-card attack-card resource-card inventory-item-card">
                <div class="resource-card__badges">
                  ${r.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${p.magic}</span>`:""}
                  ${r.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${p.attunement}</span>`:""}
                </div>
                <div class="attack-card__body resource-card__body">
                  <div class="resource-card__title item-info">
                    ${r.image_url?`<img class="item-avatar" src="${r.image_url}" alt="Foto di ${r.name}" data-item-image="${r.id}" />`:""}
                    <div class="item-info-body">
                      <div class="item-info-line">
                        <button class="item-name-button attack-card__name-button" type="button" data-item-preview="${r.id}" aria-label="Apri anteprima ${r.name}">${r.name}</button>
                        <span class="muted item-meta">
                          ${Ea(r.category)} · ${La(le(r))}
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
  `}function ht(e,a=[]){var q;const t=e.data||{},s=Number(t.attack_bonus_melee??t.attack_bonus)||0,o=Number(t.attack_bonus_ranged??t.attack_bonus)||0,l=Number(t.damage_bonus_melee??t.damage_bonus)||0,i=Number(t.damage_bonus_ranged??t.damage_bonus)||0,r=Number(t.extra_attacks)||0,p=a.filter(_=>_.category==="weapon"&&_.equipable&&le(_).length),m=(t.spellcasting||{}).ability,y=m?(q=t.abilities)==null?void 0:q[m]:null,w=ne(y),n=K(t.proficiency_bonus),A=w===null||n===null?null:w+n,$=(Array.isArray(t.spells)?t.spells:[]).filter(_=>(_.kind==="cantrip"||Number(_.level)===0)&&_.attack_roll&&_.damage_die),T=$.length&&A!==null&&m;if(!p.length&&!T)return'<p class="muted">Nessuna arma equipaggiata.</p>';const b=[];return r>0&&b.push(`Attacco Extra (${r})`),s&&b.push(`Mischia attacco ${W(s)}`),l&&b.push(`Mischia danni ${W(l)}`),o&&b.push(`Distanza attacco ${W(o)}`),i&&b.push(`Distanza danni ${W(i)}`),`
    ${b.length?`<div class="tag-row">${b.map(_=>`<span class="chip">${_}</span>`).join("")}</div>`:""}
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${p.map(_=>{var De;const j=_.weapon_range||(_.range_normal?"ranged":"melee"),C=_.attack_ability||(j==="ranged"?"dex":"str"),R=ne((De=t.abilities)==null?void 0:De[C])??0,k=t.proficiencies||{},F=(_.weapon_type==="simple"?!!k.weapon_simple:_.weapon_type==="martial"?!!k.weapon_martial:!1)?K(t.proficiency_bonus)??0:0,D=j==="ranged"?o:s,U=j==="ranged"?i:l,X=R+F+(Number(_.attack_modifier)||0)+D,G=aa(_).filter(te=>te.damageDie),c=Number(_.range_normal)||null,d=Number(_.range_disadvantage)||null,f=Number(_.melee_range)||1.5,g=[];j==="melee"&&f>1.5&&g.push(`Portata ${f} m`),j==="melee"&&_.is_thrown&&c&&g.push(`Lancio ${c}${d?`/${d}`:""}`),j!=="melee"&&c&&g.push(`Gittata ${c}${d?`/${d}`:""}`);const L=_.required_ammunition_type||_.ammunition_type,M=_.consumes_ammunition?a.filter(te=>te.category!=="container").filter(te=>L?te.ammunition_type===L:te.ammunition_type).reduce((te,ha)=>te+(Number(ha.qty)||0),0):null,N=Ma.get(L)||"Munizioni",E=M!==null?`${N} ${M}`:"",z=[...g,E].filter(Boolean).join(" · "),O=C==="dex"?"DES":C==="str"?"FOR":C.toUpperCase(),Q=_.id??_.name,P=G.length?G:[{id:"default",label:"",damageDie:null,damageModifier:Number(_.damage_modifier)||0}],H=P.find(te=>te.id===_.selected_damage_mode)||P[0],Y=R+(Number(H.damageModifier)||0)+U,B=H.damageDie?`${H.damageDie}${Y?` ${W(Y)}`:""}`:"-",V=H.id!=="default"?H.label:"",J=V?`Impugnatura: ${V}`:"",ie=`weapon:${Q}:${H.id}`,ve=P.length>1?`<button class="icon-button icon-button--weapon-mode" data-cycle-weapon-mode="${Q}" aria-label="Cambia impugnatura ${_.name}" title="Cambia impugnatura: ${V||H.label}"><span aria-hidden="true">🔁</span></button>`:"";return`
          <div class="modifier-card attack-card" data-roll-attack="weapon:${_.id??_.name}">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${_.name}</strong>
                <span class="modifier-ability modifier-ability--${C}">${O}</span>
                <span class="attack-card__hit">${W(X)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${B}</span>
                ${J?`<span class="muted">${J}</span>`:""}
                ${z?`<span class="muted">${z}</span>`:""}
              </div>
            </div>
            <div class="attack-card__actions">
              ${ve}
              <button class="icon-button icon-button--fire" data-roll-damage="${ie}" aria-label="Calcola danni ${_.name}${V?` ${V}`:""}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          </div>
        `}).join("")}
        ${T?$.map(_=>{const j=Number(_.damage_modifier)||0,C=`${_.damage_die}${j?` ${W(j)}`:""}`,R=ae[m]??(m==null?void 0:m.toUpperCase()),k=_.range?`Range ${_.range}`:"";return`
            <div class="modifier-card attack-card" data-roll-attack="spell:${_.id}">
              <div class="attack-card__body">
                <div class="attack-card__title">
                  <strong class="attack-card__name">${_.name}</strong>
                  <span class="modifier-ability modifier-ability--${m}">${R}</span>
                  <span class="attack-card__hit">${W(A)}</span>
                </div>
                <div class="attack-card__meta">
                  <span class="attack-card__damage">${C}</span>
                 
                  ${k?`<span class="muted">${k}</span>`:""}
                </div>
              </div>
              <button class="icon-button icon-button--fire" data-roll-damage="spell:${_.id}" aria-label="Calcola danni ${_.name}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          `}).join(""):""}
      </div>
    </div>
  `}function _t(e,a=!1){var k;const t=e.data||{},s=t.spell_notes||"",o=Array.isArray(t.spells)?Ua(t.spells):[],l=t.spellcasting||{},i=K(t.proficiency_bonus),r=l.ability,p=r?(k=t.abilities)==null?void 0:k[r]:null,u=ne(p),m=u===null||i===null?null:8+u+i,y=u===null||i===null?null:u+i,w=r?ae[r]:null,n=l.slots||{},A=l.slots_max||{},v=l.recharge||"long_rest",T=Array.from({length:9},(h,F)=>F+1).map(h=>{const F=Math.max(0,Number(n[h])||0),D=Math.max(F,Number(A[h])||0);return{level:h,count:F,max:D}}).filter(h=>h.max>0),b=[`${w??"-"}`,`CD ${m===null?"-":m}`,`TC ${y===null?"-":W(y)}`],x=b.length?`<div class="tag-row">${b.map(h=>`<span class="chip">${h}</span>`).join("")}</div>`:"",q=o.filter(h=>{if((Number(h.level)||0)<1)return!1;const D=h.prep_state||"known";return D==="prepared"||D==="always"}),_=o.filter(h=>(Number(h.level)||0)===0),j=q.filter(h=>(h.prep_state||"known")==="always"),C=q.filter(h=>(h.prep_state||"known")!=="always"),R=(h,F="")=>{const D=Number(h.level)||0,U=_e(h.cast_time),X=sa(U),G=Ce(h,D);return`
      <div class="modifier-card attack-card resource-card spell-prepared-list__card">
        <div class="resource-card__badges spell-card__badges">
          ${h.concentration?'<span class="resource-chip resource-chip--floating resource-chip--concentration">C</span>':""}
          ${h.is_ritual?'<span class="resource-chip resource-chip--floating resource-chip--ritual">R</span>':""}
          ${U?`<span class="resource-chip resource-chip--floating ${X}">${U}</span>`:""}
        </div>
        <button class="spell-prepared-list__item" type="button" data-spell-quick-open="${h.id}">
          <span class="spell-prepared-list__name">${h.name}</span>
          ${D>0?`<span class="chip chip--small">${D}°</span>`:""}
        </button>
        <div class="resource-card-actions spell-card-actions">
          ${G?`
            <button class="icon-button icon-button--fire spell-card-actions__damage" type="button" data-roll-damage="spell:${h.id}" aria-label="Lancia danni ${h.name}" title="Lancia danni">
              <span aria-hidden="true">🔥</span>
            </button>
          `:""}
          ${D>0?`<button class="resource-cta-button resource-cta-button--label" type="button" data-use-spell="${h.id}">Usa</button>`:""}
          ${a?`
            <button class="resource-action-button resource-icon-button" type="button" data-edit-spell="${h.id}" aria-label="Modifica incantesimo ${h.name}">✏️</button>
            <button class="resource-action-button resource-icon-button" type="button" data-delete-spell="${h.id}" aria-label="Elimina incantesimo ${h.name}">🗑️</button>
          `:""}
        </div>
      </div>
    `};return`
    ${x}
    <div class="detail-section">
      <div class="detail-card detail-card--text spell-summary-card">
        <div class="spell-slots">
          <span class="spell-slots__title">Slot rimanenti</span>
          <div class="spell-slots__list">
            ${T.map(h=>{const F=v==="short_rest"?"charge-indicator":"charge-indicator charge-indicator--long",D=Array.from({length:h.max},(U,X)=>{const G=X>=h.count,d=[F,G?"charge-indicator--used":""].filter(Boolean).join(" ");return a&&G?`<button type="button" class="${d}" data-restore-spell-slot="${h.level}" aria-label="Ripristina uno slot di livello ${h.level}"></button>`:a&&!G?`<button type="button" class="${d}" data-consume-spell-slot="${h.level}" aria-label="Consuma uno slot di livello ${h.level}"></button>`:`<span class="${d}"></span>`}).join("");return`
              <div class="spell-slot-row">
                <span class="spell-slot-label">Slot ${h.level}°</span>
                <span class="spell-slot-count">${h.count}</span>
                <div class="spell-slot-charges" aria-hidden="true">${D||'<span class="spell-slot-empty">-</span>'}</div>
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
            <span class="spell-list-accordion__count">${_.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${_.length?`<div class="spell-prepared-list__items">${_.map(h=>R(h)).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun trucchetto disponibile.</p>'}
          </div>
        </details>
        <details class="spell-list-accordion" open>
          <summary class="spell-list-accordion__summary">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <span class="spell-list-accordion__title">Preparati</span>
            <span class="spell-list-accordion__count">${C.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${C.length?`<div class="spell-prepared-list__items">${C.map(h=>R(h,"Preparato")).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun incantesimo preparato.</p>'}
          </div>
        </details>
        <details class="spell-list-accordion" open>
          <summary class="spell-list-accordion__summary">
            <span class="inventory-container-accordion__icon" aria-hidden="true">▾</span>
            <span class="spell-list-accordion__title">Sempre conosciuti</span>
            <span class="spell-list-accordion__count">${j.length}</span>
          </summary>
          <div class="spell-list-accordion__body">
            ${j.length?`<div class="spell-prepared-list__items">${j.map(h=>R(h,"Sempre preparato")).join("")}</div>`:'<p class="muted spell-list-accordion__empty">Nessun incantesimo sempre conosciuto.</p>'}
          </div>
        </details>
      </div>
    </div>
  `}function _e(e){const a=e==null?void 0:e.toString().trim();if(!a)return"";const t=a.toLowerCase();if(t.includes("bonus"))return"Azione Bonus";if(t.includes("reaz"))return"Reazione";if(t.includes("gratuit"))return"Azione Gratuita";if(t.includes("durata")||t.includes("più")||t.includes("piu")||t.includes("superiore"))return"Durata";if(t.includes("azion"))return"Azione";const s=he.find(o=>o.label.toLowerCase()===t);return(s==null?void 0:s.label)??""}function We(e){if(!e)return he.length;const a=_e(e),t=he.findIndex(s=>s.label===a);return t===-1?he.length:t}function sa(e){var t;if(!e)return"";const a=_e(e);return((t=he.find(s=>s.label===a))==null?void 0:t.className)??""}function yt(e){return[...e].sort((a,t)=>{const s=We(a.cast_time)-We(t.cast_time);return s!==0?s:(a.name??"").localeCompare(t.name??"","it",{sensitivity:"base"})})}function Ke(e,a,{showCharges:t=!0,showUseButton:s=!0,showDescription:o=!1,showCastTime:l=!0}={}){return`
    <ul class="resource-list resource-list--compact">
      ${e.map(i=>`
        <li class="modifier-card attack-card resource-card" data-resource-card="${i.id}">
          ${l&&_e(i.cast_time)?`<span class="resource-chip resource-chip--floating ${sa(i.cast_time)}">${_e(i.cast_time)}</span>`:""}
          <div class="attack-card__body resource-card__body">
            <div class="attack-card__title resource-card__title">
              <strong class="attack-card__name">${i.name}</strong>
            </div>
            ${o?`<p class="resource-card__description">${i.description??""}</p>`:""}
            ${t&&Number(i.max_uses)?`
              <div class="resource-card__charges">
                ${kt(i)}
              </div>
            `:""}
          </div>
          <div class="resource-card-actions">
            ${s?`
              <button
                class="resource-cta-button resource-cta-button--label"
                data-use-resource="${i.id}"
                ${!Number(i.max_uses)||i.used>=Number(i.max_uses)?"disabled":""}
              >
                Usa
              </button>
            `:""}
            ${a?`
              <button class="resource-action-button resource-icon-button" data-edit-resource="${i.id}" aria-label="Modifica risorsa">✏️</button>
              <button class="resource-action-button resource-icon-button" data-delete-resource="${i.id}" aria-label="Elimina risorsa">🗑️</button>
            `:""}
          </div>
        </li>
      `).join("")}
    </ul>
  `}function $t(e,a){if(!e.length)return"<p>Nessuna risorsa.</p>";const t=yt(e),s=t.filter(r=>r.reset_on===null||r.reset_on==="none"),o=t.filter(r=>r.reset_on!==null&&r.reset_on!=="none"),l=`
    <details class="resource-accordion resource-section resource-section--active" open>
      <summary class="resource-accordion__summary">
        <span>Attive</span>
        <span class="resource-accordion__meta">${o.length} risorse</span>
        <span class="resource-accordion__icon" aria-hidden="true">▾</span>
      </summary>
      <div class="resource-section__body resource-accordion__body">
        ${o.length?Ke(o,a,{showUseButton:!0}):'<p class="muted">Nessuna risorsa attiva.</p>'}
      </div>
    </details>
  `,i=`
    <details class="resource-accordion resource-section" ${o.length?"":"open"}>
      <summary class="resource-accordion__summary">
        <span>Passive</span>
        <span class="resource-accordion__meta">${s.length} risorse</span>
        <span class="resource-accordion__icon" aria-hidden="true">▾</span>
      </summary>
      <div class="resource-section__body resource-accordion__body">
        ${s.length?Ke(s,a,{showCharges:!1,showUseButton:!1,showDescription:!0,showCastTime:!0}):'<p class="muted">Nessuna risorsa passiva.</p>'}
      </div>
    </details>
  `;return`<div class="resource-accordion-stack">${l}${i}</div>`}function kt(e){const a=Number(e.max_uses)||0,t=Number(e.used)||0;if(!a)return"";const s=e.reset_on==="long_rest"?"long":"short",o=Math.max(a-t,0),l=Array.from({length:a},(i,r)=>{const p=r<t;return`<span class="${["charge-indicator",s==="long"?"charge-indicator--long":"charge-indicator--short",p?"charge-indicator--used":""].filter(Boolean).join(" ")}" aria-hidden="true"></span>`}).join("");return`
    <div class="resource-charge-row" aria-label="Cariche risorsa">
      <span class="resource-charge-label">Cariche</span>
      <span class="resource-charge-count">${o}/${a}</span>
      <div class="resource-charges" aria-hidden="true">${l}</div>
    </div>
  `}let Ge=!1,we=null;function St(e){return!e||!e.querySelector(".home-layout")?null:{windowX:window.scrollX||0,windowY:window.scrollY||0,panels:Array.from(e.querySelectorAll(".home-scroll-body, .home-scroll-panel")).map((a,t)=>({index:t,top:a.scrollTop||0,left:a.scrollLeft||0}))}}function wt(e,a){if(!e||!a)return;const t=()=>{const s=Array.from(e.querySelectorAll(".home-scroll-body, .home-scroll-panel"));a.panels.forEach(o=>{const l=s[o.index];l&&(l.scrollTop=o.top,l.scrollLeft=o.left)}),window.scrollTo(a.windowX,a.windowY)};typeof window.requestAnimationFrame=="function"?window.requestAnimationFrame(t):setTimeout(t,0)}function At(e){return e?{id:`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.id,name:e.name,level:e.level,kind:Number(e.level)===0?"cantrip":"spell",cast_time:e.cast_time,duration:e.duration,range:e.range,components:e.components,concentration:!!e.concentration,attack_roll:!!e.attack_roll,is_ritual:!!e.ritual,damage_die:e.damage_die,damage_modifier:e.damage_modifier,upcast_damage_die:e.upcast_damage_die,upcast_damage_modifier:e.upcast_damage_modifier,upcast_start_level:e.upcast_start_level,description:e.description,rules_version:e.rules_version,prep_state:"known"}:null}function Et(e){const a=(e==null?void 0:e.shared_spell)||{},t=(e==null?void 0:e.custom_spell)||{},s=e!=null&&e.shared_spell_id?a:t;if(!(s!=null&&s.name))return null;const o=Number(s.level)||0;return{id:e.id||`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,shared_spell_id:e.shared_spell_id||null,name:s.name,level:o,kind:s.kind||(o===0?"cantrip":"spell"),cast_time:s.cast_time||null,duration:s.duration||null,range:s.range||null,components:s.components||null,concentration:!!s.concentration,attack_roll:!!s.attack_roll,is_ritual:!!(s.ritual??s.is_ritual),damage_die:s.damage_die||null,damage_modifier:s.damage_modifier??null,upcast_damage_die:s.upcast_damage_die||null,upcast_damage_modifier:s.upcast_damage_modifier??null,upcast_start_level:s.upcast_start_level??null,description:s.description||null,school:s.school||null,caster_classes:s.caster_classes||[],rules_version:s.rules_version||null,prep_state:e.prep_state||"known"}}async function Lt(){var C;const e=["","Abiurazione","Ammaliamento","Divinazione","Evocazione","Illusione","Invocazione","Necromanzia","Trasmutazione"],a=["mago","warlock","stregone","chierico","druido","ranger","artefice","paladino","bardo"],t=document.createElement("div");t.className="modal-form-grid";const s=Se({label:"Cerca incantesimo",name:"spell_query",placeholder:"Es. Palla di fuoco"}),o=s.querySelector("input"),l=document.createElement("label");l.className="field",l.innerHTML="<span>Versione regole</span>";const i=document.createElement("select");i.name="rules_version",[{value:"2024",label:"2024"},{value:"2014",label:"2014"},{value:"Custom",label:"Custom"}].forEach(R=>{const k=document.createElement("option");k.value=R.value,k.textContent=R.label,i.appendChild(k)}),l.appendChild(i);const r=document.createElement("label");r.className="field",r.innerHTML="<span>Scuola</span>";const p=document.createElement("select");p.name="spell_school_filter",e.forEach(R=>{const k=document.createElement("option");k.value=R,k.textContent=R||"Tutte",p.appendChild(k)}),r.appendChild(p);const u=Se({label:"Livello",name:"spell_level_filter",type:"number",value:""}),m=document.createElement("div");m.className="field",m.innerHTML=`<span>Classi</span><div class="tag-row">${a.map(R=>`<label class="chip"><input type="checkbox" name="spell_caster_filter" value="${R}" /> ${R}</label>`).join("")}</div>`;const y=document.createElement("div");y.className="modal-form-row modal-form-row--compact",y.append(u,r,l),t.appendChild(s),t.appendChild(y),t.appendChild(m);const w=document.createElement("label");w.className="field",w.innerHTML="<span>Risultati</span>";const n=document.createElement("select");n.name="shared_spell_id",w.appendChild(n);const A=document.createElement("div");A.className="tab-bar",A.innerHTML='<button type="button" class="tab-bar__button" data-prev-page>◀</button><span data-page-label class="muted">Pagina 1</span><button type="button" class="tab-bar__button" data-next-page>▶</button>',t.appendChild(w),t.appendChild(A);let v=1,$=[];const T=A.querySelector("[data-page-label]"),b=A.querySelector("[data-prev-page]"),x=A.querySelector("[data-next-page]"),q=async()=>{var F;const R=Array.from(t.querySelectorAll('input[name="spell_caster_filter"]:checked')).map(D=>D.value),k=await ct({query:(o==null?void 0:o.value)||"",rulesVersion:i.value||"2024",level:((F=t.querySelector('input[name="spell_level_filter"]'))==null?void 0:F.value)||"",school:p.value||"",casterClasses:R,page:v,pageSize:25});if($=k.items||[],n.innerHTML="",$.forEach(D=>{const U=document.createElement("option");U.value=D.id,U.textContent=`${D.name} (Lv ${D.level})`,n.appendChild(U)}),!$.length){const D=document.createElement("option");D.value="",D.textContent="Nessun risultato",n.appendChild(D)}const h=Math.max(1,Math.ceil((k.total||0)/(k.pageSize||25)));T.textContent=`Pagina ${v} / ${h}`,b.disabled=v<=1,x.disabled=v>=h};o==null||o.addEventListener("input",()=>{v=1,q()}),p.addEventListener("change",()=>{v=1,q()}),i.addEventListener("change",()=>{v=1,q()}),(C=t.querySelector('input[name="spell_level_filter"]'))==null||C.addEventListener("input",()=>{v=1,q()}),t.querySelectorAll('input[name="spell_caster_filter"]').forEach(R=>R.addEventListener("change",()=>{v=1,q()})),b==null||b.addEventListener("click",()=>{v=Math.max(1,v-1),q()}),x==null||x.addEventListener("click",()=>{v+=1,q()}),await q();const _=await ce({title:"Seleziona incantesimo condiviso",submitLabel:"Aggiungi",cancelLabel:"Annulla",content:t,cardClass:"modal-card--form"});if(!_)return null;const j=_.get("shared_spell_id");return $.find(R=>R.id===j)||null}function Qe(e){var a,t;return((t=(a=e==null?void 0:e.data)==null?void 0:a.settings)==null?void 0:t.auto_usage_dice)!==!1}function Mt(e,a){var t,s;return Ja((s=(t=e==null?void 0:e.data)==null?void 0:t.spellcasting)==null?void 0:s.slots,a)}async function Nt(e,a){const t=Math.max(1,Number(a==null?void 0:a.level)||1),s=Mt(e,t);if(!s.length)return S("Slot incantesimo esauriti","error"),null;if(s.length===1)return s[0].level;const o=document.createElement("label");o.className="field",o.innerHTML="<span>Seleziona slot da consumare</span>";const l=document.createElement("select");l.name="cast_slot_level",l.className="input",s.forEach(u=>{const m=document.createElement("option");m.value=String(u.level),m.textContent=`${u.level}° livello (${u.available} slot)`,l.appendChild(m)}),o.appendChild(l);const i=document.createElement("div");i.className="modal-form-grid",i.appendChild(o);const r=await ce({title:a!=null&&a.name?`Lancia ${a.name}`:"Scegli slot incantesimo",submitLabel:"Conferma",cancelLabel:"Annulla",content:i,cardClass:"modal-card--form"});return r?Math.max(t,Number(r.get("cast_slot_level"))||t):null}async function I(e){var l,i,r,p;const a=St(e);we=e;const t=ee(),{user:s,offline:o}=t;Ie(!0);try{let u=t.characters;if(!o&&s)try{u=await $a(s.id),Ia({characters:u}),await ue({characters:u})}catch{S("Errore caricamento personaggi","error")}const m=oe(t.activeCharacterId);!u.some(c=>oe(c.id)===m)&&u.length&&ja(u[0].id);const w=oe(ee().activeCharacterId),n=u.find(c=>oe(c.id)===w),A=!!s&&!o,v=!!s&&!o,$=!!s&&!o;let T=t.cache.resources,b=t.cache.items;if(!o&&n){const[c,d,f]=await Promise.allSettled([Ze(n.id),Ta(n.id),Pe(n.id)]),g={};if(c.status==="fulfilled"?(T=c.value,de("resources",T),g.resources=T):S("Errore caricamento risorse","error"),d.status==="fulfilled"?(b=d.value,de("items",b),g.items=b):S("Errore caricamento equip","error"),f.status==="fulfilled"){const L=(f.value||[]).map(M=>Et(M)).filter(Boolean);if(L.length){const N=[...Array.isArray((l=n.data)==null?void 0:l.spells)?n.data.spells:[]];L.forEach(E=>{N.some(O=>O.shared_spell_id&&O.shared_spell_id===E.shared_spell_id)||N.push(E)}),n.data={...n.data||{},spells:N}}}Object.keys(g).length&&await ue(g)}e.innerHTML=`
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
          ${n?gt(n):"<p>Nessun personaggio selezionato.</p>"}
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
            ${n?pt(n):"<p>Nessun personaggio selezionato.</p>"}
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
            ${n?ft(n):"<p>Nessun personaggio selezionato.</p>"}
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
              ${n&&$?`
                <button class="icon-button" data-edit-character aria-label="Modifica personaggio">
                  <span aria-hidden="true">✏️</span>
                </button>
              `:""}
            </div>
          </header>
          ${n?ut(n,$,b):dt(A,o)}
        </section>
        ${n?vt(n,b,$):""}
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
            ${n?ht(n,b||[]):"<p>Nessun personaggio selezionato.</p>"}
          </div>
        </section>
        ${(i=n==null?void 0:n.data)!=null&&i.is_spellcaster?`
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Incantesimi</p>
            </div>
            <div class="actions">
              <button class="icon-button icon-button--dice" data-open-dice="spell-attack" aria-label="Lancia dado tiro per colpire incantesimi">
                <span aria-hidden="true">🎲</span>
              </button>
              ${(p=(r=n==null?void 0:n.data)==null?void 0:r.spellcasting)!=null&&p.can_prepare?`
                <button class="icon-button icon-button--spell-prepare" type="button" data-open-prepared-spells aria-label="Prepara incantesimi" title="Prepara incantesimi">
                  <span aria-hidden="true">📖</span>
                </button>
              `:""}
              ${n&&$?`
                <button class="icon-button icon-button--add" data-add-spell aria-label="Aggiungi incantesimo">
                  <span aria-hidden="true">+</span>
                </button>
              `:""}
            </div>
          </header>
          <div class="home-scroll-body">
            ${_t(n,$)}
          </div>
        </section>
        `:""}
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Risorse</p>           
            </div>
            ${n&&v?`
              <button class="icon-button icon-button--add" data-add-resource aria-label="Nuova risorsa">
                <span aria-hidden="true">+</span>
              </button>
            `:""}
          </header>
          <div class="home-scroll-body home-scroll-body--resources">
            ${n?$t(T,v):"<p>Nessun personaggio selezionato.</p>"}
            ${n&&!v?'<p class="muted">Connettiti per aggiungere nuove risorse.</p>':""}
          </div>
        </section>
      </div>
    </div>
  `,na();const x=e.querySelector("[data-create-character]");x&&x.addEventListener("click",()=>{je(s,()=>I(e))});const q=e.querySelector("[data-edit-character]");q&&q.addEventListener("click",()=>{je(s,()=>I(e),n)});const _=e.querySelector("[data-add-resource]");_&&_.addEventListener("click",()=>{He(n,()=>I(e))});const j=e.querySelector("[data-add-spell]");j&&j.addEventListener("click",async()=>{var d;if(!n)return;const c=await et();if(c){if(c==="shared")try{const f=await Lt();if(!f)return;const g=At(f),L=Array.isArray((d=n.data)==null?void 0:d.spells)?n.data.spells:[];if(L.some(E=>E.shared_spell_id===f.id)){S("Incantesimo già presente nella scheda personaggio","info");return}n.user_id&&await at({user_id:n.user_id,character_id:n.id,shared_spell_id:f.id,prep_state:g.prep_state});const N={...n.data||{},spells:[...L,g]};await Z(n,N,"Incantesimo aggiunto dalla lista condivisa",()=>I(e));return}catch{S("Errore durante l'associazione dell'incantesimo condiviso","error");return}Oe(n,async f=>{if(!f)return I(e);try{await tt({created_by:n.user_id,rules_version:f.rules_version||"2024",name:f.name,level:f.level,school:f.school||null,caster_classes:Array.isArray(f.caster_classes)?f.caster_classes:[],cast_time:f.cast_time||null,range:f.range||null,duration:f.duration||null,components:f.components||null,concentration:!!f.concentration,ritual:!!f.is_ritual,attack_roll:!!f.attack_roll,damage_die:f.damage_die||null,damage_modifier:f.damage_modifier??null,upcast_damage_die:f.upcast_damage_die||null,upcast_damage_modifier:f.upcast_damage_modifier??null,upcast_start_level:f.upcast_start_level??null,description:f.description||null})}catch{S("Incantesimo salvato sul personaggio ma non sul catalogo condiviso","info")}I(e)})}}),e.querySelectorAll("[data-edit-spell]").forEach(c=>c.addEventListener("click",()=>{var L;const d=c.dataset.editSpell;if(!d||!n)return;const g=(Array.isArray((L=n.data)==null?void 0:L.spells)?n.data.spells:[]).find(M=>M.id===d);g&&Oe(n,()=>I(e),g)})),e.querySelectorAll("[data-delete-spell]").forEach(c=>c.addEventListener("click",async()=>{var N;const d=c.dataset.deleteSpell;if(!d||!n)return;const f=Array.isArray((N=n.data)==null?void 0:N.spells)?n.data.spells:[],g=f.find(E=>E.id===d);if(!g||!await Me({title:"Conferma eliminazione incantesimo",message:`Stai per eliminare l'incantesimo "${g.name}" dalla scheda del personaggio. Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))return;if(g.shared_spell_id)try{const z=(await Pe(n.id)).find(O=>O.shared_spell_id===g.shared_spell_id);z!=null&&z.id&&await st(z.id)}catch{S("Errore rimozione associazione incantesimo","error");return}const M={...n.data||{},spells:f.filter(E=>E.id!==g.id)};await Z(n,M,"Incantesimo eliminato",()=>I(e))}));const C=e.querySelector("[data-open-prepared-spells]");C&&C.addEventListener("click",()=>{ta(n,()=>I(e))}),e.querySelectorAll("[data-spell-quick-open]").forEach(c=>c.addEventListener("click",()=>{var L;const d=c.dataset.spellQuickOpen;if(!d||!n)return;const g=(Array.isArray((L=n.data)==null?void 0:L.spells)?n.data.spells:[]).find(M=>M.id===d);g&&nt(n,g,()=>I(e))}));const R=e.querySelector("[data-show-background]");R&&R.addEventListener("click",()=>{it(n)});const k=e.querySelector("[data-edit-conditions]");k&&k.addEventListener("click",async()=>{await ia(e)}),e.querySelectorAll("[data-proficiency-tabs]").forEach(c=>{var M;const d=Array.from(c.querySelectorAll("[data-proficiency-tab]")),f=Array.from(c.querySelectorAll("[data-proficiency-panel]"));if(!d.length||!f.length)return;const g=N=>{d.forEach(E=>{const z=E.dataset.proficiencyTab===N;E.classList.toggle("is-active",z),E.setAttribute("aria-selected",String(z))}),f.forEach(E=>{E.classList.toggle("is-active",E.dataset.proficiencyPanel===N)})};d.forEach(N=>{N.addEventListener("click",()=>{g(N.dataset.proficiencyTab)})});const L=((M=d.find(N=>N.classList.contains("is-active")))==null?void 0:M.dataset.proficiencyTab)??d[0].dataset.proficiencyTab;L&&g(L)});const h=e.querySelector("[data-add-equip]");h&&n&&$&&h.addEventListener("click",async()=>{var Q;const c=(b||[]).filter(P=>P.equipable&&!le(P).length);if(!c.length){S("Nessun oggetto equipaggiabile disponibile","error");return}const d=document.createElement("div");d.className="drawer-form";const f=document.createElement("label");f.className="field",f.innerHTML="<span>Oggetto</span>";const g=document.createElement("select");g.name="item_id",c.forEach(P=>{const H=document.createElement("option");H.value=P.id,H.textContent=P.name,g.appendChild(H)}),f.appendChild(g),d.appendChild(f);const L=document.createElement("fieldset");L.className="equip-slot-field",L.innerHTML="<legend>Punti del corpo</legend>";const M=document.createElement("div");M.className="equip-slot-list",Da.forEach(P=>{const H=document.createElement("label");H.className="checkbox",H.innerHTML=`<input type="checkbox" name="equip_slots" value="${P.value}" /> <span>${P.label}</span>`,M.appendChild(H)}),L.appendChild(M),d.appendChild(L);const N=await ce({title:"Equipaggia oggetto",submitLabel:"Equipaggia",content:d});if(!N)return;const E=N.getAll("equip_slots");if(!E.length){S("Seleziona almeno uno slot","error");return}const z=c.find(P=>String(P.id)===N.get("item_id"));if(!z)return;const O=((Q=n.data)==null?void 0:Q.proficiencies)||{};if(z.category==="weapon"){if(!z.weapon_type){S("Definisci il tipo di arma prima di equipaggiarla","error");return}if(!(z.weapon_type==="simple"?!!O.weapon_simple:!!O.weapon_martial)){S("Non hai la competenza per equipaggiare questo oggetto","error");return}}if(z.category==="armor")if(z.is_shield){if(!O.shield){S("Non hai la competenza per equipaggiare questo oggetto","error");return}}else if(z.armor_type){if(!(z.armor_type==="light"?!!O.armor_light:z.armor_type==="medium"?!!O.armor_medium:!!O.armor_heavy)){S("Non hai la competenza per equipaggiare questo oggetto","error");return}}else{S("Definisci il tipo di armatura prima di equipaggiarla","error");return}if(!z.sovrapponibile&&(b||[]).filter(H=>H.id!==z.id).filter(H=>le(H).some(Y=>E.includes(Y))).length){S("Uno o più slot selezionati sono già occupati","error");return}try{await ke(z.id,{equip_slot:E[0]||null,equip_slots:E}),S("Equipaggiamento aggiornato"),I(e)}catch{S("Errore aggiornamento equip","error")}}),e.querySelectorAll("[data-unequip]").forEach(c=>c.addEventListener("click",async()=>{const d=(b||[]).find(f=>f.id===c.dataset.unequip);if(d)try{await ke(d.id,{equip_slot:null,equip_slots:[]}),S("Equipaggiamento rimosso"),I(e)}catch{S("Errore aggiornamento equip","error")}}));const F=e.querySelector("[data-toggle-inspiration]");F&&n&&$&&F.addEventListener("click",async()=>{const c=n.data||{},d={...c,inspiration:!c.inspiration};await Z(n,d,"Ispirazione aggiornata",()=>I(e))});const D=e.querySelector("[data-toggle-concentration]");D&&n&&$&&D.addEventListener("click",async()=>{const c=n.data||{},d={...c,concentration_active:!c.concentration_active};await Z(n,d,"Concentrazione aggiornata",()=>I(e))}),e.querySelectorAll("[data-open-dice]").forEach(c=>c.addEventListener("click",()=>{va(c.dataset.openDice)})),e.querySelectorAll("[data-saving-throw-card]").forEach(c=>c.addEventListener("click",()=>{var L,M,N;if(!n)return;const d=c.dataset.savingThrowCard;if(!d)return;const f=Te(n),g=f.find(E=>E.value===d);g&&me({title:`Tiro salvezza • ${g.shortLabel||g.label}`,mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:f,value:g.value},allowInspiration:!!((L=n==null?void 0:n.data)!=null&&L.inspiration)&&$,weakPoints:Number((N=(M=n==null?void 0:n.data)==null?void 0:M.hp)==null?void 0:N.weak_points)||0,characterId:n.id})})),e.querySelectorAll("[data-skill-card]").forEach(c=>c.addEventListener("click",()=>{var L,M,N;if(!n)return;const d=c.dataset.skillCard;if(!d)return;const f=ma(n,b||[]),g=f.find(E=>E.value===d);g&&me({title:`Tiro abilità • ${g.shortLabel||g.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità",options:f,value:g.value},allowInspiration:!!((L=n==null?void 0:n.data)!=null&&L.inspiration)&&$,weakPoints:Number((N=(M=n==null?void 0:n.data)==null?void 0:M.hp)==null?void 0:N.weak_points)||0,characterId:n.id})})),e.querySelectorAll("[data-special-skill-card]").forEach(c=>c.addEventListener("click",()=>{var L,M,N;if(!n)return;const d=c.dataset.specialSkillCard;if(!d)return;const f=fa(n,b||[]),g=f.find(E=>E.value===d);g&&me({title:`Tiro abilità speciale • ${g.shortLabel||g.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità speciale",options:f,value:g.value},allowInspiration:!!((L=n==null?void 0:n.data)!=null&&L.inspiration)&&$,weakPoints:Number((N=(M=n==null?void 0:n.data)==null?void 0:M.hp)==null?void 0:N.weak_points)||0,characterId:n.id})})),e.querySelectorAll("[data-edit-resource]").forEach(c=>c.addEventListener("click",()=>{const d=T.find(f=>f.id===c.dataset.editResource);d&&He(n,()=>I(e),d)})),e.querySelectorAll("[data-roll-hit-dice]").forEach(c=>c.addEventListener("click",async()=>{await Gt(n,e)})),e.querySelectorAll("[data-roll-attack]").forEach(c=>c.addEventListener("click",d=>{d.target.closest("button")||Wt(c.dataset.rollAttack)})),e.querySelectorAll("[data-cycle-weapon-mode]").forEach(c=>c.addEventListener("click",()=>{if(!n)return;const d=c.dataset.cycleWeaponMode,f=b==null?void 0:b.find(E=>String(E.id)===d||E.name===d);if(!f)return;const g=aa(f).filter(E=>E.damageDie);if(g.length<=1)return;const L=f.selected_damage_mode||g[0].id,M=Math.max(g.findIndex(E=>E.id===L),0),N=g[(M+1)%g.length];ke(f.id,{selected_damage_mode:N.id}).then(E=>{const z=(ee().cache.items||b||[]).map(O=>String(O.id)===String(f.id)?{...O,...E||{},selected_damage_mode:N.id}:O);return de("items",z),ue({items:z})}).then(()=>{S(`Modalità ${N.label}`),I(e)}).catch(()=>S("Errore cambio modalità arma","error"))})),e.querySelectorAll("[data-roll-damage]").forEach(c=>c.addEventListener("click",()=>{var E,z,O;if(!n)return;const d=c.dataset.rollDamage;if(!d)return;if(d.startsWith("spell:")){const Q=d.replace("spell:",""),H=(Array.isArray((E=n.data)==null?void 0:E.spells)?n.data.spells:[]).find(V=>V.id===Q);if(!H)return;const Y=Number(H.cast_level??H.level)||0,B=Ce(H,Y);if(!B){S("Danno non calcolabile per questo trucchetto.","error");return}pe({keepOpen:!0,title:B.title,mode:"generic",notation:B.notation,modifier:B.modifier,rollType:"DMG",characterId:n==null?void 0:n.id,historyLabel:H.name||null,sneakAttackDice:((z=n==null?void 0:n.data)==null?void 0:z.sneak_attack_dice)||null});return}const f=d.startsWith("weapon:")?d.split(":"):[null,d,"default"],g=f[1]||d,L=f[2]||"default",M=b==null?void 0:b.find(Q=>String(Q.id)===g||Q.name===g);if(!M)return;const N=Xa(n,M,L);if(!N){S("Danno non calcolabile per questa arma.","error");return}pe({keepOpen:!0,title:N.title,mode:"generic",notation:N.notation,modifier:N.modifier,rollType:"DMG",characterId:n==null?void 0:n.id,historyLabel:M.name||null,sneakAttackDice:((O=n==null?void 0:n.data)==null?void 0:O.sneak_attack_dice)||null})}));const U=c=>{var g;const d=(g=c==null?void 0:c.damage_dice_notation)==null?void 0:g.trim();if(!d)return;const f=Ya(d);if(!(f!=null&&f.notation)){S("Notazione dado non valida per questa risorsa","error");return}pe({keepOpen:!0,title:c.name||"Tiro abilità",mode:"generic",notation:f.notation,modifier:Number(c.damage_modifier)||0,rollType:"GEN",characterId:n==null?void 0:n.id,historyLabel:c.name||null})},X=async c=>{const d=Number(c.max_uses)||0;if(!(!d||c.used>=d))try{await Le(c.id,{used:Math.min(c.used+1,d)}),S("Risorsa usata"),Qe(n)&&U(c),I(e)}catch{S("Errore utilizzo risorsa","error")}};e.querySelectorAll("[data-resource-card]").forEach(c=>{const d=async f=>{if(f.target.closest("button"))return;const g=T.find(L=>L.id===c.dataset.resourceCard);g&&ot(g,{onUse:()=>X(g),onReset:async()=>{try{await Le(g.id,{used:0}),S("Risorsa ripristinata"),I(e)}catch{S("Errore ripristino risorsa","error")}},onRecover:async()=>{try{await Le(g.id,{used:Math.max((Number(g.used)||0)-1,0)}),S("Carica recuperata"),I(e)}catch{S("Errore recupero carica","error")}}})};c.addEventListener("click",d)}),e.querySelectorAll("[data-use-resource]").forEach(c=>c.addEventListener("click",async()=>{const d=T.find(f=>f.id===c.dataset.useResource);d&&await X(d)})),e.querySelectorAll("[data-use-spell]").forEach(c=>c.addEventListener("click",async()=>{var O,Q;if(!n)return;const d=c.dataset.useSpell;if(!d)return;const g=(Array.isArray((O=n.data)==null?void 0:O.spells)?n.data.spells:[]).find(P=>P.id===d);if(!g||(Number(g.level)||0)<1)return;const M=await Nt(n,g);if(!M||!await Ve(n,M,()=>I(e)))return;const E=ee().characters.find(P=>oe(P.id)===oe(n.id))||n;if(g.concentration){const P=E.data||{};P.concentration_active||await Z(E,{...P,concentration_active:!0},"Concentrazione attiva",()=>I(e))}if(!Qe(E)){I(e);return}const z=Ce(g,M);if(!z){S("Danno non calcolabile per questo incantesimo.","error");return}pe({keepOpen:!0,title:z.title,mode:"generic",notation:z.notation,modifier:z.modifier,rollType:"DMG",characterId:n.id,historyLabel:g.name||null,sneakAttackDice:((Q=n==null?void 0:n.data)==null?void 0:Q.sneak_attack_dice)||null})})),e.querySelectorAll("[data-consume-spell-slot]").forEach(c=>c.addEventListener("click",async()=>{if(!n)return;const d=Number(c.dataset.consumeSpellSlot);!Number.isFinite(d)||d<1||await Ve(n,d,()=>I(e))})),e.querySelectorAll("[data-restore-spell-slot]").forEach(c=>c.addEventListener("click",async()=>{if(!n)return;const d=Number(c.dataset.restoreSpellSlot);!Number.isFinite(d)||d<1||await lt(n,d,()=>I(e))})),e.querySelectorAll("[data-delete-resource]").forEach(c=>c.addEventListener("click",async()=>{const d=T.find(g=>g.id===c.dataset.deleteResource);if(!(!d||!await Me({title:"Conferma eliminazione risorsa",message:`Stai per eliminare la risorsa "${d.name}". Questa azione non può essere annullata.`,confirmLabel:"Elimina"})))try{await ka(d.id),S("Risorsa eliminata"),I(e)}catch{S("Errore eliminazione risorsa","error")}})),e.querySelectorAll("[data-death-save]").forEach(c=>c.addEventListener("click",async()=>{if(!n||!$)return;const{deathSave:d,deathSaveIndex:f}=c.dataset,g=Number(f);if(!d||!g)return;const L=n.data||{},M=L.death_saves||{},N=Math.max(0,Math.min(3,Number(M[d])||0)),E=g===N?N-1:g,z={successes:Math.max(0,Math.min(3,d==="successes"?E:Number(M.successes)||0)),failures:Math.max(0,Math.min(3,d==="failures"?E:Number(M.failures)||0))};await Z(n,{...L,death_saves:z},"Tiri salvezza contro morte aggiornati",()=>I(e))})),e.querySelectorAll("[data-weakness-level]").forEach(c=>c.addEventListener("click",async()=>{if(!n||!$)return;const d=Number(c.dataset.weaknessLevel);if(!d)return;const f=n.data||{},g=f.hp||{},L=Math.max(0,Math.min(6,Number(g.weak_points)||0));await Z(n,{...f,hp:{...g,weak_points:d===L?0:d}},"Punti indebolimento aggiornati",()=>I(e))}));const G=e.querySelector(".character-avatar");G&&(G.setAttribute("draggable","false"),G.addEventListener("click",c=>{c.preventDefault(),rt(n)}),G.addEventListener("contextmenu",c=>{c.preventDefault()}),G.addEventListener("dragstart",c=>{c.preventDefault()})),e.querySelectorAll("[data-item-image]").forEach(c=>{c.setAttribute("draggable","false"),c.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const f=b==null?void 0:b.find(g=>String(g.id)===c.dataset.itemImage);f&&Be(f)})}),e.querySelectorAll("[data-item-preview]").forEach(c=>{c.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();const f=b==null?void 0:b.find(g=>String(g.id)===c.dataset.itemPreview);f&&Be(f)})}),wt(e,a)}finally{Ie(!1)}}function ns(){na()}function na(){Ge||(document.addEventListener("click",async e=>{if(!e.target.closest("[data-actions-fab]"))return;const t=e.target.closest("[data-hp-action]"),s=e.target.closest("[data-money-action]"),o=e.target.closest("[data-rest]"),l=e.target.closest("[data-open-dice]"),i=e.target.closest("[data-add-loot]"),r=e.target.closest("[data-edit-conditions]"),p=e.target.closest("[data-edit-resistances]"),u=e.target.closest("[data-edit-roll-adjustments]");if(!t&&!s&&!o&&!l&&!i&&!r&&!p&&!u)return;e.preventDefault(),Ct();const m=we??null;if(t){await Qt(t.dataset.hpAction,m);return}if(s){if((window.location.hash.replace("#/","")||"home")==="inventory")return;await jt(s.dataset.moneyAction,m);return}if(o){await Kt(o.dataset.rest,m);return}if(l){va(l.dataset.openDice);return}if(i){await It();return}if(r){await ia(m);return}if(p){await Bt(m);return}u&&await zt(m)}),Ge=!0)}function Ct(){const e=document.querySelector("[data-actions-fab]"),a=document.querySelector("[data-actions-toggle]");!e||!e.classList.contains("is-open")||(e.classList.remove("is-open"),a==null||a.setAttribute("aria-expanded","false"))}function se(){const e=ee(),{user:a,offline:t,characters:s,activeCharacterId:o}=e,l=oe(o);return{activeCharacter:s.find(r=>oe(r.id)===l),canEditCharacter:!!a&&!t}}async function ia(e){const{activeCharacter:a,canEditCharacter:t}=se();if(!a||!t)return;const s=await Za(a);if(!s)return;const o=s.getAll("conditions");await Z(a,{...a.data,conditions:o},"Condizioni aggiornate",()=>{e&&I(e)})}function xt(e){var t;const a=((t=e==null?void 0:e.data)==null?void 0:t.roll_adjustments)||{};return{attack_rolls:a.attack_rolls||{},saving_throws:a.saving_throws||{},skills:a.skills||{}}}function qt(e){const a=xt(e),t=ee().cache.items||[],s=document.createElement("div");s.className="modal-form-grid compact-settings-form compact-settings-form--rolls";const o=[{value:"",label:"Nessuno"},{value:"advantage",label:"Vantaggio"},{value:"disadvantage",label:"Svantaggio"}],l=(i,r,p)=>{const u=document.createElement("section");u.className="character-edit-section compact-settings-section",u.innerHTML=`<h4>${i}</h4><p class="muted compact-settings-help">Indica solo gli override manuali; gli effetti automatici restano visibili sotto la riga.</p>`;const m=document.createElement("div");m.className="compact-setting-grid compact-setting-grid--roll",p.forEach(y=>{var k;const w=((k=a[r])==null?void 0:k[y.key])||{},n=ua(e,t,r,y),A=re(n).rollMode||"",v=n.length===1&&n[0].source||"",$=w.mode||A,T=w.source||v,b=document.createElement("div");b.className="compact-setting-row compact-setting-row--roll";const x=document.createElement("label");x.className="field compact-setting-field";const q=document.createElement("span");q.textContent=y.label;const _=Ne(o,$);_.name=`roll_${r}_${y.key}_mode`,x.append(q,_);const j=document.createElement("label");j.className="field compact-setting-field";const C=document.createElement("span");C.textContent="Fonte manuale";const R=Ne(oa,T);if(R.name=`roll_${r}_${y.key}_source`,j.append(C,R),b.append(x,j),n.length){const h=document.createElement("p");h.className="muted compact-setting-note",h.textContent=`Automatico: ${n.map(F=>F.reason).join(" ")}`,b.appendChild(h)}m.appendChild(b)}),u.appendChild(m),s.appendChild(u)};return l("Tiri per colpire","attack_rolls",ra(e,t)),l("Tiri salvezza","saving_throws",Ae),l("Abilità","skills",Ee),s}function Rt(e,a){const t=ee().cache.items||[],s={attack_rolls:{},saving_throws:{},skills:{}};return[{scope:"attack_rolls",entries:ra(a,t)},{scope:"saving_throws",entries:Ae},{scope:"skills",entries:Ee}].forEach(({scope:o,entries:l})=>{l.forEach(i=>{var n,A;const r=((n=e.get(`roll_${o}_${i.key}_mode`))==null?void 0:n.toString())||"",p=((A=e.get(`roll_${o}_${i.key}_source`))==null?void 0:A.toString().trim())||"",u=ua(a,t,o,i),m=re(u).rollMode||"",y=u.length===1&&u[0].source||"";(r==="advantage"||r==="disadvantage")&&!(r===m&&p===y)&&(s[o][i.key]={mode:r,source:p})})}),s}async function zt(e){const{activeCharacter:a,canEditCharacter:t}=se();if(!a||!t)return;const s=await ce({title:"Vantaggi / Svantaggi situazionali",submitLabel:"Salva",content:qt(a),cardClass:"modal-card--wide"});s&&await Z(a,{...a.data,roll_adjustments:Rt(s,a)},"Vantaggi/svantaggi aggiornati",()=>{e&&I(e)})}function Tt(e){var o;const a=((o=e==null?void 0:e.data)==null?void 0:o.damage_defenses)||{},t=fe.reduce((l,i)=>{const r=i.group||"Altro";return l[r]||(l[r]=[]),l[r].push(i),l},{}),s=document.createElement("div");return s.className="modal-form-grid compact-settings-form compact-settings-form--defenses",s.innerHTML=Object.entries(t).map(([l,i])=>`
    <section class="character-edit-section compact-settings-section">
      <h4>${l}</h4>
      <div class="compact-setting-grid compact-setting-grid--defense">
        ${i.map(r=>`
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
  `).join(""),s}function Dt(e){return{resistances:fe.filter(a=>e.has(`damage_resistance_${a.key}`)).map(a=>a.key),immunities:fe.filter(a=>e.has(`damage_immunity_${a.key}`)).map(a=>a.key)}}async function Bt(e){const{activeCharacter:a,canEditCharacter:t}=se();if(!a||!t)return;const s=await ce({title:"Resistenze & Immunità",submitLabel:"Salva",content:Tt(a),cardClass:"modal-card--wide"});s&&await Z(a,{...a.data,damage_defenses:Dt(s)},"Resistenze aggiornate",()=>{e&&I(e)})}async function It(e){const{activeCharacter:a}=se(),t=ee();if(!a)return;if(t.offline){S("Loot disponibile solo online.","error");return}const o=ea(a)==="kg"?"0.1":"1",l=await ce({title:"Aggiungi loot rapido",submitLabel:"Aggiungi",content:Ba(o),onOpen:({fieldsEl:i})=>{Fa(i)}});if(l)try{await za({user_id:a.user_id,character_id:a.id,name:l.get("name"),qty:Number(l.get("qty")),weight:Number(l.get("weight")),volume:Number(l.get("volume"))||0,value_cp:Number(l.get("value_cp")),category:"loot",equipable:!1,equip_slot:null,equip_slots:[],sovrapponibile:!1,is_magic:!1,max_volume:null}),S("Loot aggiunto")}catch{S("Errore loot","error")}}function xe(e,{min:a=null,max:t=null}={}){if(!(e instanceof HTMLInputElement)||e.type!=="number"||e.closest(".modal-value-stepper"))return;const s=document.createElement("div");s.className="number-stepper modal-value-stepper";const o=document.createElement("button");o.type="button",o.className="number-stepper__button modal-value-stepper__button",o.textContent="−",o.setAttribute("aria-label","Diminuisci valore");const l=document.createElement("button");l.type="button",l.className="number-stepper__button modal-value-stepper__button",l.textContent="+",l.setAttribute("aria-label","Aumenta valore");const i=e.parentNode;if(!i)return;i.insertBefore(s,e),s.append(o,e,l);const r=u=>Number.isFinite(u)?u:0,p=u=>{const m=r(e.valueAsNumber),y=Number(e.step),w=Number.isFinite(y)&&y>0?y:1;let n=m+w*u;const A=a??(e.min!==""?Number(e.min):null),v=t??(e.max!==""?Number(e.max):null);Number.isFinite(A)&&(n=Math.max(A,n)),Number.isFinite(v)&&(n=Math.min(v,n)),e.value=String(n),e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))};o.addEventListener("click",()=>p(-1)),l.addEventListener("click",()=>p(1))}async function jt(e,a){const{activeCharacter:t,canEditCharacter:s}=se();if(!t)return;if(!s){S("Azioni denaro disponibili solo con profilo online","error");return}const o=ee();let l=o.cache.wallet;if(!l&&!o.offline)try{l=await Na(t.id),de("wallet",l),l&&await ue({wallet:l})}catch{S("Errore caricamento wallet","error")}const p=await ce({title:e==="pay"?"Paga monete":"Ricevi monete",submitLabel:e==="pay"?"Paga":"Ricevi",content:Ca({direction:e}),onOpen:({fieldsEl:v})=>{const $=v==null?void 0:v.querySelector('input[name="amount"]');$&&xe($,{min:0})}});if(!p)return;l||(l={user_id:t.user_id,character_id:t.id,cp:0,sp:0,gp:0,pp:0});const u=p.get("coin"),m=Number(p.get("amount")||0),y={cp:u==="cp"?m:0,sp:u==="sp"?m:0,gp:u==="gp"?m:0,pp:u==="pp"?m:0},w=e==="pay"?-1:1,n=Object.fromEntries(Object.entries(y).map(([v,$])=>[v,$*w])),A=xa(l,n);try{const v=await qa({...A,user_id:l.user_id,character_id:l.character_id});await Ra({user_id:l.user_id,character_id:l.character_id,direction:e,amount:n,reason:p.get("reason"),occurred_on:p.get("occurred_on")}),de("wallet",v),await ue({wallet:v}),S("Wallet aggiornato"),a&&I(a)}catch{S("Errore aggiornamento denaro","error")}}const Ft=Je.reduce((e,a)=>(e[a.key]=a.label,e),{}),Xe={advantage:["invisibile"],disadvantage:["accecato","avvelenato","intralciato","prono","spaventato"]},Ye={disadvantage:{dex:["intralciato"]},autoFail:{str:["paralizzato","privo_di_sensi","stordito"],dex:["paralizzato","privo_di_sensi","stordito"]}},oa=[{value:"",label:"Seleziona fonte"},{value:"situational",label:"Situazionale"},{value:"effect",label:"Effetto temporaneo"},{value:"condition",label:"Condizione"},{value:"armor",label:"Armatura"},{value:"racial",label:"Abilità razziale"},{value:"class",label:"Privilegio di classe"},{value:"spell",label:"Incantesimo"},{value:"item",label:"Oggetto magico/equipaggiamento"},{value:"other",label:"Altro"}];function $e(e){const a=(e==null?void 0:e.data)||{};return Array.isArray(a.conditions)?a.conditions:a.condition?[a.condition]:[]}function ge(e){return e.map(a=>Ft[a]||a).filter(Boolean)}function la(e=[]){return(e||[]).some(a=>a.category==="armor"&&a.armor_type==="heavy"&&a.equipable&&le(a).length)}function ra(e,a=[]){const t=(e==null?void 0:e.data)||{},o=(a||[]).filter(m=>m.category==="weapon"&&m.equipable&&le(m).length).map(m=>({key:`weapon:${m.id??m.name}`,label:m.name||"Arma"})),i=(Array.isArray(t.spells)?t.spells:[]).filter(m=>(m.kind==="cantrip"||Number(m.level)===0)&&m.attack_roll&&m.damage_die).map(m=>({key:`spell:${m.id}`,label:m.name||"Incantesimo"})),u=!!((t.spellcasting||{}).ability&&K(t.proficiency_bonus)!==null)?[{key:"spell-attack",label:"Incantesimi"}]:[];return[...o,...i,...u]}function ze(e){const a=$e(e),t=Xe.advantage.filter(l=>a.includes(l)),s=Xe.disadvantage.filter(l=>a.includes(l)),o=[];return t.length&&o.push({mode:"advantage",source:"condition",reason:`Vantaggio: condizioni ${ge(t).join(", ")}.`}),s.length&&o.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${ge(s).join(", ")}.`}),o}function ca(e,a,t){const o=$e(e).includes("avvelenato")?["avvelenato"]:[],l=la(a),i=[];return o.length&&i.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${ge(o).join(", ")}.`}),t.key==="stealth"&&l&&i.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su Furtività."}),i}function Pt(e,a,t){const o=$e(e).includes("avvelenato")?["avvelenato"]:[],l=la(a),i=[];return o.length&&i.push({mode:"disadvantage",source:"condition",reason:`Svantaggio: condizioni ${ge(o).join(", ")}.`}),t==="dex"&&l&&i.push({mode:"disadvantage",source:"armor",reason:"Svantaggio automatico: armatura pesante su tiri speciali basati su DES."}),i}function da(e,a){const t=pa($e(e),a.key);return t.rollMode?[{mode:t.rollMode,source:"condition",reason:t.rollModeReason}]:[]}function ua(e,a,t,s){return t==="attack_rolls"?ze(e):t==="skills"?ca(e,a,s):t==="saving_throws"?da(e,s):[]}function Ht(e){var a;return((a=oa.find(t=>t.value===e))==null?void 0:a.label)||e}function ye(e,a,t,s){var p,u,m,y;const o=(m=(u=(p=e==null?void 0:e.data)==null?void 0:p.roll_adjustments)==null?void 0:u[a])==null?void 0:m[t];if(!o||o.mode!=="advantage"&&o.mode!=="disadvantage")return null;const l=o.mode==="advantage"?"Vantaggio":"Svantaggio",i=(y=o.source)==null?void 0:y.toString().trim(),r=i?Ht(i):"Situazionale";return{mode:o.mode,reason:`${l}: ${s} (${r}).`}}function re(e){const a=e.filter(Boolean),t=a.filter(o=>o.mode==="advantage").map(o=>o.reason).filter(Boolean),s=a.filter(o=>o.mode==="disadvantage").map(o=>o.reason).filter(Boolean);return t.length&&s.length?{rollMode:null,rollModeReason:`Vantaggio e svantaggio si annullano. ${[...t,...s].join(" ")}`}:t.length?{rollMode:"advantage",rollModeReason:t.join(" ")}:s.length?{rollMode:"disadvantage",rollModeReason:s.join(" ")}:{rollMode:null,rollModeReason:null}}function pa(e,a){const s=(Ye.autoFail[a]||[]).filter(i=>e.includes(i));if(s.length)return{disabled:!0,disabledReason:`Condizioni: ${ge(s).join(", ")}`};const l=(Ye.disadvantage[a]||[]).filter(i=>e.includes(i));return l.length?{rollMode:"disadvantage",rollModeReason:`Svantaggio: condizioni ${ge(l).join(", ")}.`}:{}}function ma(e,a=[]){const t=e.data||{},s=t.abilities||{},o=K(t.proficiency_bonus),l=t.skills||{},i=t.skill_mastery||{};return Ee.map(r=>{const p=!!l[r.key],u=!!i[r.key],m=be(s[r.ability],o,p?u?2:1:0),y=m??0,w=ca(e,a,r);w.push(ye(e,"skills",r.key,r.label));const n=re(w);return{value:r.key,label:`${r.label} (${W(m)})`,shortLabel:r.label,modifier:y,rollMode:n.rollMode,rollModeReason:n.rollModeReason}})}function fa(e,a=[]){const t=e.data||{},s=t.abilities||{},o=K(t.proficiency_bonus),l=Array.isArray(t.special_skill_rolls)?t.special_skill_rolls:[];return(l.some(p=>{const u=String((p==null?void 0:p.id)??"").toLowerCase(),m=String((p==null?void 0:p.name)??"").trim().toLowerCase();return u==="initiative"||u==="default_initiative"||m==="iniziativa"})?l:[{id:"default_initiative",name:"Iniziativa",ability:"dex",proficient:!1,mastery:!1,bonus:0},...l]).map((p,u)=>{var x;const m=ae[p.ability]?p.ability:"str",y=!!p.proficient,w=!!p.mastery&&y,n=be(s[m],o,y?w?2:1:0),A=Number(p.bonus)||0,v=(n??0)+A,$=((x=p.name)==null?void 0:x.trim())||`Tiro speciale ${u+1}`,T=Pt(e,a,m),b=re(T);return{value:String(p.id??u),label:`${$} (${W(v)})`,shortLabel:$,modifier:v,rollMode:b.rollMode,rollModeReason:b.rollModeReason}})}function Te(e){const a=e.data||{},t=a.abilities||{},s=K(a.proficiency_bonus),o=a.saving_throws||{},l=$e(e);return Ae.map(i=>{const r=!!o[i.key],p=be(t[i.key],s,r?1:0),u=p??0,m=pa(l,i.key),y=ye(e,"saving_throws",i.key,i.label),w=m.disabled?{rollMode:null,rollModeReason:null}:re([...da(e,i),y]),n=m.disabled?" · fallimento diretto":"";return{value:i.key,label:`${i.label} (${W(p)})${n}`,shortLabel:ae[i.key]||i.label,modifier:u,rollMode:w.rollMode,rollModeReason:w.rollModeReason,disabled:m.disabled||!1,disabledReason:m.disabledReason||null}})}function ga(e,a=[]){var T;const t=e.data||{},s=Number(t.attack_bonus_melee??t.attack_bonus)||0,o=Number(t.attack_bonus_ranged??t.attack_bonus)||0,l=(a||[]).filter(b=>b.category==="weapon"&&b.equipable&&le(b).length),i=K(t.proficiency_bonus)??0,r=t.proficiencies||{},p=ze(e),u=l.map(b=>{var D;const x=b.weapon_range||(b.range_normal?"ranged":"melee"),q=b.attack_ability||(x==="ranged"?"dex":"str"),_=ne((D=t.abilities)==null?void 0:D[q])??0,C=(b.weapon_type==="simple"?!!r.weapon_simple:b.weapon_type==="martial"?!!r.weapon_martial:!1)?i:0,R=x==="ranged"?o:s,k=_+C+(Number(b.attack_modifier)||0)+R,h=`weapon:${b.id??b.name}`,F=re([...p,ye(e,"attack_rolls",h,b.name)]);return{value:h,label:`${b.name} (${W(k)})`,shortLabel:b.name,modifier:k,rollMode:F.rollMode,rollModeReason:F.rollModeReason}}),y=(t.spellcasting||{}).ability,w=y?(T=t.abilities)==null?void 0:T[y]:null,n=ne(w),A=n===null||i===null?null:n+i,$=(Array.isArray(t.spells)?t.spells:[]).filter(b=>(b.kind==="cantrip"||Number(b.level)===0)&&b.attack_roll&&b.damage_die);return y&&A!==null&&$.forEach(b=>{const x=`spell:${b.id}`,q=re([...p,ye(e,"attack_rolls",x,b.name)]);u.push({value:x,label:`${b.name} (${W(A)})`,shortLabel:b.name,modifier:A,rollMode:q.rollMode,rollModeReason:q.rollModeReason})}),u}function Ot(e){var m;const a=e.data||{},t=K(a.proficiency_bonus),o=(a.spellcasting||{}).ability,l=o?(m=a.abilities)==null?void 0:m[o]:null,i=ne(l);if(!o||i===null||t===null)return[];const r=i+t,p="spell-attack",u=re([...ze(e),ye(e,"attack_rolls",p,"Incantesimi")]);return[{value:p,label:`Incantesimi (${W(r)})`,shortLabel:"Incantesimi",modifier:r,rollMode:u.rollMode,rollModeReason:u.rollModeReason}]}function qe(e){var a;return((a=fe.find(t=>t.key===e))==null?void 0:a.label)||e}function Vt(e,a,t){var r;const s=Math.max(Number(a)||0,0);if(!t)return{amount:s,reason:null};const o=((r=e==null?void 0:e.data)==null?void 0:r.damage_defenses)||{},l=Array.isArray(o.resistances)?o.resistances:[],i=Array.isArray(o.immunities)?o.immunities:[];return i.includes("all")||i.includes(t)?{amount:0,reason:`immunità a ${qe(t)}`}:l.includes("all")||l.includes(t)?{amount:Math.floor(s/2),reason:`resistenza a ${qe(t)}`}:{amount:s,reason:null}}function ba(e,a){if(!(a!=null&&a.consumes_ammunition))return null;const t=a.required_ammunition_type||a.ammunition_type;return(e||[]).filter(s=>s.id!==a.id).filter(s=>s.category!=="container").filter(s=>!t||s.ammunition_type===t).filter(s=>Number(s.qty)>0).sort((s,o)=>String(s.name||"").localeCompare(String(o.name||""),"it",{sensitivity:"base"}))[0]||null}async function Ut(e,a){const t=ba(e,a);if(!t)return!1;const s=Math.max((Number(t.qty)||0)-1,0),o=await ke(t.id,{qty:s}),i=(ee().cache.items||[]).map(r=>String(r.id)===String(t.id)?{...r,...o||{},qty:s}:r);return de("items",i),await ue({items:i}),S(`${t.name} consumato (${s} rimasti)`),!0}function Wt(e){var u,m,y;const{activeCharacter:a,canEditCharacter:t}=se();if(!a||!e)return;const s=ee().cache.items||[],o=ga(a,s),l=o.find(w=>w.value===e);if(!l)return;const i=e.startsWith("weapon:")?e.replace("weapon:",""):null,r=i?s.find(w=>String(w.id)===i||w.name===i):null;if(r!=null&&r.consumes_ammunition&&!ba(s,r)){S("Munizioni esaurite o non disponibili per questa arma.","error");return}let p=!1;me({title:`Tiro per Colpire • ${l.shortLabel||l.label}`,mode:"d20",rollType:"TC",selection:{label:"Attacco",options:o,value:l.value},allowInspiration:!!((u=a==null?void 0:a.data)!=null&&u.inspiration)&&t,weakPoints:Number((y=(m=a==null?void 0:a.data)==null?void 0:m.hp)==null?void 0:y.weak_points)||0,characterId:a.id,historyLabel:l.shortLabel||l.label,onRollComplete:async()=>{if(!(!(r!=null&&r.consumes_ammunition)||p)){p=!0;try{await Ut(ee().cache.items||s,r)}catch{S("Errore consumo munizioni","error")}}}})}function va(e){var u,m,y,w,n;const{activeCharacter:a,canEditCharacter:t}=se(),s=ee().cache.items||[],o=!!((u=a==null?void 0:a.data)!=null&&u.inspiration)&&t,l=Number((y=(m=a==null?void 0:a.data)==null?void 0:m.hp)==null?void 0:y.weak_points)||0,i=o&&a?async()=>{const A=a.data||{};A.inspiration&&await Z(a,{...A,inspiration:!1},"Ispirazione consumata",we?()=>I(we):null)}:null,p={"saving-throws":{title:"Tiro Salvezza",mode:"d20",rollType:"TS",selection:a?{label:"Tiro salvezza",options:Te(a)}:null},skills:{title:"Tiro Abilità",mode:"d20",rollType:"TA",selection:a?{label:"Abilità",options:ma(a,s)}:null},"special-skills":{title:"Tiro Abilità Speciale",mode:"d20",rollType:"TA",selection:a?{label:"Abilità speciale",options:fa(a,s)}:null},"attack-roll":{title:"Tiro per Colpire",mode:"d20",rollType:"TC",selection:a?{label:"Attacco",options:ga(a,s)}:null},"spell-attack":{title:"Tiro per Colpire Incantesimi",mode:"d20",rollType:"TC",selection:a?{label:"Incantesimi",options:Ot(a)}:null},roller:{title:"Lancia Dadi generico",mode:"generic",rollType:"GEN"}}[e]??{title:"Lancia dadi",mode:"generic"};if(e==="spell-attack"&&!((n=(w=p.selection)==null?void 0:w.options)!=null&&n.length)){S("Configura abilità da incantatore e bonus competenza per usare questo tiro.","error");return}me({...p,allowInspiration:o,onConsumeInspiration:i,weakPoints:l,characterId:a==null?void 0:a.id})}async function Kt(e,a){var o,l;const{activeCharacter:t}=se();if(!(!t||!await Me({title:"Conferma riposo",message:e==="long_rest"?"Stai per effettuare un riposo lungo: risorse, slot e recuperi verranno aggiornati in base alle regole configurate.":"Stai per effettuare un riposo breve: verranno aggiornate solo le risorse che si recuperano con questo tipo di riposo.",confirmLabel:"Conferma riposo"})))try{await ya(t.id,e),S(e==="long_rest"?"Riposo lungo completato":"Riposo breve completato");const r=await Ze(t.id);de("resources",r),await ue({resources:r});const p=Qa(t.data,e);if(p?await Z(t,p,null,a?()=>I(a):null):a&&I(a),e==="long_rest"){const u=ee().characters.find(m=>m.id===t.id);(l=(o=u==null?void 0:u.data)==null?void 0:o.spellcasting)!=null&&l.can_prepare&&await ta(u,a?()=>I(a):null)}}catch{S("Errore aggiornamento risorse","error")}}async function Gt(e,a){var $,T,b,x,q,_,j,C;const{canEditCharacter:t}=se();if(!e)return;if(!t){S("Azioni HP disponibili solo con profilo online","error");return}const s=(($=e.data)==null?void 0:$.hit_dice)||{},o=Number(s.used)||0,l=Number(s.max)||0,i=Math.max(l-o,0),r=Re(s.die);if(!r){S("Configura un dado vita valido","error");return}if(i<=0){S("Nessun dado vita disponibile","error");return}const p=ne((b=(T=e.data)==null?void 0:T.abilities)==null?void 0:b.con)??0;let u=1;const y=await pe({keepOpen:!1,title:`Dado vita • ${s.die||`d${r}`}`,mode:"generic",notation:`1d${r}`,modifier:p,rollType:"GEN",characterId:e.id,historyLabel:"Dado vita",genericDiceMax:i,warning:"Attenzione: ogni dado vita lanciato verrà sottratto ai dadi vita disponibili.",onRollComplete:({diceCount:R})=>{u=Math.max(Number(R)||1,1)}}).waitForRoll;if(!y||y<=0)return;if(u>i){S(`Hai solo ${i} dadi vita disponibili`,"error");return}const w=Number((q=(x=e.data)==null?void 0:x.hp)==null?void 0:q.current)||0,n=(j=(_=e.data)==null?void 0:_.hp)==null?void 0:j.max,A=w+Number(y),v=n!=null?Math.min(A,Number(n)):A;await Z(e,{...e.data,hp:{...(C=e.data)==null?void 0:C.hp,current:v},hit_dice:{...s,used:Math.min(o+u,l)}},`PF curati +${y} (${u}d${r})`,()=>{a&&I(a)})}async function Qt(e,a){var f,g,L,M,N,E,z,O,Q,P,H;const{activeCharacter:t,canEditCharacter:s}=se();if(!t)return;if(!s){S("Azioni HP disponibili solo con profilo online","error");return}const i=await ce({title:e==="heal"?"Cura PF":"Subisci danno",submitLabel:e==="heal"?"Cura":"Danno",content:Xt(t,{allowHitDice:!1,allowTempHp:e==="heal",allowMaxOverride:e==="damage"})});if(!i)return;const r=i.has("use_hit_dice"),p=i.has("temp_hp"),u=((f=t.data)==null?void 0:f.hit_dice)||{},m=((g=t.data)==null?void 0:g.abilities)||{},y=Number(u.used)||0,w=Number(u.max)||0,n=Re(u.die),A=Math.max(Number(i.get("hit_dice_count"))||1,1);let v=Number(i.get("amount"));const $=v,T=e==="damage"&&((L=i.get("damage_type"))==null?void 0:L.toString())||"";if(e==="heal"&&r){if(!n){S("Configura un dado vita valido","error");return}if(y>=w){S("Nessun dado vita disponibile","error");return}const Y=Math.max(w-y,0);if(A>Y){S(`Hai solo ${Y} dadi vita disponibili`,"error");return}const B=ne(m.con)??0,J=Array.from({length:A},()=>Ga(n)).reduce((ie,ve)=>ie+ve,0);v=Math.max(J+B*A,1)}if(!v||v<=0){S("Inserisci un valore valido","error");return}const b=e==="damage"?Vt(t,v,T):{amount:v,reason:null};e==="damage"&&(v=b.amount);const x=Number((N=(M=t.data)==null?void 0:M.hp)==null?void 0:N.current)||0,q=Number((z=(E=t.data)==null?void 0:E.hp)==null?void 0:z.temp)||0,_=(Q=(O=t.data)==null?void 0:O.hp)==null?void 0:Q.max,j=i.get("hp_max_override"),C=j===null||j===""?null:Number(j);if(e==="damage"&&C!==null&&(!Number.isFinite(C)||C<=0)){S("Inserisci un massimo PF valido","error");return}let R=x,k=q;if(e==="heal"&&p)k=q+v;else if(e==="heal")R=x+v;else{const Y=Math.min(q,v);k=q-Y;const B=v-Y;R=Math.max(x-B,0)}const h=C??_,F=h!=null?Math.min(R,Number(h)):R,D=e==="heal"&&r?{...u,used:Math.min(y+A,w)}:u,U=e==="damage"&&T?` ${qe(T).toLowerCase()}`:"",X=e==="damage"&&b.reason?` (da ${$}, ${b.reason})`:"",G=e==="heal"?`${p?"HP temporanei +":"PF curati +"}${v}${r?` (${A}d${n})`:""}`:`Danno${U} ${v}${X}`,c=e==="damage"&&Number(v)>0&&!!((P=t.data)!=null&&P.concentration_active),d=async()=>{var V,J,ie;if(a&&I(a),!c)return;const Y=Te(t),B=Y.find(ve=>ve.value==="con");!B||B.disabled||me({title:"Tiro salvezza concentrazione • COS",mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:Y,value:B.value},allowInspiration:!!((V=t==null?void 0:t.data)!=null&&V.inspiration)&&s,weakPoints:Number((ie=(J=t==null?void 0:t.data)==null?void 0:J.hp)==null?void 0:ie.weak_points)||0,characterId:t.id,historyLabel:"TS concentrazione"})};await Z(t,{...t.data,hp:{...(H=t.data)==null?void 0:H.hp,current:F,temp:k,max:C??_},hit_dice:D},G,d)}function me({title:e,mode:a,selection:t=null,allowInspiration:s=!1,onConsumeInspiration:o=null,rollType:l=null,weakPoints:i=0,characterId:r=null,historyLabel:p=null,onRollComplete:u=null}){pe({keepOpen:!0,title:e,mode:a,selection:t,allowInspiration:s,onConsumeInspiration:o,rollType:l,weakPoints:i,characterId:r,historyLabel:p,onRollComplete:u})}function Xt(e,{allowHitDice:a=!0,allowTempHp:t=!1,allowMaxOverride:s=!1}={}){var j,C,R;const o=(k,h={})=>{const F=k==null?void 0:k.querySelector('input[type="number"]');F&&Pa(F,h)},l=document.createElement("div");l.className="modal-form-grid hp-shortcut-fields";const i=Se({label:"Valore",name:"amount",type:"number",value:"1"});i.classList.add("hp-shortcut-fields__amount");const r=i.querySelector("input");r&&xe(r,{min:1}),r&&(r.min="1",r.required=!0);const p=document.createElement("div");if(p.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",p.appendChild(i),t){const k=document.createElement("div");k.className="modal-toggle-field",k.innerHTML=`
      <span class="modal-toggle-field__label">HP temporanei</span>
      <label class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="temp_hp" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </label>
    `,p.appendChild(k)}if(l.appendChild(p),!a){if(s){const k=document.createElement("label");k.className="field hp-shortcut-fields__damage-type";const h=document.createElement("span");h.textContent="Tipo di danno";const F=Ne([{value:"",label:"Nessun tipo (danno normale)"},...fe.map(X=>({value:X.key,label:X.label}))],"");F.name="damage_type",k.append(h,F),p.appendChild(k);const D=Se({label:"Nuovo massimo PF",name:"hp_max_override",type:"number",value:((C=(j=e==null?void 0:e.data)==null?void 0:j.hp)==null?void 0:C.max)??""});D.classList.add("hp-shortcut-fields__max");const U=D.querySelector("input");U&&(xe(U,{min:1}),U.min="1"),p.appendChild(D)}return l}const u=((R=e==null?void 0:e.data)==null?void 0:R.hit_dice)||{},m=Number(u.used)||0,y=Number(u.max)||0,w=Math.max(y-m,0),n=Re(u.die),A=w>0&&n,v=document.createElement("div");v.className="modal-toggle-field";const $=u.die?`${u.die}`:"dado vita";v.innerHTML=`
    <span class="modal-toggle-field__label">Usa dado vita (${$}) · rimasti ${w}/${y||"-"}</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="use_hit_dice" ${A?"":"disabled"} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const T=document.createElement("label");T.className="field hit-dice-count hp-shortcut-fields__count",T.innerHTML=`
    <span>Numero dadi vita</span>
    <input type="number" name="hit_dice_count" min="1" max="${w}" value="1" />
  `,o(T,{decrementLabel:"Riduci dadi vita",incrementLabel:"Aumenta dadi vita"});const b=document.createElement("div");if(b.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",b.append(v,T),l.appendChild(b),!A){const k=document.createElement("p");k.className="muted",k.textContent="Nessun dado vita disponibile o configurato.",l.appendChild(k)}const x=v.querySelector("input"),q=T.querySelector("input");q&&(q.required=!1);const _=()=>{const k=x==null?void 0:x.checked;r&&(r.disabled=!!k,r.required=!k,k?r.value="":r.value||(r.value="1"),q&&(q.disabled=!k,q.required=!!k,k||(q.value="1")))};return x==null||x.addEventListener("change",_),_(),l}export{ns as bindGlobalFabHandlers,I as renderHome};
