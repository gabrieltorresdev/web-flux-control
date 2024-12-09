"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarStore } from "@/stores/sidebar";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const { isOpen } = useSidebarStore();
  return <SidebarProvider open={isOpen}>{children}</SidebarProvider>;
}
