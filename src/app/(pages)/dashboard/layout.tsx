import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/app-header";

export const metadata: Metadata = {
  title: "Dashboard - Flux Control",
  description: "Gerencie suas finanças de forma inteligente",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-100/70  min-h-screen w-full">
        <AppHeader />
        <div className="flex-1 overflow-y-auto py-3 md:py-6 relative">
          {children}
        </div>
      </div>
    </>
  );
}
