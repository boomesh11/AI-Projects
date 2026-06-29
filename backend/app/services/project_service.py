import uuid
from typing import List, Dict, Optional

from app.schemas.project import Project, ProjectCreate, ProjectUpdate


class ProjectRepository:
    def __init__(self):
        # In-memory storage for projects
        self._projects: Dict[str, Project] = {}

    def get_all(self) -> List[Project]:
        return list(self._projects.values())

    def get_by_id(self, project_id: str) -> Optional[Project]:
        return self._projects.get(project_id)

    def create(self, data: ProjectCreate) -> Project:
        new_id = str(uuid.uuid4())
        new_project = Project(id=new_id, **data.model_dump())
        self._projects[new_id] = new_project
        return new_project

    def update(self, project_id: str, data: ProjectUpdate) -> Optional[Project]:
        if project_id not in self._projects:
            return None
        
        existing = self._projects[project_id]
        update_data = data.model_dump(exclude_unset=True)
        updated_project = existing.model_copy(update=update_data)
        
        self._projects[project_id] = updated_project
        return updated_project

    def delete(self, project_id: str) -> bool:
        if project_id in self._projects:
            del self._projects[project_id]
            return True
        return False
