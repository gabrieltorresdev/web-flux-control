"use client";

import { Separator } from "@/components/ui/separator";
import { format, parse } from "date-fns";

interface TransactionItemProps {
  description: string;
  time: string;
  amount: string;
  category: {
    name: string;
    color: string;
  };
}

export function DashboardOverviewRecentTransactionsItem({
  description,
  time,
  amount,
  category,
}: TransactionItemProps) {
  const amountNumber = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
  const isNegative = amountNumber < 0;

  const amountClass = isNegative ? "text-red-600" : "text-green-600";
  const amountSign = isNegative ? "-" : "+";

  return (
    <div className="flex">
      <div className="flex gap-2 flex-1">
        <Separator orientation="vertical" />
        <div className="flex justify-between items-center flex-1 py-2">
          <div className="flex flex-col">
            <span
              style={{ color: category.color }}
              className="text-xs/3 font-medium"
            >
              {category.name}
            </span>
            <div className="text-base font-light">{description}</div>
            <div className="flex items-baseline gap-2">
              <div className="text-xs opacity-50">
                {format(parse(time, "HH:mm", new Date()), "HH'h'mm")}
              </div>
            </div>
          </div>
          <div className={`font-medium ${amountClass}`}>
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
