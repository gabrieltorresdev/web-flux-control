import { HttpClient } from "@/lib/api/http-client";
import { getBackendApiUrl } from "@/lib/config";

export type UserStatus = "pending" | "failed" | "completed";

interface UserStatusResponse {
  message: string;
  data: {
    userStatus: UserStatus;
  };
}

export class UserService {
  private static instance: UserService;
  private httpClient: HttpClient;

  private constructor() {
    this.httpClient = new HttpClient();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async checkUserStatus(): Promise<UserStatus> {
    const response = await this.httpClient.get<UserStatusResponse>(
      getBackendApiUrl("users/status"),
      true
    );
    return response.data.userStatus;
  }
}
