-- Run this in Supabase: SQL Editor -> New query -> Run

create table if not exists public.complaints (
  id text primary key,
  student_name text not null,
  department text not null,
  location text not null,
  category text not null check (category in ('Computer','Projector','Fan','Light','Wi-Fi')),
  title text not null,
  description text not null,
  image_urls text[] not null default '{}',
  status text not null default 'Pending' check (status in ('Pending','In Progress','Resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists complaints_created_idx on public.complaints (created_at desc);
create index if not exists complaints_status_idx on public.complaints (status);
create index if not exists complaints_category_idx on public.complaints (category);

-- Lock the table: all access goes through the Next.js server using the service role key.
alter table public.complaints enable row level security;

-- Public bucket for complaint pictures (uploads happen server-side only)
insert into storage.buckets (id, name, public)
values ('complaint-images', 'complaint-images', true)
on conflict (id) do nothing;
