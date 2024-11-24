import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  breadcrumb,
  children,
}: Readonly<{
  breadcrumb: React.ReactNode;
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <main className="flex flex-col flex-1">
          <header className="flex gap-2 p-4 bg-background border-b border-primary/5 w-full">
            <SidebarTrigger />
            {breadcrumb}
          </header>
          <div className="p-4">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
