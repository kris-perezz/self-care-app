import Link from "next/link";
import { WritingForm } from "./writing-form";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; prompt?: string }>;
}) {
  const { type = "freewrite", prompt } = await searchParams;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/reflect"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/50"
          aria-label="Back to reflect"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">
          {type === "prompted" ? "Prompted" : "Free Write"}
        </h2>
      </div>

      {prompt && (
        <div className="rounded-2xl bg-white p-4" style={{ background: "linear-gradient(135deg, #ffe4fa, #ffc4eb)" }}>
          <p className="text-sm font-medium text-pink-900">{prompt}</p>
        </div>
      )}

      <WritingForm type={type} prompt={prompt ?? null} />
    </div>
  );
}
