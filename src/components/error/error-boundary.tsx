"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
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
      // Redireciona imediatamente para o login
      signOut({ redirect: true, callbackUrl: "/login" });
    }
  }, [error]);

  // Não mostra nada enquanto está redirecionando
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-semibold mb-4">Redirecionando...</h2>
      <p className="text-muted-foreground mb-4 text-center">
        Por favor, aguarde enquanto redirecionamos você.
      </p>
    </div>
  );
}
