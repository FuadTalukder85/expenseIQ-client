"use client";

import React, { useSyncExternalStore } from "react";
import { useAuth } from "../context/AuthContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { LoginScreen } from "./LoginScreen";

const emptySubscribe = () => () => {};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const {
    currentUser,
    setCurrentUser,
    handleLogout,
    handleQuickSwitchRole,
    showToast,
  } = useAuth();

  if (!isMounted) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-xs font-medium">Loading ExpenseIQ...</div>
        <div className="hidden" aria-hidden="true">
          <React.Suspense fallback={null}>{children}</React.Suspense>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="w-full min-h-screen bg-slate-50">
        <LoginScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
          showToast={showToast}
        />
        <div className="hidden" aria-hidden="true">
          <React.Suspense fallback={null}>{children}</React.Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Full-Width Sticky Top Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onQuickSwitchRole={handleQuickSwitchRole}
      />

      {/* Full-Width Workspace Container (Edge-to-Edge) */}
      <div className="w-full flex-1 flex flex-row">
        {/* Full-Height Left Navigation Sidebar */}
        <Sidebar currentUser={currentUser} />

        {/* Full-Width Content Viewport */}
        <main className="flex-1 w-full p-6 lg:p-8 overflow-y-auto bg-slate-50/50">
          <React.Suspense
            fallback={
              <div className="w-full p-8 text-center text-xs text-slate-400">
                Loading...
              </div>
            }
          >
            {children}
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};
