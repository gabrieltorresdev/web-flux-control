"use client";

import Header from "@/components/dashboard/layout/Header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, List } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    url: "/dashboard/transactions",
    icon: List,
  },
  {
    title: "Budget",
    url: "/dashboard/budget",
    icon: List,
  },
  {
    title: "Goals",
    url: "/dashboard/goals",
    icon: List,
  },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  breadcrumb: React.ReactNode;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="flex max-h-screen w-full">
      <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto">
        <Header />
        <div className="flex flex-col gap-4">
          <Separator />
          <div className="flex gap-4">
            {items.map((item) => (
              <Button
                variant={pathname === item.url ? "default" : "outline"}
                key={item.title}
                asChild
              >
                <Link href={item.url}>{item.title}</Link>
              </Button>
            ))}
          </div>
          <Separator />
          <div className="pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
