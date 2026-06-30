import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { PrismaUrlRepository } from "~/repositories/prisma-url-repository";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  const repo = new PrismaUrlRepository();
  const url = await repo.findByCode(code);

  if (!url) {
    return redirect("/not-found");
  }

  return redirect(url);
}
