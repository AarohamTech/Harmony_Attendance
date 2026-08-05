from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.employee import Employee

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("")
def list_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Employee)
    if search:
        query = query.filter((Employee.name.ilike(f"%{search}%")) | (Employee.badge_id.ilike(f"%{search}%")))
    if department:
        query = query.filter(Employee.department.ilike(f"%{department}%"))
    
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "items": [
            {
                "id": e.id,
                "name": e.name,
                "email": e.email,
                "badge_id": e.badge_id,
                "role": e.role,
                "department": e.department
            } for e in items
        ],
        "total": total,
        "page": page,
        "limit": limit
    }
