# Colección de Mangas

React + TypeScript + Vite + Supabase.

---

## Cómo funciona

La app siempre muestra el catálogo de la **última versión activa** subida a Supabase. Cuando subís un Excel/CSV nuevo:

1. Le ponés un nombre a esa versión (ej: `mangas_junio_2026`, `mangas_abril_2025`) y la fecha real en que actualizaste el catálogo (no necesariamente la fecha en que lo subís a la app — por ejemplo, si actualizaste el Excel el 10/6 pero lo subís el 16/6, podés poner 10/6 para que el historial quede prolijo).
2. El archivo se guarda en Supabase Storage y queda registrado como la versión **activa**; la anterior pasa a quedar archivada (pero no se borra, sigue disponible para descargar o comparar).
3. Antes de guardar, el sistema descarga en memoria el catálogo anterior y lo compara contra el nuevo, serie por serie. De esa comparación se generan automáticamente entradas en el **historial de cambios**, detectando:
   - Series nuevas agregadas
   - Series eliminadas del catálogo
   - Aumentos de precio (agrupados y con porcentaje promedio por editorial)
   - Bajas de precio
   - Series que pasaron de "En publicación" a "Finalizado"
   - Series que volvieron a publicarse después de estar finalizadas
   - Cambios en la cantidad total de tomos, si no hubo otro cambio más relevante

No hace falta escribir nada a mano: con solo subir el Excel, el changelog se completa solo.

### El historial de cambios tiene dos pestañas

**Cambios detectados** — la lista de todo lo que el sistema fue encontrando automáticamente cada vez que subiste una versión nueva. Cada entrada muestra el tipo de cambio (aumento, serie nueva, etc.), una descripción y el detalle de qué series se vieron afectadas.

**Versiones subidas** — la lista completa de todos los Excel que subiste, con su nombre, fecha de subida, cantidad de series/tomos, y cuál es la versión activa en este momento. Desde acá podés:
- **Descargar** cualquier versión anterior con el botón de descarga, para tenerla de respaldo o revisarla en Excel.
- **Comparar dos versiones cualquiera entre sí** (no solo la última contra la anterior). Por ejemplo, si querés ver qué cambió entre la de hace 3 meses y la de hace 1 año, elegís esas dos puntualmente en los selectores "Desde" / "Hasta" y la app descarga ambas, las analiza y te muestra el mismo tipo de detección automática (series nuevas, aumentos, series finalizadas, etc.) pero entre esas dos versiones específicas, sin tocar el catálogo que se está mostrando actualmente.

### Precio de venta

El botón "Precio de Venta" en la barra superior multiplica todos los precios mostrados por un factor configurable (`PRECIO_VENTA_RATE` en `src/lib/config.ts`, por defecto 0.6). Sirve para ver de un vistazo cuánto sale vender la colección, sin alterar los datos originales del Excel.

### Acceso para subir catálogos

Para subir un catálogo nuevo hay que iniciar sesión con **Supabase Auth** (email + contraseña de un usuario que creás vos en el panel de Supabase). La lectura del catálogo sigue siendo pública, pero la escritura (subir archivos, cambiar la versión activa, guardar el historial) solo la permiten las políticas RLS a usuarios autenticados; ya no hay ninguna contraseña dentro del código de la app. Ver el paso 4 del setup.

### Otras funciones

- **Orden por columna:** clic en el encabezado de la tabla (asc → desc → sin orden).
- **Estado en la URL:** búsqueda, filtros y orden quedan en la dirección, así que se pueden compartir o guardar como favorito.
- **Vista previa al subir:** antes de confirmar se muestran las series/tomos y los cambios detectados.
- **Caché local:** el catálogo ya procesado se guarda en el navegador (los archivos subidos nunca cambian), así que no se descarga el Excel en cada visita.
- **Encabezados del Excel:** las columnas se detectan por el nombre del encabezado (Estado, Editorial, Serie, Tomos, Precio unit., Tamaño, Valor total, Estado serie, Autor/a, Dibujante, Me falta leer). Si no se reconocen, se usa el orden clásico.

---

## Setup de Supabase

### 1. Crear el proyecto en Supabase
Entrá a [supabase.com](https://supabase.com), creá un proyecto nuevo y copiá la URL y la `anon key` desde **Settings → API**.

---

### 2. Crear las tablas (SQL Editor)

Abrí el **SQL Editor** en tu proyecto de Supabase y ejecutá esto:

```sql
-- Tabla para registrar cada Excel/CSV subido (con nombre propio, ej: "mangas_junio_2026")
create table manga_files (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  label text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now(),
  fecha_archivo date not null default current_date,
  is_active boolean not null default true,
  series_count integer not null default 0,
  tomos_count integer not null default 0
);

-- Tabla para el historial de cambios (se llena automáticamente al subir un nuevo Excel)
create table manga_changelog (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  tipo text not null check (tipo in ('aumento', 'nueva_serie', 'serie_terminada', 'serie_iniciada', 'otro')),
  descripcion text not null,
  detalle text,
  fuente text not null default 'manual' check (fuente in ('auto', 'manual')),
  file_id uuid references manga_files(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Las políticas de seguridad (RLS) se crean en el paso 4 con supabase/policies.sql
alter table manga_files enable row level security;
alter table manga_changelog enable row level security;
```

Si ya tenías las tablas creadas de una versión anterior de la app (sin `label`, `series_count`, `tomos_count`, `fuente` o `file_id`), corré esto en cambio:

```sql
alter table manga_files add column label text not null default '';
alter table manga_files add column series_count integer not null default 0;
alter table manga_files add column tomos_count integer not null default 0;
alter table manga_files add column fecha_archivo date not null default current_date;

alter table manga_changelog add column fuente text not null default 'manual' check (fuente in ('auto', 'manual'));
alter table manga_changelog add column file_id uuid references manga_files(id) on delete set null;
```

---

### 3. Crear el Storage Bucket

En **Storage → New bucket**:
- Nombre: `manga-files`
- Public: **NO** (privado, los archivos se descargan via SDK con la anon key)

Las políticas del bucket (descarga pública, subida solo autenticada) también las crea `supabase/policies.sql`.

---

### 4. Usuario administrador y políticas de seguridad

1. **Authentication → Users → Add user**: creá tu usuario (email + contraseña).
2. **Authentication → Sign In / Providers**: desactivá el registro de nuevos usuarios ("Allow new users to sign up").
3. Ejecutá [`supabase/policies.sql`](supabase/policies.sql) en el SQL Editor.

---

### 5. Variables de entorno

Creá un archivo `.env` en la raíz del proyecto (copiá `.env.example`):

```
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## Instalar y correr

```bash
npm install
npm run dev
```

Otros comandos: `npm test` (tests de parser, diff y formato), `npm run lint`, `npm run format` y `npm run build`.

---
