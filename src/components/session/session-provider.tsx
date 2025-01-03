"use client";

import { verifySession } from "@/app/actions/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const { isAuthenticated, error } = await verifySession();

      if (!isAuthenticated || error === "RefreshAccessTokenError") {
        router.push("/login");
        toast({
          title: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive",
        });
      }
    }, 60000); // Check session every 60 seconds

    return () => clearInterval(interval);
  }, [router]);

  return <>{children}</>;
}
