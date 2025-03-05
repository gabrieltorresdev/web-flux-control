import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { auth } from "@/features/auth/lib/auth";
import { SettingsOptions } from "@/features/settings/components/settings-options";

export default async function SettingsPage() {
  const session = await auth();
  const userInitials =
    (session?.user?.givenName?.[0] || "") +
    (session?.user?.familyName?.[0] || "");

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>{userInitials || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-base font-medium">{session?.user?.name}</h2>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <SettingsOptions />
    </div>
  );
}
