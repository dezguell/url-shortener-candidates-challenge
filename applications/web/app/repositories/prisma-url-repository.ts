import type { UrlRepository } from "@url-shortener/engine";
import { db } from "~/db.server";

export class PrismaUrlRepository implements UrlRepository {
  async save(code: string, url: string): Promise<void> {
    await db.shortenedUrl.create({ data: { code, url } });
  }

  async findByCode(code: string): Promise<string | null> {
    const record = await db.shortenedUrl.findUnique({
      where: { code },
      select: { url: true },
    });
    return record?.url ?? null;
  }
}
