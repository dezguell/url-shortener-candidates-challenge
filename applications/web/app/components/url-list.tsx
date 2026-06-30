import type { ShortenedUrl } from "@url-shortener/engine";

interface UrlListProps {
  urls: ShortenedUrl[];
}

export function UrlList({ urls }: UrlListProps) {
  if (urls.length === 0) return null;

  return (
    <div className="mt-8 w-full max-w-lg">
      <h2 className="text-2xl font-mono font-bold text-white mb-4">
        Stored URLs ({urls.length})
      </h2>
      <div className="flex flex-col gap-2">
        {urls.map((entry) => (
          <div
            key={entry.code}
            className="bg-white p-3 rounded border-2 border-black flex flex-col gap-1"
          >
            <a
              href={`/s/${entry.code}`}
              className="font-mono text-blue-700 font-bold text-sm"
            >
              /s/{entry.code}
            </a>
            <span className="text-gray-600 text-xs truncate">{entry.url}</span>
            <span className="text-gray-400 text-xs">
              {new Date(entry.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
