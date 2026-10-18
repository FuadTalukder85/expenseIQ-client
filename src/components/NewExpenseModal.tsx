import React, { useState, useEffect } from "react";
import { Category, Expense } from "../lib/types";
import { categoriesApi, expensesApi } from "../lib/api";
import {
  X,
  PlusCircle,
  Calculator,
  Loader2,
  AlertCircle,
  Receipt,
} from "lucide-react";

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: (newExpense: Expense) => void;
  showToast: (type: "success" | "error" | "info", msg: string) => void;
}

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseCreated,
  showToast,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [vendor, setVendor] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [discount, setDiscount] = useState<string>("0");
  const [receiptText, setReceiptText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      categoriesApi.getAll().then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setCategories(res.data);
          if (!categoryId) {
            setCategoryId(res.data[0].id);
          }
        }
      });
    }
  }, [isOpen, categoryId]);

  if (!isOpen) return null;

  const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const taxRate = selectedCategory ? Number(selectedCategory.taxRate) : 0;

  const numAmount = parseFloat(amount) || 0;
  const numDiscount = parseFloat(discount) || 0;

  // Real-time calculation engine preview
  const isDiscountValid = numDiscount <= numAmount;
  const taxableBase = Math.max(0, numAmount - numDiscount);
  const calculatedTax = Number(((taxableBase * taxRate) / 100).toFixed(2));
  const calculatedNet = Number((taxableBase + calculatedTax).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (numAmount <= 0) {
      setErrorMessage("Please enter an amount greater than 0.");
      return;
    }

    if (!isDiscountValid) {
      setErrorMessage("Discount cannot be greater than the gross amount.");
      return;
    }

    if (!categoryId) {
      setErrorMessage("Please select an expense category.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await expensesApi.createDraft({
        categoryId,
        vendor: vendor.trim(),
        expenseDate,
        description: description.trim() || undefined,
        amount: numAmount,
        discount: numDiscount,
        receiptText: receiptText.trim() || undefined,
      });

      if (response.success && response.data) {
        showToast("success", `Draft created for ${vendor} ($${calculatedNet.toFixed(2)})`);
        onExpenseCreated(response.data);
        onClose();
        // Reset form
        setVendor("");
        setDescription("");
        setAmount("");
        setDiscount("0");
        setReceiptText("");
      } else {
        setErrorMessage(response.message || "Failed to create draft expense");
        showToast("error", response.message || "Creation failed");
      }
    } catch {
      setErrorMessage("Network error connecting to backend API.");
      showToast("error", "Network connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-xl animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">New Expense Draft</h3>
              <p className="text-xs text-slate-500">
                Create an editable corporate expense claim with automatic tax calculation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({Number(c.taxRate)}% Tax)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vendor / Merchant</label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Cloud, Uber, Hotel"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Date</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gross Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className={`w-full px-3 py-2.5 bg-white border rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 ${
                  !isDiscountValid ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business Purpose / Notes</label>
            <input
              type="text"
              placeholder="e.g. Q4 cloud infrastructure compute instances"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Interactive Calculation Breakdown Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Tax & Net Calculation Breakdown</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Category Tax</span>
                <span className="font-semibold text-slate-800">{taxRate}% Rate</span>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Taxable Base</span>
                <span className="font-semibold text-slate-800">${taxableBase.toFixed(2)}</span>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[10px] text-slate-400 block">Tax Amount</span>
                <span className="font-semibold text-emerald-700">+${calculatedTax.toFixed(2)}</span>
              </div>

              <div className="p-2 bg-blue-50/70 rounded-lg border border-blue-200/80">
                <span className="text-[10px] text-blue-600 block font-semibold">Net Total</span>
                <span className="font-bold text-blue-900">${calculatedNet.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDiscountValid}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Draft...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Save as Draft</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
