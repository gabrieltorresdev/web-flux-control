"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils";
import { icons, LucideProps, LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

type IconName = keyof typeof icons;
type IconsList = { icon: IconName, alias?: string[] }[];

const ICON_BUTTONS: IconsList = Object.keys(icons).map((icon) => ({
  icon: icon as IconName,
  alias: [] as string[]
}));

interface IconPickerProps extends Omit<React.ComponentPropsWithoutRef<typeof PopoverTrigger>, 'onSelect' | 'onOpenChange'> {
  value?: IconName
  defaultValue?: IconName
  onValueChange?: (value: IconName) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  searchable?: boolean
  searchPlaceholder?: string
  triggerPlaceholder?: string
  iconsList?: IconsList
}

const IconPicker = React.forwardRef<
  React.ComponentRef<typeof PopoverTrigger>,
  IconPickerProps
>(({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  children,
  searchable = true,
  searchPlaceholder = "Search for an icon...",
  triggerPlaceholder = "Select an icon",
  iconsList = ICON_BUTTONS,
  ...props
}, ref) => {
  const [selectedIcon, setSelectedIcon] = useState<IconName | undefined>(defaultValue)
  const [isOpen, setIsOpen] = useState(defaultOpen || false)

  const handleValueChange = (icon: IconName) => {
    if (value === undefined) {
      setSelectedIcon(icon)
    }
    onValueChange?.(icon)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setIsOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  const [search, setSearch] = useState("");
  const [displayCount, setDisplayCount] = useState(36);

  const filteredIcons = useMemo(() => 
    search.trim() === "" 
      ? iconsList 
      : iconsList.filter(({ icon, alias }) =>
          icon.toLowerCase().includes(search.toLowerCase().trim()) ||
          (alias || []).some(alias => alias.toLowerCase().includes(search.toLowerCase().trim()))
        ),
    [search, iconsList]
  );

  useEffect(() => {
    setDisplayCount(36);
  }, [search]);

  const displayedIcons = useMemo(() => 
    filteredIcons.slice(0, displayCount),
    [filteredIcons, displayCount]
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 36) {
      setDisplayCount(prev => Math.min(prev + 36, filteredIcons.length));
    }
  };

  return (
    <Popover open={open ?? isOpen} onOpenChange={handleOpenChange} modal>
      <PopoverTrigger ref={ref} asChild {...props}>
        {children || (
          <Button variant="outline">
            {(value || selectedIcon) ? (
              <>
                <Icon name={(value || selectedIcon)!} /> {value || selectedIcon}
              </>
            ) : (
              triggerPlaceholder
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-2">
        {searchable && (
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
        )}
        <div
          className="grid grid-cols-4 gap-2 overflow-auto"
          onScroll={handleScroll}
        >
          {displayedIcons.map(({ icon }) => (
            <TooltipProvider key={icon}>
              <Tooltip>
                <TooltipTrigger
                  className={cn(
                    "p-2 rounded-md border hover:bg-foreground/10 transition",
                    "flex items-center justify-center"
                  )}
                  onClick={() => {
                    handleValueChange(icon);
                    setIsOpen(false);
                    setDisplayCount(36);
                    setSearch("");
                  }}>
                  <Icon name={icon} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{icon}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {filteredIcons.length === 0 && (
            <div className="text-center text-gray-500 col-span-4">
              No icon found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});
IconPicker.displayName = "IconPicker";

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

const Icon = React.forwardRef<
  React.ComponentRef<LucideIcon>,
  IconProps
>(({ name, ...props }, ref) => {
  const LucideIcon = icons[name];
  return <LucideIcon ref={ref} {...props} />;
});
Icon.displayName = "Icon";

export { IconPicker, Icon, type IconsList, type IconName };