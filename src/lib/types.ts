export type Role = "EMPLOYEE" | "MANAGER" | "DEPT_HEAD" | "FINANCE" | "ADMIN";

export type ExpenseStatus =
  | "DRAFT"
  | "PENDING_MANAGER"
  | "PENDING_HEAD"
  | "APPROVED"
  | "REJECTED"
  | "REIMBURSED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  departmentId: string;
  department?: {
    id: string;
    name: string;
    monthlyBudget?: string | number;
  };
  managerId?: string | null;
  manager?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
}

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  categoryId: string;
  categoryName: string;
  vendor: string;
  expenseDate: string;
  description?: string;
  amount: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  status: ExpenseStatus;
  receiptText?: string;
  budgetExceeded: boolean;
  submittedAt?: string;
  approvedAt?: string;
  reimbursedAt?: string;
  approvals?: Approval[];
}

export interface Approval {
  id: string;
  level: number;
  approverName: string;
  decision: "APPROVED" | "REJECTED";
  comment?: string;
  decidedAt: string;
}

export interface Department {
  id: string;
  name: string;
  monthlyBudget: number;
  spentAmount: number;
  headName?: string;
}

export interface Category {
  id: string;
  name: string;
  taxRate: number;
  isActive?: boolean;
}

export interface ApprovalPolicy {
  id: string;
  departmentId?: string | null;
  thresholdAmount: number;
  updatedAt?: string;
  department?: {
    id: string;
    name: string;
  };
}
