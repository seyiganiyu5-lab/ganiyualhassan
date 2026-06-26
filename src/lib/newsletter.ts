import { db } from "@/lib/db";

export interface EmailProviderConfig {
  apiKey: string;
  fromEmail: string;
}

/**
 * Read the email provider configuration from the Setting table.
 * The admin configures `resendApiKey` and `fromEmail` in the Settings tab.
 * Returns null when not configured (broadcasts are then saved as drafts).
 */
export async function getEmailProviderConfig(): Promise<EmailProviderConfig | null> {
  const rows = await db.setting.findMany({
    where: { key: { in: ["resendApiKey", "fromEmail"] } },
  });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;

  const apiKey = (map.resendApiKey || "").trim();
  const fromEmail = (map.fromEmail || "").trim();

  if (!apiKey || !fromEmail) return null;
  return { apiKey, fromEmail };
}

/**
 * Send a broadcast email to every newsletter subscriber using Resend.
 * Returns the number of recipients actually attempted.
 *
 * When no provider is configured, returns { sent: false, reason: "no-provider" }
 * so the caller can persist the broadcast as a draft instead.
 */
export async function sendBroadcast(
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<
  | { sent: true; recipientCount: number }
  | { sent: false; reason: "no-provider" | "no-subscribers" | "error"; message?: string }
> {
  const config = await getEmailProviderConfig();
  if (!config) {
    return { sent: false, reason: "no-provider" };
  }

  const subscribers = await db.newsletter.findMany();
  if (subscribers.length === 0) {
    return { sent: false, reason: "no-subscribers" };
  }

  try {
    // Lazy import so the SDK is only loaded when we actually send.
    const { Resend } = await import("resend");
    const resend = new Resend(config.apiKey);

    // BCC all subscribers at once to keep their addresses private from each
    // other, and send a single message to the configured from-address.
    const bcc = subscribers.map((s) => s.email);

    const { error } = await resend.emails.send({
      from: config.fromEmail,
      to: [config.fromEmail],
      bcc,
      subject,
      html: htmlBody,
      text: textBody,
    });

    if (error) {
      return { sent: false, reason: "error", message: String(error.message || error) };
    }

    return { sent: true, recipientCount: subscribers.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { sent: false, reason: "error", message };
  }
}
