import { Employee, Leave, formatDateRange, daysRemaining } from '@/app/data/employees';

interface AbsenceItem {
  employee: Employee;
  leave: Leave;
}

interface AbsenceListProps {
  items: AbsenceItem[];
  today: Date;
}

export function AbsenceList({ items, today }: AbsenceListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-gray-500 font-medium">No absences today</p>
        <p className="text-gray-400 text-sm mt-1">All employees are present</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map(({ employee, leave }) => {
        const remaining = daysRemaining(leave.endDate, today);
        const isSick = leave.type === 'sick';

        return (
          <li
            key={leave.id}
            className={`bg-white rounded-xl border-l-4 border border-gray-100 shadow-sm p-4 flex items-start gap-4 ${
              isSick ? 'border-l-amber-400' : 'border-l-sky-400'
            }`}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
              style={{ backgroundColor: employee.avatarColor }}
            >
              {employee.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{employee.name}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    isSick
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {isSick ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                  )}
                  {isSick ? 'Sick Leave' : 'Vacation'}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-0.5">
                {employee.role} · {employee.department}
              </p>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDateRange(leave.startDate, leave.endDate)}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    remaining <= 1
                      ? 'bg-red-50 text-red-600'
                      : remaining <= 3
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {remaining === 0
                    ? 'Returns tomorrow'
                    : remaining === 1
                    ? '1 day remaining'
                    : `${remaining} days remaining`}
                </span>
              </div>

              {leave.notes && (
                <p className="text-xs text-gray-400 mt-1 italic">&ldquo;{leave.notes}&rdquo;</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
