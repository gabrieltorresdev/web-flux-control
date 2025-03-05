import { TokenManager } from "@/features/auth/lib/token-manager";
import { auth, signOut } from "@/features/auth/lib/auth";
import type { Session } from "next-auth";
import { useCategoryStore } from "@/features/categories/stores/category-store";

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
        return { isAuthenticated: false, error: "SessionExpiredError" };
      }

      if (session.error === "RefreshAccessTokenError") {
        await this.handleLogout();
        return { isAuthenticated: false, error: "SessionExpiredError" };
      }

      if (!session.accessToken || !session.refreshToken) {
        return { isAuthenticated: false, error: "SessionExpiredError" };
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
            return { isAuthenticated: false, error: "SessionExpiredError" };
          }

          // Verifica se o token atualizado também está expirado
          if (TokenManager.isTokenExpired(refreshedToken.access_token)) {
            await this.handleLogout();
            return { isAuthenticated: false, error: "SessionExpiredError" };
          }

          return {
            isAuthenticated: true,
            session: {
              ...session,
              accessToken: refreshedToken.access_token,
              refreshToken: refreshedToken.refresh_token,
            },
          };
        } catch (error) {
          await this.handleLogout();
          return { isAuthenticated: false, error: "SessionExpiredError" };
        }
      }

      return { isAuthenticated: true, session };
    } catch (error) {
      await this.handleLogout();
      return { isAuthenticated: false, error: "SessionExpiredError" };
    }
  }

  private static async handleLogout() {
    // Limpa o cache das categorias
    useCategoryStore.getState().clearStore();
    // Faz o logout
    await signOut({ redirect: false });
  }
}
