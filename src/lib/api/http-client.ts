import { ApiError, handleApiError } from "./error-handler";

type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
};

export class HttpClient {
  private static async request<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || `HTTP error! status: ${response.status}`,
          errorData
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  static get<T>(url: string) {
    return this.request<T>(url);
  }

  static post<T>(url: string, body: any) {
    return this.request<T>(url, { method: "POST", body });
  }

  static put<T>(url: string, body: any) {
    return this.request<T>(url, { method: "PUT", body });
  }

  static delete(url: string) {
    return this.request(url, { method: "DELETE" });
  }
}
