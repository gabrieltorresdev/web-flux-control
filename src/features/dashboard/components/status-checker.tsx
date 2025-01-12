"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkUserStatus } from "@/features/user/actions/user";

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
        router.push("/environment-preparation");
      }
    };

    checkStatus();
  }, [router]);

  return null;
}
