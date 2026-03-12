-- Create the trigger that was missing
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Insert admin role for existing user
INSERT INTO public.user_roles (user_id, role)
VALUES ('f8566f08-6b5c-47c5-b915-8c7d94843f4f', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;