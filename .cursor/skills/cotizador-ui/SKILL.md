---
name: cotizador-ui
description: >-
  Diseño UI/UX del cotizador Isapres Premium. Usar al crear o mejorar componentes
  públicos, admin, modales, cards de planes, formularios y estilos. Combina
  dirección estética, accesibilidad WCAG 2.1 AA, tokens del design system y
  buenas prácticas React/Tailwind del proyecto.
paths: src/components/**,src/app/**,src/lib/ui-tokens.ts
---

# Cotizador UI — Isapres Premium

Skill de proyecto que sintetiza tres enfoques probados:

| Skill de referencia | Aporte | Cuándo priorizarlo |
|---------------------|--------|-------------------|
| **frontend-design** (Anthropic) | Dirección estética, evitar “AI slop”, jerarquía visual, motion con propósito | Landing, cards, modales, primera impresión |
| **effective-ui-design** | WCAG 2.1 AA, grid 8pt, contraste, formularios, focus, reduced motion | Formularios, inputs, accesibilidad, densidad |
| **Reglas .mdc del proyecto** | Tokens fijos (`globals.css`, `ui-tokens.ts`), convenciones Tailwind | Siempre — nunca inventar colores fuera del sistema |

## Dirección estética (fija para este producto)

- **Tono**: confiable, claro, premium accesible — cotizador de salud en Chile, no startup genérica.
- **Paleta** (solo variables CSS existentes):
  - Primario verde: `--primary` / `--primary-dark` / `--primary-hover`
  - Acento azul: `--secondary` / `--secondary-muted` (ambulatoria, info, PDF)
  - Acento amarillo: `--accent-warning` / `--warning-muted` (preferente, puntaje, prestadores)
  - Acento rojo: `--accent-danger` / `--danger-muted` (obligatorio, errores)
  - Fondo: `--bg-layout`, superficies `--background`
  - Crema criterios: `--criteria-surface` / `--criteria-ring`
  - Detalles: usar `accent` de `ui-tokens.ts` — nunca como color dominante de página
- **Tipografía**: Geist Sans (cuerpo) + Geist Mono (códigos de plan). No cambiar fuentes sin pedido explícito.
- **Firma visual**: barra de criterios crema + cards blancas con sombra verde suave + CTAs redondeados verdes.

## Reglas técnicas obligatorias

1. **Tokens primero** — usar `ui` de `@/lib/ui-tokens` y clases semánticas (`text-primary-dark`, `bg-bg-layout`). Prohibido hex suelto salvo en `globals.css`.
2. **Grid 8pt** — espaciado en múltiplos de 4/8: `p-4`, `gap-4`, `py-5`, `h-11`, `min-h-12` (touch).
3. **Contraste** — texto normal ≥ 4.5:1; UI ≥ 3:1. `text-muted` solo para labels secundarios, no cuerpo principal.
4. **Focus visible** — todo interactivo con `focus-visible:ring-2 focus-visible:ring-primary/40`.
5. **Motion** — `framer-motion` con moderación; respetar `prefers-reduced-motion` (clase `.motion-safe` en globals).
6. **Formularios** — `<label>` visible, `*` en obligatorios, errores con `bg-danger-muted` + `text-accent-danger`.
7. **Código** — componentes pequeños, props tipadas, sin inline styles, reutilizar `joinClasses`, `touchTarget`.
8. **App móvil nativa (obligatorio en cada cambio UI)** — ver sección siguiente; aplicar en vistas nuevas y al tocar layouts existentes.

## App móvil nativa — regla permanente

**Objetivo:** en `<lg` la app debe sentirse sólida, estática y sin tambaleos (sin desborde lateral ni rebote elástico del navegador). Desktop (`lg+`) no cambia su scroll habitual.

### Tokens (`@/lib/ui-tokens`)

| Token | Cuándo usarlo |
|-------|----------------|
| `appShellRoot` | Contenedor raíz de cada vista/página |
| `appShellScroll` | **Único** bloque con scroll vertical en móvil (`main` o wrapper de contenido) |
| `safeWidth` | Hijos que puedan desbordar: inputs, tablas, grids, imágenes anchas |
| `horizontalScrollRail` | Tabs, nav o carruseles con scroll horizontal interno |

### Estructura mínima de una vista

```tsx
<div className={joinClasses(appShellRoot, ui.canvas)}>
  <Header className="shrink-0" />   {/* fijo arriba en móvil */}
  <main className={joinClasses(appShellScroll, safeWidth, "...")}>
    {/* contenido */}
  </main>
  <FooterOpcional className="shrink-0" />  {/* fijo abajo en móvil, no sticky */}
