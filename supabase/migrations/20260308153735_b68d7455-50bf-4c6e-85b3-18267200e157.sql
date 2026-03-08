
ALTER TABLE public.library
  ADD COLUMN user_rating smallint CHECK (user_rating >= 1 AND user_rating <= 10),
  ADD COLUMN review text,
  ADD COLUMN runtime integer,
  ADD COLUMN genres text[];
