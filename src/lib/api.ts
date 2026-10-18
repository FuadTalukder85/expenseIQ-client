import { User, Role, Department, Category, ApprovalPolicy, Expense } from "./types";

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
): Promise<{ success: boolean; data?: T; meta?: Record<string, unknown>; message?: string; error?: string }> {
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
      meta: data.meta,
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

export const departmentsApi = {
  getAll: async () => {
    return apiRequest<Department[]>("/api/v1/departments", { method: "GET" });
  },

  getById: async (id: string) => {
    return apiRequest<Department>(`/api/v1/departments/${id}`, { method: "GET" });
  },

  create: async (payload: { name: string; monthlyBudget: number; headId?: string | null }) => {
    return apiRequest<Department>("/api/v1/departments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (
    id: string,
    payload: { name?: string; monthlyBudget?: number; headId?: string | null }
  ) => {
    return apiRequest<Department>(`/api/v1/departments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/v1/departments/${id}`, {
      method: "DELETE",
    });
  },
};

export const categoriesApi = {
  getAll: async (includeInactive = false) => {
    return apiRequest<Category[]>(`/api/v1/categories?includeInactive=${includeInactive}`, {
      method: "GET",
    });
  },

  getById: async (id: string) => {
    return apiRequest<Category>(`/api/v1/categories/${id}`, { method: "GET" });
  },

  create: async (payload: { name: string; taxRate: number; isActive?: boolean }) => {
    return apiRequest<Category>("/api/v1/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (
    id: string,
    payload: { name?: string; taxRate?: number; isActive?: boolean }
  ) => {
    return apiRequest<Category>(`/api/v1/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/v1/categories/${id}`, {
      method: "DELETE",
    });
  },
};

export const policyApi = {
  get: async (departmentId?: string) => {
    const q = departmentId ? `?departmentId=${departmentId}` : "";
    return apiRequest<ApprovalPolicy>(`/api/v1/approval-policy${q}`, { method: "GET" });
  },

  getAll: async () => {
    return apiRequest<ApprovalPolicy[]>("/api/v1/approval-policy/all", { method: "GET" });
  },

  update: async (payload: { thresholdAmount: number; departmentId?: string | null }) => {
    return apiRequest<ApprovalPolicy>("/api/v1/approval-policy", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

export const usersApi = {
  getAll: async (params?: { role?: Role; departmentId?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set("role", params.role);
    if (params?.departmentId) searchParams.set("departmentId", params.departmentId);
    if (params?.search) searchParams.set("search", params.search);
    const q = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return apiRequest<User[]>(`/api/v1/users${q}`, { method: "GET" });
  },

  update: async (
    id: string,
    payload: {
      name?: string;
      role?: Role;
      departmentId?: string;
      managerId?: string | null;
      isActive?: boolean;
    }
  ) => {
    return apiRequest<User>(`/api/v1/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/v1/users/${id}`, {
      method: "DELETE",
    });
  },
};

export const expensesApi = {
  getAll: async (params?: {
    status?: string;
    categoryId?: string;
    departmentId?: string;
    search?: string;
    scope?: "own" | "reports" | "all";
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params?.departmentId) searchParams.set("departmentId", params.departmentId);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.scope) searchParams.set("scope", params.scope);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const q = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return apiRequest<Expense[]>(`/api/v1/expenses${q}`, { method: "GET" });
  },

  getById: async (id: string) => {
    return apiRequest<Expense>(`/api/v1/expenses/${id}`, { method: "GET" });
  },

  createDraft: async (payload: {
    categoryId: string;
    vendor: string;
    expenseDate: string;
    description?: string;
    amount: number;
    discount?: number;
    receiptText?: string;
  }) => {
    return apiRequest<Expense>("/api/v1/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateDraft: async (
    id: string,
    payload: {
      categoryId?: string;
      vendor?: string;
      expenseDate?: string;
      description?: string;
      amount?: number;
      discount?: number;
      receiptText?: string;
    }
  ) => {
    return apiRequest<Expense>(`/api/v1/expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteDraft: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/v1/expenses/${id}`, {
      method: "DELETE",
    });
  },
};
