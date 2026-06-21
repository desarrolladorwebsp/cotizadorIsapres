import path from "path";
import { config } from "dotenv";
import { parseCotizacionNotifyInput } from "../src/lib/email/cotizacion-notify-schema";
import { sendCotizacionNotifyEmails } from "../src/lib/email/send-cotizacion-notify";

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
    isapre: "Consalud",
    precioUf: "1,160",
    precioClp: "$47.314",
    coberturaHospitalaria: 40,
    coberturaAmbulatoria: 60,
  },
  cotizadorUrl:
    "https://cotizador.cotizaloantes.cl/?region=rm&edad=35&sexo=f&ingreso=1500000&auto=1",
};

async function main() {
  const data = parseCotizacionNotifyInput(samplePayload);
  const result = await sendCotizacionNotifyEmails(data);

  console.log("Correos enviados:");
  console.log(`  - Usuario (${data.email}): ${result.userId}`);
  console.log(`  - Admin: ${result.adminId}`);
}

main().catch((error) => {
  console.error("Error en prueba de cotización:", error);
  process.exit(1);
});
