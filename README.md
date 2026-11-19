# ⚡ CYBER//PORTFOLIO ADMIN PANEL v1.2 (PRODUCTION HARDENED)
> Decoupled Full-Stack Architecture: Python (FastAPI) REST API + React.js (Vite + Tailwind CSS + Lucide Icons) with SQLite WAL Mode persistence, Dynamic Superadmin Security, Automated & On-Demand Backup Engine, File Upload Pipeline, and Split-Screen Markdown Editor.

---

## 🌌 Visual Identity & Design System (Cyber Neon)
- **Base Background:** Deep Obsidian / Cyber Black (`#050811`, `#080d1a`, `#0b1329`) with subtle radial gradients and cyber grid backdrop.
- **Accent Palette:**
  - **Electric Neon Cyan** (`#00f0ff` / `shadow-neon-cyan`): Primary focus, active indicators, brand markers, preview highlights.
  - **Vivid Neon Blue** (`#0072ff` / `shadow-neon-blue`): Gradient transitions, secondary highlights.
  - **Electric Emerald** (`#00ff9d` / `shadow-neon-emerald`): Published projects, active system status, verified transmissions.
  - **Neon Crimson / Rose** (`#ff0055` / `shadow-neon-crimson`): Critical purge dialogs, unread leads alert, session disconnect.
  - **Soft Slate Gray** (`#94a3b8`): Low-contrast typography and subtle dividers.
- **Aesthetics & Micro-Interactions:**
  - Dark glassmorphism cards (`backdrop-blur-md bg-[#0a0f24]/85 border border-cyan-500/20`).
  - Monospace tech typography (`JetBrains Mono` / `Inter`).
  - Interactive status toggles, optimistic drag/arrow reordering, live markdown previewer, glowing image preview frames, and security modal controls.

---

## 🛡️ PRODUCTION HARDENING MODULES (v1.2)

### 1. Dynamic Superadmin Profile & Credential Rotation
- **Database Model (`AdminUser`):** Replaces static credentials with persistent database storage (`id`, `username`, `password_hash`, `created_at`, `updated_at`).
- **Profile Update Endpoint (`PUT /api/auth/profile`):**
  - Allows the Superadmin to rotate their username handle.
  - Validates uniqueness and automatically signs and issues a fresh JWT token to prevent session interruption.
- **Password Rotation Endpoint (`PUT /api/auth/change-password`):**
  - Requires `{ current_password, new_password, confirm_new_password }`.
  - Enforces minimum 8 characters and confirmation matching.
  - Validates `current_password` against the stored `bcrypt` hash before committing.
- **Frontend Security Interface (`SecuritySettingsModal.jsx`):**
  - Accessible via the **Operator Identity Chip** or **SECURITY & BACKUP** button in the navigation header.
  - Live feedback alerts, reveal/hide eye toggles, length validation hints, and match status badges.

### 2. SQLite Automated Backup Engine & Snapshot API
- **Atomic Online Snapshots (`backend/backup_engine.py`):**
  - Uses SQLite's native C-level `sqlite3.connect().backup()` method.
  - Captures live database state safely without locking or corrupting concurrent read/write transactions.
- **Write-Ahead Logging (WAL):**
  - SQLite WAL mode enabled on connect (`PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;`).
- **Gzip Archive Compression:**
  - Compresses snapshots into `.db.gz` archives with level 9 compression (over 90% space reduction) and removes uncompressed temporary files.
- **Automated 7-Day Retention Pruning:**
  - Automatically scans and deletes snapshot archives older than 7 days.
- **Background Scheduler Integration (`APScheduler`):**
  - Integrated into FastAPI's lifespan event to automatically trigger `create_snapshot()` once every 24 hours.
- **On-Demand Admin Endpoint (`POST /api/admin/backup-now`):**
  - Guarded with Superadmin JWT.
  - Generates an immediate atomic snapshot and streams the `.db.gz` file directly to the browser via `FileResponse`.
- **Frontend One-Click Backup:**
  - Instant **"SNAPSHOT DB"** button in Dashboard and **"DOWNLOAD .DB.GZ"** in the Security Modal.

### 3. Media Upload Pipeline & Reordering
- Local uploads directory (`backend/uploads/`) mounted at `/uploads`.
- Image MIME/extension validation (`.jpg`, `.jpeg`, `.png`, `.webp`) and collision-proof UUID naming.
- Custom priority sorting (`POST /api/projects/reorder`) with optimistic UI reordering (`ArrowUp`/`ArrowDown`).
- Split-screen / tabbed Markdown case study editor powered by `react-markdown` and `remark-gfm`.

---

## 📁 Repository Structure

