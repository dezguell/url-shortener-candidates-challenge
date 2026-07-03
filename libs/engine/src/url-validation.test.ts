import { describe, it, expect } from "vitest";
import { validateUrl } from "./url-validation";

describe("validateUrl", () => {
  it("accepts a valid http URL", () => {
    expect(validateUrl("http://example.com")).toBeNull();
  });

  it("accepts a valid https URL", () => {
    expect(validateUrl("https://example.com/path?q=1")).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(validateUrl("")).not.toBeNull();
  });

  it("rejects a plain word with no protocol", () => {
    expect(validateUrl("notaurl")).not.toBeNull();
  });

  it("rejects a string that is only a domain with no protocol", () => {
    expect(validateUrl("example.com")).not.toBeNull();
  });

  it("rejects a javascript: URL", () => {
    expect(validateUrl("javascript:alert(1)")).not.toBeNull();
  });

  it("rejects an ftp URL", () => {
    expect(validateUrl("ftp://files.example.com")).not.toBeNull();
  });

  it("returns a string message on failure", () => {
    const result = validateUrl("bad");
    expect(typeof result).toBe("string");
  });
});
