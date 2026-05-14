import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Garante que .env / .env.local sejam lidos da pasta do projeto (não do cwd do terminal).
const projectDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  root: projectDir,
  envDir: projectDir,
  plugins: [react(), tailwindcss()],
})
