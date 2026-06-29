/**
 * ProjectTable — Dynamic table rendering the live list of projects.
 *
 * Fetches data from the backend on mount.
 * Listens for the `projectCreated` window event to refresh automatically.
 *
 * Client Component.
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import type { ProjectResponse } from "@/lib/types/project";
import { getProjects } from "@/lib/api/projects";
import Badge from "@/components/ui/Badge";
import HoverRow from "@/components/ui/HoverRow";

export default function ProjectTable() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    const handleProjectCreated = () => {
      fetchProjects();
    };

    window.addEventListener("projectCreated", handleProjectCreated);
    return () => {
      window.removeEventListener("projectCreated", handleProjectCreated);
    };
  }, [fetchProjects]);

  if (isLoading) {
    return <div className="type-meta">Loading projects...</div>;
  }

  if (error) {
    return <div style={{ color: "var(--status-blocked)" }}>{error}</div>;
  }

  return (
    <div>
      <p className="type-section-label" style={{ marginBottom: "12px" }}>
        Active Projects · {projects.length}
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
        <span className="type-section-label" style={{ flex: 1, paddingLeft: "16px" }}>
          Project
        </span>
        <span className="type-section-label" style={{ minWidth: "120px" }}>
          Department
        </span>
        <span className="type-section-label" style={{ minWidth: "120px" }}>
          Manager
        </span>
        <span
          className="type-section-label"
          style={{ minWidth: "160px", textAlign: "right", paddingRight: "16px" }}
        >
          Timeline
        </span>
      </div>

      {projects.length === 0 ? (
        <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-secondary)" }}>
          No projects found. Use the command bar to create one.
        </div>
      ) : (
        projects.map((project) => (
          <HoverRow key={project.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {project.name}
                  </p>
                  <Badge variant={`priority-${project.priority?.toLowerCase() || "medium"}` as any} />
                </div>
                <span className="type-meta" style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {project.description}
                </span>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  minWidth: "120px",
                }}
              >
                <span className="type-meta" style={{ color: "var(--text-primary)" }}>{project.department}</span>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  minWidth: "120px",
                }}
              >
                <span className="type-meta">{project.project_manager}</span>
              </div>

              <div style={{ flexShrink: 0, minWidth: "160px", textAlign: "right" }}>
                <span className="type-meta" style={{ display: "block" }}>
                  {project.start_date || "-"}
                </span>
                <span className="type-meta">
                  to {project.end_date || "-"}
                </span>
              </div>
            </div>
          </HoverRow>
        ))
      )}
    </div>
  );
}
