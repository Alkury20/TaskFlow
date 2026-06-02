from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Category, Notification, NotificationType, Task, TaskPriority, TaskStatus, User


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.scalar(select(User).where(User.email == "demo@taskflow.dev"))
        if not user:
            user = User(
                email="demo@taskflow.dev",
                username="Demo User",
                hashed_password=get_password_hash("password123"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if not user.categories:
            categories = [
                Category(user_id=user.id, name="Frontend", color="#8b5cf6"),
                Category(user_id=user.id, name="Backend", color="#06b6d4"),
                Category(user_id=user.id, name="Study", color="#f97316"),
            ]
            db.add_all(categories)
            db.commit()
            for category in categories:
                db.refresh(category)

        categories = list(db.scalars(select(Category).where(Category.user_id == user.id)))
        if not user.tasks:
            now = datetime.now(timezone.utc)
            tasks = [
                Task(
                    user_id=user.id,
                    category_id=categories[0].id,
                    title="Design dashboard cards",
                    description="Prepare modern statistic cards with hover states.",
                    status=TaskStatus.IN_PROGRESS,
                    priority=TaskPriority.HIGH,
                    deadline=now + timedelta(days=1),
                ),
                Task(
                    user_id=user.id,
                    category_id=categories[1].id,
                    title="Protect task endpoints",
                    description="Add JWT dependency and ownership checks.",
                    status=TaskStatus.REVIEW,
                    priority=TaskPriority.URGENT,
                    deadline=now + timedelta(days=2),
                ),
                Task(
                    user_id=user.id,
                    category_id=categories[2].id,
                    title="Write coursework README",
                    description="Document architecture and local startup.",
                    status=TaskStatus.TODO,
                    priority=TaskPriority.MEDIUM,
                    deadline=now + timedelta(days=5),
                ),
                Task(
                    user_id=user.id,
                    category_id=categories[0].id,
                    title="Polish Kanban interactions",
                    description="Add animations and responsive columns.",
                    status=TaskStatus.DONE,
                    priority=TaskPriority.LOW,
                    deadline=now - timedelta(days=1),
                ),
            ]
            db.add_all(tasks)
            db.commit()

        if not user.notifications:
            db.add(
                Notification(
                    user_id=user.id,
                    title="Welcome to TaskFlow",
                    message="Your workspace is ready. Start by creating a new task.",
                    type=NotificationType.SYSTEM,
                )
            )
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
