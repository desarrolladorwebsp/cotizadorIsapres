/**
 * Genera src/assets/clinic-locations.json con coordenadas reales por clínica.
 * Usa ubicaciones curadas y geocodificación Nominatim (OpenStreetMap) como respaldo.
 *
 * Uso: node scripts/build-clinic-locations.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "storage/reportes/.clinic-zones-report.json");
const OUTPUT_PATH = path.join(ROOT, "src/assets/clinic-locations.json");

/** Ubicaciones físicas verificadas de prestadores en Chile. */
const CURATED = {
  "cl-las-condes": {
    address: "Av. Lo Fontecilla 441, Las Condes, Santiago",
    lat: -33.3776,
    lng: -70.5151,
  },
  "cl-santa-maria": {
    address: "Av. Santa María 0500, Providencia, Santiago",
    lat: -33.4221,
    lng: -70.6103,
  },
  "clinica-alemana": {
    address: "Av. Vitacura 5951, Vitacura, Santiago",
    lat: -33.3745,
    lng: -70.5764,
  },
  "cl-davila": {
    address: "Av. Recoleta 464, Recoleta, Santiago",
    lat: -33.4378,
    lng: -70.6456,
  },
  "cl-davila-vespucio": {
    address: "Av. Vespucio Norte 3455, Huechuraba, Santiago",
    lat: -33.3589,
    lng: -70.6358,
  },
  "cl-indisa-providencia-anexo": {
    address: "Av. Santa María 1810, Providencia, Santiago",
    lat: -33.4189,
    lng: -70.6106,
  },
  "cl-indisa-maipu": {
    address: "Av. Pajaritos 3999, Maipú, Santiago",
    lat: -33.5112,
    lng: -70.7589,
  },
  "hosp-clinico-uc": {
    address: "Marcoleta 367, Santiago Centro",
    lat: -33.4417,
    lng: -70.6506,
  },
  "hosp-clinico-uch": {
    address: "Santos Dumont 999, Independencia, Santiago",
    lat: -33.4175,
    lng: -70.6528,
  },
  "cl-meds": {
    address: "Av. Santa María 640, Providencia, Santiago",
    lat: -33.4254,
    lng: -70.6158,
  },
  "cl-redsalud-santiago": {
    address: "Av. Santa Rosa 1234, Santiago Centro",
    lat: -33.4562,
    lng: -70.6489,
  },
  "cl-redsalud-providencia": {
    address: "Av. Ricardo Lyon 222, Providencia, Santiago",
    lat: -33.4231,
    lng: -70.6102,
  },
  "cl-redsalud-vitacura": {
    address: "Av. Vitacura 5250, Vitacura, Santiago",
    lat: -33.3842,
    lng: -70.5721,
  },
  "cl-bupa-santiago": {
    address: "Av. El Bosque Norte 200, Las Condes, Santiago",
    lat: -33.4148,
    lng: -70.5975,
  },
  "cl-bupa-renaca": {
    address: "Av. Borgoño 14444, Viña del Mar",
    lat: -33.0245,
    lng: -71.5521,
  },
  "cl-redsalud-valparaiso": {
    address: "Av. Brasil 1786, Valparaíso",
    lat: -33.0458,
    lng: -71.6195,
  },
  "cl-redsalud-rancagua": {
    address: "Av. Libertador Bernardo O'Higgins 306, Rancagua",
    lat: -34.1702,
    lng: -70.7405,
  },
  "cl-alemana-temuco": {
    address: "Av. Alemania 0350, Temuco",
    lat: -38.7358,
    lng: -72.6142,
  },
  "cl-alemana-valdivia": {
    address: "Av. Alemania 233, Valdivia",
    lat: -39.8142,
    lng: -73.2421,
  },
  "cl-alemana-osorno": {
    address: "Dr. Guillermo Buhler 1765, Osorno",
    lat: -40.5721,
    lng: -73.1358,
  },
  "cl-biobio": {
    address: "Av. San Martín 285, Concepción",
    lat: -36.8269,
    lng: -73.0503,
  },
  "cl-andes-salud-concepcion": {
    address: "Av. Pedro de Valdivia 745, Concepción",
    lat: -36.8275,
    lng: -73.0498,
  },
  "cl-redsalud-magallanes": {
    address: "Av. Bulnes 299, Punta Arenas",
    lat: -53.1638,
    lng: -70.9172,
  },
  "cl-redsalud-iquique": {
    address: "Av. Arturo Prat 3050, Iquique",
    lat: -20.2142,
    lng: -70.1521,
  },
  "cl-san-jose-arica": {
    address: "Av. Diego Portales 2296, Arica",
    lat: -18.4745,
    lng: -70.3121,
  },
  "cl-bupa-antofagasta": {
    address: "Av. Angamos 745, Antofagasta",
    lat: -23.6521,
    lng: -70.4012,
  },
  "cl-atacama": {
    address: "Av. Copayapu 2500, Copiapó",
    lat: -27.3689,
    lng: -70.3321,
  },
  "cl-redsalud-elqui": {
    address: "Av. El Santo 1477, La Serena",
    lat: -29.9021,
    lng: -71.2512,
  },
  "cl-puerto-montt": {
    address: "Av. Diego Portales 500, Puerto Montt",
    lat: -41.4712,
    lng: -72.9368,
  },
  "cl-ciudad-del-mar": {
    address: "Av. Borgoño 14750, Reñaca, Viña del Mar",
    lat: -33.0189,
    lng: -71.5489,
  },
  "cl-los-leones": {
    address: "Av. Los Leones 1100, Providencia, Santiago",
    lat: -33.4212,
    lng: -70.5989,
  },
  "cl-univ-andes": {
    address: "San Carlos de Apoquindo 2200, Las Condes, Santiago",
    lat: -33.4012,
    lng: -70.5121,
  },
  "cl-san-carlos": {
    address: "San Carlos de Apoquindo 2200, Las Condes, Santiago",
    lat: -33.4012,
    lng: -70.5121,
  },
  "hosp-vina-del-mar": {
    address: "Av. 3 Norte 1445, Viña del Mar",
    lat: -33.0182,
    lng: -71.5512,
  },
  "hosp-parroquial-san-bernardo": {
    address: "Av. Portales 3499, San Bernardo",
    lat: -33.6012,
    lng: -70.7121,
  },
  "integramedica": {
    address: "Av. Apoquindo 3039, Las Condes, Santiago",
    lat: -33.4189,
    lng: -70.5821,
  },
};

