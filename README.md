# Cotizador Inteligente — Next.js

Sistema único con tres vistas principales bajo `/cotizador`.

## Vistas

| Ruta | Audiencia |
|------|-----------|
| `/cotizador` | Clientes — cotizar y contratar |
| `/cotizador/ejecutivos` | Ejecutivos Isapre — cotización profesional |
| `/cotizador/admin` | Administración de planes y clínicas |

La raíz `/` redirige a `/cotizador`.

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
