begin;

alter table public.items
  alter column range_normal type double precision
    using nullif(range_normal::text, '')::double precision,
  alter column range_disadvantage type double precision
    using nullif(range_disadvantage::text, '')::double precision;

commit;
