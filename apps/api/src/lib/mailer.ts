import { config } from "../config.js";
import { logger } from "../logger.js";

export interface Mail {
  to: string;
  subject: string;
  heading: string;
  lines: string[];
  action?: { label: string; url: string };
}

export function isMailConfigured(): boolean {
  return Boolean(config.RESEND_API_KEY);
}

function render(mail: Mail): string {
  const body = mail.lines
    .map(l => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#373634">${l}</p>`)
    .join("");

  const action = mail.action
    ? `<p style="margin:24px 0 0"><a href="${mail.action.url}" style="display:inline-block;background:#019640;color:#ffffff;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px;text-decoration:none">${mail.action.label}</a></p>`
    : "";

  return `<!doctype html><html><body style="margin:0;background:#f6f6f9;padding:28px 16px;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid rgba(43,22,115,0.16);border-radius:12px;overflow:hidden">
<tr><td style="background:linear-gradient(135deg,#2b1673,#1a0d45);padding:20px 24px">
<span style="color:#ffffff;font-size:19px;font-weight:700;letter-spacing:0.02em">Welfo Endovision</span>
</td></tr>
<tr><td style="padding:26px 24px">
<h1 style="margin:0 0 16px;font-size:21px;line-height:1.3;color:#2b1673">${mail.heading}</h1>
${body}${action}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid rgba(43,22,115,0.08);font-size:12px;color:#85837f">
Welfo Endovision, Rishikesh. This is an automated service notification.
</td></tr>
</table></td></tr></table></body></html>`;
}

/**
 * Never throws. A notification failing must not fail the business action that
 * triggered it — a technician assignment is still valid if the email bounces.
 */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!isMailConfigured()) {
    logger.debug({ to: mail.to, subject: mail.subject }, "mail skipped: not configured");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.RESEND_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.MAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        html: render(mail),
        ...(config.MAIL_REPLY_TO ? { reply_to: config.MAIL_REPLY_TO } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      // 403 here almost always means an unverified sending domain, which
      // silently drops every recipient except the Resend account owner.
      logger.warn(
        { to: mail.to, subject: mail.subject, status: res.status, detail: detail.slice(0, 300) },
        "mail send failed",
      );
      return false;
    }

    logger.info({ to: mail.to, subject: mail.subject }, "mail sent");
    return true;
  } catch (err) {
    logger.warn({ err, to: mail.to, subject: mail.subject }, "mail send threw");
    return false;
  }
}

/** Fire and forget: schedules the send and returns immediately. */
export function queueMail(mail: Mail): void {
  void sendMail(mail);
}
