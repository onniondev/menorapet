# Evolution API — WhatsApp (QR Code)

Integração PetVia com [Evolution API](https://doc.evolution-api.com/) para cada clínica conectar seu WhatsApp Business via QR Code.

## Variáveis de ambiente (servidor / Vercel)

```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave-global
EVOLUTION_WEBHOOK_SECRET=segredo-compartilhado
APP_URL=https://seu-dominio.vercel.app
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
```

No frontend (opcional, deploy na mesma origem):

```env
VITE_API_BASE_URL=
```

## Produção 100% nuvem (sem PC)

**Guia completo:** [evolution-nuvem.md](./evolution-nuvem.md) — Render Blueprint + variáveis na Vercel.

Resumo: PetVia na Vercel + Evolution na Render/Railway + Supabase.

## Produção (Vercel) — URL pública obrigatória

A Vercel **não** alcança `http://localhost:8080`. Você precisa hospedar a Evolution com HTTPS/HTTP público.

### Variáveis na Vercel

| Variável | Exemplo |
|----------|---------|
| `EVOLUTION_API_URL` | `https://evolution.seudominio.com` |
| `EVOLUTION_API_KEY` | mesma chave configurada na Evolution |
| `EVOLUTION_WEBHOOK_SECRET` | segredo para validar webhooks |
| `APP_URL` | `https://menorapet.vercel.app` |

Depois de salvar: **Redeploy**.

### Opções de hospedagem

1. **VPS** (DigitalOcean, Hetzner, etc.): `docker compose -f docker-compose.evolution.yml up -d` + Nginx/Caddy com domínio e TLS.
2. **Railway / Render**: deploy da imagem `atendai/evolution-api:v2.2.3`, defina `AUTHENTICATION_API_KEY` e `SERVER_URL=https://seu-app.up.railway.app`.
3. **Teste rápido**: túnel (Cloudflare Tunnel / ngrok) apontando para `localhost:8080` — use a URL do túnel em `EVOLUTION_API_URL` (não use em produção final).

Na Evolution, `SERVER_URL` deve ser a **mesma URL pública** usada em `EVOLUTION_API_URL`.

Webhook que a Evolution chama: `{APP_URL}/api/webhooks/evolution`

## Instalação local (recomendado para começar)

Requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) em execução.

```bash
npm run evolution:setup   # gera .env.evolution + atualiza .env.local
npm run evolution:up      # Postgres + Redis + Evolution na porta 8080
npm run evolution:logs    # acompanhar logs
npm run evolution:down    # parar
```

Teste: abra http://localhost:8080 — deve responder da Evolution API.

### App PetVia + Evolution no PC

```bash
npm run evolution:up
npm run dev:api    # terminal 1 — APIs em localhost:3000 (vercel dev)
npm run dev        # terminal 2 — frontend Vite
```

O `evolution:setup` grava em `.env.local`:

- `EVOLUTION_API_URL=http://localhost:8080`
- `EVOLUTION_API_KEY` / `EVOLUTION_WEBHOOK_SECRET`
- `APP_URL=http://localhost:5173`

### Produção na Render (URL pública)

Use `deploy/evolution/render.yaml` (Blueprint na Render). Após o deploy:

1. Defina `SERVER_URL` no painel Render = URL pública do serviço (ex. `https://petvia-evolution-api.onrender.com`).
2. Copie `AUTHENTICATION_API_KEY` gerada → `EVOLUTION_API_KEY` na Vercel.
3. `EVOLUTION_API_URL` = mesma URL pública.
4. `APP_URL` = `https://menorapet.vercel.app`
5. Redeploy Vercel + Reconectar WhatsApp.

## Fluxo

1. Staff acessa **Configurações → Configurar WhatsApp**.
2. `POST /api/whatsapp/connect` cria instância `petvia_{clinicId}` na Evolution e retorna QR.
3. Evolution envia webhooks para `POST /api/webhooks/evolution` (`QRCODE_UPDATED`, `CONNECTION_UPDATE`, `MESSAGES_UPSERT`).
4. Mensagens inbound passam por `processInboundCore` (FAQ + OpenAI + filas).
5. Atendentes respondem em **Conversas** via `POST /api/conversations/:id/messages` (provider Evolution).

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/whatsapp/connect` | Criar/conectar instância |
| GET | `/api/whatsapp/status` | Status + QR |
| GET | `/api/whatsapp/qrcode` | Atualizar QR |
| POST | `/api/whatsapp/logout` | Desconectar |
| DELETE | `/api/whatsapp/instance` | Remover instância |
| POST | `/api/webhooks/evolution` | Webhook Evolution |

Headers autenticados: `Authorization: Bearer`, `x-clinic-id`.

## Migração Supabase

Aplique `supabase/migrations/20260320120000_whatsapp_evolution.sql`.

Habilite **Realtime** no dashboard para `whatsapp_instances`, `whatsapp_conversations` e `messages` se quiser atualização ao vivo no inbox.

## Coexistência com Meta Cloud

A tabela `whatsapp_instances.provider` distingue `evolution` e `meta_cloud`. O webhook Meta continua em `/api/webhooks/whatsapp`.
