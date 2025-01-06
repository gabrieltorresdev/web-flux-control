"use server";

import { auth } from "@/auth";
import { UserService } from "@/services/user-service";

export async function checkUserStatus() {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const userService = UserService.getInstance();
    const status = await userService.checkUserStatus();
    return status;
  } catch (error) {
    console.error("Error checking user status:", error);
    throw error;
  }
}
