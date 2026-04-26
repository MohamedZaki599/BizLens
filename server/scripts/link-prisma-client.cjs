#!/usr/bin/env node
/**
 * Workspace fix-up for Prisma 5.x + npm workspaces.
 *
 * Prisma's generator checks that `@prisma/client` lives "near" the `prisma`
 * CLI (specifically inside the same `node_modules`). With npm workspaces it
 * gets hoisted to the repo root, so Prisma fails the check and refuses to
 * generate. We mirror it back into `server/node_modules/@prisma/client` via a
 * symlink so generate works without copying files.
 *
 * This script is idempotent and safe to run on every install.
 */

const fs = require('node:fs');
const path = require('node:path');

const here = path.resolve(__dirname, '..');
const localPrismaDir = path.join(here, 'node_modules', '@prisma');
const localTarget = path.join(localPrismaDir, 'client');

const candidates = [
  // npm workspaces typically hoist to the repo root.
  path.resolve(here, '..', 'node_modules', '@prisma', 'client'),
];

const tryLink = () => {
  // If the package already resolves locally as a regular install, do nothing.
  if (
    fs.existsSync(localTarget) &&
    fs.existsSync(path.join(localTarget, 'package.json')) &&
    !fs.lstatSync(localTarget).isSymbolicLink()
  ) {
    return;
  }

  const source = candidates.find((p) =>
    fs.existsSync(path.join(p, 'package.json')),
  );

  if (!source) {
    console.warn(
      '[link-prisma-client] @prisma/client not found at the workspace root; skipping link.',
    );
    return;
  }

  fs.mkdirSync(localPrismaDir, { recursive: true });

  // Remove an existing broken symlink before recreating it.
  try {
    const stat = fs.lstatSync(localTarget);
    if (stat.isSymbolicLink() || stat.isFile()) {
      fs.unlinkSync(localTarget);
    } else if (stat.isDirectory()) {
      fs.rmSync(localTarget, { recursive: true });
    }
  } catch (_err) {
    // path didn't exist → nothing to clean up.
  }

  fs.symlinkSync(source, localTarget, 'dir');
  console.log(`[link-prisma-client] linked ${source} → ${localTarget}`);
};

try {
  tryLink();
} catch (err) {
  console.warn('[link-prisma-client] failed:', err && err.message ? err.message : err);
}
