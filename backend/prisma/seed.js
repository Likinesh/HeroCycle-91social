import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Frame", isRequired: true, requiredQuantity: 1 },
  { name: "Gear Set", isRequired: true, requiredQuantity: 1 },
  { name: "Tyre", isRequired: true, requiredQuantity: 2 },
  { name: "Handlebar", isRequired: true, requiredQuantity: 1 },
  { name: "Saddle", isRequired: true, requiredQuantity: 1 },
  { name: "Pedal", isRequired: true, requiredQuantity: 2 },
  { name: "Accessory", isRequired: false, requiredQuantity: 0 },
];

const USERS = [
  { name: "Admin User", email: "admin@herocycles.com", password: "password123", role: "ADMIN" },
  { name: "Sales User", email: "sales@herocycles.com", password: "password123", role: "SALESPERSON" },
];

async function main() {
  console.log("Seeding database...\n");

  for (const cat of CATEGORIES) {
    await prisma.partCategory.upsert({ where: { name: cat.name }, update: {}, create: cat });
    console.log(`  ${cat.name}`);
  }

  console.log("");

  for (const user of USERS) {
    const password = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password },
    });
    console.log(`  ${user.email} (${user.role})`);
  }

  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());