"use client";

import React from "react";
import { AdminSettingsView } from "../../components/AdminSettingsView";
import { useAuth } from "../../context/AuthContext";

export default function AdminPage() {
  const { currentUser, showToast } = useAuth();

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">
          Administrator privileges are required to view and configure corporate policies.
        </p>
      </div>
    );
  }

  return <AdminSettingsView showToast={showToast} />;
}
