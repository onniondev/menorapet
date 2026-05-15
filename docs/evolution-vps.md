# Evolution API na VPS (QR Code, número da clínica)

O PetVia na **Vercel** não roda WhatsApp Web. Para **QR Code** com o número de cada clínica, hospede a **Evolution API** em um servidor sempre ligado.

**Uma única VPS** atende **várias clínicas**: cada clínica gera seu QR no PetVia (`petvia_{clinicId}`).

## Opções de custo

| Opção | Custo | Observação |
|-------|--------|------------|
| **Oracle Cloud Always Free** | US$ 0 | VM ARM; pode exigir cartão; às vezes fila de região |
| **Hetzner CX22** | ~€4/mês | Simples e estável |
| **Render Starter** | ~US$ 7/mês | Menos controle; ver `deploy/evolution/render.yaml` |

## Passo a passo (VPS Linux)

### 1. Instalar Docker na VPS

```bash
curl -fsSL https://get.docker.com | sh
```

### 2. Clonar o projeto e subir Evolution

```bash
git clone https://github.com/SEU_USUARIO/menorapet.git
cd menorapet
npm run evolution:setup
npm run evolution:up
```

Abra a porta **8080** no firewall (ou use Nginx com HTTPS na frente).

### 3. URL pública

Exemplo: `https://evolution.seudominio.com` apontando para a porta 8080 (Caddy/Nginx + Let's Encrypt).

No `.env.evolution` da VPS, ajuste:

```env
SERVER_URL=https://evolution.seudominio.com
```

Reinicie: `docker compose -f docker-compose.evolution.yml restart evolution-api`

### 4. Variáveis na Vercel (PetVia)

| Variável | Valor |
|----------|--------|
| `WHATSAPP_PROVIDER` | `evolution` (padrão) |
| `EVOLUTION_API_URL` | `https://evolution.seudominio.com` |
| `EVOLUTION_API_KEY` | igual a `AUTHENTICATION_API_KEY` do `.env.evolution` |
| `EVOLUTION_WEBHOOK_SECRET` | segredo gerado no `evolution:setup` |
| `APP_URL` | `https://menorapet.vercel.app` |

**Redeploy** na Vercel.

### 5. No PetVia

`/app/whatsapp` → **Gerar QR Code** → escanear no celular da clínica.

## Webhook

A Evolution chama: `{APP_URL}/api/webhooks/evolution`

O `npm run evolution:setup` na VPS usa o mesmo `EVOLUTION_WEBHOOK_SECRET` que você cola na Vercel.

## Desenvolvimento local

```bash
npm run evolution:up
npm run dev:api
npm run dev
```

`EVOLUTION_API_URL=http://localhost:8080` no `.env.local`.
