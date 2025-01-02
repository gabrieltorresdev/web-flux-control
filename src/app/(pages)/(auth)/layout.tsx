import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Flux Control",
  description: "Authentication pages for Flux Control",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
