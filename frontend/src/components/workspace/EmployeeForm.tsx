/**
 * EmployeeForm — Dynamic form rendered when ui_action is "open_employee_form".
 *
 * Pure presentational component. Does not submit data to a backend.
 * Collects employee details and surfaces Create / Cancel actions.
 *
 * Client Component: requires form state and user interaction.
 */
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { createEmployee } from "@/lib/api/employees";
import type { EmployeeCreate } from "@/lib/types/employee";

interface EmployeeFormData {
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
}

const INITIAL_FORM: EmployeeFormData = {
  name: "",
  department: "",
  role: "",
  email: "",
  phone: "",
};

import type { ExecutionPlan } from "@/lib/types/plan";

interface EmployeeFormProps {
  plan?: ExecutionPlan;
  /** Called when the user clicks Cancel or after successful create. */
  onClose: () => void;
}

/**
 * Shared inline styles for form fields.
 * Uses the Catalyst design token system.
 */
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: "5px",
  letterSpacing: "0.01em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "36px",
  padding: "0 12px",
  fontSize: "14px",
  color: "var(--text-primary)",
  backgroundColor: "var(--surface-inset)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-sm)",
  outline: "none",
  transition: "border-color var(--transition-base)",
  fontFamily: "var(--font-sans)",
};

const FIELDS: { key: keyof EmployeeFormData; label: string; type: string; placeholder: string }[] = [
  { key: "name", label: "Employee Name", type: "text", placeholder: "e.g. Sarah Mitchell" },
  { key: "department", label: "Department", type: "text", placeholder: "e.g. Engineering" },
  { key: "role", label: "Role", type: "text", placeholder: "e.g. Senior Developer" },
  { key: "email", label: "Email", type: "email", placeholder: "e.g. sarah@meridian.co" },
  { key: "phone", label: "Phone", type: "tel", placeholder: "e.g. +1 (555) 123-4567" },
];

export default function EmployeeForm({ plan, onClose }: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeFormData>(() => {
    return {
      ...INITIAL_FORM,
      name: plan?.entities?.name ?? INITIAL_FORM.name,
      department: plan?.entities?.department ?? INITIAL_FORM.department,
    };
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: keyof EmployeeFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    setIsSubmitting(true);
    setError(null);
    try {
      await createEmployee(form as EmployeeCreate);
      setIsSubmitted(true);
      // Dispatch event for other components (like EmployeeTable) to refresh
      window.dispatchEvent(new Event("employeeCreated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div
        style={{
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Success checkmark */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--green-50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 13L9 17L19 7"
              stroke="var(--status-active)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p
          style={{
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--text-primary)",
          }}
        >
          Employee record queued
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            textAlign: "center",
            maxWidth: "320px",
            lineHeight: 1.5,
          }}
        >
          <strong>{form.name || "New employee"}</strong> will be created once the Catalyst Engine is connected.
        </p>

        <Button variant="secondary" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Form header ──────────────────────────────────────────── */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          {/* Person icon */}
          <div
            aria-hidden="true"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--accent-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="5" r="3" stroke="var(--accent)" strokeWidth="1.25" />
              <path
                d="M3 14C3 11.24 5.24 9 8 9C10.76 9 13 11.24 13 14"
                stroke="var(--accent)"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            New Employee
          </h2>
        </div>

        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", paddingLeft: "38px" }}>
          Fill in the details to create a new employee record.
        </p>
      </div>

      {/* ── Form fields ──────────────────────────────────────────── */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label htmlFor={`employee-${field.key}`} style={labelStyle}>
              {field.label}
            </label>
            <input
              id={`employee-${field.key}`}
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-default)";
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Actions ──────────────────────────────────────────────── */}
      {error && (
        <div style={{ padding: "0 24px 16px", color: "var(--status-blocked)", fontSize: "13px" }}>
          {error}
        </div>
      )}
      <div
        style={{
          padding: "16px 24px 20px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
        }}
      >
        <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleCreate} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}
