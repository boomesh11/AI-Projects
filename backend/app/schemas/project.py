from typing import Optional
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    name: str = Field(..., description="Name of the project")
    description: str = Field(..., description="Project description")
    department: str = Field(..., description="Department owning the project")
    project_manager: str = Field(..., description="Name of the project manager")
    priority: str = Field(..., description="Priority (e.g. high, medium, low)")
    start_date: str = Field(..., description="Start date of the project")
    end_date: str = Field(..., description="End date of the project")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    project_manager: Optional[str] = None
    priority: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class Project(ProjectBase):
    id: str = Field(..., description="Unique identifier for the project")

    class Config:
        from_attributes = True
