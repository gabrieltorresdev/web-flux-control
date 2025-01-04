import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowDownRight,
  ArrowUpCircle,
  ArrowUpRight,
  BellRing,
  Book,
  Calendar,
  Camera,
  Car,
  Coffee,
  CreditCard,
  DollarSign,
  Gift,
  Globe,
  Heart,
  Home,
  Laptop,
  Music,
  Phone,
  Pizza,
  ShoppingBag,
  Star,
  Ticket,
  Umbrella,
  Wallet,
} from "lucide-react";

const LUCIDE_ICONS = {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  BellRing,
  Book,
  Calendar,
  Camera,
  Car,
  Coffee,
  CreditCard,
  DollarSign,
  Gift,
  Globe,
  Heart,
  Home,
  Laptop,
  Music,
  Phone,
  Pizza,
  ShoppingBag,
  Star,
  Ticket,
  Umbrella,
  Wallet,
};

interface CategoryIconProps {
  icon?: string;
  isIncome?: boolean;
  className?: string;
  iconClassName?: string;
}

export function CategoryIcon({
  icon,
  isIncome,
  className,
  iconClassName,
}: CategoryIconProps) {
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
        isIncome
          ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400"
          : "bg-rose-500/10 text-rose-500 dark:bg-rose-400/10 dark:text-rose-400",
        className
      )}
      aria-hidden="true"
    >
      {icon ? (
        icon.startsWith("emoji:") ? (
          <span className={cn("text-sm", iconClassName)}>
            {icon.replace("emoji:", "")}
          </span>
        ) : (
          (() => {
            const IconComponent =
              LUCIDE_ICONS[icon as keyof typeof LUCIDE_ICONS];
            return IconComponent ? (
              <IconComponent
                className={cn("h-[18px] w-[18px]", iconClassName)}
              />
            ) : null;
          })()
        )
      ) : isIncome ? (
        <ArrowUpRight className={cn("h-[18px] w-[18px]", iconClassName)} />
      ) : (
        <ArrowDownRight className={cn("h-[18px] w-[18px]", iconClassName)} />
      )}
    </div>
  );
}
