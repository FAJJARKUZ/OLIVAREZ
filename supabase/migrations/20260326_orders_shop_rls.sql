-- Orders / Shop RLS policies
-- - Admin creates stock_requests (equipment requests)
-- - Supplier reads stock_requests and updates availability
-- - Reports/Finances access handled at app route level

-- stock_requests
alter table public.stock_requests enable row level security;

drop policy if exists "Admin supplier stocks" on public.stock_requests;
drop policy if exists "stock_requests_select_admin_supplier" on public.stock_requests;
drop policy if exists "stock_requests_insert_admin" on public.stock_requests;
drop policy if exists "stock_requests_update_admin_supplier" on public.stock_requests;
drop policy if exists "stock_requests_delete_admin" on public.stock_requests;

create policy "stock_requests_select_admin_supplier"
  on public.stock_requests for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('ADMIN', 'SUPPLIER')
    )
    or (auth.jwt() -> 'user_metadata' ->> 'role') in ('ADMIN', 'SUPPLIER')
  );

create policy "stock_requests_insert_admin"
  on public.stock_requests for insert
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'ADMIN'
    )
  );

create policy "stock_requests_update_admin_supplier"
  on public.stock_requests for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('ADMIN', 'SUPPLIER')
    )
    or (auth.jwt() -> 'user_metadata' ->> 'role') in ('ADMIN', 'SUPPLIER')
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('ADMIN', 'SUPPLIER')
    )
    or (auth.jwt() -> 'user_metadata' ->> 'role') in ('ADMIN', 'SUPPLIER')
  );

create policy "stock_requests_delete_admin"
  on public.stock_requests for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'ADMIN'
    )
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
  );

-- supplier_invoices
alter table public.supplier_invoices enable row level security;

drop policy if exists "Supplier invoices" on public.supplier_invoices;
drop policy if exists "supplier_invoices_select" on public.supplier_invoices;
drop policy if exists "supplier_invoices_insert_supplier" on public.supplier_invoices;
drop policy if exists "supplier_invoices_update_supplier" on public.supplier_invoices;
drop policy if exists "supplier_invoices_delete_supplier" on public.supplier_invoices;

create policy "supplier_invoices_select"
  on public.supplier_invoices for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('SUPPLIER', 'ADMIN', 'ACCOUNTING')
    )
    or (auth.jwt() -> 'user_metadata' ->> 'role') in ('SUPPLIER', 'ADMIN', 'ACCOUNTING')
  );

create policy "supplier_invoices_insert_supplier"
  on public.supplier_invoices for insert
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'SUPPLIER'
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'SUPPLIER'
    )
  );

create policy "supplier_invoices_update_supplier"
  on public.supplier_invoices for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'SUPPLIER'
    )
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'SUPPLIER'
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'SUPPLIER'
    )
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'SUPPLIER'
  );

create policy "supplier_invoices_delete_supplier"
  on public.supplier_invoices for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'SUPPLIER'
    )
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'SUPPLIER'
  );

