/**
 * Executa um arquivo .sql no Postgres (ex.: migração remota).
 * Uso (PowerShell):
 *   $env:DATABASE_URL = "postgresql://postgres:SENHA@db.PROJETO.supabase.co:5432/postgres"
 *   node scripts/run-sql-file.mjs supabase/migrations/20260214120000_petvia_foundation.sql
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import pg from 'pg'

const url = process.env.DATABASE_URL
const file = process.argv[2]
if (!url) {
  console.error('Defina DATABASE_URL (connection string do Postgres, senha URL-encoded).')
  process.exit(1)
}
if (!file) {
  console.error('Uso: node scripts/run-sql-file.mjs <caminho-do.sql>')
  process.exit(1)
}

const sql = readFileSync(resolve(file), 'utf8')
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
try {
  await client.connect()
  await client.query(sql)
  console.log('SQL aplicado com sucesso.')
} catch (e) {
  console.error(e)
  process.exit(1)
} finally {
  await client.end().catch(() => {})
}
