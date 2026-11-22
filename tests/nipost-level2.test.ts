import { afterEach, describe, expect, it } from "vitest";
import { parsePostcode } from "@/lib/code";
import { lookupPostcodeLevel2 } from "@/lib/nipost";

const originalMock = process.env.NIPOST_MOCK;

afterEach(() => {
  if (originalMock === undefined) delete process.env.NIPOST_MOCK;
  else process.env.NIPOST_MOCK = originalMock;
});

describe("NIPOST level 2 lookup", () => {
  it("decodes administrative address and house-address presence in mock mode", async () => {
    process.env.NIPOST_MOCK = "1";
    const code = parsePostcode("FC-03-B06-AG-12");
    expect(code).not.toBeNull();

    const result = await lookupPostcodeLevel2(code!);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.valid).toBe(true);
    expect(result.data.administrative_address).toMatchObject({
      state_name: "FEDERAL CAPITAL TERRITORY",
      lga_name: "BWARI",
    });
    expect(result.data.recent_house_address).toBe("PLOT 12, AG CLOSE, ABUJA");
  });

  it("does not invent level 2 address fields for an unassigned postcode", async () => {
    process.env.NIPOST_MOCK = "1";
    const code = parsePostcode("FC-03-B06-AG-99");
    expect(code).not.toBeNull();

    const result = await lookupPostcodeLevel2(code!);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.valid).toBe(false);
    expect(result.data.administrative_address).toBeNull();
    expect(result.data.recent_house_address).toBeNull();
  });
});
