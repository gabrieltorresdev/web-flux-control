import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  scope: string;
}

interface RefreshResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  session_state: string;
}

export class TokenManager {
  private static readonly TOKEN_EXPIRY_THRESHOLD = 30; // 30 segundos antes de expirar
  private static readonly REFRESH_TOKEN_EXPIRY_THRESHOLD = 60; // 1 minuto antes de expirar o refresh token

  static isTokenExpired(token: string, storedExpiry?: number): boolean {
    try {
      const currentTime = Math.floor(Date.now() / 1000);

      // If we have a stored expiry time, use it
      if (storedExpiry) {
        return storedExpiry <= currentTime + this.TOKEN_EXPIRY_THRESHOLD;
      }

      // Fallback to decoding the token
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp <= currentTime + this.TOKEN_EXPIRY_THRESHOLD;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error checking token expiration:", error);
      }
      return true;
    }
  }

  static isRefreshTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp <= currentTime + this.REFRESH_TOKEN_EXPIRY_THRESHOLD;
    } catch {
      return true;
    }
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<RefreshResponse | null> {
    try {
      // Verifica se o refresh token já expirou
      if (this.isRefreshTokenExpired(refreshToken)) {
        return null;
      }

      const params = new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });

      const response = await fetch(
        `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      if (!response.ok) {
        if (process.env.NODE_ENV === "development") {
          const errorText = await response.text();
          console.error("Token refresh failed:", errorText);
        }
        return null;
      }

      const data = await response.json();

      // Validate the response has the expected fields
      if (!this.isValidRefreshResponse(data)) {
        if (process.env.NODE_ENV === "development") {
          console.error("Invalid refresh token response");
        }
        return null;
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error refreshing token:", error);
      }
      return null;
    }
  }

  private static isValidRefreshResponse(
    response: unknown
  ): response is RefreshResponse {
    return (
      typeof response === "object" &&
      response !== null &&
      "access_token" in response &&
      typeof (response as Record<string, unknown>).access_token === "string" &&
      "refresh_token" in response &&
      typeof (response as Record<string, unknown>).refresh_token === "string" &&
      "expires_in" in response &&
      typeof (response as Record<string, unknown>).expires_in === "number" &&
      "refresh_expires_in" in response &&
      typeof (response as Record<string, unknown>).refresh_expires_in ===
        "number" &&
      "token_type" in response &&
      typeof (response as Record<string, unknown>).token_type === "string" &&
      "session_state" in response &&
      typeof (response as Record<string, unknown>).session_state === "string"
    );
  }
}
