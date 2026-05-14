-- PetVia admin interno (Marketing IA)
-- Pré-requisito: o usuário já deve existir em auth.users (cadastro em /register ou
-- Supabase Dashboard → Authentication → Users → Add user).
--
-- E-mail alvo: adminmkt@site.com
-- Não coloque senha neste arquivo; a senha fica só no Auth.

insert into public.petvia_admins (user_id, role)
select id, 'admin'
from auth.users
where lower(trim(email)) = lower(trim('adminmkt@site.com'))
on conflict (user_id) do update set role = excluded.role;

-- Conferência:
-- select a.user_id, a.role, u.email from public.petvia_admins a join auth.users u on u.id = a.user_id;
