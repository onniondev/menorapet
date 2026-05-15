# WhatsApp Business Cloud API (Meta) — PetVia

Integração oficial via **WhatsApp Business Cloud API** (sem WhatsApp Web / QR Code).

## Arquitetura

| Camada | Caminho |
|--------|---------|
| Webhook Meta | `GET/POST /api/webhooks/whatsapp` (Vercel Serverless) |
| API interna | `/api/conversations/*` |
| Lógica | `server/whatsapp/*`, `server/ai/*` |
| Banco | `supabase/migrations/20260315120000_whatsapp_meta.sql` |

O webhook usa **`DATABASE_URL`** (Postgres direto, role `postgres`) para gravar mensagens e contornar RLS. Tokens da Meta **nunca** vão para o frontend.

## Variáveis de ambiente (Vercel / servidor)

```env
META_WHATSAPP_TOKEN=          # Token permanente do app Meta
META_PHONE_NUMBER_ID=         # ID do número WhatsApp Business
META_VERIFY_TOKEN=           # Token escolhido por você (verificação GET do webhook)
META_APP_SECRET=              # App Secret (validação X-Hub-Signature-256)
OPENAI_API_KEY=              # Respostas IA (nível médio)
DATABASE_URL=                # Connection string Postgres (Supabase)
DEFAULT_CLINIC_ID=           # Opcional: clínica padrão se phone_number_id não estiver em clinics
VITE_SUPABASE_URL=           # Para auth das APIs internas
VITE_SUPABASE_ANON_KEY=
```

No frontend (mesmo deploy):

```env
VITE_API_BASE_URL=           # Vazio = mesma origem (ex.: https://seu-app.vercel.app)
```

## Migração SQL

1. Supabase → **SQL** → executar `supabase/migrations/20260315120000_whatsapp_meta.sql`
2. Vincular o número Meta à clínica:

```sql
update public.clinics
set whatsapp_phone_number_id = 'SEU_PHONE_NUMBER_ID_DA_META'
where id = 'UUID_DA_CLINICA';
```

## Configurar webhook na Meta

1. [Meta for Developers](https://developers.facebook.com/) → seu app → **WhatsApp** → **Configuration**
2. **Callback URL**: `https://SEU_DOMINIO.vercel.app/api/webhooks/whatsapp`
3. **Verify token**: mesmo valor de `META_VERIFY_TOKEN`
4. Assinar o campo **messages**
5. Salvar — a Meta envia `GET` com `hub.challenge`; a rota responde automaticamente.

## Fluxo inbound

1. Cliente envia mensagem → Meta → `POST /api/webhooks/whatsapp`
2. Valida assinatura (se `META_APP_SECRET` definido)
3. Cria/atualiza **client** (`wa_id`)
4. Abre **whatsapp_conversations** ou reutiliza aberta
5. Salva **messages** (`external_message_id` evita duplicata)
6. **classifyIntent** → FAQ / IA / urgência / humano
7. Envia resposta via Graph API e grava outbound

## Fluxo outbound (atendente)

`POST /api/conversations/:id/messages` com headers:

- `Authorization: Bearer <access_token Supabase>`
- `x-clinic-id: <uuid da clínica>`
- Body: `{ "text": "sua mensagem" }`

## Testar recebimento

1. Deploy na Vercel com todas as envs
2. Envie mensagem do seu celular para o número Business
3. Verifique tabelas `messages`, `whatsapp_conversations`, `whatsapp_webhook_logs`

## Testar envio

Use a API interna ou aguarde resposta automática da IA/FAQ após inbound.

## Erros comuns

| Problema | Solução |
|----------|---------|
| Webhook 403 no GET | `META_VERIFY_TOKEN` diferente do configurado na Meta |
| Mensagem não chega | Campo **messages** assinado; URL pública HTTPS |
| 401 no POST | `META_APP_SECRET` / assinatura; ou teste sem secret em dev |
| Resposta não enviada | `META_WHATSAPP_TOKEN`, `META_PHONE_NUMBER_ID`, janela 24h |
| Clínica errada | `clinics.whatsapp_phone_number_id` ou `DEFAULT_CLINIC_ID` |
| Duplicata ignorada | Normal: mesmo `external_message_id` |

## Desenvolvimento local

```bash
npm install
npx vercel dev
```

Configure `.env.local` com as variáveis acima (não commitar tokens).

Webhook local: use [ngrok](https://ngrok.com/) apontando para `http://localhost:3000/api/webhooks/whatsapp`.
