import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, Checkmark } from "@carbon/icons-react";

async function parseError(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  } else {
    const text = await res.text().catch(() => "");
    if (text) return text;
  }
  return "Something went wrong. Please try again.";
}

const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

const schema = z.object({
  originalURL: z
    .string()
    .min(1, "URL is required")
    .regex(urlPattern, "Enter a valid URL (https://, http://, or example.com)"),
});

type FormValues = z.infer<typeof schema>;

function App() {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleCopy = async () => {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    setShortUrl(null);

    try {
      const res = await fetch("/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: values.originalURL }),
      });

      if (!res.ok) {
        setApiError(await parseError(res));
        return;
      }

      const data = await res.json();
      setShortUrl(`${window.location.origin}/${data.shortCode}`);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1128] flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-wide">
        URL SHORTENRR
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md flex flex-col items-center gap-4"
      >
        <input
          type="text"
          placeholder="Add your full URL"
          {...register("originalURL")}
          className="w-full px-4 py-3 rounded-lg bg-[#1b2a4e] text-white placeholder-slate-400 border border-slate-600 focus:outline-none focus:border-blue-400"
        />
        {errors.originalURL && (
          <p className="text-red-400 text-sm self-start">
            {errors.originalURL.message}
          </p>
        )}
        {apiError && (
          <p
            role="alert"
            className="text-red-400 text-sm self-start"
          >
            {apiError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50"
        >
          Shorten the URL
        </button>
      </form>
      {shortUrl && (
        <div className="w-full max-w-md mt-6 flex items-center gap-2">
          <div className="flex-1 px-4 py-3 rounded-lg bg-[#1b2a4e] border border-slate-600">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 break-all"
            >
              {shortUrl}
            </a>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy to clipboard"}
            className="p-3 rounded-lg bg-[#1b2a4e] border border-slate-600 text-slate-300 hover:text-white hover:border-blue-400 cursor-pointer transition-colors"
          >
            {copied ? <Checkmark size={20} /> : <Copy size={20} />}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
