import { Form } from "react-router";

interface ShortenFormProps {
  baseUrl: string;
  error?: string;
}

export function ShortenForm({ baseUrl, error }: ShortenFormProps) {
  return (
    <div className="bg-yellow-300 p-12 rounded-none border-8 border-dashed border-purple-600 w-full max-w-lg rotate-1 shadow-2xl shadow-red-500">
      <h1 className="text-4xl font-mono italic text-center mb-8 text-fuchsia-600 underline decoration-wavy decoration-green-500 tracking-widest">
        ~*~ URL Shortener ~*~
      </h1>

      <Form method="post" className="flex flex-col gap-6">
        <input
          type="text"
          name="url"
          placeholder="Enter your URL here..."
          required
          className="w-full px-4 py-3 text-base bg-orange-200 border-4 border-blue-600 text-purple-800 placeholder-red-400 rounded focus:outline-none"
        />

        <div>
          <button
            type="submit"
            className="w-full px-4 py-3 text-base bg-red-500 hover:bg-lime-500 text-yellow-200 border-4 border-teal-400 rounded-full skew-x-3 cursor-pointer"
          >
            ★ SHORTEN IT ★
          </button>
          <p className="text-sm text-indigo-800 mt-3 text-center font-bold bg-cyan-200 p-2 border-2 border-dotted border-orange-500">
            Your shortened URL will start with {baseUrl}
          </p>
        </div>
      </Form>

      {error && (
        <div className="mt-8 p-4 bg-lime-500 rounded-none border-8 border-solid border-red-700">
          <p className="text-2xl text-blue-800 font-black">{error}</p>
        </div>
      )}
    </div>
  );
}
