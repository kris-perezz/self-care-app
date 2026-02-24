import { Card, PageHeader } from "@/components/ui";
import { WritingForm } from "./writing-form";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; prompt?: string }>;
}) {
  const { type = "freewrite", prompt } = await searchParams;

  return (
    <div className="space-y-4">
      <PageHeader
        title={type === "prompted" ? "Prompted" : "Free Write"}
        backHref="/reflect"
        backLabel="Back to reflect"
      />

      {prompt ? (
        <Card variant="tintAccent">
          <p className="text-small text-neutral-900">{prompt}</p>
        </Card>
      ) : null}

      <WritingForm type={type} prompt={prompt ?? null} />
    </div>
  );
}
