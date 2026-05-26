-- ============================================================
--  Bloc Temático — Esquema de base de datos (Supabase / Postgres)
--  Ejecuta TODO este archivo en: Supabase → SQL Editor → New query → Run
--  Incluye RLS para que cada usuario solo vea y edite sus propias filas.
-- ============================================================

-- TEMÁTICAS
create table if not exists temas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) default auth.uid(),
  nombre      text not null,
  emoji       text,
  orden       int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- NOTAS (varias por temática). contenido = Markdown con emojis.
create table if not exists notas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) default auth.uid(),
  tema_id     uuid not null references temas(id) on delete cascade,
  titulo      text,
  contenido   text default '',
  orden       int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- CONCEPTOS (el "qué" que mido). Ej: "Gasto comida", "Horas estudio".
create table if not exists conceptos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) default auth.uid(),
  nombre      text not null,
  unidad      text,            -- ej: "€", "h", "veces"
  emoji       text,
  created_at  timestamptz default now()
);

-- REGISTROS (los números acumulados, tipo Excel: qué + valor + cuándo).
create table if not exists registros (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) default auth.uid(),
  concepto_id uuid not null references conceptos(id) on delete cascade,
  valor       numeric not null,
  nota        text,
  fecha_hora  timestamptz not null default now(),
  created_at  timestamptz default now()
);

-- ALARMAS
create table if not exists alarmas (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) default auth.uid(),
  titulo       text not null,
  mensaje      text,
  proxima_vez  timestamptz not null,
  repeticion   text not null default 'ninguna',  -- ninguna | diaria | semanal | mensual
  activa       boolean not null default true,
  tema_id      uuid references temas(id) on delete set null,
  created_at   timestamptz default now()
);

-- ------------------------------------------------------------
--  Row Level Security: cada usuario solo ve y edita lo suyo
-- ------------------------------------------------------------
alter table temas      enable row level security;
alter table notas      enable row level security;
alter table conceptos  enable row level security;
alter table registros  enable row level security;
alter table alarmas    enable row level security;

-- Política reutilizable por tabla (una por tabla)
drop policy if exists "dueño total temas"     on temas;
drop policy if exists "dueño total notas"     on notas;
drop policy if exists "dueño total conceptos" on conceptos;
drop policy if exists "dueño total registros" on registros;
drop policy if exists "dueño total alarmas"   on alarmas;

create policy "dueño total temas"     on temas      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "dueño total notas"     on notas      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "dueño total conceptos" on conceptos  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "dueño total registros" on registros  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "dueño total alarmas"   on alarmas    for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ------------------------------------------------------------
--  Realtime: publicar cambios de estas tablas (seguro si ya existen)
-- ------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table temas;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table notas;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table conceptos;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table registros;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table alarmas;
exception when duplicate_object then null; end $$;
