import { Employee, Leave, formatDateRange, leaveDurationDays } from '@/app/data/employees';

interface UpcomingLeaveRow {
  employee: Employee;
  leave: Leave;
  daysUntilStart: number;
}

interface UpcomingLeavesProps {
  rows: UpcomingLeaveRow[];
}

export function UpcomingLeaves({ rows }: UpcomingLeavesProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-3xl mb-2">📅</div>
        <p className="text-gray-400 text-sm">No upcoming absences scheduled</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">
              Employee
            </th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">
              Type
            </th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">
              Dates
            </th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">
              Duration
            </th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3">
              Starts in
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(({ employee, leave, daysUntilStart }) => {
            const isSick = leave.type === 'sick';
            const duration = leaveDurationDays(leave.startDate, leave.endDate);

            return (
              <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                      style={{ backgroundColor: employee.avatarColor }}
                    >
                      {employee.initials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-xs text-gray-400">{employee.department}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      isSick
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {isSick ? 'Sick Leave' : 'Vacation'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  {formatDateRange(leave.startDate, leave.endDate)}
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  {duration} {duration === 1 ? 'day' : 'days'}
                </td>
                <td className="py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      daysUntilStart <= 7
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {daysUntilStart === 1
                      ? 'Tomorrow'
                      : `${daysUntilStart} days`}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
