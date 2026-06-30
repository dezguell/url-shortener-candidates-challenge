interface ShortenResultProps {
  shortenedUrl?: string;
}

export function ShortenResult({ shortenedUrl }: ShortenResultProps) {
  if (!shortenedUrl) return null;

  return (
    <div className="mt-8 p-4 bg-violet-400 rounded-3xl border-4 border-double border-yellow-500 -rotate-1 w-full max-w-lg">
      <p className="text-lg text-lime-300 mb-2 font-black uppercase">
        Your shortened URL:
      </p>
      <a
        href={shortenedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-red-200 break-all font-mono text-xl hover:text-blue-900 bg-pink-600 p-2 block"
      >
        {shortenedUrl}
      </a>
    </div>
  );
}
