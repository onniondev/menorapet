/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Quando "1" e sem Supabase, libera /marketing-ia com dados mock (somente desenvolvimento). */
  readonly VITE_MARKETING_IA_DEMO?: string
  /** Base URL da API (Vercel). Vazio = mesma origem. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
