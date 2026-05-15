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

## Docker local

```bash
docker compose -f docker-compose.evolution.yml up -d
```

Copie `.env.evolution.example` para `.env.evolution` e ajuste as chaves.

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
