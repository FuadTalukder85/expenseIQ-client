import React, { useState } from "react";
import { Expense } from "../lib/types";
import { expensesApi } from "../lib/api";
import {
  X,
  Receipt,
  Calendar,
  Building2,
  Trash2,
  Tag,
  DollarSign,
  User,
  Loader2,
} from "lucide-react";

interface ExpenseDetailModalProps {
  expense: Expense | null;
  onClose: () => void;
  onExpenseDeleted: (id: string) => void;
  showToast: (type: "success" | "error" | "info", msg: string) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  onClose,
  onExpenseDeleted,
  showToast,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!expense) return null;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete draft claim #${expense.id}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await expensesApi.deleteDraft(expense.id);
      if (res.success) {
        showToast("success", "Expense draft deleted successfully");
        onExpenseDeleted(expense.id);
        onClose();
      } else {
        showToast("error", res.message || "Failed to delete expense");
      }
    } catch {
      showToast("error", "Error communicating with server");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{expense.vendor}</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {expense.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">Claim ID: {expense.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Financial Ledger Breakdown */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Financial Ledger & Tax Calculation</span>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-2.5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Gross Amount</span>
                <span className="font-semibold text-slate-900">${Number(expense.amount).toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Discount Applied</span>
                <span className="font-semibold text-rose-600">-${Number(expense.discount).toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Taxable Base</span>
                <span className="font-semibold text-slate-900">
                  ${(Number(expense.amount) - Number(expense.discount)).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Category Tax Rate ({Number(expense.taxRate)}%)</span>
                <span className="font-semibold text-emerald-700">+${Number(expense.taxAmount).toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Net Total Amount</span>
                <span className="text-base text-blue-700 font-bold">${Number(expense.netAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Details Metadata */}
          <div className="grid grid-cols-2 gap-3 text-slate-600">
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Category
              </span>
              <span className="font-semibold text-slate-800 block">{expense.categoryName || "Travel"}</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Expense Date
              </span>
              <span className="font-semibold text-slate-800 block">
                {new Date(expense.expenseDate).toLocaleDateString()}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Department
              </span>
              <span className="font-semibold text-slate-800 block">{expense.departmentName || "Engineering"}</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3" /> Submitter
              </span>
              <span className="font-semibold text-slate-800 block">{expense.employeeName || "Current User"}</span>
            </div>
          </div>

          {expense.description && (
            <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50">
              <span className="text-[11px] text-slate-400 block mb-0.5">Purpose & Description</span>
              <p className="text-slate-800">{expense.description}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {expense.status === "DRAFT" ? (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg font-medium transition-colors"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Draft</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">Locked (Audit Trail)</span>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
