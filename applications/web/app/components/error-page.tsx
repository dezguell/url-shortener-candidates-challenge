import { isRouteErrorResponse } from "react-router";

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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <p className="text-6xl font-bold text-gray-300 mb-4">{status}</p>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-500 mb-8">{description}</p>
        {stack && (
          <pre className="mb-8 text-left text-xs text-red-600 bg-red-50 p-4 rounded-lg overflow-x-auto">
            {stack}
          </pre>
        )}
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
