import { ApiError, handleApiError } from "./error-handler";

type FetchOptions<B> = {
  method?: string;
  headers?: Record<string, string>;
  body?: B;
};

export class HttpClient {
  private async request<T, B = undefined>(
    url: string,
    options: FetchOptions<B> = {}
  ): Promise<T> {
    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        cache: "no-store",
        credentials: "include",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (response.status >= 300) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || `HTTP error! status: ${response.status}`,
          errorData.errors
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  async get<T>(url: string) {
    return this.request<T>(url);
  }

  async post<T, B>(url: string, body: B) {
    return this.request<T, B>(url, { method: "POST", body });
  }

  async put<T, B>(url: string, body: B) {
    return this.request<T, B>(url, { method: "PUT", body });
  }

  async delete(url: string) {
    return this.request(url, { method: "DELETE" });
  }
}
