import{l as f,s as w,m as y,b as r}from"./index-BS7JkFzs.js";function S(l){const b="/dungeons-dragons-app/";l.innerHTML=`
    <section class="login-view auth-screen">
      <div class="card login-card">
        <div class="login-header">
          <img class="login-logo" src="${b}icons/logo_dd.png" alt="Dungeon & Dragon" />
          <div>
            <p class="eyebrow">Dungeons &amp; Dragons</p>
            <p class="login-title">Gestionale Personaggi</p>
          </div>
        </div>
        <p class="login-subtitle">Usa email e password per entrare o creare l'account.</p>
        <form class="login-form" data-login-form>
          <label class="field">
            <span >Email</span>
            <input type="email" name="email" required placeholder="nome@email.it" />
          </label>
          <label class="field">
            <span>Password</span>
            <input type="password" name="password" required minlength="6" />
          </label>
          <div class="login-form__toggle-row">
            <span>Nuovo account</span>
            <label class="diceov-toggle condition-modal__toggle" aria-label="Nuovo account">
              <input type="checkbox" name="signup" />
              <span class="diceov-toggle-track" aria-hidden="true"></span>
            </label>
          </div>
          <div class="login-form__actions">
            <button class="primary" type="submit" data-login-submit>Accedi</button>
          </div>
        </form>
      </div>
    </section>
  `;const a=l.querySelector("[data-login-form]"),s=a.querySelector('input[name="signup"]'),c=a.querySelector("[data-login-submit]"),o=()=>{!c||!s||(c.textContent=s.checked?"Registrati":"Accedi")};s==null||s.addEventListener("change",o),o(),a.addEventListener("submit",async h=>{var m;h.preventDefault();const n=new FormData(a),d=String(n.get("email")),g=String(n.get("password")),i=n.get("signup")==="on",u=()=>{r("Esiste già un account con questa email. Prova ad accedere.","error")},v=()=>{r("Registrazione completata. Conferma l'email prima di procedere con il login.","success")};try{const e=i?await f.auth.signUp({email:d,password:g}):await f.auth.signInWithPassword({email:d,password:g});if(e.error)throw e.error;if(i){const p=(m=e.data.user)==null?void 0:m.identities;if(Array.isArray(p)&&p.length===0){u();return}v(),a.reset(),o();return}const t=e.data.user;t&&(w({user:t}),await y(t),window.location.hash="#/characters")}catch(e){const t=String((e==null?void 0:e.message)||"");if(i&&/already\s+(registered|exists|in use)|user\s+already/i.test(t)){u();return}r(e.message??"Errore login","error")}})}export{S as renderLogin};
