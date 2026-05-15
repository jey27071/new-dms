import { PromptForm } from "@/components/prompt-form";
import { getEmail } from "@/lib/auth";

export default function NewPromptPage() {
  const email = getEmail() ?? "admin@dms.local";
  return <PromptForm mode="create" createdBy={email} />;
}