</div>
```

### Reglas al modificar o crear UI

1. **Sin desborde lateral** — nunca dejar que un hijo empuje el viewport. Envolver con `safeWidth` o `max-w-full min-w-0`; no eliminar el elemento problemático.
2. **Sin rebote** — `overscroll-y-contain` en zonas de scroll internas; `horizontalScrollRail` en scroll horizontal; al bloquear `body` (modal/sidebar) también `overscrollBehavior: none`.
3. **Un solo scroll vertical en móvil** — header/nav/footer fuera de `appShellScroll`; marcar barras fijas con `shrink-0`.
4. **Scroll fluido (no negociable)** — usar `app-shell-scroll` (clase de `appShellScroll`) como único contenedor de scroll vertical en móvil; `-webkit-overflow-scrolling: touch`, `touch-action: pan-y`, `scroll-behavior: smooth` (respetando `prefers-reduced-motion`). Nunca dejar pantallas en blanco ni scroll bloqueado tras cerrar overlays.
5. **Modales y drawers** — bloquear scroll con `useScrollLock` (contenedor app-shell en móvil, `body` en desktop); cuerpo interno con `overscroll-y-contain`; tabs con `horizontalScrollRail`.
6. **No romper lo existente** — solo añadir contención; no cambiar lógica de negocio ni tokens de color.

### Referencia global

`globals.css` y `layout.tsx` ya aplican `overflow-x: clip` y `overscroll-behavior: none` en `html`/`body`. Las vistas deben respetar esa base con los tokens anteriores.

## Patrones del cotizador

- **Vista pública** (`/cotizador`): header sticky, barra criterios, sidebar filtros, cards de plan, modal solicitud estilo QuePlan.
- **Cards de plan**: logo isapre, precio destacado, coberturas resumidas, acciones alineadas a la derecha en desktop.
- **Elevación plan-card** (`planCard` en `ui-tokens.ts`): sombra multicapa `--shadow-plan-card`, borde `--plan-card-border`, ring interior, header/coberturas con fondos distintos, gap 20–24px entre cards. Guía API: `/api/public/v1/ui/plan-card` v1.1.0.
- **Modal solicitar**: dos columnas en `lg+` (beneficios + formulario), precio visible, tabs decorativas con “Solicitar” activo.

## Anti-patrones (rechazar)

- Gradientes morado/rosa, Inter/Roboto si se propone cambio de fuente
- Hex hardcodeados (`#fff8e8`) en componentes — usar tokens
- Animaciones en cada elemento
- Cards apiladas sin jerarquía de precio
- Botones sin estado disabled/loading en formularios async

## Checklist antes de entregar UI

- [ ] Usa tokens del design system
- [ ] Touch targets ≥ 44px en móvil
- [ ] Focus keyboard visible
- [ ] Estados: loading, error, vacío
- [ ] Responsive probado sm / lg
- [ ] Scroll fluido en móvil y desktop (sin bloqueos ni doble contenedor de scroll)
- [ ] Copy en español claro, sentence case
- [ ] **Móvil app-like:** `appShellRoot` + `appShellScroll` en vistas; `safeWidth` en hijos anchos
- [ ] **Sin tambaleo:** probado arrastre horizontal y pull al final del scroll en móvil
- [ ] Modales/sidebars bloquean `body` con `overflow` + `overscrollBehavior`
