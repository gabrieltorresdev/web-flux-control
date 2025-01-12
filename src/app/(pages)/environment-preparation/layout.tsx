import { auth } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";

export default async function EnvironmentPreparationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
