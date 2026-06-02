from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import TaskPriority, TaskStatus, User
from app.schemas.task import TaskCreate, TaskRead, TaskStatusUpdate, TaskUpdate
from app.services.task_service import create_task, delete_task, get_task, list_tasks, update_task

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskRead])
def get_tasks(
    search: str | None = None,
    status_filter: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    category_id: int | None = None,
    sort: str = "created_desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskRead]:
    return list_tasks(db, current_user, search, status_filter, priority, category_id, sort)


@router.post("", response_model=TaskRead, status_code=201)
def create(payload: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_task(db, current_user, payload)


@router.get("/{task_id}", response_model=TaskRead)
def detail(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_task(db, current_user, task_id)


@router.put("/{task_id}", response_model=TaskRead)
def update(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_task(db, current_user, task_id, payload)


@router.patch("/{task_id}/status", response_model=TaskRead)
def update_status(
    task_id: int,
    payload: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_task(db, current_user, task_id, TaskUpdate(status=payload.status))


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    delete_task(db, current_user, task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
