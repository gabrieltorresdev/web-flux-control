import { TokenManager } from "@/lib/auth/token-manager";
import { auth, signOut } from "@/auth";

export class AuthService {
  static async verifySession() {
    const session = await auth();

    if (!session) {
      return { isAuthenticated: false };
    }

    if (session.error === "RefreshAccessTokenError") {
      await signOut({ redirect: false });
      return { isAuthenticated: false, error: "RefreshAccessTokenError" };
    }

    if (!session.accessToken || !session.refreshToken) {
      return { isAuthenticated: false };
    }

    // Verifica se o token está expirado
    if (TokenManager.isTokenExpired(session.accessToken)) {
      // Tenta atualizar o token
      const refreshedToken = await TokenManager.refreshToken(
        session.refreshToken
      );

      if (!refreshedToken) {
        await signOut({ redirect: false });
        return { isAuthenticated: false, error: "RefreshAccessTokenError" };
      }
    }

    return { isAuthenticated: true, session };
  }
}
