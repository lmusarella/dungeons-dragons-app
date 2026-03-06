import{n as ie,s as Bt,c as Ve,f as te,a as Ft,b as re,g as fe,d as $a,e as it,h as Sa,i as wa,j as ve,k as Pt,l as ka,p as La,m as kt,o as Aa,R as Te,u as Ca,q as et,r as Ma,t as tt,v as Ht,w as xa,x as Na,y as Ot,z as Ra,A as Ea,B as Lt,C as qa,D as Ta,E as za}from"./characterDrawer-D-p_9Xfi.js";import{c as Ia,g as jt,f as Da,a as Ba,b as Fa,d as Pa,e as Ha,m as Oa,h as ja,u as Wa,i as Ua,j as Va,k as Ga,l as Ka,n as At,o as Ct,p as Qa}from"./walletApi-Dj-5Stq5.js";import{a as Ie,n as ue,g as ce,s as Wt,c as ke,b as D,o as oe,d as ae,e as ze,f as Ut,u as De,h as at,i as Vt,j as Mt,k as Ja}from"./index-BS7JkFzs.js";let M=null;function Ya(){return`
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
  `}function Xa(){return`
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
          </div>
          <p class="diceov-hint">Puoi combinare dadi diversi (es. 2d6+1d4).</p>
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
    ${Ya()}
    <section class="diceov-history-accordion" data-history-accordion>
      <button class="diceov-history-toggle" type="button" data-history-toggle aria-expanded="false">
        <span>Storico tiri</span>
        <span class="diceov-history-toggle-icon" aria-hidden="true">▾</span>
      </button>
      <div class="diceov-history-panel" data-dice-history-panel hidden>
        <div class="diceov-history-list" data-dice-history></div>
      </div>
    </section>
  </div>`}function Za(t){const a=String(t).match(/\d+/g);return a?parseInt(a[a.length-1],10):null}function Xe(t){return(Array.isArray(t==null?void 0:t.result)?t.result:[]).some(e=>typeof e=="number"&&e<0)}function Ze(t){return(t||"").toString().trim().replace(/\s+/g," ").toLowerCase()}const Gt="diceRollHistory",ei=12;function Kt(t){const a=ue(t);return`${Gt}:${a||"global"}`}function ti(t){if(typeof window>"u")return[];try{const a=window.localStorage.getItem(Kt(t));if(a){const l=JSON.parse(a);return Array.isArray(l)?l:[]}const e=window.localStorage.getItem(Gt),i=e?JSON.parse(e):[];return Array.isArray(i)?i:[]}catch{return[]}}function ai(t,a){if(!(typeof window>"u"))try{window.localStorage.setItem(Kt(a),JSON.stringify(t))}catch{}}function ii(t){try{return new Date(t).toLocaleString("it-IT",{dateStyle:"short",timeStyle:"short"})}catch{return t}}function Oe(t){return t?t>0?`+${t}`:`${t}`:"+0"}const ni={TS:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"},TA:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"},TC:{criticalFailure:"audio/fallimento_critico.mp3",poor:"audio/tiro_pessimo.mp3",mediocre:"audio/tiro_medriocre.mp3",excellent:"audio/tiro_ottimo.mp3",criticalSuccess:"audio/successo_critico.mp3"}};function si(t){const a="/dungeons-dragons-app/";return new URL(t,window.location.origin+a).toString()}function oi(t,a){var u,f;if(typeof window>"u")return;const e=((u=ni[a])==null?void 0:u[t])||null;if(e){new window.Audio(si(e)).play().catch(()=>{});return}if(!window.AudioContext)return;const i=new window.AudioContext,l=i.currentTime,o={TS:{criticalSuccess:{notes:[523.25,659.25,783.99],wave:"triangle"},excellent:{notes:[440,554.37,659.25],wave:"sine"},mediocre:{notes:[293.66,329.63,293.66],wave:"triangle"},poor:{notes:[246.94,220,196],wave:"sawtooth"},criticalFailure:{notes:[220,164.81,130.81],wave:"sawtooth"}},TA:{criticalSuccess:{notes:[659.25,830.61,987.77],wave:"square"},excellent:{notes:[523.25,659.25,783.99],wave:"triangle"},mediocre:{notes:[329.63,293.66,261.63],wave:"triangle"},poor:{notes:[220,196,174.61],wave:"sine"},criticalFailure:{notes:[196,146.83,110],wave:"triangle"}},TC:{criticalSuccess:{notes:[587.33,739.99,880],wave:"sine"},excellent:{notes:[493.88,622.25,739.99],wave:"triangle"},mediocre:{notes:[311.13,293.66,261.63],wave:"square"},poor:{notes:[261.63,233.08,207.65],wave:"sawtooth"},criticalFailure:{notes:[246.94,185,138.59],wave:"square"}}},n=((f=o[a])==null?void 0:f[t])||o.TC[t]||{notes:[220,164.81,130.81],wave:"triangle"};n.notes.forEach((g,_)=>{const s=i.createOscillator(),x=i.createGain(),L=l+_*.09,y=.16;s.type=n.wave,s.frequency.setValueAtTime(g,L),x.gain.setValueAtTime(1e-4,L),x.gain.exponentialRampToValueAtTime(.2,L+.01),x.gain.exponentialRampToValueAtTime(1e-4,L+y),s.connect(x),x.connect(i.destination),s.start(L),s.stop(L+y)}),window.setTimeout(()=>i.close(),700)}function $e(t){const a=t.querySelector('select[name="dice-roll-mode"]');return(a==null?void 0:a.value)??"normal"}function xt(t,a){const e=t.querySelector("#textInput");e&&(e.value=a,window.main&&typeof window.main.setInput=="function"&&window.main.setInput())}function je(t){var i,l;const a=Math.max(Number((i=t.querySelector('[name="dice-count"]'))==null?void 0:i.value)||1,1),e=((l=t.querySelector('[name="dice-type"]'))==null?void 0:l.value)||"d20";return`${a}${e}`}function li(t,a){const e=String(a||"").trim().match(/^(\d+)\s*d\s*(\d+)$/i);if(!e)return;const i=t.querySelector('[name="dice-count"]'),l=t.querySelector('[name="dice-type"]');i&&(i.value=e[1]),l&&(l.value=`d${e[2]}`)}function ri(t,a){t.dataset.diceMode=a,t.querySelectorAll("[data-dice-control]").forEach(e=>{const i=e.dataset.diceControl===a||e.dataset.diceControl==="d20"&&a==="d20";e.toggleAttribute("hidden",!i)})}function we({sides:t=20,keepOpen:a=!1,title:e="Lancia dadi",mode:i="generic",notation:l=null,modifier:o=null,selection:n=null,allowInspiration:u=!1,onConsumeInspiration:f=null,rollType:g=null,weakPoints:_=0,characterId:s=null,historyLabel:x=null}={}){var St;M||(M=document.createElement("div"),M.id="dice-overlay",M.innerHTML=Xa(),document.body.appendChild(M),window.main&&typeof window.main.init=="function"&&window.main.init(),window.main&&typeof window.main.setInput=="function"&&window.main.setInput(),M.addEventListener("click",c=>{c.target.closest("[data-close]")&&Se()}),document.addEventListener("keydown",Qt,!0));try{const c=M.querySelector("#result");c&&(c.textContent="—");const N=M.querySelector("#diceLimit");N&&(N.style.display="none")}catch{}window.main&&typeof window.main.clearDice=="function"&&window.main.clearDice(),(St=M.querySelector("[data-dice-title]"))==null||St.replaceChildren(document.createTextNode(e)),ri(M,i==="generic"?"generic":"d20");const y=M.querySelector('input[name="dice-inspiration"]'),r=M.querySelector("[data-dice-inspiration]"),m=M.querySelector("[data-inspiration-warning]"),R=M.querySelector("[data-weakness-warning]"),A=M.querySelector("[data-rollmode-warning]"),C=M.querySelector("[data-autofail-warning]"),z=M.querySelector('select[name="dice-roll-mode"]'),h=M.querySelector('input[name="dice-modifier"]'),j=h==null?void 0:h.closest(".diceov-field--modifier"),$=M.querySelector('input[name="dice-modifier-generic"]'),F=M.querySelector('input[name="dice-notation"]'),q=M.querySelector("[data-dice-select]"),S=M.querySelector("[data-dice-select-label]"),P=M.querySelector('select[name="dice-roll-select"]'),V=M.querySelector("[data-dice-result]"),E=M.querySelector("[data-dice-detail]"),d=M.querySelector("[data-dice-critical-banner]"),p=M.querySelector('[data-dice-buff="d20"]'),v=M.querySelector('select[name="dice-buff-d20"]'),b=M.querySelector('[data-dice-buff="damage"]'),T=M.querySelector('select[name="dice-buff-damage"]'),B=M.querySelector(".diceov-stage"),H=M.querySelector("[data-history-accordion]"),I=M.querySelector("[data-history-toggle]"),W=M.querySelector("[data-dice-history-panel]"),G=M.querySelector("[data-dice-history]");d&&(d.setAttribute("hidden",""),d.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),d.textContent=""),h&&Ie(h,{decrementLabel:"Riduci modificatore",incrementLabel:"Aumenta modificatore"}),$&&Ie($,{decrementLabel:"Riduci modificatore",incrementLabel:"Aumenta modificatore"});const w={lastRoll:null,lastBuff:null,inspirationAvailable:!!u,inspirationConsumed:!1,selectionOptions:Array.isArray(n==null?void 0:n.options)?n.options:[],history:ti(s),selectionRollMode:null,selectionRollModeReason:null,lastCriticalSignature:null},J=Math.max(0,Number(_)||0),O=g==="TA"&&J>=1?"Svantaggio: punti indebolimento (prove di caratteristica).":(g==="TS"||g==="TC")&&J>=3?"Svantaggio: punti indebolimento (tiri salvezza/colpire).":null;function Y(){const c=!!O,N=w.selectionRollMode,k=N==="advantage",U=c||N==="disadvantage";return k&&U?{mode:"normal",weaknessWarning:null,rollModeWarning:"Vantaggio e svantaggio si annullano: tiro normale."}:{mode:U?"disadvantage":k?"advantage":"normal",weaknessWarning:U?O:null,rollModeWarning:w.selectionRollModeReason}}function Z(){return i==="generic"&&$||h}function be(){if(!j)return;const c=i==="generic";j.toggleAttribute("hidden",c)}function Ae(){d&&(d.setAttribute("hidden",""),d.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),d.textContent="")}function pe(c="—",N="Lancia i dadi per vedere il totale."){V&&(V.textContent=c),E&&(E.textContent=N),w.lastRoll=null,w.lastBuff=null}function Ce(c,{playAudio:N=!1,signature:k=null}={}){if(!d)return;if(!c){Ae(),w.lastCriticalSignature=null;return}const K={criticalFailure:{message:"☠️ Fallimento critico",className:"diceov-critical-banner--critical-failure"},poor:{message:"💀 Pessimo",className:"diceov-critical-banner--poor"},mediocre:{message:"😐 Mediocre",className:"diceov-critical-banner--mediocre"},excellent:{message:"✨ Ottimo",className:"diceov-critical-banner--excellent"},criticalSuccess:{message:"🌟 Successo critico",className:"diceov-critical-banner--critical-success"}}[c];if(!K){Ae();return}d.classList.remove("diceov-critical-banner--critical-failure","diceov-critical-banner--poor","diceov-critical-banner--mediocre","diceov-critical-banner--excellent","diceov-critical-banner--critical-success"),d.textContent=K.message,d.classList.add(K.className),d.removeAttribute("hidden"),N&&k&&k!==w.lastCriticalSignature&&oi(c,g),w.lastCriticalSignature=k}function Pe(c){return!["TS","TA","TC"].includes(g)||typeof(c==null?void 0:c.picked)!="number"?null:c.picked===1?"criticalFailure":c.picked>=2&&c.picked<=5?"poor":c.picked>=6&&c.picked<=14?"mediocre":c.picked>=15&&c.picked<=19?"excellent":c.picked===20?"criticalSuccess":null}function de(){if(G){if(!w.history.length){G.innerHTML='<p class="diceov-history-empty">Nessun tiro ancora.</p>';return}G.innerHTML=w.history.map(c=>`
        <div class="diceov-history-row">
          <div class="diceov-history-type diceov-history-type--${String(c.type||"gen").toLowerCase()}">
            <span class="diceov-history-type-code">${c.type||"—"}</span>
            ${c.subtype?`<span class="diceov-history-subtype">${c.subtype}</span>`:""}
            ${c.context?`<span class="diceov-history-subtype">${c.context}</span>`:""}
            ${c.inspired?'<span class="diceov-history-flag">Isp.</span>':""}
          </div>
          <span class="diceov-history-rollmode">${c.rollModeLabel||"—"}</span>
          <span class="diceov-history-total">${c.total??"—"}</span>
          <span class="diceov-history-date">${ii(c.timestamp)}</span>
        </div>
      `).join("")}}function sa(c){w.history=[c,...w.history].slice(0,ei),ai(w.history,s),de()}function lt(){if(!z)return;const c=!!(y!=null&&y.checked);if(c){const N=$e(M);z.value=N==="disadvantage"?"normal":"advantage"}else Qe();z.disabled=c,m&&m.toggleAttribute("hidden",!c),Ge(),Ke()}function rt(c){w.inspirationAvailable=!!c,r&&r.toggleAttribute("hidden",!w.inspirationAvailable),y&&(y.checked=!1,y.disabled=!w.inspirationAvailable),!w.inspirationAvailable&&z&&(z.disabled=!1),!w.inspirationAvailable&&m&&m.setAttribute("hidden","")}function oa(){var U,K;if(!q||!P)return;if(!w.selectionOptions.length){q.setAttribute("hidden",""),P.innerHTML="",w.selectionRollMode=null,w.selectionRollModeReason=null,C&&C.setAttribute("hidden","");return}q.removeAttribute("hidden"),S&&(S.textContent=(n==null?void 0:n.label)||"Seleziona"),P.innerHTML=w.selectionOptions.map(ee=>`
        <option value="${ee.value}" ${ee.disabled?"disabled":""}>${ee.label}</option>
      `).join("");const c=w.selectionOptions.filter(ee=>!ee.disabled),N=(n==null?void 0:n.value)??((U=c[0])==null?void 0:U.value)??((K=w.selectionOptions[0])==null?void 0:K.value);N!==void 0&&(P.value=N);const k=w.selectionOptions.find(ee=>ee.value===P.value);k&&!k.disabled&&h&&(h.value=Number(k.modifier)||0),w.selectionRollMode=k!=null&&k.disabled?null:(k==null?void 0:k.rollMode)||null,w.selectionRollModeReason=k!=null&&k.disabled?null:(k==null?void 0:k.rollModeReason)||null,P&&(P.disabled=c.length===0),la()}function la(){if(!C)return;const c=w.selectionOptions.filter(K=>K.disabled&&K.disabledReason);if(!c.length){C.setAttribute("hidden",""),C.textContent="";return}const N=c.map(K=>K.shortLabel||K.label||K.value).filter(Boolean).join(", "),k=[...new Set(c.map(K=>K.disabledReason).filter(Boolean))],U=k.length?` (${k.join("; ")})`:"";C.textContent=`TS ${N}: fallimento diretto${U}.`,C.removeAttribute("hidden")}function Ge(){if(!R)return;const c=Y(),N=!!c.weaknessWarning&&$e(M)==="disadvantage";R.textContent=c.weaknessWarning??"",R.toggleAttribute("hidden",!N)}function Ke(){if(!A)return;const c=Y(),N=$e(M),k=!!c.rollModeWarning&&c.mode===N;A.textContent=c.rollModeWarning??"",A.toggleAttribute("hidden",!k)}function Qe(){if(!z)return;const c=Y();z.value=c.mode,Ge(),Ke(),Me()}function ra(){return g==="DMG"&&i==="generic"?{wrapper:b,select:T}:{wrapper:p,select:v}}function ca(){const c=["TS","TA","TC","DMG"].includes(g),N=g==="DMG"&&i==="generic";p&&p.toggleAttribute("hidden",!(c&&!N)),b&&b.toggleAttribute("hidden",!(c&&N)),v&&(v.value="none"),T&&(T.value="none"),c||(w.lastBuff=null)}function He(){const{wrapper:c,select:N}=ra();if(!N||c!=null&&c.hasAttribute("hidden"))return null;const k=N.value;if(k==="none")return null;const U=k.endsWith("d6")?6:4,K=k.startsWith("plus"),ee=`${K?"+":"-"}d${U}`;return{choice:k,sides:U,label:ee,sign:K?1:-1}}function ct(c){const N=c.result||[],k=$e(M),U=k==="normal"?1:2,K=N.slice(0,U),ee=He();let ge=null;if(ee&&N.length>U){const me=N[U];typeof me=="number"&&(ge={...ee,roll:me,delta:ee.sign*me})}const ye=K.length?k==="advantage"?Math.max(...K):k==="disadvantage"?Math.min(...K):K[0]:null;return{rollMode:k,baseRolls:K,picked:ye,buff:ge}}function dt(c){const N=c.result||[],k=He();if(k&&N.length){const U=N[N.length-1];if(typeof U=="number")return{baseRolls:N.slice(0,-1),buff:{...k,roll:U,delta:k.sign*U}}}return{baseRolls:N,buff:null}}function ut(c){if(!(!H||!I||!W)&&(H.classList.toggle("is-open",c),I.setAttribute("aria-expanded",String(c)),W.toggleAttribute("hidden",!c),B==null||B.classList.toggle("diceov-stage--history-open",c),c)){const N=M.querySelector(".diceov-header");if(N&&B){const k=Math.max(N.getBoundingClientRect().bottom-B.getBoundingClientRect().top,0);H.style.setProperty("--diceov-history-offset",`${k}px`)}}}function da(){if(!P)return null;const c=w.selectionOptions.find(k=>k.value===P.value);return c&&(c.shortLabel||c.label||"").replace(/\s*\([^)]*\)\s*$/,"").trim()||null}function Me(){if(i!=="generic"){const N=$e(M)==="normal"?1:2,k=He(),U=k?`+1d${k.sides}`:"";xt(M,`${N}d${t}${U}`),pe()}}function xe(){var K;const N=((K=F==null?void 0:F.value)==null?void 0:K.trim())||je(M),k=He(),U=k?`${N}${k.sign<0?"-":"+"}1d${k.sides}`:N;xt(M,U),pe()}function Je(){w.lastRoll&&mt(w.lastRoll,{playCriticalSound:!1})}async function pt(){!w.inspirationAvailable||w.inspirationConsumed||y!=null&&y.checked&&(w.inspirationConsumed=!0,rt(!1),typeof f=="function"&&await f())}function mt(c,{playCriticalSound:N=!1}={}){var Ee,le,_e;if(Xe(c)){pe("—","Lancio non valido, rilancia i dadi.");return}const k=Number((Ee=Z())==null?void 0:Ee.value)||0;if(i!=="generic"){const X=ct(c);if(w.lastBuff=X.buff,!X.baseRolls.length){pe();return}const qe=Pe(X),ga=qe?`${g||"GEN"}:${qe}:${X.rollMode}:${X.baseRolls.join(",")}:${X.picked}`:null;Ce(qe,{playAudio:N,signature:ga});const va=((le=X.buff)==null?void 0:le.delta)||0,ba=(X.picked??0)+k+va,ha=X.rollMode==="advantage"?"Vantaggio":X.rollMode==="disadvantage"?"Svantaggio":"Normale",ya=X.baseRolls.join(", ");if(V&&(V.textContent=`${ba}`),E){const _a=X.baseRolls.length>1?` (selezionato ${X.picked})`:"",wt=[`${ha}: ${ya}${_a}`,`Mod ${Oe(k)}`];X.buff&&wt.push(`${X.buff.label} (d${X.buff.sides}: ${X.buff.roll})`),E.textContent=wt.join(" · ")}return}Ce(null,{signature:null});const U=dt(c);w.lastBuff=U.buff;const K=U.baseRolls.reduce((X,qe)=>X+qe,0),ee=Number(c.constant)||0,ge=((_e=U.buff)==null?void 0:_e.delta)||0,ye=K+ee+k+ge,me=U.baseRolls.length?`Dadi: ${U.baseRolls.join(", ")}`:"Dadi: —";if(V&&(V.textContent=`${ye}`),E){const X=[me];ee&&X.push(`Costante ${Oe(ee)}`),k&&X.push(`Mod ${Oe(k)}`),U.buff&&X.push(`${U.buff.label} ${Oe(U.buff.delta)} (d${U.buff.sides}: ${U.buff.roll})`),E.textContent=X.join(" · ")}}function ua(c){var ye,me,Ee;if(Xe(c))return null;const N=Number((ye=Z())==null?void 0:ye.value)||0;if(i!=="generic"){const le=ct(c);if(w.lastBuff=le.buff,!le.baseRolls.length)return null;const _e=((me=le.buff)==null?void 0:me.delta)||0;return{value:le.picked,total:(le.picked??0)+N+_e}}const k=dt(c);w.lastBuff=k.buff;const U=k.baseRolls.reduce((le,_e)=>le+_e,0),K=Number(c.constant)||0,ee=((Ee=k.buff)==null?void 0:Ee.delta)||0,ge=U+K;return{value:ge,total:ge+N+ee}}function pa(){const c=$e(M);return["TS","TA","TC"].includes(g)?c==="advantage"?"Vantaggio":c==="disadvantage"?"Svantaggio":"Normale":(g==="GEN"||g===null)&&["advantage","disadvantage"].includes(c)?c==="advantage"?"Vantaggio":"Svantaggio":null}y&&(y.onchange=()=>{lt(),Me()}),z&&(z.onchange=()=>{Ge(),Ke(),Me()}),h&&(h.oninput=Je),$&&($.oninput=Je),F&&(F.oninput=xe),P&&(P.onchange=()=>{const c=w.selectionOptions.find(N=>N.value===P.value);c&&!c.disabled&&h&&(h.value=Number(c.modifier)||0),w.selectionRollMode=c!=null&&c.disabled?null:(c==null?void 0:c.rollMode)||null,w.selectionRollModeReason=c!=null&&c.disabled?null:(c==null?void 0:c.rollModeReason)||null,y!=null&&y.checked||Qe(),Je()});const ft=M.querySelector('[name="dice-count"]');ft&&(ft.oninput=()=>{const c=je(M);F&&(F.value=c),xe()});const gt=M.querySelector('[name="dice-type"]');gt&&(gt.onchange=()=>{const c=je(M);F&&(F.value=c),xe()});const vt=()=>{w.lastBuff=null,i==="generic"?xe():Me()};v&&(v.onchange=vt),T&&(T.onchange=vt),I&&(I.onclick=()=>{const c=!(H!=null&&H.classList.contains("is-open"));ut(c)}),oa(),ca(),rt(w.inspirationAvailable),Qe(),lt(),be(),de(),ut(!1),M.removeAttribute("hidden");const bt=o!=null&&o!=="",ht=Z();if(ht&&bt&&Number.isFinite(Number(o))&&(ht.value=Number(o)),i==="generic"){const c=M.querySelector('[name="dice-count"]'),N=M.querySelector('[name="dice-type"]');c&&(c.value="1"),N&&(N.value="d20"),F&&(F.value="1d20"),$&&!bt&&($.value="0"),F&&l&&(F.value=String(l).trim(),li(M,F.value)),F&&!F.value&&(F.value=je(M)),xe()}else Me();const Ne=M.querySelector("#result");let yt=null,Re;const ma=new Promise(c=>{Re=c}),fa=()=>{const c=Za((Ne==null?void 0:Ne.textContent)||"");c!=null&&(yt=c,pt(),a||Se(),Ye(),Re(c))},he=Ne?new MutationObserver(fa):null;he==null||he.observe(Ne,{childList:!0,characterData:!0,subtree:!0});function Ye(){try{he==null||he.disconnect()}catch{}}const _t=c=>{if(!(!M||M.hasAttribute("hidden"))){if(w.lastRoll=c.detail||null,w.lastBuff=null,w.lastRoll){if(Xe(w.lastRoll)){pe("—","Lancio non valido, rilancia i dadi.");return}pt(),mt(w.lastRoll,{playCriticalSound:!0})}if(w.lastRoll){const N=ua(w.lastRoll);if(N){const k=da(),U=Ze(k)&&Ze(k)===Ze(x);sa({type:g||"GEN",subtype:k,context:U?null:x,inspired:w.inspirationConsumed,rollModeLabel:pa(),value:N.value,total:N.total,timestamp:new Date().toISOString()})}}}};window.addEventListener("diceRoll",_t);const $t=Se;return Se=function(){Ye(),window.removeEventListener("diceRoll",_t),M&&M.setAttribute("hidden",""),yt==null&&(Re==null||Re(null)),Se=$t},{waitForRoll:ma,close:()=>{Ye(),$t()}}}function Qt(t){t.key==="Escape"&&Se()}function Se(){M&&(document.removeEventListener("keydown",Qt,!0),M.setAttribute("hidden",""))}function ci(t,a){return t?`
    <div>
      <p>Non hai ancora un personaggio.</p>
      <div class="button-row">
        <button class="primary" data-create-character>Nuovo personaggio</button>
      </div>
    </div>
  `:`<p class="muted">${a?"Modalità offline attiva: crea un personaggio quando torni online.":"Accedi per creare un personaggio."}</p>`}function di(t,a,e=[]){const i=t.data||{},l=i.hp||{},o=i.hit_dice||{},n=i.abilities||{},u=ie(i.proficiency_bonus),f=!!i.inspiration,g=!!i.concentration_active,_=i.initiative??fe(n.dex),s=i.skills||{},x=i.skill_mastery||{},L=$a(n,u,s,x),y=ie(l.current),r=ie(l.max),m=ie(l.temp),R=i.death_saves||{},A=Math.max(0,Math.min(3,Number(R.successes)||0)),C=Math.max(0,Math.min(3,Number(R.failures)||0)),z=r?Math.min(Math.max(Number(y)/r*100,0),100):0,h=Math.max(0,Number(m)||0),j=Math.max(0,Number(r??y??0)),$=h>0,F=$?100:0,q=$?j:1,S=$?h:0,P=r?`${y??"-"}/${r}`:`${y??"-"}`,V=m??"-",E=Math.max(0,Math.min(6,Number(l.weak_points)||0)),d=Array.isArray(i.conditions)?i.conditions:i.condition?[i.condition]:[],p=it.filter(O=>d.includes(O.key)),v=p.length?p.map(O=>O.label).join(", "):"Nessuna condizione",T=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti delle condizioni">?</summary>
      <div class="info-tooltip__panel">
        ${p.length?`
      <ul class="condition-track__list">
        ${p.map(O=>`<li><strong>${O.label}:</strong> ${O.effect}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun effetto attivo.</p>'}
      </div>
    </details>
  `,B=[{value:1,description:"Svantaggio sulle prove di caratteristica."},{value:2,description:"Velocità dimezzata."},{value:3,description:"Svantaggio sui tiri per colpire e tiri salvezza."},{value:4,description:"Punti ferita massimi dimezzati."},{value:5,description:"Velocità ridotta a 0."},{value:6,description:"Morte."}],H=B.filter(O=>O.value<=E),W=`
    <details class="info-tooltip">
      <summary aria-label="Vedi effetti dei punti indebolimento">?</summary>
      <div class="info-tooltip__panel">
        ${H.length?`
      <ul class="weakness-track__list">
        ${H.map(O=>`<li>${O.description}</li>`).join("")}
      </ul>
    `:'<p class="muted">Nessun indebolimento.</p>'}
      </div>
    </details>
  `,G=`Livello attuale: ${E}`,w=Sa(i,n,e),J=[{key:"str",label:re.str,value:n.str},{key:"dex",label:re.dex,value:n.dex},{key:"con",label:re.con,value:n.con},{key:"int",label:re.int,value:n.int},{key:"wis",label:re.wis,value:n.wis},{key:"cha",label:re.cha,value:n.cha}];return`
    <div class="character-overview">
      <div class="character-summary">
        <div class="character-hero">
          ${i.avatar_url?`<img class="character-avatar" src="${i.avatar_url}" alt="Ritratto di ${t.name}" />`:""}
          <div>
            <h3 class="character-name">${t.name}</h3>
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
            <strong>${te(u)}</strong>
          </div>
          <div class="inspiration-chip">
            <span>Ispirazione</span>
            <button
              class="inspiration-toggle"
              type="button"
              data-toggle-inspiration
              aria-pressed="${f}"
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
              aria-pressed="${g}"
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
          ${J.map(O=>{const Y=ie(O.value),Z=Y===null?"-":ka(Y);return`
            <div class="stat-card stat-card--${O.key}">
              <span>${O.label}</span>
              <strong>${Y??"-"}</strong>
              <span class="stat-card__modifier" aria-label="Modificatore ${O.label}">${Z}</span>
            </div>
          `}).join("")}
        </div>
      </div>
      <div class="hp-panel">
        <div class="hp-bar-row">
          <div class="armor-class-card">
            <span>CA</span>
            <strong>${w??"-"}</strong>
            <span class="armor-class-card__sigil" aria-hidden="true">🛡️</span>
          </div>
          <div class="armor-class-card armor-class-card--initiative">
            <span>Iniz</span>
            <strong>${te(ie(_))}</strong>
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
              <strong>${P}</strong>
              <span class="hp-bar-label__divider" aria-hidden="true">•</span>
              <span class="hp-bar-label__temp-group ${$?"is-active":""}">
                <span class="hp-bar-label__temp">HP temporanei</span>
                <strong>${V}</strong>
              </span>
            </div>
            <div class="hp-bar-track">
              <div class="hp-bar" style="flex: ${q};">
                <div class="hp-bar__fill" style="width: ${z}%;"></div>
              </div>
              ${$?`
              <div class="hp-bar hp-bar--temp is-active" style="flex: ${S};">
                <div class="hp-bar__fill hp-bar__fill--temp" style="width: ${F}%;"></div>
              </div>
              `:""}
            </div>
            <div class="hp-panel-hit-dice">
              <span>Dadi vita</span>
              <strong>${wa(o)}</strong>
            </div>
          </div>
        </div>
        <div class="hp-panel-subgrid">
          <div class="stat-chip stat-chip--highlight">
            <span>Percezione passiva</span>
            <strong>${L??"-"}</strong>
          </div>
          <div class="hp-panel-status-row">
            <div class="weakness-track">
              <div class="track-label-row">
                <span class="weakness-track__label">Punti indebolimento</span>
                ${W}
              </div>
              <div class="weakness-track__group" role="radiogroup" aria-label="Livelli indebolimento">
                ${B.map(O=>{const Y=O.value===E;return`
                  <button
                    class="death-save-dot ${Y?"is-filled":""}"
                    type="button"
                    role="radio"
                    aria-checked="${Y}"
                    data-weakness-level="${O.value}"
                    aria-label="Livello ${O.value}: ${O.description}"
                  >
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="weakness-track__description">${G}</div>
            </div>
            <div class="condition-track">
              <div class="track-label-row">
                <span class="condition-track__label">Condizioni</span>
                ${T}
              </div>
              <div class="condition-track__row">
                <span class="condition-track__value">${v}</span>
              </div>
            </div>
            <div class="death-saves">
              <span class="death-saves__label">TS morte</span>
              <div class="death-saves__group" aria-label="Successi">
                <span class="death-saves__tag">✓</span>
                ${Array.from({length:3},(O,Y)=>{const Z=Y+1;return`
                  <button class="death-save-dot ${Z<=A?"is-filled":""}" type="button" data-death-save="successes" data-death-save-index="${Z}" aria-label="Successi ${Z}">
                    <span aria-hidden="true"></span>
                  </button>
                `}).join("")}
              </div>
              <div class="death-saves__group" aria-label="Fallimenti">
                <span class="death-saves__tag">✗</span>
                ${Array.from({length:3},(O,Y)=>{const Z=Y+1;return`
                  <button class="death-save-dot ${Z<=C?"is-filled":""}" type="button" data-death-save="failures" data-death-save-index="${Z}" aria-label="Fallimenti ${Z}">
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
        ${mi(t,e,a)}
      </div>
    </div>
  `}function ui(t){const a=t.data||{},e=a.abilities||{},i=ie(a.proficiency_bonus),l=a.skills||{},o=a.skill_mastery||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Ft.map(n=>{const u=!!l[n.key],f=!!o[n.key],g=Ve(e[n.ability],i,u?f?2:1:0);return`
          <button class="modifier-card modifier-card--interactive ${f?"modifier-card--mastery":u?"modifier-card--proficiency":""}" type="button" data-skill-card="${n.key}" aria-label="Tira abilità ${n.label}">
            <div>
              <div class="modifier-title">
                <strong>${n.label}</strong>
                <span class="modifier-ability modifier-ability--${n.ability}">${re[n.ability]}</span>
              </div>
            </div>
            <div class="modifier-value">${te(g)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function pi(t){const a=t.data||{},e=a.abilities||{},i=ie(a.proficiency_bonus),l=a.saving_throws||{};return`
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${Bt.map(o=>{const n=!!l[o.key],u=Ve(e[o.key],i,n?1:0);return`
          <button class="modifier-card modifier-card--interactive ${n?"modifier-card--proficiency":""}" type="button" data-saving-throw-card="${o.key}" aria-label="Tira salvezza ${o.label}">
            <div>
              <div class="modifier-title">
                <strong>${o.label}</strong>
              </div>
            </div>
            <div class="modifier-value">${te(u)}</div>
          </button>
        `}).join("")}
      </div>
    </div>
  `}function mi(t,a=[],e=!1){const i=t.data||{},l=i.proficiencies||{},o=i.proficiency_notes||"",{tools:n,languages:u}=La(o),f=i.language_proficiencies||"",g=kt(f),_=i.talents||"",s=kt(_),L=[...g,...u].reduce((r,m)=>{const R=m.trim();if(!R)return r;const A=R.toLowerCase();return r.seen.has(A)||(r.seen.add(A),r.values.push(R)),r},{values:[],seen:new Set}).values,y=Aa.filter(r=>l[r.key]).map(r=>r.label);return`
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
          ${y.length?`<div class="tag-row">${y.map(r=>`<span class="chip">${r}</span>`).join("")}</div>`:'<p class="muted">Nessuna competenza equipaggiamento.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="tools">
          ${n.length?`<div class="tag-row">${n.map(r=>`<span class="chip">${r}</span>`).join("")}</div>`:'<p class="muted">Aggiungi strumenti nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="languages">
          ${L.length?`<div class="tag-row">${L.map(r=>`<span class="chip">${r}</span>`).join("")}</div>`:'<p class="muted">Aggiungi lingue conosciute nel profilo.</p>'}
        </div>
        <div class="detail-card detail-card--text tab-panel" role="tabpanel" data-proficiency-panel="talents">
          ${s.length?`<div class="tag-row">${s.map(r=>`<span class="chip">${r}</span>`).join("")}</div>`:'<p class="muted">Aggiungi talenti nel profilo.</p>'}
        </div>
      </div>
    </div>
  `}function fi(t,a=[],e=!1){const i=(a||[]).filter(u=>ve(u).length),l=(a||[]).filter(u=>u.attunement_active).length,o=Ia(a),n=jt(t);return`
    <section class="card home-card home-section home-scroll-panel">
      <header class="card-header">
        <div>
          <p class="eyebrow">Gestione Equipaggiamento</p>
          <div class="pill-row">
            <span class="pill pill--accent">Oggetti in sintonia: ${l}</span>
            <span class="pill">Carico totale: ${Da(o,n)}</span>
          </div>
        </div>
        <div class="actions">
          ${e?`
            <button class="icon-button icon-button--add" type="button" data-add-equip aria-label="Equipaggia oggetto">
              <span aria-hidden="true">+</span>
            </button>
          `:""}
        </div>
      </header>
      ${i.length?`
          <ul class="inventory-list resource-list resource-list--compact">
            ${i.map(u=>{const f=Ba(u);return`
              <li class="modifier-card attack-card resource-card inventory-item-card">
                <div class="resource-card__badges">
                  ${u.is_magic?`<span class="resource-chip resource-chip--floating resource-chip--magic">${f.magic}</span>`:""}
                  ${u.attunement_active?`<span class="resource-chip resource-chip--floating resource-chip--attunement">${f.attunement}</span>`:""}
                </div>
                <div class="attack-card__body resource-card__body">
                  <div class="resource-card__title item-info">
                    ${u.image_url?`<img class="item-avatar" src="${u.image_url}" alt="Foto di ${u.name}" data-item-image="${u.id}" />`:""}
                    <div class="item-info-body">
                      <div class="item-info-line">
                        <button class="item-name-button attack-card__name-button" type="button" data-item-preview="${u.id}" aria-label="Apri anteprima ${u.name}">${u.name}</button>
                        <span class="muted item-meta">
                          ${Fa(u.category)} · ${Pa(ve(u))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ${e?`
                  <div class="resource-card-actions">
                    <button class="resource-action-button" type="button" data-unequip="${u.id}">Rimuovi</button>
                  </div>
                `:""}
              </li>
            `}).join("")}
          </ul>
        `:'<p class="muted">Nessun oggetto equipaggiato.</p>'}
    </section>
  `}function gi(t,a=[]){var z;const e=t.data||{},i=Number(e.attack_bonus_melee??e.attack_bonus)||0,l=Number(e.attack_bonus_ranged??e.attack_bonus)||0,o=Number(e.damage_bonus_melee??e.damage_bonus)||0,n=Number(e.damage_bonus_ranged??e.damage_bonus)||0,u=Number(e.extra_attacks)||0,f=a.filter(h=>h.category==="weapon"&&h.equipable&&ve(h).length),_=(e.spellcasting||{}).ability,s=_?(z=e.abilities)==null?void 0:z[_]:null,x=fe(s),L=ie(e.proficiency_bonus),y=x===null||L===null?null:x+L,m=(Array.isArray(e.spells)?e.spells:[]).filter(h=>(h.kind==="cantrip"||Number(h.level)===0)&&h.attack_roll&&h.damage_die),R=m.length&&y!==null&&_;if(!f.length&&!R)return'<p class="muted">Nessuna arma equipaggiata.</p>';const A=[];return u>0&&A.push(`Attacco Extra (${u})`),i&&A.push(`Mischia attacco ${te(i)}`),o&&A.push(`Mischia danni ${te(o)}`),l&&A.push(`Distanza attacco ${te(l)}`),n&&A.push(`Distanza danni ${te(n)}`),`
    ${A.length?`<div class="tag-row">${A.map(h=>`<span class="chip">${h}</span>`).join("")}</div>`:""}
    <div class="detail-section">
      <div class="detail-grid detail-grid--compact">
        ${f.map(h=>{var J;const j=h.weapon_range||(h.range_normal?"ranged":"melee"),$=h.attack_ability||(j==="ranged"?"dex":"str"),F=fe((J=e.abilities)==null?void 0:J[$])??0,q=e.proficiencies||{},P=(h.weapon_type==="simple"?!!q.weapon_simple:h.weapon_type==="martial"?!!q.weapon_martial:!1)?ie(e.proficiency_bonus)??0:0,V=j==="ranged"?l:i,E=j==="ranged"?n:o,d=F+P+(Number(h.attack_modifier)||0)+V,p=F+(Number(h.damage_modifier)||0)+E,v=h.damage_die?h.damage_die:"-",b=v==="-"?"-":`${v}${p?` ${te(p)}`:""}`,T=Number(h.range_normal)||null,B=Number(h.range_disadvantage)||null,H=Number(h.melee_range)||1.5,I=[];j==="melee"&&H>1.5&&I.push(`Portata ${H} m`),j==="melee"&&h.is_thrown&&T&&I.push(`Lancio ${T}${B?`/${B}`:""}`),j!=="melee"&&T&&I.push(`Gittata ${T}${B?`/${B}`:""}`);const W=I.join(" · "),G=$==="dex"?"DES":$==="str"?"FOR":$.toUpperCase(),w=h.id??h.name;return`
          <div class="modifier-card attack-card">
            <div class="attack-card__body">
              <div class="attack-card__title">
                <strong class="attack-card__name">${h.name}</strong>
                <span class="modifier-ability modifier-ability--${$}">${G}</span>
                <span class="attack-card__hit">${te(d)}</span>
              </div>
              <div class="attack-card__meta">
                <span class="attack-card__damage">${b}</span>
                ${W?`<span class="muted">${W}</span>`:""}
              </div>
            </div>
            <button class="icon-button icon-button--fire" data-roll-damage="${w}" aria-label="Calcola danni ${h.name}">
              <span aria-hidden="true">🔥</span>
            </button>
          </div>
        `}).join("")}
        ${R?m.map(h=>{const j=Number(h.damage_modifier)||0,$=`${h.damage_die}${j?` ${te(j)}`:""}`,F=re[_]??(_==null?void 0:_.toUpperCase()),q=h.range?`Range ${h.range}`:"";return`
            <div class="modifier-card attack-card">
              <div class="attack-card__body">
                <div class="attack-card__title">
                  <strong class="attack-card__name">${h.name}</strong>
                  <span class="modifier-ability modifier-ability--${_}">${F}</span>
                  <span class="attack-card__hit">${te(y)}</span>
                </div>
                <div class="attack-card__meta">
                  <span class="attack-card__damage">${$}</span>
                 
                  ${q?`<span class="muted">${q}</span>`:""}
                </div>
              </div>
              <button class="icon-button icon-button--fire" data-roll-damage="spell:${h.id}" aria-label="Calcola danni ${h.name}">
                <span aria-hidden="true">🔥</span>
              </button>
            </div>
          `}).join(""):""}
      </div>
    </div>
  `}function vi(t,a=!1){var q;const e=t.data||{},i=e.spell_notes||"",l=Array.isArray(e.spells)?Pt(e.spells):[],o=e.spellcasting||{},n=ie(e.proficiency_bonus),u=o.ability,f=u?(q=e.abilities)==null?void 0:q[u]:null,g=fe(f),_=g===null||n===null?null:8+g+n,s=g===null||n===null?null:g+n,x=u?re[u]:null,L=o.slots||{},y=o.slots_max||{},r=o.recharge||"long_rest",R=Array.from({length:9},(S,P)=>P+1).map(S=>{const P=Math.max(0,Number(L[S])||0),V=Math.max(P,Number(y[S])||0);return{level:S,count:P,max:V}}).filter(S=>S.max>0),A=[`${x??"-"}`,`CD ${_===null?"-":_}`,`TC ${s===null?"-":te(s)}`],C=A.length?`<div class="tag-row">${A.map(S=>`<span class="chip">${S}</span>`).join("")}</div>`:"",z=l.filter(S=>{if((Number(S.level)||0)<1)return!1;const V=S.prep_state||"known";return V==="prepared"||V==="always"}),h=l.filter(S=>(Number(S.level)||0)===0),j=z.filter(S=>(S.prep_state||"known")==="always"),$=z.filter(S=>(S.prep_state||"known")!=="always"),F=(S,P="")=>{const V=Number(S.level)||0,E=Be(S.cast_time),d=Jt(E);return`
      <div class="modifier-card attack-card resource-card spell-prepared-list__card">
        <div class="resource-card__badges spell-card__badges">
          ${S.concentration?'<span class="resource-chip resource-chip--floating resource-chip--concentration">C</span>':""}
          ${S.is_ritual?'<span class="resource-chip resource-chip--floating resource-chip--ritual">R</span>':""}
          ${E?`<span class="resource-chip resource-chip--floating ${d}">${E}</span>`:""}
        </div>
        <button class="spell-prepared-list__item" type="button" data-spell-quick-open="${S.id}">
          <span class="spell-prepared-list__name">${S.name}</span>
          ${V>0?`<span class="chip chip--small">${V}°</span>`:""}
        </button>
        <div class="resource-card-actions spell-card-actions">
          ${V>0?`<button class="resource-cta-button resource-cta-button--label" type="button" data-use-spell="${S.id}">Usa</button>`:""}
          ${a?`
            <button class="resource-action-button resource-icon-button" type="button" data-edit-spell="${S.id}" aria-label="Modifica incantesimo ${S.name}">✏️</button>
            <button class="resource-action-button resource-icon-button" type="button" data-delete-spell="${S.id}" aria-label="Elimina incantesimo ${S.name}">🗑️</button>
          `:""}
        </div>
      </div>
    `};return`
    ${C}
    <div class="detail-section">
      <div class="detail-card detail-card--text spell-summary-card">
        <div class="spell-slots">
          <span class="spell-slots__title">Slot rimanenti</span>
          <div class="spell-slots__list">
            ${R.map(S=>{const P=r==="short_rest"?"charge-indicator":"charge-indicator charge-indicator--long",V=Array.from({length:S.max},(E,d)=>{const p=d>=S.count,b=[P,p?"charge-indicator--used":""].filter(Boolean).join(" ");return a&&p?`<button type="button" class="${b}" data-restore-spell-slot="${S.level}" aria-label="Ripristina uno slot di livello ${S.level}"></button>`:`<span class="${b}"></span>`}).join("");return`
              <div class="spell-slot-row">
                <span class="spell-slot-label">Slot ${S.level}°</span>
                <span class="spell-slot-count">${S.count}</span>
                <div class="spell-slot-charges" aria-hidden="true">${V||'<span class="spell-slot-empty">-</span>'}</div>
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
            ${h.map(S=>F(S)).join("")}
          </div>
        `:'<p class="muted">Nessun trucchetto disponibile.</p>'}
      </div>
      <div class="spell-prepared-list">
       
        ${z.length?`
          <div class="spell-prepared-list__group">
            <span class="spell-prepared-list__group-title">Preparati</span>
            ${$.length?`<div class="spell-prepared-list__items">${$.map(S=>F(S,"Preparato")).join("")}</div>`:'<p class="muted">Nessun incantesimo preparato.</p>'}
          </div>
          <div class="spell-prepared-list__group">
            <span class="spell-prepared-list__group-title">Sempre conosciuti</span>
            ${j.length?`<div class="spell-prepared-list__items">${j.map(S=>F(S,"Sempre preparato")).join("")}</div>`:'<p class="muted">Nessun incantesimo sempre conosciuto.</p>'}
          </div>
        `:'<p class="muted">Nessun incantesimo preparato disponibile.</p>'}
      </div>
    </div>
  `}function Be(t){const a=t==null?void 0:t.toString().trim();if(!a)return"";const e=a.toLowerCase();if(e.includes("bonus"))return"Azione Bonus";if(e.includes("reaz"))return"Reazione";if(e.includes("gratuit"))return"Azione Gratuita";if(e.includes("durata")||e.includes("più")||e.includes("piu")||e.includes("superiore"))return"Durata";if(e.includes("azion"))return"Azione";const i=Te.find(l=>l.label.toLowerCase()===e);return(i==null?void 0:i.label)??""}function Nt(t){if(!t)return Te.length;const a=Be(t),e=Te.findIndex(i=>i.label===a);return e===-1?Te.length:e}function Jt(t){var e;if(!t)return"";const a=Be(t);return((e=Te.find(i=>i.label===a))==null?void 0:e.className)??""}function bi(t){return[...t].sort((a,e)=>{const i=Nt(a.cast_time)-Nt(e.cast_time);return i!==0?i:(a.name??"").localeCompare(e.name??"","it",{sensitivity:"base"})})}function Rt(t,a,{showCharges:e=!0,showUseButton:i=!0,showDescription:l=!1,showCastTime:o=!0}={}){return`
    <ul class="resource-list resource-list--compact">
      ${t.map(n=>`
        <li class="modifier-card attack-card resource-card" data-resource-card="${n.id}">
          ${o&&Be(n.cast_time)?`<span class="resource-chip resource-chip--floating ${Jt(n.cast_time)}">${Be(n.cast_time)}</span>`:""}
          <div class="attack-card__body resource-card__body">
            <div class="attack-card__title resource-card__title">
              <strong class="attack-card__name">${n.name}</strong>
            </div>
            ${l?`<p class="resource-card__description">${n.description??""}</p>`:""}
            ${e&&Number(n.max_uses)?`
              <div class="resource-card__charges">
                ${yi(n)}
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
            ${a?`
              <button class="resource-action-button resource-icon-button" data-edit-resource="${n.id}" aria-label="Modifica risorsa">✏️</button>
              <button class="resource-action-button resource-icon-button" data-delete-resource="${n.id}" aria-label="Elimina risorsa">🗑️</button>
            `:""}
          </div>
        </li>
      `).join("")}
    </ul>
  `}function hi(t,a){if(!t.length)return"<p>Nessuna risorsa.</p>";const e=bi(t),i=e.filter(u=>u.reset_on===null||u.reset_on==="none"),l=e.filter(u=>u.reset_on!==null&&u.reset_on!=="none"),o=l.length?`
      <div class="resource-section resource-section--active">
        <div class="resource-section__body">
          ${Rt(l,a,{showUseButton:!0})}
        </div>
      </div>
    `:'<p class="muted">Nessuna risorsa attiva.</p>',n=i.length?`
      <div class="resource-section">
        <header class="card-header"><div><p class="eyebrow">Risorse Passive</p></div></header>
        <div class="resource-section__body">
          ${Rt(i,a,{showCharges:!1,showUseButton:!1,showDescription:!0,showCastTime:!0})}
        </div>
      </div>
    `:"";return`${o}${n}`}function yi(t){const a=Number(t.max_uses)||0,e=Number(t.used)||0;if(!a)return"";const i=t.reset_on==="long_rest"?"long":"short",l=Math.max(a-e,0),o=Array.from({length:a},(n,u)=>{const f=u<e;return`<span class="${["charge-indicator",i==="long"?"charge-indicator--long":"charge-indicator--short",f?"charge-indicator--used":""].filter(Boolean).join(" ")}" aria-hidden="true"></span>`}).join("");return`
    <div class="resource-charge-row" aria-label="Cariche risorsa">
      <span class="resource-charge-label">Cariche</span>
      <span class="resource-charge-count">${l}/${a}</span>
      <div class="resource-charges" aria-hidden="true">${o}</div>
    </div>
  `}async function ne(t,a,e,i){if(!t)return;const l={name:t.name,system:t.system??null,data:a};try{const o=await Ca(t.id,l),n=ce().characters.map(u=>u.id===o.id?o:u);Wt({characters:n}),await ke({characters:n}),e&&D(e),i&&i()}catch{D("Errore aggiornamento personaggio","error")}}async function Yt(t,a,e){if(!t)return!1;const i=t.data||{},l=i.spellcasting||{},o={...l.slots||{}},n={...l.slots_max||{}},u=Math.max(0,Number(o[a])||0);if(!u)return D("Slot incantesimo esauriti","error"),!1;const f=Number(n[a]);return(!Number.isFinite(f)||f<u)&&(n[a]=u),o[a]=Math.max(0,u-1),await ne(t,{...i,spellcasting:{...l,slots:o,slots_max:n}},"Slot incantesimo consumato",e),!0}async function _i(t,a,e){if(!t)return!1;const i=t.data||{},l=i.spellcasting||{},o={...l.slots||{}},n={...l.slots_max||{}},u=Math.max(0,Number(o[a])||0),f=Math.max(0,Number(n[a])||0);return f?u>=f?(D("Slot già al massimo"),!1):(o[a]=Math.min(u+1,f),await ne(t,{...i,spellcasting:{...l,slots:o,slots_max:n}},"Slot incantesimo ripristinato",e),!0):(D("Nessuno slot massimo configurato per questo livello","error"),!1)}const Xt=["Azione","Azione Bonus","Reazione","Azione Gratuita","Durata"];function $i(t){const a=t==null?void 0:t.toString().trim();if(!a)return"";const e=a.toLowerCase();return e.includes("bonus")?"Azione Bonus":e.includes("reaz")?"Reazione":e.includes("gratuit")?"Azione Gratuita":e.includes("durata")||e.includes("più")||e.includes("piu")||e.includes("superiore")?"Durata":e.includes("azion")?"Azione":Xt.find(l=>l.toLowerCase()===e)||""}function Si(t,a){const e=tt(a);e&&we({keepOpen:!0,title:e.title,mode:"generic",notation:e.notation,modifier:e.modifier,rollType:"DMG",characterId:t==null?void 0:t.id,historyLabel:(a==null?void 0:a.name)||null})}function wi(t){if(!t)return;const e=(t.data||{}).description||"Aggiungi una descrizione del background.",i=document.createElement("div");i.className="background-modal";const l=document.createElement("div");l.className="detail-card detail-card--text";const o=document.createElement("div");o.className="background-modal-block";const n=document.createElement("p");n.className="background-modal-description",n.textContent=e,o.appendChild(n),l.appendChild(o),i.appendChild(l),oe({title:"Descrizione background",cancelLabel:null,content:i,cardClass:["modal-card--scrollable","modal-card--background"],showFooter:!1})}async function ki(t){if(!t)return null;const a=t.data||{},e=Array.isArray(a.conditions)?a.conditions:a.condition?[a.condition]:[],i=document.createElement("div");i.className="condition-modal";const l=document.createElement("div");return l.className="condition-modal__list",it.forEach(o=>{const n=document.createElement("label"),u=e.includes(o.key);n.className=`condition-modal__item${u?" is-selected":""}`,n.innerHTML=`
      <span class="condition-modal__item-label"><strong>${o.label}</strong></span>
      <span class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="conditions" value="${o.key}" ${u?"checked":""} />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </span>
    `;const f=n.querySelector('input[type="checkbox"]');f==null||f.addEventListener("change",()=>{n.classList.toggle("is-selected",f.checked)}),l.appendChild(n)}),i.appendChild(l),oe({title:"Condizioni",submitLabel:"Applica",cancelLabel:"Annulla",content:i,cardClass:"modal-card--wide"})}function Li(t,{onUse:a,onReset:e}={}){var s,x;const i=document.createElement("div");i.className="resource-detail";const l=Number(t.max_uses)||0,o=l&&t.used>=l,n=t.reset_on!==null&&t.reset_on!=="none",u=!!(l&&(o?e:a)),f=((s=t.description)==null?void 0:s.trim())||"Nessuna descrizione disponibile per questa risorsa.",g=Zt(t.image_url),_=((x=t.image_url)==null?void 0:x.trim())||"";i.innerHTML=`
    <div class="detail-card detail-card--text resource-detail-card ${g?"":"resource-detail-card--text-only"}">
      ${g?`<img class="resource-detail-image" src="${se(_)}" alt="Immagine di ${se(t.name||"risorsa")}" />`:""}
      <div class="detail-rich-text">${nt(f)}</div>
    </div>
  `,oe({title:t.name||"Risorsa",submitLabel:u?o?"Ripristina":"Usa":"Chiudi",cancelLabel:n&&u?"Chiudi":null,content:i,showFooter:n}).then(async L=>{if(!(!L||!l)){if(o&&e){await e();return}!o&&a&&await a()}})}function Et(t,a,e=null){var V;if(!t)return;const i=E=>{var v,b;const d=E==null?void 0:E.querySelector('input[type="number"]');if(!d)return;const p=(b=(v=E.querySelector("span"))==null?void 0:v.textContent)==null?void 0:b.trim();Ie(d,{decrementLabel:p?`Riduci ${p}`:"Diminuisci valore",incrementLabel:p?`Aumenta ${p}`:"Aumenta valore"})},l=!!((V=t.data)!=null&&V.is_spellcaster),o=document.createElement("div");o.className="drawer-form modal-form-grid spell-form";const n=(E,d="balanced")=>{const p=document.createElement("div");return p.className=`modal-form-row modal-form-row--${d}`,E.filter(Boolean).forEach(v=>p.appendChild(v)),p},u=document.createElement("label");u.className="field",u.innerHTML="<span>Tipo incantesimo</span>";const f=(e==null?void 0:e.kind)??(Number(e==null?void 0:e.level)===0?"cantrip":"spell"),g=ze([{value:"cantrip",label:"Trucchetto"},{value:"spell",label:"Incantesimo"}],f);g.name="spell_kind",u.appendChild(g);const _=ae({label:"Nome incantesimo",name:"spell_name",placeholder:"Es. Palla di fuoco",value:(e==null?void 0:e.name)??""}),s=_.querySelector("input");s&&(s.required=!0);const x=ae({label:"Livello incantesimo",name:"spell_level",type:"number",value:(e==null?void 0:e.level)??1}),L=x.querySelector("input");L&&(L.min="1",L.max="9");const y=l?document.createElement("label"):null;let r=null;y&&(y.className="field",y.innerHTML="<span>Preparazione</span>",r=ze([{value:"known",label:"Conosciuto"},{value:"prepared",label:"Preparato"},{value:"always",label:"Sempre preparato"}],(e==null?void 0:e.prep_state)??"known"),r.name="spell_prep_state",y.appendChild(r)),o.appendChild(n([_,u,x],"compact"));const m=document.createElement("label");m.className="field",m.innerHTML="<span>Tipo di lancio</span>";const R=ze([{value:"",label:"Seleziona tipo"},...Xt.map(E=>({value:E,label:E}))],$i(e==null?void 0:e.cast_time));R.name="spell_cast_time",m.appendChild(R),o.appendChild(n([m,ae({label:"Durata",name:"spell_duration",placeholder:"Es. 1 minuto",value:(e==null?void 0:e.duration)??""}),ae({label:"Range",name:"spell_range",placeholder:"Es. 18 m",value:(e==null?void 0:e.range)??""}),ae({label:"Componenti",name:"spell_components",placeholder:"Es. V, S, M",value:(e==null?void 0:e.components)??""})],"compact"));const A=document.createElement("div");A.className="modal-toggle-field",A.innerHTML=`
    <span class="modal-toggle-field__label">Concentrazione</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="spell_concentration" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const C=document.createElement("div");C.className="modal-toggle-field",C.innerHTML=`
    <span class="modal-toggle-field__label">Tiro per colpire</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="spell_attack_roll" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const z=document.createElement("div");z.className="modal-toggle-field",z.innerHTML=`
    <span class="modal-toggle-field__label">Rituale</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="spell_is_ritual" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `,o.appendChild(n([A,C,z,y],"compact"));const h=ae({label:"Notazione dado",name:"spell_damage_die",placeholder:"Es. 1d10",value:(e==null?void 0:e.damage_die)??""}),j=ae({label:"Foto (URL)",name:"spell_image_url",placeholder:"https://.../incantesimo.png",value:(e==null?void 0:e.image_url)??""}),$=ae({label:"Modificatore",name:"spell_damage_modifier",type:"number",value:(e==null?void 0:e.damage_modifier)??""});o.appendChild(n([h,$,j],"compact")),o.appendChild(Ut({label:"Descrizione",name:"spell_description",placeholder:"Descrizione dell'incantesimo...",value:(e==null?void 0:e.description)??""}));const F=o.querySelector('input[name="spell_concentration"]');F&&(F.checked=!!(e!=null&&e.concentration));const q=o.querySelector('input[name="spell_attack_roll"]');q&&(q.checked=!!(e!=null&&e.attack_roll));const S=o.querySelector('input[name="spell_is_ritual"]');S&&(S.checked=!!(e!=null&&e.is_ritual));const P=()=>{L&&(g.value==="cantrip"?(L.value="0",L.min="0",L.max="0",L.readOnly=!0,L.disabled=!0):(Number(L.value)===0&&(L.value="1"),L.min="1",L.max="9",L.readOnly=!1,L.disabled=!1))};g.addEventListener("change",P),P(),o.querySelectorAll('input[type="number"]').forEach(E=>{const d=E.closest(".field");i(d)}),oe({title:e?"Modifica incantesimo":"Nuovo incantesimo",submitLabel:e?"Salva":"Aggiungi",content:o,cardClass:"modal-card--form"}).then(async E=>{var O,Y,Z,be,Ae,pe,Ce,Pe;if(!E)return;const d=(O=E.get("spell_name"))==null?void 0:O.trim();if(!d){D("Inserisci un nome per l'incantesimo","error");return}const p=de=>de===""||de===null?null:Number(de),v=E.get("spell_kind")||null,b=p(E.get("spell_level"))??0,T=v==="cantrip"?0:Math.min(9,Math.max(1,b||1)),B=p(E.get("spell_damage_modifier")),H=l?E.get("spell_prep_state")||"known":(e==null?void 0:e.prep_state)||"known",I={id:(e==null?void 0:e.id)??`spell-${Date.now()}-${Math.random().toString(16).slice(2)}`,name:d,level:T,kind:v||(T===0?"cantrip":"spell"),cast_time:E.get("spell_cast_time")||null,duration:((Y=E.get("spell_duration"))==null?void 0:Y.trim())||null,range:((Z=E.get("spell_range"))==null?void 0:Z.trim())||null,components:((be=E.get("spell_components"))==null?void 0:be.trim())||null,concentration:E.has("spell_concentration"),attack_roll:E.has("spell_attack_roll"),is_ritual:E.has("spell_is_ritual"),image_url:((Ae=E.get("spell_image_url"))==null?void 0:Ae.trim())||null,damage_die:((pe=E.get("spell_damage_die"))==null?void 0:pe.trim())||null,damage_modifier:B,description:((Ce=E.get("spell_description"))==null?void 0:Ce.trim())||null,prep_state:H},W=Array.isArray((Pe=t.data)==null?void 0:Pe.spells)?t.data.spells:[],G=e?W.map(de=>de.id===e.id?I:de):[...W,I],w={...t.data,spells:G};await ne(t,w,e?"Incantesimo aggiornato":"Incantesimo aggiunto",a)})}function Ai(t,a,e){var _,s,x,L,y;if(!t||!a)return;const i=Math.max(0,Number(a.level)||0),l=[`Range: ${((_=a.range)==null?void 0:_.trim())||"-"}`,`Durata: ${((s=a.duration)==null?void 0:s.trim())||"-"}`,`Componenti: ${((x=a.components)==null?void 0:x.trim())||"-"}`,...a.concentration?["Concentrazione: Sì"]:[],...a.is_ritual?["Rituale: Sì"]:[]],o=((L=a.description)==null?void 0:L.trim())||"Nessuna descrizione disponibile.",n=i>0,u=Zt(a.image_url),f=((y=a.image_url)==null?void 0:y.trim())||"",g=document.createElement("div");g.className="spell-quick-detail",g.innerHTML=`
    <div class="detail-card detail-card--text spell-quick-detail__card ${u?"":"resource-detail-card--text-only"}">
      ${u?`<img class="resource-detail-image" src="${se(f)}" alt="Immagine di ${se(a.name||"incantesimo")}" />`:""}
      <div class="spell-quick-detail__content">
        <div class="tag-row spell-quick-detail__chips">${l.map(r=>`<span class="chip">${se(r)}</span>`).join("")}</div>
        <div class="detail-rich-text spell-quick-detail__description">${nt(o)}</div>
      </div>
    </div>
  `,oe({title:a.name||"Incantesimo",submitLabel:n?"Lancia":"Chiudi",cancelLabel:n?"Chiudi":null,content:g,cardClass:["spell-quick-detail-modal"],showFooter:n}).then(async r=>{!r||!n||!await Yt(t,i,e)||Si(t,a)})}function Zt(t){const a=String(t||"").trim();if(!a)return!1;const e=a.toLowerCase();return!e.endsWith("/icons/icon.svg")&&!e.endsWith("icons/icon.svg")}function nt(t){const i=se(String(t||"")).split(`
`).map(o=>{let n=o;return n=n.replace(/`([^`]+)`/g,"<code>$1</code>"),n=n.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),n=n.replace(/_([^_]+)_/g,"<em>$1</em>"),n.startsWith("# ")?`<h4>${n.slice(2)}</h4>`:n.startsWith("- ")?`<li>${n.slice(2)}</li>`:n.startsWith("&gt; ")?`<blockquote>${n.slice(5)}</blockquote>`:`<p>${n||"<br />"}</p>`});let l=!1;return i.map(o=>o.startsWith("<li>")?l?o:(l=!0,`<ul>${o}`):l?(l=!1,`</ul>${o}`):o).join("")+(l?"</ul>":"")}function se(t){return String(t||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function ea(t,a){if(!t)return;const e=t.data||{};if(!(e.spellcasting||{}).can_prepare)return;const l=Array.isArray(e.spells)?Pt(e.spells):[],o=l.filter(r=>{const m=r.prep_state||"known",R=Number(r.level)||0;return m!=="always"&&R>0});if(!o.length){D("Nessun incantesimo preparabile.","info");return}const n=new Set(o.filter(r=>(r.prep_state||"known")==="prepared").map(r=>r.id)),u=o.reduce((r,m)=>{const R=Math.max(1,Number(m.level)||1);return r.has(R)||r.set(R,[]),r.get(R).push(m),r},new Map),f=Array.from(u.keys()).sort((r,m)=>r-m),g=r=>r===1?"1° livello":`${r}° livello`,_=r=>String(r.description||"").trim()||"Nessuna descrizione disponibile.",s=f[0]||1,x=document.createElement("div");x.className="prepared-spells-modal",x.innerHTML=`
    <p class="muted">Seleziona gli incantesimi da preparare per oggi.</p>
    <div class="tab-bar prepared-spells-modal__tabs" role="tablist" aria-label="Livelli incantesimo">
      ${f.map(r=>{const m=r===s;return`
          <button
            class="tab-bar__button prepared-spells-modal__tab ${m?"is-active":""}"
            type="button"
            role="tab"
            data-prepared-level-tab="${r}"
            aria-selected="${m}"
            aria-controls="prepared-spells-level-${r}"
            id="prepared-spells-tab-${r}"
            tabindex="${m?"0":"-1"}"
          >
            ${g(r)}
          </button>
        `}).join("")}
    </div>
    <div class="prepared-spells-modal__group-stack">
      ${f.map(r=>{const m=u.get(r)||[];return`
          <section
            class="prepared-spells-modal__group tab-panel ${r===s?"is-active":""}"
            data-level-group="${r}"
            data-prepared-level-panel="${r}"
            role="tabpanel"
            id="prepared-spells-level-${r}"
            aria-labelledby="prepared-spells-tab-${r}"
          >
            <div class="prepared-spells-modal__list">
              ${m.map(A=>{var F,q,S,P;const C=n.has(A.id),z=se(((F=A.range)==null?void 0:F.trim())||"-"),h=se(((q=A.duration)==null?void 0:q.trim())||"-"),j=se(((S=A.components)==null?void 0:S.trim())||"-"),$=se(((P=A.cast_time)==null?void 0:P.trim())||"-");return`
                  <article class="prepared-spells-modal__spell" data-prepared-item="${A.id}">
                    <div class="prepared-spells-modal__spell-actions">
                      <button
                        class="prepared-spells-modal__toggle ${C?"is-active":""}"
                        type="button"
                        data-prepared-toggle="${A.id}"
                        aria-pressed="${C}"
                      >
                        <span class="prepared-spells-modal__toggle-name">${A.name}</span>
                      </button>
                      <dl class="prepared-spells-modal__meta" aria-label="Dettagli rapidi ${se(A.name)}">
                        <div class="prepared-spells-modal__meta-item"><dt>Range</dt><dd>${z}</dd></div>
                        <div class="prepared-spells-modal__meta-item"><dt>Durata</dt><dd>${h}</dd></div>
                        <div class="prepared-spells-modal__meta-item"><dt>Componenti</dt><dd>${j}</dd></div>
                        <div class="prepared-spells-modal__meta-item"><dt>Lancio</dt><dd>${$}</dd></div>
                      </dl>
                      <button
                        class="resource-action-button resource-icon-button prepared-spells-modal__description-toggle"
                        type="button"
                        data-prepared-description-toggle="${A.id}"
                        aria-expanded="false"
                        aria-label="Mostra descrizione ${A.name}"
                      >
                        🔍
                      </button>
                    </div>
                    <div class="prepared-spells-modal__description" data-prepared-description="${A.id}" hidden>
                      <div class="detail-rich-text">${nt(_(A))}</div>
                    </div>
                  </article>
                `}).join("")}
            </div>
          </section>
        `}).join("")}
    </div>
  `;const L=()=>{x.querySelectorAll("[data-prepared-toggle]").forEach(r=>{const m=r.dataset.preparedToggle;if(!m)return;const R=n.has(m);r.classList.toggle("is-active",R),r.setAttribute("aria-pressed",String(R))})};x.querySelectorAll("[data-prepared-toggle]").forEach(r=>{r.addEventListener("click",()=>{const m=r.dataset.preparedToggle;m&&(n.has(m)?n.delete(m):n.add(m),L())})}),x.querySelectorAll("[data-prepared-description-toggle]").forEach(r=>{r.addEventListener("click",()=>{const m=r.dataset.preparedDescriptionToggle;if(!m)return;const R=x.querySelector(`[data-prepared-description="${m}"]`);if(!R)return;const A=!R.hidden;R.hidden=A,r.setAttribute("aria-expanded",String(!A))})});const y=r=>{x.querySelectorAll("[data-prepared-level-tab]").forEach(m=>{const R=m.dataset.preparedLevelTab===String(r);m.classList.toggle("is-active",R),m.setAttribute("aria-selected",String(R)),m.setAttribute("tabindex",R?"0":"-1")}),x.querySelectorAll("[data-prepared-level-panel]").forEach(m=>{const R=m.dataset.preparedLevelPanel===String(r);m.classList.toggle("is-active",R)})};x.querySelectorAll("[data-prepared-level-tab]").forEach(r=>{r.addEventListener("click",()=>{const m=r.dataset.preparedLevelTab;m&&y(m)})}),L(),oe({title:"Incantesimi preparati",submitLabel:"Salva",cancelLabel:"Annulla",content:x,cardClass:"modal-card--form"}).then(async r=>{if(!r)return;const m=l.map(A=>{if((A.prep_state||"known")==="always"||Number(A.level)===0)return A;const z=n.has(A.id);return{...A,prep_state:z?"prepared":"known"}}),R={...t.data,spells:m};await ne(t,R,"Incantesimi preparati aggiornati",a)})}function Ci(t){var o;const a=(o=t==null?void 0:t.data)==null?void 0:o.avatar_url;if(!a)return;const e=document.querySelector(".avatar-preview");e&&e.remove();const i=document.createElement("div");i.className="avatar-preview",i.tabIndex=0,i.innerHTML=`
    <img class="avatar-preview__image" src="${a}" alt="Ritratto di ${t.name}" />
  `;const l=()=>{i.remove()};i.addEventListener("click",l),i.addEventListener("keydown",n=>{n.key==="Escape"&&l()}),document.body.appendChild(i),i.focus()}function qt(t,a,e=null){if(!t)return;const i=(q,S={})=>{const P=q==null?void 0:q.querySelector('input[type="number"]');P&&Ie(P,S)},l=document.createElement("div");l.className="drawer-form modal-form-grid";const o=(q,S="balanced")=>{const P=document.createElement("div");return P.className=`modal-form-row modal-form-row--${S}`,q.filter(Boolean).forEach(V=>P.appendChild(V)),P},n=ae({label:"Nome abilità",name:"name",placeholder:"Es. Azione Impetuosa",value:(e==null?void 0:e.name)??""}),u=ae({label:"Foto (URL)",name:"image_url",placeholder:"https://.../risorsa.png",value:(e==null?void 0:e.image_url)??""}),f=document.createElement("label");f.className="field",f.innerHTML="<span>Tipo di lancio</span>";const g=ze([{value:"Sempre attiva",label:"Sempre attiva"},{value:"Azione",label:"Azione"},{value:"Reazione",label:"Reazione"},{value:"Azione Bonus",label:"Azione Bonus"},{value:"Azione Gratuita",label:"Azione Gratuita"},{value:"Durata",label:"Durata"}],(e==null?void 0:e.cast_time)??"Azione");g.name="cast_time",f.appendChild(g),l.appendChild(o([n,f,u],"balanced"));const _=document.createElement("div");_.className="modal-toggle-field",_.innerHTML=`
    <span class="modal-toggle-field__label">Passiva (senza cariche)</span>
    <label class="diceov-toggle">
      <input type="checkbox" name="is_passive" />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const s=ae({label:"Cariche massime",name:"max_uses",type:"number",value:(e==null?void 0:e.max_uses)??1});i(s,{decrementLabel:"Riduci cariche massime",incrementLabel:"Aumenta cariche massime"});const x=ae({label:"Cariche consumate",name:"used",type:"number",value:(e==null?void 0:e.used)??0});i(x,{decrementLabel:"Riduci cariche consumate",incrementLabel:"Aumenta cariche consumate"}),l.appendChild(o([_,s,x],"compact"));const L=ae({label:"Recupero riposo breve",name:"recovery_short",type:"number",value:(e==null?void 0:e.recovery_short)??""});i(L,{decrementLabel:"Riduci recupero riposo breve",incrementLabel:"Aumenta recupero riposo breve"});const y=ae({label:"Recupero riposo lungo",name:"recovery_long",type:"number",value:(e==null?void 0:e.recovery_long)??""});i(y,{decrementLabel:"Riduci recupero riposo lungo",incrementLabel:"Aumenta recupero riposo lungo"});const r=document.createElement("label");r.className="field",r.innerHTML="<span>Tipo ricarica</span>";const m=ze([{value:"short_rest",label:"Riposo breve"},{value:"long_rest",label:"Riposo lungo"}],(e==null?void 0:e.reset_on)??"long_rest");m.name="reset_on",r.appendChild(m),l.appendChild(o([r,L,y],"balanced"));const R=ae({label:"Notazione dado",name:"damage_dice_notation",placeholder:"Es. 2d8+1d4",value:(e==null?void 0:e.damage_dice_notation)??""}),A=ae({label:"Modificatore dado",name:"damage_modifier",type:"number",value:(e==null?void 0:e.damage_modifier)??""});i(A,{decrementLabel:"Riduci modificatore dado",incrementLabel:"Aumenta modificatore dado"}),l.appendChild(o([R,A],"compact")),l.appendChild(Ut({label:"Descrizione",name:"description",placeholder:"Inserisci una descrizione...",value:(e==null?void 0:e.description)??""}));const C=l.querySelector('input[name="max_uses"]'),z=l.querySelector('input[name="used"]'),h=l.querySelector('input[name="recovery_short"]'),j=l.querySelector('input[name="recovery_long"]'),$=l.querySelector('input[name="is_passive"]');$&&($.checked=Number(e==null?void 0:e.max_uses)===0||(e==null?void 0:e.reset_on)===null||(e==null?void 0:e.reset_on)==="none");const F=()=>{const q=$==null?void 0:$.checked;q&&(C&&(C.value="0"),z&&(z.value="0"),h&&(h.value="0"),j&&(j.value="0")),C&&(C.disabled=q),z&&(z.disabled=q),h&&(h.disabled=q),j&&(j.disabled=q),m.disabled=q};$==null||$.addEventListener("change",F),F(),oe({title:e?"Modifica abilità":"Nuova abilità",submitLabel:e?"Salva":"Crea",content:l,cardClass:"modal-card--form"}).then(async q=>{var b,T,B,H;if(!q)return;const S=(b=q.get("name"))==null?void 0:b.trim();if(!S){D("Inserisci un nome per la risorsa","error");return}const P=ce().user,V=I=>I===""||I===null?null:Number(I),E=Number(q.get("max_uses"))||0,d=Math.min(Number(q.get("used"))||0,E||0),p=q.get("is_passive")==="on",v={user_id:(P==null?void 0:P.id)??t.user_id,character_id:t.id,name:S,image_url:((T=q.get("image_url"))==null?void 0:T.trim())||null,description:((B=q.get("description"))==null?void 0:B.trim())||null,cast_time:q.get("cast_time")||null,damage_dice_notation:((H=q.get("damage_dice_notation"))==null?void 0:H.trim())||null,damage_modifier:V(q.get("damage_modifier")),max_uses:E,used:d,reset_on:p?null:q.get("reset_on"),recovery_short:V(q.get("recovery_short")),recovery_long:V(q.get("recovery_long"))};try{e?(await et(e.id,v),D("Risorsa aggiornata")):(await Ma(v),D("Risorsa creata")),a()}catch{D("Errore salvataggio risorsa","error")}})}let Tt=!1,We=null;function zt(t){var a,e;return((e=(a=t==null?void 0:t.data)==null?void 0:a.settings)==null?void 0:e.auto_usage_dice)!==!1}async function Q(t){var l,o,n;We=t;const a=ce(),{user:e,offline:i}=a;Mt(!0);try{let u=a.characters;if(!i&&e)try{u=await Ea(e.id),Wt({characters:u}),await ke({characters:u})}catch{D("Errore caricamento personaggi","error")}const f=ue(a.activeCharacterId);!u.some(d=>ue(d.id)===f)&&u.length&&Ja(u[0].id);const _=ue(ce().activeCharacterId),s=u.find(d=>ue(d.id)===_),x=!!e&&!i,L=!!e&&!i,y=!!e&&!i;let r=a.cache.resources,m=a.cache.items;if(!i&&s){const[d,p]=await Promise.allSettled([Ot(s.id),Ga(s.id)]),v={};d.status==="fulfilled"?(r=d.value,De("resources",r),v.resources=r):D("Errore caricamento risorse","error"),p.status==="fulfilled"?(m=p.value,De("items",m),v.items=m):D("Errore caricamento equip","error"),Object.keys(v).length&&await ke(v)}t.innerHTML=`
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
          ${s?pi(s):"<p>Nessun personaggio selezionato.</p>"}
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
            ${s?ui(s):"<p>Nessun personaggio selezionato.</p>"}
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
              ${s&&y?`
                <button class="icon-button" data-edit-character aria-label="Modifica personaggio">
                  <span aria-hidden="true">✏️</span>
                </button>
              `:""}
            </div>
          </header>
          ${s?di(s,y,m):ci(x,i)}
        </section>
        ${s?fi(s,m,y):""}
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
            ${s?gi(s,m||[]):"<p>Nessun personaggio selezionato.</p>"}
          </div>
        </section>
        ${(l=s==null?void 0:s.data)!=null&&l.is_spellcaster?`
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Incantesimi</p>
            </div>
            <div class="actions">
              <button class="icon-button icon-button--dice" data-open-dice="spell-attack" aria-label="Lancia dado tiro per colpire incantesimi">
                <span aria-hidden="true">🎲</span>
              </button>
              ${(n=(o=s==null?void 0:s.data)==null?void 0:o.spellcasting)!=null&&n.can_prepare?`
                <button class="icon-button icon-button--spell-prepare" type="button" data-open-prepared-spells aria-label="Prepara incantesimi" title="Prepara incantesimi">
                  <span aria-hidden="true">📖</span>
                </button>
              `:""}
              ${s&&y?`
                <button class="icon-button icon-button--add" data-add-spell aria-label="Aggiungi incantesimo">
                  <span aria-hidden="true">+</span>
                </button>
              `:""}
            </div>
          </header>
          <div class="home-scroll-body">
            ${vi(s,y)}
          </div>
        </section>
        `:""}
        <section class="card home-card home-section home-scroll-panel">
          <header class="card-header">
            <div>
              <p class="eyebrow">Risorse</p>           
            </div>
            ${s&&L?`
              <button class="icon-button icon-button--add" data-add-resource aria-label="Nuova risorsa">
                <span aria-hidden="true">+</span>
              </button>
            `:""}
          </header>
          <div class="home-scroll-body home-scroll-body--resources">
            ${s?hi(r,L):"<p>Nessun personaggio selezionato.</p>"}
            ${s&&!L?'<p class="muted">Connettiti per aggiungere nuove risorse.</p>':""}
          </div>
        </section>
      </div>
    </div>
  `,ta();const R=t.querySelector("[data-create-character]");R&&R.addEventListener("click",()=>{Lt(e,()=>Q(t))});const A=t.querySelector("[data-edit-character]");A&&A.addEventListener("click",()=>{Lt(e,()=>Q(t),s)});const C=t.querySelector("[data-add-resource]");C&&C.addEventListener("click",()=>{qt(s,()=>Q(t))});const z=t.querySelector("[data-add-spell]");z&&z.addEventListener("click",()=>{Et(s,()=>Q(t))}),t.querySelectorAll("[data-edit-spell]").forEach(d=>d.addEventListener("click",()=>{var T;const p=d.dataset.editSpell;if(!p||!s)return;const b=(Array.isArray((T=s.data)==null?void 0:T.spells)?s.data.spells:[]).find(B=>B.id===p);b&&Et(s,()=>Q(t),b)})),t.querySelectorAll("[data-delete-spell]").forEach(d=>d.addEventListener("click",async()=>{var H;const p=d.dataset.deleteSpell;if(!p||!s)return;const v=Array.isArray((H=s.data)==null?void 0:H.spells)?s.data.spells:[],b=v.find(I=>I.id===p);if(!b||!await at({title:"Conferma eliminazione incantesimo",message:`Stai per eliminare l'incantesimo "${b.name}" dalla scheda del personaggio. Questa azione non può essere annullata.`,confirmLabel:"Elimina"}))return;const B={...s.data||{},spells:v.filter(I=>I.id!==b.id)};await ne(s,B,"Incantesimo eliminato",()=>Q(t))}));const h=t.querySelector("[data-open-prepared-spells]");h&&h.addEventListener("click",()=>{ea(s,()=>Q(t))}),t.querySelectorAll("[data-spell-quick-open]").forEach(d=>d.addEventListener("click",()=>{var T;const p=d.dataset.spellQuickOpen;if(!p||!s)return;const b=(Array.isArray((T=s.data)==null?void 0:T.spells)?s.data.spells:[]).find(B=>B.id===p);b&&Ai(s,b,()=>Q(t))}));const j=t.querySelector("[data-show-background]");j&&j.addEventListener("click",()=>{wi(s)});const $=t.querySelector("[data-edit-conditions]");$&&$.addEventListener("click",async()=>{await aa(t)}),t.querySelectorAll("[data-proficiency-tabs]").forEach(d=>{var B;const p=Array.from(d.querySelectorAll("[data-proficiency-tab]")),v=Array.from(d.querySelectorAll("[data-proficiency-panel]"));if(!p.length||!v.length)return;const b=H=>{p.forEach(I=>{const W=I.dataset.proficiencyTab===H;I.classList.toggle("is-active",W),I.setAttribute("aria-selected",String(W))}),v.forEach(I=>{I.classList.toggle("is-active",I.dataset.proficiencyPanel===H)})};p.forEach(H=>{H.addEventListener("click",()=>{b(H.dataset.proficiencyTab)})});const T=((B=p.find(H=>H.classList.contains("is-active")))==null?void 0:B.dataset.proficiencyTab)??p[0].dataset.proficiencyTab;T&&b(T)});const F=t.querySelector("[data-add-equip]");F&&s&&y&&F.addEventListener("click",async()=>{var w;const d=(m||[]).filter(J=>J.equipable&&!ve(J).length);if(!d.length){D("Nessun oggetto equipaggiabile disponibile","error");return}const p=document.createElement("div");p.className="drawer-form";const v=document.createElement("label");v.className="field",v.innerHTML="<span>Oggetto</span>";const b=document.createElement("select");b.name="item_id",d.forEach(J=>{const O=document.createElement("option");O.value=J.id,O.textContent=J.name,b.appendChild(O)}),v.appendChild(b),p.appendChild(v);const T=document.createElement("fieldset");T.className="equip-slot-field",T.innerHTML="<legend>Punti del corpo</legend>";const B=document.createElement("div");B.className="equip-slot-list",Ka.forEach(J=>{const O=document.createElement("label");O.className="checkbox",O.innerHTML=`<input type="checkbox" name="equip_slots" value="${J.value}" /> <span>${J.label}</span>`,B.appendChild(O)}),T.appendChild(B),p.appendChild(T);const H=await oe({title:"Equipaggia oggetto",submitLabel:"Equipaggia",content:p});if(!H)return;const I=H.getAll("equip_slots");if(!I.length){D("Seleziona almeno uno slot","error");return}const W=d.find(J=>String(J.id)===H.get("item_id"));if(!W)return;const G=((w=s.data)==null?void 0:w.proficiencies)||{};if(W.category==="weapon"){if(!W.weapon_type){D("Definisci il tipo di arma prima di equipaggiarla","error");return}if(!(W.weapon_type==="simple"?!!G.weapon_simple:!!G.weapon_martial)){D("Non hai la competenza per equipaggiare questo oggetto","error");return}}if(W.category==="armor")if(W.is_shield){if(!G.shield){D("Non hai la competenza per equipaggiare questo oggetto","error");return}}else if(W.armor_type){if(!(W.armor_type==="light"?!!G.armor_light:W.armor_type==="medium"?!!G.armor_medium:!!G.armor_heavy)){D("Non hai la competenza per equipaggiare questo oggetto","error");return}}else{D("Definisci il tipo di armatura prima di equipaggiarla","error");return}if(!W.sovrapponibile&&(m||[]).filter(O=>O.id!==W.id).filter(O=>ve(O).some(Y=>I.includes(Y))).length){D("Uno o più slot selezionati sono già occupati","error");return}try{await At(W.id,{equip_slot:I[0]||null,equip_slots:I}),D("Equipaggiamento aggiornato"),Q(t)}catch{D("Errore aggiornamento equip","error")}}),t.querySelectorAll("[data-unequip]").forEach(d=>d.addEventListener("click",async()=>{const p=(m||[]).find(v=>v.id===d.dataset.unequip);if(p)try{await At(p.id,{equip_slot:null,equip_slots:[]}),D("Equipaggiamento rimosso"),Q(t)}catch{D("Errore aggiornamento equip","error")}}));const q=t.querySelector("[data-toggle-inspiration]");q&&s&&y&&q.addEventListener("click",async()=>{const d=s.data||{},p={...d,inspiration:!d.inspiration};await ne(s,p,"Ispirazione aggiornata",()=>Q(t))});const S=t.querySelector("[data-toggle-concentration]");S&&s&&y&&S.addEventListener("click",async()=>{const d=s.data||{},p={...d,concentration_active:!d.concentration_active};await ne(s,p,"Concentrazione aggiornata",()=>Q(t))}),t.querySelectorAll("[data-open-dice]").forEach(d=>d.addEventListener("click",()=>{na(d.dataset.openDice)})),t.querySelectorAll("[data-saving-throw-card]").forEach(d=>d.addEventListener("click",()=>{var T,B,H;if(!s)return;const p=d.dataset.savingThrowCard;if(!p)return;const v=ot(s),b=v.find(I=>I.value===p);b&&Ue({title:`Tiro salvezza • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:v,value:b.value},allowInspiration:!!((T=s==null?void 0:s.data)!=null&&T.inspiration)&&y,weakPoints:Number((H=(B=s==null?void 0:s.data)==null?void 0:B.hp)==null?void 0:H.weak_points)||0,characterId:s.id})})),t.querySelectorAll("[data-skill-card]").forEach(d=>d.addEventListener("click",()=>{var T,B,H;if(!s)return;const p=d.dataset.skillCard;if(!p)return;const v=ia(s,m||[]),b=v.find(I=>I.value===p);b&&Ue({title:`Tiro abilità • ${b.shortLabel||b.label}`,mode:"d20",rollType:"TA",selection:{label:"Abilità",options:v,value:b.value},allowInspiration:!!((T=s==null?void 0:s.data)!=null&&T.inspiration)&&y,weakPoints:Number((H=(B=s==null?void 0:s.data)==null?void 0:B.hp)==null?void 0:H.weak_points)||0,characterId:s.id})})),t.querySelectorAll("[data-edit-resource]").forEach(d=>d.addEventListener("click",()=>{const p=r.find(v=>v.id===d.dataset.editResource);p&&qt(s,()=>Q(t),p)})),t.querySelectorAll("[data-roll-damage]").forEach(d=>d.addEventListener("click",()=>{var T;if(!s)return;const p=d.dataset.rollDamage;if(!p)return;if(p.startsWith("spell:")){const B=p.replace("spell:",""),I=(Array.isArray((T=s.data)==null?void 0:T.spells)?s.data.spells:[]).find(G=>G.id===B);if(!I)return;const W=tt(I);if(!W){D("Danno non calcolabile per questo trucchetto.","error");return}we({keepOpen:!0,title:W.title,mode:"generic",notation:W.notation,modifier:W.modifier,rollType:"DMG",characterId:s==null?void 0:s.id,historyLabel:I.name||null});return}const v=m==null?void 0:m.find(B=>String(B.id)===p||B.name===p);if(!v)return;const b=qa(s,v);if(!b){D("Danno non calcolabile per questa arma.","error");return}we({keepOpen:!0,title:b.title,mode:"generic",notation:b.notation,modifier:b.modifier,rollType:"DMG",characterId:s==null?void 0:s.id,historyLabel:v.name||null})}));const P=d=>{var b;const p=(b=d==null?void 0:d.damage_dice_notation)==null?void 0:b.trim();if(!p)return;const v=Ta(p);if(!(v!=null&&v.notation)){D("Notazione dado non valida per questa risorsa","error");return}we({keepOpen:!0,title:d.name||"Tiro abilità",mode:"generic",notation:v.notation,modifier:Number(d.damage_modifier)||0,rollType:"GEN",characterId:s==null?void 0:s.id,historyLabel:d.name||null})},V=async d=>{const p=Number(d.max_uses)||0;if(!(!p||d.used>=p))try{await et(d.id,{used:Math.min(d.used+1,p)}),D("Risorsa usata"),zt(s)&&P(d),Q(t)}catch{D("Errore utilizzo risorsa","error")}};t.querySelectorAll("[data-resource-card]").forEach(d=>{const p=async v=>{if(v.target.closest("button"))return;const b=r.find(T=>T.id===d.dataset.resourceCard);b&&Li(b,{onUse:()=>V(b),onReset:async()=>{try{await et(b.id,{used:0}),D("Risorsa ripristinata"),Q(t)}catch{D("Errore ripristino risorsa","error")}}})};d.addEventListener("click",p)}),t.querySelectorAll("[data-use-resource]").forEach(d=>d.addEventListener("click",async()=>{const p=r.find(v=>v.id===d.dataset.useResource);p&&await V(p)})),t.querySelectorAll("[data-use-spell]").forEach(d=>d.addEventListener("click",async()=>{var W;if(!s)return;const p=d.dataset.useSpell;if(!p)return;const b=(Array.isArray((W=s.data)==null?void 0:W.spells)?s.data.spells:[]).find(G=>G.id===p);if(!b)return;const T=Number(b.level)||0;if(T<1||!await Yt(s,T,()=>Q(t)))return;const H=ce().characters.find(G=>ue(G.id)===ue(s.id))||s;if(b.concentration){const G=H.data||{};G.concentration_active||await ne(H,{...G,concentration_active:!0},"Concentrazione attiva",()=>Q(t))}if(!zt(H)){Q(t);return}const I=tt(b);if(!I){D("Danno non calcolabile per questo incantesimo.","error");return}we({keepOpen:!0,title:I.title,mode:"generic",notation:I.notation,modifier:I.modifier,rollType:"DMG",characterId:s.id,historyLabel:b.name||null})})),t.querySelectorAll("[data-restore-spell-slot]").forEach(d=>d.addEventListener("click",async()=>{if(!s)return;const p=Number(d.dataset.restoreSpellSlot);!Number.isFinite(p)||p<1||await _i(s,p,()=>Q(t))})),t.querySelectorAll("[data-delete-resource]").forEach(d=>d.addEventListener("click",async()=>{const p=r.find(b=>b.id===d.dataset.deleteResource);if(!(!p||!await at({title:"Conferma eliminazione risorsa",message:`Stai per eliminare la risorsa "${p.name}". Questa azione non può essere annullata.`,confirmLabel:"Elimina"})))try{await za(p.id),D("Risorsa eliminata"),Q(t)}catch{D("Errore eliminazione risorsa","error")}})),t.querySelectorAll("[data-death-save]").forEach(d=>d.addEventListener("click",async()=>{if(!s||!y)return;const{deathSave:p,deathSaveIndex:v}=d.dataset,b=Number(v);if(!p||!b)return;const T=s.data||{},B=T.death_saves||{},H=Math.max(0,Math.min(3,Number(B[p])||0)),I=b===H?H-1:b,W={successes:Math.max(0,Math.min(3,p==="successes"?I:Number(B.successes)||0)),failures:Math.max(0,Math.min(3,p==="failures"?I:Number(B.failures)||0))};await ne(s,{...T,death_saves:W},"Tiri salvezza contro morte aggiornati",()=>Q(t))})),t.querySelectorAll("[data-weakness-level]").forEach(d=>d.addEventListener("click",async()=>{if(!s||!y)return;const p=Number(d.dataset.weaknessLevel);if(!p)return;const v=s.data||{},b=v.hp||{},T=Math.max(0,Math.min(6,Number(b.weak_points)||0));await ne(s,{...v,hp:{...b,weak_points:p===T?0:p}},"Punti indebolimento aggiornati",()=>Q(t))}));const E=t.querySelector(".character-avatar");E&&(E.setAttribute("draggable","false"),E.addEventListener("click",d=>{d.preventDefault(),Ci(s)}),E.addEventListener("contextmenu",d=>{d.preventDefault()}),E.addEventListener("dragstart",d=>{d.preventDefault()})),t.querySelectorAll("[data-item-image]").forEach(d=>{d.setAttribute("draggable","false"),d.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation();const v=m==null?void 0:m.find(b=>String(b.id)===d.dataset.itemImage);v&&Ct(v)})}),t.querySelectorAll("[data-item-preview]").forEach(d=>{d.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation();const v=m==null?void 0:m.find(b=>String(b.id)===d.dataset.itemPreview);v&&Ct(v)})})}finally{Mt(!1)}}function Oi(){ta()}function ta(){Tt||(document.addEventListener("click",async t=>{if(!t.target.closest("[data-actions-fab]"))return;const e=t.target.closest("[data-hp-action]"),i=t.target.closest("[data-money-action]"),l=t.target.closest("[data-rest]"),o=t.target.closest("[data-open-dice]"),n=t.target.closest("[data-add-loot]"),u=t.target.closest("[data-edit-conditions]");if(!e&&!i&&!l&&!o&&!n&&!u)return;t.preventDefault(),Mi();const f=We??null;if(e){await Di(e.dataset.hpAction,f);return}if(i){if((window.location.hash.replace("#/","")||"home")==="inventory")return;await Ni(i.dataset.moneyAction,f);return}if(l){await Ii(l.dataset.rest,f);return}if(o){na(o.dataset.openDice);return}if(n){await xi();return}u&&await aa(f)}),Tt=!0)}function Mi(){const t=document.querySelector("[data-actions-fab]"),a=document.querySelector("[data-actions-toggle]");!t||!t.classList.contains("is-open")||(t.classList.remove("is-open"),a==null||a.setAttribute("aria-expanded","false"))}function Le(){const t=ce(),{user:a,offline:e,characters:i,activeCharacterId:l}=t,o=ue(l);return{activeCharacter:i.find(u=>ue(u.id)===o),canEditCharacter:!!a&&!e}}async function aa(t){const{activeCharacter:a,canEditCharacter:e}=Le();if(!a||!e)return;const i=await ki(a);if(!i)return;const l=i.getAll("conditions");await ne(a,{...a.data,conditions:l},"Condizioni aggiornate",()=>{t&&Q(t)})}async function xi(t){const{activeCharacter:a}=Le(),e=ce();if(!a)return;if(e.offline){D("Loot disponibile solo online.","error");return}jt(a);const i=await oe({title:"Aggiungi loot rapido",submitLabel:"Aggiungi",content:Qa(),onOpen:({fieldsEl:l})=>{Vt(l)}});if(i)try{await Va({user_id:a.user_id,character_id:a.id,name:i.get("name"),qty:Number(i.get("qty")),weight:Number(i.get("weight")),volume:Number(i.get("volume"))||0,value_cp:Number(i.get("value_cp")),category:"loot",equipable:!1,equip_slot:null,equip_slots:[],sovrapponibile:!1,is_magic:!1,max_volume:null}),D("Loot aggiunto")}catch{D("Errore loot","error")}}async function Ni(t,a){const{activeCharacter:e,canEditCharacter:i}=Le();if(!e)return;if(!i){D("Azioni denaro disponibili solo con profilo online","error");return}const l=ce();let o=l.cache.wallet;if(!o&&!l.offline)try{o=await Ha(e.id),De("wallet",o),o&&await ke({wallet:o})}catch{D("Errore caricamento wallet","error")}const f=await oe({title:t==="pay"?"Paga monete":"Ricevi monete",submitLabel:t==="pay"?"Paga":"Ricevi",content:Oa({direction:t}),onOpen:({fieldsEl:r})=>{Vt(r)}});if(!f)return;o||(o={user_id:e.user_id,character_id:e.id,cp:0,sp:0,gp:0,pp:0});const g=f.get("coin"),_=Number(f.get("amount")||0),s={cp:g==="cp"?_:0,sp:g==="sp"?_:0,gp:g==="gp"?_:0,pp:g==="pp"?_:0},x=t==="pay"?-1:1,L=Object.fromEntries(Object.entries(s).map(([r,m])=>[r,m*x])),y=ja(o,L);try{const r=await Wa({...y,user_id:o.user_id,character_id:o.character_id});await Ua({user_id:o.user_id,character_id:o.character_id,direction:t,amount:L,reason:f.get("reason"),occurred_on:f.get("occurred_on")}),De("wallet",r),await ke({wallet:r}),D("Wallet aggiornato"),a&&Q(a)}catch{D("Errore aggiornamento denaro","error")}}const Ri=it.reduce((t,a)=>(t[a.key]=a.label,t),{}),It={advantage:["invisibile"],disadvantage:["accecato","avvelenato","intralciato","prono","spaventato"]},Dt={disadvantage:{dex:["intralciato"]},autoFail:{str:["paralizzato","privo_di_sensi","stordito"],dex:["paralizzato","privo_di_sensi","stordito"]}};function st(t){const a=(t==null?void 0:t.data)||{};return Array.isArray(a.conditions)?a.conditions:a.condition?[a.condition]:[]}function Fe(t){return t.map(a=>Ri[a]||a).filter(Boolean)}function Ei(t){const a=It.advantage.filter(i=>t.includes(i)),e=It.disadvantage.filter(i=>t.includes(i));return a.length&&e.length?{rollMode:null,rollModeReason:null}:a.length?{rollMode:"advantage",rollModeReason:`Vantaggio: condizioni ${Fe(a).join(", ")}.`}:e.length?{rollMode:"disadvantage",rollModeReason:`Svantaggio: condizioni ${Fe(e).join(", ")}.`}:{rollMode:null,rollModeReason:null}}function qi(t,a){const i=(Dt.autoFail[a]||[]).filter(n=>t.includes(n));if(i.length)return{disabled:!0,disabledReason:`Condizioni: ${Fe(i).join(", ")}`};const o=(Dt.disadvantage[a]||[]).filter(n=>t.includes(n));return o.length?{rollMode:"disadvantage",rollModeReason:`Svantaggio: condizioni ${Fe(o).join(", ")}.`}:{}}function ia(t,a=[]){const e=t.data||{},i=e.abilities||{},l=ie(e.proficiency_bonus),o=e.skills||{},n=e.skill_mastery||{},f=st(t).includes("avvelenato")?["avvelenato"]:[],g=(a||[]).some(_=>_.category==="armor"&&_.armor_type==="heavy"&&_.equipable&&ve(_).length);return Ft.map(_=>{const s=!!o[_.key],x=!!n[_.key],L=Ve(i[_.ability],l,s?x?2:1:0),y=L??0,r=_.key==="stealth"&&g,m=[];return f.length&&m.push(`Svantaggio: condizioni ${Fe(f).join(", ")}.`),r&&m.push("Svantaggio automatico: armatura pesante su Furtività."),{value:_.key,label:`${_.label} (${te(L)})`,shortLabel:_.label,modifier:y,rollMode:m.length?"disadvantage":null,rollModeReason:m.length?m.join(" "):null}})}function ot(t){const a=t.data||{},e=a.abilities||{},i=ie(a.proficiency_bonus),l=a.saving_throws||{},o=st(t);return Bt.map(n=>{const u=!!l[n.key],f=Ve(e[n.key],i,u?1:0),g=f??0,_=qi(o,n.key),s=_.disabled?" · fallimento diretto":"";return{value:n.key,label:`${n.label} (${te(f)})${s}`,shortLabel:re[n.key]||n.label,modifier:g,rollMode:_.rollMode||null,rollModeReason:_.rollModeReason||null,disabled:_.disabled||!1,disabledReason:_.disabledReason||null}})}function Ti(t,a=[]){var A;const e=t.data||{},i=Number(e.attack_bonus_melee??e.attack_bonus)||0,l=Number(e.attack_bonus_ranged??e.attack_bonus)||0,o=(a||[]).filter(C=>C.category==="weapon"&&C.equipable&&ve(C).length),n=ie(e.proficiency_bonus)??0,u=e.proficiencies||{},f=st(t),g=Ei(f),_=o.map(C=>{var P;const z=C.weapon_range||(C.range_normal?"ranged":"melee"),h=C.attack_ability||(z==="ranged"?"dex":"str"),j=fe((P=e.abilities)==null?void 0:P[h])??0,F=(C.weapon_type==="simple"?!!u.weapon_simple:C.weapon_type==="martial"?!!u.weapon_martial:!1)?n:0,q=z==="ranged"?l:i,S=j+F+(Number(C.attack_modifier)||0)+q;return{value:`weapon:${C.id??C.name}`,label:`${C.name} (${te(S)})`,shortLabel:C.name,modifier:S,rollMode:g.rollMode,rollModeReason:g.rollModeReason}}),x=(e.spellcasting||{}).ability,L=x?(A=e.abilities)==null?void 0:A[x]:null,y=fe(L),r=y===null||n===null?null:y+n,R=(Array.isArray(e.spells)?e.spells:[]).filter(C=>(C.kind==="cantrip"||Number(C.level)===0)&&C.attack_roll&&C.damage_die);return x&&r!==null&&R.forEach(C=>{_.push({value:`spell:${C.id}`,label:`${C.name} (${te(r)})`,shortLabel:C.name,modifier:r,rollMode:g.rollMode,rollModeReason:g.rollModeReason})}),_}function zi(t){var f;const a=t.data||{},e=ie(a.proficiency_bonus),l=(a.spellcasting||{}).ability,o=l?(f=a.abilities)==null?void 0:f[l]:null,n=fe(o);if(!l||n===null||e===null)return[];const u=n+e;return[{value:"spell-attack",label:`Incantesimi (${te(u)})`,shortLabel:"Incantesimi",modifier:u}]}function na(t){var g,_,s,x,L;const{activeCharacter:a,canEditCharacter:e}=Le(),i=ce().cache.items||[],l=!!((g=a==null?void 0:a.data)!=null&&g.inspiration)&&e,o=Number((s=(_=a==null?void 0:a.data)==null?void 0:_.hp)==null?void 0:s.weak_points)||0,n=l&&a?async()=>{const y=a.data||{};y.inspiration&&await ne(a,{...y,inspiration:!1},"Ispirazione consumata",We?()=>Q(We):null)}:null,f={"saving-throws":{title:"Tiro Salvezza",mode:"d20",rollType:"TS",selection:a?{label:"Tiro salvezza",options:ot(a)}:null},skills:{title:"Tiro Abilità",mode:"d20",rollType:"TA",selection:a?{label:"Abilità",options:ia(a,i)}:null},"attack-roll":{title:"Tiro per Colpire",mode:"d20",rollType:"TC",selection:a?{label:"Attacco",options:Ti(a,i)}:null},"spell-attack":{title:"Tiro per Colpire Incantesimi",mode:"d20",rollType:"TC",selection:a?{label:"Incantesimi",options:zi(a)}:null},roller:{title:"Lancia Dadi generico",mode:"generic",rollType:"GEN"}}[t]??{title:"Lancia dadi",mode:"generic"};if(t==="spell-attack"&&!((L=(x=f.selection)==null?void 0:x.options)!=null&&L.length)){D("Configura abilità da incantatore e bonus competenza per usare questo tiro.","error");return}Ue({...f,allowInspiration:l,onConsumeInspiration:n,weakPoints:o,characterId:a==null?void 0:a.id})}async function Ii(t,a){var l,o;const{activeCharacter:e}=Le();if(!(!e||!await at({title:"Conferma riposo",message:t==="long_rest"?"Stai per effettuare un riposo lungo: risorse, slot e recuperi verranno aggiornati in base alle regole configurate.":"Stai per effettuare un riposo breve: verranno aggiornate solo le risorse che si recuperano con questo tipo di riposo.",confirmLabel:"Conferma riposo"})))try{await Na(e.id,t),D(t==="long_rest"?"Riposo lungo completato":"Riposo breve completato");const u=await Ot(e.id);De("resources",u),await ke({resources:u});const f=Ra(e.data,t);if(f?await ne(e,f,null,a?()=>Q(a):null):a&&Q(a),t==="long_rest"){const g=ce().characters.find(_=>_.id===e.id);(o=(l=g==null?void 0:g.data)==null?void 0:l.spellcasting)!=null&&o.can_prepare&&await ea(g,a?()=>Q(a):null)}}catch{D("Errore aggiornamento risorse","error")}}async function Di(t,a){var E,d,p,v,b,T,B,H,I,W;const{activeCharacter:e,canEditCharacter:i}=Le();if(!e)return;if(!i){D("Azioni HP disponibili solo con profilo online","error");return}const n=await oe({title:t==="heal"?"Cura PF":"Subisci danno",submitLabel:t==="heal"?"Cura":"Danno",content:Bi(e,{allowHitDice:t==="heal",allowTempHp:t==="heal",allowMaxOverride:t==="damage"})});if(!n)return;const u=n.has("use_hit_dice"),f=n.has("temp_hp"),g=((E=e.data)==null?void 0:E.hit_dice)||{},_=((d=e.data)==null?void 0:d.abilities)||{},s=Number(g.used)||0,x=Number(g.max)||0,L=Ht(g.die),y=Math.max(Number(n.get("hit_dice_count"))||1,1);let r=Number(n.get("amount"));if(t==="heal"&&u){if(!L){D("Configura un dado vita valido","error");return}if(s>=x){D("Nessun dado vita disponibile","error");return}const G=Math.max(x-s,0);if(y>G){D(`Hai solo ${G} dadi vita disponibili`,"error");return}const w=fe(_.con)??0,O=Array.from({length:y},()=>xa(L)).reduce((Y,Z)=>Y+Z,0);r=Math.max(O+w*y,1)}if(!r||r<=0){D("Inserisci un valore valido","error");return}const m=Number((v=(p=e.data)==null?void 0:p.hp)==null?void 0:v.current)||0,R=Number((T=(b=e.data)==null?void 0:b.hp)==null?void 0:T.temp)||0,A=(H=(B=e.data)==null?void 0:B.hp)==null?void 0:H.max,C=n.get("hp_max_override"),z=C===null||C===""?null:Number(C);if(t==="damage"&&z!==null&&(!Number.isFinite(z)||z<=0)){D("Inserisci un massimo PF valido","error");return}let h=m,j=R;if(t==="heal"&&f)j=R+r;else if(t==="heal")h=m+r;else{const G=Math.min(R,r);j=R-G;const w=r-G;h=Math.max(m-w,0)}const $=z??A,F=$!=null?Math.min(h,Number($)):h,q=t==="heal"&&u?{...g,used:Math.min(s+y,x)}:g,S=t==="heal"?`${f?"HP temporanei +":"PF curati +"}${r}${u?` (${y}d${L})`:""}`:`Danno ${r}`,P=t==="damage"&&Number(r)>0&&!!((I=e.data)!=null&&I.concentration_active),V=async()=>{var J,O,Y;if(a&&Q(a),!P)return;const G=ot(e),w=G.find(Z=>Z.value==="con");!w||w.disabled||Ue({title:"Tiro salvezza concentrazione • COS",mode:"d20",rollType:"TS",selection:{label:"Tiro salvezza",options:G,value:w.value},allowInspiration:!!((J=e==null?void 0:e.data)!=null&&J.inspiration)&&i,weakPoints:Number((Y=(O=e==null?void 0:e.data)==null?void 0:O.hp)==null?void 0:Y.weak_points)||0,characterId:e.id,historyLabel:"TS concentrazione"})};await ne(e,{...e.data,hp:{...(W=e.data)==null?void 0:W.hp,current:F,temp:j,max:z??A},hit_dice:q},S,V)}function Ue({title:t,mode:a,selection:e=null,allowInspiration:i=!1,onConsumeInspiration:l=null,rollType:o=null,weakPoints:n=0,characterId:u=null,historyLabel:f=null}){we({keepOpen:!0,title:t,mode:a,selection:e,allowInspiration:i,onConsumeInspiration:l,rollType:o,weakPoints:n,characterId:u,historyLabel:f})}function Bi(t,{allowHitDice:a=!0,allowTempHp:e=!1,allowMaxOverride:i=!1}={}){var j;const l=($,F={})=>{const q=$==null?void 0:$.querySelector('input[type="number"]');q&&Ie(q,F)},o=document.createElement("div");o.className="modal-form-grid hp-shortcut-fields";const n=ae({label:"Valore",name:"amount",type:"number",value:"1"});n.classList.add("hp-shortcut-fields__amount"),l(n,{decrementLabel:"Riduci valore PF",incrementLabel:"Aumenta valore PF"});const u=n.querySelector("input");u&&(u.min="1",u.required=!0);const f=document.createElement("div");if(f.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",f.appendChild(n),e){const $=document.createElement("div");$.className="modal-toggle-field",$.innerHTML=`
      <span class="modal-toggle-field__label">HP temporanei</span>
      <label class="diceov-toggle condition-modal__toggle">
        <input type="checkbox" name="temp_hp" />
        <span class="diceov-toggle-track" aria-hidden="true"></span>
      </label>
    `,f.appendChild($)}if(o.appendChild(f),!a){if(i){const $=ae({label:"Nuovo massimo PF",name:"hp_max_override",type:"number",value:""});$.classList.add("hp-shortcut-fields__max"),l($,{decrementLabel:"Riduci PF massimi",incrementLabel:"Aumenta PF massimi"});const F=$.querySelector("input");F&&(F.min="1"),f.appendChild($)}return o}const g=((j=t==null?void 0:t.data)==null?void 0:j.hit_dice)||{},_=Number(g.used)||0,s=Number(g.max)||0,x=Math.max(s-_,0),L=Ht(g.die),y=x>0&&L,r=document.createElement("div");r.className="modal-toggle-field";const m=g.die?`${g.die}`:"dado vita";r.innerHTML=`
    <span class="modal-toggle-field__label">Usa dado vita (${m}) · rimasti ${x}/${s||"-"}</span>
    <label class="diceov-toggle condition-modal__toggle">
      <input type="checkbox" name="use_hit_dice" ${y?"":"disabled"} />
      <span class="diceov-toggle-track" aria-hidden="true"></span>
    </label>
  `;const R=document.createElement("label");R.className="field hit-dice-count hp-shortcut-fields__count",R.innerHTML=`
    <span>Numero dadi vita</span>
    <input type="number" name="hit_dice_count" min="1" max="${x}" value="1" />
  `,l(R,{decrementLabel:"Riduci dadi vita",incrementLabel:"Aumenta dadi vita"});const A=document.createElement("div");if(A.className="modal-form-row modal-form-row--balanced hp-shortcut-fields__row",A.append(r,R),o.appendChild(A),!y){const $=document.createElement("p");$.className="muted",$.textContent="Nessun dado vita disponibile o configurato.",o.appendChild($)}const C=r.querySelector("input"),z=R.querySelector("input");z&&(z.required=!1);const h=()=>{const $=C==null?void 0:C.checked;u&&(u.disabled=!!$,u.required=!$,$?u.value="":u.value||(u.value="1"),z&&(z.disabled=!$,z.required=!!$,$||(z.value="1")))};return C==null||C.addEventListener("change",h),h(),o}export{Oi as bindGlobalFabHandlers,Q as renderHome};
