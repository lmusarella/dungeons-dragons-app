import{g as S,n as h,k as I,f as k,c as _}from"./index-DtIC5mHn.js";async function D(t){var c,r,l,d,g,p;const{characters:o,activeCharacterId:b}=S(),f=h(b),a=o.find(i=>h(i.id)===f);if(!a){t.innerHTML='<section class="settings-view"><div class="card settings-shell"><p>Nessun personaggio selezionato.</p></div></section>';return}const s={encumbrance:((r=(c=a.data)==null?void 0:c.settings)==null?void 0:r.encumbrance)??"standard",weight_unit:((d=(l=a.data)==null?void 0:l.settings)==null?void 0:d.weight_unit)??"lb",auto_usage_dice:((p=(g=a.data)==null?void 0:g.settings)==null?void 0:p.auto_usage_dice)??!0};t.innerHTML=`
    <section class="settings-view">
      <div class="card settings-shell">
        <header class="settings-hero">
          <div>
            <span class="settings-hero__eyebrow">Preferenze personaggio</span>
            <h2>Impostazioni</h2>
            <p class="muted">Configura peso, ingombro e automazioni rapide per ${a.name||"il personaggio"}.</p>
          </div>
          <span class="settings-hero__badge">${a.name||"Personaggio attivo"}</span>
        </header>
        <form class="settings-form" data-settings-form>
          <section class="settings-panel">
            <div class="settings-panel__copy">
              <h3>Inventario</h3>
              <p class="muted">Scegli come calcolare e mostrare carico e pesi.</p>
            </div>
            <div class="settings-control-grid">
              <label class="field settings-control-card">
                <span>Modalità ingombro</span>
                <select name="encumbrance">
                  <option value="standard">Standard</option>
                  <option value="variant">Variant</option>
                </select>
              </label>
              <label class="field settings-control-card">
                <span>Mostra peso in</span>
                <select name="weight_unit">
                  <option value="lb">Lb</option>
                  <option value="kg">Kg</option>
                </select>
              </label>
            </div>
          </section>
          <section class="settings-panel settings-panel--inline">
            <div class="settings-panel__copy">
              <h3>Automazioni</h3>
              <p class="muted">Lancia automaticamente i dadi quando usi abilità, risorse o incantesimi.</p>
            </div>
            <label class="settings-toggle-card">
              <span>
                <strong>Tiro dadi automatico</strong>
                <small>Usa dadi automatici su azioni rapide</small>
              </span>
              <span class="diceov-toggle">
                <input type="checkbox" name="auto_usage_dice" />
                <span class="diceov-toggle-track" aria-hidden="true"></span>
              </span>
            </label>
          </section>
          <div class="settings-actions">
            <button class="primary" type="submit">Salva impostazioni</button>
          </div>
        </form>
      </div>
    </section>
  `;const e=t.querySelector("[data-settings-form]");e.encumbrance.value=s.encumbrance,e.weight_unit.value=s.weight_unit,e.auto_usage_dice.checked=s.auto_usage_dice,e.addEventListener("submit",async i=>{i.preventDefault();const n=new FormData(e),w={encumbrance:n.get("encumbrance"),weight_unit:n.get("weight_unit"),auto_usage_dice:n.has("auto_usage_dice")};try{const u={...a.data,settings:w},{data:z,error:m}=await I.from("characters").update({data:u}).eq("id",a.id).select("*").single();if(m)throw m;const y=o.map(v=>v.id===a.id?z:v);k({characters:y}),_("Impostazioni salvate")}catch{_("Errore salvataggio impostazioni","error")}})}export{D as renderSettings};
