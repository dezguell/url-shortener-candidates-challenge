import { describe, expect, it } from "vitest";
import { RouterContextProvider } from "react-router";
import type { UrlRepository } from "@url-shortener/engine";
import { urlRepositoryContext } from "~/server/url-repository.server";
import { action, loader } from "./_index";

function fakeRepository(overrides: Partial<UrlRepository> = {}): UrlRepository {
  return {
    saveWithUniqueCode: async (_url, generateCode) => generateCode(),
    findByCode: async () => null,
    findByUrl: async () => null,
    findAll: async () => [],
    ...overrides,
  };
}

function contextWith(repo: UrlRepository) {
  return new RouterContextProvider(new Map([[urlRepositoryContext, repo]]));
}

describe("_index route", () => {
  it("loader lists urls from whatever repository is injected via context", async () => {
    const repo = fakeRepository({
      findAll: async () => [{ code: "abc1234", url: "https://example.com", createdAt: new Date() }],
    });

    const result = await loader({ context: contextWith(repo) } as any);

    expect(result.urls).toEqual([
      expect.objectContaining({ code: "abc1234", url: "https://example.com" }),
    ]);
  });

  it("action never touches the repository when the url fails validation", async () => {
    let saveCalled = false;
    const repo = fakeRepository({
      saveWithUniqueCode: async (_url, generateCode) => {
        saveCalled = true;
        return generateCode();
      },
    });
    const formData = new FormData();
    formData.set("url", "not-a-url");
    const request = new Request("http://localhost/", { method: "POST", body: formData });

    const result = await action({ request, context: contextWith(repo) } as any);

    expect(result).toEqual({ error: expect.any(String) });
    expect(saveCalled).toBe(false);
  });

  it("action persists a valid url through the injected repository", async () => {
    const repo = fakeRepository();
    const formData = new FormData();
    formData.set("url", "https://example.com");
    const request = new Request("http://localhost/", { method: "POST", body: formData });

    const result = await action({ request, context: contextWith(repo) } as any);

    expect(result).toEqual(
      expect.objectContaining({ isDuplicate: false, shortenedUrl: expect.any(String) }),
    );
  });
});
