/** Clean up a testimonial sent from the admin form. */
export function readTestimonial(body: Record<string, unknown>) {
  const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const url = (v: unknown) => {
    const s = str(v, 500);
    return /^(https?:\/\/|\/)/i.test(s) ? s : "";
  };
  return {
    quote: str(body.quote, 1200),
    name: str(body.name, 120),
    role: str(body.role, 120),
    company: str(body.company, 120),
    photoUrl: url(body.photoUrl),
    link: url(body.link),
    visible: body.visible !== false,
  };
}
