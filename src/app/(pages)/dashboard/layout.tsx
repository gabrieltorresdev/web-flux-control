import type { Metadata } from "next";
import { AppHeader } from "@/shared/components/layout/app-header";
import { auth } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { DashboardStatusChecker } from "@/features/dashboard/components/status-checker";
import { SessionKeepAlive } from "@/shared/components/session/session-keep-alive";

export const metadata: Metadata = {
  title: "Dashboard - Flux Control",
  description: "Gerencie suas finanças de forma inteligente",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <DashboardStatusChecker />
      <SessionKeepAlive 
        refreshInterval={15 * 60 * 1000}  // 15 minutes in milliseconds
        idleTimeout={30 * 60 * 1000}      // 30 minutes in milliseconds
        activityCheckInterval={30 * 1000}  // 30 seconds in milliseconds
        showNotifications={false}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex-1 bg-muted/5 overflow-y-auto py-4 md:py-6 relative">
          {children}
        </div>
      </div>
    </>
  );
}
