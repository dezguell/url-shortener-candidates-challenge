export interface UrlRepository {
  save(code: string, url: string): Promise<void>;
  findByCode(code: string): Promise<string | null>;
}
