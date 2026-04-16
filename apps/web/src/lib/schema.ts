import { z } from "zod";

const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

export const schema = z.object({
  originalURL: z
    .string()
    .min(1, "URL is required")
    .regex(urlPattern, "Enter a valid URL (https://, http://, or example.com)"),
});

export type FormValues = z.infer<typeof schema>;
