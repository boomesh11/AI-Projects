from typing import List
from fastapi import APIRouter, HTTPException, status

from app.schemas.project import Project, ProjectCreate, ProjectUpdate
from app.services.project_service import ProjectRepository

router = APIRouter()

# Instantiate the in-memory repository (shared across requests in this module)
repository = ProjectRepository()


@router.get("/", response_model=List[Project])
def get_projects():
    """Retrieve all projects."""
    return repository.get_all()


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate):
    """Create a new project."""
    return repository.create(project)


@router.put("/{project_id}", response_model=Project)
def update_project(project_id: str, project: ProjectUpdate):
    """Update an existing project."""
    updated = repository.update(project_id, project)
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str):
    """Delete a project."""
    deleted = repository.delete(project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return None
