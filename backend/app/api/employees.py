from typing import List
from fastapi import APIRouter, HTTPException, status

from app.schemas.employee import Employee, EmployeeCreate, EmployeeUpdate
from app.services.employee import EmployeeRepository

router = APIRouter()

# Instantiate the in-memory repository (shared across requests in this module)
repository = EmployeeRepository()


@router.get("/", response_model=List[Employee])
def get_employees():
    """Retrieve all employees."""
    return repository.get_all()


@router.post("/", response_model=Employee, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate):
    """Create a new employee."""
    return repository.create(employee)


@router.put("/{employee_id}", response_model=Employee)
def update_employee(employee_id: str, employee: EmployeeUpdate):
    """Update an existing employee."""
    updated = repository.update(employee_id, employee)
    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return updated


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str):
    """Delete an employee."""
    deleted = repository.delete(employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")
    return None
