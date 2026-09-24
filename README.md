# UniManage — University Management System MVP

An MVP for university management built with **Next.js 16**, **Supabase**, **TypeScript**, and **Tailwind CSS v4**.

**Live demo:** [university-management-system-mvp.vercel.app](https://university-management-system-mvp.vercel.app/)

## Features

- **Authentication** — Email sign-up, login, logout, password reset with role-based access (student, professor, admin)
- **Course Catalog** — Browse, filter, enroll/drop courses with capacity enforcement
- **Assessment System** — Professors create assignments, students submit (text + file), professors grade with feedback
- **Classroom Management** — View classrooms, book with non-overlapping time enforcement
- **Messaging** — Student ↔ Professor conversations with real-time support
- **Announcements** — Admin-posted university-wide announcements

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel (recommended) |

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/AnonyBOSS/University-Management-System-MVP.git
cd University-Management-System-MVP
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **Anon Key** from Settings → API

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials (Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and is needed only for the admin "change user role" action. Never expose it to the browser.

### 4. Run the Database Schema

1. Open your Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Run the entire script — this creates all tables, RLS policies, triggers, and seed data

### 5. Configure Storage (for file uploads)

The schema automatically creates a `submissions` storage bucket. If it doesn't appear:
1. Go to Supabase Dashboard → Storage
2. Create a bucket named `submissions` (set to private)

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 7. Create Your First Admin

1. Sign up with any email at `/signup`
2. Go to Supabase Dashboard → Table Editor → `profiles`
3. Find your user and change the `role` column from `student` to `admin`
4. Refresh the app — you'll now see the admin dashboard

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, signup, reset)
│   ├── (dashboard)/        # Protected pages with sidebar layout
│   │   ├── dashboard/      # Role-based dashboards
│   │   ├── courses/        # Course catalog + details
│   │   ├── assignments/    # Assignments + submissions
│   │   ├── grades/         # Student grade book
│   │   ├── classrooms/     # Classroom booking
│   │   ├── messages/       # Messaging system
│   │   ├── announcements/  # Announcement feed
│   │   └── admin/          # Admin-only pages
│   └── auth/callback/      # Auth callback handler
├── actions/                # Server Actions (business logic)
├── components/             # React components
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # Sidebar, Topbar
│   ├── auth/               # Auth forms
│   ├── courses/            # Course components
│   ├── assignments/        # Assignment components
│   ├── classrooms/         # Booking components
│   └── messages/           # Message components
└── lib/                    # Utilities and config
    ├── supabase/           # Supabase client setup
    ├── types/              # TypeScript definitions
    └── utils.ts            # Helper functions
```

## Database Schema

See `supabase/schema.sql` for the full schema. Key tables:

- `profiles` — User data with roles (student/professor/admin)
- `courses` — Course catalog with professor assignment
- `enrollments` — Student ↔ Course registrations
- `assignments` — Professor-created assignments
- `submissions` — Student submissions (text + file)
- `grades` — Graded submissions with feedback
- `classrooms` — Physical room inventory
- `bookings` — Classroom reservations (non-overlapping enforced)
- `messages` — Student ↔ Professor messaging
- `announcements` — Admin announcements

## Security

- **Row Level Security (RLS)** on all tables
- **Middleware** route protection for all dashboard pages
- **Role-based access** enforced at both UI and database levels
- **Server Actions** for all data mutations (no client-side writes)

## License

MIT
