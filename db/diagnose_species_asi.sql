-- Diagnosi di sola lettura degli incrementi di caratteristica delle specie 2014.
-- Funziona sia con la colonna `species_data` sia con `data`.
with s as (
  select id, slug, name, source, rules_version,
         coalesce(to_jsonb(sp)->'species_data', to_jsonb(sp)->'data', '{}'::jsonb) as raw
  from public.shared_species sp
  where rules_version = '2014'
), d as (
  select *, coalesce(raw->'5etools', raw) as rules from s
)
select slug, name, source,
  case
    when jsonb_typeof(rules->'ability') = 'array' and jsonb_array_length(rules->'ability') > 0 then 'ability presente'
    when rules ? '_copy' then '_copy senza ability (da risolvere sull''originale)'
    when upper(coalesce(rules->>'source', source)) in ('MPMM','AAG','FTD','VRGR','WBTW','DSOTDQ','SCC') then 'flessibile per fonte'
    when exists (select 1 from public.shared_species_variants v where v.shared_species_id = d.id) then 'incrementi nelle varianti?'
    else 'MANCANTE'
  end as stato,
  rules->'ability' as ability, rules->'_copy' as copy_ref
from d
order by stato, source, name;

-- Varianti con incrementi (es. Shifter):
select sp.slug as specie, v.slug as variante,
       coalesce(to_jsonb(v)->'variant_data', to_jsonb(v)->'data')->'5etools'->'ability' as ability
from public.shared_species_variants v join public.shared_species sp on sp.id = v.shared_species_id
where v.rules_version = '2014'
order by sp.slug, v.slug;

-- Proposta correttiva (NON eseguita): solo dopo aver controllato l'output sopra, copiare in `species_data['5etools'].ability`
-- gli incrementi mancanti dall'export 5etools, ad esempio:
--   update public.shared_species set species_data = jsonb_set(species_data, '{5etools,ability}', '[{"dex":2,"wis":1}]'::jsonb)
--   where slug = 'aarakocra-eepc' and rules_version = '2014';
-- Non tocca la tabella dei personaggi: i personaggi esistenti conservano i punteggi gia' salvati.
