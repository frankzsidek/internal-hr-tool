import {
  Employee,
  LeaveType,
  VACATION_QUOTA,
  SICK_QUOTA,
  leaveUsedDays,
  leaveRemainingDays,
} from '@/app/data/employees';

interface LeaveBalancesProps {
  employees: Employee[];
  year: number;
}

export function LeaveBalances({ employees, year }: LeaveBalancesProps) {
  const rows = employees
    .map((emp) => ({
      emp,
      vacUsed: leaveUsedDays(emp, 'vacation', year),
      vacLeft: leaveRemainingDays(emp, 'vacation', year),
      sickUsed: leaveUsedDays(emp, 'sick', year),
      sickLeft: leaveRemainingDays(emp, 'sick', year),
    }))
    .sort((a, b) => a.vacLeft - b.vacLeft); // show most consumed first

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-6">Employee</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-6">Vacation ({VACATION_QUOTA} days)</th>
            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3">Sick Leave ({SICK_QUOTA} days)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(({ emp, vacUsed, vacLeft, sickUsed, sickLeft }) => (
            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
              {/* Employee */}
              <td className="py-3 pr-6">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ backgroundColor: emp.avatarColor }}
                  >
                    {emp.initials}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.department}</p>
                  </div>
                </div>
              </td>

              {/* Vacation */}
              <td className="py-3 pr-6">
                <QuotaBar used={vacUsed} quota={VACATION_QUOTA} remaining={vacLeft} type="vacation" />
              </td>

              {/* Sick leave */}
              <td className="py-3">
                <QuotaBar used={sickUsed} quota={SICK_QUOTA} remaining={sickLeft} type="sick" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Bar sub-component ────────────────────────────────────────────────────────

interface QuotaBarProps {
  used: number;
  quota: number;
  remaining: number;
  type: LeaveType;
}

function QuotaBar({ used, quota, remaining, type }: QuotaBarProps) {
  const pct = Math.min(100, Math.round((used / quota) * 100));
  const isVacation = type === 'vacation';

  // Color thresholds
  let barColor: string;
  let textColor: string;
  let bgColor: string;
  if (remaining === 0) {
    barColor = 'bg-red-500';
    textColor = 'text-red-600';
    bgColor = 'bg-red-50';
  } else if (isVacation ? remaining <= 5 : remaining <= 1) {
    barColor = 'bg-orange-400';
    textColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
  } else {
    barColor = isVacation ? 'bg-sky-400' : 'bg-amber-400';
    textColor = isVacation ? 'text-sky-700' : 'text-amber-700';
    bgColor = isVacation ? 'bg-sky-50' : 'bg-amber-50';
  }

  const label = remaining === 0
    ? 'None left'
    : `${remaining} left`;

  return (
    <div className="min-w-36">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{used} used</span>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${bgColor} ${textColor}`}>
          {label}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5">{pct}% of {quota} days</p>
    </div>
  );
}
