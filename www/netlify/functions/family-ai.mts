import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { familyMembers } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { message } = await req.json();
    if (!message || !message.trim()) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    // 1. Fetch existing family members to feed into prompt and check for updates
    const existing = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.userId, user.id));

    const existingNames = existing.map((m) => m.name);

    // 2. Query Netlify AI Gateway (OpenAI GPT-4o-mini)
    let gatewayBaseUrl = (
      process.env.OPENAI_BASE_URL ||
      process.env.NETLIFY_AI_GATEWAY_BASE_URL ||
      "https://58d5e047-9dd6-4852-910f-59642faa43df.netlify.app/.netlify/ai/openai/v1"
    ).replace(/\/$/, "");
    if (gatewayBaseUrl.endsWith("/.netlify/ai")) {
      gatewayBaseUrl = `${gatewayBaseUrl}/openai/v1`;
    }
    const gatewayKey = process.env.NETLIFY_AI_GATEWAY_KEY;
    const aiHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (gatewayKey) {
      aiHeaders.Authorization = `Bearer ${gatewayKey}`;
    }

    const aiResponse = await fetch(`${gatewayBaseUrl}/chat/completions`, {
      method: "POST",
      headers: aiHeaders,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are the opt-in AI Quick Track assistant for NearNow Circle, a private family safety feature.
Analyze the user's message and extract a family-circle update:
1. Name (e.g. "Bobby", "Mom", "Dad"). Ensure proper capitalization.
2. Status (e.g. "At soccer practice", "Driving home", "At the supermarket"). Keep it short and clear, max 100 characters.
3. Note (e.g. "Arriving at 5:00 PM", "Buying groceries"). Keep it descriptive, max 200 characters.
4. Latitude as a floating-point number.
5. Longitude as a floating-point number.

This feature is for trusted family-circle check-ins only. Do not imply public tracking, surveillance, or emergency dispatch. If the user provides a precise place, use an approximate coordinate for that context. If no precise place is provided, generate a simulated approximate coordinate near Mobile, Alabama, centered around 30.6954, -88.0399. Vary simulated points by 0.01 to 0.08 degrees so different members do not overlap.

Existing family members are: ${JSON.stringify(existingNames)}.
If the person mentioned matches one of the existing family members (case-insensitive), use that exact name. If not, extract the new name.

Return ONLY a valid JSON object in this format:
{
  "name": "extracted or matched name",
  "status": "extracted status",
  "note": "extracted note",
  "latitude": 37.7749,
  "longitude": -122.4194
}
Do not include any markdown styling like \`\`\`json or explanation.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.2
      })
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return Response.json({ error: `AI Gateway error: ${errText}` }, { status: aiResponse.status });
    }

    const aiData = await aiResponse.json();
    let aiText = aiData.choices[0]?.message?.content?.trim();

    if (!aiText) {
      return Response.json({ error: "AI failed to produce content." }, { status: 500 });
    }

    // Clean up markdown block if present
    if (aiText.startsWith("```")) {
      aiText = aiText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const aiParsed = JSON.parse(aiText);
    const name = String(aiParsed.name || "").trim();
    const status = String(aiParsed.status || "").trim();
    const note = String(aiParsed.note || "").trim();
    const latitude = aiParsed.latitude !== undefined && !isNaN(parseFloat(aiParsed.latitude)) ? parseFloat(aiParsed.latitude) : null;
    const longitude = aiParsed.longitude !== undefined && !isNaN(parseFloat(aiParsed.longitude)) ? parseFloat(aiParsed.longitude) : null;

    if (!name) {
      return Response.json({ error: "AI failed to extract name." }, { status: 422 });
    }

    // Check if member already exists
    const match = existing.find((m) => m.name.toLowerCase() === name.toLowerCase());
    let resultRow;

    if (match) {
      // Update
      const [updated] = await db
        .update(familyMembers)
        .set({
          name: match.name, // keep original capitalization
          status: status || match.status,
          note: note || match.note,
          latitude: latitude !== null ? latitude : match.latitude,
          longitude: longitude !== null ? longitude : match.longitude,
          updatedAt: new Date()
        })
        .where(and(eq(familyMembers.id, match.id), eq(familyMembers.userId, user.id)))
        .returning();
      resultRow = updated;
    } else {
      // Insert
      const [inserted] = await db
        .insert(familyMembers)
        .values({
          userId: user.id,
          name,
          status,
          note,
          latitude,
          longitude
        })
        .returning();
      resultRow = inserted;
    }

    return Response.json({ member: resultRow, parsed: aiParsed });
  } catch (error: any) {
    return Response.json({ error: error.message || "Failed to process AI tracking request" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/family/ai",
};
