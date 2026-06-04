import type { Config, Context } from "@netlify/functions";

function makeCode() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(100000 + (values[0] % 900000));
}

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from =
      process.env.VERIFICATION_FROM_EMAIL ||
      "NearNow <verify@near-now.com>";

    if (!apiKey) {
      return Response.json(
        { error: "Email sender is not configured. Add RESEND_API_KEY in Netlify environment variables." },
        { status: 503, headers }
      );
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "NearNow user").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "A valid email address is required." }, { status: 400, headers });
    }

    const code = makeCode();
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Your NearNow verification code",
        text: `Your NearNow verification code is ${code}. It expires in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #0d1311; line-height: 1.5;">
            <h1 style="color: #0b6343;">Your NearNow verification code</h1>
            <p>Hi ${name || "there"},</p>
            <p>Use this code to finish signing in to NearNow:</p>
            <p style="font-size: 32px; letter-spacing: 8px; font-weight: 800; color: #0b6343;">${code}</p>
            <p>This code expires in 15 minutes.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      return Response.json(
        { error: "Could not send verification email.", details },
        { status: 502, headers }
      );
    }

    return Response.json({ sent: true, expiresInMinutes: 15 }, { status: 200, headers });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to send verification code." },
      { status: 500, headers }
    );
  }
};

export const config: Config = {
  path: "/api/send-verification-code",
};
