# AMIS - Association Management Information System
**Faculty of Computer Science - International University of Africa**

A comprehensive management system for the Computer Association, featuring member management, committee tracking, event planning, financial ledgers, and task management with role-based access control (RBAC).

## 🏗 Project Structure

```
amis-project/
├── backend/                # Node.js + Express + Prisma API
│   ├── prisma/             # Database Schema & Seeds
│   ├── src/
│   │   ├── controllers/    # Request Handlers
│   │   ├── middleware/     # Auth & Validation
│   │   ├── routes/         # API Routes
│   │   └── index.ts        # App Entry Point
│   └── Dockerfile
├── src/                    # React Frontend (Current Root)
│   ├── components/
│   ├── pages/
│   └── services/
├── docker-compose.yml      # Orchestration
└── README.md
```

## 🚀 Quick Start (Full Stack)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Running with Docker (Recommended)
This will start the Database (MySQL), Backend API, and Frontend.

```bash
# 1. Start all services
docker-compose up --build
```

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000
- **Database**: localhost:3306

### Default Credentials (Seed Data)
- **Admin**: `admin@amis.local` / `Admin@123`
- **Vice President**: `sara@amis.local` / `password123`

## 🛠 Manual Setup (Local Development)

### 1. Database & Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start Database (if not using docker-compose for everything)
docker-compose up -d db

# Run Migrations & Seed
npx prisma migrate dev --name init
npx prisma db seed

# Start Server
npm run dev
```

### 2. Frontend
```bash
# Install dependencies
npm install

# Start Dev Server
npm run dev
```

## 📚 API Documentation

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login & Get Token | Public |
| GET | `/api/auth/me` | Get Current User Profile | Protected |
| GET | `/api/members` | List All Members | Member+ |
| POST | `/api/members` | Register New Member | Admin/President |
| GET | `/api/finance` | Get Ledger Entries | Treasurer/Admin |
| POST | `/api/events` | Create Event | Committee Lead+ |

## 🔐 Security Features
- **JWT Authentication**: Secure stateless authentication.
- **RBAC**: Role-Based Access Control middleware ensuring only authorized roles can access sensitive endpoints (e.g., only Treasurer/Admin can add Finance entries).
- **Password Hashing**: Bcrypt used for password storage.

## 💾 Backup & Restore

**Backup Database:**
```bash
docker exec amis_db_container mysqldump -u amis_user -pamis_password amis_db > backup.sql
```

**Restore Database:**
```bash
docker exec -i amis_db_container mysql -u amis_user -pamis_password amis_db < backup.sql
```
