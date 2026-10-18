import React, { useState } from "react";
import { User, Role } from "../lib/types";
import { authApi, setToken, setStoredUser } from "../lib/api";
import { Receipt, Lock, Mail, ArrowRight, Shield, AlertCircle, Loader2 } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  showToast: (type: "success" | "error" | "info", msg: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, showToast }) => {
  const [email, setEmail] = useState("admin@expenseiq.com");
  const [password, setPassword] = useState("Password123!");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoAccounts = [
    { role: "ADMIN" as Role, email: "admin@expenseiq.com", label: "System Admin" },
    { role: "DEPT_HEAD" as Role, email: "head@expenseiq.com", label: "Dept Head" },
    { role: "MANAGER" as Role, email: "manager@expenseiq.com", label: "Manager" },
    { role: "FINANCE" as Role, email: "finance@expenseiq.com", label: "Finance Officer" },
    { role: "EMPLOYEE" as Role, email: "employee@expenseiq.com", label: "Employee" },
  ];

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const loginEmail = customEmail || email;

    try {
      const response = await authApi.login(loginEmail, password);

      if (response.success && response.data) {
        setToken(response.data.token);
        setStoredUser(response.data.user);
        onLoginSuccess(response.data.user);
        showToast("success", `Authenticated as ${response.data.user.name} (${response.data.user.role})`);
      } else {
        setErrorMessage(response.message || "Invalid credentials provided.");
        showToast("error", response.message || "Login failed");
      }
    } catch {
      setErrorMessage("Unable to connect to authentication server. Please try again.");
      showToast("error", "Service unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    handleLogin(undefined, demoEmail);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center p-6 selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-sm mb-1">
            <Receipt className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ExpenseIQ Enterprise</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Corporate Expense & Invoice Approval Engine • Phase 1 Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-semibold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter credentials verified by PostgreSQL backend
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Work Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@expenseiq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick 1-Click Demo Logins</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc.email)}
                  disabled={isLoading}
                  className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 hover:text-blue-700 transition-colors truncate"
                  title={`Log in as ${acc.email}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400">
          © ExpenseIQ Corporate Finance Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
};
