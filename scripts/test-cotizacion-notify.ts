import path from "path";
import { config } from "dotenv";
import { parseCotizacionNotifyInput } from "../src/lib/email/cotizacion-notify-schema";
import { sendCotizacionNotifyEmails } from "../src/lib/email/send-cotizacion-notify";
import { COTIZALO_ANTES_THEME } from "../src/lib/partner-entity/fallback-entities";

config({ path: path.join(process.cwd(), ".env.local") });

const samplePayload = {
  email: process.argv[2] ?? "usuario@correo.cl",
  region: "Región Metropolitana",
  edad: 35,
  sexo: "Femenino",
  ingreso: "1500000",
  cargas: [8, 12],
  busqueda: "13-CORE101-26",
  orden: "Menor precio",
  moneda: "clp" as const,
  isapres: ["Consalud", "Banmédica"],
  plan: {
    codigo: "13-CORE101-26",
    id: "13-core101-26",
    nombre: "CORE 101",
    isapre: "Consalud",
    tipoPlan: "Libre Elección",
    precioUf: "1,160 UF",
    precioClp: "$47.314",
    precioBaseUf: "0,95 UF",
    gesPremiumUf: "0,73 UF",
    tieneTop: false,
    coberturaHospitalaria: 40,
    coberturaAmbulatoria: 60,
    clinicas: 28,
    totalBeneficiarios: 3,
    factoresRiesgo: 2.4,
  },
  solicitante: {
    nombre: "María Pérez",
    rut: "12.345.678-9",
    telefono: "+56912345678",
    isapreActual: "No — no es afiliado a Consalud",
    notas: "No es afiliado actualmente a Consalud",
  },
  cotizadorUrl:
    "https://cotizadorpremium.cl/cotizador?agent=cotizaloantes&region=rm&edad=35",
  partnerEntitySlug: "cotizaloantes",
  partnerEntityName: "Cotízalo Antes",
  partnerEntityTheme: COTIZALO_ANTES_THEME,
  partnerEntityLogoUrl: "https://cotizadorpremium.cl/images/logo-cotizalo-antes.png",
};

async function main() {
  const data = parseCotizacionNotifyInput(samplePayload);
  const result = await sendCotizacionNotifyEmails(data);

  console.log("Correos enviados:");
  console.log(`  - Usuario (${data.email}): ${result.userId}`);
  console.log(`  - Equipo: ${result.adminId}`);
}

main().catch((error) => {
  console.error("Error en prueba de cotización:", error);
  process.exit(1);
});
