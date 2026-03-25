-- Fix Administrator clearance document uploads hitting:
-- "new row violates row-level security policy"
--
-- Run this migration on existing Supabase databases.

-- Ensure clearances policies are explicit for insert/update/delete checks
ALTER TABLE public.clearances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own clearances" ON public.clearances;
DROP POLICY IF EXISTS "Admin accounting read update clearances" ON public.clearances;
DROP POLICY IF EXISTS "Users read own clearances" ON public.clearances;
DROP POLICY IF EXISTS "Admin accounting delete clearances" ON public.clearances;

CREATE POLICY "Users can insert own clearances"
  ON public.clearances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin accounting read clearances"
  ON public.clearances FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'ACCOUNTING')
    )
  );

CREATE POLICY "Admin accounting update clearances"
  ON public.clearances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'ACCOUNTING')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'ACCOUNTING')
    )
  );

CREATE POLICY "Admin accounting delete clearances"
  ON public.clearances FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'ACCOUNTING')
    )
  );

CREATE POLICY "Users read own clearances"
  ON public.clearances FOR SELECT
  USING (auth.uid() = user_id);

-- Storage policies for documents bucket
-- (including Admin uploads for clearance docs)
DROP POLICY IF EXISTS "Authenticated read documents" ON storage.objects;
DROP POLICY IF EXISTS "Accounting upload deployment letters" ON storage.objects;
DROP POLICY IF EXISTS "Accounting update deployment letters" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload clearance docs" ON storage.objects;
DROP POLICY IF EXISTS "Admin update clearance docs" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete clearance docs" ON storage.objects;

CREATE POLICY "Authenticated read documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Accounting upload deployment letters"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'ACCOUNTING'
    )
  );

CREATE POLICY "Accounting update deployment letters"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'ACCOUNTING'
    )
  );

CREATE POLICY "Admin upload clearance docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admin update clearance docs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admin delete clearance docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
