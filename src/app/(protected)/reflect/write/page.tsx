import { Card } from "@/components/ui";
import { WritingForm } from "./writing-form";
import { BackLink } from "@/components/nav/back-link";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; prompt?: string }>;
}) {
  const { type = "freewrite", prompt } = await searchParams;
  const title = type === "prompted" ? "Prompted" : "Free Write";

  return (
    <div className="space-y-4">
      <div>
        <BackLink href="/reflect" />
        <h1 className="heading-large text-neutral-900">{title}</h1>
      </div>

      {prompt ? (
        <Card variant="tintAccent">
          <p className="text-small text-neutral-900">{prompt}</p>
        </Card>
      ) : null}

      <WritingForm type={type} prompt={prompt ?? null} />
    </div>
  );
}
