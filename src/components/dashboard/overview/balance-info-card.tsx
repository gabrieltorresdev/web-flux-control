"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

interface BalanceInfoCardProps {
  title: string;
  amount: string;
  amountColor?: string;
  difference: string;
  differenceColor: string;
}

export function DashboardOverviewBalanceInfoCard({
  title,
  amount,
  amountColor = "text-black",
  difference,
  differenceColor,
}: BalanceInfoCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <strong className={`text-3xl ${amountColor}`}>{amount}</strong>
          <span className={`text-xs ${differenceColor}`}>{difference}</span>
        </div>
      </CardContent>
    </Card>
  );
}
