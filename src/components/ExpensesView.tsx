import React, { useState, useEffect, useCallback } from "react";
import { Expense, User } from "../lib/types";
import { expensesApi } from "../lib/api";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Calendar,
  Eye,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { NewExpenseModal } from "./NewExpenseModal";
import { ExpenseDetailModal } from "./ExpenseDetailModal";

interface ExpensesViewProps {
  currentUser: User | null;
  showToast: (type: "success" | "error" | "info", msg: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ currentUser, showToast }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [scopeFilter, setScopeFilter] = useState<"own" | "reports" | "all">("all");

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await expensesApi.getAll({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: searchTerm.trim() || undefined,
        scope: currentUser?.role === "MANAGER" ? scopeFilter : undefined,
      });

      if (res.success && res.data) {
        setExpenses(res.data);
      }
    } catch {
      showToast("error", "Error loading expenses");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm, currentUser, scopeFilter, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchExpenses]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleExpenseCreated = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleExpenseDeleted = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PENDING_MANAGER":
      case "PENDING_HEAD":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REIMBURSED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Corporate Expenses & Draft Claims
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {expenses.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create and manage corporate bill drafts with automated tax calculations and ledger audit snapshots
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchExpenses}
            disabled={isLoading}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
            title="Refresh expenses"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Expense Draft</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by vendor or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {currentUser?.role === "MANAGER" && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Scope:</span>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value as "own" | "reports" | "all")}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Visible Claims</option>
                <option value="own">My Claims Only</option>
                <option value="reports">Direct Reports&apos; Claims</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT (Editable)</option>
              <option value="PENDING_MANAGER">PENDING_MANAGER</option>
              <option value="PENDING_HEAD">PENDING_HEAD</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REIMBURSED">REIMBURSED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-5">Vendor & Date</th>
                <th className="py-3 px-5">Category & Tax Snapshot</th>
                <th className="py-3 px-5 text-right">Gross Amount</th>
                <th className="py-3 px-5 text-right">Discount</th>
                <th className="py-3 px-5 text-right">Tax Amount</th>
                <th className="py-3 px-5 text-right">Net Amount</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-medium text-slate-600">No expense records found</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Click &ldquo;+ New Expense Draft&rdquo; to record a new business claim.
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{exp.vendor}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(exp.expenseDate).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800">{exp.categoryName || "Travel"}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                          {Number(exp.taxRate)}% Tax
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right font-medium text-slate-700">
                      ${Number(exp.amount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-5 text-right text-rose-600 font-medium">
                      {Number(exp.discount) > 0 ? `-$${Number(exp.discount).toFixed(2)}` : "$0.00"}
                    </td>

                    <td className="py-3.5 px-5 text-right text-emerald-700 font-medium">
                      +${Number(exp.taxAmount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-5 text-right font-bold text-slate-900">
                      ${Number(exp.netAmount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getStatusBadge(
                          exp.status
                        )}`}
                      >
                        {exp.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedExpense(exp)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Ledger Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {exp.status === "DRAFT" && (
                          <button
                            onClick={async () => {
                              if (confirm(`Delete draft for ${exp.vendor}?`)) {
                                const res = await expensesApi.deleteDraft(exp.id);
                                if (res.success) {
                                  showToast("success", "Draft deleted");
                                  handleExpenseDeleted(exp.id);
                                } else {
                                  showToast("error", res.message || "Failed to delete");
                                }
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NewExpenseModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onExpenseCreated={handleExpenseCreated}
        showToast={showToast}
      />

      <ExpenseDetailModal
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onExpenseDeleted={handleExpenseDeleted}
        showToast={showToast}
      />
    </div>
  );
};
