import { ApiError, handleApiError } from "./error-handler";
import { ClientCredentialsManager } from "../auth/client-credentials";

type FetchOptions<B> = {
  method?: string;
  headers?: Record<string, string>;
  body?: B;
  useClientCredentials?: boolean;
};

export class HttpClient {
  private async request<T, B = undefined>(
    url: string,
    options: FetchOptions<B> = {}
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      };

      if (options.useClientCredentials) {
        const clientCredentials = ClientCredentialsManager.getInstance();
        const token = await clientCredentials.getToken();
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        cache: "no-store",
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

  async get<T>(url: string, useClientCredentials = false) {
    return this.request<T>(url, { useClientCredentials });
  }

  async post<T, B>(url: string, body: B, useClientCredentials = false) {
    return this.request<T, B>(url, {
      method: "POST",
      body,
      useClientCredentials,
    });
  }

  async put<T, B>(url: string, body: B, useClientCredentials = false) {
    return this.request<T, B>(url, {
      method: "PUT",
      body,
      useClientCredentials,
    });
  }

  async delete(url: string, useClientCredentials = false) {
    return this.request(url, { method: "DELETE", useClientCredentials });
  }
}
