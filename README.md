# Freelance Project Tracker

A browser-based freelance ops dashboard designed to track Upwork subcontracted jobs. Allows tracking of client names, workers, pay, project statuses, follow-up notes, along with Excel export and WhatsApp-ready sharing.

---

## 🚀 How to Run Locally

1. **Install Dependencies:**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Supabase project credentials:
   ```bash
   cp .env.example .env
   ```
   Modify `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   The application will be served at `http://localhost:5173`.

4. **Build for Production:**
   Verify code compilation and generate optimized static assets:
   ```bash
   npm run build
   ```

---

## 🗄️ Database Setup (Supabase SQL)

Go to the **SQL Editor** in your Supabase dashboard and run the following script to set up the `jobs` table, the auto-update timestamp trigger, and disable Row Level Security (RLS) for anonymous access:

```sql
-- 1. Create the jobs table
create table jobs (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  worker_name text not null,
  price numeric(10,2) not null,
  status text not null default 'New' check (status in ('New','Started','Confirmed','Milestone Cleared','Completed')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create the update trigger function to set updated_at automatically
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. Bind the trigger to the table
create trigger set_updated_at
before update on jobs
for each row execute procedure update_updated_at();

-- 4. Disable RLS (since this dashboard uses private access URL without auth)
alter table jobs disable row level security;
```

---

## ⚙️ Updating Environment Variables on Antigravity

When deploying to Antigravity:
1. Open the project settings panel on Antigravity.
2. Add the environment variables:
   - `VITE_SUPABASE_URL` with your Supabase API URL.
   - `VITE_SUPABASE_ANON_KEY` with your Supabase Anon public key.
3. Re-deploy the project.

---

## 🛠️ How to Add a New Status Stage in the Future

The status list is managed entirely in [src/lib/statusConfig.js](file:///c:/Users/hp/Project%20Tracker/src/lib/statusConfig.js).

To add a new stage (e.g., `'In Review'`):
1. **Database update:** Update the check constraint on your Supabase `jobs` table to allow the new status:
   ```sql
   alter table jobs drop constraint jobs_status_check;
   alter table jobs add constraint jobs_status_check check (status in ('New','Started','Confirmed','Milestone Cleared','In Review','Completed'));
   ```
2. **Frontend sequence:** Edit `STATUS_SEQUENCE` in `src/lib/statusConfig.js`:
   ```javascript
   export const STATUS_SEQUENCE = ['New', 'Started', 'Confirmed', 'Milestone Cleared', 'In Review', 'Completed'];
   ```
3. **Frontend metadata:** Add status styles and color tokens inside `STATUS_CONFIG` in `src/lib/statusConfig.js`:
   ```javascript
   'In Review': {
     label: 'In Review',
     color: '#FBBF24', // Hex color representation
     bgClass: 'bg-status-review',
     textClass: 'text-status-review',
     badgeClass: 'badge-review'
   }
   ```
4. **Style sheet:** Define the styles in [src/style.css](file:///c:/Users/hp/Project%20Tracker/src/style.css):
   ```css
   :root {
     --color-review: #fbbf24;
     --color-review-bg: rgba(251, 191, 36, 0.15);
     --color-review-border: rgba(251, 191, 36, 0.4);
   }
   .badge-review {
     background-color: var(--color-review-bg);
     border-color: var(--color-review-border);
     color: var(--color-review);
   }
   ```

---

## 🔗 How to Connect a Different Database

All database operations are encapsulated inside [src/lib/supabase.js](file:///c:/Users/hp/Project%20Tracker/src/lib/supabase.js).

To switch to a different database (e.g. Firebase Firestore or your own REST API):
1. **Initialize SDK:** Replace the Supabase SDK imports and initialization inside `supabase.js` with your chosen database client client.
2. **Implement Methods:** Rewrite the following exported functions to perform queries against your new API:
   - `fetchJobs()`: Get all job records ordered by date.
   - `addJob(job)`: Insert a new job record.
   - `updateJob(id, updates)`: Update a job record fields.
   - `deleteJob(id)`: Permanently delete a record.
   - `advanceJobStatus(id, nextStatus)`: Update the status field of a record.
