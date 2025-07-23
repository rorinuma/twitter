# Twitter Clone — Fullstack App

This project is a **Twitter-like clone** built with:

- **Frontend**: Next.js (React, TypeScript)
- **Backend**: Go
- **Database**: PostgreSQL
- **Object Storage**: MinIO (S3-compatible)

---

## Requirements

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

> Docker Desktop (Windows/macOS) includes both.

---

## Setup Instructions (Linux/macOS/Windows)

### 1. Clone the repository

```bash
git clone https://github.com/rorinuma/twitter.git
cd twitter
```

### 2. Create environment files

```bash
# docker-compose
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

### 2.1. Remove .env.local from main.go if it's there

```bash

if err := godotenv.Load("env.local"); err != nil {
    log.Fatalf("Error loading .env file: %v", err)
}

# should be like this:
if err := godotenv.Load(); err != nil {
    log.Fatalf("Error loading .env file: %v", err)
}


```

### 3. Start the application

```bash
docker-compose up --build
```

The following services will be available:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8080](http://localhost:8080)
- MinIO Console: [http://localhost:9001](http://localhost:9001)

**MinIO credentials**:

```
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

## Database (PostgreSQL)

PostgreSQL runs inside Docker and is initialized with `./backend/db.sql`.

- Host: `localhost`
- Port: `5432`
- Default credentials (from `.env`):

```
POSTGRES_DB=twitter
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
```

---

## Troubleshooting

If the backend starts before PostgreSQL is ready, run:

```bash
docker-compose restart backend
```

To stop and clean everything:

```bash
docker-compose down -v
```

---

## Useful Commands

| Task                      | Command                          |
| ------------------------- | -------------------------------- |
| Start all services        | `docker-compose up`              |
| Rebuild everything        | `docker-compose up --build`      |
| Restart backend only      | `docker-compose restart backend` |
| Stop all services         | `docker-compose down`            |
| Remove containers/volumes | `docker-compose down -v`         |

---
