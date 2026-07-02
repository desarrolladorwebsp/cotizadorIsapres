/** Cantidad inicial de planes mostrados al cargar el cotizador público. */
export const INITIAL_PLANS_PAGE_SIZE = 12;

/** Incremento al pulsar "Ver más planes". */
export const PLANS_PAGE_SIZE_STEP = 12;

/** Tope de planes por request de búsqueda (protege memoria y payload). */
export const MAX_PLAN_SEARCH_LIMIT = 48;

/** Planes visibles en el widget embebido (preview en sitios aliados). */
export const EMBED_WIDGET_PLANS_LIMIT = 4;

/** Skeletons visibles mientras carga (menos DOM = menos trabajo en el cliente). */
export const PLAN_LOADING_SKELETON_COUNT = 2;
