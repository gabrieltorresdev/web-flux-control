"use client";

import { useSidebarStore } from "@/stores/sidebar";
import { SidebarTrigger } from "../ui/sidebar";

export default function AppHeader() {
  const { toggle } = useSidebarStore();

  return (
    <header className="h-16 flex items-center px-4 w-full">
      <SidebarTrigger onClick={toggle} />
      <div className="flex-1 ml-2">
        <h1 className="text-xl font-semibold">FluxControl</h1>
      </div>
    </header>
  );
}
