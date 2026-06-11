# Cotizador Inteligente — Next.js

Sistema único con tres vistas principales.

## Vistas

| Ruta | Audiencia |
|------|-----------|
| `/` | Clientes — cotizar y contratar |
| `/cotizador/ejecutivos` | Ejecutivos Isapre — cotización profesional |
| `/cotizador/admin` | Administración de planes y clínicas |

`/cotizador` redirige a `/` por compatibilidad.

## Despliegue en Vercel

1. Conectar el repositorio `desarrolladorwebsp/cotizadorIsapres`.
2. **Root Directory:** dejar vacío (`.`). No usar `cotizador-web` — el código ya está en la raíz del repo.
3. **Framework Preset:** Next.js (detectado automáticamente).
4. Variables de entorno: `DATABASE_URL` (Neon con pooler).
5. Tras el deploy, verificar `https://tu-dominio.vercel.app/api/health` → debe responder `{ "ok": true }`.

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/plans` | Listar planes |
| `GET` | `/api/plans/[uniqueCode]` | Obtener un plan |
| `POST` | `/api/plans` | Crear plan |
| `PUT` | `/api/plans/[uniqueCode]` | Actualizar plan |
| `DELETE` | `/api/plans/[uniqueCode]` | Eliminar plan |
| `GET` | `/api/clinics` | Listar clínicas |
| `POST` | `/api/clinics` | Crear clínica |
| `PUT` | `/api/clinics/[id]` | Actualizar clínica |
| `DELETE` | `/api/clinics/[id]` | Eliminar clínica |

Datos persistidos en `src/assets/planes.json` y `src/assets/clinics.json`.

## Estructura

```
src/
├── app/
│   ├── cotizador/           # Las 3 vistas
│   └── api/plans|clinics/   # API REST
├── components/
│   ├── cotizador/           # Shell, nav, workspace
│   ├── admin/
│   ├── filters/
│   └── plan-card/
├── hooks/                   # use-plans-catalog, use-cotizador-dashboard
├── lib/api/                 # data-store, admin-client
└── types/
```

## Comandos

```bash
npm install
npm run dev
npm run build
```
