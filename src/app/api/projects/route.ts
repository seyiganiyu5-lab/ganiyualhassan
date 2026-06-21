import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const seedProjects = [
  {
    title: "Creative Agency Website",
    description: "A modern, animated marketing website for a design agency featuring smooth scroll animations, interactive portfolios, and a custom CMS. Built with performance and SEO in mind.",
    category: "website",
    technologies: "Next.js, TypeScript, Tailwind CSS, Framer Motion",
    liveDemo: null,
    githubLink: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80",
    ]),
    featured: true,
    order: 0,
  },
  {
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with product catalog, cart, checkout, and admin dashboard. Responsive design with optimized load times.",
    category: "website",
    technologies: "React, Node.js, Prisma, PostgreSQL",
    liveDemo: null,
    githubLink: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    ]),
    featured: true,
    order: 1,
  },
  {
    title: "Brand Identity — Aurora",
    description: "Complete brand identity system including logo design, color palette, typography, brand guidelines, and mockup presentations for a tech startup.",
    category: "branding",
    technologies: "Adobe Illustrator, Photoshop",
    liveDemo: null,
    githubLink: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
      "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&q=80",
    ]),
    featured: true,
    order: 2,
  },
  {
    title: "Event Poster Series",
    description: "A series of bold, eye-catching posters for a music festival. Vibrant gradients, dynamic typography, and creative compositions.",
    category: "graphic",
    technologies: "Adobe Photoshop, Illustrator",
    liveDemo: null,
    githubLink: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80",
    ]),
    featured: false,
    order: 3,
  },
  {
    title: "Finance Mobile App UI",
    description: "A comprehensive UI/UX case study for a personal finance app. Includes user research, wireframes, interactive prototypes, and a polished design system.",
    category: "uiux",
    technologies: "Figma, Adobe XD, Prototyping",
    liveDemo: null,
    githubLink: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    ]),
    featured: true,
    order: 4,
  },
  {
    title: "Digital Portrait Collection",
    description: "A gallery of digital illustrations and portraits created with a mix of traditional sketching and digital painting techniques.",
    category: "drawing",
    technologies: "Procreate, Digital Illustration",
    liveDemo: null,
    githubLink: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    ]),
    featured: false,
    order: 5,
  },
  {
    title: "Restaurant Logo & Menu Design",
    description: "Brand identity and menu design for a modern restaurant. Custom logo, typography selection, and elegant menu layouts.",
    category: "branding",
    technologies: "Illustrator, InDesign",
    liveDemo: null,
    githubLink: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
    ]),
    featured: false,
    order: 6,
  },
  {
    title: "SaaS Dashboard UI/UX",
    description: "Data visualization dashboard with charts, tables, and real-time analytics. Focus on usability, accessibility, and clean information hierarchy.",
    category: "uiux",
    technologies: "Figma, React, Recharts",
    liveDemo: null,
    githubLink: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    ]),
    featured: false,
    order: 7,
  },
  {
    title: "Social Media Campaign Graphics",
    description: "A cohesive set of social media graphics for a product launch campaign. Consistent visual language across Instagram, Twitter, and Facebook.",
    category: "graphic",
    technologies: "Photoshop, Illustrator",
    liveDemo: null,
    githubLink: null,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80",
    ]),
    featured: false,
    order: 8,
  },
];

async function ensureSeed() {
  const count = await db.project.count();
  if (count === 0) {
    await db.project.createMany({ data: seedProjects });
  }
}

// One-time cleanup: convert any legacy "#" placeholder links to null so they
// don't render as clickable anchors that go nowhere. Idempotent — runs every
// GET but only writes when there's actually something to fix.
async function cleanupLegacyHashLinks() {
  try {
    await db.project.updateMany({
      where: { liveDemo: "#" },
      data: { liveDemo: null },
    });
    await db.project.updateMany({
      where: { githubLink: "#" },
      data: { githubLink: null },
    });
  } catch (error) {
    console.error("cleanupLegacyHashLinks error:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureSeed();
    await cleanupLegacyHashLinks();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = category && category !== "all" ? { category } : {};
    const projects = await db.project.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      projects.map((p) => ({
        ...p,
        images: JSON.parse(p.images || "[]") as string[],
      }))
    );
  } catch (error) {
    console.error("GET projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = await db.project.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        technologies: body.technologies || "",
        liveDemo: body.liveDemo || null,
        githubLink: body.githubLink || null,
        images: JSON.stringify(body.images || []),
        featured: body.featured || false,
        order: body.order || 0,
      },
    });
    return NextResponse.json({ ...project, images: JSON.parse(project.images || "[]") });
  } catch (error) {
    console.error("POST project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
