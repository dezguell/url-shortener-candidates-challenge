import { describe, it, expect, vi } from "vitest";
import { withRetries } from "../../services/with-retries";

describe("withRetries", () => {
  it("returns the result on the first successful attempt", async () => {
    const attempt = vi.fn().mockResolvedValue("ok");
    const result = await withRetries(attempt, () => true);
    expect(result).toBe("ok");
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it("retries after a retryable failure and eventually succeeds", async () => {
    const attempt = vi
      .fn()
      .mockRejectedValueOnce(new Error("collision"))
      .mockRejectedValueOnce(new Error("collision"))
      .mockResolvedValue("ok");

    const result = await withRetries(attempt, () => true);
    expect(result).toBe("ok");
    expect(attempt).toHaveBeenCalledTimes(3);
  });

  it("rethrows immediately when the error is not retryable", async () => {
    const error = new Error("fatal");
    const attempt = vi.fn().mockRejectedValue(error);

    await expect(withRetries(attempt, () => false)).rejects.toBe(error);
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it("throws the last error once maxAttempts is exhausted", async () => {
    const error = new Error("always collides");
    const attempt = vi.fn().mockRejectedValue(error);

    await expect(withRetries(attempt, () => true, 3)).rejects.toBe(error);
    expect(attempt).toHaveBeenCalledTimes(3);
  });
});
