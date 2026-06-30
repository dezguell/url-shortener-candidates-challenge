import type { ShortenedUrl } from "@url-shortener/engine";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface UrlListProps {
  urls: ShortenedUrl[];
}

export function UrlList({ urls }: UrlListProps) {
  if (urls.length === 0) return null;

  return (
    <Card className="w-full max-w-lg mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent links</CardTitle>
          <Badge variant="secondary">{urls.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-[--border]">
          {urls.map((entry) => (
            <li key={entry.code} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <a
                    href={`/s/${entry.code}`}
                    className="inline-flex items-center gap-1 text-sm font-mono font-medium text-[--foreground] hover:underline"
                  >
                    /s/{entry.code}
                    <ExternalLink className="h-3 w-3 text-[--muted-foreground]" />
                  </a>
                  <p className="text-xs text-[--muted-foreground] truncate mt-0.5">
                    {entry.url}
                  </p>
                </div>
                <time className="text-xs text-[--muted-foreground] shrink-0 mt-0.5">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
