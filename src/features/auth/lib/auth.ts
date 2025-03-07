import NextAuth, { Session, DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { TokenManager } from "@/features/auth/lib/token-manager";

// Type extensions and interfaces
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      givenName: string;
      familyName: string;
      emailVerified: boolean;
      username: string;
    } & DefaultSession["user"];
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    givenName?: string;
    familyName?: string;
    emailVerified?: boolean;
    username?: string;
    accessTokenExpires?: number;
  }
}

interface KeycloakToken {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  session_state: string;
  scope: string;
}

interface KeycloakUserInfo {
  sub: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

interface KeycloakAuthResult {
  success: boolean;
  data?: KeycloakToken;
  userInfo?: KeycloakUserInfo;
  error?: Error;
}

interface User {
  id: string;
  name: string;
  email: string;
  givenName: string;
  familyName: string;
  emailVerified: boolean;
  username: string;
  accessToken: string;
  refreshToken: string;
}

interface Credentials {
  username: string;
  password: string;
}

// Constants
const KEYCLOAK_SCOPE = "openid profile email";
const DEFAULT_ERROR_MESSAGE = "Authentication failed";

// Helper functions
const buildKeycloakParams = (
  username: string,
  password: string
): URLSearchParams => {
  const params = new URLSearchParams();
  params.append("client_id", process.env.KEYCLOAK_CLIENT_ID!);
  params.append("client_secret", process.env.KEYCLOAK_CLIENT_SECRET!);
  params.append("grant_type", "password");
  params.append("username", username);
  params.append("password", password);
  params.append("scope", KEYCLOAK_SCOPE);
  return params;
};

const handleKeycloakError = (error: unknown): KeycloakAuthResult => {
  return {
    success: false,
    error: error instanceof Error ? error : new Error("Unknown error"),
  };
};

async function fetchUserInfo(
  accessToken: string
): Promise<KeycloakUserInfo | null> {
  try {
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

// Keycloak authentication
async function authenticateKeycloak(
  username: string,
  password: string
): Promise<KeycloakAuthResult> {
  const keycloakTokenUrl = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
  const params = buildKeycloakParams(username, password);

  try {
    const response = await fetch(keycloakTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: new Error(data.error_description || DEFAULT_ERROR_MESSAGE),
      };
    }

    const userInfo = await fetchUserInfo(data.access_token);

    return {
      success: true,
      data,
      userInfo: userInfo || undefined,
    };
  } catch (error) {
    return handleKeycloakError(error);
  }
}

// Auth configuration
export const { handlers, auth,  signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      id: "keycloak",
      name: "Keycloak",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          const { username, password } = credentials as Credentials;

          if (!username || !password) {
            throw new Error("Missing username or password");
          }

          const result = await authenticateKeycloak(username, password);

          if (!result.success || !result.data || !result.userInfo) {
            return null;
          }

          return {
            id: result.userInfo.sub,
            name: result.userInfo.name,
            email: result.userInfo.email,
            givenName: result.userInfo.given_name,
            familyName: result.userInfo.family_name,
            emailVerified: result.userInfo.email_verified,
            username: result.userInfo.preferred_username,
            accessToken: result.data.access_token,
            refreshToken: result.data.refresh_token,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      // Initial sign in
      if (user) {
        return {
          ...token,
          accessToken: (user as User).accessToken,
          refreshToken: (user as User).refreshToken,
          givenName: (user as User).givenName,
          familyName: (user as User).familyName,
          emailVerified: (user as User).emailVerified,
          username: (user as User).username,
          accessTokenExpires: Math.floor(Date.now() / 1000 + 30 * 60), // 30 minutos de expiração
        };
      }

      // Return previous token if the access token has not expired yet
      if (
        token.accessToken &&
        token.accessTokenExpires &&
        !TokenManager.isTokenExpired(
          token.accessToken,
          token.accessTokenExpires
        )
      ) {
        return token;
      }

      // Access token has expired, try to refresh it
      if (token.refreshToken) {
        try {
          const response = await TokenManager.refreshToken(token.refreshToken);

          if (response) {
            return {
              ...token,
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
              accessTokenExpires: Math.floor(Date.now() / 1000 + 30 * 60), // 30 minutos de expiração
              error: undefined,
            };
          }
        } catch (error) {
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      }

      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    },
    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        error: token.error,
        user: {
          ...session.user,
          id: token.sub || "",
          givenName: token.givenName || "",
          familyName: token.familyName || "",
          emailVerified: token.emailVerified || false,
          username: token.username || "",
        },
      };
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      if (token?.accessToken && token?.refreshToken) {
        try {
          await fetch(
            `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                client_id: process.env.KEYCLOAK_CLIENT_ID!,
                client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
                refresh_token: token.refreshToken,
              }),
            }
          );
        } catch (error) {
          // Silently handle logout errors
        }
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
});
