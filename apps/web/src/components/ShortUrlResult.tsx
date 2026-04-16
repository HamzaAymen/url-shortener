import { useState } from "react";
import { Copy, Checkmark } from "@carbon/icons-react";

type Props = {
  shortUrl: string;
};

function ShortUrlResult({ shortUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
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
  );
}

export default ShortUrlResult;
