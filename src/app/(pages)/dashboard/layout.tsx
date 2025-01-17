import type { Metadata } from "next";
import { AppHeader } from "@/shared/components/layout/app-header";
import { auth } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { DashboardStatusChecker } from "@/features/dashboard/components/status-checker";
import { FloatingAiAssistant } from "@/features/ai-assistant/components/floating-ai-assistant";

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
      <div className="flex flex-col h-screen w-full bg-background">
        <AppHeader className="border-b" />
        <div className="flex flex-1 min-h-0">
        <div className="hidden md:block w-[400px] border-l border-border/40 bg-muted/30 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
            <div className="h-full w-full overflow-hidden">
              <FloatingAiAssistant />
            </div>
          </div>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          
        </div>
      </div>
    </>
  );
}
