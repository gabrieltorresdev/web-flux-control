import * as React from "react";
import { cn } from "@/shared/utils";
import { XCircle } from "lucide-react";

interface InlineAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
}

export function InlineAlert({
  message,
  className,
  ...props
}: InlineAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-sm text-white",
        className
      )}
      {...props}
    >
      <XCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
