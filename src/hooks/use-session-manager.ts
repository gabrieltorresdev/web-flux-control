import { useSession, signOut } from "next-auth/react";
import { useEffect, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
}

interface SessionUpdateResult {
  error?: string;
}

export function useSessionManager() {
  const { data: session, status, update } = useSession();
  const refreshAttemptRef = useRef<boolean>(false);

  const checkTokenExpiration = useCallback(async () => {
    if (!session?.accessToken || refreshAttemptRef.current) return;

    try {
      const decoded = jwtDecode<DecodedToken>(session.accessToken);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - currentTime;

      // Se tiver erro de refresh ou estiver próximo de expirar
      if (session.error === "RefreshAccessTokenError" || timeUntilExpiry < 30) {
        refreshAttemptRef.current = true;

        // Tenta atualizar a sessão silenciosamente
        const result = (await update()) as SessionUpdateResult | boolean;

        if (!result || (typeof result === "object" && result.error)) {
          if (process.env.NODE_ENV === "development") {
            console.error("Session update failed");
          }
          await signOut({ redirect: true, callbackUrl: "/login" });
          return;
        }

        refreshAttemptRef.current = false;
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error checking token:", error);
      }
      await signOut({ redirect: true, callbackUrl: "/login" });
    }
  }, [session, update]);

  // Verifica o token a cada 10 segundos
  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(checkTokenExpiration, 10000);
      // Verifica imediatamente ao montar
      checkTokenExpiration();

      return () => clearInterval(interval);
    }
  }, [status, checkTokenExpiration]);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
