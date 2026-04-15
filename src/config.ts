export default function getConfig() {
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI is missing in .env");

  return {
    MONGODB_URI: process.env.MONGODB_URI,
    CACHED_TTL: 60 * 60 * 24,
  };
}
