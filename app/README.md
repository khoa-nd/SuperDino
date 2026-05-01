# SuperDino 🦕

A gamified chore & reward tracker for families. Kids log tasks to earn eggs, make wishes, and parents approve and reward — all in a phone-first PWA.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + TypeScript
- **Supabase** (PostgreSQL + API)
- **Tailwind CSS v4**
- **Zustand** (state management with persistence)
- **Deployed on Vercel**

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/khoa-nd/SuperDino.git
cd SuperDino/app
npm install
```

### 2. Set up environment variables

Copy `.env.example` (or create `.env`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Set up the database

Run the Supabase migrations:

```bash
supabase migration up
```

Or manually run the SQL files in `supabase/migrations/` in order:
1. `0001_init.sql` — Creates tables, seed data
2. `0002_password.sql` — Adds password hashing
3. `0003_wish_category.sql` — Adds wish categories
4. `0004_assigned_status.sql` — Adds assigned task status

### 4. Run locally

```bash
npm run dev
```

Opens at `http://localhost:3000`.

### Demo accounts

| Role   | Username | Password (any) |
|--------|----------|----------------|
| Parent | parent   | —              |
| Kid    | mia      | —              |

Demo family code: `DINO-F1`

## Project Structure

```
app/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── api/       # API routes (SuperDino backend)
│   │   ├── (auth)/    # Auth route group
│   │   ├── (app)/     # App route group (child/parent)
│   │   ├── layout.tsx # Root layout
│   │   ├── page.tsx   # Main SPA entry
│   │   └── globals.css
│   ├── components/
│   │   ├── child/     # Child screens & widgets
│   │   ├── parent/    # Parent screens & widgets
│   │   ├── shared/    # Onboarding, login
│   │   └── ui/        # Reusable UI primitives
│   ├── lib/           # Store, API client, utils
│   ├── hooks/         # React hooks
│   └── types/         # TypeScript types
├── supabase/
│   ├── schema.sql     # Full schema reference
│   └── migrations/    # Ordered DB migrations
└── public/            # Static assets
```

## Features

### For Kids
- **Log tasks** — Browse by category, tap to log. Auto-approved tasks earn instantly.
- **Custom tasks** — Describe your own task with suggested egg reward.
- **Assigned tasks** — Parent-assigned tasks appear with a "Done" button.
- **Make wishes** — Browse the wish catalog, spend eggs to request rewards.
- **Suggest wishes** — Propose a custom wish with your own egg cost.
- **Track progress** — Egg balance, earned/spent history, activity feed.

### For Parents
- **Approve tasks** — Review logged tasks, adjust egg rewards (bonus/deduct).
- **Assign tasks** — Pick a kid + task to assign. They mark it done for approval.
- **Manage catalog** — Add/edit tasks and wishes for the family.
- **Grant wishes** — Review wish requests, adjust costs, approve or reject.
- **Convert wishes** — Promote popular custom wishes to the permanent catalog.
- **Family code** — Share a code for other parents/kids to join the same family.

### Auth & Security
- **SHA-256 password hashing** with per-username salt.
- **Server-side balance checks** prevent overspending on wishes.
- **Service role key** never exposed to the client — all DB ops via API routes.

## API

All data operations go through a single API endpoint:

```
POST /api/superdino
```

Actions: `login`, `snapshot`, `createTask`, `createWish`, `logTask`, `logCustomTask`, `submitWish`, `submitCustomWish`, `assignTask`, `completeAssignedTask`, `approveTask`, `rejectTask`, `approveWish`, `rejectWish`, `convertWish`

## Deploy

The project deploys to Vercel with the root directory set to `app/`. Environment variables must be set in Vercel's dashboard.

```bash
vercel --prod
```
