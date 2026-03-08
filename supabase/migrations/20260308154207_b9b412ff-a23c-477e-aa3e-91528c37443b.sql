
CREATE TABLE public.custom_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.custom_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.custom_lists(id) ON DELETE CASCADE,
  tmdb_id integer NOT NULL,
  media_type text NOT NULL,
  title text NOT NULL,
  poster_path text,
  vote_average numeric DEFAULT 0,
  year text,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(list_id, tmdb_id, media_type)
);

ALTER TABLE public.custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_list_items ENABLE ROW LEVEL SECURITY;

-- Lists: owners full access, public lists readable by anyone
CREATE POLICY "Users can manage their own lists" ON public.custom_lists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public lists are viewable" ON public.custom_lists FOR SELECT USING (is_public = true);

-- List items: owners full access, items in public lists readable
CREATE POLICY "Users can manage items in their lists" ON public.custom_list_items FOR ALL USING (list_id IN (SELECT id FROM public.custom_lists WHERE user_id = auth.uid())) WITH CHECK (list_id IN (SELECT id FROM public.custom_lists WHERE user_id = auth.uid()));
CREATE POLICY "Public list items are viewable" ON public.custom_list_items FOR SELECT USING (list_id IN (SELECT id FROM public.custom_lists WHERE is_public = true));

-- Make profiles publicly viewable for public profile pages
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

-- Drop the restrictive select policy on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE INDEX idx_custom_lists_user ON public.custom_lists(user_id);
CREATE INDEX idx_custom_list_items_list ON public.custom_list_items(list_id);
