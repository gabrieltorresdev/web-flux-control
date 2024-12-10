"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
