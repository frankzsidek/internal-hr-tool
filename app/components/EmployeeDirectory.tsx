"use client";

import { useState } from "react";
import { Employee, formatBirthday, formatNameDay, formatHireDate, employeeTenure, leaveRemainingDays, VACATION_QUOTA, SICK_QUOTA } from "@/app/data/employees";

interface EmployeeDirectoryProps {
  employees: Employee[];
  onAdd: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export function EmployeeDirectory({
  employees,
  onAdd,
  onEdit,
  onDelete,
}: EmployeeDirectoryProps) {
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  });

  function handleDelete(id: string) {
    onDelete(id);
    setConfirmDeleteId(null);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, department, role…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add employee
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-sm">
          {search
            ? `No employees match "${search}"`
            : "No employees yet. Add one to get started."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Employee", "Department", "Role", "Dates", "Since", "Leave Balance", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4 last:pr-0"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  {/* Name + avatar */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                        style={{ backgroundColor: emp.avatarColor }}
                      >
                        {emp.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-40">
                          {emp.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3 pr-4 text-gray-600">{emp.department}</td>

                  {/* Role */}
                  <td className="py-3 pr-4 text-gray-600">{emp.role}</td>

                  {/* Birthday + Name Day */}
                  <td className="py-3 pr-4">
                    <p className="text-gray-600">{formatBirthday(emp.birthday)}</p>
                    {emp.nameDay && (
                      <p className="text-xs text-violet-500 mt-0.5">
                        ✦ {formatNameDay(emp.nameDay)}
                      </p>
                    )}
                  </td>

                  {/* Since / tenure */}
                  <td className="py-3 pr-4">
                    {emp.hireDate ? (
                      <div>
                        <p className="text-gray-600 text-xs">{formatHireDate(emp.hireDate)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{employeeTenure(emp.hireDate, new Date())}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>

                  {/* Leave balance */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <LeaveBalancePill remaining={leaveRemainingDays(emp, 'vacation', new Date().getFullYear())} quota={VACATION_QUOTA} label="Vac" color="sky" />
                      <LeaveBalancePill remaining={leaveRemainingDays(emp, 'sick', new Date().getFullYear())} quota={SICK_QUOTA} label="Sick" color="amber" />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {confirmDeleteId === emp.id ? (
                        <>
                          <span className="text-xs text-gray-500 mr-1">
                            Remove?
                          </span>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onEdit(emp)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            aria-label={`Edit ${emp.name}`}
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(emp.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            aria-label={`Delete ${emp.name}`}
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {search && (
            <p className="text-xs text-gray-400 mt-3 text-right">
              Showing {filtered.length} of {employees.length} employees
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Pill sub-component ────────────────────────────────────────────────────────

interface LeaveBalancePillProps {
  remaining: number;
  quota: number;
  label: string;
  color: 'sky' | 'amber';
}

function LeaveBalancePill({ remaining, quota, label, color }: LeaveBalancePillProps) {
  const isEmpty = remaining === 0;
  const isLow = color === 'sky' ? remaining <= 5 : remaining <= 1;

  let cls: string;
  if (isEmpty) {
    cls = 'bg-red-50 text-red-600';
  } else if (isLow) {
    cls = 'bg-orange-50 text-orange-600';
  } else {
    cls = color === 'sky' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}: {remaining}/{quota}
    </span>
  );
}
