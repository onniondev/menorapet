import fs from 'node:fs'
import path from 'node:path'

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p)
    else if (p.endsWith('.ts')) {
      const c = fs.readFileSync(p, 'utf8')
      const n = c.replace(/\.ts(['"])/g, '$1')
      if (n !== c) fs.writeFileSync(p, n)
    }
  }
}

walk('api')
walk('server')
console.log('done')
