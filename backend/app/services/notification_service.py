from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Notification, NotificationType, Task, TaskStatus, User
from app.services.telegram_service import send_telegram_message_sync


def list_notifications(db: Session, user: User) -> list[Notification]:
    return list(
        db.scalars(
            select(Notification)
            .where(Notification.user_id == user.id)
            .order_by(Notification.created_at.desc())
        )
    )


def mark_as_read(db: Session, user: User, notification_id: int) -> Notification | None:
    notification = db.scalar(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == user.id)
    )
    if notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
    return notification


def create_notification(
    db: Session,
    user: User,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.SYSTEM,
    task: Task | None = None,
    send_to_telegram: bool = True,
) -> Notification:
    notification = Notification(
        user_id=user.id,
        task_id=task.id if task else None,
        title=title,
        message=message,
        type=notification_type,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    if send_to_telegram:
        send_telegram_message_sync(user, f"{title}\n{message}")

    return notification


def generate_deadline_reminders(db: Session, user: User) -> list[Notification]:
    now = datetime.now(timezone.utc)
    soon = now + timedelta(days=2)
    tasks = db.scalars(
        select(Task).where(
            Task.user_id == user.id,
            Task.status != TaskStatus.DONE,
            Task.deadline.is_not(None),
            Task.deadline <= soon,
        )
    )
    created: list[Notification] = []
    for task in tasks:
        exists = db.scalar(
            select(Notification).where(
                Notification.user_id == user.id,
                Notification.task_id == task.id,
                Notification.type == NotificationType.DEADLINE,
            )
        )
        if exists:
            continue
        notification = create_notification(
            db=db,
            user=user,
            title="Напоминание о дедлайне",
            message=f'Срок задачи "{task.title}" скоро истекает.',
            notification_type=NotificationType.DEADLINE,
            task=task,
        )
        created.append(notification)
    return created
