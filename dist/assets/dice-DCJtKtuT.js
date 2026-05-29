import{i as tt,n as Tt}from"./index-xCsXiwLa.js";let Re=null;const Ot=["/dungeons-dragons-app/libs/three.min.js","/dungeons-dragons-app/libs/cannon.min.js","/dungeons-dragons-app/libs/teal.js","/dungeons-dragons-app/dice-roller/dice.js","/dungeons-dragons-app/dice-roller/main.js"];function Et(n){return new Promise((l,r)=>{const c=document.querySelector(`script[data-legacy-dice="${n}"]`);if((c==null?void 0:c.dataset.loaded)==="true")return l();if(c){c.addEventListener("load",()=>l(),{once:!0}),c.addEventListener("error",()=>r(new Error(`Impossibile caricare ${n}`)),{once:!0});return}const v=document.createElement("script");v.src=n,v.async=!1,v.dataset.legacyDice=n,v.addEventListener("load",()=>{v.dataset.loaded="true",l()},{once:!0}),v.addEventListener("error",()=>r(new Error(`Impossibile caricare ${n}`)),{once:!0}),document.body.appendChild(v)})}function Bt(){return window.main&&typeof window.main.init=="function"?Promise.resolve():(Re||(Re=Ot.reduce((n,l)=>n.then(()=>Et(l)),Promise.resolve())),Re)}let i=null,O=null,V=0,it=!1;function Wt(){return`
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
  `}function Pt(){return`
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
    ${Wt()}
    <section class="diceov-history-accordion" data-history-accordion>
      <button class="diceov-history-toggle" type="button" data-history-toggle aria-expanded="false">
        <span>Storico tiri</span>
        <span class="diceov-history-toggle-icon" aria-hidden="true">▾</span>
      </button>
      <div class="diceov-history-panel" data-dice-history-panel hidden>
        <div class="diceov-history-list" data-dice-history></div>
      </div>
    </section>
  </div>`}function Me(n){return(Array.isArray(n==null?void 0:n.result)?n.result:[]).some(r=>typeof r=="number"&&r<0)}function Ce(n){return(n||"").toString().trim().replace(/\s+/g," ").toLowerCase()}const lt="diceRollHistory",_t=12;function ct(n){const l=Tt(n);return`${lt}:${l||"global"}`}function Ft(n){if(typeof window>"u")return[];try{const l=window.localStorage.getItem(ct(n));if(l){const v=JSON.parse(l);return Array.isArray(v)?v:[]}const r=window.localStorage.getItem(lt),c=r?JSON.parse(r):[];return Array.isArray(c)?c:[]}catch{return[]}}function Ht(n,l){if(!(typeof window>"u"))try{window.localStorage.setItem(ct(l),JSON.stringify(n))}catch{}}function jt(n){try{return new Date(n).toLocaleString("it-IT",{dateStyle:"short",timeStyle:"short"})}catch{return n}}function ae(n){return n?n>0?`+${n}`:`${n}`:"+0"}const st={TS:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"},TA:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"},TC:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"}},zt=3,se=new Map,$e=new Map;let nt=!1,S=null;const xe=new Map;let ot=!1;const re=new Map;function rt(n){const l="/dungeons-dragons-app/";return new URL(n,window.location.origin+l).toString()}function dt(){if(typeof window>"u"||nt)return;const n=window.AudioContext||window.webkitAudioContext;if(n&&!S&&(S=new n),S&&!ot){const r=()=>{(S==null?void 0:S.state)==="suspended"&&S.resume().catch(()=>{})};window.addEventListener("pointerdown",r,{passive:!0}),window.addEventListener("touchstart",r,{passive:!0}),ot=!0}new Set(Object.values(st).flatMap(r=>Object.values(r))).forEach(r=>{const c=rt(r);if(se.has(c))return;const v=Array.from({length:zt},()=>{const m=new window.Audio(c);return m.preload="auto",m.load(),m});se.set(c,v),$e.set(c,0),S&&fetch(c).then(m=>m.arrayBuffer()).then(m=>S.decodeAudioData(m)).then(m=>{xe.set(c,m)}).catch(()=>{})}),nt=!0}function Zt(){dt(),V+=1}function Gt(){se.forEach(n=>{n.forEach(l=>{try{l.pause(),l.currentTime=0}catch{}})}),re.forEach(({source:n,gainNode:l})=>{try{n.stop(0)}catch{}try{n.disconnect(),l.disconnect()}catch{}}),re.clear()}function Vt(n,l){var ee,U;if(typeof window>"u")return;const r=((ee=st[l])==null?void 0:ee[n])||null;if(Gt(),r){const u=rt(r);if(S&&xe.has(u)){S.state==="suspended"&&S.resume().catch(()=>{});try{const g=S.createBufferSource(),b=S.createGain();b.gain.value=1,g.buffer=xe.get(u),g.connect(b),b.connect(S.destination);const x=`${Date.now()}-${Math.random()}`;re.set(x,{source:g,gainNode:b}),g.onended=()=>{re.delete(x)},g.start(0);return}catch{}}const $=se.get(u);if($!=null&&$.length){const g=$e.get(u)??0,b=$[g];$e.set(u,(g+1)%$.length),b.pause(),b.currentTime=0,b.play().catch(()=>{});return}const R=new window.Audio(u);R.preload="auto",R.load(),R.play().catch(()=>{});return}if(!window.AudioContext)return;const c=new window.AudioContext,v=c.currentTime,m={TS:{criticalSuccess:{notes:[523.25,659.25,783.99],wave:"triangle"},excellent:{notes:[440,554.37,659.25],wave:"sine"},mediocre:{notes:[293.66,329.63,293.66],wave:"triangle"},poor:{notes:[246.94,220,196],wave:"sawtooth"},criticalFailure:{notes:[220,164.81,130.81],wave:"sawtooth"}},TA:{criticalSuccess:{notes:[659.25,830.61,987.77],wave:"square"},excellent:{notes:[523.25,659.25,783.99],wave:"triangle"},mediocre:{notes:[329.63,293.66,261.63],wave:"triangle"},poor:{notes:[220,196,174.61],wave:"sine"},criticalFailure:{notes:[196,146.83,110],wave:"triangle"}},TC:{criticalSuccess:{notes:[587.33,739.99,880],wave:"sine"},excellent:{notes:[493.88,622.25,739.99],wave:"triangle"},mediocre:{notes:[311.13,293.66,261.63],wave:"square"},poor:{notes:[261.63,233.08,207.65],wave:"sawtooth"},criticalFailure:{notes:[246.94,185,138.59],wave:"square"}}},y=((U=m[l])==null?void 0:U[n])||m.TC[n]||{notes:[220,164.81,130.81],wave:"triangle"};y.notes.forEach((u,$)=>{const R=c.createOscillator(),g=c.createGain(),b=v+$*.09,x=.16;R.type=y.wave,R.frequency.setValueAtTime(u,b),g.gain.setValueAtTime(1e-4,b),g.gain.exponentialRampToValueAtTime(.2,b+.01),g.gain.exponentialRampToValueAtTime(1e-4,b+x),R.connect(g),g.connect(c.destination),R.start(b),R.stop(b+x)}),window.setTimeout(()=>c.close(),700)}function G(n){const l=n.querySelector('select[name="dice-roll-mode"]');return(l==null?void 0:l.value)??"normal"}function at(n,l){const r=n.querySelector("#textInput");r&&(r.value=l,window.main&&typeof window.main.setInput=="function"&&window.main.setInput())}function le(n){var y;const l=n.querySelector('[name="dice-count"]'),r=l!=null&&l.max?Number(l.max):null,c=Math.max(Number(l==null?void 0:l.value)||1,1),v=r&&Number.isFinite(r)?Math.min(c,r):c,m=((y=n.querySelector('[name="dice-type"]'))==null?void 0:y.value)||"d20";return`${v}${m}`}function Ut(n,l){const r=String(l||"").trim().match(/^(\d+)\s*d\s*(\d+)$/i);if(!r)return;const c=n.querySelector('[name="dice-count"]'),v=n.querySelector('[name="dice-type"]');c&&(c.value=r[1]),v&&(v.value=`d${r[2]}`)}function ce(){window.main&&typeof window.main.clearDice=="function"&&window.main.clearDice()}function Jt(n,l){n.dataset.diceMode=l,n.querySelectorAll("[data-dice-control]").forEach(r=>{const c=r.dataset.diceControl===l||r.dataset.diceControl==="d20"&&l==="d20";r.toggleAttribute("hidden",!c)})}function Qt({sides:n=20,keepOpen:l=!1,title:r="Lancia dadi",mode:c="generic",notation:v=null,modifier:m=null,selection:y=null,allowInspiration:ee=!1,onConsumeInspiration:U=null,rollType:u=null,weakPoints:$=0,characterId:R=null,historyLabel:g=null,sneakAttackDice:b=null,genericDiceMax:x=null,warning:de=null,onRollComplete:Le=null}={}){var Xe;typeof O=="function"&&(O(),O=null),dt(),V+=1;const ft=V;i||(i=document.createElement("div"),i.id="dice-overlay",i.innerHTML=Pt(),document.body.appendChild(i),i.addEventListener("click",e=>{e.target.closest("[data-close]")&&W()}),document.addEventListener("keydown",ut,!0)),ce();try{const e=i.querySelector("#result");e&&(e.textContent="—");const o=i.querySelector("#diceLimit");o&&(o.style.display="none")}catch{}(Xe=i.querySelector("[data-dice-title]"))==null||Xe.replaceChildren(document.createTextNode(r)),Jt(i,c==="generic"?"generic":"d20");const A=i.querySelector('input[name="dice-inspiration"]'),qe=i.querySelector("[data-dice-inspiration]"),te=i.querySelector("[data-inspiration-warning]"),ue=i.querySelector("[data-weakness-warning]"),fe=i.querySelector("[data-rollmode-warning]"),E=i.querySelector("[data-autofail-warning]"),L=i.querySelector('select[name="dice-roll-mode"]'),w=i.querySelector('input[name="dice-modifier"]'),De=w==null?void 0:w.closest(".diceov-field--modifier"),q=i.querySelector('input[name="dice-modifier-generic"]'),h=i.querySelector('input[name="dice-notation"]'),pe=i.querySelector("[data-dice-select]"),Ne=i.querySelector("[data-dice-select-label]"),M=i.querySelector('select[name="dice-roll-select"]'),P=i.querySelector("[data-dice-result]"),_=i.querySelector("[data-dice-detail]"),k=i.querySelector("[data-dice-critical-banner]"),ve=i.querySelector('[data-dice-buff="d20"]'),J=i.querySelector('select[name="dice-buff-d20"]'),me=i.querySelector('[data-dice-buff="damage"]'),K=i.querySelector('select[name="dice-buff-damage"]'),Y=i.querySelector(".diceov-stage"),F=i.querySelector("[data-history-accordion]"),ie=i.querySelector("[data-history-toggle]"),Ie=i.querySelector("[data-dice-history-panel]"),be=i.querySelector("[data-dice-history]"),Te=i.querySelector("[data-sneak-attack-field]"),B=i.querySelector('input[name="dice-sneak-attack"]'),ge=i.querySelector("[data-custom-warning]");k&&(k.setAttribute("hidden",""),k.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),k.textContent=""),w&&tt(w,{decrementLabel:"Riduci modificatore",incrementLabel:"Aumenta modificatore"}),q&&tt(q,{decrementLabel:"Riduci modificatore",incrementLabel:"Aumenta modificatore"});const a={lastRoll:null,lastBuff:null,inspirationAvailable:!!ee,inspirationConsumed:!1,selectionOptions:Array.isArray(y==null?void 0:y.options)?y.options:[],history:Ft(R),selectionRollMode:null,selectionRollModeReason:null,lastCriticalSignature:null};H(),a.lastCriticalSignature=null;const Oe=Math.max(0,Number($)||0),Ee=u==="TA"&&Oe>=1?"Svantaggio: punti indebolimento (prove di caratteristica).":(u==="TS"||u==="TC")&&Oe>=3?"Svantaggio: punti indebolimento (tiri salvezza/colpire).":null;function he(){const e=!!Ee,o=a.selectionRollMode,t=o==="advantage",s=e||o==="disadvantage";return t&&s?{mode:"normal",weaknessWarning:null,rollModeWarning:"Vantaggio e svantaggio si annullano: tiro normale."}:{mode:s?"disadvantage":t?"advantage":"normal",weaknessWarning:s?Ee:null,rollModeWarning:a.selectionRollModeReason}}function ye(){return c==="generic"&&q||w}function pt(){if(!De)return;const e=c==="generic";De.toggleAttribute("hidden",e)}function Be(){k&&(k.setAttribute("hidden",""),k.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),k.textContent="")}function H(e="—",o="Lancia i dadi per vedere il totale."){P&&(P.textContent=e),_&&(_.textContent=o),a.lastRoll=null,a.lastBuff=null}function We(e,{playAudio:o=!1,signature:t=null}={}){if(!k)return;if(!e){Be(),a.lastCriticalSignature=null;return}const d={criticalFailure:{message:"☠️ Fallimento critico",className:"diceov-critical-banner--critical-failure"},poor:{message:"💀 Pessimo",className:"diceov-critical-banner--poor"},mediocre:{message:"😐 Mediocre",className:"diceov-critical-banner--mediocre"},excellent:{message:"✨ Ottimo",className:"diceov-critical-banner--excellent"},criticalSuccess:{message:"🌟 Successo critico",className:"diceov-critical-banner--critical-success"}}[e];if(!d){Be();return}k.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),k.textContent=d.message,k.classList.add(d.className),k.removeAttribute("hidden"),o&&t&&t!==a.lastCriticalSignature&&Vt(e,u),a.lastCriticalSignature=t}function vt(e){return!["TS","TA","TC"].includes(u)||typeof(e==null?void 0:e.picked)!="number"?null:e.picked===1?"criticalFailure":e.picked>=2&&e.picked<=5?"poor":e.picked>=6&&e.picked<=14?"mediocre":e.picked>=15&&e.picked<=19?"excellent":e.picked===20?"criticalSuccess":null}function Pe(){if(be){if(!a.history.length){be.innerHTML='<p class="diceov-history-empty">Nessun tiro ancora.</p>';return}be.innerHTML=a.history.map(e=>`
        <div class="diceov-history-row">
          <div class="diceov-history-type diceov-history-type--${String(e.type||"gen").toLowerCase()}">
            <span class="diceov-history-type-code">${e.type||"—"}</span>
            ${e.subtype?`<span class="diceov-history-subtype">${e.subtype}</span>`:""}
            ${e.context?`<span class="diceov-history-subtype">${e.context}</span>`:""}
            ${e.inspired?'<span class="diceov-history-flag">Isp.</span>':""}
          </div>
          <span class="diceov-history-rollmode">${e.rollModeLabel||"—"}</span>
          <span class="diceov-history-total">${e.total??"—"}</span>
          <span class="diceov-history-date">${jt(e.timestamp)}</span>
        </div>
      `).join("")}}function mt(e){a.history=[e,...a.history].slice(0,_t),Ht(a.history,R),Pe()}function _e(){if(!L)return;const e=!!(A!=null&&A.checked);if(e){const o=G(i);L.value=o==="disadvantage"?"normal":"advantage"}else Ae();L.disabled=e,te&&te.toggleAttribute("hidden",!e),we(),Se()}function Fe(e){a.inspirationAvailable=!!e,qe&&qe.toggleAttribute("hidden",!a.inspirationAvailable),A&&(A.checked=!1,A.disabled=!a.inspirationAvailable),!a.inspirationAvailable&&L&&(L.disabled=!1),!a.inspirationAvailable&&te&&te.setAttribute("hidden","")}function bt(){var s,d;if(!pe||!M)return;if(!a.selectionOptions.length){pe.setAttribute("hidden",""),M.innerHTML="",a.selectionRollMode=null,a.selectionRollModeReason=null,E&&E.setAttribute("hidden","");return}pe.removeAttribute("hidden"),Ne&&(Ne.textContent=(y==null?void 0:y.label)||"Seleziona"),M.innerHTML=a.selectionOptions.map(p=>`
        <option value="${p.value}" ${p.disabled?"disabled":""}>${p.label}</option>
      `).join("");const e=a.selectionOptions.filter(p=>!p.disabled),o=(y==null?void 0:y.value)??((s=e[0])==null?void 0:s.value)??((d=a.selectionOptions[0])==null?void 0:d.value);o!==void 0&&(M.value=o);const t=a.selectionOptions.find(p=>p.value===M.value);t&&!t.disabled&&w&&(w.value=Number(t.modifier)||0),a.selectionRollMode=t!=null&&t.disabled?null:(t==null?void 0:t.rollMode)||null,a.selectionRollModeReason=t!=null&&t.disabled?null:(t==null?void 0:t.rollModeReason)||null,M&&(M.disabled=e.length===0),gt()}function gt(){if(!E)return;const e=a.selectionOptions.filter(d=>d.disabled&&d.disabledReason);if(!e.length){E.setAttribute("hidden",""),E.textContent="";return}const o=e.map(d=>d.shortLabel||d.label||d.value).filter(Boolean).join(", "),t=[...new Set(e.map(d=>d.disabledReason).filter(Boolean))],s=t.length?` (${t.join("; ")})`:"";E.textContent=`TS ${o}: fallimento diretto${s}.`,E.removeAttribute("hidden")}function we(){if(!ue)return;const e=he(),o=!!e.weaknessWarning&&G(i)==="disadvantage";ue.textContent=e.weaknessWarning??"",ue.toggleAttribute("hidden",!o)}function Se(){if(!fe)return;const e=he(),o=G(i),t=!!e.rollModeWarning&&e.mode===o;fe.textContent=e.rollModeWarning??"",fe.toggleAttribute("hidden",!t)}function Ae(){if(!L)return;const e=he();L.value=e.mode,we(),Se(),Z()}function ht(){return u==="DMG"&&c==="generic"?{wrapper:me,select:K}:{wrapper:ve,select:J}}function yt(){const e=["TS","TA","TC","DMG"].includes(u),o=u==="DMG"&&c==="generic";ve&&ve.toggleAttribute("hidden",!(e&&!o)),me&&me.toggleAttribute("hidden",!(e&&o)),J&&(J.value="none"),K&&(K.value="none"),e||(a.lastBuff=null)}function ne(){const{wrapper:e,select:o}=ht();if(!o||e!=null&&e.hasAttribute("hidden"))return null;const t=o.value;if(t==="none")return null;const s=t.endsWith("d6")?6:4,d=t.startsWith("plus"),p=`${d?"+":"-"}d${s}`;return{choice:t,sides:s,label:p,sign:d?1:-1}}function He(e){const o=e.result||[],t=G(i),s=t==="normal"?1:2,d=o.slice(0,s),p=ne();let D=null;if(p&&o.length>s){const T=o[s];typeof T=="number"&&(D={...p,roll:T,delta:p.sign*T})}const N=d.length?t==="advantage"?Math.max(...d):t==="disadvantage"?Math.min(...d):d[0]:null;return{rollMode:t,baseRolls:d,picked:N,buff:D}}function je(e){const o=e.result||[],t=ne();if(t&&o.length){const s=o[o.length-1];if(typeof s=="number")return{baseRolls:o.slice(0,-1),buff:{...t,roll:s,delta:t.sign*s}}}return{baseRolls:o,buff:null}}function ze(e){if(!(!F||!ie||!Ie)&&(F.classList.toggle("is-open",e),ie.setAttribute("aria-expanded",String(e)),Ie.toggleAttribute("hidden",!e),Y==null||Y.classList.toggle("diceov-stage--history-open",e),e)){const o=i.querySelector(".diceov-header");if(o&&Y){const t=Math.max(o.getBoundingClientRect().bottom-Y.getBoundingClientRect().top,0);F.style.setProperty("--diceov-history-offset",`${t}px`)}}}function wt(){if(!M)return null;const e=a.selectionOptions.find(t=>t.value===M.value);return e&&(e.shortLabel||e.label||"").replace(/\s*\([^)]*\)\s*$/,"").trim()||null}function Z(){if(c!=="generic"){const o=G(i)==="normal"?1:2,t=ne(),s=t?`+1d${t.sides}`:"";at(i,`${o}d${n}${s}`),H()}}function j(){var N;const e=(N=h==null?void 0:h.value)==null?void 0:N.trim(),o=String(b||"").trim(),t=u==="DMG"&&c==="generic"&&(B==null?void 0:B.checked)&&o,s=e||le(i),d=t?`${s}${o.startsWith("-")?"":"+"}${o}`:s,p=ne(),D=p?`${d}${p.sign<0?"-":"+"}1d${p.sides}`:d;at(i,D),H()}function ke(){a.lastRoll&&Ge(a.lastRoll,{playCriticalSound:!1})}async function St(){!a.inspirationAvailable||a.inspirationConsumed||A!=null&&A.checked&&(a.inspirationConsumed=!0,Fe(!1),typeof U=="function"&&await U())}function Ge(e,{playCriticalSound:o=!1}={}){var Q,C,z;if(Me(e)){H("—","Lancio non valido, rilancia i dadi.");return}const t=Number((Q=ye())==null?void 0:Q.value)||0;if(c!=="generic"){const f=He(e);if(a.lastBuff=f.buff,!f.baseRolls.length){H();return}const X=vt(f),xt=X?`${u||"GEN"}:${X}:${f.rollMode}:${f.baseRolls.join(",")}:${f.picked}`:null;We(X,{playAudio:o,signature:xt});const Lt=((C=f.buff)==null?void 0:C.delta)||0,qt=(f.picked??0)+t+Lt,Dt=f.rollMode==="advantage"?"Vantaggio":f.rollMode==="disadvantage"?"Svantaggio":"Normale",Nt=f.baseRolls.join(", ");if(P&&(P.textContent=`${qt}`),_){const It=f.baseRolls.length>1?` (selezionato ${f.picked})`:"",et=[`${Dt}: ${Nt}${It}`,`Mod ${ae(t)}`];f.buff&&et.push(`${f.buff.label} (d${f.buff.sides}: ${f.buff.roll})`),_.textContent=et.join(" · ")}return}We(null,{signature:null});const s=je(e);a.lastBuff=s.buff;const d=s.baseRolls.reduce((f,X)=>f+X,0),p=Number(e.constant)||0,D=((z=s.buff)==null?void 0:z.delta)||0,N=d+p+t+D,T=s.baseRolls.length?`Dadi: ${s.baseRolls.join(", ")}`:"Dadi: —";if(P&&(P.textContent=`${N}`),_){const f=[T];p&&f.push(`Costante ${ae(p)}`),t&&f.push(`Mod ${ae(t)}`),s.buff&&f.push(`${s.buff.label} ${ae(s.buff.delta)} (d${s.buff.sides}: ${s.buff.roll})`),_.textContent=f.join(" · ")}}function At(e){var N,T,Q;if(Me(e))return null;const o=Number((N=ye())==null?void 0:N.value)||0;if(c!=="generic"){const C=He(e);if(a.lastBuff=C.buff,!C.baseRolls.length)return null;const z=((T=C.buff)==null?void 0:T.delta)||0;return{value:C.picked,total:(C.picked??0)+o+z}}const t=je(e);a.lastBuff=t.buff;const s=t.baseRolls.reduce((C,z)=>C+z,0),d=Number(e.constant)||0,p=((Q=t.buff)==null?void 0:Q.delta)||0,D=s+d;return{value:D,total:D+o+p}}function kt(){const e=G(i);return["TS","TA","TC"].includes(u)?e==="advantage"?"Vantaggio":e==="disadvantage"?"Svantaggio":"Normale":(u==="GEN"||u===null)&&["advantage","disadvantage"].includes(e)?e==="advantage"?"Vantaggio":"Svantaggio":null}A&&(A.onchange=()=>{_e(),Z()}),L&&(L.onchange=()=>{we(),Se(),Z()}),w&&(w.oninput=ke),q&&(q.oninput=ke),h&&(h.oninput=j),B&&(B.onchange=j),M&&(M.onchange=()=>{const e=a.selectionOptions.find(o=>o.value===M.value);e&&!e.disabled&&w&&(w.value=Number(e.modifier)||0),a.selectionRollMode=e!=null&&e.disabled?null:(e==null?void 0:e.rollMode)||null,a.selectionRollModeReason=e!=null&&e.disabled?null:(e==null?void 0:e.rollModeReason)||null,A!=null&&A.checked||Ae(),ke()});const Ve=i.querySelector('[name="dice-count"]');Ve&&(Ve.oninput=()=>{const e=le(i);h&&(h.value=e),j()});const Ue=i.querySelector('[name="dice-type"]');Ue&&(Ue.onchange=()=>{const e=le(i);h&&(h.value=e),j()});const Je=()=>{a.lastBuff=null,c==="generic"?j():Z()};J&&(J.onchange=Je),K&&(K.onchange=Je),ie&&(ie.onclick=()=>{const e=!(F!=null&&F.classList.contains("is-open"));ze(e)}),bt(),yt();const Rt=!!String(b||"").trim();Te&&Te.toggleAttribute("hidden",!(u==="DMG"&&c==="generic"&&Rt)),B&&(B.checked=!1),Fe(a.inspirationAvailable),Ae(),_e(),pt(),Pe(),ze(!1),ge&&(ge.textContent=de?String(de):"",ge.toggleAttribute("hidden",!de)),i.removeAttribute("hidden");const oe=m!=null&&m!=="",Ke=ye(),Mt=c!=="generic"&&a.selectionOptions.some(e=>!e.disabled);if(w&&!oe&&!Mt&&(w.value="0"),q&&!oe&&(q.value="0"),Ke&&oe&&Number.isFinite(Number(m))&&(Ke.value=Number(m)),c==="generic"){const e=i.querySelector('[name="dice-count"]'),o=i.querySelector('[name="dice-type"]');e&&(e.value="1",x&&Number.isFinite(Number(x))?e.max=String(Math.max(Number(x),1)):e.removeAttribute("max")),o&&(o.value="d20"),h&&(h.value="1d20"),q&&!oe&&(q.value="0"),h&&v&&(h.value=String(v).trim(),Ut(i,h.value)),h&&!h.value&&(h.value=le(i)),j()}else Z();Bt().then(()=>{ft===V&&(!it&&window.main&&typeof window.main.init=="function"&&(window.main.init(),it=!0),ce(),window.main&&typeof window.main.setInput=="function"&&window.main.setInput())}).catch(e=>{console.error(e)});let Ye=null,I;const Ct=new Promise(e=>{I=e}),Ze=e=>{var o;if(!(!i||i.hasAttribute("hidden"))){if(a.lastRoll=e.detail||null,a.lastBuff=null,a.lastRoll){if(Me(a.lastRoll)){H("—","Lancio non valido, rilancia i dadi.");return}St(),Ge(a.lastRoll,{playCriticalSound:!0})}if(a.lastRoll){const t=At(a.lastRoll);if(t){Ye=t.total,typeof Le=="function"&&Le({total:t.total,value:t.value,notation:a.lastRoll,diceCount:Array.isArray((o=a.lastRoll)==null?void 0:o.result)?a.lastRoll.result.length:0}),l||W(),I==null||I(t.total),I=null;const s=wt(),d=Ce(s)&&Ce(s)===Ce(g);mt({type:u||"GEN",subtype:s,context:d?null:g,inspired:a.inspirationConsumed,rollModeLabel:kt(),value:t.value,total:t.total,timestamp:new Date().toISOString()})}}}};window.addEventListener("diceRoll",Ze);const $t=W,Qe=()=>{window.removeEventListener("diceRoll",Ze),O=null};return O=Qe,W=function(){V+=1,Qe(),i&&i.setAttribute("hidden",""),ce(),Ye==null&&(I==null||I(null)),W=$t},{waitForRoll:Ct,close:()=>{W()}}}function ut(n){n.key==="Escape"&&W()}function W(){V+=1,typeof O=="function"&&(O(),O=null),i&&(document.removeEventListener("keydown",ut,!0),i.setAttribute("hidden",""),ce())}export{W as closeDiceOverlay,Qt as openDiceOverlay,Zt as warmupDiceEffectAudio};
