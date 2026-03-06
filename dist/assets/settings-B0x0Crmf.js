import{g as z,n as _,l as I,s as k,b as h}from"./index-BS7JkFzs.js";async function L(e){var c,r,d,u,l,g;const{characters:o,activeCharacterId:v}=z(),f=_(v),a=o.find(n=>_(n.id)===f);if(!a){e.innerHTML='<section class="card"><p>Nessun personaggio selezionato.</p></section>';return}const s={encumbrance:((r=(c=a.data)==null?void 0:c.settings)==null?void 0:r.encumbrance)??"standard",weight_unit:((u=(d=a.data)==null?void 0:d.settings)==null?void 0:u.weight_unit)??"lb",auto_usage_dice:((g=(l=a.data)==null?void 0:l.settings)==null?void 0:g.auto_usage_dice)??!0};e.innerHTML=`
    <section class="card">
      <h2>Impostazioni</h2>
      <form data-settings-form>
        <label class="field">
          <span>Modalità ingombro</span>
          <select name="encumbrance">
            <option value="standard">Standard</option>
            <option value="variant">Variant</option>
          </select>
        </label>
        <label class="field">
          <span>Mostra peso in</span>
          <select name="weight_unit">
            <option value="lb">Lb</option>
            <option value="kg">Kg</option>
          </select>
        </label>
        <label class="field">
          <span>Tira dadi automatico su Usa (abilità/risorse/incantesimi)</span>
          <span class="diceov-toggle">
            <input type="checkbox" name="auto_usage_dice" />
            <span class="diceov-toggle-track" aria-hidden="true"></span>
          </span>
        </label>
        <button class="primary" type="submit">Salva</button>
      </form>
    </section>
  `;const t=e.querySelector("[data-settings-form]");t.encumbrance.value=s.encumbrance,t.weight_unit.value=s.weight_unit,t.auto_usage_dice.checked=s.auto_usage_dice,t.addEventListener("submit",async n=>{n.preventDefault();const i=new FormData(t),w={encumbrance:i.get("encumbrance"),weight_unit:i.get("weight_unit"),auto_usage_dice:i.has("auto_usage_dice")};try{const p={...a.data,settings:w},{data:y,error:m}=await I.from("characters").update({data:p}).eq("id",a.id).select("*").single();if(m)throw m;const S=o.map(b=>b.id===a.id?y:b);k({characters:S}),h("Impostazioni salvate")}catch{h("Errore salvataggio impostazioni","error")}})}export{L as renderSettings};
