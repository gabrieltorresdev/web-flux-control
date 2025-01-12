import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[100px]">
      <Loader2
        className={cn("animate-spin text-muted-foreground", className)}
        size={size}
      />
    </div>
  );
}
