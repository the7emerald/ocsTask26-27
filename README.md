# OCS Task 25-26

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Supabase)

## Getting Started

### 1. Database Setup

Ensure your PostgreSQL instance is running and the connection string is set in `backend/.env`.
Run the SQL commands in `backend/database/init.sql` to create the necessary tables.

### 2. Backend

The backend runs on **Port 8000**.

```bash
cd backend
npm install
# Rename .env.example to .env and add your credentials
npm run dev
```

### 3. Frontend

The frontend runs on **Port 3000**.

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- Base URL: `http://localhost:8000`
- Health Check: `GET /`
- Test DB: `GET /test-db`
