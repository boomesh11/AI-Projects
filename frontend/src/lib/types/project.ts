/**
 * Catalyst API — Project types.
 *
 * Mirrors the FastAPI backend's Project Pydantic models.
 */

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  department: string;
  project_manager: string;
  priority: string;
  start_date: string;
  end_date: string;
}

export type ProjectCreate = Omit<ProjectResponse, "id">;
