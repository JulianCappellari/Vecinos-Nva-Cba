// Explicit local operation: promotes an existing community account. No default passwords.
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());
const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();
(async () => {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Uso: npm run comunidad:admin -- correo-de-la-cuenta");
  const user = await prisma.communityUser.findUnique({ where: { email }, select: { id: true } });
  if (!user) throw new Error("Primero creá tu cuenta en /comunidad/cuenta.");
  await prisma.communityUser.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  console.log("Cuenta promovida a moderación. El cambio se aplica a sus sesiones existentes.");
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
