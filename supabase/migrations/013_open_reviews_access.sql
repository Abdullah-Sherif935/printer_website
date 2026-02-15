-- Allow ANYONE (authenticated or not) to READ reviews
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."reviews";
CREATE POLICY "Enable read access for all users" ON "public"."reviews"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Ensure users can only CREATE reviews for themselves
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."reviews";
CREATE POLICY "Enable insert for authenticated users only" ON "public"."reviews"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() = user_id));

-- Ensure users can only UPDATE/DELETE their own reviews
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "public"."reviews";
CREATE POLICY "Enable update for users based on user_id" ON "public"."reviews"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON "public"."reviews";
CREATE POLICY "Enable delete for users based on user_id" ON "public"."reviews"
AS PERMISSIVE FOR DELETE
TO authenticated
USING ((auth.uid() = user_id));
