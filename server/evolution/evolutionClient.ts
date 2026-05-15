export type EvolutionResult<T = unknown> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number; raw?: unknown }

const TIMEOUT_MS = 30_000

export async function requestEvolution<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<EvolutionResult<T>> {
  const base = (process.env.EVOLUTION_API_URL ?? '').replace(/\/$/, '')
  const key = process.env.EVOLUTION_API_KEY ?? ''
  if (!base || !key) {
    return { ok: false, error: 'EVOLUTION_API_URL ou EVOLUTION_API_KEY não configurados', status: 503 }
  }

  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const raw = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err =
        (raw as { message?: string; error?: string })?.message ??
        (raw as { error?: string })?.error ??
        JSON.stringify(raw)
      console.error('[evolution]', method, path, res.status, err)
      return { ok: false, error: err, status: res.status, raw }
    }
    return { ok: true, data: raw as T, status: res.status }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[evolution]', method, path, msg)
    return { ok: false, error: msg, status: 0 }
  }
}

export function instanceNameForClinic(clinicId: string) {
  return `petvia_${clinicId.replace(/-/g, '')}`
}

export function appWebhookUrl() {
  const app = (
    process.env.APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  ).replace(/\/$/, '')
  return app ? `${app}/api/webhooks/evolution` : ''
}
