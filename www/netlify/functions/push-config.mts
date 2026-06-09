import type { Config } from "@netlify/functions";

export default async () => {
  return Response.json({
    publicKey: process.env.VAPID_PUBLIC_KEY || "",
    enabled: Boolean(process.env.VAPID_PUBLIC_KEY),
  });
};

export const config: Config = {
  path: "/api/push-config",
};
