/**
 * Gera .env.evolution com chaves e sincroniza trecho no .env.local para dev.
 * Uso: node scripts/setup-evolution.mjs
 */
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve('.')
const evolutionEnvPath = resolve(root, '.env.evolution')
const examplePath = resolve(root, '.env.evolution.example')
const localEnvPath = resolve(root, '.env.local')

function generateKey(bytes = 32) {
  return randomBytes(bytes).toString('base64url')
}

function loadExample() {
  if (!existsSync(examplePath)) {
    console.error('Arquivo não encontrado:', examplePath)
    process.exit(1)
  }
  return readFileSync(examplePath, 'utf8')
}

function upsertEnvFile(path, replacements) {
  let content = existsSync(path) ? readFileSync(path, 'utf8') : loadExample()
  for (const [key, value] of Object.entries(replacements)) {
    const re = new RegExp(`^${key}=.*$`, 'm')
    const line = `${key}=${value}`
    content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`
  }
  writeFileSync(path, content.endsWith('\n') ? content : `${content}\n`, 'utf8')
}

function mergeLocalEnv(keys) {
  const block = [
    '',
    '# --- Evolution API (gerado por npm run evolution:setup) ---',
    `EVOLUTION_API_URL=${keys.EVOLUTION_API_URL}`,
    `EVOLUTION_API_KEY=${keys.EVOLUTION_API_KEY}`,
    `EVOLUTION_WEBHOOK_SECRET=${keys.EVOLUTION_WEBHOOK_SECRET}`,
    `APP_URL=${keys.APP_URL}`,
    '',
  ].join('\n')

  if (!existsSync(localEnvPath)) {
    writeFileSync(localEnvPath, `# PetVia local\n${block}`, 'utf8')
    return
  }

  let content = readFileSync(localEnvPath, 'utf8')
  if (/EVOLUTION_API_URL=/m.test(content)) {
    for (const [key, value] of Object.entries(keys)) {
      const re = new RegExp(`^${key}=.*$`, 'm')
      const line = `${key}=${value}`
      content = re.test(content) ? content.replace(re, line) : content
    }
  } else {
    content = `${content.trimEnd()}\n${block}`
  }
  writeFileSync(localEnvPath, content.endsWith('\n') ? content : `${content}\n`, 'utf8')
}

const apiKey = generateKey()
const webhookSecret = generateKey(24)

const evolutionReplacements = {
  EVOLUTION_API_KEY: apiKey,
  EVOLUTION_WEBHOOK_SECRET: webhookSecret,
  AUTHENTICATION_API_KEY: apiKey,
  SERVER_URL: 'http://localhost:8080',
}

upsertEnvFile(evolutionEnvPath, evolutionReplacements)

mergeLocalEnv({
  EVOLUTION_API_URL: 'http://localhost:8080',
  EVOLUTION_API_KEY: apiKey,
  EVOLUTION_WEBHOOK_SECRET: webhookSecret,
  APP_URL: 'http://localhost:5173',
})

console.log('')
console.log('Evolution API — arquivos configurados')
console.log('  .env.evolution     (Docker)')
console.log('  .env.local         (dev: vite + vercel dev)')
console.log('')
console.log('Próximo passo: npm run evolution:up')
console.log('')
console.log('Produção (Vercel): copie estas variáveis (com URL pública da Evolution):')
console.log(`  EVOLUTION_API_KEY=${apiKey}`)
console.log(`  EVOLUTION_WEBHOOK_SECRET=${webhookSecret}`)
console.log('  EVOLUTION_API_URL=https://SUA-EVOLUTION-PUBLICA')
console.log('  APP_URL=https://menorapet.vercel.app')
console.log('')
