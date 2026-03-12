# Personal Progress Tracker

A full-stack, AI-ready web application designed for developers to track their learning roadmap, solve Data Structures & Algorithms (DSA) challenges, and maintain their coding streaks. Built with a modern, cyberpunk-inspired, dark-mode aesthetic.

## 🚀 Features

*   **Interactive Learning Roadmap**: Track your progress through Full-Stack and AI Engineering modules.
*   **DSA Tracker**: Integrated Striver's SDE Sheet (191 Questions) with progress tracking and note-taking capabilities.
*   **Analytics Dashboard**: Visual representations of your learning progress, completed items, and daily streak.
*   **User Authentication**: Secure JWT-based registration and login system.
*   **Modern UI/UX**: Built with Tailwind CSS, Shadcn UI, Recharts, and Framer Motion for a premium, developer-focused aesthetic.
*   **Dockerized Environment**: Effortless local setup using Docker Compose orchestrating the frontend, backend, and PostgreSQL database.

## 🛠️ Tech Stack

### Frontend (Client)
*   [Next.js 15](https://nextjs.org/) (App Router, React 19)
*   [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   [Zustand](https://github.com/pmndrs/zustand) (State Management)
*   [React Query](https://tanstack.com/query/latest) (Data Fetching)
*   [Recharts](https://recharts.org/) (Data Visualization)

### Backend (Server)
*   [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Prisma ORM](https://www.prisma.io/)
*   [PostgreSQL](https://www.postgresql.org/)
*   [JSON Web Tokens (JWT)](https://jwt.io/) (Authentication)

---

## 🏗️ Project Architecture

```plaintext
personal-progress-tracker/
├── client/                 # Next.js Frontend Application
│   ├── src/app/            # App Router pages (Dashboard, DSA, Auth)
│   ├── src/components/     # Reusable UI components & layouts
│   └── src/hooks/          # React Query hooks for API communication
├── server/                 # Node.js/Express Backend Application
│   ├── prisma/             # Database schema and seed scripts
│   ├── src/controllers/    # Route handlers for business logic
│   ├── src/routes/         # API endpoint definitions
│   └── src/services/       # Database interactions (Prisma client)
├── docker-compose.yml      # Multi-container orchestration
└── .gitignore              # Ignored files and directories
```

---

## ⚙️ Local Setup & Installation

The easiest way to run the entire stack (Database, Backend API, and Frontend web client) is to use Docker.

### Prerequisites
*   [Docker](https://www.docker.com/get-started) and Docker Compose installed on your machine.
*   [Node.js](https://nodejs.org/) (if running locally without Docker)

### 1. Environment Variables
Inside the `/server` directory, create a `.env` file for your Prisma database connection and JWT secrets:
```env
DATABASE_URL="postgresql://postgres:password@postgres:5432/personal_progress_assistant?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
JWT_REFRESH_SECRET="your_super_secret_refresh_key"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

Inside the `/client` directory, create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
```

### 2. Start the Application via Docker

From the root directory of the project, run:
```bash
docker-compose up --build
```
*Wait approximately ~30 seconds for the database and Next.js compiler to start.*

### 3. Apply Database Migrations (First Run Only)

If this is your first time starting the server, you need to apply the Prisma schema to the running PostgreSQL container.

Open a new terminal window and run:
```bash
docker exec -it ppt_server npx prisma migrate dev --name init
```

### 4. Seed the Database (Optional but Recommended)

To populate the database with the core roadmap syllabus, the 191 Striver's SDE questions, and simulated progress to test the dashboard out:

```bash
# Seed Roadmap Syllabus
docker exec -it ppt_server node prisma/seed.js

# Seed DSA Questions
docker exec -it ppt_server node seed-191.js
```

### 5. Access the App
Open your browser and navigate to:
*   **Frontend UI:** `http://localhost:3000`
*   **Backend API:** `http://localhost:5001` (Docker mapped port)

---

## 🔒 Authentication Flow
The app uses an Access Token / Refresh Token flow.
1. User logs in via `/api/auth/login`.
2. The server returns a short-lived `accessToken` and an `httpOnly` secure `refreshToken` cookie.
3. The frontend passes the `accessToken` inside the `Authorization: Bearer <token>` header for all authenticated requests.
4. If the `accessToken` expires, the frontend's Axios interceptor automatically hits the `/api/auth/refresh` endpoint to obtain a new token using the secure cookie, ensuring a seamless user experience.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
