"""Backend package for Hospital Management System."""

"""CRUD operations module."""

from crud.user import UserCRUD
from crud.employee import EmployeeCRUD
from crud.department import DepartmentCRUD
from crud.patient import PatientCRUD
from crud.room import RoomCRUD
from crud.badge import BadgeCRUD
from crud.shift import ShiftCRUD
from crud.admission import AdmissionCRUD
from crud.activity import ActivityCRUD

__all__ = [
    'UserCRUD',
    'EmployeeCRUD',
    'DepartmentCRUD',
    'PatientCRUD',
    'RoomCRUD',
    'BadgeCRUD',
    'ShiftCRUD',
    'AdmissionCRUD',
    'ActivityCRUD',
]