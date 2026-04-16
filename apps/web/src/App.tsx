import { useState } from "react";
import ShortenerForm from "./components/ShortenerForm";
import ShortUrlResult from "./components/ShortUrlResult";

function App() {
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a1128] flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-wide">
        URL SHORTENRR
      </h1>
      <ShortenerForm onResult={setShortUrl} />
      {shortUrl && <ShortUrlResult shortUrl={shortUrl} />}
    </div>
  );
}

export default App;
