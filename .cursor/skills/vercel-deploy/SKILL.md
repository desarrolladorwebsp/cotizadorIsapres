---
name: vercel-deploy
description: >-
  Valida y despliega cambios del cotizador en Vercel sin romper producción.
  Usar siempre antes de git commit, git push o cuando el usuario pida deploy,
  publicar en Vercel, o asegurar que el build de producción funcione.
paths: package.json,vercel.json,scripts/verify-vercel-build.mjs,scripts/try-migrate-deploy.mjs
---

# Deploy seguro en Vercel — Cotizador Premium

## Regla obligatoria

**Nunca hagas `git commit` ni `git push` sin pasar antes:**

```bash
npm run verify:vercel
```

Ese comando ejecuta `npm run build` — el mismo pipeline que Vercel (`prisma generate` → migraciones → `next build`).

Si falla, corrige el error y vuelve a ejecutar hasta que pase.

## Flujo completo commit → push → Vercel

```bash
# 1. Verificar build (obligatorio)
npm run verify:vercel

# 2. Revisar cambios
git status
git diff

# 3. Commit (solo si el usuario lo pidió)
git add <archivos relevantes>
git commit -m "$(cat <<'EOF'
Mensaje claro del porqué del cambio.

EOF
)"

# 4. Push
git push
```

## Qué ejecuta Vercel en cada deploy

Comando de build (`package.json`):

```
prisma generate && node scripts/try-migrate-deploy.mjs && next build
```

| Paso | Qué hace | Si falla |
|------|----------|----------|
| `postinstall` | `prisma generate` | Revisar `prisma/schema.prisma` |
| `try-migrate-deploy.mjs` | `prisma migrate deploy` (+ parches SQL seguros) | Revisar migraciones y `DATABASE_URL` en Vercel |
| `next build` | Compila app + TypeScript de `src/` | Corregir errores TS/imports en componentes |

## Configuración Vercel (proyecto)

- **Repo:** `desarrolladorwebsp/cotizadorIsapres`
- **Root Directory:** `.` (raíz del repo, no subcarpetas)
- **Framework:** Next.js (`vercel.json`)
- **Health check post-deploy:** `GET /api/health` → `{ "ok": true }`

## Variables de entorno críticas en Vercel

Configurar en **Production** (y Preview si aplica):

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Neon/Postgres — migraciones en build |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Mapa clínicas + Places autocomplete |
| `BLOB_READ_WRITE_TOKEN` | PDFs de planes (si `PLAN_PDF_STORAGE=blob`) |
| `RESEND_API_KEY` | Emails de cotización |
| `JWT_SECRET` / auth | Sesiones admin y ejecutivos |

No commitear `.env.local`. Actualizar `.env.example` si se agregan variables nuevas.

## Errores frecuentes que rompen Vercel

### 1. Import roto en componentes

```ts
// ❌ Falta `import {`
  foo,
  bar,
} from "@/lib/foo";

// ✅
import { foo, bar } from "@/lib/foo";
```

### 2. TypeScript en `src/`

`next build` type-checks todo `src/`. Los scripts en `scripts/` están excluidos de `tsconfig.json` — no deben bloquear el deploy, pero sí corregir errores en `src/`.

### 3. Prisma sin generar

Si hay cambios en `schema.prisma`, incluir migración en `prisma/migrations/` y verificar que `prisma generate` no falle.

### 4. APIs de Google Maps

Si tocas ubicación de clínicas, confirmar que en Google Cloud estén habilitadas **Maps JavaScript API** y **Places API**.

## Checklist antes de push

- [ ] `npm run verify:vercel` pasó sin errores
- [ ] No hay secretos en el commit (`.env`, tokens)
- [ ] Migraciones Prisma incluidas si cambió el schema
- [ ] Variables nuevas documentadas en `.env.example`
- [ ] Archivos de reporte/debug en `storage/reportes/` **no** commiteados salvo pedido explícito

## Después del push

1. Esperar deploy en Vercel (dashboard o notificación GitHub).
2. Si el usuario reporta fallo, revisar logs de build en Vercel.
3. Verificar `/api/health` en producción.

## Comandos útiles

```bash
npm run verify:vercel      # Pre-push (build de producción)
npm run build              # Solo build
npm run lint               # ESLint (opcional; no bloquea Vercel hoy)
npm run db:migrate:deploy  # Migraciones locales contra BD dev
```
