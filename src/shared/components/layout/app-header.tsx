"use client";

import {
  LayoutDashboard,
  Tags,
  Settings,
  Menu,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/utils";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { ThemeToggle } from "@/shared/components/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Wallet, label: "Transações", href: "/dashboard/transactions" },
  { icon: Tags, label: "Categorias", href: "/dashboard/categories" },
];

function useAvailableSpace() {
  const [menuState, setMenuState] = useState({ 
    visibleCount: menuItems.length,
    availableWidth: 0
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const itemWidths = useRef<number[]>([]);

  // Mede a largura de cada item do menu sem renderizá-los
  useLayoutEffect(() => {
    const measureElement = document.createElement('div');
    measureElement.style.cssText = 'position: absolute; visibility: hidden; top: -9999px;';
    document.body.appendChild(measureElement);

    // Mede cada item
    menuItems.forEach((item, index) => {
      measureElement.innerHTML = `
        <div class="flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap">
          <svg class="h-4 w-4"></svg>
          ${item.label}
        </div>
      `;
      itemWidths.current[index] = measureElement.firstElementChild?.getBoundingClientRect().width ?? 0;
    });

    document.body.removeChild(measureElement);
  }, []);

  // Calcula quantos itens cabem no espaço disponível
  useLayoutEffect(() => {
    const calculateVisibleItems = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const menuButtonWidth = menuButtonRef.current?.offsetWidth ?? 0;
      const menuButtonMargin = 16; // 2 * 8px (ml-2 class)
      const availableWidth = containerWidth - (menuButtonWidth + menuButtonMargin);

      let totalWidth = 0;
      let visibleCount = 0;

      for (let i = 0; i < itemWidths.current.length; i++) {
        const itemWidth = itemWidths.current[i];
        if (totalWidth + itemWidth <= availableWidth) {
          totalWidth += itemWidth;
          visibleCount++;
        } else {
          break;
        }
      }

      setMenuState({ visibleCount, availableWidth });
    };

    calculateVisibleItems();

    const observer = new ResizeObserver(calculateVisibleItems);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', calculateVisibleItems);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculateVisibleItems);
    };
  }, []);

  return { menuState, containerRef, menuButtonRef };
}

export function AppHeader() {
  const pathname = usePathname();
  const { menuState, containerRef, menuButtonRef } = useAvailableSpace();
  
  const visibleItems = menuItems.slice(0, menuState.visibleCount);
  const hiddenItems = menuItems.slice(menuState.visibleCount);

  const Logo = () => (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="bg-primary/10 dark:bg-primary/20 w-8 h-8 rounded-lg flex items-center justify-center">
        <span className="text-primary font-semibold text-lg">F</span>
      </div>
      <h1 className="text-lg font-semibold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        FluxControl
      </h1>
    </Link>
  );

  return (
    <div className="sticky top-0 z-20 flex flex-col">
      {/* Main Header */}
      <div className="bg-background/60 backdrop-blur-xl border-b">
        <header className="h-14 flex items-center px-3 max-w-7xl mx-auto">
          <div className="flex-1">
            <Logo />
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

      {/* Submenu */}
      <div className="bg-background border-b">
        <nav className="max-w-7xl mx-auto px-3 flex items-center justify-between">
          <div ref={containerRef} className="flex-1">
            <ul className="flex -mb-px">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm border-b-2 hover:border-gray-300 transition-colors whitespace-nowrap",
                        isActive
                          ? "border-primary text-primary font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Overflow Menu Button */}
          {hiddenItems.length > 0 && (
            <div ref={menuButtonRef} className="pl-2 border-l ml-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Mais itens</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {hiddenItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 w-full",
                            isActive && "text-primary font-medium"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
