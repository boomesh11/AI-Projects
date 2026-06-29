import uuid
from typing import List, Dict, Optional

from app.schemas.employee import Employee, EmployeeCreate, EmployeeUpdate


class EmployeeRepository:
    def __init__(self):
        # In-memory storage for employees
        self._employees: Dict[str, Employee] = {}

    def get_all(self) -> List[Employee]:
        return list(self._employees.values())

    def get_by_id(self, employee_id: str) -> Optional[Employee]:
        return self._employees.get(employee_id)

    def create(self, data: EmployeeCreate) -> Employee:
        new_id = str(uuid.uuid4())
        new_employee = Employee(id=new_id, **data.model_dump())
        self._employees[new_id] = new_employee
        return new_employee

    def update(self, employee_id: str, data: EmployeeUpdate) -> Optional[Employee]:
        if employee_id not in self._employees:
            return None
        
        existing = self._employees[employee_id]
        update_data = data.model_dump(exclude_unset=True)
        updated_employee = existing.model_copy(update=update_data)
        
        self._employees[employee_id] = updated_employee
        return updated_employee

    def delete(self, employee_id: str) -> bool:
        if employee_id in self._employees:
            del self._employees[employee_id]
            return True
        return False
