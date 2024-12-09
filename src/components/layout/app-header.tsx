"use client";

import { useSidebarStore } from "@/stores/sidebar";
import { SidebarTrigger } from "../ui/sidebar";
import { NavigationMenu, NavigationMenuList } from "../ui/navigation-menu";
import { LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const menuItems = [{ icon: LayoutDashboard, label: "Dashboard", href: "/" }];

export default function AppHeader() {
  const { toggle } = useSidebarStore();
  const pathname = usePathname();

  return (
    <div className="px-4 border-b-2 bg-white">
      <header className="h-16 flex items-center w-full">
        <SidebarTrigger onClick={toggle} variant={"outline"} />
        <div className="flex-1 ml-3">
          <h1 className="text-xl font-semibold">FluxControl</h1>
        </div>
      </header>
      <div className="hidden md:block">
        <NavigationMenu>
          <NavigationMenuList>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    isActive &&
                      "text-gray-900 before:absolute before:bottom-0 before:bg-primary before:h-0.5 before:inset-x-0"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 mb-3 rounded-md text-sm font-medium",
                      "transition-colors duration-200",
                      "text-gray-600 hover:bg-gray-100 hover:text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
