"use client";

import { SidebarTrigger } from "../ui/sidebar";
import { NavigationMenu, NavigationMenuList } from "../ui/navigation-menu";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

const menuItems = [{ icon: LayoutDashboard, label: "Dashboard", href: "/" }];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-10 px-4 border-b-2 bg-white">
      <header className="h-16 flex items-center w-full">
        <SidebarTrigger />
        <div className="flex-1 ml-3">
          <h1 className="text-xl font-semibold">FluxControl</h1>
        </div>

        <div className="flex overflow-hidden rounded-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Settings size={16} />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
                <LogOut size={16} />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
