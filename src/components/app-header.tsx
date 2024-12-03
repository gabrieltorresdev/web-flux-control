"use client";

import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between p-3.5 bg-background w-full border-b border-sidebar-border">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <AppBreadcrumbs />
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <Avatar>
          <AvatarImage src="/avatars/user-avatar.png" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
