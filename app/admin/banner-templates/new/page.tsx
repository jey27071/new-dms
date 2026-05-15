import { BannerTemplateForm } from "@/components/banner-template-form";
import { getEmail } from "@/lib/auth";

export default function NewBannerTemplatePage() {
  const email = getEmail() ?? "admin@dms.local";
  return <BannerTemplateForm mode="create" createdBy={email} />;
}
