/**
 * EmployeeTable — Dynamic table rendering the live list of employees.
 *
 * Fetches data from the backend on mount.
 * Listens for the `employeeCreated` window event to refresh automatically.
 *
 * Client Component.
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import type { Employee } from "@/lib/types/employee";
import { getEmployees } from "@/lib/api/employees";
import { Avatar } from "@/components/ui/Avatar";
import HoverRow from "@/components/ui/HoverRow";

export default function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setError(null);
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and listen for creation events
  useEffect(() => {
    fetchEmployees();

    const handleEmployeeCreated = () => {
      fetchEmployees();
    };

    window.addEventListener("employeeCreated", handleEmployeeCreated);
    return () => {
      window.removeEventListener("employeeCreated", handleEmployeeCreated);
    };
  }, [fetchEmployees]);

  if (isLoading) {
    return <div className="type-meta">Loading employees...</div>;
  }

  if (error) {
    return <div style={{ color: "var(--status-blocked)" }}>{error}</div>;
  }

  return (
    <div>
      <p className="type-section-label" style={{ marginBottom: "12px" }}>
        Employees · {employees.length} records
      </p>

      {/* Column headers */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          paddingBottom: "8px",
          borderBottom: "1px solid var(--border-default)",
          marginBottom: "0",
        }}
      >
        <div style={{ width: "32px" }} aria-hidden="true" />
        <span className="type-section-label" style={{ flex: 1 }}>
          Name
        </span>
        <span className="type-section-label" style={{ minWidth: "120px" }}>
          Department
        </span>
        <span
          className="type-section-label"
          style={{ minWidth: "200px", textAlign: "right" }}
        >
          Contact
        </span>
      </div>

      {employees.length === 0 ? (
        <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-secondary)" }}>
          No employees found. Use the command bar to create one.
        </div>
      ) : (
        employees.map((employee) => (
          <HoverRow key={employee.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 0",
              }}
            >
              <Avatar name={employee.name} size="md" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: "3px",
                  }}
                >
                  {employee.name}
                </p>
                <span className="type-meta">{employee.role}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                  minWidth: "120px",
                }}
              >
                <span className="type-meta" style={{ color: "var(--text-primary)" }}>{employee.department}</span>
              </div>

              <div style={{ flexShrink: 0, minWidth: "200px", textAlign: "right" }}>
                <span className="type-meta" style={{ display: "block" }}>
                  {employee.email}
                </span>
                <span className="type-meta">
                  {employee.phone}
                </span>
              </div>
            </div>
          </HoverRow>
        ))
      )}
    </div>
  );
}
