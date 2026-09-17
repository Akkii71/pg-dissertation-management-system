# PG Dissertation Management System
> **Academic Research & Dissertation Management Portal**

[![Tech Stack: MERN](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-purple.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen.svg)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

---

## 📌 Project Overview

PG dissertation is a mandatory requirement for the fulfillment of a Post-Graduate degree. During the 1st year of post-graduation, students select a PG dissertation topic and carry out research under the supervision of an allocated PG guide, submitting their dissertation during the final year for evaluation.

This portal digitizes, streamlines, and automates the complete dissertation lifecycle across institutions.

### Problem Statement & Domain Focus
- **Year:** 2023
- **Domain:** Smart Education
- **Category:** Software
- **Organisation:** Ministry of AYUSH

### 10 Core Lifecycle Processes Addressed
1. **Topic Selection**: Selection of research topics aligned with departmental thrust areas.
2. **Student-Guide Ratio**: Automated enforcement of student-guide allocation limits.
3. **Duplication Avoidance**: Preventing overlapping or duplicate research topics.
4. **Ethical Approvals**: Managing institutional review board and ethical clearances.
5. **Research Progress Monitoring**: Milestone-based tracking of thesis development.
6. **Evaluation System**: Streamlined review and grading by internal and external examiners.
7. **Publication Tracking**: Archiving research papers and journal publications resulting from dissertations.
8. **Dissertation Archive & Search**: Searchable repository categorized across departments and domains.
9. **Result Withholding**: Automated compliance enforcement with university final-year results.
10. **Centralized Administration**: End-to-end monitoring via a unified portal.

---

## 🏗️ 5-Commit Development Strategy

This system is engineered under a structured 5-commit modular roadmap:

| Commit | Module / Milestone | Status |
|---|---|---|
| **Commit 1** | **Foundation & Authentication System** | **CURRENT** |
| **Commit 2** | Student, Guide & Admin Roles + Topic Management | *Upcoming* |
| **Commit 3** | Guide Allocation, Ethical Approvals & Progress Tracking | *Upcoming* |
| **Commit 4** | Evaluation, Publications, Repository Search & Compliance | *Upcoming* |
| **Commit 5** | System Polish, Comprehensive Testing & Documentation | *Upcoming* |

> [!NOTE]
> **Current Scope Notice (Commit 1):**
> This repository currently contains the **complete foundation layer** (Commit 1). It implements backend and frontend configurations, MongoDB database connection, secure JWT authentication with bcrypt password hashing, role structures (`student`, `guide`, `admin`), protected route guards, and a responsive academic dashboard.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS with custom academic palette
- **Icons**: Lucide React
- **State**: React Context API (`AuthContext`)

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database ODM**: Mongoose
- **Security & Auth**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **CORS & Environment**: `cors`, `dotenv`

### Database
- **Database Engine**: MongoDB (Local or Atlas)

---

## 📂 Project Structure

```text
pg-dissertation-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   └── authController.js     # Auth logic (register, login, getMe)
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification middleware
│   ├── models/
│   │   └── User.js               # Mongoose User schema with bcrypt hooks
│   ├── routes/
│   │   └── authRoutes.js         # /api/auth routes
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Backend dependencies and scripts
│   └── server.js                 # Express application entrypoint
├── frontend/
│   ├── public/                   # Public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Academic portal header with session controls
│   │   │   └── ProtectedRoute.jsx# Auth guard for secure pages
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global authentication state
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Institutional dashboard
│   │   │   ├── Login.jsx         # Scholar / Guide / Admin sign in
│   │   │   └── Register.jsx      # Portal account creation
│   │   ├── services/
│   │   │   └── api.js            # HTTP client with Bearer auth injection
│   │   ├── App.jsx               # Client-side router configuration
│   │   ├── index.css             # Tailwind base and academic styling
│   │   └── main.jsx              # React DOM root mounting
│   ├── index.html                # HTML entrypoint
│   ├── package.json              # Frontend dependencies and scripts
│   ├── postcss.config.js         # PostCSS configuration
│   ├── tailwind.config.js        # Academic color theme & font config
│   └── vite.config.js            # Vite build & backend API proxy
├── .env.example                  # Root environment template
├── .gitignore                    # Git ignore configuration
├── package.json                  # Root runner scripts
└── README.md                     # Project documentation
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your local development machine:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB community server running on port `27017` or a MongoDB Atlas URI string

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Akkii71/pg-dissertation-management-system.git
cd pg-dissertation-management-system
```

### 2. Configure Environment Variables

Create `.env` inside `backend/` (or copy `.env.example`):
```bash
cp backend/.env.example backend/.env
```

Review or edit `backend/.env`:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/pg_dissertation_db
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
```

### 3. Install Dependencies

You can install all dependencies from the root:
```bash
npm run install:all
```
Or install individually:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

## 🏃 Running the Application

### 1. Start the Backend API Server
In a terminal tab:
```bash
cd backend
npm run dev
```
*Backend runs at:* `http://localhost:5001`  
*API Health Endpoint:* `http://localhost:5001/api/health`

### 2. Start the Frontend Application
In a separate terminal tab:
```bash
cd frontend
npm run dev
```
*Frontend runs at:* `http://localhost:3000`

---

## 📡 API Reference (Commit 1)

### Authentication Endpoints

#### Register User
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Dr. Sarah Jenkins",
    "email": "sarah.jenkins@university.edu",
    "password": "SecurePassword123",
    "role": "guide"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "<JWT_TOKEN>",
    "user": {
      "_id": "...",
      "name": "Dr. Sarah Jenkins",
      "email": "sarah.jenkins@university.edu",
      "role": "guide",
      "createdAt": "..."
    }
  }
  ```

#### Login User
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "sarah.jenkins@university.edu",
    "password": "SecurePassword123"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "<JWT_TOKEN>",
    "user": {
      "_id": "...",
      "name": "Dr. Sarah Jenkins",
      "email": "sarah.jenkins@university.edu",
      "role": "guide",
      "createdAt": "..."
    }
  }
  ```

#### Get Current Authenticated Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Private (`Bearer <token>`)
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "user": {
      "_id": "...",
      "name": "Dr. Sarah Jenkins",
      "email": "sarah.jenkins@university.edu",
      "role": "guide",
      "createdAt": "..."
    }
  }
  ```

---

## 🔐 Security Features Implemented

- **Password Hashing**: Stored passwords are salted and hashed with `bcryptjs` (salt rounds = 10) before persisting in MongoDB.
- **JWT Authentication**: Stateless authentication with digitally signed tokens and expiry.
- **Protected Routing**: React client-side route guard preventing unauthenticated access to dashboard views.
- **Sanitized Responses**: Sensitive data (such as password hashes) is stripped from all API outputs.
- **Environment Isolation**: Sensitive keys (`JWT_SECRET`, `MONGO_URI`) isolated in environment variables with `.gitignore` enforcement.

---

## 🗺️ Roadmap for Subsequent Commits

- **Commit 2**: Role-specific dashboards (Student, Guide, Admin) & Dissertation Topic Submission / Management.
- **Commit 3**: Guide allocation algorithm, Ethical Review committee workflows & Milestone tracking.
- **Commit 4**: External/Internal Evaluation grading, Publication indexing & University result withholding logic.
- **Commit 5**: End-to-end integration tests, UI refinement, comprehensive audit & deployment preparation.

---

## 📄 License
This project is licensed under the ISC License.
