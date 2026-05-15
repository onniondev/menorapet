import pg from 'pg'

const { Pool } = pg

let pool: pg.Pool | null = null

const DIRECT_DB_HOST_HINT =
  'A conexão direta db.PROJECT_REF.supabase.co é só IPv6 e falha na Vercel. No Supabase: Settings → Database → Connection string → Session pooler (host aws-0-REGIAO.pooler.supabase.com, usuário postgres.PROJECT_REF).'

function assertReachableFromServerless(url: string) {
  try {
    const parsed = new URL(url.replace(/^postgresql:\/\//, 'postgres://'))
    if (/^db\.[a-z0-9]+\.supabase\.co$/i.test(parsed.hostname)) {
      throw new Error(DIRECT_DB_HOST_HINT)
    }
  } catch (e) {
    if (e instanceof Error && e.message === DIRECT_DB_HOST_HINT) throw e
  }
}

function normalizeDatabaseUrl(raw: string) {
  const url = raw.trim()
  assertReachableFromServerless(url)
  const parsed = new URL(url.replace(/^postgresql:\/\//, 'postgres://'))
  const params = new URLSearchParams(parsed.search)
  if (!params.has('sslmode')) params.set('sslmode', 'require')
  if (parsed.port === '6543' && !params.has('pgbouncer')) params.set('pgbouncer', 'true')
  parsed.search = params.toString() ? `?${params.toString()}` : ''
  return parsed.toString().replace(/^postgres:\/\//, 'postgresql://')
}

export function getPool(): pg.Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL não configurada')
    pool = new Pool({
      connectionString: normalizeDatabaseUrl(url),
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
    })
  }
  return pool
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params)
}
