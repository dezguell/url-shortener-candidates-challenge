import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { urlRepositoryContext } from "~/server/url-repository.server";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { code } = params;

  const repo = context.get(urlRepositoryContext);
  const url = await repo.findByCode(code);

  if (!url) {
    return redirect("/not-found");
  }

  return redirect(url);
}
