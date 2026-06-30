import { useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { baseUrl, generateShortCode } from "@url-shortener/engine";
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

  if (!url) {
    return { error: "URL is required" };
  }

  const shortCode = generateShortCode();
  const repo = new PrismaUrlRepository();
  await repo.save(shortCode, url);

  return { shortenedUrl: `${baseUrl}/s/${shortCode}` };
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

  return (
    <main className="min-h-screen bg-[--background] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg flex flex-col gap-0">
        <ShortenForm baseUrl={baseUrl} error={actionData?.error} />
        <ShortenResult shortenedUrl={actionData?.shortenedUrl} />
        <UrlList urls={urls} />
      </div>
    </main>
  );
}
