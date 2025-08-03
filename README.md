# Twitter Clone — Fullstack App

This project is a **Twitter-like clone** built with:

- **Frontend**: Next.js (React, TypeScript)
- **Backend**: Go
- **Database**: PostgreSQL
- **Object Storage**: MinIO (S3-compatible)

---

## Requirements

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Go](https://golang.org/dl/) (v1.18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (v13 or higher)
- [MinIO](https://min.io/download) (latest stable version)
- [Git](https://git-scm.com/downloads)

---

## Setup Instructions (Linux/macOS/Windows)

### 1. Clone the repository

```bash
git clone https://github.com/rorinuma/twitter.git
cd twitter
```

### 2. Set up environment files

Create environment files by copying the example files:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

Update the environment files (`backend/.env` and `frontend/.env`) with your configuration, if necessary.

### 3. Install and set up PostgreSQL

- Install PostgreSQL on your system (refer to [PostgreSQL downloads](https://www.postgresql.org/download/)).
- Create a database named `twitter`:

```bash
psql -U postgres -c "CREATE DATABASE twitter;"
```

- Initialize the database schema by running the SQL script:

```bash
psql -U postgres -d twitter -f backend/db.sql
```

**Default PostgreSQL credentials** (update in `backend/.env` if needed):

```
POSTGRES_DB=twitter
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### 4. Install and set up MinIO

- Download and install MinIO from [MinIO downloads](https://min.io/download).
- Start the MinIO server:

```bash
minio server ./minio-data --console-address ":9001"
```

**MinIO credentials** (update in `backend/.env` if needed):

```
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_ENDPOINT=localhost:9000
```

- Access the MinIO console at [http://localhost:9001](http://localhost:9001).

### 5. Set up and run the backend

Navigate to the backend directory and install dependencies:

```bash
cd backend
go mod download
```

Start the backend server:

```bash
go run .
```

The backend API will be available at [http://localhost:8080](http://localhost:8080).

### 6. Set up and run the frontend

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## Services

Once set up, the following services will be running:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001)

---

## Troubleshooting

- **Database connection issues**: Ensure PostgreSQL is running and the credentials in `backend/.env` match your setup.
- **MinIO connection issues**: Verify the MinIO server is running and the endpoint/credentials in `backend/.env` are correct.
- **Backend startup issues**: Ensure PostgreSQL and MinIO are running before starting the backend.
- **Frontend issues**: Check that the backend API is running and the `frontend/.env` file points to the correct API endpoint.

To restart the backend or frontend, stop the running process (`Ctrl+C`) and rerun the respective `go run .` or `npm run dev` command.

---

## Useful Commands

| Task                  | Command                                               |
| --------------------- | ----------------------------------------------------- |
| Start PostgreSQL      | (Depends on your system)                              |
| Start MinIO           | `minio server ./minio-data --console-address ":9001"` |
| Start backend         | `cd backend && go run .`                              |
| Start frontend        | `cd frontend && npm run dev`                          |
| Install backend deps  | `cd backend && go mod download`                       |
| Install frontend deps | `cd frontend && npm install`                          |
| Initialize database   | `psql -U postgres -d twitter -f backend/db.sql`       |

---
