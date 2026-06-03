import{j as dt,n as Ut}from"./index-DXBitu8v.js";let Te=null;const Kt=["/dungeons-dragons-app/libs/three.min.js","/dungeons-dragons-app/libs/cannon.min.js","/dungeons-dragons-app/libs/teal.js","/dungeons-dragons-app/dice-roller/dice.js","/dungeons-dragons-app/dice-roller/main.js"];function Jt(i){return new Promise((l,r)=>{const c=document.querySelector(`script[data-legacy-dice="${i}"]`);if((c==null?void 0:c.dataset.loaded)==="true")return l();if(c){c.addEventListener("load",()=>l(),{once:!0}),c.addEventListener("error",()=>r(new Error(`Impossibile caricare ${i}`)),{once:!0});return}const p=document.createElement("script");p.src=i,p.async=!1,p.dataset.legacyDice=i,p.addEventListener("load",()=>{p.dataset.loaded="true",l()},{once:!0}),p.addEventListener("error",()=>r(new Error(`Impossibile caricare ${i}`)),{once:!0}),document.body.appendChild(p)})}function Yt(){return window.main&&typeof window.main.init=="function"?Promise.resolve():(Te||(Te=Kt.reduce((i,l)=>i.then(()=>Jt(l)),Promise.resolve())),Te)}let a=null,H=null,Z=0,ut=!1;function Qt(){return`
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
  `}function Zt(){return`
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
    ${Qt()}
    <section class="diceov-history-accordion" data-history-accordion>
      <button class="diceov-history-toggle" type="button" data-history-toggle aria-expanded="false">
        <span>Storico tiri</span>
        <span class="diceov-history-toggle-icon" aria-hidden="true">▾</span>
      </button>
      <div class="diceov-history-panel" data-dice-history-panel hidden>
        <div class="diceov-history-list" data-dice-history></div>
      </div>
    </section>
  </div>`}function de(i){return(Array.isArray(i==null?void 0:i.result)?i.result:[]).some(r=>typeof r=="number"&&r<0)}function Ee(i){return(i||"").toString().trim().replace(/\s+/g," ").toLowerCase()}const bt="diceRollHistory",Xt=12;function ht(i){const l=Ut(i);return`${bt}:${l||"global"}`}function ei(i){if(typeof window>"u")return[];try{const l=window.localStorage.getItem(ht(i));if(l){const p=JSON.parse(l);return Array.isArray(p)?p:[]}const r=window.localStorage.getItem(bt),c=r?JSON.parse(r):[];return Array.isArray(c)?c:[]}catch{return[]}}function ti(i,l){if(!(typeof window>"u"))try{window.localStorage.setItem(ht(l),JSON.stringify(i))}catch{}}function ii(i){try{return new Date(i).toLocaleString("it-IT",{dateStyle:"short",timeStyle:"short"})}catch{return i}}function ue(i){return i?i>0?`+${i}`:`${i}`:"+0"}const yt={TS:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"},TA:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"},TC:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"}},ni=3,pe=new Map,Be=new Map;let ft=!1,A=null;const Oe=new Map;let pt=!1;const ve=new Map;function wt(i){const l="/dungeons-dragons-app/";return new URL(i,window.location.origin+l).toString()}function St(){if(typeof window>"u"||ft)return;const i=window.AudioContext||window.webkitAudioContext;if(i&&!A&&(A=new i),A&&!pt){const r=()=>{(A==null?void 0:A.state)==="suspended"&&A.resume().catch(()=>{})};window.addEventListener("pointerdown",r,{passive:!0}),window.addEventListener("touchstart",r,{passive:!0}),pt=!0}new Set(Object.values(yt).flatMap(r=>Object.values(r))).forEach(r=>{const c=wt(r);if(pe.has(c))return;const p=Array.from({length:ni},()=>{const f=new window.Audio(c);return f.preload="auto",f.load(),f});pe.set(c,p),Be.set(c,0),A&&fetch(c).then(f=>f.arrayBuffer()).then(f=>A.decodeAudioData(f)).then(f=>{Oe.set(c,f)}).catch(()=>{})}),ft=!0}function pi(){St(),Z+=1}function oi(){pe.forEach(i=>{i.forEach(l=>{try{l.pause(),l.currentTime=0}catch{}})}),ve.forEach(({source:i,gainNode:l})=>{try{i.stop(0)}catch{}try{i.disconnect(),l.disconnect()}catch{}}),ve.clear()}function ai(i,l){var $,P;if(typeof window>"u")return;const r=(($=yt[l])==null?void 0:$[i])||null;if(oi(),r){const g=wt(r);if(A&&Oe.has(g)){A.state==="suspended"&&A.resume().catch(()=>{});try{const y=A.createBufferSource(),h=A.createGain();h.gain.value=1,y.buffer=Oe.get(g),y.connect(h),h.connect(A.destination);const N=`${Date.now()}-${Math.random()}`;ve.set(N,{source:y,gainNode:h}),y.onended=()=>{ve.delete(N)},y.start(0);return}catch{}}const D=pe.get(g);if(D!=null&&D.length){const y=Be.get(g)??0,h=D[y];Be.set(g,(y+1)%D.length),h.pause(),h.currentTime=0,h.play().catch(()=>{});return}const C=new window.Audio(g);C.preload="auto",C.load(),C.play().catch(()=>{});return}if(!window.AudioContext)return;const c=new window.AudioContext,p=c.currentTime,f={TS:{criticalSuccess:{notes:[523.25,659.25,783.99],wave:"triangle"},excellent:{notes:[440,554.37,659.25],wave:"sine"},mediocre:{notes:[293.66,329.63,293.66],wave:"triangle"},poor:{notes:[246.94,220,196],wave:"sawtooth"},criticalFailure:{notes:[220,164.81,130.81],wave:"sawtooth"}},TA:{criticalSuccess:{notes:[659.25,830.61,987.77],wave:"square"},excellent:{notes:[523.25,659.25,783.99],wave:"triangle"},mediocre:{notes:[329.63,293.66,261.63],wave:"triangle"},poor:{notes:[220,196,174.61],wave:"sine"},criticalFailure:{notes:[196,146.83,110],wave:"triangle"}},TC:{criticalSuccess:{notes:[587.33,739.99,880],wave:"sine"},excellent:{notes:[493.88,622.25,739.99],wave:"triangle"},mediocre:{notes:[311.13,293.66,261.63],wave:"square"},poor:{notes:[261.63,233.08,207.65],wave:"sawtooth"},criticalFailure:{notes:[246.94,185,138.59],wave:"square"}}},v=((P=f[l])==null?void 0:P[i])||f.TC[i]||{notes:[220,164.81,130.81],wave:"triangle"};v.notes.forEach((g,D)=>{const C=c.createOscillator(),y=c.createGain(),h=p+D*.09,N=.16;C.type=v.wave,C.frequency.setValueAtTime(g,h),y.gain.setValueAtTime(1e-4,h),y.gain.exponentialRampToValueAtTime(.2,h+.01),y.gain.exponentialRampToValueAtTime(1e-4,h+N),C.connect(y),y.connect(c.destination),C.start(h),C.stop(h+N)}),window.setTimeout(()=>c.close(),700)}function Q(i){const l=i.querySelector('select[name="dice-roll-mode"]');return(l==null?void 0:l.value)??"normal"}function fe(i,l){const r=i.querySelector("#textInput");r&&(r.value=l,window.main&&typeof window.main.setInput=="function"&&window.main.setInput())}function oe(i){var v;const l=i.querySelector('[name="dice-count"]'),r=l!=null&&l.max?Number(l.max):null,c=Math.max(Number(l==null?void 0:l.value)||1,1),p=r&&Number.isFinite(r)?Math.min(c,r):c,f=((v=i.querySelector('[name="dice-type"]'))==null?void 0:v.value)||"d20";return`${p}${f}`}function vt(i,l){const r=String(l||"").trim().match(/^(\d+)\s*d\s*(\d+)$/i);if(!r)return;const c=i.querySelector('[name="dice-count"]'),p=i.querySelector('[name="dice-type"]');c&&(c.value=r[1]),p&&(p.value=`d${r[2]}`)}function li(i,l=2){return String(i||"").replace(/(\d+)\s*d\s*(\d+)/gi,(r,c,p)=>`${Number(c)*l}d${p}`)}const ci=[4,6,8,10,12,20];function ri(i){const l=new Map;let r=0;const c=String(i||"").replace(/\s+/g,""),p=/([+-]?)(?:(\d*)d(\d+)|(\d+))/gi;let f;for(;f=p.exec(c);){const v=f[1]==="-"?-1:1;if(f[3]){const $=Number(f[3]),P=Number(f[2]||1)*v;Number.isFinite($)&&$>0&&l.set($,Math.max((l.get($)||0)+P,0));continue}f[4]&&(r+=v*Number(f[4]))}return{counts:l,constant:r}}function si({counts:i,constant:l}){const r=[4,6,8,10,12,20,100],c=[...i.keys()].filter(v=>!r.includes(v)).sort((v,$)=>v-$),f=[...[...r,...c].map(v=>({sides:v,count:Number(i.get(v))||0})).filter(({count:v})=>v>0).map(({sides:v,count:$})=>`${$}d${v}`)];return l&&f.push(String(l)),f.join("+").replace(/\+\-/g,"-")||"1d20"}function mt(i){const l=Array.isArray(i==null?void 0:i.result)?i.result:[],r=Number(i==null?void 0:i.constant)||0,c=l.reduce((f,v)=>f+v,0)+r;let p=l.join(" ");return r&&(p+=`${r>0?" +":" -"}${Math.abs(r)}`),(l.length>1||r)&&(p+=` = ${c}`),i.resultTotal=c,i.resultString=p,i}function gt(i,{compactAfter:l=8}={}){const r=Array.isArray(i)?i:[];if(!r.length)return"nessun dado";const c=r.reduce((p,f)=>p+f,0);return r.length>l?`${r.length} dadi, somma ${c}`:r.join(" + ")}function ae(){window.main&&typeof window.main.clearDice=="function"&&window.main.clearDice()}function di(i,l){i.dataset.diceMode=l,i.querySelectorAll("[data-dice-control]").forEach(r=>{const c=r.dataset.diceControl===l||r.dataset.diceControl==="d20"&&l==="d20";r.toggleAttribute("hidden",!c)})}function vi({sides:i=20,keepOpen:l=!1,title:r="Lancia dadi",mode:c="generic",notation:p=null,modifier:f=null,selection:v=null,allowInspiration:$=!1,onConsumeInspiration:P=null,rollType:g=null,weakPoints:D=0,characterId:C=null,historyLabel:y=null,sneakAttackDice:h=null,genericDiceMax:N=null,warning:me=null,onRollComplete:He=null}={}){var st;typeof H=="function"&&(H(),H=null),St(),Z+=1;const Rt=Z;a||(a=document.createElement("div"),a.id="dice-overlay",a.innerHTML=Zt(),document.body.appendChild(a),a.addEventListener("click",e=>{e.target.closest("[data-close]")&&z()}),document.addEventListener("keydown",At,!0)),ae();try{const e=a.querySelector("#result");e&&(e.textContent="—");const o=a.querySelector("#diceLimit");o&&(o.style.display="none")}catch{}(st=a.querySelector("[data-dice-title]"))==null||st.replaceChildren(document.createTextNode(r)),di(a,c==="generic"?"generic":"d20");const R=a.querySelector('input[name="dice-inspiration"]'),Pe=a.querySelector("[data-dice-inspiration]"),le=a.querySelector("[data-inspiration-warning]"),ge=a.querySelector("[data-weakness-warning]"),be=a.querySelector("[data-rollmode-warning]"),_=a.querySelector("[data-autofail-warning]"),I=a.querySelector('select[name="dice-roll-mode"]'),S=a.querySelector('input[name="dice-modifier"]'),_e=S==null?void 0:S.closest(".diceov-field--modifier"),T=a.querySelector('input[name="dice-modifier-generic"]'),b=a.querySelector('input[name="dice-notation"]'),he=a.querySelector("[data-dice-select]"),We=a.querySelector("[data-dice-select-label]"),q=a.querySelector('select[name="dice-roll-select"]'),V=a.querySelector("[data-dice-result]"),G=a.querySelector("[data-dice-detail]"),M=a.querySelector("[data-dice-critical-banner]"),ye=a.querySelector('[data-dice-buff="d20"]'),X=a.querySelector('select[name="dice-buff-d20"]'),we=a.querySelector('[data-dice-buff="damage"]'),ee=a.querySelector('select[name="dice-buff-damage"]'),te=a.querySelector(".diceov-stage"),U=a.querySelector("[data-history-accordion]"),ce=a.querySelector("[data-history-toggle]"),Fe=a.querySelector("[data-dice-history-panel]"),Se=a.querySelector("[data-dice-history]"),je=a.querySelector("[data-critical-damage-field]"),W=a.querySelector('input[name="dice-critical-damage"]'),ze=a.querySelector("[data-sneak-attack-field]"),F=a.querySelector('input[name="dice-sneak-attack"]'),Ae=a.querySelector("[data-custom-warning]"),Ve=a.querySelector("[data-generic-dice-builder]"),Ge=a.querySelector("[data-quick-dice]"),j=a.querySelector("[data-reroll-tray]");M&&(M.setAttribute("hidden",""),M.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),M.textContent=""),S&&dt(S,{decrementLabel:"Riduci modificatore",incrementLabel:"Aumenta modificatore"}),T&&dt(T,{decrementLabel:"Riduci modificatore",incrementLabel:"Aumenta modificatore"});const n={lastRoll:null,lastBuff:null,inspirationAvailable:!!$,inspirationConsumed:!1,selectionOptions:Array.isArray(v==null?void 0:v.options)?v.options:[],history:ei(C),selectionRollMode:null,selectionRollModeReason:null,lastCriticalSignature:null,rerollHint:null,pendingReroll:null};K(),n.lastCriticalSignature=null;const Ue=Math.max(0,Number(D)||0),Ke=g==="TA"&&Ue>=1?"Svantaggio: punti indebolimento (prove di caratteristica).":(g==="TS"||g==="TC")&&Ue>=3?"Svantaggio: punti indebolimento (tiri salvezza/colpire).":null;function Re(){const e=!!Ke,o=n.selectionRollMode,t=o==="advantage",s=e||o==="disadvantage";return t&&s?{mode:"normal",weaknessWarning:null,rollModeWarning:"Vantaggio e svantaggio si annullano: tiro normale."}:{mode:s?"disadvantage":t?"advantage":"normal",weaknessWarning:s?Ke:null,rollModeWarning:n.selectionRollModeReason}}function ke(){return c==="generic"&&T||S}function kt(){if(!_e)return;const e=c==="generic";_e.toggleAttribute("hidden",e)}function Je(){M&&(M.setAttribute("hidden",""),M.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),M.textContent="")}function K(e="—",o="Lancia i dadi per vedere il totale."){V&&(V.textContent=e),G&&(G.textContent=o),n.lastRoll=null,n.lastBuff=null,n.rerollHint=null,n.pendingReroll=null,De(null)}function Ye(e,{playAudio:o=!1,signature:t=null}={}){if(!M)return;if(!e){Je(),n.lastCriticalSignature=null;return}const d={criticalFailure:{message:"☠️ Fallimento critico",className:"diceov-critical-banner--critical-failure"},poor:{message:"💀 Pessimo",className:"diceov-critical-banner--poor"},mediocre:{message:"😐 Mediocre",className:"diceov-critical-banner--mediocre"},excellent:{message:"✨ Ottimo",className:"diceov-critical-banner--excellent"},criticalSuccess:{message:"🌟 Successo critico",className:"diceov-critical-banner--critical-success"}}[e];if(!d){Je();return}M.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),M.textContent=d.message,M.classList.add(d.className),M.removeAttribute("hidden"),o&&t&&t!==n.lastCriticalSignature&&ai(e,g),n.lastCriticalSignature=t}function $t(e){return!["TS","TA","TC"].includes(g)||typeof(e==null?void 0:e.picked)!="number"?null:e.picked===1?"criticalFailure":e.picked>=2&&e.picked<=5?"poor":e.picked>=6&&e.picked<=14?"mediocre":e.picked>=15&&e.picked<=19?"excellent":e.picked===20?"criticalSuccess":null}function Qe(){if(Se){if(!n.history.length){Se.innerHTML='<p class="diceov-history-empty">Nessun tiro ancora.</p>';return}Se.innerHTML=n.history.map(e=>`
        <div class="diceov-history-row">
          <div class="diceov-history-type diceov-history-type--${String(e.type||"gen").toLowerCase()}">
            <span class="diceov-history-type-code">${e.type||"—"}</span>
            ${e.subtype?`<span class="diceov-history-subtype">${e.subtype}</span>`:""}
            ${e.context?`<span class="diceov-history-subtype">${e.context}</span>`:""}
            ${e.inspired?'<span class="diceov-history-flag">Isp.</span>':""}
          </div>
          <span class="diceov-history-rollmode">${e.rollModeLabel||"—"}</span>
          <span class="diceov-history-total">${e.total??"—"}</span>
          <span class="diceov-history-date">${ii(e.timestamp)}</span>
        </div>
      `).join("")}}function Mt(e){n.history=[e,...n.history].slice(0,Xt),ti(n.history,C),Qe()}function Ze(){if(!I)return;const e=!!(R!=null&&R.checked);if(e){const o=Q(a);I.value=o==="disadvantage"?"normal":"advantage"}else Ce();I.disabled=e,le&&le.toggleAttribute("hidden",!e),$e(),Me()}function Xe(e){n.inspirationAvailable=!!e,Pe&&Pe.toggleAttribute("hidden",!n.inspirationAvailable),R&&(R.checked=!1,R.disabled=!n.inspirationAvailable),!n.inspirationAvailable&&I&&(I.disabled=!1),!n.inspirationAvailable&&le&&le.setAttribute("hidden","")}function Ct(){var s,d;if(!he||!q)return;if(!n.selectionOptions.length){he.setAttribute("hidden",""),q.innerHTML="",n.selectionRollMode=null,n.selectionRollModeReason=null,_&&_.setAttribute("hidden","");return}he.removeAttribute("hidden"),We&&(We.textContent=(v==null?void 0:v.label)||"Seleziona"),q.innerHTML=n.selectionOptions.map(u=>`
        <option value="${u.value}" ${u.disabled?"disabled":""}>${u.label}</option>
      `).join("");const e=n.selectionOptions.filter(u=>!u.disabled),o=(v==null?void 0:v.value)??((s=e[0])==null?void 0:s.value)??((d=n.selectionOptions[0])==null?void 0:d.value);o!==void 0&&(q.value=o);const t=n.selectionOptions.find(u=>u.value===q.value);t&&!t.disabled&&S&&(S.value=Number(t.modifier)||0),n.selectionRollMode=t!=null&&t.disabled?null:(t==null?void 0:t.rollMode)||null,n.selectionRollModeReason=t!=null&&t.disabled?null:(t==null?void 0:t.rollModeReason)||null,q&&(q.disabled=e.length===0),qt()}function qt(){if(!_)return;const e=n.selectionOptions.filter(d=>d.disabled&&d.disabledReason);if(!e.length){_.setAttribute("hidden",""),_.textContent="";return}const o=e.map(d=>d.shortLabel||d.label||d.value).filter(Boolean).join(", "),t=[...new Set(e.map(d=>d.disabledReason).filter(Boolean))],s=t.length?` (${t.join("; ")})`:"";_.textContent=`TS ${o}: fallimento diretto${s}.`,_.removeAttribute("hidden")}function $e(){if(!ge)return;const e=Re(),o=!!e.weaknessWarning&&Q(a)==="disadvantage";ge.textContent=e.weaknessWarning??"",ge.toggleAttribute("hidden",!o)}function Me(){if(!be)return;const e=Re(),o=Q(a),t=!!e.rollModeWarning&&e.mode===o;be.textContent=e.rollModeWarning??"",be.toggleAttribute("hidden",!t)}function Ce(){if(!I)return;const e=Re();I.value=e.mode,$e(),Me(),ie()}function xt(){return g==="DMG"&&c==="generic"?{wrapper:we,select:ee}:{wrapper:ye,select:X}}function Lt(){const e=["TS","TA","TC","DMG"].includes(g),o=g==="DMG"&&c==="generic";ye&&ye.toggleAttribute("hidden",!(e&&!o)),we&&we.toggleAttribute("hidden",!(e&&o)),X&&(X.value="none"),ee&&(ee.value="none"),e||(n.lastBuff=null)}function re(){const{wrapper:e,select:o}=xt();if(!o||e!=null&&e.hasAttribute("hidden"))return null;const t=o.value;if(t==="none")return null;const s=t.endsWith("d6")?6:4,d=t.startsWith("plus"),u=`${d?"+":"-"}d${s}`;return{choice:t,sides:s,label:u,sign:d?1:-1}}function qe(e){const o=e.result||[],t=Q(a),s=t==="normal"?1:2,d=o.slice(0,s),u=re();let w=null;if(u&&o.length>s){const x=o[s];typeof x=="number"&&(w={...u,roll:x,delta:u.sign*x})}const k=d.length?t==="advantage"?Math.max(...d):t==="disadvantage"?Math.min(...d):d[0]:null;return{rollMode:t,baseRolls:d,picked:k,buff:w}}function xe(e){const o=e.result||[],t=re();if(t&&o.length){const s=o[o.length-1];if(typeof s=="number")return{baseRolls:o.slice(0,-1),buff:{...t,roll:s,delta:t.sign*s}}}return{baseRolls:o,buff:null}}function et(e){if(!(!U||!ce||!Fe)&&(U.classList.toggle("is-open",e),ce.setAttribute("aria-expanded",String(e)),Fe.toggleAttribute("hidden",!e),te==null||te.classList.toggle("diceov-stage--history-open",e),e)){const o=a.querySelector(".diceov-header");if(o&&te){const t=Math.max(o.getBoundingClientRect().bottom-te.getBoundingClientRect().top,0);U.style.setProperty("--diceov-history-offset",`${t}px`)}}}function Dt(){if(!q)return null;const e=n.selectionOptions.find(t=>t.value===q.value);return e&&(e.shortLabel||e.label||"").replace(/\s*\([^)]*\)\s*$/,"").trim()||null}function ie(){if(c!=="generic"){const o=Q(a)==="normal"?1:2,t=re(),s=t?`+1d${t.sides}`:"";fe(a,`${o}d${i}${s}`),K()}}function E(){var O;const e=(O=b==null?void 0:b.value)==null?void 0:O.trim(),o=String(h||"").trim(),t=g==="DMG"&&c==="generic",s=t&&(F==null?void 0:F.checked)&&o,d=e||oe(a),u=s?`${d}${o.startsWith("-")?"":"+"}${o}`:d,w=t&&(W!=null&&W.checked)?li(u,2):u,k=re(),x=k?`${w}${k.sign<0?"-":"+"}1d${k.sides}`:w;fe(a,x),K()}function Le(){n.lastRoll&&J(n.lastRoll,{playCriticalSound:!1})}async function Nt(){!n.inspirationAvailable||n.inspirationConsumed||R!=null&&R.checked&&(n.inspirationConsumed=!0,Xe(!1),typeof P=="function"&&await P())}function tt(e){const o=Array.isArray(e==null?void 0:e.result)?e.result:[],t=Array.isArray(e==null?void 0:e.set)?e.set:[];if(!o.length||!t.length)return[];if(c!=="generic"){const d=qe(e),u=d.rollMode==="normal"?1:2;return o.slice(0,u).map((w,k)=>({index:k,value:w,type:t[k]||`d${i}`,label:d.rollMode==="normal"?`d${i}`:`${k+1}° d${i}`}))}return xe(e).baseRolls.map((d,u)=>({index:u,value:d,type:t[u]||"d20",label:t[u]||"d20"}))}function De(e){if(!j)return;const o=e?tt(e):[];if(!o.length){j.innerHTML="",j.setAttribute("hidden","");return}j.innerHTML=`
      <span class="diceov-reroll-label">Ritira:</span>
      ${o.map(t=>{var s;return`
        <button class="diceov-reroll-die${((s=n.pendingReroll)==null?void 0:s.index)===t.index?" is-pending":""}" type="button" data-reroll-index="${t.index}" aria-label="Prepara ritiro ${t.label} con risultato ${t.value}">
          <span class="diceov-reroll-die-type">${t.label.toUpperCase()}</span>
          <span class="diceov-reroll-die-value">${t.value}</span>
        </button>
      `}).join("")}
    `,j.removeAttribute("hidden")}function It(e){var d,u;if(!n.lastRoll||!Array.isArray(n.lastRoll.result))return;const t=tt(n.lastRoll).find(w=>w.index===e);if(!t)return;const s=((d=n.pendingReroll)==null?void 0:d.returnInput)||((u=a.querySelector("#textInput"))==null?void 0:u.value)||null;n.pendingReroll={...t,previousValue:n.lastRoll.result[e],returnInput:s},n.rerollHint=`Swipe sul tavolo per ritirare ${t.label.toUpperCase()} (${t.value}).`,ae(),fe(a,`1${t.type}`),J(n.lastRoll,{playCriticalSound:!1})}function Tt(e){const o=n.pendingReroll;if(!o||!n.lastRoll||!Array.isArray(n.lastRoll.result))return!1;if(!e||de(e))return n.rerollHint="Ritiro non valido: riprova con uno swipe sul tavolo.",J(n.lastRoll,{playCriticalSound:!1}),!0;const t=Array.isArray(e.result)?e.result[0]:null;return typeof t!="number"?(n.rerollHint="Ritiro non valido: riprova con uno swipe sul tavolo.",J(n.lastRoll,{playCriticalSound:!1}),!0):(n.lastRoll.result[o.index]=t,mt(n.lastRoll),n.pendingReroll=null,n.rerollHint=`${o.label.toUpperCase()} ritirato: ${o.previousValue} → ${t}`,o.returnInput&&fe(a,o.returnInput),J(n.lastRoll,{playCriticalSound:!0}),!0)}function J(e,{playCriticalSound:o=!1}={}){var O,L,Y;if(de(e)){K("—","Lancio non valido, rilancia i dadi.");return}const t=Number((O=ke())==null?void 0:O.value)||0;if(c!=="generic"){const m=qe(e);if(n.lastBuff=m.buff,!m.baseRolls.length){K();return}const ne=$t(m),Wt=ne?`${g||"GEN"}:${ne}:${m.rollMode}:${m.baseRolls.join(",")}:${m.picked}`:null;Ye(ne,{playAudio:o,signature:Wt});const Ft=((L=m.buff)==null?void 0:L.delta)||0,jt=(m.picked??0)+t+Ft,zt=m.rollMode==="advantage"?"Vantaggio":m.rollMode==="disadvantage"?"Svantaggio":"Normale",Vt=gt(m.baseRolls,{compactAfter:4});if(V&&(V.textContent=`${jt}`),G){const Gt=m.baseRolls.length>1?` (selezionato ${m.picked})`:"",Ie=[`${zt}: ${Vt}${Gt}`,`Modificatore ${ue(t)}`];m.buff&&Ie.push(`${m.buff.label} (d${m.buff.sides}: ${m.buff.roll})`),n.rerollHint&&Ie.push(n.rerollHint),G.textContent=Ie.join(" · ")}De(e);return}Ye(null,{signature:null});const s=xe(e);n.lastBuff=s.buff;const d=s.baseRolls.reduce((m,ne)=>m+ne,0),u=Number(e.constant)||0,w=((Y=s.buff)==null?void 0:Y.delta)||0,k=d+u+t+w,x=s.baseRolls.length?`Tiro dadi: ${gt(s.baseRolls)}`:"Tiro dadi: —";if(V&&(V.textContent=`${k}`),G){const m=[x];u&&m.push(`Bonus fisso ${ue(u)}`),t&&m.push(`Modificatore ${ue(t)}`),s.buff&&m.push(`${s.buff.label} ${ue(s.buff.delta)} (d${s.buff.sides}: ${s.buff.roll})`),n.rerollHint&&m.push(n.rerollHint),G.textContent=m.join(" · ")}De(e)}function Et(e){var k,x,O;if(de(e))return null;const o=Number((k=ke())==null?void 0:k.value)||0;if(c!=="generic"){const L=qe(e);if(n.lastBuff=L.buff,!L.baseRolls.length)return null;const Y=((x=L.buff)==null?void 0:x.delta)||0;return{value:L.picked,total:(L.picked??0)+o+Y}}const t=xe(e);n.lastBuff=t.buff;const s=t.baseRolls.reduce((L,Y)=>L+Y,0),d=Number(e.constant)||0,u=((O=t.buff)==null?void 0:O.delta)||0,w=s+d;return{value:w,total:w+o+u}}function Bt(){const e=Q(a);return["TS","TA","TC"].includes(g)?e==="advantage"?"Vantaggio":e==="disadvantage"?"Svantaggio":"Normale":(g==="GEN"||g===null)&&["advantage","disadvantage"].includes(e)?e==="advantage"?"Vantaggio":"Svantaggio":null}R&&(R.onchange=()=>{Ze(),ie()}),I&&(I.onchange=()=>{$e(),Me(),ie()}),S&&(S.oninput=Le),T&&(T.oninput=Le),b&&(b.oninput=E),W&&(W.onchange=E),F&&(F.onchange=E),q&&(q.onchange=()=>{const e=n.selectionOptions.find(o=>o.value===q.value);e&&!e.disabled&&S&&(S.value=Number(e.modifier)||0),n.selectionRollMode=e!=null&&e.disabled?null:(e==null?void 0:e.rollMode)||null,n.selectionRollModeReason=e!=null&&e.disabled?null:(e==null?void 0:e.rollModeReason)||null,R!=null&&R.checked||Ce(),Le()});const it=a.querySelector('[name="dice-count"]');it&&(it.oninput=()=>{const e=oe(a);b&&(b.value=e),E()});const nt=a.querySelector('[name="dice-type"]');nt&&(nt.onchange=()=>{const e=oe(a);b&&(b.value=e),E()});const ot=()=>{n.lastBuff=null,c==="generic"?E():ie()};X&&(X.onchange=ot),ee&&(ee.onchange=ot),Ge&&(Ge.onclick=e=>{const o=e.target.closest("[data-quick-die]");if(!o||!b)return;const t=Number(o.dataset.quickDie);if(!ci.includes(t))return;const s=o.dataset.quickDieAction,d=ri(b.value||oe(a)),u=Number(d.counts.get(t))||0,w=s==="decrement"?Math.max(u-1,0):u+1;d.counts.set(t,w),b.value=si(d),vt(a,b.value),E()}),j&&(j.onclick=e=>{const o=e.target.closest("[data-reroll-index]");o&&It(Number(o.dataset.rerollIndex))}),ce&&(ce.onclick=()=>{const e=!(U!=null&&U.classList.contains("is-open"));et(e)}),Ct(),Lt();const Ne=g==="DMG"&&c==="generic";Ve&&Ve.toggleAttribute("hidden",Ne),je&&je.toggleAttribute("hidden",!Ne),W&&(W.checked=!1);const Ot=!!String(h||"").trim();ze&&ze.toggleAttribute("hidden",!(Ne&&Ot)),F&&(F.checked=!1),Xe(n.inspirationAvailable),Ce(),Ze(),kt(),Qe(),et(!1),Ae&&(Ae.textContent=me?String(me):"",Ae.toggleAttribute("hidden",!me)),a.removeAttribute("hidden");const se=f!=null&&f!=="",at=ke(),Ht=c!=="generic"&&n.selectionOptions.some(e=>!e.disabled);if(S&&!se&&!Ht&&(S.value="0"),T&&!se&&(T.value="0"),at&&se&&Number.isFinite(Number(f))&&(at.value=Number(f)),c==="generic"){const e=a.querySelector('[name="dice-count"]'),o=a.querySelector('[name="dice-type"]');e&&(e.value="1",N&&Number.isFinite(Number(N))?e.max=String(Math.max(Number(N),1)):e.removeAttribute("max")),o&&(o.value="d20"),b&&(b.value="1d20"),T&&!se&&(T.value="0"),b&&p&&(b.value=String(p).trim(),vt(a,b.value)),b&&!b.value&&(b.value=oe(a)),E()}else ie();Yt().then(()=>{Rt===Z&&(!ut&&window.main&&typeof window.main.init=="function"&&(window.main.init(),ut=!0),ae(),window.main&&typeof window.main.setInput=="function"&&window.main.setInput())}).catch(e=>{console.error(e)});let lt=null,B;const Pt=new Promise(e=>{B=e}),ct=e=>{var t;if(!a||a.hasAttribute("hidden"))return;const o=e.detail?mt(e.detail):null;if(n.pendingReroll){Tt(o);return}if(n.lastRoll=o,n.lastBuff=null,n.rerollHint=null,n.lastRoll){if(de(n.lastRoll)){K("—","Lancio non valido, rilancia i dadi.");return}Nt(),J(n.lastRoll,{playCriticalSound:!0})}if(n.lastRoll){const s=Et(n.lastRoll);if(s){lt=s.total,typeof He=="function"&&He({total:s.total,value:s.value,notation:n.lastRoll,diceCount:Array.isArray((t=n.lastRoll)==null?void 0:t.result)?n.lastRoll.result.length:0}),l||z(),B==null||B(s.total),B=null;const d=Dt(),u=Ee(d)&&Ee(d)===Ee(y);Mt({type:g||"GEN",subtype:d,context:u?null:y,inspired:n.inspirationConsumed,rollModeLabel:Bt(),value:s.value,total:s.total,timestamp:new Date().toISOString()})}}};window.addEventListener("diceRoll",ct);const _t=z,rt=()=>{window.removeEventListener("diceRoll",ct),H=null};return H=rt,z=function(){Z+=1,rt(),a&&a.setAttribute("hidden",""),ae(),lt==null&&(B==null||B(null)),z=_t},{waitForRoll:Pt,close:()=>{z()}}}function At(i){i.key==="Escape"&&z()}function z(){Z+=1,typeof H=="function"&&(H(),H=null),a&&(document.removeEventListener("keydown",At,!0),a.setAttribute("hidden",""),ae())}export{z as closeDiceOverlay,vi as openDiceOverlay,pi as warmupDiceEffectAudio};
