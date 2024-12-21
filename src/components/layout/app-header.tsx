"use client";

import { NavigationMenu, NavigationMenuList } from "../ui/navigation-menu";
import { LayoutDashboard, Tags } from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { usePathname } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Tags, label: "Categorias", href: "/categories" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-10 px-4 border-b-2 bg-white">
      <header className="h-12 flex items-center w-full">
        <div className="flex-1">
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
                      "before:absolute before:bottom-0 before:bg-primary before:h-0.5 before:inset-x-0 relative"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 mb-3 rounded-lg text-sm font-medium",
                      "transition-colors duration-200",
                      "text-gray-600 hover:bg-gray-100 hover:text-primary",
                      isActive && "text-gray-950 bg-gray-100"
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
