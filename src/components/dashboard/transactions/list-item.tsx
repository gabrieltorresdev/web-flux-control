"use client";

import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";

interface TransactionItemProps {
  description: string;
  time: string;
  amount: string;
  category: {
    name: string;
    color: string;
  };
  subcategory: string;
}

export function DashboardTransactionsListItem({
  description,
  time,
  amount,
  category,
  subcategory,
}: TransactionItemProps) {
  const amountNumber = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
  const isNegative = amountNumber < 0;

  const amountClass = isNegative ? "text-red-600" : "text-green-600";
  const amountSign = isNegative ? "-" : "+";

  return (
    <div className="flex snap-start">
      <div className="flex gap-2 flex-1">
        <Separator orientation="vertical" className="w-px" />
        <div className="grid grid-flow-col auto-cols-auto items-center gap-2 flex-1 py-2">
          <div className="flex flex-col">
            <span
              style={{ color: category.color }}
              className="text-xs/3 font-medium truncate"
            >
              {category.name} - {subcategory}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-base font-light break-all line-clamp-1">
                    {description}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{description}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-baseline gap-2">
              <div className="text-xs opacity-50">
                {format(parse(time, "HH:mm", new Date()), "HH'h'mm")}
              </div>
            </div>
          </div>
          <div className={cn("font-medium text-end", amountClass)}>
            {amountSign}
            {Math.abs(amountNumber).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
