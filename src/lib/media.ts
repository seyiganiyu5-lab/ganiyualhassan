import type { ProjectCategory } from "@/lib/types";

export const isPdfUrl = (url: string) => /\.pdf(\?.*)?$/i.test(url);

/**
 * Flyers, logos and illustrations are shown whole (contain) rather than
 * cropped; website screenshots crop cleanly (cover).
 */
export const isArtwork = (cat: ProjectCategory) => cat !== "website";

export const CATEGORIES: ProjectCategory[] = ["website", "branding", "graphic", "drawing"];

/** First image that isn't a PDF, used as the cover. */
export const coverOf = (images: string[]) => images.find((i) => !isPdfUrl(i)) ?? null;

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Accepts a wa.me link or a bare number. */
export const whatsappHref = (value: string) =>
  value.startsWith("http") ? value : `https://wa.me/${value.replace(/\D/g, "")}`;
