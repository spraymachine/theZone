/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type AddOn = {
  key: string;
  label: string;
  fee?: number;
};

type BookingConfirmationRequest = {
  bookingId?: string | number | null;
  name: string;
  email: string;
  phone?: string | null;
  eventType: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string | null; // HH:mm
  durationHours: number;
  guests: number;
  addOns?: AddOn[];
  estimatedTotal: number;
  notes?: string | null;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function requireEnv(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatMoneyINR(amount: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${Math.round(amount)}`;
  }
}

function safeString(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function renderTextEmail(payload: BookingConfirmationRequest) {
  const addOns =
    payload.addOns && payload.addOns.length
      ? payload.addOns.map((a) => `- ${a.label}${a.fee ? ` (₹${a.fee})` : ""}`)
          .join("\n")
      : "- None";

  const timeLine = payload.endTime
    ? `${payload.startTime} – ${payload.endTime}`
    : payload.startTime;

  return [
    `Hi ${payload.name},`,
    "",
    "We’ve received your booking request for The Zone. Here are the details:",
    "",
    `Date: ${payload.date}`,
    `Time: ${timeLine}`,
    `Duration: ${payload.durationHours} hours`,
    `Guests: ${payload.guests}`,
    `Event type: ${payload.eventType}`,
    "",
    "Add-ons:",
    addOns,
    "",
    `Estimated total: ${formatMoneyINR(payload.estimatedTotal)}`,
    payload.notes ? "" : "",
    payload.notes ? `Notes: ${payload.notes}` : "",
    "",
    "Next steps: Our team will review and confirm your booking within 24 hours.",
    "",
    "Thanks,",
    "The Zone",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderHtmlEmail(payload: BookingConfirmationRequest) {
  const addOns =
    payload.addOns && payload.addOns.length
      ? payload.addOns
        .map((a) =>
          `<li>${escapeHtml(a.label)}${
            a.fee ? ` <span style="color:#64748B;">(₹${a.fee})</span>` : ""
          }</li>`
        )
        .join("")
      : "<li>None</li>";

  const timeLine = payload.endTime
    ? `${escapeHtml(payload.startTime)} – ${escapeHtml(payload.endTime)}`
    : escapeHtml(payload.startTime);

  const notesBlock = payload.notes
    ? `<tr><td style="padding:8px 0;color:#64748B;">Notes</td><td style="padding:8px 0;font-weight:600;color:#0F172A;">${escapeHtml(payload.notes)}</td></tr>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F8F9FB;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:16px;padding:24px;">
        <h2 style="margin:0 0 12px 0;color:#0F172A;">Booking request received</h2>
        <p style="margin:0 0 20px 0;color:#475569;line-height:1.6;">
          Hi ${escapeHtml(payload.name)}, we’ve received your booking request for The Zone.
        </p>

        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#64748B;">Date</td><td style="padding:8px 0;font-weight:600;color:#0F172A;">${escapeHtml(payload.date)}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;">Time</td><td style="padding:8px 0;font-weight:600;color:#0F172A;">${timeLine}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;">Duration</td><td style="padding:8px 0;font-weight:600;color:#0F172A;">${payload.durationHours} hours</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;">Guests</td><td style="padding:8px 0;font-weight:600;color:#0F172A;">${payload.guests}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;">Event type</td><td style="padding:8px 0;font-weight:600;color:#0F172A;">${escapeHtml(payload.eventType)}</td></tr>
          ${notesBlock}
        </table>

        <div style="margin:18px 0 0 0;padding:14px 16px;border-radius:12px;background:rgba(150,121,105,0.08);border:1px solid rgba(150,121,105,0.18);">
          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#846A5C;margin-bottom:6px;">Estimated total</div>
          <div style="font-size:20px;font-weight:700;color:#967969;">${escapeHtml(formatMoneyINR(payload.estimatedTotal))}</div>
        </div>

        <h3 style="margin:22px 0 10px 0;color:#0F172A;">Add-ons</h3>
        <ul style="margin:0;padding-left:18px;color:#334155;line-height:1.6;">${addOns}</ul>

        <p style="margin:20px 0 0 0;color:#475569;line-height:1.6;">
          Next steps: Our team will review and confirm your booking within 24 hours.
        </p>
      </div>

      <p style="margin:12px 0 0 0;color:#94A3B8;font-size:12px;line-height:1.5;">
        If you did not request this booking, you can ignore this email.
      </p>
    </div>
  </body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" });
  }

  try {
    const apiKey = requireEnv("MAILJET_API_KEY");
    const apiSecret = requireEnv("MAILJET_API_SECRET");
    const fromEmail = requireEnv("MAILJET_FROM_EMAIL");
    const fromName = Deno.env.get("MAILJET_FROM_NAME") || "The Zone";

    const body = (await req.json()) as Partial<BookingConfirmationRequest>;

    const payload: BookingConfirmationRequest = {
      bookingId: body.bookingId ?? null,
      name: safeString(body.name),
      email: safeString(body.email),
      phone: body.phone ?? null,
      eventType: safeString(body.eventType),
      date: safeString(body.date),
      startTime: safeString(body.startTime),
      endTime: body.endTime ? safeString(body.endTime) : null,
      durationHours: Number(body.durationHours),
      guests: Number(body.guests),
      addOns: Array.isArray(body.addOns) ? body.addOns : [],
      estimatedTotal: Number(body.estimatedTotal),
      notes: body.notes ? safeString(body.notes) : null,
    };

    if (!payload.name) return jsonResponse(400, { ok: false, error: "Missing name" });
    if (!payload.email) return jsonResponse(400, { ok: false, error: "Missing email" });
    if (!isValidEmail(payload.email)) return jsonResponse(400, { ok: false, error: "Invalid email" });
    if (!payload.eventType) return jsonResponse(400, { ok: false, error: "Missing eventType" });
    if (!payload.date) return jsonResponse(400, { ok: false, error: "Missing date" });
    if (!payload.startTime) return jsonResponse(400, { ok: false, error: "Missing startTime" });
    if (!Number.isFinite(payload.durationHours) || payload.durationHours <= 0) {
      return jsonResponse(400, { ok: false, error: "Invalid durationHours" });
    }
    if (!Number.isFinite(payload.guests) || payload.guests <= 0) {
      return jsonResponse(400, { ok: false, error: "Invalid guests" });
    }
    if (!Number.isFinite(payload.estimatedTotal) || payload.estimatedTotal < 0) {
      return jsonResponse(400, { ok: false, error: "Invalid estimatedTotal" });
    }

    const subject = "Booking request received — The Zone";
    const textPart = renderTextEmail(payload);
    const htmlPart = renderHtmlEmail(payload);

    const auth = btoa(`${apiKey}:${apiSecret}`);
    const mjResp = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: fromEmail, Name: fromName },
            To: [{ Email: payload.email, Name: payload.name }],
            Subject: subject,
            TextPart: textPart,
            HTMLPart: htmlPart,
          },
        ],
      }),
    });

    const mjRaw = await mjResp.text().catch(() => "");
    let mjJson: unknown = null;
    try {
      mjJson = mjRaw ? JSON.parse(mjRaw) : null;
    } catch {
      // Keep raw body for debugging if Mailjet returns non-JSON.
    }

    if (!mjResp.ok) {
      return jsonResponse(502, {
        ok: false,
        error: "Mailjet send failed",
        status: mjResp.status,
        details: typeof mjJson === "object" && mjJson !== null ? mjJson : mjRaw.slice(0, 2000),
      });
    }

    const messages =
      typeof mjJson === "object" && mjJson !== null && "Messages" in mjJson && Array.isArray((mjJson as { Messages?: unknown[] }).Messages)
        ? (mjJson as { Messages: Array<{ Status?: string; Errors?: unknown }> }).Messages
        : [];

    const failedMessages = messages.filter((m) => (m.Status || "").toLowerCase() !== "success");
    if (failedMessages.length > 0) {
      return jsonResponse(502, {
        ok: false,
        error: "Mailjet rejected message",
        details: failedMessages,
      });
    }

    return jsonResponse(200, { ok: true });
  } catch (err) {
    return jsonResponse(500, { ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});
