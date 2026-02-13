/**
 * Figma API Client
 */

import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL = "https://api.figma.com/v1";
const REQUEST_TIMEOUT = 30000;

let apiClient: AxiosInstance | null = null;

export function initializeClient(accessToken: string): void {
  apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      "X-Figma-Token": accessToken,
      "Content-Type": "application/json"
    }
  });
}

export function getClient(): AxiosInstance {
  if (!apiClient) {
    throw new Error(
      "Figma API client not initialized. Set FIGMA_ACCESS_TOKEN environment variable."
    );
  }
  return apiClient;
}

export async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  data?: unknown,
  params?: Record<string, unknown>
): Promise<T> {
  const client = getClient();

  const response = await client.request<T>({
    url: endpoint,
    method,
    data,
    params
  });

  return response.data;
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ err?: string; message?: string }>;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorMessage =
        axiosError.response.data?.err ||
        axiosError.response.data?.message ||
        axiosError.message;

      switch (status) {
        case 400:
          return `Error: Bad request. ${errorMessage}. Check that all parameters are valid.`;
        case 403:
          return `Error: Access forbidden. You don't have permission to access this resource. Check your access token and scopes.`;
        case 404:
          return `Error: Resource not found. The file, node, or resource doesn't exist or you don't have access to it.`;
        case 429:
          return `Error: Rate limit exceeded. Figma API limits requests. Please wait before making more requests.`;
        case 500:
          return `Error: Figma server error. Please try again later.`;
        default:
          return `Error: API request failed with status ${status}. ${errorMessage}`;
      }
    }

    if (axiosError.code === "ECONNABORTED") {
      return "Error: Request timed out. The Figma API took too long to respond. Try with fewer nodes or a smaller file.";
    }

    if (axiosError.code === "ENOTFOUND") {
      return "Error: Cannot reach Figma API. Check your internet connection.";
    }
  }

  return `Error: Unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`;
}
