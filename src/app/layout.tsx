import type { Metadata } from "next";
import { Providers } from "./providers";
import { Toaster } from "@/shared/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flux Control",
  description: "Gerencie suas finanças de forma inteligente",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <main className="min-h-screen w-full">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
