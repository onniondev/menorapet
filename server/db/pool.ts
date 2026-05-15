import pg from 'pg'

const { Pool } = pg

let pool: pg.Pool | null = null

function normalizeDatabaseUrl(raw: string) {
  const url = raw.trim()
  if (url.includes('sslmode=')) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}sslmode=require`
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
