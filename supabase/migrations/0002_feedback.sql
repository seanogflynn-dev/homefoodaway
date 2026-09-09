-- Adds a general-purpose feedback table for the site-wide feedback tab.
-- Run this in the Supabase SQL editor after 0001_init.sql.

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  rating smallint check (rating between 1 and 5),
  page_path text,
  contact_email text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on feedback (created_at desc);

-- Anyone can submit feedback — signed in or not, same as a Qualtrics
-- website intercept. Nobody can read it back through the public API; view
-- responses in the Supabase Table Editor (or query as yourself there),
-- which uses the service role and bypasses RLS.
alter table feedback enable row level security;

create policy "anyone can submit feedback" on feedback for insert
  to anon, authenticated with check (true);
