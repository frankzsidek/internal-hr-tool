"use client";

import { useState, useEffect } from "react";
import { Employee, employees as seedEmployees } from "@/app/data/employees";

const STORAGE_KEY = "hr_employees_v1";

function loadFromStorage(): Employee[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Employee[];
  } catch {
    // ignore parse errors
  }
  return null;
}

function saveToStorage(data: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function useEmployees() {
  // Start with seed data so the SSR render and first client render match.
  // After mount we swap in localStorage data if it exists.
  const [employees, setEmployees] = useState<Employee[]>(seedEmployees);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) setEmployees(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveToStorage(employees);
  }, [employees, hydrated]);

  function addEmployee(emp: Employee) {
    setEmployees((prev) => [...prev, emp]);
  }

  function updateEmployee(emp: Employee) {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
  }

  function removeEmployee(id: string) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  return { employees, hydrated, addEmployee, updateEmployee, removeEmployee };
}
