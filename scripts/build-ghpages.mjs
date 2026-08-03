// scripts/build-ghpages.mjs
// Build estático para el preview en GitHub Pages. La ruta /api/contact
// requiere el adapter de Cloudflare (SSR) y no puede existir en un build
// estático (output: 'static') — se mueve fuera de src/pages/ solo durante
// este build puntual y se restaura siempre al final, incluso si el build
// falla, para no dejar el árbol de trabajo modificado.
import { existsSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const apiDir = path.join(rootDir, 'src/pages/api');
const apiBackupDir = path.join(rootDir, '.ghpages-api-backup');

function moveIfExists(from, to) {
  if (existsSync(from)) renameSync(from, to);
}

moveIfExists(apiDir, apiBackupDir);

try {
  const result = spawnSync('npx', ['astro', 'build'], {
    stdio: 'inherit',
    env: { ...process.env, BUILD_TARGET: 'gh-pages' },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
} finally {
  moveIfExists(apiBackupDir, apiDir);
}
