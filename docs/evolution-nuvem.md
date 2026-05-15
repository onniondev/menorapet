# WhatsApp Evolution — 100% na nuvem (sem PC)

Seu PetVia já está na **Vercel**. O WhatsApp (Evolution API) precisa de um **segundo serviço online** — a Vercel não roda a Evolution dentro dela mesma.

```
Navegador → menorapet.vercel.app (app + APIs PetVia)
                 ↓ chama
            https://sua-evolution.onrender.com (Evolution API)
                 ↓ webhooks
            menorapet.vercel.app/api/webhooks/evolution
                 ↓ grava
            Supabase (DATABASE_URL pooler)
```

**Não precisa de Docker no PC** para produção.

---

## Opção recomendada: Render (~15 min)

Plano **Starter** (~US$ 7/mês) mantém o serviço ligado 24h — importante para o WhatsApp não cair. O plano Free “dorme” após inatividade e desconecta o QR.

### 1. Criar a Evolution na Render

1. Conta em [render.com](https://render.com).
2. **New +** → **Blueprint**.
3. Conecte o repositório **menorapet** (GitHub).
4. Em **Blueprint path**, informe: `deploy/evolution/render.yaml`
5. **Apply** e aguarde o deploy (Postgres + API).

### 2. Ajustar URL da Evolution

No painel Render → serviço **petvia-evolution-api** → **Environment**:

| Variável | Valor |
|----------|--------|
| `SERVER_URL` | URL pública do serviço, ex. `https://petvia-evolution-api.onrender.com` (copie em **Settings → URL**) |

Salve (novo deploy automático).

### 3. Copiar a chave da API

No mesmo painel → **Environment** → variável **`AUTHENTICATION_API_KEY`** (gerada pela Render).

Copie o valor — será o `EVOLUTION_API_KEY` na Vercel.

### 4. Configurar a Vercel

[vercel.com](https://vercel.com) → projeto **menorapet** → **Settings** → **Environment Variables** (Production):

| Variável | Valor |
|----------|--------|
| `EVOLUTION_API_URL` | Mesma URL do passo 2 (`https://petvia-evolution-api.onrender.com`) |
| `EVOLUTION_API_KEY` | Valor de `AUTHENTICATION_API_KEY` da Render |
| `EVOLUTION_WEBHOOK_SECRET` | Gere um segredo forte (ex. `openssl rand -base64 32`) |
| `APP_URL` | `https://menorapet.vercel.app` |
| `DATABASE_URL` | Pooler Supabase (Session mode) — já configurado |

**Redeploy** na Vercel.

### 5. Testar

1. Abra `https://sua-evolution.onrender.com` — deve responder (JSON ou página da API).
2. No PetVia: **/app/whatsapp** → **Conectar / Reconectar** → escaneie o QR no celular.

---

## Opção B: Railway

1. [railway.app](https://railway.app) → **New project**.
2. **Deploy Docker image** → `atendai/evolution-api:v2.2.3`
3. **Add PostgreSQL** no projeto.
4. Variáveis no serviço Evolution (use a URL interna do Postgres na `DATABASE_CONNECTION_URI`):

```env
AUTHENTICATION_API_KEY=<gere uma chave forte>
SERVER_TYPE=http
SERVER_PORT=8080
SERVER_URL=https://<seu-servico>.up.railway.app
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=<cole a URL do Postgres Railway>
DATABASE_CONNECTION_CLIENT_NAME=petvia_evolution
CACHE_REDIS_ENABLED=false
CACHE_LOCAL_ENABLED=true
CORS_ORIGIN=*
CONFIG_SESSION_PHONE_CLIENT=Chrome
```

5. Gere domínio público em **Settings → Networking → Generate domain**.
6. Atualize `SERVER_URL` com esse domínio.
7. Repita o passo 4 da Vercel acima.

---

## Checklist rápido

- [ ] Evolution responde na URL pública (navegador ou `curl`)
- [ ] `EVOLUTION_API_URL` na Vercel **não** é `localhost`
- [ ] `EVOLUTION_API_KEY` = `AUTHENTICATION_API_KEY` da Evolution
- [ ] `APP_URL` = URL real do PetVia em produção
- [ ] Migrações WhatsApp no Supabase (`npm run db:migrate-whatsapp-all`)
- [ ] Redeploy Vercel após mudar variáveis

---

## Custos aproximados

| Serviço | Uso |
|---------|-----|
| Vercel | App PetVia (já tem) |
| Supabase | Banco PetVia (já tem) |
| Render Starter ou Railway Hobby | Evolution 24/7 (~US$ 5–7/mês) |

---

## Só para desenvolvimento no PC

Use `npm run evolution:setup` e `npm run evolution:up` — opcional, não é necessário para o site online.
