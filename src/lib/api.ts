import { User, Role } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("expenseiq_token");
};

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("expenseiq_token", token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("expenseiq_token");
    localStorage.removeItem("expenseiq_user");
  }
};

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem("expenseiq_user");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("expenseiq_user", JSON.stringify(user));
  }
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${response.status}`,
        error: data.message,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error. Backend might be offline.";
    return {
      success: false,
      message: errorMsg,
      error: errorMsg,
    };
  }
}

export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest<{ token: string; user: User }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => {
    return apiRequest<User>("/api/v1/auth/me", {
      method: "GET",
    });
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: Role;
    departmentId: string;
    managerId?: string | null;
  }) => {
    return apiRequest<User>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  checkHealth: async () => {
    return apiRequest<{
      success: boolean;
      message: string;
      database?: string;
      uptime?: number;
      timestamp?: string;
    }>("/health", {
      method: "GET",
    });
  },
};
