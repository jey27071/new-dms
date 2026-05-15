import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <Topbar />
      <main className="ml-[240px] pt-24 pb-xl px-xl min-h-screen">{children}</main>
    </>
  );
}
