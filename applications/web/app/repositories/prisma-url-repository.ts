import { Prisma } from "@prisma/client";
import type { ShortenedUrl, UrlRepository } from "@url-shortener/engine";
import { withRetries } from "@url-shortener/engine";
import { db } from "~/db.server";

function isUniqueCodeViolation(error: any): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    (error.meta?.target as string[] | undefined)?.includes("code") === true
  );
}

export class PrismaUrlRepository implements UrlRepository {
  async saveWithUniqueCode(url: string, generateCode: () => string): Promise<string> {
    return withRetries(
      async () => {
        const code = generateCode();
        await db.shortenedUrl.create({ data: { code, url } });
        return code;
      },
      isUniqueCodeViolation,
    );
  }

  async findByCode(code: string): Promise<string | null> {
    const record = await db.shortenedUrl.findUnique({
      where: { code },
      select: { url: true },
    });
    return record?.url ?? null;
  }

  async findByUrl(url: string): Promise<ShortenedUrl | null> {
    return db.shortenedUrl.findFirst({
      where: { url },
      select: { code: true, url: true, createdAt: true },
    });
  }

  async findAll(): Promise<ShortenedUrl[]> {
    return db.shortenedUrl.findMany({
      select: { code: true, url: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