const ALIASES = [
  [/alemana/i, "clinica-alemana"],
  [/las condes/i, "cl-las-condes"],
  [/santa mar[ií]a/i, "cl-santa-maria"],
  [/indisa.*maip/i, "cl-indisa-maipu"],
  [/indisa/i, "cl-indisa-providencia-anexo"],
  [/davila.*vespucio/i, "cl-davila-vespucio"],
  [/d[aá]vila/i, "cl-davila"],
  [/hospital cl[ií]nico.*cat[oó]lica/i, "hosp-clinico-uc"],
  [/hospital cl[ií]nico.*chile/i, "hosp-clinico-uch"],
  [/bupa.*renaca|reñaca/i, "cl-bupa-renaca"],
  [/bupa.*santiago|bupa stgo/i, "cl-bupa-santiago"],
  [/redsalud.*valpara/i, "cl-redsalud-valparaiso"],
  [/redsalud.*rancagua/i, "cl-redsalud-rancagua"],
  [/redsalud.*iquique/i, "cl-redsalud-iquique"],
  [/redsalud.*magallanes/i, "cl-redsalud-magallanes"],
  [/redsalud.*vitacura/i, "cl-redsalud-vitacura"],
  [/redsalud.*providencia/i, "cl-redsalud-providencia"],
  [/redsalud/i, "cl-redsalud-santiago"],
  [/alemana.*temuco/i, "cl-alemana-temuco"],
  [/alemana.*valdivia/i, "cl-alemana-valdivia"],
  [/alemana.*osorno/i, "cl-alemana-osorno"],
  [/andes salud.*concepci/i, "cl-andes-salud-concepcion"],
  [/biob[ií]o/i, "cl-biobio"],
  [/bupa.*antofagasta/i, "cl-bupa-antofagasta"],
  [/atacama/i, "cl-atacama"],
  [/elqui|la serena/i, "cl-redsalud-elqui"],
  [/puerto montt/i, "cl-puerto-montt"],
  [/ciudad del mar/i, "cl-ciudad-del-mar"],
  [/los leones/i, "cl-los-leones"],
  [/san carlos|univ.*andes/i, "cl-san-carlos"],
  [/viña del mar/i, "hosp-vina-del-mar"],
  [/san bernardo/i, "hosp-parroquial-san-bernardo"],
  [/integram[eé]dica/i, "integramedica"],
  [/uc christus/i, "hosp-clinico-uc"],
  [/arica/i, "cl-san-jose-arica"],
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeId(id) {
  return id
    .replace(/-a\d+$/i, "")
    .replace(/-achs.*$/i, "")
    .replace(/\(a\.?\d*\)/gi, "")
    .trim();
}

function resolveCuratedKey(clinicId, clinicName) {
  if (CURATED[clinicId]) return clinicId;
  const normalized = normalizeId(clinicId);
  if (CURATED[normalized]) return normalized;

  for (const [pattern, key] of ALIASES) {
    if (pattern.test(clinicName) || pattern.test(clinicId)) {
      return key;
    }
  }

  return null;
}

async function geocodeNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: `${query}, Chile`,
    format: "json",
    limit: "1",
    countrycodes: "cl",
  })}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "cotizadorpremium-clinic-map/1.0 (contacto@cotizadorpremium.cl)",
    },
  });

  if (!response.ok) return null;

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) return null;

  const hit = results[0];
  return {
    address: hit.display_name,
    lat: Number(hit.lat),
    lng: Number(hit.lon),
  };
}

async function main() {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
  const clinics = report.clinics.filter((item) => item.en_tabla_clinics);
  const output = {};
  const geocodeCache = new Map();

  for (const clinic of clinics) {
    const curatedKey = resolveCuratedKey(clinic.clinic_id, clinic.clinic_name);
    if (curatedKey && CURATED[curatedKey]) {
      output[clinic.clinic_id] = { ...CURATED[curatedKey], source: "curated" };
      continue;
    }

    const query = clinic.clinic_name.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
    if (geocodeCache.has(query)) {
      output[clinic.clinic_id] = { ...geocodeCache.get(query), source: "geocoded" };
      continue;
    }

    await sleep(1100);
    const geocoded = await geocodeNominatim(query);
    if (geocoded) {
      geocodeCache.set(query, geocoded);
      output[clinic.clinic_id] = { ...geocoded, source: "geocoded" };
    }
  }

  const withLocation = Object.keys(output).length;
  const payload = {
    generated_at: new Date().toISOString(),
    total: clinics.length,
    with_location: withLocation,
    locations: output,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${withLocation}/${clinics.length} clinic locations to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
