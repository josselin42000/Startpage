-- Exécuter dans l'éditeur SQL Supabase

create table if not exists tiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text default '#',
  icon text default '🔗',
  color text default '#CC0000',
  cat text default '',
  logo text default '',  -- base64 ou URL
  position integer default 0,
  created_at timestamptz default now()
);

-- RLS : table publique en lecture/écriture (usage personnel, pas d'auth)
alter table tiles enable row level security;

create policy "allow all" on tiles
  for all using (true) with check (true);

-- Données initiales
insert into tiles (name, url, icon, color, cat, position) values
  ('LinearCRM', 'https://linearcrm.l-h.fr', '💼', '#CC0000', 'Groupe Linear', 1),
  ('Linear Desk', '#', '🏗️', '#374151', 'Groupe Linear', 2),
  ('Audio-Technique', 'https://audio-technique.com', '🔊', '#CC0000', 'Groupe Linear', 3),
  ('SL Technologie', 'https://sltechnologie.fr', '📡', '#1a6fc4', 'Groupe Linear', 4),
  ('Linear Tech', 'https://lineartech.fr', '🔌', '#374151', 'Groupe Linear', 5),
  ('lestudio23', '#', '🎙️', '#1a6fc4', 'Verts Podcast', 6),
  ('Verts Podcast', 'https://verts-podcast.fr', '🎬', '#1a8f5c', 'Verts Podcast', 7),
  ('TousVerts', 'https://tousverts.fr', '🌱', '#1a8f5c', 'Verts Podcast', 8),
  ('E-PhotoBooth', 'https://ephotobooth.fr', '📷', '#9b3ccf', 'SaaS', 9),
  ('HubCommerce', '#', '🏢', '#d97316', 'SaaS', 10),
  ('BonnetteMicro', 'https://bonnettemicro.fr', '🎤', '#CC0000', 'SaaS', 11),
  ('La Borne Mobile', 'https://labornemobile.fr', '🚗', '#1a8f5c', 'SaaS', 12);
