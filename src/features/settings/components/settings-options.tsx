"use client";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { ChevronRight, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface SettingsOption {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export function SettingsOptions() {
  const settingsOptions: SettingsOption[] = [
    {
      icon: <LogOut className="h-5 w-5 text-red-500" />,
      label: "Sair da Conta",
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  return (
    <Card>
      <div>
        {settingsOptions.map((option) => (
          <Button
            key={option.label}
            variant="ghost"
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            onClick={option.onClick}
          >
            <div className="flex items-center gap-3">
              {option.icon}
              <span className="text-sm font-medium">{option.label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>
        ))}
      </div>
    </Card>
  );
}
