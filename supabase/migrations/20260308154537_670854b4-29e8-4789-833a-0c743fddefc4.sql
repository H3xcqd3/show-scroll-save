
-- Allow reading library items for public profile viewing
CREATE POLICY "Library items are publicly viewable" ON public.library FOR SELECT USING (true);

-- Drop old restrictive select policy
DROP POLICY IF EXISTS "Users can view their own library" ON public.library;
