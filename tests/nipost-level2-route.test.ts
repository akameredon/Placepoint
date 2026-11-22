import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/postcode/level2-probe/route";

const originalToken = process.env.NIPOST_L2_PROBE_TOKEN;
const originalMaxLevel = process.env.NIPOST_MAX_LEVEL;

afterEach(() => {
  if (originalToken === undefined) delete process.env.NIPOST_L2_PROBE_TOKEN;
  else process.env.NIPOST_L2_PROBE_TOKEN = originalToken;
  if (originalMaxLevel === undefined) delete process.env.NIPOST_MAX_LEVEL;
  else process.env.NIPOST_MAX_LEVEL = originalMaxLevel;
});

describe("NIPOST level 2 diagnostic route", () => {
  it("is disabled unless both explicit opt-ins are configured", async () => {
    delete process.env.NIPOST_L2_PROBE_TOKEN;
    process.env.NIPOST_MAX_LEVEL = "1";
    const response = await POST(new Request("https://placepoint.test/api/postcode/level2-probe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: "FC-03-B06-AG-12" }),
    }));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("rejects requests without the operator bearer token", async () => {
    process.env.NIPOST_L2_PROBE_TOKEN = "test-only-secret";
    process.env.NIPOST_MAX_LEVEL = "2";
    const response = await POST(new Request("https://placepoint.test/api/postcode/level2-probe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: "FC-03-B06-AG-12" }),
    }));
    expect(response.status).toBe(401);
  });
});
