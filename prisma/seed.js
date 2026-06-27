/**
 * Seed script — populates an empty database with the portfolio's default data.
 *
 * Idempotent: if projects already exist, it exits without changing anything.
 *
 * Run with:  node prisma/seed.js
 *   (or:     npm run db:seed)
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ─── Projects ─────────────────────────────────────────────────────────────
const projects = [
  {
    title: "godsgraceboutique",
    description:
      "An online e-commerce website that allows you to purchase accessories like jewelries, clothes, bags etc",
    category: "website",
    technologies: "TypeScript, CSS, javaScript, Shell",
    liveDemo: "https://godsgraceboutique.vercel.app/",
    githubLink: "https://github.com/seyiganiyu5-lab/God-s-Grace-Boutique",
    images: JSON.stringify([
      "/uploads/1782428552855-screenshot-2026-06-25-224634.png",
      "/uploads/1782428615107-screenshot-2026-06-25-224828.png",
    ]),
    featured: true,
    order: 0,
  },
  {
    title: "NEXAPAY",
    description:
      "An international money transfer app brand that help people transfer money internationally.",
    category: "branding",
    technologies: "Adobe illustrator.",
    liveDemo: null,
    githubLink: null,
    images: JSON.stringify([
      "/uploads/1782432954152-artboard-10.png",
      "/uploads/1782432953735-artboard-1.png",
      "/uploads/1782432955153-artboard-11.png",
      "/uploads/1782432955587-artboard-12.png",
      "/uploads/1782432956007-artboard-13.png",
      "/uploads/1782432956471-artboard-14.png",
      "/uploads/1782432956881-artboard-15.png",
      "/uploads/1782432957289-artboard-16.png",
      "/uploads/1782432957838-artboard-18.png",
      "/uploads/1782432958405-artboard-19.png",
      "/uploads/1782432958873-artboard-2.png",
      "/uploads/1782432959419-artboard-20.png",
      "/uploads/1782432959900-artboard-21.png",
      "/uploads/1782432960610-artboard-22.png",
      "/uploads/1782432961026-artboard-23.png",
      "/uploads/1782432961592-artboard-24.png",
      "/uploads/1782432962034-artboard-25.png",
      "/uploads/1782432962485-artboard-3.png",
      "/uploads/1782432962900-artboard-4.png",
      "/uploads/1782432963418-artboard-5.png",
      "/uploads/1782432963853-artboard-6.png",
      "/uploads/1782432964276-artboard-7.png",
      "/uploads/1782432964691-artboard-8.png",
      "/uploads/1782432965538-artboard-9.png",
      "/uploads/1782432968153-copilot_20260425_000100.png",
      "/uploads/1782432971243-copilot_20260425_001222.png",
      "/uploads/1782432974418-copilot_20260425_001826.png",
      "/uploads/1782432975712-copilot_20260425_002030.png",
      "/uploads/1782432976676-layer-3.png",
      "/uploads/1782432977257-layer-5.png",
      "/uploads/1782432978471-layer-8.png",
      "/uploads/1782432979726-nexa-pay.jpg",
      "/uploads/1782432980208-_a6e1fa.png",
    ]),
    featured: true,
    order: 0,
  },
];

// ─── Settings ─────────────────────────────────────────────────────────────
const settings = [
  { key: "avatarUrl", value: "/uploads/1782431177676-whatsapp-image-2026-05-20-at-17.25.43.jpg" },
  { key: "cvUrl", value: "/uploads/1782430280759-ganiyu-al-hassan.pdf" },
  { key: "heroName", value: "Ganiyu Al-Hassan Oluwaseyi" },
  { key: "heroTagline", value: "Where creativity meet energy." },
  { key: "phone", value: "(+225) 05 03 67 14 80" },
  { key: "email", value: "seyiganiyu5@gmail.com" },
  { key: "linkedin", value: "https://linkedin.com/in/al-hassan-ganiyu-9910b3410" },
  { key: "whatsapp", value: "https://wa.me/2250503671480" },
  {
    key: "metaTitle",
    value: "Ganiyu Al-Hassan Oluwaseyi — Software Engineer & Creative Designer",
  },
  {
    key: "metaDescription",
    value:
      "Portfolio of Ganiyu Al-Hassan Oluwaseyi — Software Engineering Student, Web Developer, UI/UX Designer, Graphic Designer & Branding Specialist.",
  },
  {
    key: "keywords",
    value:
      "Ganiyu Al-Hassan, Software Engineer, Web Developer, UI/UX Designer, Graphic Designer, Branding, Portfolio",
  },
  { key: "fromEmail", value: "" },
  { key: "resendApiKey", value: "" },
  { key: "siteUrl", value: "" },
  { key: "googleVerification", value: "" },
  { key: "projectsSeeded", value: "true" },
];

async function main() {
  console.log("Seeding database...");

  // Don't double-seed — check if projects already exist.
  const existing = await prisma.project.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} project(s). Skipping seed.`);
    return;
  }

  // Insert projects
  for (const p of projects) {
    await prisma.project.create({ data: p });
    console.log(`  + project: ${p.title}`);
  }

  // Insert settings (upsert so re-running doesn't fail on unique key)
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: s,
      update: { value: s.value },
    });
  }
  console.log(`  + ${settings.length} settings`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });