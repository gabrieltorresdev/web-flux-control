"use server";

import { AuthService } from "@/services/auth-service";
import { cache } from "react";
import { getKeycloakAdmin } from "@/lib/auth/keycloak-admin";

// Cache the session verification to avoid unnecessary checks
export const verifySession = cache(async () => {
  try {
    return await AuthService.verifySession();
  } catch (error) {
    console.error("Error verifying session:", error);
    throw error;
  }
});

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export async function registerUser({
  name,
  email,
  password,
}: RegisterUserData) {
  try {
    const keycloakAdmin = await getKeycloakAdmin();

    const user = await keycloakAdmin.users.create({
      username: email,
      email,
      firstName: name,
      enabled: true,
      credentials: [
        {
          type: "password",
          value: password,
          temporary: false,
        },
      ],
    });

    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error("Failed to register user");
  }
}
