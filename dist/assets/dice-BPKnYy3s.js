import{j as ot,n as Et}from"./index-iCVUMj6Q.js";let Me=null;const Wt=["/dungeons-dragons-app/libs/three.min.js","/dungeons-dragons-app/libs/cannon.min.js","/dungeons-dragons-app/libs/teal.js","/dungeons-dragons-app/dice-roller/dice.js","/dungeons-dragons-app/dice-roller/main.js"];function _t(n){return new Promise((l,r)=>{const c=document.querySelector(`script[data-legacy-dice="${n}"]`);if((c==null?void 0:c.dataset.loaded)==="true")return l();if(c){c.addEventListener("load",()=>l(),{once:!0}),c.addEventListener("error",()=>r(new Error(`Impossibile caricare ${n}`)),{once:!0});return}const u=document.createElement("script");u.src=n,u.async=!1,u.dataset.legacyDice=n,u.addEventListener("load",()=>{u.dataset.loaded="true",l()},{once:!0}),u.addEventListener("error",()=>r(new Error(`Impossibile caricare ${n}`)),{once:!0}),document.body.appendChild(u)})}function Pt(){return window.main&&typeof window.main.init=="function"?Promise.resolve():(Me||(Me=Wt.reduce((n,l)=>n.then(()=>_t(l)),Promise.resolve())),Me)}let i=null,B=null,J=0,at=!1;function Ft(){return`
    <div id="diceRoller"></div>
    <main id="diceRollerUI">
      <div class="top_field" hidden>
        <input type="text" id="textInput" spellcheck="false" inputmode="none" virtualkeyboardpolicy="manual"
               value="1d20"/>
      </div>
      <div id="diceLimit" style="display:none">Wow that's a lot of dice! <br>[Limit: 20]</div>    
      <div id="numPad" class="center_field" style="display:none">
        <table class="numPad">
          <tr><td onclick="main.input('del')" colspan="2">del</td><td onclick="main.input('bksp')" colspan="2">bksp</td></tr>
          <tr><td onclick="main.input('7')">7</td><td onclick="main.input('8')">8</td><td onclick="main.input('9')">9</td><td onclick="main.input('+')" rowspan="2">+</td></tr>
          <tr><td onclick="main.input('4')">4</td><td onclick="main.input('5')">5</td><td onclick="main.input('6')">6</td></tr>
          <tr><td onclick="main.input('1')">1</td><td onclick="main.input('2')">2</td><td onclick="main.input('3')">3</td><td onclick="main.input('-')" rowspan="2">-</td></tr>
          <tr><td onclick="main.input('0')" colspan="2">0</td><td onclick="main.input('d')">d</td></tr>
        </table>
        <button onclick="main.clearInput()">CLEAR</button>
        <button onclick="main.setInput()">OK</button>
      </div>
      <div class="bottom_field" hidden><span id="result"></span></div>
    </main>
  `}function Ht(){return`
  <div class="diceov-backdrop" data-close></div>
  <div class="diceov-stage" role="dialog" aria-modal="true" aria-label="Lancio dadi">
    <button class="diceov-close" data-close aria-label="Chiudi" hidden>×</button>
    <section class="diceov-panel">
      <header class="diceov-header">
        <div>      
          <p class="diceov-eyebrow" data-dice-title>Lancia dadi</h3>
        </div>
      </header>
      <div class="diceov-controls">   
        <div class="diceov-control diceov-control--row" data-modifier-home>
         <div class="diceov-control" data-dice-control="d20">
          <label class="diceov-label" for="dice-roll-mode">Modalità</label>
          <select id="dice-roll-mode" name="dice-roll-mode">
            <option value="normal" selected>Normale</option>
            <option value="advantage">Vantaggio</option>
            <option value="disadvantage">Svantaggio</option>
          </select>
        </div>
          <div class="diceov-control" data-dice-select hidden>
            <label class="diceov-label" for="dice-roll-select" data-dice-select-label>Seleziona</label>
            <select id="dice-roll-select" name="dice-roll-select"></select>
          </div>
          <div class="diceov-field diceov-field--modifier">
            <label class="diceov-label" for="dice-modifier">Mod</label>
            <input id="dice-modifier" type="number" name="dice-modifier" value="0" step="1" />
          </div>
          <div class="diceov-control" data-dice-buff="d20" hidden>
            <label class="diceov-label" for="dice-buff-d20">Buff/Debuff</label>
            <select id="dice-buff-d20" name="dice-buff-d20">
              <option value="none" selected>Nessuno</option>
              <option value="plus-d4">+d4</option>
              <option value="plus-d6">+d6</option>
              <option value="minus-d4">-d4</option>
              <option value="minus-d6">-d6</option>
            </select>
          </div>
           <div class="diceov-control" data-dice-control="d20">
          <div class="diceov-inspiration" data-dice-inspiration>
            <span class="diceov-label">Ispirazione</span>
            <label class="diceov-toggle">
              <input id="dice-inspiration" type="checkbox" name="dice-inspiration" />
              <span class="diceov-toggle-track" aria-hidden="true"></span>
            </label>
          </div>
        </div>
         <p class="diceov-warning" data-inspiration-warning hidden>
              Attenzione: userai il punto ispirazione su questo tiro.
            </p>
         <p class="diceov-warning" data-weakness-warning hidden></p>
         <p class="diceov-warning" data-rollmode-warning hidden></p>
         <p class="diceov-warning" data-autofail-warning hidden></p>
        </div>
       
        <div class="diceov-control" data-dice-control="generic">       
          <div class="diceov-generic-row">
            <div class="diceov-field">
              <label class="diceov-label" for="dice-count">Dadi</label>
              <input id="dice-count" type="number" name="dice-count" min="1" value="1" />
            </div>
            <div class="diceov-field">
              <label class="diceov-label" for="dice-type">Tipo dado</label>
              <select id="dice-type" name="dice-type">
                <option value="d4">d4</option>
                <option value="d6">d6</option>
                <option value="d8">d8</option>
                <option value="d10">d10</option>
                <option value="d12">d12</option>
                <option value="d20" selected>d20</option>
                <option value="d100">d100</option>
              </select>
            </div>
            <div class="diceov-field">
              <label class="diceov-label" for="dice-notation">Notazione</label>
              <input id="dice-notation" class="diceov-generic-notation" type="text" name="dice-notation" value="1d20" spellcheck="false" />
            </div>
            <div class="diceov-field diceov-field--modifier">
              <label class="diceov-label" for="dice-modifier-generic">Mod</label>
              <input id="dice-modifier-generic" type="number" name="dice-modifier-generic" value="0" step="1" />
            </div>
            <div class="diceov-field" data-dice-buff="damage" hidden>
              <label class="diceov-label" for="dice-buff-damage">Buff/Debuff</label>
              <select id="dice-buff-damage" name="dice-buff-damage">
                <option value="none" selected>Nessuno</option>
                <option value="plus-d4">+d4</option>
                <option value="plus-d6">+d6</option>
                <option value="minus-d4">-d4</option>
                <option value="minus-d6">-d6</option>
              </select>
            </div>
            <div class="diceov-control" data-critical-damage-field hidden>
              <span class="diceov-label">Critico</span>
              <label class="diceov-toggle">
                <input type="checkbox" name="dice-critical-damage" />
                <span class="diceov-toggle-track" aria-hidden="true"></span>
              </label>
            </div>
            <div class="diceov-control" data-sneak-attack-field hidden>
              <span class="diceov-label">Attacco furtivo</span>
              <label class="diceov-toggle">
                <input type="checkbox" name="dice-sneak-attack" />
                <span class="diceov-toggle-track" aria-hidden="true"></span>
              </label>
            </div>
          </div>
          <p class="diceov-hint">Puoi combinare dadi diversi (es. 2d6+1d4).</p>
          <p class="diceov-warning" data-custom-warning hidden></p>
        </div>
      </div>
      <div class="diceov-results">
        <div class="diceov-result diceov-result--full">
          <p class="diceov-result-label">Risultato</p>
          <p class="diceov-result-value" data-dice-result>—</p>
          <p class="diceov-result-detail" data-dice-detail>Lancia i dadi per vedere il totale.</p>
        </div>
        <p class="diceov-critical-banner" data-dice-critical-banner hidden></p>
      </div>
    </section>
    ${Ft()}
    <section class="diceov-history-accordion" data-history-accordion>
      <button class="diceov-history-toggle" type="button" data-history-toggle aria-expanded="false">
        <span>Storico tiri</span>
        <span class="diceov-history-toggle-icon" aria-hidden="true">▾</span>
      </button>
      <div class="diceov-history-panel" data-dice-history-panel hidden>
        <div class="diceov-history-list" data-dice-history></div>
      </div>
    </section>
  </div>`}function Ce(n){return(Array.isArray(n==null?void 0:n.result)?n.result:[]).some(r=>typeof r=="number"&&r<0)}function $e(n){return(n||"").toString().trim().replace(/\s+/g," ").toLowerCase()}const rt="diceRollHistory",jt=12;function dt(n){const l=Et(n);return`${rt}:${l||"global"}`}function zt(n){if(typeof window>"u")return[];try{const l=window.localStorage.getItem(dt(n));if(l){const u=JSON.parse(l);return Array.isArray(u)?u:[]}const r=window.localStorage.getItem(rt),c=r?JSON.parse(r):[];return Array.isArray(c)?c:[]}catch{return[]}}function Gt(n,l){if(!(typeof window>"u"))try{window.localStorage.setItem(dt(l),JSON.stringify(n))}catch{}}function Vt(n){try{return new Date(n).toLocaleString("it-IT",{dateStyle:"short",timeStyle:"short"})}catch{return n}}function le(n){return n?n>0?`+${n}`:`${n}`:"+0"}const ut={TS:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"},TA:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"},TC:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"}},Ut=3,re=new Map,xe=new Map;let lt=!1,S=null;const Le=new Map;let ct=!1;const de=new Map;function ft(n){const l="/dungeons-dragons-app/";return new URL(n,window.location.origin+l).toString()}function pt(){if(typeof window>"u"||lt)return;const n=window.AudioContext||window.webkitAudioContext;if(n&&!S&&(S=new n),S&&!ct){const r=()=>{(S==null?void 0:S.state)==="suspended"&&S.resume().catch(()=>{})};window.addEventListener("pointerdown",r,{passive:!0}),window.addEventListener("touchstart",r,{passive:!0}),ct=!0}new Set(Object.values(ut).flatMap(r=>Object.values(r))).forEach(r=>{const c=ft(r);if(re.has(c))return;const u=Array.from({length:Ut},()=>{const m=new window.Audio(c);return m.preload="auto",m.load(),m});re.set(c,u),xe.set(c,0),S&&fetch(c).then(m=>m.arrayBuffer()).then(m=>S.decodeAudioData(m)).then(m=>{Le.set(c,m)}).catch(()=>{})}),lt=!0}function ti(){pt(),J+=1}function Jt(){re.forEach(n=>{n.forEach(l=>{try{l.pause(),l.currentTime=0}catch{}})}),de.forEach(({source:n,gainNode:l})=>{try{n.stop(0)}catch{}try{n.disconnect(),l.disconnect()}catch{}}),de.clear()}function Kt(n,l){var te,K;if(typeof window>"u")return;const r=((te=ut[l])==null?void 0:te[n])||null;if(Jt(),r){const f=ft(r);if(S&&Le.has(f)){S.state==="suspended"&&S.resume().catch(()=>{});try{const b=S.createBufferSource(),g=S.createGain();g.gain.value=1,b.buffer=Le.get(f),b.connect(g),g.connect(S.destination);const D=`${Date.now()}-${Math.random()}`;de.set(D,{source:b,gainNode:g}),b.onended=()=>{de.delete(D)},b.start(0);return}catch{}}const q=re.get(f);if(q!=null&&q.length){const b=xe.get(f)??0,g=q[b];xe.set(f,(b+1)%q.length),g.pause(),g.currentTime=0,g.play().catch(()=>{});return}const R=new window.Audio(f);R.preload="auto",R.load(),R.play().catch(()=>{});return}if(!window.AudioContext)return;const c=new window.AudioContext,u=c.currentTime,m={TS:{criticalSuccess:{notes:[523.25,659.25,783.99],wave:"triangle"},excellent:{notes:[440,554.37,659.25],wave:"sine"},mediocre:{notes:[293.66,329.63,293.66],wave:"triangle"},poor:{notes:[246.94,220,196],wave:"sawtooth"},criticalFailure:{notes:[220,164.81,130.81],wave:"sawtooth"}},TA:{criticalSuccess:{notes:[659.25,830.61,987.77],wave:"square"},excellent:{notes:[523.25,659.25,783.99],wave:"triangle"},mediocre:{notes:[329.63,293.66,261.63],wave:"triangle"},poor:{notes:[220,196,174.61],wave:"sine"},criticalFailure:{notes:[196,146.83,110],wave:"triangle"}},TC:{criticalSuccess:{notes:[587.33,739.99,880],wave:"sine"},excellent:{notes:[493.88,622.25,739.99],wave:"triangle"},mediocre:{notes:[311.13,293.66,261.63],wave:"square"},poor:{notes:[261.63,233.08,207.65],wave:"sawtooth"},criticalFailure:{notes:[246.94,185,138.59],wave:"square"}}},y=((K=m[l])==null?void 0:K[n])||m.TC[n]||{notes:[220,164.81,130.81],wave:"triangle"};y.notes.forEach((f,q)=>{const R=c.createOscillator(),b=c.createGain(),g=u+q*.09,D=.16;R.type=y.wave,R.frequency.setValueAtTime(f,g),b.gain.setValueAtTime(1e-4,g),b.gain.exponentialRampToValueAtTime(.2,g+.01),b.gain.exponentialRampToValueAtTime(1e-4,g+D),R.connect(b),b.connect(c.destination),R.start(g),R.stop(g+D)}),window.setTimeout(()=>c.close(),700)}function U(n){const l=n.querySelector('select[name="dice-roll-mode"]');return(l==null?void 0:l.value)??"normal"}function st(n,l){const r=n.querySelector("#textInput");r&&(r.value=l,window.main&&typeof window.main.setInput=="function"&&window.main.setInput())}function ce(n){var y;const l=n.querySelector('[name="dice-count"]'),r=l!=null&&l.max?Number(l.max):null,c=Math.max(Number(l==null?void 0:l.value)||1,1),u=r&&Number.isFinite(r)?Math.min(c,r):c,m=((y=n.querySelector('[name="dice-type"]'))==null?void 0:y.value)||"d20";return`${u}${m}`}function Yt(n,l){const r=String(l||"").trim().match(/^(\d+)\s*d\s*(\d+)$/i);if(!r)return;const c=n.querySelector('[name="dice-count"]'),u=n.querySelector('[name="dice-type"]');c&&(c.value=r[1]),u&&(u.value=`d${r[2]}`)}function Zt(n,l=2){return String(n||"").replace(/(\d+)\s*d\s*(\d+)/gi,(r,c,u)=>`${Number(c)*l}d${u}`)}function se(){window.main&&typeof window.main.clearDice=="function"&&window.main.clearDice()}function Qt(n,l){n.dataset.diceMode=l,n.querySelectorAll("[data-dice-control]").forEach(r=>{const c=r.dataset.diceControl===l||r.dataset.diceControl==="d20"&&l==="d20";r.toggleAttribute("hidden",!c)})}function ii({sides:n=20,keepOpen:l=!1,title:r="Lancia dadi",mode:c="generic",notation:u=null,modifier:m=null,selection:y=null,allowInspiration:te=!1,onConsumeInspiration:K=null,rollType:f=null,weakPoints:q=0,characterId:R=null,historyLabel:b=null,sneakAttackDice:g=null,genericDiceMax:D=null,warning:ue=null,onRollComplete:qe=null}={}){var it;typeof B=="function"&&(B(),B=null),pt(),J+=1;const mt=J;i||(i=document.createElement("div"),i.id="dice-overlay",i.innerHTML=Ht(),document.body.appendChild(i),i.addEventListener("click",e=>{e.target.closest("[data-close]")&&F()}),document.addEventListener("keydown",vt,!0)),se();try{const e=i.querySelector("#result");e&&(e.textContent="—");const o=i.querySelector("#diceLimit");o&&(o.style.display="none")}catch{}(it=i.querySelector("[data-dice-title]"))==null||it.replaceChildren(document.createTextNode(r)),Qt(i,c==="generic"?"generic":"d20");const A=i.querySelector('input[name="dice-inspiration"]'),De=i.querySelector("[data-dice-inspiration]"),ie=i.querySelector("[data-inspiration-warning]"),fe=i.querySelector("[data-weakness-warning]"),pe=i.querySelector("[data-rollmode-warning]"),E=i.querySelector("[data-autofail-warning]"),N=i.querySelector('select[name="dice-roll-mode"]'),w=i.querySelector('input[name="dice-modifier"]'),Ne=w==null?void 0:w.closest(".diceov-field--modifier"),I=i.querySelector('input[name="dice-modifier-generic"]'),h=i.querySelector('input[name="dice-notation"]'),ve=i.querySelector("[data-dice-select]"),Ie=i.querySelector("[data-dice-select-label]"),M=i.querySelector('select[name="dice-roll-select"]'),H=i.querySelector("[data-dice-result]"),j=i.querySelector("[data-dice-detail]"),k=i.querySelector("[data-dice-critical-banner]"),me=i.querySelector('[data-dice-buff="d20"]'),Y=i.querySelector('select[name="dice-buff-d20"]'),ge=i.querySelector('[data-dice-buff="damage"]'),Z=i.querySelector('select[name="dice-buff-damage"]'),Q=i.querySelector(".diceov-stage"),z=i.querySelector("[data-history-accordion]"),ne=i.querySelector("[data-history-toggle]"),Te=i.querySelector("[data-dice-history-panel]"),be=i.querySelector("[data-dice-history]"),Oe=i.querySelector("[data-critical-damage-field]"),W=i.querySelector('input[name="dice-critical-damage"]'),Be=i.querySelector("[data-sneak-attack-field]"),_=i.querySelector('input[name="dice-sneak-attack"]'),he=i.querySelector("[data-custom-warning]");k&&(k.setAttribute("hidden",""),k.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),k.textContent=""),w&&ot(w,{decrementLabel:"Riduci modificatore",incrementLabel:"Aumenta modificatore"}),I&&ot(I,{decrementLabel:"Riduci modificatore",incrementLabel:"Aumenta modificatore"});const a={lastRoll:null,lastBuff:null,inspirationAvailable:!!te,inspirationConsumed:!1,selectionOptions:Array.isArray(y==null?void 0:y.options)?y.options:[],history:zt(R),selectionRollMode:null,selectionRollModeReason:null,lastCriticalSignature:null};G(),a.lastCriticalSignature=null;const Ee=Math.max(0,Number(q)||0),We=f==="TA"&&Ee>=1?"Svantaggio: punti indebolimento (prove di caratteristica).":(f==="TS"||f==="TC")&&Ee>=3?"Svantaggio: punti indebolimento (tiri salvezza/colpire).":null;function ye(){const e=!!We,o=a.selectionRollMode,t=o==="advantage",s=e||o==="disadvantage";return t&&s?{mode:"normal",weaknessWarning:null,rollModeWarning:"Vantaggio e svantaggio si annullano: tiro normale."}:{mode:s?"disadvantage":t?"advantage":"normal",weaknessWarning:s?We:null,rollModeWarning:a.selectionRollModeReason}}function we(){return c==="generic"&&I||w}function gt(){if(!Ne)return;const e=c==="generic";Ne.toggleAttribute("hidden",e)}function _e(){k&&(k.setAttribute("hidden",""),k.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),k.textContent="")}function G(e="—",o="Lancia i dadi per vedere il totale."){H&&(H.textContent=e),j&&(j.textContent=o),a.lastRoll=null,a.lastBuff=null}function Pe(e,{playAudio:o=!1,signature:t=null}={}){if(!k)return;if(!e){_e(),a.lastCriticalSignature=null;return}const d={criticalFailure:{message:"☠️ Fallimento critico",className:"diceov-critical-banner--critical-failure"},poor:{message:"💀 Pessimo",className:"diceov-critical-banner--poor"},mediocre:{message:"😐 Mediocre",className:"diceov-critical-banner--mediocre"},excellent:{message:"✨ Ottimo",className:"diceov-critical-banner--excellent"},criticalSuccess:{message:"🌟 Successo critico",className:"diceov-critical-banner--critical-success"}}[e];if(!d){_e();return}k.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),k.textContent=d.message,k.classList.add(d.className),k.removeAttribute("hidden"),o&&t&&t!==a.lastCriticalSignature&&Kt(e,f),a.lastCriticalSignature=t}function bt(e){return!["TS","TA","TC"].includes(f)||typeof(e==null?void 0:e.picked)!="number"?null:e.picked===1?"criticalFailure":e.picked>=2&&e.picked<=5?"poor":e.picked>=6&&e.picked<=14?"mediocre":e.picked>=15&&e.picked<=19?"excellent":e.picked===20?"criticalSuccess":null}function Fe(){if(be){if(!a.history.length){be.innerHTML='<p class="diceov-history-empty">Nessun tiro ancora.</p>';return}be.innerHTML=a.history.map(e=>`
        <div class="diceov-history-row">
          <div class="diceov-history-type diceov-history-type--${String(e.type||"gen").toLowerCase()}">
            <span class="diceov-history-type-code">${e.type||"—"}</span>
            ${e.subtype?`<span class="diceov-history-subtype">${e.subtype}</span>`:""}
            ${e.context?`<span class="diceov-history-subtype">${e.context}</span>`:""}
            ${e.inspired?'<span class="diceov-history-flag">Isp.</span>':""}
          </div>
          <span class="diceov-history-rollmode">${e.rollModeLabel||"—"}</span>
          <span class="diceov-history-total">${e.total??"—"}</span>
          <span class="diceov-history-date">${Vt(e.timestamp)}</span>
        </div>
      `).join("")}}function ht(e){a.history=[e,...a.history].slice(0,jt),Gt(a.history,R),Fe()}function He(){if(!N)return;const e=!!(A!=null&&A.checked);if(e){const o=U(i);N.value=o==="disadvantage"?"normal":"advantage"}else ke();N.disabled=e,ie&&ie.toggleAttribute("hidden",!e),Se(),Ae()}function je(e){a.inspirationAvailable=!!e,De&&De.toggleAttribute("hidden",!a.inspirationAvailable),A&&(A.checked=!1,A.disabled=!a.inspirationAvailable),!a.inspirationAvailable&&N&&(N.disabled=!1),!a.inspirationAvailable&&ie&&ie.setAttribute("hidden","")}function yt(){var s,d;if(!ve||!M)return;if(!a.selectionOptions.length){ve.setAttribute("hidden",""),M.innerHTML="",a.selectionRollMode=null,a.selectionRollModeReason=null,E&&E.setAttribute("hidden","");return}ve.removeAttribute("hidden"),Ie&&(Ie.textContent=(y==null?void 0:y.label)||"Seleziona"),M.innerHTML=a.selectionOptions.map(v=>`
        <option value="${v.value}" ${v.disabled?"disabled":""}>${v.label}</option>
      `).join("");const e=a.selectionOptions.filter(v=>!v.disabled),o=(y==null?void 0:y.value)??((s=e[0])==null?void 0:s.value)??((d=a.selectionOptions[0])==null?void 0:d.value);o!==void 0&&(M.value=o);const t=a.selectionOptions.find(v=>v.value===M.value);t&&!t.disabled&&w&&(w.value=Number(t.modifier)||0),a.selectionRollMode=t!=null&&t.disabled?null:(t==null?void 0:t.rollMode)||null,a.selectionRollModeReason=t!=null&&t.disabled?null:(t==null?void 0:t.rollModeReason)||null,M&&(M.disabled=e.length===0),wt()}function wt(){if(!E)return;const e=a.selectionOptions.filter(d=>d.disabled&&d.disabledReason);if(!e.length){E.setAttribute("hidden",""),E.textContent="";return}const o=e.map(d=>d.shortLabel||d.label||d.value).filter(Boolean).join(", "),t=[...new Set(e.map(d=>d.disabledReason).filter(Boolean))],s=t.length?` (${t.join("; ")})`:"";E.textContent=`TS ${o}: fallimento diretto${s}.`,E.removeAttribute("hidden")}function Se(){if(!fe)return;const e=ye(),o=!!e.weaknessWarning&&U(i)==="disadvantage";fe.textContent=e.weaknessWarning??"",fe.toggleAttribute("hidden",!o)}function Ae(){if(!pe)return;const e=ye(),o=U(i),t=!!e.rollModeWarning&&e.mode===o;pe.textContent=e.rollModeWarning??"",pe.toggleAttribute("hidden",!t)}function ke(){if(!N)return;const e=ye();N.value=e.mode,Se(),Ae(),X()}function St(){return f==="DMG"&&c==="generic"?{wrapper:ge,select:Z}:{wrapper:me,select:Y}}function At(){const e=["TS","TA","TC","DMG"].includes(f),o=f==="DMG"&&c==="generic";me&&me.toggleAttribute("hidden",!(e&&!o)),ge&&ge.toggleAttribute("hidden",!(e&&o)),Y&&(Y.value="none"),Z&&(Z.value="none"),e||(a.lastBuff=null)}function oe(){const{wrapper:e,select:o}=St();if(!o||e!=null&&e.hasAttribute("hidden"))return null;const t=o.value;if(t==="none")return null;const s=t.endsWith("d6")?6:4,d=t.startsWith("plus"),v=`${d?"+":"-"}d${s}`;return{choice:t,sides:s,label:v,sign:d?1:-1}}function ze(e){const o=e.result||[],t=U(i),s=t==="normal"?1:2,d=o.slice(0,s),v=oe();let C=null;if(v&&o.length>s){const x=o[s];typeof x=="number"&&(C={...v,roll:x,delta:v.sign*x})}const $=d.length?t==="advantage"?Math.max(...d):t==="disadvantage"?Math.min(...d):d[0]:null;return{rollMode:t,baseRolls:d,picked:$,buff:C}}function Ge(e){const o=e.result||[],t=oe();if(t&&o.length){const s=o[o.length-1];if(typeof s=="number")return{baseRolls:o.slice(0,-1),buff:{...t,roll:s,delta:t.sign*s}}}return{baseRolls:o,buff:null}}function Ve(e){if(!(!z||!ne||!Te)&&(z.classList.toggle("is-open",e),ne.setAttribute("aria-expanded",String(e)),Te.toggleAttribute("hidden",!e),Q==null||Q.classList.toggle("diceov-stage--history-open",e),e)){const o=i.querySelector(".diceov-header");if(o&&Q){const t=Math.max(o.getBoundingClientRect().bottom-Q.getBoundingClientRect().top,0);z.style.setProperty("--diceov-history-offset",`${t}px`)}}}function kt(){if(!M)return null;const e=a.selectionOptions.find(t=>t.value===M.value);return e&&(e.shortLabel||e.label||"").replace(/\s*\([^)]*\)\s*$/,"").trim()||null}function X(){if(c!=="generic"){const o=U(i)==="normal"?1:2,t=oe(),s=t?`+1d${t.sides}`:"";st(i,`${o}d${n}${s}`),G()}}function P(){var O;const e=(O=h==null?void 0:h.value)==null?void 0:O.trim(),o=String(g||"").trim(),t=f==="DMG"&&c==="generic",s=t&&(_==null?void 0:_.checked)&&o,d=e||ce(i),v=s?`${d}${o.startsWith("-")?"":"+"}${o}`:d,C=t&&(W!=null&&W.checked)?Zt(v,2):v,$=oe(),x=$?`${C}${$.sign<0?"-":"+"}1d${$.sides}`:C;st(i,x),G()}function Re(){a.lastRoll&&Ue(a.lastRoll,{playCriticalSound:!1})}async function Rt(){!a.inspirationAvailable||a.inspirationConsumed||A!=null&&A.checked&&(a.inspirationConsumed=!0,je(!1),typeof K=="function"&&await K())}function Ue(e,{playCriticalSound:o=!1}={}){var O,L,V;if(Ce(e)){G("—","Lancio non valido, rilancia i dadi.");return}const t=Number((O=we())==null?void 0:O.value)||0;if(c!=="generic"){const p=ze(e);if(a.lastBuff=p.buff,!p.baseRolls.length){G();return}const ee=bt(p),Dt=ee?`${f||"GEN"}:${ee}:${p.rollMode}:${p.baseRolls.join(",")}:${p.picked}`:null;Pe(ee,{playAudio:o,signature:Dt});const Nt=((L=p.buff)==null?void 0:L.delta)||0,It=(p.picked??0)+t+Nt,Tt=p.rollMode==="advantage"?"Vantaggio":p.rollMode==="disadvantage"?"Svantaggio":"Normale",Ot=p.baseRolls.join(", ");if(H&&(H.textContent=`${It}`),j){const Bt=p.baseRolls.length>1?` (selezionato ${p.picked})`:"",nt=[`${Tt}: ${Ot}${Bt}`,`Mod ${le(t)}`];p.buff&&nt.push(`${p.buff.label} (d${p.buff.sides}: ${p.buff.roll})`),j.textContent=nt.join(" · ")}return}Pe(null,{signature:null});const s=Ge(e);a.lastBuff=s.buff;const d=s.baseRolls.reduce((p,ee)=>p+ee,0),v=Number(e.constant)||0,C=((V=s.buff)==null?void 0:V.delta)||0,$=d+v+t+C,x=s.baseRolls.length?`Dadi: ${s.baseRolls.join(", ")}`:"Dadi: —";if(H&&(H.textContent=`${$}`),j){const p=[x];v&&p.push(`Costante ${le(v)}`),t&&p.push(`Mod ${le(t)}`),s.buff&&p.push(`${s.buff.label} ${le(s.buff.delta)} (d${s.buff.sides}: ${s.buff.roll})`),j.textContent=p.join(" · ")}}function Mt(e){var $,x,O;if(Ce(e))return null;const o=Number(($=we())==null?void 0:$.value)||0;if(c!=="generic"){const L=ze(e);if(a.lastBuff=L.buff,!L.baseRolls.length)return null;const V=((x=L.buff)==null?void 0:x.delta)||0;return{value:L.picked,total:(L.picked??0)+o+V}}const t=Ge(e);a.lastBuff=t.buff;const s=t.baseRolls.reduce((L,V)=>L+V,0),d=Number(e.constant)||0,v=((O=t.buff)==null?void 0:O.delta)||0,C=s+d;return{value:C,total:C+o+v}}function Ct(){const e=U(i);return["TS","TA","TC"].includes(f)?e==="advantage"?"Vantaggio":e==="disadvantage"?"Svantaggio":"Normale":(f==="GEN"||f===null)&&["advantage","disadvantage"].includes(e)?e==="advantage"?"Vantaggio":"Svantaggio":null}A&&(A.onchange=()=>{He(),X()}),N&&(N.onchange=()=>{Se(),Ae(),X()}),w&&(w.oninput=Re),I&&(I.oninput=Re),h&&(h.oninput=P),W&&(W.onchange=P),_&&(_.onchange=P),M&&(M.onchange=()=>{const e=a.selectionOptions.find(o=>o.value===M.value);e&&!e.disabled&&w&&(w.value=Number(e.modifier)||0),a.selectionRollMode=e!=null&&e.disabled?null:(e==null?void 0:e.rollMode)||null,a.selectionRollModeReason=e!=null&&e.disabled?null:(e==null?void 0:e.rollModeReason)||null,A!=null&&A.checked||ke(),Re()});const Je=i.querySelector('[name="dice-count"]');Je&&(Je.oninput=()=>{const e=ce(i);h&&(h.value=e),P()});const Ke=i.querySelector('[name="dice-type"]');Ke&&(Ke.onchange=()=>{const e=ce(i);h&&(h.value=e),P()});const Ye=()=>{a.lastBuff=null,c==="generic"?P():X()};Y&&(Y.onchange=Ye),Z&&(Z.onchange=Ye),ne&&(ne.onclick=()=>{const e=!(z!=null&&z.classList.contains("is-open"));Ve(e)}),yt(),At();const Ze=f==="DMG"&&c==="generic";Oe&&Oe.toggleAttribute("hidden",!Ze),W&&(W.checked=!1);const $t=!!String(g||"").trim();Be&&Be.toggleAttribute("hidden",!(Ze&&$t)),_&&(_.checked=!1),je(a.inspirationAvailable),ke(),He(),gt(),Fe(),Ve(!1),he&&(he.textContent=ue?String(ue):"",he.toggleAttribute("hidden",!ue)),i.removeAttribute("hidden");const ae=m!=null&&m!=="",Qe=we(),xt=c!=="generic"&&a.selectionOptions.some(e=>!e.disabled);if(w&&!ae&&!xt&&(w.value="0"),I&&!ae&&(I.value="0"),Qe&&ae&&Number.isFinite(Number(m))&&(Qe.value=Number(m)),c==="generic"){const e=i.querySelector('[name="dice-count"]'),o=i.querySelector('[name="dice-type"]');e&&(e.value="1",D&&Number.isFinite(Number(D))?e.max=String(Math.max(Number(D),1)):e.removeAttribute("max")),o&&(o.value="d20"),h&&(h.value="1d20"),I&&!ae&&(I.value="0"),h&&u&&(h.value=String(u).trim(),Yt(i,h.value)),h&&!h.value&&(h.value=ce(i)),P()}else X();Pt().then(()=>{mt===J&&(!at&&window.main&&typeof window.main.init=="function"&&(window.main.init(),at=!0),se(),window.main&&typeof window.main.setInput=="function"&&window.main.setInput())}).catch(e=>{console.error(e)});let Xe=null,T;const Lt=new Promise(e=>{T=e}),et=e=>{var o;if(!(!i||i.hasAttribute("hidden"))){if(a.lastRoll=e.detail||null,a.lastBuff=null,a.lastRoll){if(Ce(a.lastRoll)){G("—","Lancio non valido, rilancia i dadi.");return}Rt(),Ue(a.lastRoll,{playCriticalSound:!0})}if(a.lastRoll){const t=Mt(a.lastRoll);if(t){Xe=t.total,typeof qe=="function"&&qe({total:t.total,value:t.value,notation:a.lastRoll,diceCount:Array.isArray((o=a.lastRoll)==null?void 0:o.result)?a.lastRoll.result.length:0}),l||F(),T==null||T(t.total),T=null;const s=kt(),d=$e(s)&&$e(s)===$e(b);ht({type:f||"GEN",subtype:s,context:d?null:b,inspired:a.inspirationConsumed,rollModeLabel:Ct(),value:t.value,total:t.total,timestamp:new Date().toISOString()})}}}};window.addEventListener("diceRoll",et);const qt=F,tt=()=>{window.removeEventListener("diceRoll",et),B=null};return B=tt,F=function(){J+=1,tt(),i&&i.setAttribute("hidden",""),se(),Xe==null&&(T==null||T(null)),F=qt},{waitForRoll:Lt,close:()=>{F()}}}function vt(n){n.key==="Escape"&&F()}function F(){J+=1,typeof B=="function"&&(B(),B=null),i&&(document.removeEventListener("keydown",vt,!0),i.setAttribute("hidden",""),se())}export{F as closeDiceOverlay,ii as openDiceOverlay,ti as warmupDiceEffectAudio};
