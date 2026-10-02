# Job Seeker

A full-stack job portal where **employers post jobs** and **job seekers browse and apply**. Employers can then review applicants and mark them as *Pending*, *Shortlisted* or *Rejected*.

- **Frontend:** React 19 + Vite, Material UI, Tailwind CSS, React Router, Axios
- **Backend:** Node.js + Express 5, MySQL (`mysql2`), JWT authentication, bcrypt password hashing
- **Database:** MySQL (database name: `job_portal`)

---

## Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Installation and Setup](#installation-and-setup)
5. [Database Setup (MySQL)](#database-setup-mysql)
6. [Environment Variables](#environment-variables)
7. [Running the Project](#running-the-project)
8. [Commands Reference](#commands-reference)
9. [API Endpoints](#api-endpoints)
10. [Frontend Routes](#frontend-routes)
11. [Security Notes](#security-notes)

---

## Features

**Job Seeker (role: `User`)**
- Register and log in
- Browse all job listings
- Apply to a job with a resume link and cover letter (one application per job; blocked after the deadline)
- Track application status under *My Applications*
- View account details

**Employer (role: `Employee`)**
- Register and log in
- Dashboard with an overview
- Post, edit and delete their own jobs
- View all applications received for their jobs
- Update an application status: `Pending`, `Shortlisted`, `Rejected`
- View registered job seekers and all jobs

**General**
- JWT-based authentication (tokens valid for 1 day)
- Role-based UI and protected routes
- Ownership checks: employers can only modify their own jobs and applications
- Input validation on the server

---

## Project Structure

```
Job-Seeker/
├── backend/
│   ├── config/
│   │   └── db.js                    # MySQL connection
│   ├── Controllers/
│   │   ├── authController.js        # register, login, current user
│   │   ├── jobController.js         # job CRUD + validation
│   │   └── applicationController.js # apply, list, update status
│   ├── Middleware/
│   │   └── Authenticate.js          # JWT verification
│   ├── Routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   └── applicationRoutes.js
│   ├── server.js                    # Express entry point
│   ├── package.json
│   └── .env                         # backend environment variables
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── Pages/                   # Site, Login, Register, Home, About, Contact,
    │   │                            # Account, MyApplication, Employee
    │   ├── Mycomponent/             # Dashboard, PostJob, ViewJob, ViewUser,
    │   │                            # ViewApplicantion, Header, Footer
    │   ├── utils/ProtectedRoutes.jsx
    │   ├── App.jsx                  # routes
    │   ├── Layout.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env                         # frontend environment variables
```

---

## Prerequisites

Install the following before you start:

| Tool | Version | Check with |
|------|---------|------------|
| Node.js | 18 or newer (LTS recommended) | `node -v` |
| npm | comes with Node.js | `npm -v` |
| MySQL Server | 8.x recommended | `mysql --version` |
| Git | any recent version | `git --version` |

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/AmanPatil2002/Job-Seeker.git
cd Job-Seeker
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

This installs: `express`, `cors`, `dotenv`, `mysql2`, `jsonwebtoken`, `bcryptjs`, `bcrypt`, `nodemon`.

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

This installs: `react`, `react-dom`, `react-router-dom`, `axios`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `tailwindcss`, `@tailwindcss/vite`, `vite`, `oxlint`.

---

## Database Setup (MySQL)

The project expects a database named **`job_portal`** with three tables: `login`, `jobs` and `applications`.

### 1. Log in to MySQL

```bash
mysql -u root -p
```

### 2. Create the database

```sql
CREATE DATABASE IF NOT EXISTS job_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE job_portal;
```

### 3. Create the tables

```sql
-- Users of the system (job seekers and employers)
CREATE TABLE IF NOT EXISTS login (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  username  VARCHAR(100) NOT NULL UNIQUE,
  email     VARCHAR(150) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,                 -- bcrypt hash
  role      ENUM('User', 'Employee') NOT NULL DEFAULT 'User',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Jobs posted by employers
CREATE TABLE IF NOT EXISTS jobs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  employer_id   INT NOT NULL,
  title         VARCHAR(100) NOT NULL,
  company_name  VARCHAR(100) NOT NULL,
  description   TEXT NOT NULL,
  location      VARCHAR(100) NOT NULL,
  salary        DECIMAL(12,2) NOT NULL,
  job_type      ENUM('Full Time','Part Time','Internship','Contract','Remote') NOT NULL,
  experience    ENUM('Fresher','1-3 years','3-5 years','5+ years') NOT NULL,
  skills        VARCHAR(500) NOT NULL,             -- comma separated
  posted_date   DATE NOT NULL,
  deadline      DATE NOT NULL,
  CONSTRAINT fk_jobs_employer
    FOREIGN KEY (employer_id) REFERENCES login(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Applications submitted by job seekers
CREATE TABLE IF NOT EXISTS applications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  job_id        INT NOT NULL,
  user_id       INT NOT NULL,
  resume_url    VARCHAR(500) NOT NULL,
  cover_letter  TEXT NOT NULL,
  status        ENUM('Pending','Shortlisted','Rejected') NOT NULL DEFAULT 'Pending',
  applied_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_app_job  FOREIGN KEY (job_id)  REFERENCES jobs(id)  ON DELETE CASCADE,
  CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES login(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_job UNIQUE (user_id, job_id)  -- one application per job
) ENGINE=InnoDB;
```

> The `UNIQUE (user_id, job_id)` constraint is what makes the API return *"You have already applied for this job."*

### 4. Verify

```sql
SHOW TABLES;
DESCRIBE login;
DESCRIBE jobs;
DESCRIBE applications;
```

Expected output of `SHOW TABLES;`:

```
+---------------------+
| Tables_in_job_portal|
+---------------------+
| applications        |
| jobs                |
| login               |
+---------------------+
```

### Optional: run the SQL from a file

Save the SQL above as `schema.sql` and run:

```bash
mysql -u root -p < schema.sql
```

(Add `CREATE DATABASE ...; USE job_portal;` at the top of the file.)

---

## Environment Variables

### Backend: `backend/.env`

```env
PORT=5000

db_host=localhost
db_user=root
db_password=YOUR_MYSQL_PASSWORD
db_name=job_portal

SECRET_KEY=replace_with_a_long_random_string
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the Express server listens on (default `5000`) |
| `db_host` | MySQL host |
| `db_user` | MySQL username |
| `db_password` | MySQL password |
| `db_name` | Database name (`job_portal`) |
| `SECRET_KEY` | Secret used to sign and verify JWT tokens |

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` must point to the backend. If you change the backend `PORT`, update this value too.

---

## Running the Project

Open **two terminals**.

**Terminal 1: Backend**

```bash
cd backend
npx nodemon server.js
```

or without auto-reload:

```bash
node server.js
```

You should see:

```
Server Running on Port 5000
Connection to Database Successful
```

**Terminal 2: Frontend**

```bash
cd frontend
npm run dev
```

Vite starts the app (usually at `http://localhost:5173`) and opens it in the browser.

### Quick test flow

1. Open the app and go to **Register**.
2. Create one account with role **Employee** and one with role **User**.
3. Log in as the Employee, then go to **Post Jobs** and create a job.
4. Log in as the User, open **Home**, and apply to the job.
5. Log in as the Employee again, open **Applications**, and change the status.

---

## Commands Reference

### Setup

| Command | Where | Purpose |
|---------|-------|---------|
| `git clone https://github.com/AmanPatil2002/Job-Seeker.git` | anywhere | Download the project |
| `npm install` | `backend/` | Install backend dependencies |
| `npm install` | `frontend/` | Install frontend dependencies |
| `mysql -u root -p` | anywhere | Open the MySQL shell |
| `mysql -u root -p < schema.sql` | where `schema.sql` is | Create DB and tables from a file |

### Backend

| Command | Purpose |
|---------|---------|
| `node server.js` | Start the API server |
| `npx nodemon server.js` | Start with auto-restart on file changes |

### Frontend

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

### MySQL (useful while developing)

```sql
USE job_portal;
SELECT id, username, email, role FROM login;
SELECT id, title, company_name, deadline FROM jobs;
SELECT id, job_id, user_id, status FROM applications;
```

---

## API Endpoints

Base URL: `http://localhost:5000`

Protected routes need the header: `Authorization: Bearer <token>`

### Auth: `/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register (`username`, `email`, `password`, `role`: `User` or `Employee`) |
| POST | `/auth/login` | No | Log in with `username` and `password`, returns a JWT |
| GET | `/auth/me` | Yes | Get the logged-in user |
| GET | `/auth/register` | Yes | List all users (id, username, email, role) |

### Jobs: `/job`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/job/postjob` | Yes | Create a job |
| GET | `/job/alljobs` | Yes | List all jobs |
| GET | `/job/myjobs` | Yes | List jobs posted by the logged-in employer |
| PUT | `/job/:id` | Yes (owner) | Update a job |
| DELETE | `/job/:id` | Yes (owner) | Delete a job |

**Job validation rules**

- Title 3–100 chars, company 2–100, location 2–100, description 20–5000
- `job_type`: Full Time, Part Time, Internship, Contract, Remote
- `experience`: Fresher, 1-3 years, 3-5 years, 5+ years
- `skills`: comma-separated string, 1–20 skills
- `salary` must be a positive number
- `posted_date` and `deadline` in `YYYY-MM-DD`; deadline cannot be before the posted date

### Applications: `/application`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/application/postappl/:id` | Yes | Apply to job `:id` (`resume_url`, `cover_letter`) |
| GET | `/application/myappl` | Yes | Applications of the logged-in user |
| GET | `/application/allappl` | Yes | All applications received for the employer's jobs |
| GET | `/application/allappl/:id` | Yes (owner) | Applications for one job |
| PUT | `/application/editappl/:id` | Yes (owner) | Set status: `Pending`, `Shortlisted`, `Rejected` |

### Example requests

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"aman","email":"aman@example.com","password":"secret123","role":"Employee"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"aman","password":"secret123"}'

# Create a job (replace TOKEN)
curl -X POST http://localhost:5000/job/postjob \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"React Developer",
    "company_name":"Acme Pvt Ltd",
    "description":"Build and maintain React front-ends for our products.",
    "location":"Pune",
    "salary":600000,
    "job_type":"Full Time",
    "experience":"1-3 years",
    "skills":"React, JavaScript, CSS",
    "posted_date":"2026-10-02",
    "deadline":"2026-11-02"
  }'
```

---

## Frontend Routes

| Path | Access | Page |
|------|--------|------|
| `/` | Public | Landing page |
| `/login`, `/register` | Public | Authentication |
| `/home` | Logged in | Browse and apply to jobs |
| `/about`, `/contact` | Logged in | Info pages |
| `/account` | Logged in | Account details |
| `/myapplication` | Logged in | Your applications and their status |
| `/employee/dashboard` | Employee | Dashboard |
| `/employee/post-jobs` | Employee | Create, edit, delete jobs |
| `/employee/applications` | Employee | Review applications |
| `/employee/users` | Employee | View registered users |
| `/employee/jobs` | Employee | View all jobs |

---

## Security Notes

Before deploying or sharing publicly:

- **Do not commit `.env` files.** Add `.env` and `node_modules/` to a root `.gitignore`, and rotate any secrets that were already committed.
- Use a strong, random `SECRET_KEY`.
- Do not use the MySQL `root` user in production; create a dedicated user:

  ```sql
  CREATE USER 'jobportal'@'localhost' IDENTIFIED BY 'a_strong_password';
  GRANT ALL PRIVILEGES ON job_portal.* TO 'jobportal'@'localhost';
  FLUSH PRIVILEGES;
  ```
- Restrict CORS to your frontend origin instead of allowing all origins.
- Serve the app over HTTPS in production.

---

## Author

[AmanPatil2002](https://github.com/AmanPatil2002)
