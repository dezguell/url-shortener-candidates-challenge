import { Form } from "react-router";
import { Link2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";

interface ShortenFormProps {
  baseUrl: string;
  error?: string;
}

export function ShortenForm({ baseUrl, error }: ShortenFormProps) {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-2 rounded-lg bg-[--secondary]">
            <Link2 className="h-6 w-6 text-[--foreground]" />
          </div>
        </div>
        <CardTitle className="text-2xl">URL Shortener</CardTitle>
        <CardDescription>Paste a long URL to create a short link</CardDescription>
      </CardHeader>

      <CardContent>
        <Form method="post" className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="url"
              name="url"
              placeholder="https://example.com/very/long/url"
              required
              className="flex-1"
            />
            <Button type="submit">Shorten</Button>
          </div>

          <p className="text-xs text-[--muted-foreground]">
            Short links will start with{" "}
            <span className="font-mono font-medium text-[--foreground]">{baseUrl}</span>
          </p>
        </Form>

        {error && (
          <div className="mt-4 rounded-md bg-[--destructive]/10 border border-[--destructive]/20 px-4 py-3">
            <p className="text-sm text-[--destructive]">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
