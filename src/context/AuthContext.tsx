"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, Role, Department } from "../lib/types";
import { seededUsers, initialDepartments } from "../lib/mockData";
import {
  authApi,
  getStoredUser,
  setToken,
  setStoredUser,
  removeToken,
} from "../lib/api";
import { ToastMessage, ToastContainer } from "../components/Toast";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  usersList: User[];
  departments: Department[];
  showToast: (type: "success" | "error" | "info", msg: string) => void;
  handleQuickSwitchRole: (role: Role) => Promise<void>;
  handleLogout: () => void;
  handleUserAdded: (newUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(seededUsers[0]);
  const [usersList, setUsersList] = useState<User[]>(seededUsers);
  const [departments] = useState<Department[]>(initialDepartments);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync stored user from localStorage
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      const timer = setTimeout(() => setCurrentUser(stored), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const showToast = useCallback((type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleQuickSwitchRole = useCallback(
    async (role: Role) => {
      const emailMap: Record<Role, string> = {
        ADMIN: "admin@expenseiq.com",
        DEPT_HEAD: "head@expenseiq.com",
        MANAGER: "manager@expenseiq.com",
        FINANCE: "finance@expenseiq.com",
        EMPLOYEE: "employee@expenseiq.com",
      };

      const targetEmail = emailMap[role] || "admin@expenseiq.com";

      try {
        const res = await authApi.login(targetEmail, "Password123!");
        if (res.success && res.data) {
          setToken(res.data.token);
          setStoredUser(res.data.user);
          setCurrentUser(res.data.user);
          showToast("success", `Signed in as ${res.data.user.name} (${role})`);
        } else {
          const localUser = seededUsers.find((u) => u.role === role) || seededUsers[0];
          setCurrentUser(localUser);
          setStoredUser(localUser);
          showToast("info", `Switched to ${localUser.name} (${role})`);
        }
      } catch {
        const localUser = seededUsers.find((u) => u.role === role) || seededUsers[0];
        setCurrentUser(localUser);
        setStoredUser(localUser);
        showToast("info", `Switched to ${localUser.name} (${role})`);
      }
    },
    [showToast]
  );

  const handleLogout = useCallback(() => {
    removeToken();
    setCurrentUser(null);
    showToast("info", "Signed out successfully.");
  }, [showToast]);

  const handleUserAdded = useCallback((newUser: User) => {
    setUsersList((prev) => [newUser, ...prev]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        usersList,
        departments,
        showToast,
        handleQuickSwitchRole,
        handleLogout,
        handleUserAdded,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
