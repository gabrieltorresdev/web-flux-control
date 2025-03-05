"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { toast } from "@/shared/hooks/use-toast";

interface ErrorBoundaryProps {
  error: Error;
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Error:", error);

    const isSessionExpired =
      error.message.includes("session has expired") ||
      error.message.includes("Expired token") ||
      error.message.includes("[Keycloak Guard]") ||
      error.message.includes("TokenExpiredError") ||
      error.message.includes("RefreshAccessTokenError");

    if (isSessionExpired) {
      // Show session expired toast
      toast({
        title: "Sessão Encerrada",
        description: "Sua sessão foi encerrada por inatividade. Por favor, faça login novamente.",
        variant: "destructive",
        duration: 5000,
      });

      // Redirect to login
      signOut({ redirect: true, callbackUrl: "/login" });
    }
  }, [error]);

  // Don't show anything while redirecting
  return null;
}