```text
c:\Agent-Daniyal\Portfolio-web\
├── backend/
│   ├── main.py              # FastAPI app, security endpoints, scheduler & static mounts
│   ├── backup_engine.py     # SQLite atomic online backup, gzip compression & retention pruner
│   ├── database.py          # SQLAlchemy engine with SQLite WAL mode & auto-migrations
│   ├── models.py            # AdminUser, Project, and Inquiry SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas (ProfileUpdate, ChangePassword, Project, etc.)
│   ├── auth.py              # Database-backed bcrypt hashing & JWT token validation
│   ├── seed.py              # Database seeder (admin user, markdown case studies & covers)
│   ├── uploads/             # Static media assets directory
│   ├── backups/             # Compressed .db.gz backup snapshots directory
│   ├── portfolio.db         # Persistent SQLite database (WAL mode)
│   ├── live_test.py         # End-to-end automated test suite (16+ endpoints verified)
│   ├── requirements.txt     # Python backend dependencies (including APScheduler)
│   └── .env.example         # Environment configuration template
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, SecuritySettingsModal, ProjectModal, ConfirmDialog, etc.
│   │   ├── context/         # AuthContext.jsx (authentication & session provider)
│   │   ├── pages/           # Login.jsx, Dashboard.jsx, ProjectsPage.jsx, InquiriesPage.jsx
│   │   ├── services/        # api.js (HTTP client with updateProfile, changePassword, downloadBackup)
│   │   ├── App.jsx          # Root layout, routing, modal orchestration
│   │   ├── main.jsx         # Entry point mounting AuthProvider
│   │   └── index.css        # Tailwind directives, cyber grid & glow utilities
│   ├── index.html           # HTML template with JetBrains Mono & Inter fonts
│   ├── tailwind.config.js   # Custom cyber colors, glows, shadows & animations
│   ├── vite.config.js       # Vite development & build configuration
│   └── package.json         # React 18, Tailwind CSS, Lucide React, react-markdown, remark-gfm
└── README.md
```

---

## 🚀 Execution & Quick Start Guide

### 1. Backend (FastAPI + SQLite WAL)

Open a terminal in `backend/`:

```bash
cd c:\Agent-Daniyal\Portfolio-web\backend

# Install dependencies:
pip install -r requirements.txt

# Start the FastAPI REST API server:
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

> **API Documentation (Swagger UI):** Open `http://localhost:8000/docs` in your browser.
> **Static Assets:** Accessible at `http://localhost:8000/uploads/<filename>`.

### 2. Frontend (React + Vite + Tailwind CSS)

Open a second terminal in `frontend/`:

```bash
cd c:\Agent-Daniyal\Portfolio-web\frontend

# Install dependencies:
npm install

# Start Vite dev server:
npm run dev
```

> **Admin Portal:** Open `http://localhost:5173` in your browser.

---

## 🔑 Default Superadmin Credentials
- **Username:** `admin`
- **Password:** `admin123`
*(Use the **"Auto-fill Demo Credentials"** button on the login screen for one-click authentication).*

---

## 📡 Hardened REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | System health check (reports SQLite 3 WAL Mode) |
| `POST` | `/api/auth/login` | Public | Authenticates superadmin against DB and returns JWT |
| `GET` | `/api/auth/me` | Protected | Returns current active operator info |
| `PUT` | `/api/auth/profile` | Protected | Updates superadmin username & reissues JWT |
| `PUT` | `/api/auth/change-password` | Protected | Rotates security key with verification & bcrypt hash |
| `POST` | `/api/auth/logout`| Protected | Terminates operator session |
| `POST` | `/api/admin/backup-now` | Protected | Triggers atomic SQLite snapshot and downloads `.db.gz` |
| `GET` | `/api/admin/backup-stats` | Protected | Returns telemetry on existing snapshots and disk size |
| `POST` | `/api/upload` | Protected | Uploads project cover screenshot (`.jpg`, `.png`, `.webp`) |
| `GET` | `/uploads/{file}` | Public | Static file serving for media assets |
| `GET` | `/api/stats` | Protected | Dashboard telemetry (total/published/drafts/inquiries) |
| `GET` | `/api/projects` | Public | Lists projects ordered by `order_index ASC` |
| `POST` | `/api/projects/reorder` | Protected | Batch updates priority order indices in one transaction |
| `GET` | `/api/projects/{id}` | Public | Retrieves a single project record |
| `POST` | `/api/projects` | Protected | Creates a new portfolio project |
| `PUT` | `/api/projects/{id}` | Protected | Updates project metadata, links, cover & description |
| `PATCH`| `/api/projects/{id}/toggle-status` | Protected | Toggles Published vs Draft status instantly |
| `DELETE`| `/api/projects/{id}` | Protected | Purges project record from database |
| `POST` | `/api/inquiries` | Public | Contact form submission endpoint for visitors |
| `GET` | `/api/inquiries` | Protected | Lists all client inquiries/leads |
| `PATCH`| `/api/inquiries/{id}/read` | Protected | Toggles read/unread state |
| `DELETE`| `/api/inquiries/{id}` | Protected | Permanently removes an inquiry from records |

---

## 🧪 Verification & Hardening Checklist

### Automated Full-Suite Verification
Run the comprehensive test script covering password rotation, profile updates, atomic backup generation, integrity restoration, and media upload:
```bash
cd c:\Agent-Daniyal\Portfolio-web\backend
python live_test.py
```

### Manual Backup Engine Test
Verify standalone snapshot creation, compression, and metadata extraction:
```bash
cd c:\Agent-Daniyal\Portfolio-web\backend
python backup_engine.py
```
*(Generates a snapshot in `backend/backups/`, compresses to `.gz`, and displays size reduction).*
