import { describe, expect, it } from "vitest";
import { compactCode, displayCode, parsePlaceCode, parsePostcode, postcodeError, randomSuffix, slugCode, SUFFIX_ALPHABET } from "@/lib/code";

describe("postcodes", () => {
  it("parses canonical, compact and lowercase forms", () => {
    expect(parsePostcode("FC-03-B06-AG-12")?.toString()).toBe("FC-03-B06-AG-12");
    expect(parsePostcode("fc03b06ag12")?.compact).toBe("FC03B06AG12");
    expect(parsePostcode("FC 03 B06 AG 12")?.compact).toBe("FC03B06AG12");
  });
  it("rejects malformed codes with a reason", () => {
    expect(parsePostcode("FC03B06AG1")).toBeNull();
    expect(postcodeError("XX")).toMatch(/11/);
    expect(postcodeError("FC-03-B06-AG-12")).toBeNull();
  });
});

describe("place codes", () => {
  const pc = { postcode: parsePostcode("FC-03-B06-AG-12")!, suffix: "7K" };
  it("formats all three forms", () => {
    expect(compactCode(pc)).toBe("FC03B06AG127K");
    expect(slugCode(pc)).toBe("FC03B06AG12-7K");
    expect(displayCode(pc)).toBe("FC-03-B06-AG-12 · 7K");
  });
  it("round-trips every form", () => {
    for (const f of ["FC03B06AG127K", "FC03B06AG12-7K", "FC-03-B06-AG-12 · 7K", "fc03b06ag12-7k"]) {
      const p = parsePlaceCode(f)!;
      expect(compactCode(p)).toBe("FC03B06AG127K");
    }
  });
  it("normalises look-alike characters in the suffix", () => {
    expect(parsePlaceCode("FC03B06AG12-O1")?.suffix).toBe("01");
    expect(parsePlaceCode("FC03B06AG12-IL")?.suffix).toBe("11");
  });
  it("rejects bad lengths and characters", () => {
    expect(parsePlaceCode("FC03B06AG12")).toBeNull();
    expect(parsePlaceCode("FC03B06AG12-7")).toBeNull();
    expect(parsePlaceCode("FC03B06AG12-UU")).toBeNull();
  });
  it("generates suffixes from the unambiguous alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const s = randomSuffix();
      expect(s).toHaveLength(2);
      for (const ch of s) expect(SUFFIX_ALPHABET).toContain(ch);
    }
  });
});
