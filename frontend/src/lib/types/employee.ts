/**
 * Catalyst API — Employee types.
 *
 * Mirrors the FastAPI backend's Employee Pydantic models.
 */

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
}

export type EmployeeCreate = Omit<Employee, "id">;
