const ALLOWED_PROTOCOLS = ["http:", "https:"];

export function validateUrl(url: string): string | null {
  if (!url) return "URL is required";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "Must be a valid URL including protocol (e.g. https://example.com)";
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return "Only http and https URLs are allowed";
  }

  return null;
}
