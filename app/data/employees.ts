export type LeaveType = 'sick' | 'vacation';

export interface Leave {
  id: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  notes?: string;
  calendarEventId?: string; // Google Calendar event ID
}

export interface Employee {
  id: string;
  name: string;
  initials: string;
  department: string;
  role: string;
  email: string;
  birthday: string;   // YYYY-MM-DD
  nameDay?: string;   // YYYY-MM-DD (year is placeholder 2000; only MM-DD matters)
  hireDate?: string;  // YYYY-MM-DD
  avatarColor: string;
  leaves: Leave[];
}

export const employees: Employee[] = [];

// ─── Helper utilities ─────────────────────────────────────────────────────────

export function isActiveLeave(leave: Leave, today: Date): boolean {
  const todayStr = toDateStr(today);
  return leave.startDate <= todayStr && leave.endDate >= todayStr;
}

export function isUpcomingLeave(leave: Leave, today: Date, withinDays = 60): boolean {
  const todayStr = toDateStr(today);
  const future = new Date(today);
  future.setDate(future.getDate() + withinDays);
  const futureStr = toDateStr(future);
  return leave.startDate > todayStr && leave.startDate <= futureStr;
}

export function daysRemaining(endDate: string, today: Date): number {
  const end = parseDate(endDate);
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((end.getTime() - todayNorm.getTime()) / 86_400_000);
}

export function daysUntilBirthday(birthday: string, today: Date): number {
  const [, mm, dd] = birthday.split('-').map(Number);
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let next = new Date(today.getFullYear(), mm - 1, dd);
  if (next < todayNorm) next = new Date(today.getFullYear() + 1, mm - 1, dd);
  return Math.floor((next.getTime() - todayNorm.getTime()) / 86_400_000);
}

export function formatDateRange(start: string, end: string): string {
  const s = parseDate(start);
  const e = parseDate(end);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const yearOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', yearOpts)}`;
  }
  return `${s.toLocaleDateString('en-US', yearOpts)} – ${e.toLocaleDateString('en-US', yearOpts)}`;
}

export function formatBirthday(birthday: string): string {
  const [, mm, dd] = birthday.split('-').map(Number);
  return new Date(2000, mm - 1, dd).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

// nameDay uses the same MM-DD logic as birthday (year is ignored)
export const formatNameDay = formatBirthday;
export const daysUntilNameDay = daysUntilBirthday;

export function formatHireDate(hireDate: string): string {
  return parseDate(hireDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function employeeTenure(hireDate: string, today: Date): string {
  const start = parseDate(hireDate);
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let years = todayNorm.getFullYear() - start.getFullYear();
  let months = todayNorm.getMonth() - start.getMonth();
  if (months < 0) { years -= 1; months += 12; }
  if (years > 0 && months > 0) return `${years}y ${months}m`;
  if (years > 0) return `${years}y`;
  if (months > 0) return `${months}m`;
  const days = Math.floor((todayNorm.getTime() - start.getTime()) / 86_400_000);
  return `${days}d`;
}

export function leaveDurationDays(startDate: string, endDate: string): number {
  return Math.ceil((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / 86_400_000) + 1;
}

// ─── Leave quota tracking ──────────────────────────────────────────────────────

export const VACATION_QUOTA = 20;
export const SICK_QUOTA = 5;

/** Calendar days of a given leave type used by an employee within `year`. */
export function leaveUsedDays(employee: Employee, type: LeaveType, year: number): number {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  let total = 0;
  for (const leave of employee.leaves) {
    if (leave.type !== type) continue;
    const start = parseDate(leave.startDate);
    const end = parseDate(leave.endDate);
    const overlapStart = start > yearStart ? start : yearStart;
    const overlapEnd = end < yearEnd ? end : yearEnd;
    if (overlapEnd >= overlapStart) {
      total += Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 86_400_000) + 1;
    }
  }
  return total;
}

/** Days remaining within the quota (clamped to 0). */
export function leaveRemainingDays(employee: Employee, type: LeaveType, year: number): number {
  const quota = type === 'vacation' ? VACATION_QUOTA : SICK_QUOTA;
  return Math.max(0, quota - leaveUsedDays(employee, type, year));
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}
