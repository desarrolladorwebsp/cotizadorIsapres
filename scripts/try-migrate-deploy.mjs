import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL?.trim()) {
  console.warn(
    "[build] DATABASE_URL no configurada; se omite prisma migrate deploy.",
  );
  process.exit(0);
}

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("[build] Migraciones aplicadas correctamente.");
} catch (error) {
  console.warn(
    "[build] prisma migrate deploy falló. La app usará consultas de respaldo en runtime.",
  );
  if (error instanceof Error) {
    console.warn(error.message);
  }
}
