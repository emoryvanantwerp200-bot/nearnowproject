import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

type PushSubscriptionPayload = {
  endpoint?: string;
  keys?: Record<string, string>;
};

function subscriptionKey(subscription: PushSubscriptionPayload) {
  const endpoint = subscription.endpoint || crypto.randomUUID();
  return endpoint.replace(/[^a-zA-Z0-9_-]/g, "_").slice(-160);
}

export default async (req: Request) => {
  const store = getStore("push-subscriptions");

  if (req.method === "GET") {
    const subscriptions = await store.list();
    return Response.json({ count: subscriptions.blobs.length });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await req.json().catch(() => ({}));
  const subscription = body.subscription as PushSubscriptionPayload | undefined;
  if (!subscription?.endpoint) {
    return Response.json({ error: "Push subscription endpoint is required." }, { status: 400 });
  }

  const key = subscriptionKey(subscription);
  await store.setJSON(key, {
    subscription,
    areas: Array.isArray(body.areas) ? body.areas : [],
    radius: body.radius || "10",
    location: body.location || null,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  });

  return Response.json({ ok: true, key });
};

export const config: Config = {
  path: "/api/push-subscribe",
};
