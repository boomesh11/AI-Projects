from typing import Optional
from pydantic import BaseModel, Field


class EmployeeBase(BaseModel):
    name: str = Field(..., description="Full name of the employee")
    department: str = Field(..., description="Department name")
    role: str = Field(..., description="Job role or title")
    email: str = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class Employee(EmployeeBase):
    id: str = Field(..., description="Unique identifier for the employee")

    class Config:
        from_attributes = True
