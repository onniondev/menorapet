import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const envFile = resolve('.env.evolution')
if (!existsSync(envFile)) {
  console.error('Execute primeiro: npm run evolution:setup')
  process.exit(1)
}

const compose = process.platform === 'win32' ? 'docker.exe' : 'docker'
const args = ['compose', '-f', 'docker-compose.evolution.yml', 'up', '-d']
const run = spawnSync(compose, args, { stdio: 'inherit', shell: false })

if (run.status !== 0) {
  console.error('')
  console.error('Falha ao subir Docker. Verifique se o Docker Desktop está instalado e em execução.')
  process.exit(run.status ?? 1)
}

console.log('')
console.log('Evolution API: http://localhost:8080')
console.log('Teste: curl http://localhost:8080')
console.log('')
console.log('Dev completo (app + API + Evolution na mesma máquina):')
console.log('  npm run dev:api    # terminal 1')
console.log('  npm run dev        # terminal 2')
console.log('')
