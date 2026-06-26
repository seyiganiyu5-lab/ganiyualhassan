import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBroadcast } from "@/lib/newsletter";

// List all past broadcasts (newest first)
export async function GET() {
  try {
    const broadcasts = await db.broadcast.findMany({
      orderBy: { sentAt: "desc" },
    });
    return NextResponse.json(broadcasts);
  } catch (error) {
    console.error("GET broadcasts error:", error);
    return NextResponse.json([]);
  }
}

// Compose + send a broadcast to all subscribers.
// Body: { subject: string, body: string }
// - When an email provider is configured (resendApiKey + fromEmail in Settings),
//   the email is actually delivered via Resend and the broadcast is saved with
//   status "sent".
// - When no provider is configured, the broadcast is saved with status "draft"
//   so the admin keeps an audit trail and can send it later once configured.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subject = String(body?.subject || "").trim();
    const textBody = String(body?.body || "").trim();

    if (!subject || !textBody) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 }
      );
    }

    // Build a simple, branded HTML wrapper around the plain-text body.
    const htmlBody = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr><td style="background:#FFC300;padding:20px 32px;">
            <span style="font-size:18px;font-weight:800;color:#000814;">Ganiyu Al-Hassan Oluwaseyi</span>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#18181b;">${escapeHtml(subject)}</h1>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#3f3f46;white-space:pre-wrap;">${escapeHtml(textBody)}</p>
          </td></tr>
          <tr><td style="padding:20px 32px;border-top:1px solid #e4e4e7;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">You received this email because you subscribed to updates from ganiyu-al-hassan.com.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

    const result = await sendBroadcast(subject, htmlBody, textBody);

    if (result.sent) {
      const broadcast = await db.broadcast.create({
        data: {
          subject,
          body: textBody,
          status: "sent",
          recipientCount: result.recipientCount,
        },
      });
      return NextResponse.json({
        success: true,
        status: "sent",
        recipientCount: result.recipientCount,
        broadcast,
      });
    }

    // Not sent — persist as draft (or failed) so the admin has a record.
    const status = result.reason === "error" ? "failed" : "draft";
    const broadcast = await db.broadcast.create({
      data: {
        subject,
        body: textBody,
        status,
        recipientCount: 0,
      },
    });

    const message =
      result.reason === "no-provider"
        ? "Saved as draft. Configure your email provider (Resend API key + From email) in Settings to deliver broadcasts."
        : result.reason === "no-subscribers"
        ? "Saved as draft — you have no subscribers yet."
        : `Send failed: ${result.message || "unknown error"}`;

    return NextResponse.json(
      { success: status === "draft", status, message, broadcast },
      { status: status === "failed" ? 500 : 200 }
    );
  } catch (error) {
    console.error("POST broadcast error:", error);
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
