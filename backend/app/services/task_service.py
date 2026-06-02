from fastapi import HTTPException, status
from sqlalchemy import Select, asc, desc, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models import Category, NotificationType, Task, TaskPriority, TaskStatus, User
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.notification_service import create_notification

STATUS_LABELS = {
    TaskStatus.TODO: "К выполнению",
    TaskStatus.IN_PROGRESS: "В работе",
    TaskStatus.REVIEW: "На проверке",
    TaskStatus.DONE: "Готово",
}


def _task_query(user_id: int) -> Select[tuple[Task]]:
    return select(Task).options(joinedload(Task.category)).where(Task.user_id == user_id)


def list_tasks(
    db: Session,
    user: User,
    search: str | None = None,
    status_filter: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    category_id: int | None = None,
    sort: str = "created_desc",
) -> list[Task]:
    query = _task_query(user.id)
    if search:
        pattern = f"%{search}%"
        query = query.where(or_(Task.title.ilike(pattern), Task.description.ilike(pattern)))
    if status_filter:
        query = query.where(Task.status == status_filter)
    if priority:
        query = query.where(Task.priority == priority)
    if category_id:
        query = query.where(Task.category_id == category_id)

    sort_map = {
        "deadline_asc": asc(Task.deadline).nullslast(),
        "deadline_desc": desc(Task.deadline).nullslast(),
        "priority": desc(Task.priority),
        "created_asc": asc(Task.created_at),
        "created_desc": desc(Task.created_at),
    }
    query = query.order_by(sort_map.get(sort, desc(Task.created_at)))
    return list(db.scalars(query).unique())


def get_task(db: Session, user: User, task_id: int) -> Task:
    task = db.scalar(_task_query(user.id).where(Task.id == task_id))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def ensure_category(db: Session, user: User, category_id: int | None) -> None:
    if category_id is None:
        return
    exists = db.scalar(select(Category).where(Category.id == category_id, Category.user_id == user.id))
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")


def create_task(db: Session, user: User, payload: TaskCreate) -> Task:
    ensure_category(db, user, payload.category_id)
    task = Task(user_id=user.id, **payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return get_task(db, user, task.id)


def update_task(db: Session, user: User, task_id: int, payload: TaskUpdate) -> Task:
    task = get_task(db, user, task_id)
    old_status = task.status
    data = payload.model_dump(exclude_unset=True)
    ensure_category(db, user, data.get("category_id"))
    for key, value in data.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    if "status" in data and task.status != old_status:
        create_notification(
            db=db,
            user=user,
            title="Статус задачи изменен",
            message=f'Задача "{task.title}" переведена в статус "{STATUS_LABELS[task.status]}".',
            notification_type=NotificationType.STATUS,
            task=task,
        )
    return get_task(db, user, task.id)


def delete_task(db: Session, user: User, task_id: int) -> None:
    task = get_task(db, user, task_id)
    db.delete(task)
    db.commit()
