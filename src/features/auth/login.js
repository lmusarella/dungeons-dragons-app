import { supabase } from '../../lib/supabase.js';
import { createToast } from '../../ui/components.js';
import { ensureProfile } from '../../app/session.js';
import { setState } from '../../app/state.js';

export function renderLogin(container) {
  const baseUrl = import.meta.env.BASE_URL;

  container.innerHTML = `
    <section class="login-view auth-screen">
      <div class="login-experience">
        <aside class="login-story" aria-label="Gestionale schede personaggi">
          <div class="login-story__brand">
            <span class="login-story__mark" aria-hidden="true">D20</span>
            <span>Compendio dell’avventuriero</span>
          </div>
          <div class="login-story__copy">
            <p class="login-story__eyebrow">La tua campagna, sempre pronta</p>
            <h1>Ogni tiro.<br />Ogni scelta.<br /><em>Un’unica scheda.</em></h1>
            <p>Accedi al personaggio, ritrova le risorse e torna subito al tavolo.</p>
            <div class="login-story__features" aria-label="Funzionalità principali">
              <span>Sessione rapida</span><span>Tablet friendly</span><span>Dati sincronizzati</span>
            </div>
          </div>
          <p class="login-story__footer">Pensato per lasciare più spazio al gioco.</p>
        </aside>
        <div class="login-panel">
          <div class="card login-card login-card--refined">
            <div class="login-header">
              <img class="login-logo" src="${baseUrl}icons/logo_dd.png" alt="Dungeon & Dragon" />
              <div>
                <p class="eyebrow">Bentornato</p>
                <p class="login-title">Accedi alla campagna</p>
              </div>
            </div>
            <p class="login-subtitle">Inserisci le credenziali oppure crea un nuovo profilo.</p>
            <form class="login-form" data-login-form>
              <label class="field">
                <span>Email</span>
                <input type="email" name="email" required autocomplete="email" placeholder="nome@email.it" />
              </label>
              <label class="field">
                <span>Password</span>
                <input type="password" name="password" required minlength="6" autocomplete="current-password" placeholder="Almeno 6 caratteri" />
              </label>
              <div class="login-form__toggle-row">
                <span><strong>Nuovo account</strong><small>Attiva per registrarti</small></span>
                <label class="diceov-toggle condition-modal__toggle" aria-label="Nuovo account">
                  <input type="checkbox" name="signup" />
                  <span class="diceov-toggle-track" aria-hidden="true"></span>
                </label>
              </div>
              <div class="login-form__actions">
                <button class="primary" type="submit" data-login-submit>Accedi</button>
              </div>
            </form>
            <div class="login-security-note"><span aria-hidden="true">✓</span><span>I dati del personaggio restano associati al tuo profilo.</span></div>
          </div>
        </div>
      </div>
    </section>
  `;

  const form = container.querySelector('[data-login-form]');
  const signupInput = form.querySelector('input[name="signup"]');
  const submitButton = form.querySelector('[data-login-submit]');
  const syncSubmitLabel = () => {
    if (!submitButton || !signupInput) return;
    submitButton.textContent = signupInput.checked ? 'Registrati' : 'Accedi';
  };
  signupInput?.addEventListener('change', syncSubmitLabel);
  syncSubmitLabel();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    const signup = formData.get('signup') === 'on';

    const showDuplicateAccountToast = () => {
      createToast('Esiste già un account con questa email. Prova ad accedere.', 'error');
    };
    const showConfirmEmailToast = () => {
      createToast("Registrazione completata. Conferma l'email prima di procedere con il login.", 'success');
    };

    try {
      const response = signup
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (response.error) {
        throw response.error;
      }

      if (signup) {
        const identities = response.data.user?.identities;
        if (Array.isArray(identities) && identities.length === 0) {
          showDuplicateAccountToast();
          return;
        }

        showConfirmEmailToast();
        form.reset();
        syncSubmitLabel();
        return;
      }

      const user = response.data.user;
      if (user) {
        setState({ user });
        await ensureProfile(user);
        window.location.hash = '#/characters';
      }
    } catch (error) {
      const message = String(error?.message || '');
      if (signup && /already\s+(registered|exists|in use)|user\s+already/i.test(message)) {
        showDuplicateAccountToast();
        return;
      }
      createToast(error.message ?? 'Errore login', 'error');
    }
  });
}
