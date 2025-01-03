"use server";

import { AuthService } from "@/services/auth-service";
import { cache } from "react";

// Cache the session verification to avoid unnecessary checks
export const verifySession = cache(async () => {
  try {
    return await AuthService.verifySession();
  } catch (error) {
    console.error("Error verifying session:", error);
    throw error;
  }
});
