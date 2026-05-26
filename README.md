# Bloc Temático

App personal de notas por temáticas + acumulador de números + alarmas.
Frontend único (React + Vite + TS + Tailwind) sobre Supabase, para
PC Windows (Electron) y móvil (PWA Android).

## Estado por fases

- [x] **Fase 1 — Cimientos**: proyecto Vite + React + TS + Tailwind, cliente
      Supabase, login email/contraseña, layout con navegación lateral y pestañas
      móviles, modo claro/oscuro.
- [x] **Fase 2 — Notas**: CRUD temáticas + notas, editor Markdown con
      auto-guardado, barra de emojis, Realtime.
- [x] **Fase 3 — Números**: conceptos + registros, tabla con alta rápida,
      resúmenes (total / media / máx / mín), gráfica Recharts.
- [x] **Fase 4 — Alarmas**: CRUD alarmas con repetición diaria/semanal/mensual,
      dispatcher de notificaciones nativas cada 30 s, asociación a temáticas.
- [x] **Fase 5 — Electron**: ventana nativa Windows con electron-builder,
      instalador NSIS, modo dev apunta al servidor Vite.
- [ ] Fase 6 — PWA Android
- [ ] Fase 7 — Pulido

---

## Puesta en marcha (primera vez)

### 1. Crear el proyecto en Supabase

1. Entra en https://supabase.com y crea un proyecto nuevo (plan gratis).
2. Ve a **SQL Editor → New query**, pega el contenido de
   [`db/schema.sql`](db/schema.sql) y pulsa **Run**.
   - Esto crea las tablas, activa RLS y publica las tablas en Realtime.
3. (Comprobación opcional) En **Database → Replication** verás que las 5 tablas
   están en la publicación `supabase_realtime`.

### 2. Configurar las credenciales locales

1. En Supabase, ve a **Settings → API** y copia:
   - **Project URL**
   - **anon public key**
2. En la carpeta del proyecto, copia el archivo de ejemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Abre `.env` y pega tus valores:

   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

   > El archivo `.env` está en `.gitignore` y no se sube a Git.

### 3. Crear tu usuario

- Opción A: en la pantalla de login de la app, pulsa **«¿No tienes cuenta?
  Regístrate»** y crea tu usuario con email y contraseña.
- Opción B: créalo desde Supabase en **Authentication → Users → Add user**.

> Nota: si en **Authentication → Providers → Email** tienes activada la
> confirmación por correo, tendrás que confirmar el email antes de poder entrar.
> Para uso personal puedes desactivar esa confirmación.

---

## Comandos web

```powershell
npm install      # instalar dependencias (solo la primera vez)
npm run dev      # servidor de desarrollo web (http://localhost:5273)
npm run build    # compilar React para producción → dist/
npm run preview  # previsualizar el build web
```

---

## Electron (escritorio Windows)

### Desarrollo

Abre **dos terminales**:

```powershell
# Terminal 1 — servidor Vite
npm run dev

# Terminal 2 — ventana Electron (carga localhost:5273)
npm run electron:start
```

### Generar instalador Windows (.exe)

```powershell
npm run electron:dist
```

El instalador aparece en `release/`. Incluye acceso directo en escritorio y
menú de inicio, y permite elegir la carpeta de instalación.

### Solo empaquetar sin instalador (más rápido para probar)

```powershell
npm run electron:pack
```

El ejecutable queda en `release/win-unpacked/`.

---

## Notas técnicas

- `electron/main.ts` → proceso principal (compilado a `electron-dist/main.js`
  con `tsconfig.electron.json`).
- `base: './'` en `vite.config.ts` hace que todos los assets usen rutas
  relativas, necesario para cargarlos desde `file://` en Electron.
- `app.isPackaged` distingue modo dev (carga `localhost:5273`) de producción
  (carga `dist/index.html`).
- Las notificaciones nativas del dispatcher de alarmas funcionan en Electron
  sin configuración adicional.
