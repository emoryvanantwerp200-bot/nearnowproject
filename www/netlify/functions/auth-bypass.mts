import type { Config, Context } from "@netlify/functions";
import { admin } from "@netlify/identity";

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = await req.json();
    const action = String(body.action || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (action === "register") {
      try {
        const newUser = await admin.createUser({
          email,
          password,
          data: {
            user_metadata: {
              full_name: name || undefined,
            },
          },
        });

        return Response.json(
          {
            success: true,
            message: "User created successfully and auto-confirmed! You can now sign in.",
            user: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
            },
          },
          { status: 201, headers: corsHeaders }
        );
      } catch (err: any) {
        if (err.message && err.message.includes("exists")) {
          return Response.json(
            { error: "A user with this email already exists." },
            { status: 409, headers: corsHeaders }
          );
        }
        return Response.json(
          { error: err.message || "Failed to create user." },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    return Response.json(
      { error: "Invalid action. Supported actions: register" },
      { status: 400, headers: corsHeaders }
    );
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Something went wrong." },
      { status: 500, headers: corsHeaders }
    );
  }
};

export const config: Config = {
  path: "/api/auth-bypass",
};
