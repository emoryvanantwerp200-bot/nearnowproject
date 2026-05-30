import assert from "node:assert";
import agentHandler from "../netlify/functions/agent.js";

async function testAgent() {
  console.log("---------------------------------------------");
  console.log("🔍 TESTING NEARNOW AGENT NETLIFY FUNCTION");
  console.log("---------------------------------------------");

  // Test 1: Method not allowed (GET)
  {
    console.log("Test 1: GET request should return 405 Method Not Allowed...");
    const req = new Request("http://localhost/api/agent", { method: "GET" });
    const res = await agentHandler(req);
    assert.strictEqual(res.status, 405);
    const data = await res.json();
    assert.strictEqual(data.error, "Method not allowed");
    console.log("✅ Test 1 Passed!");
  }

  // Test 2: Missing question
  {
    console.log("Test 2: POST with empty question should return 400...");
    const req = new Request("http://localhost/api/agent", {
      method: "POST",
      body: JSON.stringify({ question: "" }),
      headers: { "Content-Type": "application/json" }
    });
    const res = await agentHandler(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, "Question is required");
    console.log("✅ Test 2 Passed!");
  }

  // Test 3: Fallback Answer for RSS sources
  {
    console.log("Test 3: POST asking about RSS sources should trigger RSS fallback answer...");
    const context = {
      feeds: [
        { source: "Reuters", category: "National News", hasFeed: true },
        { source: "TechCrunch", category: "Tech News", hasFeed: true }
      ]
    };
    const req = new Request("http://localhost/api/agent", {
      method: "POST",
      body: JSON.stringify({ question: "Which rss feeds do you have?", context }),
      headers: { "Content-Type": "application/json" }
    });
    const res = await agentHandler(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.answer.includes("Reuters"));
    assert.ok(data.answer.includes("TechCrunch"));
    assert.strictEqual(data.mode, "local");
    console.log("✅ Test 3 Passed!");
  }

  // Test 4: Fallback Answer for places route
  {
    console.log("Test 4: POST asking about a route/places should recommend local places...");
    const context = {
      places: [
        { id: "1", name: "Central Coffee", mood: "work", detail: "Quiet café" }
      ],
      filters: { savedPlaceIds: ["1"] }
    };
    const req = new Request("http://localhost/api/agent", {
      method: "POST",
      body: JSON.stringify({ question: "Recommend a quiet work option", context }),
      headers: { "Content-Type": "application/json" }
    });
    const res = await agentHandler(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.answer.includes("Central Coffee"));
    assert.strictEqual(data.mode, "local");
    console.log("✅ Test 4 Passed!");
  }

  console.log("\n---------------------------------------------");
  console.log("🎉 ALL AGENT FUNCTION TESTS PASSED!");
  console.log("---------------------------------------------");
}

testAgent().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
