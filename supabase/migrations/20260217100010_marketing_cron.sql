-- Cron: publicador de posts agendados (Marketing IA)
-- Requer extensões `pg_cron` e `pg_net` (habilitadas no Supabase hospedado).
--
-- IMPORTANTE: substitua os placeholders antes de executar:
--   <PROJECT_REF>  — ref do projeto (URL supabase.co)
--   <SERVICE_ROLE> — chave service_role (Dashboard → Settings → API) — NUNCA commitar em repositório público
--
-- Alternativa recomendada: Dashboard → Integrations → Cron (ou Database → Extensions)
-- agendando POST para:
--   https://<PROJECT_REF>.supabase.co/functions/v1/scheduled-post-publisher
-- Header: Authorization: Bearer <SERVICE_ROLE>
--         (ou use CRON_SECRET no body + verify na function; ver função Deno)

-- Exemplo (descomente após preencher):
/*
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select
  cron.schedule(
    'marketing_ia_scheduled_publisher',
    '*/10 * * * *',
    $$
    select
      net.http_post(
        url := 'https://<PROJECT_REF>.supabase.co/functions/v1/scheduled-post-publisher',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer <SERVICE_ROLE>'
        ),
        body := '{}'::jsonb
      ) as request_id;
    $$
  );
*/
