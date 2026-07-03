export interface ShortenedUrl {
  code: string;
  url: string;
  createdAt: Date;
}

export interface UrlRepository {
  /**
   * Persists `url` under a code from `generateCode`, retrying with a fresh
   * code on collision. Resolves with the code that was actually stored.
   */
  saveWithUniqueCode(url: string, generateCode: () => string): Promise<string>;
  findByCode(code: string): Promise<string | null>;
  findByUrl(url: string): Promise<ShortenedUrl | null>;
  findAll(): Promise<ShortenedUrl[]>;
}
