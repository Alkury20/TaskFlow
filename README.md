# TaskFlow SaaS

Клиент-серверное веб-приложение менеджера задач с JWT-авторизацией, Kanban-доской, уведомлениями о дедлайнах и аналитикой.

## Стек

- Frontend: React, Vite, TypeScript, TailwindCSS, React Router, Axios, Zustand, Framer Motion, shadcn-style UI, Recharts.
- Backend: Python, FastAPI, SQLAlchemy, PostgreSQL, Pydantic, JWT.
- Инфраструктура: Docker Compose, `.env`, Swagger/OpenAPI, CORS.

## Быстрый Запуск

1. Скопируйте переменные окружения:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Запустите проект:

```bash
docker compose up --build
```

3. Откройте:

- Frontend: http://localhost:5173
- Backend Swagger: http://localhost:8000/docs

## Seed Данные

После запуска backend можно заполнить базу демонстрационными данными:

```bash
docker compose exec backend python -m app.db.seed
```

Тестовый пользователь:

- Email: `demo@taskflow.dev`
- Password: `password123`

## Локальный Запуск Без Docker

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```
