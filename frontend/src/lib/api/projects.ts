/**
 * Project API Client.
 *
 * Provides CRUD operations for Project entities.
 */

import type { ProjectResponse, ProjectCreate } from "@/lib/types/project";

const API_BASE = process.env.NEXT_PUBLIC_CATALYST_API_URL ?? "http://localhost:8000";

export async function getProjects(): Promise<ProjectResponse[]> {
  const response = await fetch(`${API_BASE}/projects/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  return response.json();
}

export async function createProject(data: ProjectCreate): Promise<ProjectResponse> {
  const response = await fetch(`${API_BASE}/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.statusText}`);
  }
  return response.json();
}
