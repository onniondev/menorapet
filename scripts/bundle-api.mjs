import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const outDir = 'api/_bundle'
fs.mkdirSync(outDir, { recursive: true })

const outfile = path.join(outDir, 'handlers.cjs')
const esbuildArgs = [
  '--yes',
  'esbuild@0.27.0',
  'server/api/handlers.ts',
  '--bundle',
  '--platform=node',
  '--target=node20',
  '--format=cjs',
  `--outfile=${outfile}`,
  '--packages=bundle',
  '--sourcemap',
]

const isWin = process.platform === 'win32'
const run = spawnSync(isWin ? 'npx.cmd' : 'npx', esbuildArgs, {
  stdio: 'inherit',
  shell: isWin,
})

if (run.error) {
  console.error(run.error)
  process.exit(1)
}
if (run.status !== 0) {
  process.exit(run.status ?? 1)
}

console.log('api bundle:', outfile)
