"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkUserStatus } from "@/features/user/actions/user";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export function DashboardStatusChecker() {
  const router = useRouter();

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
          toast.error("Sessão expirada", {
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
