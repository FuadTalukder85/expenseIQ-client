import React, { useState } from "react";
import { User, Role, Department } from "../lib/types";
import { authApi } from "../lib/api";
import {
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";

interface UserDirectoryViewProps {
  users: User[];
  departments: Department[];
  currentUser: User | null;
  onUserAdded: (newUser: User) => void;
  showToast: (type: "success" | "error" | "info", msg: string) => void;
}

export const UserDirectoryView: React.FC<UserDirectoryViewProps> = ({
  users,
  departments,
  currentUser,
  onUserAdded,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [departmentId, setDepartmentId] = useState(
    departments[0]?.id || "cmvcve7yn0004a8bsjogxt26v"
  );
  const [managerId, setManagerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "ADMIN";

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (r: Role) => {
    switch (r) {
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await authApi.register({
        name,
        email,
        password,
        role,
        departmentId: departmentId || departments[0]?.id || "cmvcve7yn0004a8bsjogxt26v",
        managerId: managerId || null,
      });

      if (response.success && response.data) {
        showToast("success", `User ${name} registered in PostgreSQL database!`);
        onUserAdded(response.data);
        setIsRegisterModalOpen(false);
        setName("");
        setEmail("");
        setPassword("Password123!");
      } else {
        const errorMsg =
          response.message ||
          "Registration failed. Verify you have Admin permissions (403 Forbidden for non-admins).";
        setFormError(errorMsg);
        showToast("error", errorMsg);
      }
    } catch {
      setFormError("Failed to reach backend server on http://localhost:5000");
      showToast("error", "Network connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Actions */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Organization Directory
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {users.length} Staff Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage company employees, organizational roles, and departmental reporting structures
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!isAdmin) {
                showToast(
                  "info",
                  "Administrator permission required to add new staff members."
                );
              }
              setIsRegisterModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats Row (Full Width 4 Columns) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Accounts</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Seeded & Registered</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">System Admins</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {users.filter((u) => u.role === "ADMIN").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Full Privileges</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Approvers & Heads</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {users.filter((u) => u.role === "MANAGER" || u.role === "DEPT_HEAD").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">L1 & L2 Reviewers</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Status</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {users.filter((u) => u.isActive).length} / {users.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">1 Inactive (Test 401)</div>
        </div>
      </div>

      {/* Filter and Search Bar (Full Width) */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DEPT_HEAD">DEPT_HEAD</option>
            <option value="MANAGER">MANAGER</option>
            <option value="FINANCE">FINANCE</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>
        </div>
      </div>

      {/* User Directory Table (Full Width) */}
      <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-5">Staff Member</th>
                <th className="py-3 px-5">Role & Access</th>
                <th className="py-3 px-5">Department</th>
                <th className="py-3 px-5">Assigned Manager</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-700">
                      {u.department?.name || "Engineering"}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {u.manager ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-800">{u.manager.name}</span>
                          <span className="text-[10px] text-slate-400">({u.manager.role})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None (Direct Report)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-[11px] text-slate-400">
                      {u.id.slice(0, 12)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register New User */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Add New Employee
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Provision employee credentials and assign departmental reporting line
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isAdmin && (
              <div className="p-3 mx-5 mt-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Administrator privileges are required to register new corporate employees. Switch to the <strong>ADMIN</strong> account to perform this action.
                </span>
              </div>
            )}

            {formError && (
              <div className="p-3 mx-5 mt-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex.mercer@expenseiq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Organizational Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="DEPT_HEAD">DEPT_HEAD</option>
                    <option value="FINANCE">FINANCE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Manager (Optional)
                </label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">No Direct Manager</option>
                  {users
                    .filter((u) => u.role === "MANAGER" || u.role === "DEPT_HEAD")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing to Database...</span>
                    </>
                  ) : (
                    <span>Register User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
