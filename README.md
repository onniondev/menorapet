# Petvia IA (menorapet)

Frontend em **React + TypeScript + Vite**, com **Supabase** (Auth + Postgres + RLS).

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

- `VITE_SUPABASE_URL` — URL do projeto (`https://<ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — chave pública (anon ou publishable do dashboard)

### Produção (ex.: Vercel)

O Vite **injeta** `VITE_*` no JavaScript **durante o `npm run build`**. O `.env.local` **não** sobe para a Vercel.

1. **Vercel** → projeto → **Settings** → **Environment Variables**
2. Cria `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (mesmos valores do Supabase → **Settings → API**)
3. Ambiente: **Production** (e **Preview** se usares PR previews)
4. **Deployments** → **Redeploy** no último deploy (ou novo commit), senão o bundle antigo continua sem as variáveis.

## Banco de dados (migração)

O schema inicial está em `supabase/migrations/20260214120000_petvia_foundation.sql` (tabelas `profiles`, `clinics`, `clinic_members`, `invitations`, `audit_logs`, triggers, RLS e RPC `create_clinic_onboarding`).

**Opção A — SQL Editor (recomendado se o PC não tiver IPv6 para o host `db.*`)**

1. Supabase Dashboard → **SQL** → **New query**
2. Cole o conteúdo completo do arquivo de migração acima → **Run**

**Opção B — linha de comando (Postgres acessível na rede)**

Use a connection string **Session pooler** (IPv4) ou **direct** (IPv6), copiadas em **Project Settings → Database → Connect**.

PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://..."  # senha com caracteres especiais: use URL encoding
npm run db:migrate
```

Depois de aplicar o SQL:

```bash
npm run db:check
```

Deve listar `profiles`, `clinics`, etc. com ✓.

## Scripts

| Comando        | Descrição                          |
| -------------- | ---------------------------------- |
| `npm run dev`  | Servidor de desenvolvimento        |
| `npm run build`| Build de produção                  |
| `npm run lint` | ESLint                             |
| `npm run db:migrate` | Aplica a migração SQL (`DATABASE_URL`) |
| `npm run db:check`   | Confere tabelas via API REST   |

## Fluxo no app

1. Cadastro / login (`/register`, `/login`)
2. Sem clínica ativa → `/onboarding`
3. Com clínica → `/app/dashboard`

---

Template original: [Vite + React + TS](https://vite.dev/).
