"use client";

import { jsPDF } from "jspdf";

/** Translation shape used by the generator — kept loose to avoid tight coupling. */
interface CvData {
  name: string;
  role: string;
  phone: string;
  email: string;
  linkedin: string;
  location: string;
  educationLabel: string;
  experienceLabel: string;
  certificationsLabel: string;
  skillsLabel: string;
  education: Array<{ title: string; org: string; period: string; desc: string }>;
  experience: Array<{ title: string; org: string; period: string; desc: string }>;
  certifications: Array<{ title: string; org: string; period: string; desc: string }>;
  skills: Array<{ category: string; items: string[] }>;
}

const ACCENT: [number, number, number] = [255, 195, 0]; // #FFC300
const DARK: [number, number, number] = [18, 18, 18];
const MUTED: [number, number, number] = [110, 110, 110];
const LINE: [number, number, number] = [225, 225, 225];

/**
 * Generates a clean, single-page A4 CV PDF and triggers a download.
 * Returns the filename used.
 */
export function generateCvPdf(data: CvData): string {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 48;
  const contentW = pageW - marginX * 2;

  let y = 0;

  // ── Header band ──────────────────────────────────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageW, 8, "F");

  y = 56;
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(data.name, marginX, y);

  y += 18;
  doc.setTextColor(...ACCENT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(data.role.toUpperCase(), marginX, y);

  // ── Contact line ─────────────────────────────────────────────
  y += 22;
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const contactBits = [data.phone, data.email, data.location, data.linkedin].filter(Boolean);
  const contactText = contactBits.join("   •   ");
  doc.text(contactText, marginX, y, { maxWidth: contentW });

  y += 14;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(marginX, y, pageW - marginX, y);

  // Helper to render a section heading
  const sectionHeading = (label: string, top: number) => {
    const ny = top + 26;
    doc.setTextColor(...ACCENT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label.toUpperCase(), marginX, ny);
    // small underline accent
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(1.5);
    doc.line(marginX, ny + 4, marginX + 22, ny + 4);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(1);
    return ny + 18;
  };

  // Helper to render a timeline entry
  const entry = (
    item: { title: string; org: string; period: string; desc: string },
    top: number
  ) => {
    let cy = top;
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(item.title, marginX, cy);
    cy += 13;
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${item.org}   |   ${item.period}`, marginX, cy);
    cy += 12;
    doc.setTextColor(...DARK);
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(item.desc, contentW);
    doc.text(lines, marginX, cy);
    cy += lines.length * 12 + 12;
    return cy;
  };

  // ── Experience ───────────────────────────────────────────────
  y = sectionHeading(data.experienceLabel, y);
  for (const item of data.experience) {
    y = entry(item, y);
  }

  // ── Education ────────────────────────────────────────────────
  y = sectionHeading(data.educationLabel, y);
  for (const item of data.education) {
    y = entry(item, y);
  }

  // ── Certifications ───────────────────────────────────────────
  y = sectionHeading(data.certificationsLabel, y);
  for (const item of data.certifications) {
    y = entry(item, y);
  }

  // ── Skills ───────────────────────────────────────────────────
  // Guard against running off the page; if close, the heading still renders.
  if (y > doc.internal.pageSize.getHeight() - 120) {
    doc.addPage();
    y = 56;
  }
  y = sectionHeading(data.skillsLabel, y);
  doc.setFontSize(9.5);
  for (const group of data.skills) {
    doc.setTextColor(...ACCENT);
    doc.setFont("helvetica", "bold");
    doc.text(`${group.category}:`, marginX, y);
    const labelW = doc.getTextWidth(`${group.category}:  `);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    doc.text(group.items.join(", "), marginX + labelW, y, { maxWidth: contentW - labelW });
    y += 16;
  }

  // ── Footer ───────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...LINE);
  doc.line(marginX, pageH - 40, pageW - marginX, pageH - 40);
  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.name} — ${data.role}`, marginX, pageH - 24);

  const filename = `${data.name.replace(/\s+/g, "_")}_CV.pdf`;
  doc.save(filename);
  return filename;
}
