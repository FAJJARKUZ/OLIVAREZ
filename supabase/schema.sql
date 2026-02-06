-- Olivarez College Inventory Management - Supabase schema and RLS
-- Run this in the Supabase SQL Editor after creating your project.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users with role)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('ADMIN', 'ACCOUNTING', 'SUPPLIER')),
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'ADMIN'),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Inventory items
create table if not exists public.inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  quantity int default 0,
  department text,
  classification text check (classification in ('transfer', 'reassignment', 'disposal')),
  is_defective boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Inventory movements (tracking)
create table if not exists public.inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references public.inventory_items(id) on delete set null,
  movement_type text,
  quantity int,
  notes text,
  created_at timestamptz default now()
);

-- Deployments (asset deployment, serial numbers)
create table if not exists public.deployments (
  id uuid primary key default uuid_generate_v4(),
  serial_number text,
  asset_name text,
  department text,
  letter_url text,
  notes text,
  created_at timestamptz default now()
);

-- Clearances
create table if not exists public.clearances (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  request_type text,
  description text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_notes text,
  created_at timestamptz default now()
);

-- Stock requests (for supplier)
create table if not exists public.stock_requests (
  id uuid primary key default uuid_generate_v4(),
  item_name text,
  quantity int,
  availability text,
  created_at timestamptz default now()
);

-- Supplier invoices (optional)
create table if not exists public.supplier_invoices (
  id uuid primary key default uuid_generate_v4(),
  reference text,
  amount numeric,
  payment_status text,
  created_at timestamptz default now()
);

-- Storage bucket for deployment letters
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- RLS: profiles (users can read own profile)
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS: inventory_items (ADMIN full access)
alter table public.inventory_items enable row level security;

create policy "Admin full access inventory"
  on public.inventory_items for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

-- Allow others to read for reports
create policy "Others read inventory"
  on public.inventory_items for select
  using (
    exists (select 1 from public.profiles where id = auth.uid())
  );

-- RLS: inventory_movements
alter table public.inventory_movements enable row level security;

create policy "Admin full access movements"
  on public.inventory_movements for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "Others read movements"
  on public.inventory_movements for select
  using (exists (select 1 from public.profiles where id = auth.uid()));

-- RLS: deployments (ADMIN + ACCOUNTING)
alter table public.deployments enable row level security;

create policy "Admin accounting deployments"
  on public.deployments for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'ACCOUNTING'))
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'ACCOUNTING'))
  );

-- RLS: clearances
alter table public.clearances enable row level security;

create policy "Users can insert own clearances"
  on public.clearances for insert
  with check (auth.uid() = user_id);

create policy "Admin accounting read update clearances"
  on public.clearances for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'ACCOUNTING'))
  );

create policy "Users read own clearances"
  on public.clearances for select
  using (auth.uid() = user_id);

-- RLS: stock_requests
alter table public.stock_requests enable row level security;

create policy "Admin supplier stocks"
  on public.stock_requests for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'SUPPLIER'))
  );

-- RLS: supplier_invoices
alter table public.supplier_invoices enable row level security;

create policy "Supplier invoices"
  on public.supplier_invoices for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'SUPPLIER')
  );

-- Storage policy for documents bucket
create policy "Authenticated read documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Accounting upload deployment letters"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ACCOUNTING')
  );

create policy "Accounting update deployment letters"
  on storage.objects for update
  using (
    bucket_id = 'documents' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ACCOUNTING')
  );
