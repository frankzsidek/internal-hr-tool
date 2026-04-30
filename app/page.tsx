"use client";

import { useState } from 'react';
import { Employee, isActiveLeave, isUpcomingLeave, daysUntilBirthday, daysUntilNameDay } from '@/app/data/employees';
import { useEmployees } from '@/app/hooks/useEmployees';
import { StatsCard } from '@/app/components/StatsCard';
import { AbsenceList } from '@/app/components/AbsenceList';
import { BirthdayReminders } from '@/app/components/BirthdayReminders';
import { UpcomingLeaves } from '@/app/components/UpcomingLeaves';
import { EmployeeDirectory } from '@/app/components/EmployeeDirectory';
import { EmployeeModal } from '@/app/components/EmployeeModal';
import { LeaveBalances } from '@/app/components/LeaveBalances';
import { LeaveCalendar } from '@/app/components/LeaveCalendar';

export default function Home() {
  const { employees, addEmployee, updateEmployee, removeEmployee } = useEmployees();

  // null = closed, 'new' = adding, Employee = editing
  const [modalTarget, setModalTarget] = useState<Employee | 'new' | null>(null);

  const today = new Date();

  // ── Compute active absences ──────────────────────────────────────────────
  const activeAbsences = employees.flatMap((emp) =>
    emp.leaves
      .filter((l) => isActiveLeave(l, today))
      .map((leave) => ({ employee: emp, leave }))
  );

  const sickToday = activeAbsences.filter((a) => a.leave.type === 'sick').length;
  const vacationToday = activeAbsences.filter((a) => a.leave.type === 'vacation').length;

  // ── Compute upcoming absences (next 60 days, not currently active) ───────
  const upcomingAbsences = employees
    .flatMap((emp) =>
      emp.leaves
        .filter((l) => isUpcomingLeave(l, today, 60))
        .map((leave) => {
          const start = new Date(leave.startDate);
          const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const daysUntilStart = Math.ceil(
            (start.getTime() - todayNorm.getTime()) / 86_400_000
          );
          return { employee: emp, leave, daysUntilStart };
        })
    )
    .sort((a, b) => a.daysUntilStart - b.daysUntilStart);

  // ── Compute upcoming birthdays + name days (next 30 days) ──────────────
  const upcomingReminders = [
    ...employees.map((emp) => ({
      employee: emp,
      daysUntil: daysUntilBirthday(emp.birthday, today),
      type: 'birthday' as const,
    })),
    ...employees
      .filter((emp) => !!emp.nameDay)
      .map((emp) => ({
        employee: emp,
        daysUntil: daysUntilNameDay(emp.nameDay!, today),
        type: 'nameday' as const,
      })),
  ]
    .filter((r) => r.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // ── Format today's display date ──────────────────────────────────────────
  const todayLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── Modal save handler ────────────────────────────────────────────────────
  function handleSave(emp: Employee) {
    if (modalTarget === 'new') {
      addEmployee(emp);
    } else {
      updateEmployee(emp);
    }
    setModalTarget(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">HR Dashboard</h1>
              <p className="text-xs text-gray-400 mt-0.5">People &amp; Absence Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{todayLabel}</span>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats row ──────────────────────────────────────────────────────*/}
        <section aria-label="Summary statistics">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Employees"
              value={employees.length}
              subtitle="across all departments"
              accentColor="bg-indigo-500"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <StatsCard
              title="On Sick Leave"
              value={sickToday}
              subtitle="as of today"
              accentColor="bg-amber-500"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatsCard
              title="On Vacation"
              value={vacationToday}
              subtitle="as of today"
              accentColor="bg-sky-500"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              }
            />
            <StatsCard
              title="Upcoming Reminders"
              value={upcomingReminders.length}
              subtitle="birthdays &amp; name days in 30 days"
              accentColor="bg-violet-500"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.994 1.994 0 003 15.546M3 11.272c.523 0 1.046.151 1.5.454a2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0c.454-.303.977-.454 1.5-.454M6 3h12M6 3l-1 3h14l-1-3M6 3h12" />
                </svg>
              }
            />
          </div>
        </section>

        {/* ── Leave calendar ──────────────────────────────────────────────*/}
        <section aria-label="Leave calendar">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Leave Calendar</h2>
                <p className="text-xs text-gray-400 mt-0.5">Team absences at a glance</p>
              </div>
            </div>
            <LeaveCalendar employees={employees} today={today} />
          </div>
        </section>

        {/* ── Middle row: absences + birthdays ───────────────────────────────*/}
        <section aria-label="Current absences and birthdays" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Current absences */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Currently Absent</h2>
                <p className="text-xs text-gray-400 mt-0.5">Employees out today</p>
              </div>
              <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {activeAbsences.length} {activeAbsences.length === 1 ? 'person' : 'people'}
              </span>
            </div>
            <AbsenceList items={activeAbsences} today={today} />
          </div>

          {/* Birthday reminders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Birthdays &amp; Name Days</h2>
                <p className="text-xs text-gray-400 mt-0.5">Next 30 days</p>
              </div>
              <span className="text-lg" aria-hidden="true">🎂</span>
            </div>
            <BirthdayReminders entries={upcomingReminders} />
          </div>
        </section>

        {/* ── Upcoming leaves table ───────────────────────────────────────────*/}
        <section aria-label="Upcoming absences">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Upcoming Absences</h2>
                <p className="text-xs text-gray-400 mt-0.5">Scheduled in the next 60 days</p>
              </div>
              <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {upcomingAbsences.length} scheduled
              </span>
            </div>
            <UpcomingLeaves rows={upcomingAbsences} />
          </div>
        </section>

        {/* ── Leave balances ──────────────────────────────────────────────────*/}
        <section aria-label="Leave balances">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Leave Balances {today.getFullYear()}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Vacation (20 days) &amp; Sick Leave (5 days) per employee</p>
              </div>
            </div>
            <LeaveBalances employees={employees} year={today.getFullYear()} />
          </div>
        </section>

        {/* ── Employee directory ──────────────────────────────────────────────*/}
        <section aria-label="Employee directory">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-base font-bold text-gray-900">Employee Directory</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add, edit or remove employees</p>
            </div>
            <EmployeeDirectory
              employees={employees}
              onAdd={() => setModalTarget('new')}
              onEdit={(emp) => setModalTarget(emp)}
              onDelete={removeEmployee}
            />
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto px-6 py-6 mt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Internal HR Tool · Data is for demonstration purposes</p>
      </footer>

      {/* ── Employee modal ──────────────────────────────────────────────────── */}
      {modalTarget !== null && (
        <EmployeeModal
          employee={modalTarget === 'new' ? null : modalTarget}
          totalEmployees={employees.length}
          onClose={() => setModalTarget(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

