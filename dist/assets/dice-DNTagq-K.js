import{j as ut,n as Kt}from"./index-Cxy6bX8P.js";let Ee=null;const Jt=["/dungeons-dragons-app/libs/three.min.js","/dungeons-dragons-app/libs/cannon.min.js","/dungeons-dragons-app/libs/teal.js","/dungeons-dragons-app/dice-roller/dice.js","/dungeons-dragons-app/dice-roller/main.js"];function Yt(i){return new Promise((l,c)=>{const r=document.querySelector(`script[data-legacy-dice="${i}"]`);if((r==null?void 0:r.dataset.loaded)==="true")return l();if(r){r.addEventListener("load",()=>l(),{once:!0}),r.addEventListener("error",()=>c(new Error(`Impossibile caricare ${i}`)),{once:!0});return}const p=document.createElement("script");p.src=i,p.async=!1,p.dataset.legacyDice=i,p.addEventListener("load",()=>{p.dataset.loaded="true",l()},{once:!0}),p.addEventListener("error",()=>c(new Error(`Impossibile caricare ${i}`)),{once:!0}),document.body.appendChild(p)})}function Qt(){return window.main&&typeof window.main.init=="function"?Promise.resolve():(Ee||(Ee=Jt.reduce((i,l)=>i.then(()=>Yt(l)),Promise.resolve())),Ee)}let a=null,H=null,Z=0,ft=!1;function Zt(){return`
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
  `}function Xt(){return`
  <div class="diceov-backdrop" data-close></div>
  <div class="diceov-stage" role="dialog" aria-modal="true" aria-label="Lancio dadi">
    <button class="diceov-close" data-close aria-label="Chiudi" hidden>×</button>
    <section class="diceov-panel">
      <header class="diceov-header">
        <div>      
          <p class="diceov-eyebrow" data-dice-title>Lancia dadi</h3>
        </div>
        <button class="diceov-history-icon-button" type="button" data-history-toggle aria-expanded="false" aria-label="Apri storico tiri" title="Storico tiri">
          <span aria-hidden="true">🕘</span>
        </button>
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
            <div class="diceov-generic-builder" data-generic-dice-builder>
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
          <p class="diceov-hint">Puoi combinare dadi diversi (es. 2d6+1d4). Dopo un lancio scegli un dado nel risultato, poi fai swipe sul tavolo per ritirare solo quello.</p>
          <div class="diceov-quick-dice" data-quick-dice aria-label="Modifica rapida notazione dadi">
            <span class="diceov-quick-dice-title">Aggiungi dadi</span>
            ${[4,6,8,10,12,20].map(i=>`
              <div class="diceov-quick-die">
                <button class="diceov-quick-die-btn" type="button" data-quick-die="${i}" data-quick-die-action="decrement" aria-label="Rimuovi un d${i} dalla notazione">−</button>
                <span class="diceov-quick-die-label">D${i}</span>
                <button class="diceov-quick-die-btn" type="button" data-quick-die="${i}" data-quick-die-action="increment" aria-label="Aggiungi un d${i} alla notazione">+</button>
              </div>
            `).join("")}
          </div>
          <p class="diceov-warning" data-custom-warning hidden></p>
        </div>
      </div>
      <div class="diceov-results">
        <div class="diceov-result diceov-result--full">
          <p class="diceov-result-label">Risultato</p>
          <p class="diceov-result-value" data-dice-result>—</p>
          <p class="diceov-result-detail" data-dice-detail>Lancia i dadi per vedere il totale.</p>
          <div class="diceov-reroll-tray" data-reroll-tray hidden></div>
        </div>
        <p class="diceov-critical-banner" data-dice-critical-banner hidden></p>
      </div>
    </section>
    ${Zt()}
    <section class="diceov-history-accordion" data-history-accordion hidden>
      <div class="diceov-history-panel" data-dice-history-panel hidden>
        <div class="diceov-history-popover-header">
          <strong>Storico tiri</strong>
          <button class="diceov-history-popover-close" type="button" data-history-close aria-label="Chiudi storico">×</button>
        </div>
        <div class="diceov-history-list" data-dice-history></div>
      </div>
    </section>
  </div>`}function de(i){return(Array.isArray(i==null?void 0:i.result)?i.result:[]).some(c=>typeof c=="number"&&c<0)}function Be(i){return(i||"").toString().trim().replace(/\s+/g," ").toLowerCase()}const ht="diceRollHistory",ei=12;function yt(i){const l=Kt(i);return`${ht}:${l||"global"}`}function ti(i){if(typeof window>"u")return[];try{const l=window.localStorage.getItem(yt(i));if(l){const p=JSON.parse(l);return Array.isArray(p)?p:[]}const c=window.localStorage.getItem(ht),r=c?JSON.parse(c):[];return Array.isArray(r)?r:[]}catch{return[]}}function ii(i,l){if(!(typeof window>"u"))try{window.localStorage.setItem(yt(l),JSON.stringify(i))}catch{}}function ni(i){try{return new Date(i).toLocaleString("it-IT",{dateStyle:"short",timeStyle:"short"})}catch{return i}}function ue(i){return i?i>0?`+${i}`:`${i}`:"+0"}const wt={TS:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"},TA:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"},TC:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"}},oi=3,pe=new Map,Oe=new Map;let pt=!1,A=null;const He=new Map;let vt=!1;const ve=new Map;function St(i){const l="/dungeons-dragons-app/";return new URL(i,window.location.origin+l).toString()}function At(){if(typeof window>"u"||pt)return;const i=window.AudioContext||window.webkitAudioContext;if(i&&!A&&(A=new i),A&&!vt){const c=()=>{(A==null?void 0:A.state)==="suspended"&&A.resume().catch(()=>{})};window.addEventListener("pointerdown",c,{passive:!0}),window.addEventListener("touchstart",c,{passive:!0}),vt=!0}new Set(Object.values(wt).flatMap(c=>Object.values(c))).forEach(c=>{const r=St(c);if(pe.has(r))return;const p=Array.from({length:oi},()=>{const f=new window.Audio(r);return f.preload="auto",f.load(),f});pe.set(r,p),Oe.set(r,0),A&&fetch(r).then(f=>f.arrayBuffer()).then(f=>A.decodeAudioData(f)).then(f=>{He.set(r,f)}).catch(()=>{})}),pt=!0}function vi(){At(),Z+=1}function ai(){pe.forEach(i=>{i.forEach(l=>{try{l.pause(),l.currentTime=0}catch{}})}),ve.forEach(({source:i,gainNode:l})=>{try{i.stop(0)}catch{}try{i.disconnect(),l.disconnect()}catch{}}),ve.clear()}function li(i,l){var $,P;if(typeof window>"u")return;const c=(($=wt[l])==null?void 0:$[i])||null;if(ai(),c){const b=St(c);if(A&&He.has(b)){A.state==="suspended"&&A.resume().catch(()=>{});try{const y=A.createBufferSource(),h=A.createGain();h.gain.value=1,y.buffer=He.get(b),y.connect(h),h.connect(A.destination);const N=`${Date.now()}-${Math.random()}`;ve.set(N,{source:y,gainNode:h}),y.onended=()=>{ve.delete(N)},y.start(0);return}catch{}}const D=pe.get(b);if(D!=null&&D.length){const y=Oe.get(b)??0,h=D[y];Oe.set(b,(y+1)%D.length),h.pause(),h.currentTime=0,h.play().catch(()=>{});return}const C=new window.Audio(b);C.preload="auto",C.load(),C.play().catch(()=>{});return}if(!window.AudioContext)return;const r=new window.AudioContext,p=r.currentTime,f={TS:{criticalSuccess:{notes:[523.25,659.25,783.99],wave:"triangle"},excellent:{notes:[440,554.37,659.25],wave:"sine"},mediocre:{notes:[293.66,329.63,293.66],wave:"triangle"},poor:{notes:[246.94,220,196],wave:"sawtooth"},criticalFailure:{notes:[220,164.81,130.81],wave:"sawtooth"}},TA:{criticalSuccess:{notes:[659.25,830.61,987.77],wave:"square"},excellent:{notes:[523.25,659.25,783.99],wave:"triangle"},mediocre:{notes:[329.63,293.66,261.63],wave:"triangle"},poor:{notes:[220,196,174.61],wave:"sine"},criticalFailure:{notes:[196,146.83,110],wave:"triangle"}},TC:{criticalSuccess:{notes:[587.33,739.99,880],wave:"sine"},excellent:{notes:[493.88,622.25,739.99],wave:"triangle"},mediocre:{notes:[311.13,293.66,261.63],wave:"square"},poor:{notes:[261.63,233.08,207.65],wave:"sawtooth"},criticalFailure:{notes:[246.94,185,138.59],wave:"square"}}},v=((P=f[l])==null?void 0:P[i])||f.TC[i]||{notes:[220,164.81,130.81],wave:"triangle"};v.notes.forEach((b,D)=>{const C=r.createOscillator(),y=r.createGain(),h=p+D*.09,N=.16;C.type=v.wave,C.frequency.setValueAtTime(b,h),y.gain.setValueAtTime(1e-4,h),y.gain.exponentialRampToValueAtTime(.2,h+.01),y.gain.exponentialRampToValueAtTime(1e-4,h+N),C.connect(y),y.connect(r.destination),C.start(h),C.stop(h+N)}),window.setTimeout(()=>r.close(),700)}function Q(i){const l=i.querySelector('select[name="dice-roll-mode"]');return(l==null?void 0:l.value)??"normal"}function fe(i,l){const c=i.querySelector("#textInput");c&&(c.value=l,window.main&&typeof window.main.setInput=="function"&&window.main.setInput())}function ae(i){var v;const l=i.querySelector('[name="dice-count"]'),c=l!=null&&l.max?Number(l.max):null,r=Math.max(Number(l==null?void 0:l.value)||1,1),p=c&&Number.isFinite(c)?Math.min(r,c):r,f=((v=i.querySelector('[name="dice-type"]'))==null?void 0:v.value)||"d20";return`${p}${f}`}function mt(i,l){const c=String(l||"").trim().match(/^(\d+)\s*d\s*(\d+)$/i);if(!c)return;const r=i.querySelector('[name="dice-count"]'),p=i.querySelector('[name="dice-type"]');r&&(r.value=c[1]),p&&(p.value=`d${c[2]}`)}function ri(i,l=2){return String(i||"").replace(/(\d+)\s*d\s*(\d+)/gi,(c,r,p)=>`${Number(r)*l}d${p}`)}const ci=[4,6,8,10,12,20];function si(i){const l=new Map;let c=0;const r=String(i||"").replace(/\s+/g,""),p=/([+-]?)(?:(\d*)d(\d+)|(\d+))/gi;let f;for(;f=p.exec(r);){const v=f[1]==="-"?-1:1;if(f[3]){const $=Number(f[3]),P=Number(f[2]||1)*v;Number.isFinite($)&&$>0&&l.set($,Math.max((l.get($)||0)+P,0));continue}f[4]&&(c+=v*Number(f[4]))}return{counts:l,constant:c}}function di({counts:i,constant:l}){const c=[4,6,8,10,12,20,100],r=[...i.keys()].filter(v=>!c.includes(v)).sort((v,$)=>v-$),f=[...[...c,...r].map(v=>({sides:v,count:Number(i.get(v))||0})).filter(({count:v})=>v>0).map(({sides:v,count:$})=>`${$}d${v}`)];return l&&f.push(String(l)),f.join("+").replace(/\+\-/g,"-")||"1d20"}function bt(i){const l=Array.isArray(i==null?void 0:i.result)?i.result:[],c=Number(i==null?void 0:i.constant)||0,r=l.reduce((f,v)=>f+v,0)+c;let p=l.join(" ");return c&&(p+=`${c>0?" +":" -"}${Math.abs(c)}`),(l.length>1||c)&&(p+=` = ${r}`),i.resultTotal=r,i.resultString=p,i}function gt(i,{compactAfter:l=8}={}){const c=Array.isArray(i)?i:[];if(!c.length)return"nessun dado";const r=c.reduce((p,f)=>p+f,0);return c.length>l?`${c.length} dadi, somma ${r}`:c.join(" + ")}function le(){window.main&&typeof window.main.clearDice=="function"&&window.main.clearDice()}function ui(i,l){i.dataset.diceMode=l,i.querySelectorAll("[data-dice-control]").forEach(c=>{const r=c.dataset.diceControl===l||c.dataset.diceControl==="d20"&&l==="d20";c.toggleAttribute("hidden",!r)})}function mi({sides:i=20,keepOpen:l=!1,title:c="Lancia dadi",mode:r="generic",notation:p=null,modifier:f=null,selection:v=null,allowInspiration:$=!1,onConsumeInspiration:P=null,rollType:b=null,weakPoints:D=0,characterId:C=null,historyLabel:y=null,sneakAttackDice:h=null,genericDiceMax:N=null,warning:me=null,onRollComplete:Pe=null}={}){var dt;typeof H=="function"&&(H(),H=null),At(),Z+=1;const kt=Z;a||(a=document.createElement("div"),a.id="dice-overlay",a.innerHTML=Xt(),document.body.appendChild(a),a.addEventListener("click",e=>{e.target.closest("[data-close]")&&V()}),document.addEventListener("keydown",Rt,!0)),le();try{const e=a.querySelector("#result");e&&(e.textContent="—");const o=a.querySelector("#diceLimit");o&&(o.style.display="none")}catch{}(dt=a.querySelector("[data-dice-title]"))==null||dt.replaceChildren(document.createTextNode(c)),ui(a,r==="generic"?"generic":"d20");const R=a.querySelector('input[name="dice-inspiration"]'),_e=a.querySelector("[data-dice-inspiration]"),re=a.querySelector("[data-inspiration-warning]"),be=a.querySelector("[data-weakness-warning]"),ge=a.querySelector("[data-rollmode-warning]"),_=a.querySelector("[data-autofail-warning]"),I=a.querySelector('select[name="dice-roll-mode"]'),S=a.querySelector('input[name="dice-modifier"]'),We=S==null?void 0:S.closest(".diceov-field--modifier"),T=a.querySelector('input[name="dice-modifier-generic"]'),g=a.querySelector('input[name="dice-notation"]'),he=a.querySelector("[data-dice-select]"),Fe=a.querySelector("[data-dice-select-label]"),q=a.querySelector('select[name="dice-roll-select"]'),G=a.querySelector("[data-dice-result]"),U=a.querySelector("[data-dice-detail]"),M=a.querySelector("[data-dice-critical-banner]"),ye=a.querySelector('[data-dice-buff="d20"]'),X=a.querySelector('select[name="dice-buff-d20"]'),we=a.querySelector('[data-dice-buff="damage"]'),ee=a.querySelector('select[name="dice-buff-damage"]'),te=a.querySelector(".diceov-stage"),W=a.querySelector("[data-history-accordion]"),ie=a.querySelector("[data-history-toggle]"),je=a.querySelector("[data-dice-history-panel]"),Se=a.querySelector("[data-dice-history]"),ze=a.querySelector("[data-critical-damage-field]"),F=a.querySelector('input[name="dice-critical-damage"]'),Ve=a.querySelector("[data-sneak-attack-field]"),j=a.querySelector('input[name="dice-sneak-attack"]'),Ae=a.querySelector("[data-custom-warning]"),Ge=a.querySelector("[data-generic-dice-builder]"),Ue=a.querySelector("[data-quick-dice]"),z=a.querySelector("[data-reroll-tray]");M&&(M.setAttribute("hidden",""),M.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),M.textContent=""),S&&ut(S,{decrementLabel:"Riduci modificatore",incrementLabel:"Aumenta modificatore"}),T&&ut(T,{decrementLabel:"Riduci modificatore",incrementLabel:"Aumenta modificatore"});const n={lastRoll:null,lastBuff:null,inspirationAvailable:!!$,inspirationConsumed:!1,selectionOptions:Array.isArray(v==null?void 0:v.options)?v.options:[],history:ti(C),selectionRollMode:null,selectionRollModeReason:null,lastCriticalSignature:null,rerollHint:null,pendingReroll:null};K(),n.lastCriticalSignature=null;const Ke=Math.max(0,Number(D)||0),Je=b==="TA"&&Ke>=1?"Svantaggio: punti indebolimento (prove di caratteristica).":(b==="TS"||b==="TC")&&Ke>=3?"Svantaggio: punti indebolimento (tiri salvezza/colpire).":null;function Re(){const e=!!Je,o=n.selectionRollMode,t=o==="advantage",s=e||o==="disadvantage";return t&&s?{mode:"normal",weaknessWarning:null,rollModeWarning:"Vantaggio e svantaggio si annullano: tiro normale."}:{mode:s?"disadvantage":t?"advantage":"normal",weaknessWarning:s?Je:null,rollModeWarning:n.selectionRollModeReason}}function ke(){return r==="generic"&&T||S}function $t(){if(!We)return;const e=r==="generic";We.toggleAttribute("hidden",e)}function Ye(){M&&(M.setAttribute("hidden",""),M.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),M.textContent="")}function K(e="—",o="Lancia i dadi per vedere il totale."){G&&(G.textContent=e),U&&(U.textContent=o),n.lastRoll=null,n.lastBuff=null,n.rerollHint=null,n.pendingReroll=null,Ne(null)}function Qe(e,{playAudio:o=!1,signature:t=null}={}){if(!M)return;if(!e){Ye(),n.lastCriticalSignature=null;return}const d={criticalFailure:{message:"☠️ Fallimento critico",className:"diceov-critical-banner--critical-failure"},poor:{message:"💀 Pessimo",className:"diceov-critical-banner--poor"},mediocre:{message:"😐 Mediocre",className:"diceov-critical-banner--mediocre"},excellent:{message:"✨ Ottimo",className:"diceov-critical-banner--excellent"},criticalSuccess:{message:"🌟 Successo critico",className:"diceov-critical-banner--critical-success"}}[e];if(!d){Ye();return}M.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),M.textContent=d.message,M.classList.add(d.className),M.removeAttribute("hidden"),o&&t&&t!==n.lastCriticalSignature&&li(e,b),n.lastCriticalSignature=t}function Mt(e){return!["TS","TA","TC"].includes(b)||typeof(e==null?void 0:e.picked)!="number"?null:e.picked===1?"criticalFailure":e.picked>=2&&e.picked<=5?"poor":e.picked>=6&&e.picked<=14?"mediocre":e.picked>=15&&e.picked<=19?"excellent":e.picked===20?"criticalSuccess":null}function Ze(){if(Se){if(!n.history.length){Se.innerHTML='<p class="diceov-history-empty">Nessun tiro ancora.</p>';return}Se.innerHTML=n.history.map(e=>`
        <div class="diceov-history-row">
          <div class="diceov-history-type diceov-history-type--${String(e.type||"gen").toLowerCase()}">
            <span class="diceov-history-type-code">${e.type||"—"}</span>
            ${e.subtype?`<span class="diceov-history-subtype">${e.subtype}</span>`:""}
            ${e.context?`<span class="diceov-history-subtype">${e.context}</span>`:""}
            ${e.inspired?'<span class="diceov-history-flag">Isp.</span>':""}
          </div>
          <span class="diceov-history-rollmode">${e.rollModeLabel||"—"}</span>
          <span class="diceov-history-total">${e.total??"—"}</span>
          <span class="diceov-history-date">${ni(e.timestamp)}</span>
        </div>
      `).join("")}}function Ct(e){n.history=[e,...n.history].slice(0,ei),ii(n.history,C),Ze()}function Xe(){if(!I)return;const e=!!(R!=null&&R.checked);if(e){const o=Q(a);I.value=o==="disadvantage"?"normal":"advantage"}else Ce();I.disabled=e,re&&re.toggleAttribute("hidden",!e),$e(),Me()}function et(e){n.inspirationAvailable=!!e,_e&&_e.toggleAttribute("hidden",!n.inspirationAvailable),R&&(R.checked=!1,R.disabled=!n.inspirationAvailable),!n.inspirationAvailable&&I&&(I.disabled=!1),!n.inspirationAvailable&&re&&re.setAttribute("hidden","")}function qt(){var s,d;if(!he||!q)return;if(!n.selectionOptions.length){he.setAttribute("hidden",""),q.innerHTML="",n.selectionRollMode=null,n.selectionRollModeReason=null,_&&_.setAttribute("hidden","");return}he.removeAttribute("hidden"),Fe&&(Fe.textContent=(v==null?void 0:v.label)||"Seleziona"),q.innerHTML=n.selectionOptions.map(u=>`
        <option value="${u.value}" ${u.disabled?"disabled":""}>${u.label}</option>
      `).join("");const e=n.selectionOptions.filter(u=>!u.disabled),o=(v==null?void 0:v.value)??((s=e[0])==null?void 0:s.value)??((d=n.selectionOptions[0])==null?void 0:d.value);o!==void 0&&(q.value=o);const t=n.selectionOptions.find(u=>u.value===q.value);t&&!t.disabled&&S&&(S.value=Number(t.modifier)||0),n.selectionRollMode=t!=null&&t.disabled?null:(t==null?void 0:t.rollMode)||null,n.selectionRollModeReason=t!=null&&t.disabled?null:(t==null?void 0:t.rollModeReason)||null,q&&(q.disabled=e.length===0),xt()}function xt(){if(!_)return;const e=n.selectionOptions.filter(d=>d.disabled&&d.disabledReason);if(!e.length){_.setAttribute("hidden",""),_.textContent="";return}const o=e.map(d=>d.shortLabel||d.label||d.value).filter(Boolean).join(", "),t=[...new Set(e.map(d=>d.disabledReason).filter(Boolean))],s=t.length?` (${t.join("; ")})`:"";_.textContent=`TS ${o}: fallimento diretto${s}.`,_.removeAttribute("hidden")}function $e(){if(!be)return;const e=Re(),o=!!e.weaknessWarning&&Q(a)==="disadvantage";be.textContent=e.weaknessWarning??"",be.toggleAttribute("hidden",!o)}function Me(){if(!ge)return;const e=Re(),o=Q(a),t=!!e.rollModeWarning&&e.mode===o;ge.textContent=e.rollModeWarning??"",ge.toggleAttribute("hidden",!t)}function Ce(){if(!I)return;const e=Re();I.value=e.mode,$e(),Me(),ne()}function Lt(){return b==="DMG"&&r==="generic"?{wrapper:we,select:ee}:{wrapper:ye,select:X}}function Dt(){const e=["TS","TA","TC","DMG"].includes(b),o=b==="DMG"&&r==="generic";ye&&ye.toggleAttribute("hidden",!(e&&!o)),we&&we.toggleAttribute("hidden",!(e&&o)),X&&(X.value="none"),ee&&(ee.value="none"),e||(n.lastBuff=null)}function ce(){const{wrapper:e,select:o}=Lt();if(!o||e!=null&&e.hasAttribute("hidden"))return null;const t=o.value;if(t==="none")return null;const s=t.endsWith("d6")?6:4,d=t.startsWith("plus"),u=`${d?"+":"-"}d${s}`;return{choice:t,sides:s,label:u,sign:d?1:-1}}function qe(e){const o=e.result||[],t=Q(a),s=t==="normal"?1:2,d=o.slice(0,s),u=ce();let w=null;if(u&&o.length>s){const x=o[s];typeof x=="number"&&(w={...u,roll:x,delta:u.sign*x})}const k=d.length?t==="advantage"?Math.max(...d):t==="disadvantage"?Math.min(...d):d[0]:null;return{rollMode:t,baseRolls:d,picked:k,buff:w}}function xe(e){const o=e.result||[],t=ce();if(t&&o.length){const s=o[o.length-1];if(typeof s=="number")return{baseRolls:o.slice(0,-1),buff:{...t,roll:s,delta:t.sign*s}}}return{baseRolls:o,buff:null}}function Le(e){if(!(!W||!ie||!je)&&(W.classList.toggle("is-open",e),W.toggleAttribute("hidden",!e),ie.setAttribute("aria-expanded",String(e)),ie.setAttribute("aria-label",e?"Chiudi storico tiri":"Apri storico tiri"),je.toggleAttribute("hidden",!e),te==null||te.classList.toggle("diceov-stage--history-open",e),e)){const o=a.querySelector(".diceov-header");if(o&&te){const t=Math.max(o.getBoundingClientRect().bottom-te.getBoundingClientRect().top,0);W.style.setProperty("--diceov-history-offset",`${t}px`)}}}function Nt(){if(!q)return null;const e=n.selectionOptions.find(t=>t.value===q.value);return e&&(e.shortLabel||e.label||"").replace(/\s*\([^)]*\)\s*$/,"").trim()||null}function ne(){if(r!=="generic"){const o=Q(a)==="normal"?1:2,t=ce(),s=t?`+1d${t.sides}`:"";fe(a,`${o}d${i}${s}`),K()}}function E(){var O;const e=(O=g==null?void 0:g.value)==null?void 0:O.trim(),o=String(h||"").trim(),t=b==="DMG"&&r==="generic",s=t&&(j==null?void 0:j.checked)&&o,d=e||ae(a),u=s?`${d}${o.startsWith("-")?"":"+"}${o}`:d,w=t&&(F!=null&&F.checked)?ri(u,2):u,k=ce(),x=k?`${w}${k.sign<0?"-":"+"}1d${k.sides}`:w;fe(a,x),K()}function De(){n.lastRoll&&J(n.lastRoll,{playCriticalSound:!1})}async function It(){!n.inspirationAvailable||n.inspirationConsumed||R!=null&&R.checked&&(n.inspirationConsumed=!0,et(!1),typeof P=="function"&&await P())}function tt(e){const o=Array.isArray(e==null?void 0:e.result)?e.result:[],t=Array.isArray(e==null?void 0:e.set)?e.set:[];if(!o.length||!t.length)return[];if(r!=="generic"){const d=qe(e),u=d.rollMode==="normal"?1:2;return o.slice(0,u).map((w,k)=>({index:k,value:w,type:t[k]||`d${i}`,label:d.rollMode==="normal"?`d${i}`:`${k+1}° d${i}`}))}return xe(e).baseRolls.map((d,u)=>({index:u,value:d,type:t[u]||"d20",label:t[u]||"d20"}))}function Ne(e){if(!z)return;const o=e?tt(e):[];if(!o.length){z.innerHTML="",z.setAttribute("hidden","");return}z.innerHTML=`
      <span class="diceov-reroll-label">Ritira:</span>
      ${o.map(t=>{var s;return`
        <button class="diceov-reroll-die${((s=n.pendingReroll)==null?void 0:s.index)===t.index?" is-pending":""}" type="button" data-reroll-index="${t.index}" aria-label="Prepara ritiro ${t.label} con risultato ${t.value}">
          <span class="diceov-reroll-die-type">${t.label.toUpperCase()}</span>
          <span class="diceov-reroll-die-value">${t.value}</span>
        </button>
      `}).join("")}
    `,z.removeAttribute("hidden")}function Tt(e){var d,u;if(!n.lastRoll||!Array.isArray(n.lastRoll.result))return;const t=tt(n.lastRoll).find(w=>w.index===e);if(!t)return;const s=((d=n.pendingReroll)==null?void 0:d.returnInput)||((u=a.querySelector("#textInput"))==null?void 0:u.value)||null;n.pendingReroll={...t,previousValue:n.lastRoll.result[e],returnInput:s},n.rerollHint=`Swipe sul tavolo per ritirare ${t.label.toUpperCase()} (${t.value}).`,le(),fe(a,`1${t.type}`),J(n.lastRoll,{playCriticalSound:!1})}function Et(e){const o=n.pendingReroll;if(!o||!n.lastRoll||!Array.isArray(n.lastRoll.result))return!1;if(!e||de(e))return n.rerollHint="Ritiro non valido: riprova con uno swipe sul tavolo.",J(n.lastRoll,{playCriticalSound:!1}),!0;const t=Array.isArray(e.result)?e.result[0]:null;return typeof t!="number"?(n.rerollHint="Ritiro non valido: riprova con uno swipe sul tavolo.",J(n.lastRoll,{playCriticalSound:!1}),!0):(n.lastRoll.result[o.index]=t,bt(n.lastRoll),n.pendingReroll=null,n.rerollHint=`${o.label.toUpperCase()} ritirato: ${o.previousValue} → ${t}`,o.returnInput&&fe(a,o.returnInput),J(n.lastRoll,{playCriticalSound:!0}),!0)}function J(e,{playCriticalSound:o=!1}={}){var O,L,Y;if(de(e)){K("—","Lancio non valido, rilancia i dadi.");return}const t=Number((O=ke())==null?void 0:O.value)||0;if(r!=="generic"){const m=qe(e);if(n.lastBuff=m.buff,!m.baseRolls.length){K();return}const oe=Mt(m),Ft=oe?`${b||"GEN"}:${oe}:${m.rollMode}:${m.baseRolls.join(",")}:${m.picked}`:null;Qe(oe,{playAudio:o,signature:Ft});const jt=((L=m.buff)==null?void 0:L.delta)||0,zt=(m.picked??0)+t+jt,Vt=m.rollMode==="advantage"?"Vantaggio":m.rollMode==="disadvantage"?"Svantaggio":"Normale",Gt=gt(m.baseRolls,{compactAfter:4});if(G&&(G.textContent=`${zt}`),U){const Ut=m.baseRolls.length>1?` (selezionato ${m.picked})`:"",Te=[`${Vt}: ${Gt}${Ut}`,`Modificatore ${ue(t)}`];m.buff&&Te.push(`${m.buff.label} (d${m.buff.sides}: ${m.buff.roll})`),n.rerollHint&&Te.push(n.rerollHint),U.textContent=Te.join(" · ")}Ne(e);return}Qe(null,{signature:null});const s=xe(e);n.lastBuff=s.buff;const d=s.baseRolls.reduce((m,oe)=>m+oe,0),u=Number(e.constant)||0,w=((Y=s.buff)==null?void 0:Y.delta)||0,k=d+u+t+w,x=s.baseRolls.length?`Tiro dadi: ${gt(s.baseRolls)}`:"Tiro dadi: —";if(G&&(G.textContent=`${k}`),U){const m=[x];u&&m.push(`Bonus fisso ${ue(u)}`),t&&m.push(`Modificatore ${ue(t)}`),s.buff&&m.push(`${s.buff.label} ${ue(s.buff.delta)} (d${s.buff.sides}: ${s.buff.roll})`),n.rerollHint&&m.push(n.rerollHint),U.textContent=m.join(" · ")}Ne(e)}function Bt(e){var k,x,O;if(de(e))return null;const o=Number((k=ke())==null?void 0:k.value)||0;if(r!=="generic"){const L=qe(e);if(n.lastBuff=L.buff,!L.baseRolls.length)return null;const Y=((x=L.buff)==null?void 0:x.delta)||0;return{value:L.picked,total:(L.picked??0)+o+Y}}const t=xe(e);n.lastBuff=t.buff;const s=t.baseRolls.reduce((L,Y)=>L+Y,0),d=Number(e.constant)||0,u=((O=t.buff)==null?void 0:O.delta)||0,w=s+d;return{value:w,total:w+o+u}}function Ot(){const e=Q(a);return["TS","TA","TC"].includes(b)?e==="advantage"?"Vantaggio":e==="disadvantage"?"Svantaggio":"Normale":(b==="GEN"||b===null)&&["advantage","disadvantage"].includes(e)?e==="advantage"?"Vantaggio":"Svantaggio":null}R&&(R.onchange=()=>{Xe(),ne()}),I&&(I.onchange=()=>{$e(),Me(),ne()}),S&&(S.oninput=De),T&&(T.oninput=De),g&&(g.oninput=E),F&&(F.onchange=E),j&&(j.onchange=E),q&&(q.onchange=()=>{const e=n.selectionOptions.find(o=>o.value===q.value);e&&!e.disabled&&S&&(S.value=Number(e.modifier)||0),n.selectionRollMode=e!=null&&e.disabled?null:(e==null?void 0:e.rollMode)||null,n.selectionRollModeReason=e!=null&&e.disabled?null:(e==null?void 0:e.rollModeReason)||null,R!=null&&R.checked||Ce(),De()});const it=a.querySelector('[name="dice-count"]');it&&(it.oninput=()=>{const e=ae(a);g&&(g.value=e),E()});const nt=a.querySelector('[name="dice-type"]');nt&&(nt.onchange=()=>{const e=ae(a);g&&(g.value=e),E()});const ot=()=>{n.lastBuff=null,r==="generic"?E():ne()};X&&(X.onchange=ot),ee&&(ee.onchange=ot),Ue&&(Ue.onclick=e=>{const o=e.target.closest("[data-quick-die]");if(!o||!g)return;const t=Number(o.dataset.quickDie);if(!ci.includes(t))return;const s=o.dataset.quickDieAction,d=si(g.value||ae(a)),u=Number(d.counts.get(t))||0,w=s==="decrement"?Math.max(u-1,0):u+1;d.counts.set(t,w),g.value=di(d),mt(a,g.value),E()}),z&&(z.onclick=e=>{const o=e.target.closest("[data-reroll-index]");o&&Tt(Number(o.dataset.rerollIndex))}),ie&&(ie.onclick=()=>{const e=!(W!=null&&W.classList.contains("is-open"));Le(e)});const at=a.querySelector("[data-history-close]");at&&(at.onclick=()=>Le(!1)),qt(),Dt();const Ie=b==="DMG"&&r==="generic";Ge&&Ge.toggleAttribute("hidden",Ie),ze&&ze.toggleAttribute("hidden",!Ie),F&&(F.checked=!1);const Ht=!!String(h||"").trim();Ve&&Ve.toggleAttribute("hidden",!(Ie&&Ht)),j&&(j.checked=!1),et(n.inspirationAvailable),Ce(),Xe(),$t(),Ze(),Le(!1),Ae&&(Ae.textContent=me?String(me):"",Ae.toggleAttribute("hidden",!me)),a.removeAttribute("hidden");const se=f!=null&&f!=="",lt=ke(),Pt=r!=="generic"&&n.selectionOptions.some(e=>!e.disabled);if(S&&!se&&!Pt&&(S.value="0"),T&&!se&&(T.value="0"),lt&&se&&Number.isFinite(Number(f))&&(lt.value=Number(f)),r==="generic"){const e=a.querySelector('[name="dice-count"]'),o=a.querySelector('[name="dice-type"]');e&&(e.value="1",N&&Number.isFinite(Number(N))?e.max=String(Math.max(Number(N),1)):e.removeAttribute("max")),o&&(o.value="d20"),g&&(g.value="1d20"),T&&!se&&(T.value="0"),g&&p&&(g.value=String(p).trim(),mt(a,g.value)),g&&!g.value&&(g.value=ae(a)),E()}else ne();Qt().then(()=>{kt===Z&&(!ft&&window.main&&typeof window.main.init=="function"&&(window.main.init(),ft=!0),le(),window.main&&typeof window.main.setInput=="function"&&window.main.setInput())}).catch(e=>{console.error(e)});let rt=null,B;const _t=new Promise(e=>{B=e}),ct=e=>{var t;if(!a||a.hasAttribute("hidden"))return;const o=e.detail?bt(e.detail):null;if(n.pendingReroll){Et(o);return}if(n.lastRoll=o,n.lastBuff=null,n.rerollHint=null,n.lastRoll){if(de(n.lastRoll)){K("—","Lancio non valido, rilancia i dadi.");return}It(),J(n.lastRoll,{playCriticalSound:!0})}if(n.lastRoll){const s=Bt(n.lastRoll);if(s){rt=s.total,typeof Pe=="function"&&Pe({total:s.total,value:s.value,notation:n.lastRoll,diceCount:Array.isArray((t=n.lastRoll)==null?void 0:t.result)?n.lastRoll.result.length:0}),l||V(),B==null||B(s.total),B=null;const d=Nt(),u=Be(d)&&Be(d)===Be(y);Ct({type:b||"GEN",subtype:d,context:u?null:y,inspired:n.inspirationConsumed,rollModeLabel:Ot(),value:s.value,total:s.total,timestamp:new Date().toISOString()})}}};window.addEventListener("diceRoll",ct);const Wt=V,st=()=>{window.removeEventListener("diceRoll",ct),H=null};return H=st,V=function(){Z+=1,st(),a&&a.setAttribute("hidden",""),le(),rt==null&&(B==null||B(null)),V=Wt},{waitForRoll:_t,close:()=>{V()}}}function Rt(i){i.key==="Escape"&&V()}function V(){Z+=1,typeof H=="function"&&(H(),H=null),a&&(document.removeEventListener("keydown",Rt,!0),a.setAttribute("hidden",""),le())}export{V as closeDiceOverlay,mi as openDiceOverlay,vi as warmupDiceEffectAudio};
