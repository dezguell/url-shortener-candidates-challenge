import { describe, it, expect } from "vitest";
import { generateShortCode } from "../../services/shortened-url";

describe("generateShortCode", () => {
  it("should generate a code of at least 6 characters", () => {
    const code = generateShortCode();
    expect(code.length).toBeGreaterThanOrEqual(6);
  });

  it("should only use alphanumeric characters", () => {
    const code = generateShortCode();
    expect(code).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it("should have enough entropy to avoid collisions across 1000 codes", () => {
    const codes = new Set(Array.from({ length: 1000 }, () => generateShortCode()));
    // With only 9 possible codes this would collapse to ~9 unique values
    expect(codes.size).toBeGreaterThan(900);
  });
});
