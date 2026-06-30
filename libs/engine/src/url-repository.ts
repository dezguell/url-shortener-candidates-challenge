export interface ShortenedUrl {
  code: string;
  url: string;
  createdAt: Date;
}

export interface UrlRepository {
  save(code: string, url: string): Promise<void>;
  findByCode(code: string): Promise<string | null>;
  findByUrl(url: string): Promise<ShortenedUrl | null>;
  findAll(): Promise<ShortenedUrl[]>;
}
