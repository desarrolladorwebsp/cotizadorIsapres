import path from "path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { hashPassword, normalizeEmail } from "../src/lib/auth/password";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

const ADMIN_PROFILES: Record<string, string> = {
  "admin@isaprespremium.cl": "Usuario Prueba Admin 1",
  "superadmin@isaprespremium.cl": "Usuario Prueba",
};

async function upsertAdminPassword(email: string, password: string) {
  const passwordHash = await hashPassword(password);
  const fullName = ADMIN_PROFILES[email] ?? "Administrador";

  await prisma.adminAccount.upsert({
    where: { email },
    create: {
      email,
      fullName,
      passwordHash,
      active: true,
      mustChangePassword: false,
    },
    update: {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      passwordChangedAt: new Date(),
      active: true,
      mustChangePassword: false,
    },
  });

  console.log(`Contraseña actualizada para ${email}.`);
}

async function main() {
  const emailArg = process.argv[2];
  const password =
    process.argv[3]?.trim() ||
    process.env.SEED_ACCOUNT_PASSWORD?.trim() ||
    "ChangeMe123!";

  if (!emailArg) {
    console.error(
      "Uso: npx tsx scripts/reset-admin-password.ts <email|all> [contraseña]",
    );
    console.error(
      "  o define SEED_ACCOUNT_PASSWORD en el entorno para omitir la contraseña.",
    );
    process.exit(1);
  }

  if (emailArg === "all") {
    for (const email of Object.keys(ADMIN_PROFILES)) {
      await upsertAdminPassword(email, password);
    }
    console.log("Bloqueo por intentos fallidos eliminado en todas las cuentas.");
    return;
  }

  const email = normalizeEmail(emailArg);
  await upsertAdminPassword(email, password);
  console.log("Bloqueo por intentos fallidos eliminado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
