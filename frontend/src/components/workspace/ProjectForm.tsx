import { useState } from "react";
import Button from "@/components/ui/Button";
import { createProject } from "@/lib/api/projects";
import type { ProjectCreate } from "@/lib/types/project";

interface ProjectFormData {
  name: string;
  description: string;
  department: string;
  project_manager: string;
  priority: string;
  start_date: string;
  end_date: string;
}

const INITIAL_FORM: ProjectFormData = {
  name: "",
  description: "",
  department: "",
  project_manager: "",
  priority: "medium",
  start_date: "",
  end_date: "",
};

import type { ExecutionPlan } from "@/lib/types/plan";

interface ProjectFormProps {
  plan?: ExecutionPlan;
  onClose: () => void;
}

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

export default function ProjectForm({ plan, onClose }: ProjectFormProps) {
  const [form, setForm] = useState<ProjectFormData>(() => {
    return {
      ...INITIAL_FORM,
      name: plan?.entities?.project_name ?? INITIAL_FORM.name,
      department: plan?.entities?.department ?? INITIAL_FORM.department,
      priority: plan?.entities?.priority?.toLowerCase() ?? INITIAL_FORM.priority,
    };
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: keyof ProjectFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    setIsSubmitting(true);
    setError(null);
    try {
      await createProject(form as ProjectCreate);
      setIsSubmitted(true);
      window.dispatchEvent(new Event("projectCreated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
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
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "24px",
            backgroundColor: "var(--status-active)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          ✓
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
            Project created
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {form.name} has been successfully created.
          </p>
        </div>
        <div style={{ marginTop: "16px" }}>
          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "14px",
              backgroundColor: "var(--surface-raised)",
              border: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "14px" }}>⚡</span>
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            New Project
          </h2>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-tertiary)", paddingLeft: "38px" }}>
          Provide the details to launch a new project.
        </p>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Basic Info */}
        <div>
          <label htmlFor="project-name" style={labelStyle}>Project Name</label>
          <input
            id="project-name"
            type="text"
            placeholder="e.g. Project Apollo"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="project-desc" style={labelStyle}>Description</label>
          <input
            id="project-desc"
            type="text"
            placeholder="e.g. Migration to next-gen infrastructure"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Two-column layout for some fields */}
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="project-dept" style={labelStyle}>Department</label>
            <input
              id="project-dept"
              type="text"
              placeholder="e.g. Engineering"
              value={form.department}
              onChange={(e) => handleChange("department", e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="project-manager" style={labelStyle}>Project Manager</label>
            <input
              id="project-manager"
              type="text"
              placeholder="e.g. Alex"
              value={form.project_manager}
              onChange={(e) => handleChange("project_manager", e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="project-start" style={labelStyle}>Start Date</label>
            <input
              id="project-start"
              type="date"
              value={form.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="project-end" style={labelStyle}>End Date</label>
            <input
              id="project-end"
              type="date"
              value={form.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

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
