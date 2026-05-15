import { NoticeTemplateForm } from "@/components/notice-template-form";
import { getEmail } from "@/lib/auth";

export default function NewNoticeTemplatePage() {
  const email = getEmail() ?? "admin@dms.local";
  return <NoticeTemplateForm mode="create" createdBy={email} />;
}
