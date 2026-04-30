import { Employee, formatBirthday, formatNameDay } from '@/app/data/employees';

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
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-3xl mb-2">🎂</div>
        <p className="text-gray-400 text-sm">No upcoming birthdays or name days</p>
      </div>
    );
  }

  return (
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

            {/* Badge */}
            <div className="shrink-0">
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
  );
}
