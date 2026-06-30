import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

interface ShortenResultProps {
  shortenedUrl?: string;
  isDuplicate?: boolean;
}

export function ShortenResult({ shortenedUrl, isDuplicate }: ShortenResultProps) {
  if (!shortenedUrl) return null;

  return (
    <Card className={`w-full max-w-lg mt-4 ${isDuplicate ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          {isDuplicate ? (
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium mb-1 ${isDuplicate ? "text-amber-800" : "text-green-800"}`}>
              {isDuplicate ? "Already shortened" : "Link created"}
            </p>
            <a
              href={shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-sm font-mono hover:underline break-all ${isDuplicate ? "text-amber-700 hover:text-amber-900" : "text-green-700 hover:text-green-900"}`}
            >
              {shortenedUrl}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
