import React, { useState } from "react";
import { User, Role } from "../lib/types";
import { authApi } from "../lib/api";
import {
  ShieldCheck,
  RefreshCw,
  Building2,
  Lock,
  UserCheck,
  FileCheck2,
  DollarSign,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

interface OverviewViewProps {
  currentUser: User | null;
  onUserRefreshed: (user: User) => void;
  showToast: (type: "success" | "error" | "info", msg: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentUser,
  onUserRefreshed,
  showToast,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("Active session");

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        onUserRefreshed(res.data);
        setLastRefreshed(`Updated at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
        showToast("success", "Account profile synced with server");
      } else {
        showToast("error", res.message || "Could not refresh profile");
      }
    } catch {
      showToast("error", "Error connecting to server");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRoleBadge = (role?: Role) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "DEPT_HEAD":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "MANAGER":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "FINANCE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getRoleDescription = (role?: Role) => {
    switch (role) {
      case "ADMIN":
        return "Full administrative authority over staff rosters, organizational policies, and department budgets.";
      case "DEPT_HEAD":
        return "Level 2 (L2) approval authority for high-value claims ($500+) and department budget governance.";
      case "MANAGER":
        return "Level 1 (L1) approval authority for direct reports' expense claims and preliminary cost review.";
      case "FINANCE":
        return "Audits approved corporate claims, manages fund disbursements, and tracks departmental expenditures.";
      default:
        return "Submits corporate bills, travel invoices, and operational receipts for approval and reimbursement.";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Employee Identity Hero Banner */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            {currentUser?.name?.slice(0, 2).toUpperCase() || "EQ"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentUser?.name || "Corporate User"}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getRoleBadge(
                  currentUser?.role
                )}`}
              >
                {currentUser?.role}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>{currentUser?.email}</span>
              <span>•</span>
              <span>Department: {currentUser?.department?.name || "Engineering"}</span>
              {currentUser?.manager && (
                <>
                  <span>•</span>
                  <span>Reports to: {currentUser.manager.name}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block text-[11px] text-slate-400">
            <div>{lastRefreshed}</div>
          </div>
          <button
            onClick={handleRefreshProfile}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh Profile</span>
          </button>
        </div>
      </div>

      {/* 4 Key Business Cards (Full Width) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Role & Mandate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Corporate Role</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900">{currentUser?.role}</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {getRoleDescription(currentUser?.role)}
          </p>
        </div>

        {/* Card 2: Department */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Department</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900">
            {currentUser?.department?.name || "Engineering"}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Allocated monthly budget: $50,000.00
          </p>
        </div>

        {/* Card 3: Reporting Manager */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Reporting Line</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {currentUser?.manager?.name || "Executive Staff"}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {currentUser?.manager
              ? `Direct report to ${currentUser.manager.name} (${currentUser.manager.role})`
              : "Reports directly to Department Leadership"}
          </p>
        </div>

        {/* Card 4: Account Security */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Security & Access</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900">Enterprise Verified</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Encrypted session with role-based permission verification
          </p>
        </div>
      </div>

      {/* Main Grid: Department Overview & Corporate Policy Rules */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Profile */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Department Assignment & Governance
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {currentUser?.department?.name || "Engineering"}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Monthly Operating Budget
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  $50,000.00 allocated for corporate operating expenses, software licenses, travel, and team hardware.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 flex items-start gap-3">
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Department Head & Reviewer
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Harry Head oversees final tier approvals for high-value claims submitted across Engineering.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Cost Center Identifier
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {currentUser?.departmentId || "cmvcve7yn0004a8bsjogxt26v"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Expense Policy */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Expense & Approval Governance Policy
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">Corporate Standard</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Dual-Tier Approval Threshold ($500)
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Claims below $500 require Direct Manager sign-off. High-value claims ($500+) automatically route to the Department Head after Manager review.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 flex items-start gap-3">
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Receipt Documentation & Tax Rates
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Itemized invoices must specify vendor, net total, and tax category. Snapshots of tax rates are locked to ensure accurate audit trails.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Finance Reimbursement & Payouts
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Once fully approved by leadership, the corporate Finance team verifies budget allocations and issues direct bank reimbursements.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
