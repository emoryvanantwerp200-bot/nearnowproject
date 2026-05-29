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
    const gatewayUrl = process.env.NETLIFY_AI_GATEWAY_BASE_URL || "https://58d5e047-9dd6-4852-910f-59642faa43df.netlify.app/.netlify/ai/";
    const gatewayKey = process.env.NETLIFY_AI_GATEWAY_KEY;

    if (!gatewayKey) {
      return Response.json({ error: "AI Gateway Key is missing in environment variables." }, { status: 500 });
    }

    const aiResponse = await fetch(`${gatewayUrl}openai/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${gatewayKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI tracking assistant for a family safety app.
Analyze the user's message and extract the following details for a family member:
1. Name (e.g. "Bobby", "Mom", "Dad"). Ensure proper capitalization.
2. Status (e.g. "At soccer practice", "Driving home", "At the supermarket"). Keep it short and clear (max 100 characters).
3. Note (e.g. "Arriving at 5:00 PM", "Buying groceries"). Keep it descriptive (max 200 characters).
4. Latitude (a floating-point number, e.g. 37.7749).
5. Longitude (a floating-point number, e.g. -122.4194).

You MUST assign a latitude and longitude. Generate mock/simulated GPS coordinates near the San Francisco Bay Area (center at 37.7749, -122.4194) based on the location/status described. Make sure different locations have different coordinates (e.g. vary them by 0.01 to 0.1 degrees so they are spread out on the map).

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
