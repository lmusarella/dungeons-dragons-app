-- Adds D&D 2024 weapon mastery support to inventory items.
alter table public.items
  add column if not exists weapon_mastery text;

comment on column public.items.weapon_mastery is 'D&D 2024 mastery property assigned to this weapon: cleave, graze, nick, push, sap, slow, topple, vex.';
