import { PageHeader } from "@/components/ui";
import { PROMPTS_BY_CATEGORY, PROMPT_CATEGORIES } from "@/lib/writing-prompts";
import { PromptsBrowser } from "./prompts-browser";

export default function PromptsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Choose a Prompt" backHref="/reflect" backLabel="Back to reflect" />
      <PromptsBrowser
        categories={PROMPT_CATEGORIES}
        promptsByCategory={PROMPTS_BY_CATEGORY}
      />
    </div>
  );
}
