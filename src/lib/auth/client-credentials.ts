import { auth } from "@/auth";

export class ClientCredentialsManager {
  private static instance: ClientCredentialsManager;

  private constructor() {}

  static getInstance(): ClientCredentialsManager {
    if (!this.instance) {
      this.instance = new ClientCredentialsManager();
    }
    return this.instance;
  }

  async getToken(): Promise<string> {
    const session = await auth();
    if (!session?.accessToken) {
      throw new Error("User not authenticated");
    }

    return session.accessToken;
  }
}
