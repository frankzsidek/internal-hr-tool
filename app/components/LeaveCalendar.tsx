'use client';

import { useState } from 'react';
import { Employee } from '@/app/data/employees';

interface LeaveCalendarProps {
  employees: Employee[];
  today: Date;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getAbsencesOnDay(employees: Employee[], dateStr: string) {
  return employees.flatMap((emp) =>
    emp.leaves
      .filter((l) => l.startDate <= dateStr && l.endDate >= dateStr)
      .map((l) => ({ employee: emp, leave: l }))
  );
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function LeaveCalendar({ employees, today }: LeaveCalendarProps) {
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = toDateStr(today);

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Monday-first offset
  const firstDow = new Date(year, month, 1).getDay();
  const startOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          aria-label="Previous month"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-700">{monthLabel}</span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          aria-label="Next month"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`pad-${idx}`}
                className="bg-gray-50 min-h-20"
              />
            );
          }

          const mm = String(month + 1).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          const dateStr = `${year}-${mm}-${dd}`;
          const absences = getAbsencesOnDay(employees, dateStr);
          const isToday = dateStr === todayStr;
          const isWeekend = idx % 7 >= 5;

          return (
            <div
              key={dateStr}
              className={`min-h-20 p-1.5 ${isWeekend ? 'bg-slate-50' : 'bg-white'}`}
            >
              {/* Day number */}
              <div className="flex justify-center mb-1">
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium leading-none
                    ${isToday
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700'
                    }`}
                >
                  {day}
                </span>
              </div>

              {/* Absence avatars */}
              <div className="flex flex-wrap gap-0.5 justify-center">
                {absences.slice(0, 5).map(({ employee, leave }) => (
                  <div
                    key={`${employee.id}-${leave.id}`}
                    title={`${employee.name} · ${leave.type === 'sick' ? 'Sick Leave' : 'Vacation'}`}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0
                      outline-1 ${leave.type === 'sick' ? 'outline-amber-400' : 'outline-sky-400'}`}
                    style={{ backgroundColor: employee.avatarColor }}
                  >
                    {employee.initials.charAt(0)}
                  </div>
                ))}
                {absences.length > 5 && (
                  <div
                    title={`${absences.length - 5} more`}
                    className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500 shrink-0"
                  >
                    +{absences.length - 5}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 pl-0.5">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-sky-400 outline-1 outline-sky-400 shrink-0" />
          Vacation
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-amber-400 outline-1 outline-amber-400 shrink-0" />
          Sick Leave
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
            {today.getDate()}
          </span>
          Today
        </span>
      </div>
    </div>
  );
}
