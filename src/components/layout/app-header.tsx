"use client";

import { LayoutDashboard, Tags, Settings, Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { ThemeToggle } from "../theme/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Tags, label: "Categorias", href: "/dashboard/categories" },
];

export function AppHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const Logo = () => (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="bg-primary/10 dark:bg-primary/20 w-8 h-8 rounded-lg flex items-center justify-center">
        <span className="text-primary font-semibold text-lg">F</span>
      </div>
      <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        FluxControl
      </h1>
    </Link>
  );

  return (
    <div className="sticky top-0 z-20 bg-background/60 backdrop-blur-xl border-b">
      <header className="h-16 flex items-center px-3 max-w-4xl mx-auto">
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetHeader>
              <SheetTitle />
              <SheetDescription />
            </SheetHeader>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="h-16 flex items-center mb-4">
                <Logo />
              </div>
              <div className="flex flex-col">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 rounded-lg text-sm",
                          "transition-colors duration-150",
                          "hover:bg-muted",
                          isActive
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1">
          <Logo />
        </div>

        <div className="hidden md:flex items-center gap-6 mr-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("relative group", isActive && "text-primary")}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                <div
                  className={cn(
                    "absolute -bottom-[1.5rem] left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200",
                    isActive && "scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard/settings">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full hover:bg-primary/10",
                pathname.startsWith("/dashboard/settings") &&
                  "bg-primary/10 text-primary"
              )}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configurações</span>
            </Button>
          </Link>
        </div>
      </header>
    </div>
  );
}
