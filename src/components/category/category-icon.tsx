import { cn } from "@/src/lib/utils";
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
        isIncome ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600",
        className
      )}
      aria-hidden="true"
    >
      {icon ? (
        icon.startsWith("emoji:") ? (
          <span className={cn("text-lg", iconClassName)}>
            {icon.replace("emoji:", "")}
          </span>
        ) : (
          (() => {
            const IconComponent =
              LUCIDE_ICONS[icon as keyof typeof LUCIDE_ICONS];
            return IconComponent ? (
              <IconComponent className={cn("h-5 w-5", iconClassName)} />
            ) : null;
          })()
        )
      ) : isIncome ? (
        <ArrowUpRight className={cn("h-5 w-5", iconClassName)} />
      ) : (
        <ArrowDownRight className={cn("h-5 w-5", iconClassName)} />
      )}
    </div>
  );
}
