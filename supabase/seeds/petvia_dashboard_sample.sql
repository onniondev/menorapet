-- PetVia — dados de exemplo para dashboard (desenvolvimento)
--
-- Executar no SQL Editor do Supabase (role postgres) ou via:
--   $env:DATABASE_URL = "postgresql://postgres:...@db....supabase.co:5432/postgres"
--   npm run db:seed-sample
--
-- Requisitos:
--   1) Migrações foundation + dashboard_domain já aplicadas.
--   2) Pelo menos um usuário em auth.users (conta criada no Auth).
--
-- O script associa a clínica demo ao usuário mais antigo (ORDER BY created_at).
-- Para não duplicar, pula se já existir clínica com slug prefixo petvia-seed-demo-.

DO $seed$
DECLARE
  uid uuid;
  cid uuid;
  slug text;
  c1 uuid;
  c2 uuid;
  c3 uuid;
  p1 uuid;
  p2 uuid;
  p3 uuid;
  a0 timestamptz;
  day_start timestamptz;
BEGIN
  SELECT id INTO uid FROM auth.users ORDER BY created_at ASC LIMIT 1;
  IF uid IS NULL THEN
    RAISE EXCEPTION 'petvia_seed: nenhum usuário em auth.users (crie uma conta antes).';
  END IF;

  IF EXISTS (SELECT 1 FROM public.clinics WHERE slug LIKE 'petvia-seed-demo-%' LIMIT 1) THEN
    RAISE NOTICE 'petvia_seed: clínica demo já existe (slug petvia-seed-demo-%%). Nada a fazer.';
    RETURN;
  END IF;

  cid := gen_random_uuid();
  slug := 'petvia-seed-demo-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);

  INSERT INTO public.clinics (id, name, slug, plan, country, timezone)
  VALUES (cid, 'Clínica Demo PetVia (seed)', slug, 'Premium', 'Brasil', 'America/Sao_Paulo');

  INSERT INTO public.clinic_members (clinic_id, user_id, role, status)
  VALUES (cid, uid, 'owner', 'active')
  ON CONFLICT (clinic_id, user_id) DO NOTHING;

  c1 := gen_random_uuid();
  c2 := gen_random_uuid();
  c3 := gen_random_uuid();

  INSERT INTO public.clients (id, clinic_id, name, phone, email) VALUES
    (c1, cid, 'Carlos Eduardo', '11999990001', 'carlos@example.com'),
    (c2, cid, 'Marina Lopes', '11999990002', 'marina@example.com'),
    (c3, cid, 'João Pereira', '11999990003', 'joao@example.com');

  p1 := gen_random_uuid();
  p2 := gen_random_uuid();
  p3 := gen_random_uuid();

  INSERT INTO public.pets (id, clinic_id, client_id, name, species, breed) VALUES
    (p1, cid, c1, 'Thor', 'Cão', 'Golden Retriever'),
    (p2, cid, c2, 'Luna', 'Cão', 'SRD'),
    (p3, cid, c3, 'Simba', 'Gato', 'Persa');

  day_start := date_trunc('day', now());

  INSERT INTO public.appointments (clinic_id, pet_id, client_id, veterinarian_id, service_type, scheduled_at, status) VALUES
    (cid, p1, c1, uid, 'consulta', day_start + interval '9 hours', 'confirmed'),
    (cid, p2, c2, uid, 'vacina', day_start + interval '10 hours 30 minutes', 'confirmed'),
    (cid, p3, c3, uid, 'exame', day_start + interval '11 hours 15 minutes', 'pending'),
    (cid, p1, c1, uid, 'retorno', day_start + interval '3 days' + interval '15 hours', 'confirmed'),
    (cid, p2, c2, uid, 'consulta', day_start + interval '5 days' + interval '11 hours', 'confirmed');

  INSERT INTO public.messages (clinic_id, client_id, pet_id, channel, direction, content, status, is_read) VALUES
    (cid, c2, p2, 'whatsapp', 'inbound', 'Oi! A Luna pode tomar a vacina amanhã?', 'delivered', false),
    (cid, c1, p1, 'whatsapp', 'inbound', 'O Thor ainda está comendo pouco depois da cirurgia…', 'delivered', false),
    (cid, c3, p3, 'whatsapp', 'inbound', 'Obrigado pelo lembrete!', 'delivered', true);

  INSERT INTO public.payments (clinic_id, client_id, amount, status, payment_method, paid_at) VALUES
    (cid, c1, 280.00, 'paid', 'pix', now() - interval '2 days'),
    (cid, c2, 190.50, 'paid', 'card', now() - interval '5 days'),
    (cid, c3, 120.00, 'pending', null, null);

  INSERT INTO public.reminders (clinic_id, pet_id, client_id, type, title, due_at, status) VALUES
    (cid, p1, c1, 'vacina', 'Vacina: Thor', day_start + interval '10 hours', 'pending'),
    (cid, p2, c2, 'retorno', 'Retorno: Luna', day_start + interval '14 hours 30 minutes', 'pending');

  INSERT INTO public.ai_insights (clinic_id, title, description, type, priority, status) VALUES
    (cid, '3 clientes não responderam', 'Mensagens aguardando há mais de 24h.', 'warning', 'high', 'open'),
    (cid, '2 vacinas vencem hoje', 'Confirme presença com lembrete automático.', 'info', 'normal', 'open');

  a0 := day_start - interval '6 days';
  INSERT INTO public.appointments (clinic_id, pet_id, client_id, veterinarian_id, service_type, scheduled_at, status)
  SELECT
    cid,
    p1,
    c1,
    uid,
    t.st,
    a0 + make_interval(days => t.d, hours => t.h),
    'completed'
  FROM (
    VALUES
      (0, 9, 'consulta'),
      (1, 10, 'vacina'),
      (2, 11, 'exame'),
      (3, 9, 'consulta'),
      (4, 15, 'vacina'),
      (5, 10, 'consulta'),
      (6, 14, 'exame')
  ) AS t(d int, h int, st text);

  RAISE NOTICE 'petvia_seed: clínica demo criada (id=%). Faça login com o usuário mais antigo e selecione a clínica no app.', cid;
END
$seed$;
