-- Confirma e-mail no Auth e promove a admin PetVia (rode no SQL Editor do Supabase como postgres).
-- Usuário: adminmkt@site.com

UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, TIMEZONE('utc'::TEXT, NOW())),
  updated_at = TIMEZONE('utc'::TEXT, NOW())
WHERE LOWER(TRIM(email)) = LOWER(TRIM('adminmkt@site.com'));

INSERT INTO public.petvia_admins (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE LOWER(TRIM(email)) = LOWER(TRIM('adminmkt@site.com'))
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
