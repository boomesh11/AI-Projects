/**
 * Employee API Client.
 *
 * Provides CRUD operations for Employee entities.
 */

import type { Employee, EmployeeCreate } from "@/lib/types/employee";

const API_BASE = process.env.NEXT_PUBLIC_CATALYST_API_URL ?? "http://localhost:8000";

export async function getEmployees(): Promise<Employee[]> {
  const response = await fetch(`${API_BASE}/employees/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.statusText}`);
  }
  return response.json();
}

export async function createEmployee(data: EmployeeCreate): Promise<Employee> {
  const response = await fetch(`${API_BASE}/employees/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create employee: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteEmployee(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/employees/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete employee: ${response.statusText}`);
  }
}
