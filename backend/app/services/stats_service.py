from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Notification, Task, TaskPriority, TaskStatus, User


def get_stats(db: Session, user: User) -> dict:
    total = db.scalar(select(func.count(Task.id)).where(Task.user_id == user.id)) or 0
    completed = (
        db.scalar(select(func.count(Task.id)).where(Task.user_id == user.id, Task.status == TaskStatus.DONE))
        or 0
    )
    now = datetime.now(timezone.utc)
    overdue = (
        db.scalar(
            select(func.count(Task.id)).where(
                Task.user_id == user.id,
                Task.deadline < now,
                Task.status != TaskStatus.DONE,
            )
        )
        or 0
    )
    unread = (
        db.scalar(
            select(func.count(Notification.id)).where(
                Notification.user_id == user.id,
                Notification.is_read.is_(False),
            )
        )
        or 0
    )

    by_status = {status.value: 0 for status in TaskStatus}
    for status, count in db.execute(
        select(Task.status, func.count(Task.id)).where(Task.user_id == user.id).group_by(Task.status)
    ):
        by_status[status.value] = count

    by_priority = {priority.value: 0 for priority in TaskPriority}
    for priority, count in db.execute(
        select(Task.priority, func.count(Task.id)).where(Task.user_id == user.id).group_by(Task.priority)
    ):
        by_priority[priority.value] = count

    weekly_completed = []
    for day in range(6, -1, -1):
        date = (now - timedelta(days=day)).date()
        count = (
            db.scalar(
                select(func.count(Task.id)).where(
                    Task.user_id == user.id,
                    Task.status == TaskStatus.DONE,
                    func.date(Task.updated_at) == date,
                )
            )
            or 0
        )
        weekly_completed.append({"date": date.isoformat(), "count": count})

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "overdue_tasks": overdue,
        "unread_notifications": unread,
        "completion_rate": round((completed / total) * 100, 1) if total else 0,
        "by_status": by_status,
        "by_priority": by_priority,
        "weekly_completed": weekly_completed,
    }
