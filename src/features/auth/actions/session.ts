"use server";

import { auth } from "@/features/auth/lib/auth";
import { TokenManager } from "@/features/auth/lib/token-manager";
import { revalidatePath } from "next/cache";

interface RefreshSessionResult {
  success: boolean;
  error?: string;
}

/**
 * Server action to refresh the session and access token
 * This helps prevent session expiration while the user is actively using the application
 */
export async function refreshSession(): Promise<RefreshSessionResult> {
  try {
    const session = await auth();
    
    if (!session) {
      return { success: false, error: "No active session" };
    }
    
    if (!session.refreshToken) {
      return { success: false, error: "No refresh token available" };
    }
    
    // Check if we need to refresh the token
    if (session.accessToken && !TokenManager.isTokenExpired(session.accessToken)) {
      // Token is still valid, no need to refresh
      return { success: true };
    }
    
    // Try to refresh the token
    const refreshResult = await TokenManager.refreshToken(session.refreshToken);
    
    if (!refreshResult) {
      return { success: false, error: "Failed to refresh token" };
    }
    
    // Only revalidate if the token was actually refreshed
    if (refreshResult.access_token !== session.accessToken) {
      // Revalidate only the session data, not the entire page
      revalidatePath("/api/auth/session");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error refreshing session:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error refreshing session" 
    };
  }
} 