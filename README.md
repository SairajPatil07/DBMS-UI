# 🏋️ IronForge Gym Management System — DBMS Project

A full-stack Gym Management System UI connected to an **Oracle SQL** database, built with React + Vite (frontend) and Node.js Express (backend).

---

## 📁 Project Structure

```
DBMS UI/
├── backend/
│   ├── schema.sql       ← Run this FIRST — creates all Oracle tables
│   ├── seed_data.sql    ← Run this SECOND — inserts sample data
│   ├── queries.sql      ← All important SQL queries (JOINs, triggers, views)
│   ├── db.js            ← Oracle DB connection pool
│   ├── server.js        ← Express API server (all routes)
│   └── .env             ← Your DB credentials (edit this!)
└── src/
    ├── pages/           ← All UI screens
    ├── services.js      ← All API calls to backend
    └── layouts/         ← Sidebar + Topbar layout
```

---

## 🚀 How to Run

### Step 1 — Setup Oracle Database

Open **SQL Developer** or **SQL*Plus** and run the files **in this exact order**:

```sql
-- 1. Run schema (creates all 12 tables)
@backend/schema.sql

-- 2. Run seed data (inserts sample records)
@backend/seed_data.sql
```

> ⚠️ **IMPORTANT**: Run `schema.sql` once only. If you need to reset, the DROP statements at the top will clean up first. Do NOT run `queries.sql` before `seed_data.sql`.

### Step 2 — Configure Backend

Edit `backend/.env`:

```env
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECTION_STRING=localhost/XEPDB1
PORT=5000
```

### Step 3 — Start the Backend API Server

```bash
cd backend
node server.js
```

✅ Should show: `Oracle DB connection pool created` and `Server running at http://localhost:5000`

### Step 4 — Start the React Frontend

In a new terminal:

```bash
npm run dev
```

✅ Open: **http://localhost:5173**

Login with: `admin` / `admin123`

---

## 🗄️ Database Tables (12 Tables)

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `Users` | Admin/Trainer login | — |
| `Plans` | Membership plans | Referenced by Members (FK) |
| `Trainers` | Trainer details | Referenced by Members, Batches |
| `Members` | Core member data | FK → Plans, Trainers |
| `Payments` | Payment records | FK → Members (CASCADE DELETE) |
| `Attendance` | Daily check-ins | FK → Members (CASCADE DELETE) |
| `Equipment` | Gym equipment | — |
| `Workouts` | Workout plans | M:M with Members |
| `Member_Workouts` | Assignment table | FK → Members, Workouts |
| `Progress` | Weight/BMI logs | FK → Members |
| `Batches` | Time slots | FK → Trainers |
| `Batch_Members` | Slot assignments | FK → Batches, Members |

---

## 🔗 Key DB–UI Connections (What Scores Points)

| UI Action | SQL Operation |
|-----------|--------------|
| Dashboard KPIs | `COUNT`, `SUM`, `EXTRACT` aggregates |
| Member Profile | 3-table `LEFT OUTER JOIN` (Members + Plans + Trainers) |
| Delete Member | `ON DELETE CASCADE` removes Payments + Attendance |
| Record Payment | Transaction: `INSERT Payments` + `UPDATE Members.status` |
| Mark Attendance | `MERGE` statement (prevents duplicates) |
| Notifications | Subqueries for expiring/pending/inactive alerts |
| Trigger | `trg_payment_after_insert` — auto-updates member status |
| Views | `vw_member_details`, `vw_payment_summary` |

---

## 💡 Troubleshooting

**FK violations in seed_data.sql?**
→ Make sure you're running `schema.sql` fresh (DROP + CREATE) before `seed_data.sql`.
→ Do NOT run `queries.sql` before `seed_data.sql`.

**Oracle identity sequence gaps?**
→ This is normal with `GENERATED ALWAYS AS IDENTITY`.
→ The fixed `seed_data.sql` uses **subqueries by phone number** — not hardcoded IDs.
