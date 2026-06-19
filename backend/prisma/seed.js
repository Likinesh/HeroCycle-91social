import "dotenv/config";
import prisma from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

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

  const categoryMap = {};

  console.log("Seeding Categories:");
  for (const cat of CATEGORIES) {
    const createdCat = await prisma.partCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categoryMap[createdCat.name] = createdCat.id;
    console.log(`  ${cat.name}`);
  }

  const PARTS = [
    // Frames
    { name: "Alloy Frame 26\"", categoryId: categoryMap["Frame"], currentPrice: 500000, description: "Lightweight alloy frame" },
    { name: "Steel Frame 24\"", categoryId: categoryMap["Frame"], currentPrice: 350000, description: "Durable steel frame" },
    { name: "Carbon Fiber Frame 27.5\"", categoryId: categoryMap["Frame"], currentPrice: 1500000, description: "Premium ultra-light carbon frame" },
    { name: "Aluminum Frame 29\"", categoryId: categoryMap["Frame"], currentPrice: 750000, description: "Robust aluminum frame for off-road" },

    // Gear Sets
    { name: "Shimano 21-Speed", categoryId: categoryMap["Gear Set"], currentPrice: 450000, description: "Smooth 21-speed gear set" },
    { name: "SRAM 12-Speed Eagle", categoryId: categoryMap["Gear Set"], currentPrice: 950000, description: "High-performance MTB gears" },
    { name: "Microshift 7-Speed", categoryId: categoryMap["Gear Set"], currentPrice: 200000, description: "Basic 7-speed commuter gears" },
    { name: "Campagnolo 11-Speed", categoryId: categoryMap["Gear Set"], currentPrice: 1200000, description: "Premium road bike gearing" },

    // Tyres
    { name: "Off-Road Tyre 26\"", categoryId: categoryMap["Tyre"], currentPrice: 85000, description: "Grippy off-road tyre" },
    { name: "City Slick Tyre 700c", categoryId: categoryMap["Tyre"], currentPrice: 65000, description: "Smooth city tyre" },
    { name: "Tubeless Gravel Tyre", categoryId: categoryMap["Tyre"], currentPrice: 150000, description: "Puncture-resistant tubeless" },
    { name: "Fat Bike Tyre 26x4.0", categoryId: categoryMap["Tyre"], currentPrice: 220000, description: "Ultra-wide snow/sand tyre" },

    // Handlebars
    { name: "Drop Handlebar", categoryId: categoryMap["Handlebar"], currentPrice: 120000, description: "Aerodynamic drop bar" },
    { name: "Flat MTB Handlebar", categoryId: categoryMap["Handlebar"], currentPrice: 80000, description: "Wide flat bar for control" },
    { name: "Riser Bar", categoryId: categoryMap["Handlebar"], currentPrice: 95000, description: "Comfortable upright riding" },
    { name: "Aero TT Bar", categoryId: categoryMap["Handlebar"], currentPrice: 250000, description: "Time trial aerodynamic extensions" },

    // Saddles
    { name: "Comfort Saddle", categoryId: categoryMap["Saddle"], currentPrice: 75000, description: "Extra padded saddle" },
    { name: "Racing Saddle Slim", categoryId: categoryMap["Saddle"], currentPrice: 150000, description: "Lightweight minimal saddle" },
    { name: "Leather Touring Saddle", categoryId: categoryMap["Saddle"], currentPrice: 350000, description: "Premium durable leather" },
    { name: "Gel Cruiser Saddle", categoryId: categoryMap["Saddle"], currentPrice: 90000, description: "Ultra-soft gel padding" },

    // Pedals
    { name: "Alloy Flat Pedals", categoryId: categoryMap["Pedal"], currentPrice: 40000, description: "Sturdy alloy pedals" },
    { name: "Plastic Commuter Pedals", categoryId: categoryMap["Pedal"], currentPrice: 15000, description: "Basic lightweight pedals" },
    { name: "Clipless SPD Pedals", categoryId: categoryMap["Pedal"], currentPrice: 120000, description: "Secure clipless mechanism" },
    { name: "Wide Platform MTB Pedals", categoryId: categoryMap["Pedal"], currentPrice: 85000, description: "Extra grip for trails" },

    // Accessories
    { name: "Water Bottle Cage", categoryId: categoryMap["Accessory"], currentPrice: 15000, description: "Standard bottle cage" },
    { name: "LED Headlight USB", categoryId: categoryMap["Accessory"], currentPrice: 95000, description: "Rechargeable bright light" },
    { name: "Rear Mudguard", categoryId: categoryMap["Accessory"], currentPrice: 35000, description: "Clip-on plastic mudguard" },
    { name: "Bike Computer GPS", categoryId: categoryMap["Accessory"], currentPrice: 450000, description: "Speed and route tracker" },
  ];

  console.log("\nSeeding Parts:");
  for (const part of PARTS) {
    await prisma.part.upsert({
      where: { name: part.name },
      update: { currentPrice: part.currentPrice }, // Update price if already exists
      create: part,
    });
    console.log(`  ${part.name} (₹${part.currentPrice / 100})`);
  }

  console.log("\nSeeding Users:");
  for (const user of USERS) {
    const password = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password },
    });
    console.log(`  ${user.email} (${user.role})`);
  }

  console.log("\nSeeding Configurations:");
  // Fetch an admin to own the config
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@herocycles.com" } });
  
  // Fetch a mix of parts to build the bike
  const alloyFrame = await prisma.part.findFirst({ where: { name: "Alloy Frame 26\"" } });
  const shimanoGear = await prisma.part.findFirst({ where: { name: "Shimano 21-Speed" } });
  const offRoadTyre = await prisma.part.findFirst({ where: { name: "Off-Road Tyre 26\"" } });
  const flatHandlebar = await prisma.part.findFirst({ where: { name: "Flat MTB Handlebar" } });
  const comfortSaddle = await prisma.part.findFirst({ where: { name: "Comfort Saddle" } });
  const alloyPedals = await prisma.part.findFirst({ where: { name: "Alloy Flat Pedals" } });

  if (adminUser && alloyFrame && shimanoGear && offRoadTyre && flatHandlebar && comfortSaddle && alloyPedals) {
    // Delete existing to avoid duplicates if re-run
    await prisma.configuration.deleteMany({ where: { name: "Standard Mountain Explorer" } });

    const config = await prisma.configuration.create({
      data: {
        name: "Standard Mountain Explorer",
        description: "A solid, affordable mountain bike build.",
        basePrice: 100000, // 1000 rupees
        createdBy: adminUser.id,
        parts: {
          create: [
            { partId: alloyFrame.id, quantity: 1 },
            { partId: shimanoGear.id, quantity: 1 },
            { partId: offRoadTyre.id, quantity: 2 },
            { partId: flatHandlebar.id, quantity: 1 },
            { partId: comfortSaddle.id, quantity: 1 },
            { partId: alloyPedals.id, quantity: 2 }
          ]
        }
      }
    });
    console.log(`  ${config.name}`);
  }

  console.log("\nDone!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());