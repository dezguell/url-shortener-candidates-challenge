import { useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { baseUrl, generateShortCode, validateUrl } from "@url-shortener/engine";
import { PrismaUrlRepository } from "~/repositories/prisma-url-repository";
import { ShortenForm } from "~/components/shorten-form";
import { ShortenResult } from "~/components/shorten-result";
import { UrlList } from "~/components/url-list";

export async function loader() {
  const repo = new PrismaUrlRepository();
  const urls = await repo.findAll();
  return {
    baseUrl: baseUrl ? baseUrl + "/s/" : "-",
    urls,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;

  const validationError = validateUrl(url);
  if (validationError) {
    return { error: validationError };
  }

  const repo = new PrismaUrlRepository();

  const existing = await repo.findByUrl(url);
  if (existing) {
    return { shortenedUrl: `${baseUrl}/s/${existing.code}`, isDuplicate: true };
  }

  let shortCode: string;
  try {
    shortCode = await repo.saveWithUniqueCode(url, generateShortCode);
  } catch {
    return { error: "Could not generate a short code, please try again." };
  }

  return { shortenedUrl: `${baseUrl}/s/${shortCode}`, isDuplicate: false };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl, urls } = loaderData;
  const actionData = useActionData<typeof action>();

  if (!actionData){
    return (
      <main className="min-h-screen bg-[--background] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg flex flex-col gap-0">
          <ShortenForm baseUrl={baseUrl} />
          <UrlList urls={urls} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[--background] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg flex flex-col gap-0">
        <ShortenForm baseUrl={baseUrl} error={actionData.error} />
        <ShortenResult shortenedUrl={actionData.shortenedUrl} isDuplicate={actionData.isDuplicate} />
        <UrlList urls={urls} />
      </div>
    </main>
  );
}
