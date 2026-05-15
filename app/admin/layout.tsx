import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Topbar } from "@/components/topbar";
import { getRole, getEmail } from "@/lib/auth";

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const role = getRole();
  if (!role) {
    redirect("/login");
  }
  if (role !== "admin") {
    redirect("/");
  }
  const email = getEmail() ?? "";

  return (
    <>
      <AdminSidebar email={email} />
      <Topbar area="admin" />
      <main className="ml-[240px] pt-24 pb-xl px-xl min-h-screen">{children}</main>
    </>
  );
}
