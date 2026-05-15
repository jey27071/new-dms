import { redirect } from "next/navigation";
import { UserSidebar } from "@/components/user-sidebar";
import { Topbar } from "@/components/topbar";
import { getRole, getEmail } from "@/lib/auth";

export default function UserShellLayout({ children }: { children: React.ReactNode }) {
  const role = getRole();
  if (!role) {
    redirect("/login");
  }
  const email = getEmail() ?? "";

  return (
    <>
      <UserSidebar role={role} email={email} />
      <Topbar area="user" />
      <main className="ml-[240px] pt-24 pb-xl px-xl min-h-screen">{children}</main>
    </>
  );
}
