"use client";

import React, { useState, useEffect } from "react";
import { User, Role, Department } from "../lib/types";
import { initialDepartments, seededUsers } from "../lib/mockData";
import { authApi, getStoredUser, setToken, setStoredUser, removeToken } from "../lib/api";
import { Header } from "../components/Header";
import { Sidebar, NavTab } from "../components/Sidebar";
import { OverviewView } from "../components/OverviewView";
import { UserDirectoryView } from "../components/UserDirectoryView";
import { SystemHealthView } from "../components/SystemHealthView";
import { LoginScreen } from "../components/LoginScreen";
import { ToastContainer, ToastMessage } from "../components/Toast";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export default function Home() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [currentUser, setCurrentUser] = useState<User | null>(seededUsers[0]);
  const [currentTab, setCurrentTab] = useState<NavTab>("overview");
  const [usersList, setUsersList] = useState<User[]>(seededUsers);
  const [departments] = useState<Department[]>(initialDepartments);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync stored user asynchronously to avoid cascading renders
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      const timer = setTimeout(() => setCurrentUser(stored), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check Backend Connectivity periodically
  useEffect(() => {
    let isSubscribed = true;

    const checkConnection = async () => {
      const res = await authApi.checkHealth();
      if (isSubscribed) {
        setBackendOnline(res.success);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 12000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  // Quick switch role handler
  const handleQuickSwitchRole = async (role: Role) => {
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
  };

  const handleLogout = () => {
    removeToken();
    setCurrentUser(null);
    showToast("info", "Signed out successfully.");
  };

  const handleUserAdded = (newUser: User) => {
    setUsersList((prev) => [newUser, ...prev]);
  };

  // Wait until mounted on client to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-400 text-xs font-medium">Loading ExpenseIQ...</div>
      </div>
    );
  }

  // If unauthenticated, show corporate Login Screen
  if (!currentUser) {
    return (
      <div className="w-full min-h-screen bg-slate-50">
        <LoginScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
          showToast={showToast}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Full-Width Sticky Top Header */}
      <Header
        currentUser={currentUser}
        backendOnline={backendOnline}
        onLogout={handleLogout}
        onQuickSwitchRole={handleQuickSwitchRole}
      />

      {/* Full-Width Workspace Container (Edge-to-Edge) */}
      <div className="w-full flex-1 flex flex-row">
        {/* Full-Height Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          currentUser={currentUser}
          totalUsersCount={usersList.length}
        />

        {/* Full-Width Content Viewport */}
        <main className="flex-1 w-full p-6 lg:p-8 overflow-y-auto bg-slate-50/50">
          {currentTab === "overview" && (
            <OverviewView
              currentUser={currentUser}
              onUserRefreshed={(u) => setCurrentUser(u)}
              showToast={showToast}
            />
          )}

          {currentTab === "directory" && (
            <UserDirectoryView
              users={usersList}
              departments={departments}
              currentUser={currentUser}
              onUserAdded={handleUserAdded}
              showToast={showToast}
            />
          )}

          {currentTab === "health" && <SystemHealthView />}
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
