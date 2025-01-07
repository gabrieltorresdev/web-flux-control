import { TokenManager } from "@/lib/auth/token-manager";
import { auth, signOut } from "@/auth";
import type { Session } from "next-auth";
import { useCategoryStore } from "@/stores/category-store";

interface AuthResponse {
  isAuthenticated: boolean;
  error?: string;
  session?: Session;
}

export class AuthService {
  static async verifySession(): Promise<AuthResponse> {
    try {
      const session = await auth();

      if (!session) {
        return { isAuthenticated: false };
      }

      if (session.error === "RefreshAccessTokenError") {
        await this.handleLogout();
        return { isAuthenticated: false, error: "RefreshAccessTokenError" };
      }

      if (!session.accessToken || !session.refreshToken) {
        return { isAuthenticated: false };
      }

      // Verifica se o token está expirado
      if (TokenManager.isTokenExpired(session.accessToken)) {
        try {
          // Tenta atualizar o token
          const refreshedToken = await TokenManager.refreshToken(
            session.refreshToken
          );

          if (!refreshedToken) {
            await this.handleLogout();
            return { isAuthenticated: false, error: "RefreshAccessTokenError" };
          }

          // Verifica se o token atualizado também está expirado
          if (
            typeof refreshedToken === "string" &&
            TokenManager.isTokenExpired(refreshedToken)
          ) {
            await this.handleLogout();
            return { isAuthenticated: false, error: "TokenExpiredError" };
          }

          return {
            isAuthenticated: true,
            session: {
              ...session,
              accessToken:
                typeof refreshedToken === "string"
                  ? refreshedToken
                  : session.accessToken,
            },
          };
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Expired token")
          ) {
            await this.handleLogout();
            return { isAuthenticated: false, error: "TokenExpiredError" };
          }
          return { isAuthenticated: false, error: "TokenRefreshError" };
        }
      }

      return { isAuthenticated: true, session };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Expired token")) {
        await this.handleLogout();
        return { isAuthenticated: false, error: "TokenExpiredError" };
      }
      return { isAuthenticated: false, error: "AuthenticationError" };
    }
  }

  private static async handleLogout() {
    // Limpa o cache das categorias
    useCategoryStore.getState().clearStore();
    // Faz o logout
    await signOut({ redirect: false });
  }
}
