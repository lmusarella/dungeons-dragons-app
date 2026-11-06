-- Permette a un contenitore di non far pesare il proprio contenuto sul carico,
-- mantenendo comunque disponibile il peso totale reale del contenitore.
alter table public.items
  add column if not exists ignore_contents_weight boolean not null default false;

comment on column public.items.ignore_contents_weight is 'Se true, il contenuto del contenitore non contribuisce al carico trasportato.';

notify pgrst, 'reload schema';
select pg_notify('pgrst', 'reload schema');
