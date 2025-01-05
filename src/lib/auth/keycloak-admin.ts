import KcAdminClient from "@keycloak/keycloak-admin-client";

let keycloakAdmin: KcAdminClient | null = null;

export async function getKeycloakAdmin() {
  if (keycloakAdmin) {
    return keycloakAdmin;
  }

  const baseUrl = process.env.KEYCLOAK_ISSUER?.replace(
    "/realms/fluxcontrol",
    ""
  );
  if (!baseUrl) {
    throw new Error("KEYCLOAK_ISSUER environment variable is not set");
  }

  keycloakAdmin = new KcAdminClient({
    baseUrl,
    realmName: "fluxcontrol",
  });

  try {
    await keycloakAdmin.auth({
      grantType: "client_credentials",
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      totp: undefined,
    });

    // Configure o realm após a autenticação
    keycloakAdmin.setConfig({
      realmName: "fluxcontrol",
    });

    return keycloakAdmin;
  } catch (error) {
    console.error("Error authenticating with Keycloak:", error);
    throw error;
  }
}
