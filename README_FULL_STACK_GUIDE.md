# AMIS - Full Stack Implementation Guide

This project is currently running in **Frontend Demo Mode** (React SPA). 
Below are the files and configurations required to build the full backend infrastructure as requested.

## 1. Docker Infrastructure (`docker-compose.yml`)

Save this as `docker-compose.yml` in the root:

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: amis_db
      MYSQL_USER: amis_user
      MYSQL_PASSWORD: amis_password
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build: ./backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "mysql://amis_user:amis_password@db:3306/amis_db"
      JWT_SECRET: "your_jwt_secret_key"
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  db_data:
```

## 2. Database Schema (`prisma/schema.prisma`)

For the Backend (Node/Express + Prisma):

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      String   // Admin, President, etc.
  member    Member?
  createdAt DateTime @default(now())
}

model Member {
  id          Int      @id @default(autoincrement())
  userId      Int      @unique
  user        User     @relation(fields: [userId], references: [id])
  fullName    String
  studentId   String   @unique
  phone       String?
  committees  MemberCommittee[]
  tasks       TaskAssignee[]
}

model Committee {
  id      Int               @id @default(autoincrement())
  name    String
  members MemberCommittee[]
}

model MemberCommittee {
  memberId    Int
  committeeId Int
  member      Member    @relation(fields: [memberId], references: [id])
  committee   Committee @relation(fields: [committeeId], references: [id])

  @@id([memberId, committeeId])
}

model FinanceEntry {
  id          Int      @id @default(autoincrement())
  type        String   // Income, Expense
  amount      Float
  description String
  date        DateTime
}
// Add Event, Task models similarly...
```

## 3. Backend Setup

1. Initialize: `npm init -y` inside `backend/` folder.
2. Install: `npm install express prisma @prisma/client cors dotenv jsonwebtoken bcryptjs`
3. Dev: `npm install -D typescript ts-node @types/node @types/express`

## 4. Restore/Backup Script (`scripts/backup.sh`)

```bash
#!/bin/bash
# Backup MySQL Database
docker exec amis-db-1 mysqldump -u amis_user -pamis_password amis_db > backup_$(date +%F).sql
```

## 5. Testing

*   **Backend:** `jest` + `supertest` for API endpoints.
*   **Frontend:** `vitest` + `@testing-library/react`.
