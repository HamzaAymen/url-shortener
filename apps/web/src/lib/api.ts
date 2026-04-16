const API_URL = import.meta.env.VITE_API_URL ?? "";
const SHORT_BASE = import.meta.env.VITE_SHORT_URL_BASE || window.location.origin;

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

export async function shortenUrl(originalUrl: string): Promise<string> {
  const res = await fetch(`${API_URL}/shorten`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalUrl }),
  });

  if (!res.ok) throw new Error(await parseError(res));

  const data = await res.json();
  return `${SHORT_BASE}/${data.shortCode}`;
}
