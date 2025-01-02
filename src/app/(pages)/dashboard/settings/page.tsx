import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { auth } from "@/auth";
import { SettingsOptions } from "@/components/settings/settings-options";

export default async function SettingsPage() {
  const session = await auth();
  const userInitials =
    (session?.user?.givenName?.[0] || "") +
    (session?.user?.familyName?.[0] || "");

  return (
    <div className="container max-w-lg mx-auto px-4 py-6">
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="text-base bg-primary text-white">
              {userInitials || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium text-base">{session?.user?.name}</h2>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
      </Card>

      <SettingsOptions />
    </div>
  );
}
