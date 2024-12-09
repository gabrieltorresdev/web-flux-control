"use client";

import { LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent } from "../ui/sidebar";

const menuItems = [{ icon: LayoutDashboard, label: "Dashboard", href: "/" }];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                    "transition-colors duration-200",
                    "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    isActive && "bg-gray-100 text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
