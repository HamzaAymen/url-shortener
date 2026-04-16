import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema, type FormValues } from "../lib/schema";
import { shortenUrl } from "../lib/api";

type Props = {
  onResult: (shortUrl: string) => void;
};

function ShortenerForm({ onResult }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setApiError(null);

    try {
      const shortUrl = await shortenUrl(values.originalURL);
      onResult(shortUrl);
    } catch (err) {
      if (err instanceof Error && err.message) {
        setApiError(err.message);
      } else {
        setApiError("Network error. Please check your connection and try again.");
      }
    }
  };

  return (
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
        <p role="alert" className="text-red-400 text-sm self-start">
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
  );
}

export default ShortenerForm;
