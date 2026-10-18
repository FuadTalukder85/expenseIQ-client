"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "../lib/types";
import {
  UserCheck,
  Receipt,
  Users2,
  Sliders,
  Building2,
} from "lucide-react";

export type NavTab = "overview" | "expenses" | "directory" | "admin";

interface SidebarProps {
  currentUser: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  const pathname = usePathname();
  const isAdmin = currentUser?.role === "ADMIN";

  const navItems = [
    {
      href: "/",
      label: "Overview",
      icon: UserCheck,
      visible: true,
    },
    {
      href: "/expenses",
      label: "Expenses",
      icon: Receipt,
      visible: true,
    },
    {
      href: "/directory",
      label: "Team Directory",
      icon: Users2,
      visible: true,
    },
    {
      href: "/admin",
      label: "Admin Settings",
      icon: Sliders,
      visible: isAdmin,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none p-4">
      <div className="space-y-6">
        {/* Navigation Menu */}
        <nav className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </div>
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`}
                    />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
        </nav>
      </div>

      {/* Corporate User Card Footer */}
      {currentUser && (
        <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-900 truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>{currentUser.department?.name || "Corporate"}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
