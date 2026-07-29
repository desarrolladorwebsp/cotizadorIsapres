/** Evento de calendario derivado de `User.nextCallAt`. */
export interface CalendarCallEvent {
  id: string;
  clientId: string;
  clientName: string;
  startsAt: string;
  title: string;
  kind: "call";
  /** Canal preferido (Zoom / WhatsApp) para colorear el evento. */
  contactMethod?: "ZOOM" | "WHATSAPP" | null;
  /** Equipo Calendly si hay booking / asignación. */
  calendlyTeam?: "EQUIPO_1" | "EQUIPO_2" | "EQUIPO_3" | null;
  /** Link Zoom para unirse (si el webhook lo sincronizó). */
  zoomJoinUrl?: string | null;
}
