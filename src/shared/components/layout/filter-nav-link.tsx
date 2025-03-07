"use client";

import React, { useCallback } from "react";
import { useFilterNavigation } from "@/shared/hooks/use-filter-navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils";

interface FilterNavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  additionalParams?: Record<string, string>;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function FilterNavLink({
  href,
  children,
  additionalParams,
  className,
  activeClassName,
  inactiveClassName = "border-transparent text-muted-foreground hover:text-foreground",
  ...rest
}: FilterNavLinkProps) {
  const { navigateWithFilters } = useFilterNavigation();
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateWithFilters(href, { additionalParams });
  }, [href, additionalParams, navigateWithFilters]);

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        className,
        isActive ? activeClassName : inactiveClassName
      )}
      {...rest}
    >
      {children}
    </a>
  );
} 