import { AssetForm } from "@/components/asset-form";
import { getEmail } from "@/lib/auth";

export default function NewAssetPage() {
  const email = getEmail() ?? "admin@dms.local";
  return <AssetForm mode="create" uploader={email} />;
}
