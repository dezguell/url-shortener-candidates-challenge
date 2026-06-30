import { isRouteErrorResponse } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

interface ErrorPageProps {
  error?: unknown;
  status?: number;
  title?: string;
  description?: string;
}

export function ErrorPage({
  error,
  status = 404,
  title = "Page not found",
  description = "The page you are looking for does not exist.",
}: ErrorPageProps) {
  let stack: string | undefined;

  if (error !== undefined) {
    if (isRouteErrorResponse(error)) {
      status = error.status;
      title = error.status === 404 ? "Page not found" : "Error";
      description =
        error.status === 404
          ? "The page you are looking for does not exist."
          : error.statusText || description;
    } else if (import.meta.env.DEV && error instanceof Error) {
      title = "Something went wrong";
      description = error.message;
      stack = error.stack;
    }
  }

  return (
    <main className="min-h-screen bg-[--background] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
          <p className="text-7xl font-bold text-[--border] tabular-nums">{status}</p>
          <div>
            <h1 className="text-xl font-semibold text-[--foreground] mb-1">{title}</h1>
            <p className="text-sm text-[--muted-foreground]">{description}</p>
          </div>
          {stack && (
            <pre className="w-full text-left text-xs text-[--destructive] bg-[--destructive]/5 border border-[--destructive]/20 p-4 rounded-lg overflow-x-auto">
              {stack}
            </pre>
          )}
          <Button asChild variant="outline">
            <a href="/">Back to home</a>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
