import React, { useState, useEffect, useCallback } from "react";
import { Department, Category } from "../lib/types";
import { departmentsApi, categoriesApi, policyApi } from "../lib/api";
import {
  Building2,
  Tag,
  Sliders,
  Plus,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";

interface AdminSettingsViewProps {
  showToast: (type: "success" | "error" | "info", msg: string) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState<"departments" | "categories" | "policy">("departments");

  // Departments State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptName, setDeptName] = useState("");
  const [deptBudget, setDeptBudget] = useState("");
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [catName, setCatName] = useState("");
  const [catTaxRate, setCatTaxRate] = useState("10");
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // Policy State
  const [threshold, setThreshold] = useState("500");
  const [isUpdatingPolicy, setIsUpdatingPolicy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [deptRes, catRes, polRes] = await Promise.all([
        departmentsApi.getAll(),
        categoriesApi.getAll(true),
        policyApi.get(),
      ]);

      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (polRes.success && polRes.data) {
        setThreshold(String(polRes.data.thresholdAmount));
      }
    } catch {
      showToast("error", "Failed to load admin settings data");
    }
  }, [showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Department Handlers
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    const budget = parseFloat(deptBudget);
    if (isNaN(budget) || budget < 0) {
      showToast("error", "Budget must be a non-negative number");
      return;
    }

    try {
      const res = await departmentsApi.create({
        name: deptName.trim(),
        monthlyBudget: budget,
      });

      if (res.success && res.data) {
        showToast("success", `Department ${deptName} created`);
        setDepartments((prev) => [res.data as Department, ...prev]);
        setIsDeptModalOpen(false);
        setDeptName("");
        setDeptBudget("");
      } else {
        showToast("error", res.message || "Failed to create department");
      }
    } catch {
      showToast("error", "Network error");
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete department '${name}'?`)) return;

    try {
      const res = await departmentsApi.delete(id);
      if (res.success) {
        showToast("success", "Department deleted");
        setDepartments((prev) => prev.filter((d) => d.id !== id));
      } else {
        showToast("error", res.message || "Cannot delete department with active members");
      }
    } catch {
      showToast("error", "Failed to delete department");
    }
  };

  // Category Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const tax = parseFloat(catTaxRate);
    if (isNaN(tax) || tax < 0) {
      showToast("error", "Tax rate must be a non-negative percentage");
      return;
    }

    try {
      const res = await categoriesApi.create({
        name: catName.trim(),
        taxRate: tax,
      });

      if (res.success && res.data) {
        showToast("success", `Category ${catName} created with ${tax}% tax`);
        setCategories((prev) => [...prev, res.data as Category]);
        setIsCatModalOpen(false);
        setCatName("");
        setCatTaxRate("10");
      } else {
        showToast("error", res.message || "Failed to create category");
      }
    } catch {
      showToast("error", "Network error");
    }
  };

  // Policy Handlers
  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    const th = parseFloat(threshold);
    if (isNaN(th) || th < 0) {
      showToast("error", "Threshold must be a non-negative number");
      return;
    }

    setIsUpdatingPolicy(true);
    try {
      const res = await policyApi.update({ thresholdAmount: th });
      if (res.success && res.data) {
        showToast("success", `Global dual-approval threshold updated to $${th.toFixed(2)}`);
      } else {
        showToast("error", res.message || "Failed to update policy");
      }
    } catch {
      showToast("error", "Error updating approval policy");
    } finally {
      setIsUpdatingPolicy(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Administrative Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure company departments, expense category tax snapshots, and dual-tier approval policy
          </p>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab("departments")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "departments"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "categories"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("policy")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "policy"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Approval Policy
          </button>
        </div>
      </div>

      {/* Tab 1: Departments */}
      {activeTab === "departments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Operating Departments & Budgets</span>
            </h2>
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Department</span>
            </button>
          </div>

          <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-5">Department Name</th>
                  <th className="py-3 px-5">Department Head</th>
                  <th className="py-3 px-5 text-right">Monthly Budget</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{d.name}</td>
                    <td className="py-3.5 px-5 text-slate-600">{d.headName || "Leadership Assigned"}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-slate-900">
                      ${Number(d.monthlyBudget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDeleteDepartment(d.id, d.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Categories */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Expense Categories & Tax Snapshots</span>
            </h2>
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Category</span>
            </button>
          </div>

          <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-5">Category Name</th>
                  <th className="py-3 px-5 text-right">Configured Tax Rate</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Category ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-700">
                      {Number(c.taxRate).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-[11px] text-slate-400">
                      {c.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Approval Policy */}
      {activeTab === "policy" && (
        <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Global Dual-Tier Approval Threshold
              </h2>
              <p className="text-xs text-slate-500">
                Expenses equal to or greater than this threshold require Department Head (L2) sign-off
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePolicy} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Dual Approval Threshold Amount ($)
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Standard baseline is $500.00. Claims below this are fully resolved by Team Managers.
              </p>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPolicy}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {isUpdatingPolicy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Policy...</span>
                </>
              ) : (
                <span>Save Approval Policy</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Add Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Department</h3>
              <button onClick={() => setIsDeptModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Product Design"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly Budget ($)</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  required
                  placeholder="25000"
                  value={deptBudget}
                  onChange={(e) => setDeptBudget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Expense Category</h3>
              <button onClick={() => setIsCatModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telecommunications"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax Rate Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="8.5"
                  value={catTaxRate}
                  onChange={(e) => setCatTaxRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
