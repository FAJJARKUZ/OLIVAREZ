-- Fix storage RLS upload failures like:
-- "new row violates row-level security policy"
--
-- Root cause in existing databases:
-- policies depended only on public.profiles role checks.
-- If profile row is missing/out-of-sync, upload gets blocked.
--
-- This migration allows role fallback from auth metadata JWT.

DROP POLICY IF EXISTS "Accounting upload deployment letters" ON storage.objects;
DROP POLICY IF EXISTS "Accounting update deployment letters" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload clearance docs" ON storage.objects;
DROP POLICY IF EXISTS "Admin update clearance docs" ON storage.objects;

CREATE POLICY "Accounting upload deployment letters"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (
      EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'ACCOUNTING'
      )
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'ACCOUNTING'
    )
  );

CREATE POLICY "Accounting update deployment letters"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND (
      EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'ACCOUNTING'
      )
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'ACCOUNTING'
    )
  );

CREATE POLICY "Admin upload clearance docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (
      EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
      )
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    )
  );

CREATE POLICY "Admin update clearance docs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND (
      EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
      )
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    )
  );
