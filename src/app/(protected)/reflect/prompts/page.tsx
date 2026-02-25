import { PROMPTS_BY_CATEGORY, PROMPT_CATEGORIES } from "@/lib/writing-prompts";
import { PromptsBrowser } from "./prompts-browser";
import { BackLink } from "@/components/nav/back-link";

export default function PromptsPage() {
  return (
    <div className="space-y-4">
      <div>
        <BackLink href="/reflect" />
        <h1 className="heading-large text-neutral-900">Choose a Prompt</h1>
      </div>
      <PromptsBrowser
        categories={PROMPT_CATEGORIES}
        promptsByCategory={PROMPTS_BY_CATEGORY}
      />
    </div>
  );
}
