"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterButtonProps extends React.ComponentProps<typeof Button> {
  active?: boolean;
}

export const FilterButton = React.forwardRef<
  HTMLButtonElement,
  FilterButtonProps
>(({ className, active, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="icon"
    className={cn(
      "h-5 w-5 p-0 hover:bg-background/50 transition-all duration-200",
      "opacity-50 hover:opacity-100 hover:scale-110 active:scale-90",
      active && "opacity-100",
      className
    )}
    {...props}
  />
));

FilterButton.displayName = "FilterButton";