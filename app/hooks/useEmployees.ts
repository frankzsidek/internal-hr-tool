"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Employee, Leave, employees as seedEmployees } from "@/app/data/employees";

const STORAGE_KEY = "hr_employees_v1";

// ── Module-level store (single source of truth on the client) ──────────────

let _cache: Employee[] | null = null;
const _listeners = new Set<() => void>();

function getSnapshot(): Employee[] {
  if (_cache === null) _cache = loadFromStorage() ?? seedEmployees;
  return _cache;
}

function getServerSnapshot(): Employee[] {
  return seedEmployees;
}

function subscribe(callback: () => void): () => void {
  _listeners.add(callback);
  return () => _listeners.delete(callback);
}

function dispatch(next: Employee[]): void {
  _cache = next;
  saveToStorage(next);
  _listeners.forEach((l) => l());
}

// ── Storage helpers ────────────────────────────────────────────────────────

function loadFromStorage(): Employee[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Employee[];
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(data: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// ── Calendar sync helpers ──────────────────────────────────────────────────

async function calendarCreate(leave: Leave, employeeName: string): Promise<string | null> {
  try {
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leaveId: leave.id,
        employeeName,
        leaveType: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.eventId ?? null;
  } catch {
    return null;
  }
}

async function calendarUpdate(leave: Leave, employeeName: string): Promise<void> {
  if (!leave.calendarEventId) return;
  try {
    await fetch('/api/calendar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: leave.calendarEventId,
        leaveId: leave.id,
        employeeName,
        leaveType: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
      }),
    });
  } catch {
    // best-effort
  }
}

async function calendarDelete(eventId: string): Promise<void> {
  try {
    await fetch('/api/calendar', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
  } catch {
    // best-effort
  }
}

export function useEmployees() {
  const employees = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addEmployee = useCallback(async (emp: Employee) => {
    const leavesWithEvents = await Promise.all(
      emp.leaves.map(async (leave) => {
        const eventId = await calendarCreate(leave, emp.name);
        return eventId ? { ...leave, calendarEventId: eventId } : leave;
      })
    );
    dispatch([...getSnapshot(), { ...emp, leaves: leavesWithEvents }]);
  }, []);

  const updateEmployee = useCallback(async (updated: Employee) => {
    const old = getSnapshot().find((e) => e.id === updated.id);

    // Optimistically update UI
    dispatch(getSnapshot().map((e) => (e.id === updated.id ? updated : e)));

    if (!old) return;

    // Sync calendar in the background
    const oldLeaveIds = new Set(old.leaves.map((l) => l.id));
    const newLeaveIds = new Set(updated.leaves.map((l) => l.id));

    // Deleted leaves
    for (const leave of old.leaves) {
      if (!newLeaveIds.has(leave.id) && leave.calendarEventId) {
        calendarDelete(leave.calendarEventId);
      }
    }

    // New or changed leaves
    const leavesWithEvents: Leave[] = [];
    for (const leave of updated.leaves) {
      if (!oldLeaveIds.has(leave.id)) {
        const eventId = await calendarCreate(leave, updated.name);
        leavesWithEvents.push(eventId ? { ...leave, calendarEventId: eventId } : leave);
      } else {
        const oldLeave = old.leaves.find((l) => l.id === leave.id)!;
        const changed =
          oldLeave.startDate !== leave.startDate ||
          oldLeave.endDate !== leave.endDate ||
          oldLeave.type !== leave.type;
        const leaveWithId = { ...leave, calendarEventId: leave.calendarEventId ?? oldLeave.calendarEventId };
        if (changed) await calendarUpdate(leaveWithId, updated.name);
        leavesWithEvents.push(leaveWithId);
      }
    }

    // Persist event IDs back
    dispatch(getSnapshot().map((e) =>
      e.id === updated.id ? { ...updated, leaves: leavesWithEvents } : e
    ));
  }, []);

  const removeEmployee = useCallback((id: string) => {
    const emp = getSnapshot().find((e) => e.id === id);
    if (emp) {
      for (const leave of emp.leaves) {
        if (leave.calendarEventId) calendarDelete(leave.calendarEventId);
      }
    }
    dispatch(getSnapshot().filter((e) => e.id !== id));
  }, []);

  return { employees, addEmployee, updateEmployee, removeEmployee };
}
