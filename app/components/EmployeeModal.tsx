"use client";

import { useState, useEffect, useCallback } from "react";
import { Employee, Leave, LeaveType } from "@/app/data/employees";

export const AVATAR_COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#EC4899",
  "#F97316",
  "#14B8A6",
  "#6366F1",
  "#F43F5E",
  "#06B6D4",
  "#7C3AED",
  "#F59E0B",
  "#65A30D",
  "#10B981",
  "#EF4444",
  "#F472B6",
  "#0EA5E9",
];

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface LeaveEntry {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  department?: string;
  role?: string;
  email?: string;
  birthday?: string;
  leaves?: Record<string, { startDate?: string; endDate?: string }>;
}

const BLANK_NEW_LEAVE: Omit<LeaveEntry, "id"> = {
  type: "vacation",
  startDate: "",
  endDate: "",
  notes: "",
};

interface EmployeeModalProps {
  /** null = adding a new employee */
  employee: Employee | null;
  totalEmployees: number;
  onClose: () => void;
  onSave: (employee: Employee) => void;
}

export function EmployeeModal({
  employee,
  totalEmployees,
  onClose,
  onSave,
}: EmployeeModalProps) {
  const isEditing = employee !== null;

  const [name, setName] = useState(employee?.name ?? "");
  const [department, setDepartment] = useState(employee?.department ?? "");
  const [role, setRole] = useState(employee?.role ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [birthday, setBirthday] = useState(employee?.birthday ?? "");
  const [nameDay, setNameDay] = useState(employee?.nameDay ?? "");
  const [hireDate, setHireDate] = useState(employee?.hireDate ?? "");
  const [avatarColor, setAvatarColor] = useState(
    employee?.avatarColor ??
      AVATAR_COLORS[totalEmployees % AVATAR_COLORS.length]
  );
  const [leaves, setLeaves] = useState<LeaveEntry[]>(
    (employee?.leaves ?? []).map((l) => ({
      id: l.id,
      type: l.type,
      startDate: l.startDate,
      endDate: l.endDate,
      notes: l.notes ?? "",
    }))
  );
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [newLeave, setNewLeave] =
    useState<Omit<LeaveEntry, "id">>(BLANK_NEW_LEAVE);
  const [errors, setErrors] = useState<FormErrors>({});

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!department.trim()) errs.department = "Department is required";
    if (!role.trim()) errs.role = "Role is required";
    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address";
    }
    if (!birthday) errs.birthday = "Birthday is required";

    const leaveErrors: Record<string, { startDate?: string; endDate?: string }> =
      {};
    leaves.forEach((l) => {
      const le: { startDate?: string; endDate?: string } = {};
      if (!l.startDate) le.startDate = "Required";
      if (!l.endDate) le.endDate = "Required";
      else if (l.startDate && l.endDate < l.startDate)
        le.endDate = "Must be on or after start date";
      if (Object.keys(le).length) leaveErrors[l.id] = le;
    });
    if (Object.keys(leaveErrors).length) errs.leaves = leaveErrors;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const saved: Employee = {
      id: employee?.id ?? crypto.randomUUID(),
      name: name.trim(),
      initials: deriveInitials(name),
      department: department.trim(),
      role: role.trim(),
      email: email.trim().toLowerCase(),
      birthday,
      ...(nameDay ? { nameDay } : {}),
      ...(hireDate ? { hireDate } : {}),
      avatarColor,
      leaves: leaves.map(
        (l): Leave => ({
          id: l.id,
          type: l.type,
          startDate: l.startDate,
          endDate: l.endDate,
          ...(l.notes.trim() ? { notes: l.notes.trim() } : {}),
        })
      ),
    };
    onSave(saved);
  }

  function commitAddLeave() {
    if (!newLeave.startDate || !newLeave.endDate) return;
    if (newLeave.endDate < newLeave.startDate) return;
    setLeaves((prev) => [...prev, { ...newLeave, id: crypto.randomUUID() }]);
    setNewLeave(BLANK_NEW_LEAVE);
    setShowAddLeave(false);
  }

  function updateLeaveField<K extends keyof LeaveEntry>(
    id: string,
    field: K,
    value: LeaveEntry[K]
  ) {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isEditing ? "Edit Employee" : "Add Employee"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Avatar preview + color picker */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 select-none"
              style={{ backgroundColor: avatarColor }}
            >
              {deriveInitials(name) || "?"}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                Avatar color
              </p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      avatarColor === c
                        ? "ring-2 ring-offset-1 ring-gray-700 scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Name */}
          <Field label="Full Name" error={errors.name} required>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="Jane Smith"
              className={inputCls(!!errors.name)}
            />
          </Field>

          {/* Department + Role */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department" error={errors.department} required>
              <input
                type="text"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  if (errors.department)
                    setErrors((p) => ({ ...p, department: undefined }));
                }}
                placeholder="Engineering"
                className={inputCls(!!errors.department)}
                list="dept-suggestions"
              />
              <datalist id="dept-suggestions">
                {[
                  "Engineering",
                  "Product",
                  "Design",
                  "Sales",
                  "Marketing",
                  "HR",
                  "Finance",
                  "Operations",
                  "Legal",
                ].map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </Field>

            <Field label="Role / Title" error={errors.role} required>
              <input
                type="text"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (errors.role)
                    setErrors((p) => ({ ...p, role: undefined }));
                }}
                placeholder="Senior Developer"
                className={inputCls(!!errors.role)}
              />
            </Field>
          </div>

          {/* Email + Birthday */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" error={errors.email} required>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder="jane@company.com"
                className={inputCls(!!errors.email)}
              />
            </Field>

            <Field label="Birthday" error={errors.birthday} required>
              <input
                type="date"
                value={birthday}
                onChange={(e) => {
                  setBirthday(e.target.value);
                  if (errors.birthday)
                    setErrors((p) => ({ ...p, birthday: undefined }));
                }}
                className={inputCls(!!errors.birthday)}
              />
            </Field>
          </div>

          {/* Name Day + Hire Date */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name Day">
              <input
                type="date"
                value={nameDay}
                onChange={(e) => setNameDay(e.target.value)}
                className={inputCls(false)}
              />
              <p className="text-xs text-gray-400 mt-1">Only month &amp; day matter</p>
            </Field>

            <Field label="Start Date">
              <input
                type="date"
                value={hireDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setHireDate(e.target.value)}
                className={inputCls(false)}
              />
            </Field>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Leaves</p>
              {!showAddLeave && (
                <button
                  type="button"
                  onClick={() => setShowAddLeave(true)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add leave
                </button>
              )}
            </div>

            {/* Existing leaves */}
            {leaves.length === 0 && !showAddLeave && (
              <p className="text-xs text-gray-400 italic">
                No leaves recorded. Click &ldquo;Add leave&rdquo; to add one.
              </p>
            )}
            <ul className="space-y-2">
              {leaves.map((l) => {
                const leaveErr = errors.leaves?.[l.id];
                return (
                  <li
                    key={l.id}
                    className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={l.type}
                        onChange={(e) =>
                          updateLeaveField(l.id, "type", e.target.value as LeaveType)
                        }
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                      >
                        <option value="vacation">Vacation</option>
                        <option value="sick">Sick Leave</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          setLeaves((prev) =>
                            prev.filter((x) => x.id !== l.id)
                          )
                        }
                        className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove leave"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5">
                          Start
                        </label>
                        <input
                          type="date"
                          value={l.startDate}
                          onChange={(e) =>
                            updateLeaveField(l.id, "startDate", e.target.value)
                          }
                          className={inputCls(!!leaveErr?.startDate) + " text-xs py-1"}
                        />
                        {leaveErr?.startDate && (
                          <p className="text-xs text-red-500 mt-0.5">
                            {leaveErr.startDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5">
                          End
                        </label>
                        <input
                          type="date"
                          value={l.endDate}
                          onChange={(e) =>
                            updateLeaveField(l.id, "endDate", e.target.value)
                          }
                          className={inputCls(!!leaveErr?.endDate) + " text-xs py-1"}
                        />
                        {leaveErr?.endDate && (
                          <p className="text-xs text-red-500 mt-0.5">
                            {leaveErr.endDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={l.notes}
                      onChange={(e) =>
                        updateLeaveField(l.id, "notes", e.target.value)
                      }
                      placeholder="Notes (optional)"
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </li>
                );
              })}
            </ul>

            {/* Add leave inline form */}
            {showAddLeave && (
              <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-indigo-700">
                  New Leave
                </p>
                <select
                  value={newLeave.type}
                  onChange={(e) =>
                    setNewLeave((p) => ({
                      ...p,
                      type: e.target.value as LeaveType,
                    }))
                  }
                  className="w-full text-xs border border-indigo-200 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">
                      Start *
                    </label>
                    <input
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) =>
                        setNewLeave((p) => ({
                          ...p,
                          startDate: e.target.value,
                        }))
                      }
                      className={inputCls(false) + " text-xs py-1"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">
                      End *
                    </label>
                    <input
                      type="date"
                      value={newLeave.endDate}
                      min={newLeave.startDate || undefined}
                      onChange={(e) =>
                        setNewLeave((p) => ({ ...p, endDate: e.target.value }))
                      }
                      className={inputCls(false) + " text-xs py-1"}
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={newLeave.notes}
                  onChange={(e) =>
                    setNewLeave((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Notes (optional)"
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={commitAddLeave}
                    disabled={!newLeave.startDate || !newLeave.endDate}
                    className="text-xs font-medium px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddLeave(false);
                      setNewLeave(BLANK_NEW_LEAVE);
                    }}
                    className="text-xs font-medium px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            {isEditing ? "Save changes" : "Add employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return `w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? "border-red-300 focus:ring-red-200"
      : "border-gray-200 focus:ring-indigo-200"
  }`;
}

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
