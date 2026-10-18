import React from "react";
import { User } from "../lib/types";
import {
  UserCheck,
  Users2,
  Activity,
  Building2,
} from "lucide-react";

export type NavTab = "overview" | "directory" | "health";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: User | null;
  totalUsersCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  totalUsersCount,
}) => {
  const navItems = [
    {
      id: "overview" as NavTab,
      label: "Account Overview",
      icon: UserCheck,
      badge: null,
    },
    {
      id: "directory" as NavTab,
      label: "Team Directory",
      icon: Users2,
      badge: `${totalUsersCount}`,
    },
    {
      id: "health" as NavTab,
      label: "System Status",
      icon: Activity,
      badge: null,
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
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

                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {item.badge}
                  </span>
                )}
              </button>
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
