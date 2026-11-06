-- Políticas de seguridad (RLS) para la app de mangas.
-- Lectura pública; escritura SOLO para usuarios autenticados (Supabase Auth).
--
-- Antes de ejecutar esto:
--   1. Authentication → Providers: dejá habilitado "Email".
--   2. Authentication → Settings: desactivá "Allow new users to sign up" (así nadie más puede registrarse).
--   3. Authentication → Users → "Add user": creá tu usuario (email + contraseña).
--
-- Ejecutalo en el SQL Editor. Es seguro correrlo más de una vez.

alter table manga_files enable row level security;
alter table manga_changelog enable row level security;

-- Se eliminan las políticas públicas anteriores (las de la versión con contraseña en el cliente).
drop policy if exists "Lectura pública manga_files" on manga_files;
drop policy if exists "Inserción pública manga_files" on manga_files;
drop policy if exists "Update público manga_files" on manga_files;
drop policy if exists "Lectura pública changelog" on manga_changelog;
drop policy if exists "Inserción pública changelog" on manga_changelog;

-- manga_files
create policy "files: lectura pública"
  on manga_files for select using (true);
create policy "files: insertar autenticado"
  on manga_files for insert to authenticated with check (true);
create policy "files: actualizar autenticado"
  on manga_files for update to authenticated using (true) with check (true);
create policy "files: borrar autenticado"
  on manga_files for delete to authenticated using (true);

-- manga_changelog
create policy "changelog: lectura pública"
  on manga_changelog for select using (true);
create policy "changelog: insertar autenticado"
  on manga_changelog for insert to authenticated with check (true);

-- Storage (bucket "manga-files"): descarga pública con la anon key, subida/borrado solo autenticado.
drop policy if exists "Allow public uploads" on storage.objects;
drop policy if exists "Allow public downloads" on storage.objects;

create policy "manga-files: lectura pública"
  on storage.objects for select using (bucket_id = 'manga-files');
create policy "manga-files: subida autenticada"
  on storage.objects for insert to authenticated with check (bucket_id = 'manga-files');
create policy "manga-files: borrado autenticado"
  on storage.objects for delete to authenticated using (bucket_id = 'manga-files');
