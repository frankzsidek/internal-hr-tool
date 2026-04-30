'use client';

import { useState } from 'react';
import { Employee, formatBirthday, formatNameDay } from '@/app/data/employees';
import { BirthdayCardModal } from '@/app/components/BirthdayCardModal';

export type ReminderType = 'birthday' | 'nameday';

export interface ReminderEntry {
  employee: Employee;
  daysUntil: number;
  type: ReminderType;
}

interface BirthdayRemindersProps {
  entries: ReminderEntry[];
}

export function BirthdayReminders({ entries }: BirthdayRemindersProps) {
  const [cardTarget, setCardTarget] = useState<Employee | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-3xl mb-2">🎂</div>
        <p className="text-gray-400 text-sm">No upcoming birthdays or name days</p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2">
      {entries.map(({ employee, daysUntil, type }) => {
        const isToday = daysUntil === 0;
        const isSoon = daysUntil <= 7;
        const isBirthday = type === 'birthday';
        const dateLabel = isBirthday
          ? formatBirthday(employee.birthday)
          : formatNameDay(employee.nameDay!);

        return (
          <li
            key={`${employee.id}-${type}`}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              isToday
                ? isBirthday
                  ? 'bg-violet-50 border border-violet-200'
                  : 'bg-amber-50 border border-amber-200'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ backgroundColor: employee.avatarColor }}
            >
              {employee.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{employee.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {isBirthday ? '🎂' : '✦'} {isBirthday ? 'Birthday' : 'Name Day'} · {dateLabel}
              </p>
            </div>

            {/* Badge + send button */}
            <div className="shrink-0 flex items-center gap-2">
              {isBirthday && (
                <button
                  onClick={() => setCardTarget(employee)}
                  title="Generate & send birthday card to Slack"
                  className="p-1.5 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                  </svg>
                </button>
              )}
              {isToday ? (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white ${isBirthday ? 'bg-violet-600' : 'bg-amber-500'}`}>
                  🎉 Today!
                </span>
              ) : isSoon ? (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isBirthday ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                  {daysUntil}d
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                  {daysUntil}d
                </span>
              )}
            </div>
          </li>
        );
      })}
      </ul>
      {cardTarget && (
        <BirthdayCardModal employee={cardTarget} onClose={() => setCardTarget(null)} />
      )}
    </>
  );
}
