# Problem Statement

Built this as a solution for Hero Cycles' pricing problem. Their sales team was stuck using Excel sheets to manage cycle configurations and part prices which broke down every time a part cost changed. This app replaces that with a proper web-based pricing engine where you can manage parts, build cycle configs, and get instant price breakdowns.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js, React, Tailwind CSS, Shadcn UI |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT |

## How to Run

You need **Node.js v18+** installed.

### Backend

```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Runs on `http://localhost:5000`

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`

### Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@herocycles.com | password123 |
| Sales | sales@herocycles.com | password123 |

Admin can manage parts, categories, and configurations. Sales can view configs and see price breakdowns.