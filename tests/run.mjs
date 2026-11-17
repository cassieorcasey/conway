// Menjalankan tes TypeScript tanpa dependensi tambahan: esbuild (bawaan Vite) membundel tiap
// tests/*.test.ts ke berkas sementara, lalu node:test menjalankannya.
import { build } from 'esbuild';
import { readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// fileURLToPath, bukan .pathname: di Windows .pathname menghasilkan "/C:/..." yang tidak valid.
const dir = fileURLToPath(new URL('.', import.meta.url));
const out = mkdtempSync(join(tmpdir(), 'waypoint-tests-'));
const files = readdirSync(dir).filter(f => f.endsWith('.test.ts'));
await build({
  entryPoints: files.map(f => join(dir, f)), outdir: out, bundle: true, platform: 'node', format: 'esm',
  outExtension: { '.js': '.mjs' }, logLevel: 'error',
  loader: { '.md': 'text' },
  plugins: [{ name: 'raw', setup(b) { b.onResolve({ filter: /\?raw$/ }, a => ({ path: join(a.resolveDir, a.path.replace('?raw', '')) })); } }],
});
const r = spawnSync(process.execPath, ['--test', ...files.map(f => join(out, f.replace('.ts', '.mjs')))], { stdio: 'inherit' });
rmSync(out, { recursive: true, force: true });
process.exit(r.status ?? 1);
