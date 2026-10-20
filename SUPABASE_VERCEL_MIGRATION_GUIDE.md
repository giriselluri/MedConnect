# MedConnect AI — Supabase & Vercel Migration Guide

This guide details how MedConnect AI resolves the Vercel production read-only filesystem error (`ENOENT: no such file or directory, mkdir '/var/task/.data'`) by migrating application persistence to **Supabase PostgreSQL**.

---

## 1. Why the Error Occurred on Vercel

On Vercel serverless functions (AWS Lambda execution environment):
- `process.cwd()` resolves to `/var/task`, which is a read-only root directory.
- Any attempt to execute `fs.mkdirSync(path.join(process.cwd(), '.data'))` throws `ENOENT` / `EROFS`.
- Serverless instances are stateless and ephemeral; local JSON file storage cannot persist across invocations or scale across multiple serverless lambda instances.

---

## 2. Architecture of the Solution

1. **Serverless-Safe Filesystem Guard**:
   - `getLocalDbFile()` in [server-db.ts](file:///Users/srinivaseluri/Desktop/MedConnectAI/src/lib/server-db.ts) immediately detects serverless execution environments (`process.env.VERCEL === '1'`, `AWS_LAMBDA_FUNCTION_NAME`, or `/var/task`) and safely skips all local directory creation and filesystem writes.

2. **Dedicated PostgreSQL Database Layer**:
   - [supabase-db.ts](file:///Users/srinivaseluri/Desktop/MedConnectAI/src/lib/supabase-db.ts) connects directly to Supabase PostgreSQL using `@supabase/supabase-js`.
   - Automatically supports all 18 application tables with relational integrity, foreign keys, indexes, and full CRUD operations.
   - Includes automatic baseline dataset seeding (`ensureSeeded()`) when tables are unpopulated.

3. **Multi-Instance Serverless Session Persistence**:
   - Employs an HTTP-only `medconnect_session_user_id` session cookie set on login, signup, user switching, and cleared on logout.
   - Serverless requests independently resolve the active session user via cookie headers without depending on container-local memory.

4. **Backward Compatibility**:
   - In local development without Supabase credentials, the app gracefully falls back to local JSON storage.

---

## 3. Database Schema Overview (18 Tables)

Located at [supabase/schema.sql](file:///Users/srinivaseluri/Desktop/MedConnectAI/supabase/schema.sql) and [supabase/seed.sql](file:///Users/srinivaseluri/Desktop/MedConnectAI/supabase/seed.sql):

| # | Table Name | Purpose |
|---|---|---|
| 1 | `specialties` | Controlled medical specialty taxonomy |
| 2 | `profiles` | Clinical and admin user accounts |
| 3 | `profile_specialties` | User specialty associations |
| 4 | `posts` | Peer feed posts, reposts, article links |
| 5 | `post_likes` | Peer post likes and endorsements |
| 6 | `comments` | Post discussion comments |
| 7 | `case_studies` | Peer clinical case studies (public, private, password-protected) |
| 8 | `case_study_specialties`| Case study specialty tags |
| 9 | `groups` | Specialty clinical communities |
| 10 | `group_members` | Community memberships |
| 11 | `connections` | Peer connections (pending, accepted, blocked) |
| 12 | `follows` | Healthcare professional follower/following graph |
| 13 | `bookmarks` | Saved posts, case studies, news, and journals |
| 14 | `notifications` | Social & networking activity notifications |
| 15 | `ai_sessions` | AI Research Assistant synthesis sessions |
| 16 | `content_reports` | Admin moderation reports |
| 17 | `jobs` | Clinical job opportunities & vacancies |
| 18 | `advertisements` | Sponsored medical educational announcements |

---

## 4. Setup Instructions: Supabase & Vercel

### Step A: Configure Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a new project (or select an existing one).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. (Optional) Paste the contents of `supabase/seed.sql` and click **Run** to load initial demo personas, jobs, and ads (or let the app auto-seed on first request).

### Step B: Configure Vercel Environment Variables
In your Vercel Project Settings (`Settings -> Environment Variables`), add the following:

| Key | Value / Source | Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (`https://xyz.supabase.co`) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase `anon` / `public` API key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` key (Server-side elevated access) | Production, Preview, Development |
| `GEMINI_API_KEY` | Google Gemini API Key (for AI Research Assistant) | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL (e.g. `https://med-connect-sandy.vercel.app`) | Production, Preview, Development |

> [!IMPORTANT]
> The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS) and is used exclusively inside server-side API routes (`src/app/api/*`) for database management. It is never leaked or bundled into client-side code.

### Step C: Deploy to Vercel
1. Trigger a deployment on Vercel (or redeploy with cleared cache).
2. The Next.js application will bundle with zero filesystem errors and persist all posts, case studies, profiles, connections, and sessions directly in Supabase Postgres.
