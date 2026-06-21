# ProxiWork — Version 1 Project Documentation

**Document Version:** 1.0  
**Project Version:** V1 (Foundation / Proof of Concept)  
**Date:** June 2026  
**Author:** Vasanth  
**Status:** Completed — Ready for V2 Development

---

## 📌 Table of Contents

1. [Project Overview & Vision](#1-project-overview--vision)
2. [Tech Stack](#2-tech-stack)
3. [Project Folder Structure](#3-project-folder-structure)
4. [Database Schema](#4-database-schema)
5. [Feature 1 — Authentication System](#5-feature-1--authentication-system)
6. [Feature 2 — Profile System](#6-feature-2--profile-system)
7. [Feature 3 — Job Management](#7-feature-3--job-management)
8. [Feature 4 — Proposal System](#8-feature-4--proposal-system)
9. [Feature 5 — Real-Time Chat](#9-feature-5--real-time-chat)
10. [Feature 6 — Notification System](#10-feature-6--notification-system)
11. [Feature 7 — Rating System](#11-feature-7--rating-system)
12. [Feature 8 — Complaint / Support Module](#12-feature-8--complaint--support-module)
13. [Feature 9 — File Upload System](#13-feature-9--file-upload-system)
14. [Feature 10 — Job Board (Public Discovery)](#14-feature-10--job-board-public-discovery)
15. [Frontend Pages Reference](#15-frontend-pages-reference)
16. [Frontend Components Reference](#16-frontend-components-reference)
17. [Complete API Endpoint Reference](#17-complete-api-endpoint-reference)
18. [Real-Time System (Socket.IO)](#18-real-time-system-socketio)
19. [State Management (Context API)](#19-state-management-context-api)
20. [Security Implemented in V1](#20-security-implemented-in-v1)
21. [Known Bugs in V1](#21-known-bugs-in-v1)
22. [Known Limitations in V1](#22-known-limitations-in-v1)
23. [V2 Roadmap](#23-v2-roadmap)

---

## 1. Project Overview & Vision

### What is ProxiWork?

ProxiWork is a **category-based, dual-sided work marketplace** that connects two groups of people:

- **Clients** — people who need work to be done (plumbing, carpentry, electrical work, tutoring, delivery, painting, tailoring, and all types of general real-world work)
- **Providers** — skilled individuals who can perform that work and are looking for consistent opportunities

### The Core Problem

**Two real problems. One platform solves both.**

| From the Client's Side | From the Provider's Side |
|---|---|
| "I need work done. I can't find a reliable person." | "I have a skill. I can't find consistent work." |
| No structured way to post requirements | No platform to showcase skills and find work |
| No accountability after hiring | No formal reputation system |
| Risk of poor delivery or non-completion | Risk of clients not approving completed work |

### What Makes ProxiWork Different

ProxiWork is **NOT** a tech-only freelance platform (like Upwork/Fiverr).  
ProxiWork is built for **all types of real-world, general work** — any category, any skill, any person.

The name **"ProxiWork"** — **Proximity + Work** — reflects the hyperlocal, category-based nature of the platform.

### Core Philosophy

- **Work is the central entity** — not profiles, not listings. Every feature exists to support work reaching completion.
- **Structured lifecycle** — every piece of work follows a defined path from posting to payment to rating.
- **Trust by design** — ratings, escrow payments, complaints, and state transitions are all built to protect both sides.
- **Open and inclusive** — no restriction on work category, profession, or skill type.

### Work Lifecycle (The State Machine)

```
[Client Posts Job]
       ↓
[Providers Browse & Submit Proposals]
       ↓
[Client Reviews & Accepts One Proposal]
       ↓  — Job status changes: open → in_progress
[Both Parties Collaborate via Real-Time Chat]
       ↓
[Provider Submits Completed Work]
       ↓  — Job status changes: in_progress → submitted
[Client Reviews & Approves Work / Releases Payment]
       ↓  — Job status changes: submitted → completed
[Client Rates the Provider]
       ↓
[Work archived as completed record]
```

---

## 2. Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 20.0.0 | Runtime environment |
| Express.js | ^5.1.0 | HTTP server and API routing |
| pg (node-postgres) | ^8.16.3 | PostgreSQL database client with connection pooling |
| @supabase/supabase-js | ^2.88.0 | Supabase Storage (file uploads only) |
| jsonwebtoken (JWT) | ^9.0.2 | Authentication token generation and verification |
| bcryptjs | ^3.0.2 | Password hashing (salt rounds: 10) |
| socket.io | ^4.8.1 | Real-time bidirectional WebSocket communication |
| joi | ^18.0.2 | Request body schema validation |
| express-rate-limit | ^8.3.2 | Rate limiting on auth endpoints |
| multer | ^2.0.2 | Multipart file upload handling (memory storage) |
| dotenv | ^17.2.3 | Environment variable management |
| nodemon | dev | Auto-restart server during development |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.1.1 | UI framework |
| Vite | ^7.1.7 | Build tool and development server |
| React Router DOM | ^7.9.4 | Client-side routing |
| Axios | ^1.12.2 | HTTP API client with request interceptor |
| socket.io-client | ^4.8.1 | Real-time WebSocket client |
| AOS (Animate on Scroll) | ^2.3.4 | Scroll-triggered animations |
| jwt-decode | ^4.0.0 | JWT token parsing on client side |
| CSS Modules | built-in | Scoped component-level styles |

### Database & Storage

| Service | Purpose |
|---|---|
| PostgreSQL (hosted on Supabase) | Primary database — all application data |
| Supabase Storage | File storage — profile images, chat attachments, evidence files |

- **Region:** AWS ap-south-1 (India — good latency)
- **Connection:** Via `pg.Pool` using `DATABASE_URL` connection string
- **Connection Pooler:** Supabase PgBouncer (port 6543)
- **SSL:** Enabled (`rejectUnauthorized: false`)

### Deployment

| Layer | Platform |
|---|---|
| Frontend | Vercel (with `vercel.json` SPA rewrite config) |
| Backend | Render / Railway (Node.js service) |
| Database | Supabase (managed PostgreSQL) |
| Storage | Supabase Storage |

---

## 3. Project Folder Structure

```
Proxiwork/
│
├── client/                          ← React 19 Frontend (Port 5173)
│   ├── index.html                   ← App entry HTML (title: "Proxi-work")
│   ├── vite.config.js               ← Vite build config (@vitejs/plugin-react)
│   ├── vercel.json                  ← Vercel SPA rewrite rules
│   ├── eslint.config.js             ← ESLint configuration
│   ├── package.json                 ← Frontend dependencies
│   └── src/
│       ├── main.jsx                 ← React entry point (AOS init here)
│       ├── App.jsx                  ← Root component (Providers + Socket connect)
│       ├── index.css                ← Global design system (CSS variables, animations)
│       ├── App.css                  ← App-level styles
│       │
│       ├── router/
│       │   └── index.jsx            ← All route definitions (public + protected)
│       │
│       ├── context/
│       │   ├── AuthContext.jsx      ← User auth state (user, profile, login, logout)
│       │   ├── NotificationContext.jsx ← Notification state + socket listener
│       │   └── ToastContext.jsx     ← Global toast/snackbar system
│       │
│       ├── services/
│       │   ├── api.js               ← Axios client + all API call functions
│       │   └── socket.js            ← Socket.IO client singleton
│       │
│       ├── hooks/
│       │   ├── useClickOutside.js   ← Close dropdowns on outside click
│       │   └── useScrollReveal.js   ← IntersectionObserver scroll animations
│       │
│       ├── components/
│       │   ├── Navbar.jsx           ← Global navigation bar
│       │   ├── Navbar.module.css
│       │   ├── GradientBackground.jsx ← Animated canvas background (5 color blobs)
│       │   ├── ProtectedRoute.jsx   ← Route guard (redirects to /login if no auth)
│       │   ├── Modal.jsx            ← Generic reusable modal wrapper
│       │   ├── Modal.module.css
│       │   ├── ConfirmationModal.jsx ← Confirm / Cancel dialog
│       │   ├── ConfirmationModal.module.css
│       │   ├── EditJobModal.jsx     ← Inline edit job form modal
│       │   ├── EditJobModal.module.css
│       │   ├── PaymentModal.jsx     ← Payment release confirmation modal
│       │   ├── PaymentModal.module.css
│       │   ├── RatingModal.jsx      ← 1-5 star rating + comment form modal
│       │   ├── RatingModal.module.css
│       │   ├── SkeletonCard.jsx     ← Shimmer loading placeholder
│       │   ├── SkeletonCard.module.css
│       │   ├── NotificationBell.jsx ← Standalone notification bell component
│       │   └── NotificationBell.module.css
│       │
│       └── pages/
│           ├── HomePage.jsx          ← Landing page
│           ├── HomePage.module.css
│           ├── LoginPage.jsx         ← Login form
│           ├── RegisterPage.jsx      ← Registration form
│           ├── AuthForm.module.css   ← Shared styles for Login + Register
│           ├── EditProfilePage.jsx   ← Create / Edit profile form
│           ├── EditProfilePage.module.css
│           ├── ProfilePage.jsx       ← View own profile
│           ├── ProfilePage.module.css
│           ├── JobBoardPage.jsx      ← Public job listing + search + filter
│           ├── JobBoardPage.module.css
│           ├── JobDetailPage.jsx     ← Single job details + proposal submission
│           ├── JobDetailPage.module.css
│           ├── PostJobPage.jsx       ← Post a new job (client only)
│           ├── PostJobPage.module.css
│           ├── DashboardPage.jsx     ← Client dashboard (manage own jobs)
│           ├── DashboardPage.module.css
│           ├── ViewProposalsPage.jsx ← Client: view + accept/reject proposals
│           ├── ViewProposalsPage.module.css
│           ├── ProviderDashboard.jsx ← Provider: view proposals + submit work
│           ├── ProviderDashboard.module.css
│           ├── MessagesPage.jsx      ← List of all active project chats
│           ├── MessagesPage.module.css
│           ├── ChatPage.jsx          ← Real-time project chat
│           ├── ChatPage.module.css
│           ├── ComplaintPage.jsx     ← Submit complaint / support ticket
│           ├── ComplaintPage.module.css
│           ├── SettingsPage.jsx      ← Account hub: profile view + security + danger zone
│           └── SettingsPage.module.css
│
└── server/                          ← Express.js Backend (Port 5000)
    ├── index.js                     ← Server entry point (Express + Socket.IO)
    ├── package.json                 ← Backend dependencies
    ├── .env                         ← Environment variables (gitignored)
    └── src/
        ├── config/
        │   ├── db.js                ← PostgreSQL pool connection
        │   └── supabase.js          ← Supabase client (for storage only)
        │
        ├── middleware/
        │   ├── authMiddleware.js    ← JWT verification (attaches req.user)
        │   ├── validateMiddleware.js ← Joi schema validation wrapper
        │   ├── rateLimiter.js       ← Rate limiting (login + register)
        │   └── errorMiddleware.js   ← Global error handler
        │
        ├── utils/
        │   ├── AppError.js          ← Custom operational error class
        │   └── catchAsync.js        ← Async error wrapper for controllers
        │
        ├── validators/
        │   ├── authValidator.js     ← Register + Login Joi schemas
        │   ├── jobValidator.js      ← Create + Update job Joi schemas
        │   ├── proposalValidator.js ← Submit proposal Joi schema
        │   ├── profileValidator.js  ← Create/update profile Joi schema
        │   ├── ratingValidator.js   ← Rating submission Joi schema
        │   └── complaintValidator.js ← Complaint submission Joi schema
        │
        ├── api/
        │   ├── routes/
        │   │   ├── authRoutes.js
        │   │   ├── profileRoutes.js
        │   │   ├── jobRoutes.js
        │   │   ├── proposalRoutes.js
        │   │   ├── ratingRoutes.js
        │   │   ├── complaintRoutes.js
        │   │   ├── projectRoutes.js
        │   │   ├── uploadRoutes.js
        │   │   └── notificationRoutes.js
        │   │
        │   ├── controllers/
        │   │   ├── authController.js
        │   │   ├── profileController.js
        │   │   ├── jobController.js
        │   │   ├── proposalController.js
        │   │   ├── ratingController.js
        │   │   ├── complaintController.js
        │   │   ├── projectController.js
        │   │   ├── uploadController.js
        │   │   └── notificationController.js
        │   │
        │   └── services/
        │       └── notificationService.js ← createNotification() utility
        │
        └── socket/
            └── socketHandler.js     ← All Socket.IO event handlers
```

---

## 4. Database Schema

> Schema inferred from all SQL queries across all controllers. Tables exist in Supabase PostgreSQL.

### `users` table
```sql
user_id          UUID / SERIAL    PRIMARY KEY
email            VARCHAR          UNIQUE, NOT NULL
password_hash    VARCHAR          NOT NULL
role             VARCHAR          'client' | 'provider'
created_at       TIMESTAMPTZ      DEFAULT NOW()
```

### `profiles` table
```sql
profile_id          SERIAL         PRIMARY KEY
user_id             UUID           REFERENCES users(user_id), UNIQUE
full_name           VARCHAR        NOT NULL
tagline             VARCHAR        
bio                 TEXT           
skills              TEXT[]         (array of skill strings)
profile_image_url   VARCHAR        (Supabase Storage URL)
date_of_birth       DATE           
phone_number        VARCHAR        
linkedin_url        VARCHAR        
github_url          VARCHAR        
rating              NUMERIC        (cumulative average, updated on each new rating)
total_ratings       INTEGER        DEFAULT 0
updated_at          TIMESTAMPTZ    
created_at          TIMESTAMPTZ    DEFAULT NOW()
```

### `jobs` table
```sql
job_id        UUID / SERIAL    PRIMARY KEY
client_id     UUID             REFERENCES users(user_id)
title         VARCHAR          NOT NULL
description   TEXT             NOT NULL
budget        NUMERIC          NOT NULL
deadline      DATE             (optional)
status        VARCHAR          'open' | 'in_progress' | 'submitted' | 'completed'
created_at    TIMESTAMPTZ      DEFAULT NOW()
```

### `proposals` table
```sql
proposal_id    UUID / SERIAL    PRIMARY KEY
job_id         UUID             REFERENCES jobs(job_id)
provider_id    UUID             REFERENCES users(user_id)
cover_letter   TEXT             NOT NULL
bid_amount     NUMERIC          NOT NULL
status         VARCHAR          'pending' | 'accepted' | 'rejected'
created_at     TIMESTAMPTZ      DEFAULT NOW()
UNIQUE(job_id, provider_id)     ← prevents duplicate proposals
```

### `messages` table
```sql
message_id       UUID / SERIAL    PRIMARY KEY
project_id       UUID             REFERENCES jobs(job_id)  ← job_id used as project_id
sender_id        UUID             REFERENCES users(user_id)
content          TEXT             NOT NULL
attachment_url   VARCHAR          (Supabase Storage URL, nullable)
attachment_type  VARCHAR          'image' | 'document' (nullable)
created_at       TIMESTAMPTZ      DEFAULT NOW()
```

### `ratings` table
```sql
rating_id     UUID / SERIAL    PRIMARY KEY
job_id        UUID             REFERENCES jobs(job_id), UNIQUE  ← one rating per job
client_id     UUID             REFERENCES users(user_id)
provider_id   UUID             REFERENCES users(user_id)
score         INTEGER          1–5
comment       TEXT             (optional)
created_at    TIMESTAMPTZ      DEFAULT NOW()
```

### `notifications` table
```sql
notification_id   UUID / SERIAL    PRIMARY KEY
user_id           UUID             REFERENCES users(user_id)
type              VARCHAR          e.g. 'proposal_accepted', 'work_submitted', etc.
message           TEXT             
link              VARCHAR          (frontend route to navigate to on click)
is_read           BOOLEAN          DEFAULT false
created_at        TIMESTAMPTZ      DEFAULT NOW()
```

### `complaints` table
```sql
complaint_id          UUID / SERIAL    PRIMARY KEY
complainant_user_id   UUID             REFERENCES users(user_id)
subject               VARCHAR          NOT NULL
description           TEXT             NOT NULL
evidence_url          VARCHAR          (Supabase Storage URL, nullable)
status                VARCHAR          (pending review by default)
created_at            TIMESTAMPTZ      DEFAULT NOW()
```

---

## 5. Feature 1 — Authentication System

### What it does
Handles user registration and login. Issues JWT tokens that secure all subsequent API requests and socket connections.

### Files Involved
| File | Role |
|---|---|
| `server/src/api/routes/authRoutes.js` | Route definitions |
| `server/src/api/controllers/authController.js` | Business logic |
| `server/src/validators/authValidator.js` | Input validation schemas |
| `server/src/middleware/authMiddleware.js` | JWT verification on protected routes |
| `server/src/middleware/rateLimiter.js` | Brute force protection |
| `client/src/pages/RegisterPage.jsx` | Registration UI |
| `client/src/pages/LoginPage.jsx` | Login UI |
| `client/src/context/AuthContext.jsx` | Frontend auth state management |

### Registration Flow

**Endpoint:** `POST /api/auth/register`  
**Access:** Public (rate-limited: 5 requests per 15 minutes per IP)  
**Validation (Joi):**
- `email` — valid email format, required
- `password` — min 6 characters, required
- `role` — must be exactly `'client'` or `'provider'`, required

**Process:**
1. Request hits `registerLimiter` → 5 req/15min limit
2. Joi validates the body via `validateMiddleware`
3. Check if email already exists in `users` table
4. If exists → return 400 error "An account with this email already exists"
5. Generate bcrypt salt (10 rounds) → hash the password
6. Insert new user into `users` table
7. Return: `{ user_id, email, role, created_at }` with status 201
8. **Note:** No JWT returned on register — user must log in separately

**Frontend behavior:**  
After successful registration → `alert('Registration successful! Please log in.')` → redirect to `/login`

---

### Login Flow

**Endpoint:** `POST /api/auth/login`  
**Access:** Public (rate-limited: 10 requests per 15 minutes per IP)  
**Validation (Joi):**
- `email` — valid email, required
- `password` — required

**Process:**
1. Request hits `loginLimiter` → 10 req/15min limit
2. Joi validates the body
3. Find user by email in `users` table
4. If not found → return 400 "Invalid Credentials"
5. Compare submitted password against stored `password_hash` using `bcrypt.compare()`
6. If no match → return 400 "Invalid Credentials"
7. Check if user has a profile row in `profiles` table → sets `hasProfile` boolean
8. Build JWT payload: `{ user: { id, role, hasProfile } }`
9. Sign JWT with `JWT_SECRET`, expiry: `1 hour`
10. Return: `{ token }` — client stores in `localStorage`

---

### Change Password

**Endpoint:** `PUT /api/auth/change-password`
**Access:** 🔒 Private (any authenticated user)

**Request Body:**
- `currentPassword` — required
- `newPassword` — required, min 6 characters

**Process:**
1. Validate both fields are present
2. Validate `newPassword.length >= 6`
3. Fetch user from DB by `req.user.id`
4. `bcrypt.compare(currentPassword, user.password_hash)` — verify current password
5. If mismatch → 400 "Current password is incorrect"
6. `bcrypt.genSalt(10)` → `bcrypt.hash(newPassword)` → update DB
7. Return `{ message: 'Password changed successfully' }`

**Frontend (SettingsPage → Security tab):**
Form with 3 fields: current password, new password, confirm password. Client validates match before sending request.

---

### Delete Account

**Endpoint:** `DELETE /api/auth/delete-account`
**Access:** 🔒 Private (any authenticated user)

**Process:**
1. If client → check for jobs with `status IN ('in_progress', 'submitted')` — if any → block with 400
2. If provider → check for accepted proposals on in-progress/submitted jobs — if any → block with 400
3. `DELETE FROM users WHERE user_id = $1` — DB CASCADE handles related records
4. Return `{ message: 'Account deleted successfully' }`

**Frontend (SettingsPage → Danger Zone tab):**
Red bordered danger card → "Delete Account" button → opens `ConfirmationModal` → on confirm → calls API → `logout()` → redirects to `/`

---

### JWT Verification (Protected Routes)

**File:** `authMiddleware.js`  
**Applied to:** All non-public routes  

**Process:**
1. Read `Authorization` header
2. If missing → 401 "No token, authorization denied"
3. Split `Bearer <token>` → extract token
4. `jwt.verify(token, JWT_SECRET)` → decode payload
5. Attach `decoded.user` to `req.user`
6. Call `next()` → controller proceeds with `req.user.id`, `req.user.role`, `req.user.hasProfile`

---

### Frontend Auth State (AuthContext)

**File:** `client/src/context/AuthContext.jsx`

**State:**
- `user` — decoded JWT payload `{ id, role, hasProfile }`
- `profile` — full profile data from DB (name, avatar, etc.)
- `loading` — true while checking localStorage on app mount

**On App Start (useEffect):**
1. Read token from `localStorage`
2. Manually decode JWT (atob method): `JSON.parse(atob(token.split('.')[1]))`
3. Check if token is expired (`decoded.exp * 1000 > Date.now()`)
4. If valid → set `user` state + fetch profile if `hasProfile = true`
5. If expired → clear localStorage, set user/profile to null

**Exposed Functions:**
- `login(email, password)` → calls API → stores token → sets user → fetches profile
- `logout()` → clears localStorage → sets user/profile to null
- `updateToken(newToken)` → called after profile save → updates stored token + re-fetches profile

---

## 6. Feature 2 — Profile System

### What it does
Allows users (both clients and providers) to create and manage their public profile. Profile includes personal info, skills, bio, social links, profile photo, ratings, and achievements.

### Files Involved
| File | Role |
|---|---|
| `server/src/api/routes/profileRoutes.js` | Route definitions |
| `server/src/api/controllers/profileController.js` | Business logic |
| `server/src/validators/profileValidator.js` | Input validation |
| `client/src/pages/EditProfilePage.jsx` | Create/edit profile form |
| `client/src/pages/ProfilePage.jsx` | View own profile |

### Create / Update Profile

**Endpoint:** `POST /api/profiles`  
**Access:** 🔒 Private (any authenticated user)  
**Validation (Joi):**
- `fullName` — min 2, max 100 chars, required
- `tagline` — max 150 chars, optional
- `bio` — max 1000 chars, optional
- `skills` — array of strings, optional
- `profile_image_url` — valid URI, optional
- `date_of_birth` — date, optional
- `phone_number` — max 20 chars, optional
- `linkedin_url` — valid URI, optional
- `github_url` — valid URI, optional

**Process:**
1. Extract all fields from `req.body`
2. Sanitize empty strings to `null` for date, phone, URLs
3. Run PostgreSQL `INSERT ... ON CONFLICT (user_id) DO UPDATE` — acts as an UPSERT
4. On success → issue a **new JWT token** with `hasProfile: true` in payload
5. Return: `{ newProfile, token }` — frontend calls `updateToken(token)` to refresh auth state

**Frontend behavior (EditProfilePage):**
- On load: fetches existing profile via `GET /api/profiles/me` (ignores 404 if new user)
- Profile photo: click avatar → triggers hidden file input → uploads to Supabase Storage via `/api/upload` → stores returned URL in form state
- Skills: entered as comma-separated string → converted to array before API call
- On save: calls `createOrUpdateProfile` → if new token returned → `updateToken()` → navigate to `/profile`

---

### View Profile

**Endpoint:** `GET /api/profiles/me`
**Access:** 🔒 Private

Returns full profile joined with user email:
```sql
SELECT u.email, p.*
FROM profiles p
JOIN users u ON p.user_id = u.user_id
WHERE p.user_id = $1
```

> **Note (Updated):** Profile view has been consolidated into `SettingsPage.jsx` (Account tab). The `/profile` route still exists but the primary entry point is Settings → Account. The "View Profile" and "Complete Profile" links have been removed from the Navbar dropdown — Settings is now the single hub.

**Profile Account Tab features (SettingsPage):**
- Profile card: avatar (image or initial letter fallback), name, tagline, role badge
- Achievement badges (logic below)
- Stats row: star rating, total reviews, member since year
- Profile completion percentage bar (6 fields checked)
- Account details: email, phone, LinkedIn, GitHub links
- About Me (bio)
- Skills list as chips
- ✏️ Edit Profile button (top right) → `/profile/edit`
- Empty state for users with no profile → "Create Profile" button → `/create-profile`

**Achievement Badge Logic:**
| Badge | Condition |
|---|---|
| ✅ Verified | Has LinkedIn URL OR GitHub URL |
| 🌟 Top Rated | total_ratings ≥ 1 AND rating ≥ 4.5 |
| 🚀 Rising Talent | total_ratings between 1–4 AND rating < 4.5 |

**Profile Completion Score:**  
6 fields checked: `full_name`, `tagline`, `bio`, `skills (non-empty)`, `profile_image_url`, `linkedin_url OR github_url`  
Score = (fields filled / 6) × 100

---

## 7. Feature 3 — Job Management

### What it does
Allows clients to post, edit, delete, and track their jobs. Providers can browse all open jobs. The job follows a strict state machine throughout its lifecycle.

### Job Status State Machine
```
open → in_progress → submitted → completed
```
- `open` — job posted, accepting proposals
- `in_progress` — a proposal has been accepted, work underway
- `submitted` — provider submitted final work, awaiting client approval
- `completed` — client approved work and released payment

### Files Involved
| File | Role |
|---|---|
| `server/src/api/routes/jobRoutes.js` | Route definitions |
| `server/src/api/controllers/jobController.js` | Business logic |
| `server/src/validators/jobValidator.js` | Input validation |
| `client/src/pages/PostJobPage.jsx` | Post new job form |
| `client/src/pages/DashboardPage.jsx` | Client dashboard (manage jobs) |
| `client/src/pages/JobBoardPage.jsx` | Public job listing |
| `client/src/pages/JobDetailPage.jsx` | Single job detail view |

### Post a Job

**Endpoint:** `POST /api/jobs`  
**Access:** 🔒 Private — Clients only (`req.user.role !== 'client'` → 403)  
**Validation (Joi):**
- `title` — min 5, max 100 chars, required
- `description` — min 20 chars, required
- `budget` — positive number, required
- `deadline` — future date, optional

**Process:**  
Insert job into `jobs` table with `status = 'open'`. Returns the new job row.

---

### Client Dashboard (DashboardPage)

Fetches all jobs by the logged-in client via `GET /api/jobs/my-jobs`.

Query also returns `is_rated` boolean by joining `ratings` table:
```sql
SELECT j.*, 
 CASE WHEN r.rating_id IS NOT NULL THEN true ELSE false END as is_rated
FROM jobs j
LEFT JOIN ratings r ON j.job_id = r.job_id
WHERE j.client_id = $1
ORDER BY j.created_at DESC
```

**Context-Aware Action Buttons** (shown based on job status):
| Status | Available Actions |
|---|---|
| `open` | View Proposals, Edit, Delete |
| `in_progress` | Chat |
| `submitted` | Approve & Complete, Chat |
| `completed` | Rate Provider (disabled if already rated) |

**Edit Job:**
- Opens `EditJobModal` (inline modal)
- Can only edit: title, description, budget
- Backend enforces: `WHERE job_id = $1 AND client_id = $2 AND status = 'open'`

**Delete Job:**
- Opens `ConfirmationModal` for confirmation
- Backend enforces: `WHERE job_id = $1 AND client_id = $2 AND status = 'open'`
- Only open jobs can be deleted

**Approve & Complete:**
- Opens `PaymentModal` showing job title and budget amount
- On confirm → calls `POST /api/jobs/:id/complete`
- Backend: updates `status = 'completed'` (only if current status is `'submitted'`)
- Simulates payment release (no real gateway in V1)
- Triggers notification to provider: `'job_completed'`

---

## 8. Feature 4 — Proposal System

### What it does
Providers submit proposals (bid + cover letter) for open jobs. Clients review all proposals for their job and can accept one (which automatically rejects all others) or reject individual proposals.

### Files Involved
| File | Role |
|---|---|
| `server/src/api/routes/jobRoutes.js` | Proposal submission route (nested under jobs) |
| `server/src/api/routes/proposalRoutes.js` | Accept/reject/get-my-proposals routes |
| `server/src/api/controllers/jobController.js` | `submitProposal`, `getProposalsForJob` |
| `server/src/api/controllers/proposalController.js` | `acceptProposal`, `rejectProposal`, `getMyProposals` |
| `server/src/validators/proposalValidator.js` | Input validation |
| `client/src/pages/JobDetailPage.jsx` | Proposal submission UI |
| `client/src/pages/ViewProposalsPage.jsx` | Client proposal review UI |
| `client/src/pages/ProviderDashboard.jsx` | Provider: view own proposals |

### Submit a Proposal

**Endpoint:** `POST /api/jobs/:id/propose`  
**Access:** 🔒 Private — Providers only  
**Validation (Joi):**
- `cover_letter` — min 20 chars, required
- `bid_amount` — positive number, required

**Process:**
1. Role check: must be `'provider'`
2. Insert into `proposals` table with `status = 'pending'`
3. Database UNIQUE constraint on `(job_id, provider_id)` → prevents duplicate proposals
4. If duplicate → catch error code `23505` → return "You have already submitted a proposal for this job"

**Frontend (JobDetailPage):**
- Provider sees "Apply Now" button only if they have a profile (`hasProfile = true`)
- If no profile → shows "Complete Profile to Apply" link
- Click → opens `Modal` with bid amount + cover letter form
- On submit → `showToast('Proposal submitted!', 'success')`

---

### Accept a Proposal (Critical — Uses DB Transaction)

**Endpoint:** `POST /api/proposals/:id/accept`  
**Access:** 🔒 Private — Job owner (client) only  

**Process (inside BEGIN/COMMIT transaction):**
1. Find proposal → get `job_id`
2. Verify logged-in user owns the job (client_id check)
3. `UPDATE jobs SET status = 'in_progress'`
4. `UPDATE proposals SET status = 'accepted'` for selected proposal
5. `UPDATE proposals SET status = 'rejected'` for ALL other proposals on same job
6. `COMMIT`
7. Get `provider_id` from accepted proposal
8. Create notification for provider: `'proposal_accepted'` — "Your proposal has been accepted!"
9. Navigate link: `/my-proposals`

**On ROLLBACK:** Any failure in steps 1-6 rolls back all changes atomically.

---

### Reject a Proposal

**Endpoint:** `POST /api/proposals/:id/reject`  
**Access:** 🔒 Private — Job owner (client) only  

**Process:**
1. Find proposal → get `job_id`
2. Verify logged-in user owns the job
3. Check job status is `'open'` (can't reject on in-progress jobs)
4. Update proposal status to `'rejected'`

---

### View Proposals (Client)

**Endpoint:** `GET /api/jobs/:id/proposals`  
**Access:** 🔒 Private — Job owner only  

Returns all proposals with provider's `full_name` and `tagline` via JOIN on `profiles`.  
Authorization check: `client_id` of job must match `req.user.id`.

**ViewProposalsPage** loads job title + proposals in parallel using `Promise.all()`.

---

### Provider's Own Proposals (ProviderDashboard)

**Endpoint:** `GET /api/proposals/my-proposals`  
**Access:** 🔒 Private — Providers only  

Returns proposals with job info:
```sql
SELECT p.proposal_id, p.status, p.bid_amount, p.created_at,
       j.job_id, j.title AS job_title, j.status AS job_status
FROM proposals p
JOIN jobs j ON p.job_id = j.job_id
WHERE p.provider_id = $1
```

**Context-Aware Actions:**
| Condition | Available Actions |
|---|---|
| `proposal.status = 'accepted'` AND `job_status = 'in_progress'` | Submit Final Work |
| `proposal.status = 'accepted'` AND `job_status != 'completed'` | Chat with Client |
| Any status | Status badge shown |

**Submit Work:**
- Opens `ConfirmationModal`
- On confirm → `POST /api/jobs/:jobId/submit`
- Backend: checks `proposals` for accepted proposal, updates `job.status = 'submitted'`
- Triggers notification to client: `'work_submitted'`

---

## 9. Feature 5 — Real-Time Chat

### What it does
Provides a real-time, bidirectional messaging system between the client and provider of an active project (job). Chat opens only after a proposal is accepted. Supports text messages and file/image attachments.

### Files Involved
| File | Role |
|---|---|
| `server/src/socket/socketHandler.js` | All Socket.IO server events |
| `server/src/api/routes/projectRoutes.js` | HTTP routes for chat history |
| `server/src/api/controllers/projectController.js` | `getProjectMessages`, `getUserProjects` |
| `client/src/services/socket.js` | Socket.IO client singleton |
| `client/src/pages/ChatPage.jsx` | Chat UI |
| `client/src/pages/MessagesPage.jsx` | Conversation list |

### Socket Authentication

Every socket connection is JWT-authenticated at the handshake level (separate from HTTP auth):

```javascript
io.use((socket, next) => {
    const token = socket.handshake.auth.token; // JWT from client
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.user.id; // Attach verified ID to socket
    next();
});
```

The client sends the JWT during socket initialization:
```javascript
const socket = io(SOCKET_URL, {
    auth: { token: localStorage.getItem('token') }
});
```

### Socket Rooms

```
user_<userId>   ← Personal room (used for push notifications)
<projectId>     ← Project chat room (job_id used as project_id)
```

### Socket Events

**Client → Server:**
| Event | Payload | Description |
|---|---|---|
| `join_project_room` | `projectId` | Join a project's chat room |
| `leave_project_room` | `projectId` | Leave the chat room |
| `send_message` | `{ projectId, content, attachmentUrl, attachmentType }` | Send a message |
| `typing` | `{ projectId }` | Signal typing started |
| `stop_typing` | `{ projectId }` | Signal typing stopped |

**Server → Client:**
| Event | Payload | Description |
|---|---|---|
| `receive_message` | `{ projectId, senderId, sender_name, content, attachmentUrl, attachmentType, created_at }` | Broadcast message to room |
| `user_typing` | `{ userId }` | Someone is typing |
| `user_stop_typing` | — | Typing stopped |
| `message_error` | `errorMessage` | Error in message send |
| `new_notification` | `{ type, message, link, is_read, created_at }` | Push notification |

### Message Security

Before saving any message, the server re-verifies that the sender is a participant of the project:
```sql
SELECT j.client_id, p.provider_id 
FROM jobs j
JOIN proposals p ON j.job_id = p.job_id AND p.status = 'accepted'
WHERE j.job_id = $1
```
If `senderId !== client_id && senderId !== provider_id` → emit `message_error` (do not save).

### Message History (REST API)

**Endpoint:** `GET /api/projects/:projectId/messages`  
**Access:** 🔒 Private — Project participants only  

Fetches ALL messages for the project with sender names:
```sql
SELECT m.*, pr.full_name AS sender_name
FROM messages m
JOIN profiles pr ON m.sender_id = pr.user_id
WHERE m.project_id = $1
ORDER BY m.created_at ASC
```

### Conversation List (MessagesPage)

**Endpoint:** `GET /api/projects`  
**Access:** 🔒 Private  

Returns all active projects (jobs where a proposal is accepted) for the user — whether they are the client or the provider:
```sql
SELECT DISTINCT ON (j.job_id)
       j.job_id, j.title, j.status,
       c.full_name AS client_name, c.user_id AS client_id,
       p.full_name AS provider_name, p.user_id AS provider_id
FROM jobs j
JOIN proposals prop ON j.job_id = prop.job_id AND prop.status = 'accepted'
JOIN profiles c ON j.client_id = c.user_id
JOIN profiles p ON prop.provider_id = p.user_id
WHERE j.client_id = $1 OR prop.provider_id = $1
```

**Frontend (MessagesPage):**  
Shows a list of conversations. For each conversation, shows the name of the "other person" (client sees provider's name, provider sees client's name). Click → navigate to `/projects/:projectId/chat`.

### ChatPage Features
- Auto-scroll to latest message on load and on new message
- File/image attachment support via `⬆️` button
- Typing indicator: animated 3-dot bounce animation while other user types
- Auto-stop typing event after 2 seconds of no keystrokes
- Attachment rendering: images shown inline, documents shown as file link
- "Back" button → returns to `/messages`

---

## 10. Feature 6 — Notification System

### What it does
Delivers real-time push notifications to users when key events happen in their projects. Notifications are also persisted in the database so they survive page refreshes.

### Files Involved
| File | Role |
|---|---|
| `server/src/api/services/notificationService.js` | `createNotification()` utility |
| `server/src/api/routes/notificationRoutes.js` | Routes |
| `server/src/api/controllers/notificationController.js` | Get + mark read |
| `client/src/context/NotificationContext.jsx` | Frontend state + socket listener |
| `client/src/components/Navbar.jsx` | Bell icon + dropdown |

### How Notifications Are Created (Server)

`createNotification(io, userId, type, message, link)` is called by controllers after key events:

```javascript
// Saves to DB
await pool.query(
    'INSERT INTO notifications (user_id, type, message, link) VALUES ($1, $2, $3, $4)',
    [userId, type, message, link]
);

// Pushes real-time event via Socket.IO personal room
io.to(`user_${userId}`).emit('new_notification', { type, message, link, is_read: false, created_at });
```

### Notification Triggers

| Event | Recipient | Type | Message |
|---|---|---|---|
| Proposal accepted | Provider | `proposal_accepted` | "Your proposal has been accepted! You can now start the job." |
| Work submitted by provider | Client | `work_submitted` | "Work submitted for '[job title]'. Please review and complete." |
| Job completed (payment released) | Provider | `job_completed` | "Payment released! The job is marked as complete." |
| New rating received | Provider | `new_rating` | "You received a new [X]-star rating!" |

### Frontend (NotificationContext)

**On login/mount:** Fetches all notifications via `GET /api/notifications`  
**Real-time:** Listens to `socket.on('new_notification', ...)` — prepends new notification to top of list + increments unread count  
**markAsRead:** Calls `PUT /api/notifications/:id/read` → updates `is_read = true` in DB → decrements unread count  

### Navbar Notification Bell

- Shows 🔔 icon with red badge showing unread count (capped at "9+")
- Click → dropdown shows last 10 notifications
- Each notification shows: message text + relative time (`2m ago`, `3h ago`, `1d ago`)
- Unread notifications highlighted with different background
- Click notification → marks as read + navigates to the `link`

---

## 11. Feature 7 — Rating System

### What it does
After a job is completed, the client can rate the provider on a 1–5 star scale with an optional comment. The provider's profile `rating` is automatically updated using a cumulative average formula.

### Files Involved
| File | Role |
|---|---|
| `server/src/api/routes/ratingRoutes.js` | Route definition |
| `server/src/api/controllers/ratingController.js` | Business logic |
| `server/src/validators/ratingValidator.js` | Input validation |
| `client/src/pages/DashboardPage.jsx` | Rate Provider button + RatingModal |
| `client/src/components/RatingModal.jsx` | Rating form UI |

### Submit Rating

**Endpoint:** `POST /api/ratings/job/:jobId`  
**Access:** 🔒 Private — Job owner (client) only  
**Validation (Joi):**
- `score` — integer 1–5, required
- `comment` — max 500 chars, optional

**Process (inside BEGIN/COMMIT transaction with `FOR UPDATE` lock):**
1. Verify job exists AND `client_id` matches logged-in user
2. Verify job `status = 'completed'` (can only rate completed jobs)
3. Find `provider_id` from accepted proposal
4. Insert into `ratings` table with `ON CONFLICT (job_id) DO NOTHING` (one rating per job)
5. If conflict (already rated) → return 400
6. Update provider's profile rating using cumulative average formula:
```sql
UPDATE profiles 
SET total_ratings = total_ratings + 1,
    rating = ((rating * total_ratings) + $1) / (total_ratings + 1)
WHERE user_id = $2
```
7. `COMMIT`
8. Create notification for provider: `'new_rating'`

### Frontend (DashboardPage)
- "Rate Provider" button shown only when `job.status = 'completed'`
- Button disabled and shows "Rated" if `job.is_rated = true`
- Click → opens `RatingModal`
- On submit → `showToast('Rating submitted!', 'success')` → re-fetches jobs

---

## 12. Feature 8 — Complaint / Support Module

### What it does
Any authenticated user can submit a complaint/support ticket to the platform. Supports evidence file attachment. Users can view their own submitted complaints.

### Files Involved
| File | Role |
|---|---|
| `server/src/api/routes/complaintRoutes.js` | Route definitions |
| `server/src/api/controllers/complaintController.js` | Business logic |
| `server/src/validators/complaintValidator.js` | Input validation |
| `client/src/pages/ComplaintPage.jsx` | Complaint submission form |

### Submit Complaint

**Endpoint:** `POST /api/complaints`  
**Access:** 🔒 Private (any user)  
**Validation (Joi):**
- `subject` — min 5, max 100 chars, required
- `description` — min 30 chars, required
- `evidence_url` — valid URI, optional

**Frontend (ComplaintPage):**
- Subject + Description text fields
- Optional evidence file upload → uses `/api/upload` → stores Supabase URL
- On submit → success alert → redirect to home

---

## 13. Feature 9 — File Upload System

### What it does
Handles file uploads from the frontend, stores files in Supabase Storage, and returns a public URL. Used for: profile images, chat attachments, complaint evidence.

### Files Involved
| File | Role |
|---|---|
| `server/src/api/routes/uploadRoutes.js` | Route + multer config |
| `server/src/api/controllers/uploadController.js` | Supabase upload logic |
| `server/src/config/supabase.js` | Supabase client |

### Upload Endpoint

**Endpoint:** `POST /api/upload`  
**Access:** 🔒 Private  
**Handler:** multer (`memoryStorage`) — stores file in server RAM temporarily

**Process:**
1. `multer.single('file')` reads the file into `req.file`
2. Generate unique filename: `${Date.now()}-${randomNumber}.${extension}`
3. Upload to Supabase Storage bucket `'chat-attachments'` using `supabase.storage.from().upload()`
4. Get public URL via `supabase.storage.from().getPublicUrl()`
5. Return: `{ fileUrl, fileType: 'image' | 'document', fileName }`

**File type detection:** `file.mimetype.startsWith('image/')` → `'image'` else `'document'`

**⚠️ V1 Limitation:** No file size limit, no file type whitelist in V1.

---

## 14. Feature 10 — Job Board (Public Discovery)

### What it does
Public-facing page listing all open jobs. Any visitor (logged in or not) can browse jobs. Providers can search and filter to find relevant work.

### Endpoints Used
- `GET /api/jobs` — all open jobs with client name
- `GET /api/jobs/:id` — single job detail

### Job Board Features (JobBoardPage)

**Client-side search and filter (in memory):**
- **Search:** Filters by `title` or `description` containing the search term (case-insensitive)
- **Budget filter:** Minimum budget dropdown (₹1,000 / ₹5,000 / ₹10,000 / ₹50,000)
- Filters work together (both can be active simultaneously)
- "Clear Filters" button resets both

**Job Card displays:**
- Job title
- Client name (or "Anonymous")
- Date posted
- Description snippet (first 150 characters + "...")
- Budget (formatted with Indian number formatting: ₹1,00,000)
- Deadline (if set)
- "View Details" link → `/jobs/:jobId`

**Loading state:** Shows 6 SkeletonCards while fetching

---

## 15. Frontend Pages Reference

| Page | Route | Access | Description |
|---|---|---|---|
| `HomePage` | `/` | Public | Landing page with hero, stats, categories, how-it-works, testimonials, CTA |
| `RegisterPage` | `/register` | Public | Dual-role signup form |
| `LoginPage` | `/login` | Public | Email + password login |
| `JobBoardPage` | `/jobs` | Public | Browse all open jobs with search + filter |
| `JobDetailPage` | `/jobs/:jobId` | Public | Job info + apply (providers) / view proposals (client owner) |
| `EditProfilePage` | `/create-profile` | 🔒 | First-time profile creation |
| `EditProfilePage` | `/profile/edit` | 🔒 | Edit existing profile |
| `ProfilePage` | `/profile` | 🔒 | View own full profile (route kept; primary entry is now Settings) |
| `PostJobPage` | `/jobs/new` | 🔒 | Post a new job (clients only) |
| `DashboardPage` | `/dashboard` | 🔒 | Client: manage own jobs, status tracking, actions |
| `ViewProposalsPage` | `/jobs/:jobId/proposals` | 🔒 | Client: review + accept/reject proposals |
| `ProviderDashboard` | `/my-proposals` | 🔒 | Provider: view proposals, submit work |
| `MessagesPage` | `/messages` | 🔒 | List all active project conversations |
| `ChatPage` | `/projects/:projectId/chat` | 🔒 | Real-time project chat |
| `ComplaintPage` | `/complaint` | 🔒 | Submit a support/complaint ticket |
| `SettingsPage` | `/settings` | 🔒 | Account hub: profile view + change password + delete account |

---

## 16. Frontend Components Reference

| Component | Purpose |
|---|---|
| `Navbar` | Global navigation — role-aware links, notification bell + dropdown, profile avatar + dropdown (Settings, Support, Logout), mobile hamburger menu. Note: "View Profile" and "Complete Profile" removed from dropdown — Settings is now the single entry point. |
| `GradientBackground` | Animated HTML5 canvas — 5 color blobs drifting with sinusoidal motion (Stripe-style), rendered at 60fps using `requestAnimationFrame` |
| `ProtectedRoute` | React Router route wrapper — redirects unauthenticated users to `/login` |
| `Modal` | Generic modal overlay wrapper with title and close button |
| `ConfirmationModal` | Two-button (Confirm / Cancel) modal with customizable title and message |
| `EditJobModal` | Form modal pre-filled with job data for inline editing |
| `PaymentModal` | Payment release confirmation — shows job title and budget amount |
| `RatingModal` | 1–5 star interactive rating selector + optional comment textarea |
| `SkeletonCard` | Shimmer loading placeholder — accepts `rows` prop, uses CSS shimmer animation |
| `NotificationBell` | Standalone notification bell (also integrated directly in Navbar) |

---

## 17. Complete API Endpoint Reference

### Auth Routes — `/api/auth`
| Method | Endpoint | Auth | Rate Limit | Description |
|---|---|---|---|---|
| POST | `/register` | Public | 5/15min | Register new user |
| POST | `/login` | Public | 10/15min | Login, returns JWT |
| PUT | `/change-password` | 🔒 | — | Change logged-in user's password |
| DELETE | `/delete-account` | 🔒 | — | Permanently delete account (checks for active work first) |

### Profile Routes — `/api/profiles`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/me` | 🔒 | Get logged-in user's profile |
| POST | `/` | 🔒 | Create or update profile (returns new JWT) |

### Job Routes — `/api/jobs`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Get all open jobs |
| GET | `/my-jobs` | 🔒 | Get client's own jobs (with is_rated flag) |
| GET | `/:id` | Public | Get single job detail |
| POST | `/` | 🔒 Client | Create new job |
| PUT | `/:id` | 🔒 Owner | Update job (open jobs only) |
| DELETE | `/:id` | 🔒 Owner | Delete job (open jobs only) |
| GET | `/:id/proposals` | 🔒 Owner | View all proposals for job |
| POST | `/:id/propose` | 🔒 Provider | Submit proposal |
| POST | `/:id/submit` | 🔒 Assigned | Submit work for review |
| POST | `/:id/complete` | 🔒 Owner | Approve + release payment |

### Proposal Routes — `/api/proposals`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/my-proposals` | 🔒 Provider | Get own proposals |
| POST | `/:id/accept` | 🔒 Owner | Accept proposal (DB transaction) |
| POST | `/:id/reject` | 🔒 Owner | Reject specific proposal |

### Rating Routes — `/api/ratings`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/job/:jobId` | 🔒 Client | Submit rating for completed job |

### Project Routes — `/api/projects`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔒 | Get all projects (conversations) for user |
| GET | `/:projectId/messages` | 🔒 Participant | Get full chat history |

### Complaint Routes — `/api/complaints`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | 🔒 | Submit complaint |
| GET | `/my-complaints` | 🔒 | Get own complaints |

### Upload Routes — `/api/upload`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | 🔒 | Upload file → Supabase → returns public URL |

### Notification Routes — `/api/notifications`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔒 | Get all notifications |
| PUT | `/:id/read` | 🔒 | Mark notification as read |

---

## 18. Real-Time System (Socket.IO)

### Server Setup (index.js)
```
HTTP Server (wraps Express app)
  └── Socket.IO Server (wraps HTTP server)
       └── io stored in app.locals via app.set('io', io)
           → Accessible in controllers via req.app.get('io')
```

### Connection Flow
```
Client loads app
  → connectSocket() called in App.jsx useEffect
  → Passes JWT in socket.handshake.auth.token
  → Server io.use() middleware verifies JWT
  → socket.userId = decoded.user.id
  → socket.join(`user_${socket.userId}`) ← personal room
  → Connection established
```

### Socket Client Singleton (socket.js)
- `autoConnect: false` — socket does NOT connect automatically
- `connectSocket()` — refreshes token from localStorage before connecting
- `disconnectSocket()` — clean disconnect
- Transport: WebSocket with polling fallback

---

## 19. State Management (Context API)

Three global React Contexts wrap the entire application:

### Provider Tree (App.jsx)
```
<AuthProvider>           ← outermost
  <NotificationProvider>
    <ToastProvider>      ← innermost before DOM
      <GradientBackground />
      <BrowserRouter>
        <Navbar />
        <AppRouter />
      </BrowserRouter>
    </ToastProvider>
  </NotificationProvider>
</AuthProvider>
```

### AuthContext
- **State:** `user` (JWT payload), `profile` (DB data), `loading`
- **Exposes:** `login()`, `logout()`, `updateToken()`
- **Depends on:** `localStorage`, `/api/auth/login`, `/api/profiles/me`

### NotificationContext
- **State:** `notifications[]`, `unreadCount`
- **Exposes:** `markAsRead()`, `refreshNotifications()`
- **Depends on:** `AuthContext` (user), `socket` (real-time), `/api/notifications`

### ToastContext
- **State:** `toasts[]` (in-memory only, not persisted)
- **Exposes:** `showToast(message, type)` — types: `success`, `error`, `warning`, `info`
- **Auto-dismiss:** 3.5 seconds
- **Renders:** Fixed bottom-right toast stack with slide-in animation

---

## 20. Security Implemented in V1

| Security Measure | Implementation |
|---|---|
| Password hashing | bcrypt with 10 salt rounds |
| JWT authentication | All protected routes require `Authorization: Bearer <token>` |
| JWT on sockets | Handshake-level JWT verification before any event |
| Role-based access | `req.user.role` checked in every controller |
| Ownership validation | All updates/deletes verify `client_id = req.user.id` |
| Database transactions | `BEGIN / COMMIT / ROLLBACK` for all multi-step critical operations |
| Parameterized SQL | All queries use `$1, $2` — no string concatenation → SQL injection safe |
| Request validation | Joi schemas on all POST/PUT endpoints |
| Rate limiting | Login: 10/15min, Register: 5/15min per IP |
| CORS | Locked to `FRONTEND_URL` environment variable |
| Socket participant check | Server re-verifies sender is project participant before saving message |
| Unique constraint enforcement | `UNIQUE(job_id, provider_id)` in proposals, `UNIQUE(job_id)` in ratings |

---

## 21. Known Bugs in V1

| # | Bug | File | Line | Description |
|---|---|---|---|---|
| 1 | Wrong table name | `socketHandler.js` | 76 | `SELECT full_name FROM user_profiles` should be `FROM profiles` — sender_name always shows "User" in real-time messages |
| 2 | `alert()` in Register | `RegisterPage.jsx` | 33 | Browser `alert()` used — should use `showToast()` |
| 3 | `alert()` in ViewProposals | `ViewProposalsPage.jsx` | 39,41,54 | Multiple `window.alert()` calls — should use `showToast()` |
| 4 | `alert()` in ComplaintPage | `ComplaintPage.jsx` | 59 | Same issue |
| 5 | `console.log` leaking user data | `ChatPage.jsx` | 25-26 | Logs full `user` and `profile` objects to browser console |
| 6 | No 401 auto-logout | `api.js` | — | Expired JWT causes silent UI breakage — no redirect to login |
| 7 | Static socket token | `socket.js` | 12 | Token read once at module load — if expired mid-session, socket won't reconnect correctly |
| 8 | Dead code in supabase.js | `supabase.js` | 5 | Unused URL manipulation line that does nothing |

---

## 22. Known Limitations in V1

| # | Limitation | Impact |
|---|---|---|
| 1 | Payment is simulated | No real money movement — just `console.log('SIMULATING PAYMENT')` |
| 2 | No email verification | Users can register with fake emails |
| 3 | No Forgot Password | Users who forget password are permanently locked out |
| 4 | JWT expires in 1 hour — no refresh | Long sessions silently break |
| 5 | localStorage JWT storage | Vulnerable to XSS attacks (should be httpOnly cookie) |
| 6 | No file size/type limits | Malicious users can upload any file, any size |
| 7 | No security headers (Helmet) | Missing X-Frame-Options, CSP, HSTS, etc. |
| 8 | No global rate limiting | Only auth routes are rate-limited |
| 9 | Search is client-side only | Fetches ALL jobs then filters in browser — breaks at scale |
| 10 | No message pagination | All chat messages loaded at once — breaks at scale |
| 11 | No DB indexes | No explicit indexes — queries will slow as data grows |
| 12 | Ratings are one-way | Only client rates provider — provider cannot rate client |
| 13 | No admin panel | No way to manage users, moderate content, resolve disputes |
| 14 | No phone verification | No OTP — identity not validated |
| 15 | No categories | Job board has no category system yet |
| 16 | No location filtering | No city/area-based job discovery |
| 17 | No body size limit | `express.json()` has no max body size |

---

## 23. V2 Roadmap

### Phase 1 — Critical Bug Fixes
- [ ] Fix `user_profiles` → `profiles` in `socketHandler.js`
- [ ] Replace all `alert()` calls with `showToast()`
- [ ] Remove debug `console.log` statements
- [ ] Add 401 response interceptor in `api.js`
- [ ] Add `express.json({ limit: '50kb' })`

### Phase 2 — Security Hardening
- [ ] Add `helmet` for HTTP security headers
- [ ] Add global rate limiter (200 req/15min)
- [ ] Add file upload size limit (10MB) + type whitelist
- [ ] Add Content Security Policy
- [ ] Increase bcrypt rounds to 12

### Phase 3 — Authentication Improvements
- [ ] Email verification on registration (Nodemailer + Resend)
- [ ] Forgot Password / Reset Password flow
- [ ] Password strength enforcement (8+ chars, mixed case, numbers, symbols)
- [ ] JWT refresh token system (15min access + 7day refresh)
- [ ] Phone OTP verification (MSG91 / Twilio)

### Phase 4 — Trust & Identity
- [ ] Government ID upload + admin verification
- [ ] Two-way rating system (provider rates client too)
- [ ] Admin moderation dashboard
- [ ] Structured dispute resolution flow
- [ ] Progressive trust badges (Verified / Rising Talent / Top Rated / Pro)

### Phase 5 — Performance & Scale
- [ ] Database indexes on all foreign keys and frequently queried columns
- [ ] Message pagination (load 30 at a time)
- [ ] Server-side search with PostgreSQL full-text search
- [ ] Debounced search input
- [ ] Image lazy loading
- [ ] React code splitting for page-level bundles

### Phase 6 — Real-World Features
- [ ] Work category system (Plumbing / Electrical / Carpentry / Tutoring / etc.)
- [ ] Location/city-based job filtering
- [ ] Real escrow payment integration (Razorpay Route)
- [ ] Audit/activity logging table
- [ ] Work check-in / check-out system
- [ ] Browser push notifications (Notification API)

---

*End of ProxiWork V1 Documentation*
