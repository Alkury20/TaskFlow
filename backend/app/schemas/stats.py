from pydantic import BaseModel


class StatsRead(BaseModel):
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int
    unread_notifications: int
    completion_rate: float
    by_status: dict[str, int]
    by_priority: dict[str, int]
    weekly_completed: list[dict[str, int | str]]
