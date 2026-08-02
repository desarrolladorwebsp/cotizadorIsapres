# Cotizador Premium — Landing

Landing de captación en [cotizadorpremium.cl](https://cotizadorpremium.cl).

El **motor del cotizador**, widget, paneles y APIs viven en **[isaprespremium.cl](https://isaprespremium.cl)** (`/cotizador?agent=…`).

Código canónico del motor: repo/carpeta `isapresPremium`.
Archivos del motor que se retiraron de esta app quedan en `cotizadorVirtual/_archived_*` como respaldo local (no desplegar).

## Rutas

| Ruta | Comportamiento |
|------|----------------|
| `/` | Landing marketing |
| `/politica-privacidad` | Política de privacidad |
| `/inicio` | Redirect 301 → `/` |
| `/cotizador` y `/cotizador/*` | Redirect → `https://isaprespremium.cl/cotizador…` |
| `/embed/*`, `/api/*`, `/isapres/*` | Redirect → motor |
| `/cotizador-widget.js` | Redirect → motor |
| `/?agent=x` | Redirect 308 → `https://isaprespremium.cl/cotizador?agent=x` |

## Desarrollo

```bash
npm install
# `.env.local`: NEXT_PUBLIC_ENGINE_APP_URL=http://localhost:3000 (isapresPremium)
npm run dev   # :3001
```

CTAs y widget apuntan a `NEXT_PUBLIC_ENGINE_APP_URL` / `https://isaprespremium.cl`.

## Deploy (Vercel)

Proyecto de dominio `cotizadorpremium.cl`. Variables mínimas:

```env
NEXT_PUBLIC_APP_URL=https://cotizadorpremium.cl
NEXT_PUBLIC_ENGINE_APP_URL=https://isaprespremium.cl
NEXT_PUBLIC_LANDING_AGENT_KEY=cotizadorpremium
```

Staff access: `https://isaprespremium.cl/cotizador/acceso`
