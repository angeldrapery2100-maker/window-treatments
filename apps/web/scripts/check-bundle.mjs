#!/usr/bin/env node
/**
 * A stand-in for the part of `next build` this sandbox cannot run.
 *
 *   node apps/web/scripts/check-bundle.mjs src/app/design/DesignClient.tsx ...
 *   node apps/web/scripts/check-bundle.mjs            # everything new-ish
 *
 * `tsc --noEmit` proves the types and nothing else. It resolves `@/` through
 * tsconfig paths, silently de-dupes ambiguous `export *`, and never opens a
 * JSON import — so a module that type-checks can still fail to bundle, and
 * that failure only shows up on Vercel. This runs esbuild over the same graph
 * with the same aliases, which catches unresolvable imports, JSON that isn't
 * there, and syntax the transpiler rejects.
 *
 * It is NOT a full build: it does not render React, so a component that throws
 * during prerender still gets through. tsc + vitest + this + a Vercel preview
 * is the honest ladder.
 */
import esbuild from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'

import { fileURLToPath } from 'node:url'
const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(path.relative(WEB, full))
  }
  return out
}

const entries = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [...walk(path.join(WEB, 'src/app')), ...walk(path.join(WEB, 'src/lib')), ...walk(path.join(WEB, 'src/components'))]
console.log(`checking ${entries.length} entry points`)
try {
  const r = await esbuild.build({
    entryPoints: entries,
    bundle: true,
    write: false,
    outdir: '/tmp/bundlecheck-out',
    format: 'esm',
    platform: 'node',
    target: 'es2022',
    jsx: 'preserve',
    logLevel: 'silent',
    logLimit: 0,
    absWorkingDir: WEB,
    external: ['react', 'react-dom', 'next', 'next/*', 'framer-motion', 'pg', '@aws-sdk/*'],
    loader: { '.json': 'json', '.js': 'jsx', '.jsx': 'jsx' },
    plugins: [{
      name: 'alias',
      setup(b) {
        b.onResolve({ filter: /^@\// }, (a) => {
          const base = path.join(WEB, 'src', a.path.slice(2))
          // Mirror tsconfig's resolution order, .jsx included — the repo has
          // at least one real .jsx module behind an @/ alias.
          for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '.json',
                             '/index.ts', '/index.tsx', '/index.js', '/index.jsx']) {
            if (fs.existsSync(base + ext) && fs.statSync(base + ext).isFile()) return { path: base + ext }
          }
          return { errors: [{ text: `cannot resolve ${a.path}` }] }
        })
        b.onResolve({ filter: /^@window-treatments\/shared/ }, (a) => {
          const sub = a.path.replace('@window-treatments/shared', '').replace(/^\//, '') || 'index'
          const p = path.join(WEB, '../../packages/shared/src', sub, 'index.ts')
          const flat = path.join(WEB, '../../packages/shared/src', sub + '.ts')
          if (fs.existsSync(p)) return { path: p }
          if (fs.existsSync(flat)) return { path: flat }
          return { errors: [{ text: `cannot resolve ${a.path}` }] }
        })
      },
    }],
  })
  const warns = r.warnings.filter((w) => /export|import|duplicate/i.test(w.text))
  if (warns.length) {
    console.log('⚠️ 打包告警(next build 里可能就是错误):')
    for (const w of warns) console.log('  ' + w.text + '  @ ' + (w.location?.file || '?'))
    process.exitCode = 2
  } else {
    console.log('✅ 打包通过,无 import/export 问题')
  }
} catch (e) {
  console.log('❌ 打包失败:')
  for (const m of e.errors || []) console.log('  ' + m.text + '  @ ' + (m.location?.file || '?') + ':' + (m.location?.line || ''))
  if (!e.errors) console.log(String(e).slice(0, 600))
  process.exitCode = 1
}
