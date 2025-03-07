"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkUserStatus } from "@/features/user/actions/user";
import { signOut } from "next-auth/react";
import { useToast } from "@/shared/hooks/use-toast";

export function DashboardStatusChecker() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkUserStatus();
        if (status !== "completed") {
          router.push("/environment-preparation");
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
          await signOut({ redirect: false });
          toast({
            title: "Sessão expirada",
            description: "Por favor, faça login novamente.",
          });
          router.push("/login");
        }
      }
    };

    checkStatus();
  }, [router]);

  return null;
}
