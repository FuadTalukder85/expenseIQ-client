import React, { useState } from "react";
import { User, Role } from "../lib/types";
import {
  ShieldCheck,
  LogOut,
  ArrowRightLeft,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onQuickSwitchRole: (role: Role) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onQuickSwitchRole,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "DEPT_HEAD":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "MANAGER":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "FINANCE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "EMPLOYEE":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const demoRoles: { role: Role; label: string; desc: string }[] = [
    { role: "ADMIN", label: "System Admin", desc: "System Administration & Staff Management" },
    { role: "DEPT_HEAD", label: "Harry Head", desc: "Head of Engineering (L2 Approver)" },
    { role: "MANAGER", label: "Mike Manager", desc: "Engineering Manager (L1 Approver)" },
    { role: "FINANCE", label: "Fiona Finance", desc: "Finance & Payroll Officer" },
    { role: "EMPLOYEE", label: "Emma Employee", desc: "Software Engineer (Staff Member)" },
  ];

  return (
    <header className="w-full h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">ExpenseIQ</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Corporate Expense & Approval Management
            </p>
          </div>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* 1-Click Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Switch User</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Corporate Demo Accounts
              </div>
              <div className="space-y-1">
                {demoRoles.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      onQuickSwitchRole(item.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                      currentUser?.role === item.role
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(
                          item.role
                        )}`}
                      >
                        {item.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Details & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="hidden lg:flex flex-col text-right">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {currentUser.department?.name || "Corporate"}
              </div>
            </div>

            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${getRoleBadge(
                currentUser.role
              )} tracking-wide`}
            >
              {currentUser.role}
            </span>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
