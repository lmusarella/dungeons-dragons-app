-- Backfill della notazione base per gli incantesimi curativi.
-- Il JSON sorgente non valorizza damageDice per le cure: il dado viene ricavato dalla descrizione base.
-- Record aggiornabili: 18.

begin;

with inferred_base_dice (source_key, rules_version, damage_die) as (
  values
    ('aura-of-vitality', '2014', '2d6'),
    ('cure-wounds', '2014', '1d8'),
    ('healing-spirit', '2014', '1d6'),
    ('healing-word', '2014', '1d4'),
    ('mass-cure-wounds', '2014', '3d8'),
    ('mass-healing-word', '2014', '1d4'),
    ('prayer-of-healing', '2014', '2d8'),
    ('regenerate', '2014', '4d8'),
    ('soul-cage', '2014', '2d8'),
    ('alustriel''s-mooncloak', '2024', '4d10'),
    ('aura-of-vitality', '2024', '2d6'),
    ('cure-wounds', '2024', '2d8'),
    ('healing-word', '2024', '2d4'),
    ('mass-cure-wounds', '2024', '5d8'),
    ('mass-healing-word', '2024', '2d4'),
    ('prayer-of-healing', '2024', '2d8'),
    ('regenerate', '2024', '4d8'),
    ('spirit-lantern', '2024', '4d8')
)
update public.shared_spells as spell
set damage_die = inferred.damage_die,
    updated_at = now()
from inferred_base_dice as inferred
where spell.source_key = inferred.source_key
  and spell.rules_version = inferred.rules_version
  and spell.damage_die is distinct from inferred.damage_die;

commit;
